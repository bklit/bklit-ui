import { studioAnimationDurationMs } from "./chart-animation";
import type { StudioUrlState } from "./studio-parsers";

/** Target fps for stream capture (compositor-limited, typically 60 on most displays). */
export const STUDIO_RECORDING_FPS = 60;
export const STUDIO_RECORDING_PAD_START_MS = 500;
export const STUDIO_RECORDING_PAD_END_MS = 3000;
/** Pixel ratio for DOM snapshots (2× frame size for sharper output). */
export const STUDIO_RECORDING_CAPTURE_SCALE = 2;
/** Dot-grid padding around the chart frame inside the crop target. */
export const STUDIO_RECORDING_CAPTURE_INSET_PX = 64;

export const STUDIO_RECORDING_INTERACTION_OPTIONS = [
  { value: 0, label: "None" },
  { value: 5000, label: "5 seconds" },
  { value: 10_000, label: "10 seconds" },
] as const;

export type StudioRecordingInteractionMs =
  (typeof STUDIO_RECORDING_INTERACTION_OPTIONS)[number]["value"];

export const STUDIO_RECORDING_FORMAT_OPTIONS = [
  { value: "webm" as const, label: "WebM" },
  { value: "mp4" as const, label: "MP4" },
] as const;

export type StudioRecordingFormat =
  (typeof STUDIO_RECORDING_FORMAT_OPTIONS)[number]["value"];

export const STUDIO_RECORDING_ASPECT_OPTIONS = [
  { value: "frame" as const, label: "Current frame" },
  { value: "16:9" as const, label: "16∶9" },
] as const;

export type StudioRecordingAspect =
  (typeof STUDIO_RECORDING_ASPECT_OPTIONS)[number]["value"];

export interface StudioRecordingOptions {
  /** Extra time after the enter animation for manual chart interaction. */
  interactionMs?: number;
}

const MIN_RECORDING_WIDTH = 280;
const MIN_RECORDING_HEIGHT = 158;

/** Frame size used for capture (and 16∶9 layout when selected). */
export function getRecordingFrameDimensions(
  frameWidth: number,
  frameHeight: number,
  aspect: StudioRecordingAspect
): { width: number; height: number } {
  if (aspect === "frame") {
    return {
      width: Math.max(MIN_RECORDING_WIDTH, frameWidth),
      height: Math.max(MIN_RECORDING_HEIGHT, frameHeight),
    };
  }

  const width = Math.max(MIN_RECORDING_WIDTH, frameWidth);
  const height = Math.max(MIN_RECORDING_HEIGHT, Math.round((width * 9) / 16));
  return { width, height };
}

/** Inner chart frame size plus padded capture bounds for Region Capture / snapshots. */
export function getRecordingCaptureDimensions(
  frameWidth: number,
  frameHeight: number,
  aspect: StudioRecordingAspect
): {
  frameWidth: number;
  frameHeight: number;
  captureWidth: number;
  captureHeight: number;
} {
  const frame = getRecordingFrameDimensions(frameWidth, frameHeight, aspect);
  const inset = STUDIO_RECORDING_CAPTURE_INSET_PX * 2;
  return {
    frameWidth: frame.width,
    frameHeight: frame.height,
    captureWidth: frame.width + inset,
    captureHeight: frame.height + inset,
  };
}

export interface StudioRecordingMarkers {
  start: number;
  replay: number;
  animationEnd: number;
  interactionEnd: number;
  end: number;
}

export function getStudioRecordingMarkers(
  timeline: StudioRecordingTimeline
): StudioRecordingMarkers {
  const total = timeline.totalMs;
  if (total <= 0) {
    return { start: 0, replay: 0, animationEnd: 0, interactionEnd: 0, end: 1 };
  }
  return {
    start: 0,
    replay: timeline.replayAtMs / total,
    animationEnd: timeline.interactionStartMs / total,
    interactionEnd: timeline.interactionEndMs / total,
    end: 1,
  };
}

const RULER_TICK_INTERVAL_MS = 2500;

