import { cubicBezier, type Transition } from "motion/react";
import {
  clipRevealTransition,
  DEFAULT_ANIMATION_DURATION_MS,
  DEFAULT_CHART_ENTER_TRANSITION,
} from "../animation";
import type { HeatmapColumn } from "./heatmap-context";
import { getHeatmapContributionLevel } from "./heatmap-utils";

/**
 * Default column-wave sweep (ms) — the line chart clip-reveal duration, so the
 * wavefront crosses the grid in the same rhythm.
 */
export const HEATMAP_DEFAULT_ENTER_DURATION_MS = DEFAULT_ANIMATION_DURATION_MS;

/** Default enter transition (the wave sweep) — the line chart reveal. */
export const HEATMAP_DEFAULT_ENTER_TRANSITION: Transition =
  DEFAULT_CHART_ENTER_TRANSITION;

/** Per-cell enter duration (ms) — long enough to give the wavefront a soft body. */
export const HEATMAP_ENTER_FADE_MS = 450;

/** Per-cell enter ease (strong ease-out, no overshoot). */
export const HEATMAP_ENTER_FADE_EASE = [0.22, 1, 0.36, 1] as const;

/** Extra delay per row (ms) — leans the wavefront into a slight diagonal. */
export const HEATMAP_WAVE_ROW_LEAN_MS = 12;

/** Chart opacity while `status="loading"`. */
export const HEATMAP_LOADING_CHART_OPACITY = 1;

/** Default max per-cell opacity during loading shimmer. */
export const HEATMAP_DEFAULT_LOADING_CELL_MAX_OPACITY = 0.85;

/** Default share of cells that participate in loading shimmer (0–1). */
export const HEATMAP_DEFAULT_LOADING_CELL_RANDOMNESS = 1;

/** Opacity for loading cells that do not participate in shimmer. */
export const HEATMAP_LOADING_BASE_CELL_OPACITY = 0.2;

/** Duration for ready → loading cell conceal before shimmer resumes (ms). */
export const HEATMAP_LOADING_CONCEAL_MS = 450;

function seededRandom(seed: number): () => number {
  let state = seed % 2_147_483_647;
  if (state <= 0) {
    state += 2_147_483_646;
  }
  return () => {
    state = (state * 16_807) % 2_147_483_647;
    return (state - 1) / 2_147_483_646;
  };
}

export function heatmapCellSeed(column: number, row: number): number {
  return column * 1009 + row * 9176;
}

export interface HeatmapLevelRange {
  min: number;
  max: number;
}

/** Min/max contribution levels present in the dataset. */
export function computeHeatmapLevelRange(
  data: HeatmapColumn[]
): HeatmapLevelRange {
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;

  for (const column of data) {
    for (const bin of column.bins) {
      const level = getHeatmapContributionLevel(bin.count);
      if (level < min) {
        min = level;
      }
      if (level > max) {
        max = level;
      }
    }
  }

  if (!(Number.isFinite(min) && Number.isFinite(max))) {
    return { min: 0, max: 4 };
  }

  return { min, max };
}

export interface HeatmapWaveTiming {
  /** Per-cell fade duration (ms). */
  fadeMs: number;
  /** CSS easing for the per-cell fade. */
  fadeEasing: string;
  /** Delay of the last column relative to the first (ms). */
  sweepMs: number;
  /** Column position (0–1) → share of the sweep elapsed before it starts. */
  sweepEase: (t: number) => number;
  /** Extra delay per row (ms). */
  rowLeanMs: number;
  /** Number of columns the sweep spans. */
  columnCount: number;
  /** Time until the last cell finishes fading in (ms). */
  totalMs: number;
}

type CubicBezierTuple = [number, number, number, number];

function isBezierTuple(ease: unknown): ease is CubicBezierTuple {
  return (
    Array.isArray(ease) &&
    ease.length === 4 &&
    ease.every((n) => typeof n === "number")
  );
}

/**
 * Column delay curve for a reveal ease. The line clip reveal moves its edge
 * along `ease(time)`; for the wavefront to cross columns in the same rhythm,
 * column `c` must start when `ease(time) = c`, i.e. at `ease⁻¹(c)`. The
 * inverse of cubic-bezier(x1, y1, x2, y2) is cubic-bezier(y1, x1, y2, x2).
 */
function inverseBezier([x1, y1, x2, y2]: CubicBezierTuple) {
  return cubicBezier(y1, x1, y2, x2);
}

const defaultSweepEase = inverseBezier(
  DEFAULT_CHART_ENTER_TRANSITION.ease as CubicBezierTuple
);
const sweepEaseCache = new Map<string, (t: number) => number>();

function resolveSweepEase(ease: unknown): (t: number) => number {
  if (ease === "linear") {
    return (t) => t;
  }
  if (!isBezierTuple(ease)) {
    return defaultSweepEase;
  }
  const key = ease.join(",");
  let fn = sweepEaseCache.get(key);
  if (!fn) {
    fn = inverseBezier(ease);
    sweepEaseCache.set(key, fn);
  }
  return fn;
}

/**
 * Column-wave timing, mirroring the line chart clip reveal: the sweep uses
 * {@link clipRevealTransition}(`enterTransition`) for duration and ease
 * (`animationDurationMs` when no transition is passed), scaled by
 * `enterStaggerScale`. Each cell then settles in over a soft ease-out.
 */
export function resolveHeatmapWaveTiming({
  animationDurationMs,
  enterTransition,
  enterStaggerScale,
  columnCount,
  rowCount,
}: {
  animationDurationMs: number;
  enterTransition: Transition | undefined;
  enterStaggerScale: number;
  columnCount: number;
  rowCount: number;
}): HeatmapWaveTiming {
  const sweep = clipRevealTransition(enterTransition);
  const durationSec =
    enterTransition && typeof sweep.duration === "number"
      ? sweep.duration
      : animationDurationMs / 1000;
  const scale = Math.max(0, enterStaggerScale);
  const sweepMs = Math.max(0, durationSec * 1000) * scale;
  const rowLeanMs = HEATMAP_WAVE_ROW_LEAN_MS * scale;
  const fadeMs = HEATMAP_ENTER_FADE_MS;
  return {
    fadeMs,
    fadeEasing: `cubic-bezier(${HEATMAP_ENTER_FADE_EASE.join(", ")})`,
    sweepMs,
    sweepEase: resolveSweepEase(sweep.ease),
    rowLeanMs,
    columnCount,
    totalMs: sweepMs + rowLeanMs * Math.max(0, rowCount - 1) + fadeMs,
  };
}

/** Enter delay (ms) for a cell: eased column position plus a small row lean. */
export function heatmapWaveDelayMs(
  column: number,
  row: number,
  timing: Pick<
    HeatmapWaveTiming,
    "sweepMs" | "sweepEase" | "rowLeanMs" | "columnCount"
  >
): number {
  const t =
    timing.columnCount > 1
      ? Math.min(1, Math.max(0, column / (timing.columnCount - 1)))
      : 0;
  return timing.sweepEase(t) * timing.sweepMs + row * timing.rowLeanMs;
}

/** Whether a cell participates in loading shimmer for a given randomness (0–1). */
export function heatmapLoadingCellParticipates(
  column: number,
  row: number,
  randomness: number
): boolean {
  if (randomness >= 1) {
    return true;
  }
  if (randomness <= 0) {
    return false;
  }

  const random = seededRandom(heatmapCellSeed(column, row) + 73_133);
  return random() < randomness;
}
