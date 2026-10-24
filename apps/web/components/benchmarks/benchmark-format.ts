import bundleSizes from "./bundle-sizes.json";
import type { BenchChartKind, BenchLibraryId, BenchResult } from "./types";

export const BENCH_KIND_LABELS: Record<BenchChartKind, string> = {
  line: "Line",
  area: "Area",
  bar: "Bar",
  scatter: "Scatter",
};

/**
 * Identity color per library (Tailwind blue-400 / red-400 / purple-400),
 * shared by legends, tables and the results charts.
 */
export const BENCH_LIBRARY_COLORS: Record<BenchLibraryId, string> = {
  bklit: "oklch(70.7% 0.165 254.624)",
  recharts: "oklch(70.4% 0.191 22.216)",
  tanstack: "oklch(71.4% 0.203 305.504)",
};

/** One-line renderer / animation summary per library, for frame descriptions. */
export const BENCH_LIBRARY_TAGLINES: Record<BenchLibraryId, string> = {
  bklit: "React + SVG, animated with Motion.",
  recharts: "React + SVG, built-in enter animation.",
  tanstack:
    "Framework-neutral scene, React SVG host; motion() renderer when animated.",
};

export interface BenchBundleSize {
  entry: string;
  minBytes: number;
  gzipBytes: number;
}

/** Animated-run bundle, plus a `static` one where animation off ships less. */
export interface BenchBundleSizes extends BenchBundleSize {
  static?: BenchBundleSize;
}

export const BENCH_BUNDLE_SIZES = bundleSizes as Partial<
  Record<BenchLibraryId, BenchBundleSizes>
>;

/** The bundle a run with this animation setting ships. */
export function benchBundleSize(
  library: BenchLibraryId,
  animate: boolean
): BenchBundleSize | undefined {
  const sizes = BENCH_BUNDLE_SIZES[library];
  return (animate ? undefined : sizes?.static) ?? sizes;
}

export function formatMs(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) {
    return "—";
  }
  return `${value.toFixed(value < 10 ? 2 : 1)} ms`;
}

export function formatKb(bytes: number | null | undefined): string {
  if (bytes == null) {
    return "—";
  }
  return `${(bytes / 1024).toFixed(1)} KB`;
}

export function formatCount(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) {
    return "—";
  }
  return value.toLocaleString("en-US");
}

/** Lowest finite value among results that didn't error (ties all highlight). */
export function bestValue(
  results: BenchResult[],
  pick: (result: BenchResult) => number | null | undefined
): number | null {
  let best: number | null = null;
  for (const result of results) {
    if (result.error) {
      continue;
    }
    const value = pick(result);
    if (
      value != null &&
      Number.isFinite(value) &&
      (best == null || value < best)
    ) {
      best = value;
    }
  }
  return best;
}

export interface BenchEnvironment {
  userAgent: string;
  hardwareConcurrency: number | null;
  deviceMemory: number | null;
  devicePixelRatio: number;
  crossOriginIsolated: boolean;
  timestamp: string;
}

export function readBenchEnvironment(): BenchEnvironment {
  const nav = navigator as Navigator & { deviceMemory?: number };
  return {
    userAgent: nav.userAgent,
    hardwareConcurrency: nav.hardwareConcurrency ?? null,
    deviceMemory: nav.deviceMemory ?? null,
    devicePixelRatio: window.devicePixelRatio,
    crossOriginIsolated: window.crossOriginIsolated,
    timestamp: new Date().toISOString(),
  };
}
