import type {
  StudioRecordingFormat,
  StudioRecordingTimeline,
} from "./studio-recording";
import {
  createRecordingPauseState,
  getRecordingElapsedMs,
} from "./studio-recording-clock";
import { transcodeRecordingToMp4 } from "./transcode-recording-to-mp4";

type CropTargetHandle = object;

interface CropTargetConstructor {
  fromElement(element: Element): Promise<CropTargetHandle>;
}

interface CroppableMediaStreamTrack extends MediaStreamTrack {
  cropTo?(target: CropTargetHandle): Promise<void>;
}

export function canRecordChartStream(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  const CropTargetApi = (
    window as Window & { CropTarget?: CropTargetConstructor }
  ).CropTarget;
  return (
    typeof CropTargetApi?.fromElement === "function" &&
    typeof navigator.mediaDevices?.getDisplayMedia === "function" &&
    typeof MediaRecorder !== "undefined"
  );
}

/** WebM only — Chrome MP4 MediaRecorder freezes tab/region capture; MP4 comes from transcode. */
function pickRecorderMimeType(): string {
  const candidates = [
    "video/webm;codecs=vp9",
    "video/webm;codecs=vp8",
    "video/webm",
  ];
  return candidates.find((type) => MediaRecorder.isTypeSupported(type)) ?? "";
}

function downloadRecordingBlob(
  blob: Blob,
  chartSlug: string,
  extension: string
) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  anchor.download = `bklit-studio-${chartSlug}-${timestamp}.${extension}`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export interface RecordChartStreamOptions {
  element: HTMLElement;
  timeline: StudioRecordingTimeline;
  format: StudioRecordingFormat;
  chartSlug: string;
  onReplay: () => void;
  onTimelineTick?: (elapsedMs: number) => void;
  signal?: AbortSignal;
  onProgress?: (progress: number) => void;
  isPaused?: () => boolean;
  /** Called once the display stream is cropped and capture is about to begin. */
  onCaptureReady?: () => void;
  /** Called when WebM capture finished and MP4 transcode begins. */
  onEncodingStart?: () => void;
}

/**
 * Records the chart via the compositor (Region Capture + MediaRecorder) at
 * display refresh rate — no per-frame DOM screenshots, so motion stays smooth.
 * Requires Chromium with CropTarget (Chrome / Edge).
 */
export async function recordChartStream(
  options: RecordChartStreamOptions
): Promise<void> {
  const {
    element,
    timeline,
    format,
    chartSlug,
    onReplay,
    onTimelineTick,
    signal,
    onProgress,
    isPaused = () => false,
    onCaptureReady,
    onEncodingStart,
  } = options;

  if (!canRecordChartStream()) {
    throw new Error(
      "Smooth recording needs Chrome or Edge with Region Capture support."
    );
  }

  const mimeType = pickRecorderMimeType();
  if (!mimeType) {
    throw new Error("No supported MediaRecorder video format in this browser.");
  }

  const CropTargetApi = (
    window as unknown as Window & { CropTarget: CropTargetConstructor }
  ).CropTarget;
  const cropTarget = await CropTargetApi.fromElement(element);

  const stream = await navigator.mediaDevices.getDisplayMedia({
    video: {
      displaySurface: "browser",
      frameRate: { ideal: timeline.fps, max: timeline.fps },
    },
    audio: false,
    preferCurrentTab: true,
    selfBrowserSurface: "include",
  } as DisplayMediaStreamOptions);

  const [track] = stream.getVideoTracks();
  const croppable = track as CroppableMediaStreamTrack | undefined;
  if (!croppable?.cropTo) {
    for (const t of stream.getTracks()) {
      t.stop();
    }
    throw new Error("Video track does not support Region Capture cropping.");
  }

  await croppable.cropTo(cropTarget);
  onCaptureReady?.();

  const recorder = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: 16_000_000,
  });

  const chunks: Blob[] = [];
  let stopped = false;
  let aborted = false;

  let progressTimer = 0;
  const pauseState = createRecordingPauseState();
  let replayFired = false;
  let wasPaused = false;

  const stopAll = () => {
    if (stopped) {
      return;
    }
    stopped = true;
    window.clearInterval(progressTimer);
    if (recorder.state !== "inactive") {
      recorder.stop();
    }
    for (const t of stream.getTracks()) {
      t.stop();
    }
  };

  const recordingPromise = new Promise<Blob>((resolve, reject) => {
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };
    recorder.onerror = () => {
      reject(new Error("MediaRecorder failed during capture."));
    };
    recorder.onstop = () => {
      resolve(new Blob(chunks, { type: mimeType }));
    };
  });

  const startTime = performance.now();
  progressTimer = window.setInterval(() => {
    if (aborted || stopped) {
      return;
    }

    const paused = isPaused();
    if (paused && !wasPaused && recorder.state === "recording") {
      recorder.pause();
    } else if (!paused && wasPaused && recorder.state === "paused") {
      recorder.resume();
    }
    wasPaused = paused;

    const elapsed = getRecordingElapsedMs(startTime, isPaused, pauseState);
    onTimelineTick?.(elapsed);
    onProgress?.(Math.min(1, elapsed / timeline.totalMs));

    if (!replayFired && elapsed >= timeline.replayAtMs) {
      replayFired = true;
      onReplay();
    }

    if (elapsed >= timeline.totalMs) {
      stopAll();
    }
  }, 16);

  const abortListener = () => {
    aborted = true;
    stopAll();
  };
  signal?.addEventListener("abort", abortListener, { once: true });

  recorder.start(100);

  try {
    const blob = await recordingPromise;
    if (aborted || signal?.aborted) {
      throw new DOMException("Aborted", "AbortError");
    }
    if (blob.size === 0) {
      throw new Error("Recording produced no video data.");
    }

    if (format === "webm") {
      downloadRecordingBlob(blob, chartSlug, "webm");
      onProgress?.(1);
      return;
    }

    onEncodingStart?.();
    const mp4 = await transcodeRecordingToMp4({
      blob,
      signal,
      onProgress: (encodeProgress) => {
        onProgress?.(0.85 + encodeProgress * 0.15);
      },
    });

    if (aborted || signal?.aborted) {
      throw new DOMException("Aborted", "AbortError");
    }

    downloadRecordingBlob(mp4, chartSlug, "mp4");
    onProgress?.(1);
  } catch (caught) {
    if (caught instanceof DOMException && caught.name === "NotAllowedError") {
      throw new Error(
        "Recording permission denied. Allow tab capture when prompted."
      );
    }
    throw caught;
  } finally {
    signal?.removeEventListener("abort", abortListener);
    stopAll();
  }
}