/** Evenly spaced time ruler (0s, 2.5s, 5s, …) for the keyframe timeline header. */
export function getStudioRecordingRulerTicks(
  timeline: StudioRecordingTimeline
): { position: number; label: string }[] {
  const total = timeline.totalMs;
  if (total <= 0) {
    return [{ position: 0, label: "0s" }];
  }

  const ticks: { position: number; label: string }[] = [];
  for (let ms = 0; ms < total; ms += RULER_TICK_INTERVAL_MS) {
    const seconds = ms / 1000;
    ticks.push({
      position: ms / total,
      label: seconds === 0 ? "0s" : `${seconds}s`,
    });
  }

  const endSeconds = total / 1000;
  const endLabel =
    endSeconds % (RULER_TICK_INTERVAL_MS / 1000) === 0
      ? `${endSeconds}s`
      : `${endSeconds.toFixed(1)}s`;
  const last = ticks.at(-1);
  if (!last || last.position < 1) {
    ticks.push({ position: 1, label: endLabel });
  }

  return ticks;
}

export function getStudioRecordingCaptureScale(): number {
  return STUDIO_RECORDING_CAPTURE_SCALE;
}

export function getStudioRecordingOutputSize(
  frameWidth: number,
  frameHeight: number
): { width: number; height: number; scale: number } {
  const scale = getStudioRecordingCaptureScale();
  return {
    width: Math.round(frameWidth * scale),
    height: Math.round(frameHeight * scale),
    scale,
  };
}

/** Middle segment: motion panel duration from URL state (ms). */
export function getStudioRecordingAnimationDurationMs(
  state: StudioUrlState
): number {
  return studioAnimationDurationMs(state);
}

export type StudioRecordingSegment =
  | "intro"
  | "animation"
  | "interaction"
  | "outro";

export interface StudioRecordingTimeline {
  fps: number;
  padStartMs: number;
  padEndMs: number;
  animationMs: number;
  interactionMs: number;
  interactionStartMs: number;
  interactionEndMs: number;
  totalMs: number;
  frameCount: number;
  replayAtMs: number;
  replayAtFrame: number;
  animationFrameCount: number;
  padStartFrameCount: number;
  padEndFrameCount: number;
  interactionFrameCount: number;
}

export function getStudioRecordingTimeline(
  state: StudioUrlState,
  options: StudioRecordingOptions = {}
): StudioRecordingTimeline {
  const fps = STUDIO_RECORDING_FPS;
  const padStartMs = STUDIO_RECORDING_PAD_START_MS;
  const padEndMs = STUDIO_RECORDING_PAD_END_MS;
  const animationMs = getStudioRecordingAnimationDurationMs(state);
  const interactionMs = options.interactionMs ?? 0;
  const interactionStartMs = padStartMs + animationMs;
  const interactionEndMs = interactionStartMs + interactionMs;
  const totalMs = interactionEndMs + padEndMs;
  const frameCount = Math.max(1, Math.round((totalMs / 1000) * fps));
  const padStartFrameCount = Math.round((padStartMs / 1000) * fps);
  const animationFrameCount = Math.round((animationMs / 1000) * fps);
  const interactionFrameCount = Math.round((interactionMs / 1000) * fps);
  const padEndFrameCount = Math.max(
    0,
    frameCount -
      padStartFrameCount -
      animationFrameCount -
      interactionFrameCount
  );

  return {
    fps,
    padStartMs,
    padEndMs,
    animationMs,
    interactionMs,
    interactionStartMs,
    interactionEndMs,
    totalMs,
    frameCount,
    replayAtMs: padStartMs,
    replayAtFrame: padStartFrameCount,
    animationFrameCount,
    padStartFrameCount,
    padEndFrameCount,
    interactionFrameCount,
  };
}

export function getStudioRecordingSegment(
  elapsedMs: number,
  timeline: StudioRecordingTimeline
): StudioRecordingSegment {
  if (elapsedMs < timeline.padStartMs) {
    return "intro";
  }
  if (elapsedMs < timeline.interactionStartMs) {
    return "animation";
  }
  if (elapsedMs < timeline.interactionEndMs) {
    return "interaction";
  }
  return "outro";
}

export interface TimestampedFrame {
  blob: Blob;
  timestampMs: number;
}

export function framesForNativeTimeline(
  frames: TimestampedFrame[],
  timeline: StudioRecordingTimeline
): { blobs: Blob[]; fps: number; durationInFrames: number } {
  if (frames.length === 0) {
    return { blobs: [], fps: timeline.fps, durationInFrames: 0 };
  }

  const sorted = [...frames].sort((a, b) => a.timestampMs - b.timestampMs);
  const durationSec = timeline.totalMs / 1000;
  const nativeFps = Math.min(
    timeline.fps,
    Math.max(12, Math.round(sorted.length / durationSec))
  );

  return {
    blobs: sorted.map((f) => f.blob),
    fps: nativeFps,
    durationInFrames: sorted.length,
  };
}
