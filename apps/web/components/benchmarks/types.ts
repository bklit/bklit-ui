import type { ComponentType } from "react";

/** Chart types benchmarked across every library. */
export type BenchChartKind = "line" | "area" | "bar" | "scatter";

export type BenchLibraryId = "bklit" | "recharts" | "tanstack";

/**
 * One generated row. Every library reads the same rows:
 * - `date` is the x value for line / area / scatter (time axis)
 * - `t` is the same instant as epoch ms, for libraries keyed on numbers
 * - `label` is the x category for bar
 * - `s0`…`s{n-1}` are the numeric series values
 */
export interface BenchRow {
  date: Date;
  t: number;
  label: string;
  [series: `s${number}`]: number;
}

export interface BenchDataset {
  kind: BenchChartKind;
  size: number;
  seriesCount: number;
  /** Seed used to generate it, so runs are reproducible. */
  seed: number;
  rows: BenchRow[];
}

/** Props every adapter chart receives. Fixed pixel size, no ParentSize race. */
export interface BenchChartProps {
  data: BenchRow[];
  seriesCount: number;
  width: number;
  height: number;
  /**
   * `true`: the library's default enter/update animation is on (what users see).
   * `false`: animation disabled where the library allows it.
   */
  animate: boolean;
}

export interface BenchLibraryAdapter {
  id: BenchLibraryId;
  name: string;
  /** Exact installed version, shown on the page. */
  version: string;
  charts: Partial<Record<BenchChartKind, ComponentType<BenchChartProps>>>;
  /**
   * Default initial (enter) animation duration in ms when `animate` is true,
   * or `null` when the library has no enter animation by default.
   * Referenced on the page; never part of a performance score.
   */
  initialAnimationMs: number | null;
  /** Per-kind overrides when the default differs by chart type. */
  initialAnimationMsByKind?: Partial<Record<BenchChartKind, number | null>>;
  /** Short, factual notes (e.g. "SVG renderer, no default motion"). */
  notes?: string;
}

/** Default enter animation for one chart kind (reference only). */
export function resolveInitialAnimationMs(
  adapter: BenchLibraryAdapter,
  kind: BenchChartKind
): number | null {
  const byKind = adapter.initialAnimationMsByKind?.[kind];
  return byKind === undefined ? adapter.initialAnimationMs : byKind;
}

/** Medians (ms) over the measured iterations; warm-up runs are discarded. */
export interface BenchMetrics {
  /**
   * `render()` call → first painted frame that shows the chart's marks (a
   * library that sizes itself asynchronously pays for those frames).
   * Excludes enter-animation time.
   */
  mountMs: number;
  /** New same-size dataset → first painted frame. Excludes update-animation time. */
  updateMs: number;
  /**
   * Per pointer move across the plot: dispatch → the painted frame that shows
   * the hover result (one frame later when a library defers it to rAF).
   */
  hoverMs: number;
  /** Elements in the chart container after mount. */
  domNodes: number;
}

/**
 * Enter-animation reference, measured with `animate: true`. Shown next to the
 * metrics, never folded into them.
 */
export interface BenchAnimationReference {
  /** Library default from the adapter (`initialAnimationMs`). */
  configuredMs: number | null;
  /** First paint → last frame with DOM/attribute changes (MutationObserver). */
  observedMs: number | null;
  /** Mean frame interval while the enter animation ran. */
  avgFrameMs: number | null;
  /** Frames over 1.5× the display's frame budget during the animation. */
  longFrames: number | null;
}

export interface BenchResult {
  library: BenchLibraryId;
  kind: BenchChartKind;
  /** Whether the scored iterations ran with animation on. */
  animate: boolean;
  size: number;
  seriesCount: number;
  iterations: number;
  metrics: BenchMetrics;
  animation: BenchAnimationReference;
  /** Raw per-iteration samples for transparency. */
  samples: { mountMs: number[]; updateMs: number[]; hoverMs: number[] };
  error?: string;
}

export interface BenchRunConfig {
  kind: BenchChartKind;
  size: number;
  seriesCount: number;
  libraries: BenchLibraryId[];
  /** Measured iterations per library (after 1 discarded warm-up). */
  iterations: number;
  /** Pointer moves per hover sample. */
  hoverMoves: number;
  /**
   * Scored iterations with each library's default animation on (`true`) or
   * off (`false`). The enter-animation reference pass always animates.
   */
  animate: boolean;
  width: number;
  height: number;
}

export type BenchProgress =
  | {
      type: "start";
      library: BenchLibraryId;
      iteration: number;
      phase: "warmup" | "measure" | "animation";
    }
  | { type: "result"; result: BenchResult }
  | { type: "done"; results: BenchResult[] };

/**
 * Runs one configuration. Mounts each library's chart into `stage` (a visible,
 * fixed-size element the page owns) with its own React root, sequentially.
 */
export type RunBenchmark = (
  config: BenchRunConfig,
  stage: HTMLElement,
  onProgress: (event: BenchProgress) => void,
  signal: AbortSignal
) => Promise<BenchResult[]>;

/** Dataset sizes offered per chart kind (bars stay readable). */
export const BENCH_SIZES: Record<BenchChartKind, readonly number[]> = {
  line: [100, 1000, 5000, 10_000],
  area: [100, 1000, 5000, 10_000],
  scatter: [100, 1000, 5000, 10_000],
  bar: [12, 50, 200, 1000],
};
