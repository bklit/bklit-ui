import { renderMediaOnWeb } from "@remotion/web-renderer";
import type React from "react";
import {
  StudioCaptureComposition,
  type StudioCaptureCompositionProps,
} from "@/components/studio-capture-composition";
import { downloadBlob } from "./download-blob";
import {
  framesForNativeTimeline,
  type StudioRecordingFormat,
  type StudioRecordingTimeline,
  type TimestampedFrame,
} from "./studio-recording";

export interface EncodeStudioRecordingOptions {
  frames: TimestampedFrame[];
  timeline: StudioRecordingTimeline;
  format: StudioRecordingFormat;
  width: number;
  height: number;
  chartSlug: string;
  onProgress?: (progress: number) => void;
  signal?: AbortSignal;
}

/** Fallback encode: one video frame per DOM snapshot at native capture rate. */
export async function encodeStudioRecording(
  options: EncodeStudioRecordingOptions
): Promise<void> {
  const {
    frames,
    timeline,
    format,
    width,
    height,
    chartSlug,
    onProgress,
    signal,
  } = options;

  if (frames.length === 0) {
    throw new Error("No frames captured");
  }

  const { blobs, fps, durationInFrames } = framesForNativeTimeline(
    frames,
    timeline
  );
  const frameUrls = blobs.map((blob) => URL.createObjectURL(blob));

  try {
    if (signal?.aborted) {
      throw new DOMException("Aborted", "AbortError");
    }

    const inputProps: StudioCaptureCompositionProps = {
      frames: frameUrls,
      width,
      height,
    };

    const { getBlob } = await renderMediaOnWeb({
      composition: {
        id: "StudioCapture",
        component: StudioCaptureComposition as unknown as React.FC<
          Record<string, unknown>
        >,
        durationInFrames,
        fps,
        width,
        height,
        defaultProps: inputProps as unknown as Record<string, unknown>,
      },
      inputProps: inputProps as unknown as Record<string, unknown>,
      container: format === "webm" ? "webm" : "mp4",
      videoCodec: format === "webm" ? "vp9" : "h264",
      muted: true,
      videoBitrate: "very-high",
      hardwareAcceleration:
        format === "webm" ? "prefer-hardware" : "prefer-software",
      keyframeIntervalInSeconds: 2,
      signal,
      onProgress: ({ progress }: { progress: number }) => {
        onProgress?.(progress);
      },
    });

    const blob = await getBlob();
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const extension = format === "webm" ? "webm" : "mp4";
    downloadBlob(blob, `bklit-studio-${chartSlug}-${timestamp}.${extension}`);
  } finally {
    for (const url of frameUrls) {
      URL.revokeObjectURL(url);
    }
  }
}
