import { domToCanvas } from "modern-screenshot";
import type {
  StudioRecordingTimeline,
  TimestampedFrame,
} from "./studio-recording";
import { getStudioRecordingCaptureScale } from "./studio-recording";
import {
  createRecordingPauseState,
  getRecordingElapsedMs,
} from "./studio-recording-clock";
import { readElementBackgroundColor } from "./studio-recording-color";

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }
    const timer = window.setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      window.clearTimeout(timer);
      reject(new DOMException("Aborted", "AbortError"));
    };
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

function canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error("Failed to encode capture frame"));
      }
    }, "image/png");
  });
}

async function captureElementFrame(
  element: HTMLElement,
  width: number,
  height: number
): Promise<Blob> {
  const canvas = await domToCanvas(element, {
    width,
    height,
    scale: getStudioRecordingCaptureScale(),
    backgroundColor: readElementBackgroundColor(element),
  });
  return canvasToPngBlob(canvas);
}

export interface CaptureChartFramesOptions {
  element: HTMLElement;
  width: number;
  height: number;
  timeline: StudioRecordingTimeline;
  onReplay: () => void;
  onTimelineTick?: (elapsedMs: number) => void;
  signal?: AbortSignal;
  onProgress?: (progress: number) => void;
  isPaused?: () => boolean;
  onCaptureReady?: () => void;
}

/**
 * Fallback: real-time DOM snapshots when Region Capture is unavailable.
 * Captures as fast as possible; encode uses actual sample count (no 90fps
 * duplication) so motion is not artificially stepped.
 */
export async function captureChartFrames(
  options: CaptureChartFramesOptions
): Promise<TimestampedFrame[]> {
  const {
    element,
    width,
    height,
    timeline,
    onReplay,
    onTimelineTick,
    signal,
    onProgress,
    isPaused = () => false,
    onCaptureReady,
  } = options;

  if (signal?.aborted) {
    throw new DOMException("Aborted", "AbortError");
  }

  const { totalMs, replayAtMs } = timeline;
  const frames: TimestampedFrame[] = [];
  const startTime = performance.now();
  const pauseState = createRecordingPauseState();
  let capturing = false;
  let replayFired = false;
  onCaptureReady?.();

  while (true) {
    if (signal?.aborted) {
      throw new DOMException("Aborted", "AbortError");
    }

    const elapsed = getRecordingElapsedMs(startTime, isPaused, pauseState);
    if (elapsed >= totalMs) {
      break;
    }

    onTimelineTick?.(elapsed);

    if (!replayFired && elapsed >= replayAtMs) {
      replayFired = true;
      onReplay();
    }

    if (!isPaused() && capturing === false) {
      capturing = true;
      try {
        const blob = await captureElementFrame(element, width, height);
        if (signal?.aborted) {
          throw new DOMException("Aborted", "AbortError");
        }
        frames.push({ blob, timestampMs: elapsed });
        onProgress?.(Math.min(1, elapsed / totalMs));
      } finally {
        capturing = false;
      }
    }

    await sleep(4, signal);
  }

  onProgress?.(1);
  return frames;
}
