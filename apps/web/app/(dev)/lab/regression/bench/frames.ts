import { mean, percentile } from "./stats";

export const LONG_FRAME_MS = 20;

export interface FrameRecorder {
  /** Stops the rAF loop and returns every frame timestamp seen. */
  stop: () => number[];
}

/** Records `requestAnimationFrame` timestamps until stopped. */
export function startFrameRecorder(): FrameRecorder {
  const stamps: number[] = [];
  let id = 0;
  let running = true;
  const loop = (time: number) => {
    if (!running) {
      return;
    }
    stamps.push(time);
    id = requestAnimationFrame(loop);
  };
  id = requestAnimationFrame(loop);
  return {
    stop: () => {
      running = false;
      cancelAnimationFrame(id);
      return stamps;
    },
  };
}

export interface FrameStats {
  frames: number;
  meanFrameMs: number;
  p95FrameMs: number;
  maxFrameMs: number;
  longFrames: number;
}

/**
 * Frame deltas between `startAt` (the mount request) and `endAt` (the last
 * DOM mutation). The first delta runs from `startAt` to the first frame, so
 * it includes the mount render + commit.
 */
export function frameStats(
  stamps: number[],
  startAt: number,
  endAt: number
): FrameStats {
  const inWindow = stamps.filter((t) => t >= startAt);
  // Keep the frame that painted the last mutation.
  const lastIndex = inWindow.findIndex((t) => t >= endAt);
  const frames = lastIndex === -1 ? inWindow : inWindow.slice(0, lastIndex + 1);
  const deltas: number[] = [];
  let previous = startAt;
  for (const t of frames) {
    deltas.push(t - previous);
    previous = t;
  }
  return {
    frames: deltas.length,
    meanFrameMs: mean(deltas),
    p95FrameMs: percentile(deltas, 0.95),
    maxFrameMs: deltas.length > 0 ? Math.max(...deltas) : 0,
    longFrames: deltas.filter((d) => d > LONG_FRAME_MS).length,
  };
}
