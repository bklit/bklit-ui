import type { BenchLibraryId, BenchResult } from "./types";

/** Metrics that count towards the score. Lower is better for all of them. */
export type BenchScoreMetricId =
  | "mount"
  | "update"
  | "hover"
  | "domNodes"
  | "bundle";

export type BenchScoreUnit = "time" | "count" | "size";

export interface BenchScoreMetricDef {
  id: BenchScoreMetricId;
  label: string;
  unit: BenchScoreUnit;
}

export const BENCH_SCORE_METRICS: readonly BenchScoreMetricDef[] = [
  { id: "mount", label: "Mount", unit: "time" },
  { id: "update", label: "Update", unit: "time" },
  { id: "hover", label: "Hover", unit: "time" },
  { id: "domNodes", label: "DOM nodes", unit: "count" },
  { id: "bundle", label: "Bundle (gzip)", unit: "size" },
];

export interface BenchMetricScore {
  metric: BenchScoreMetricDef;
  /** Raw value (ms, nodes or bytes); null when missing for this library. */
  value: number | null;
  /** Lowest value across scored libraries for this metric. */
  best: number | null;
  /** value / best − 1 (0 = best). Null when either side is missing. */
  diff: number | null;
  isBest: boolean;
}

export interface BenchLibraryScore {
  library: BenchLibraryId;
  /** 0–100, or null when the library errored or has no scored metrics. */
  score: number | null;
  /** 1-based rank among scored libraries (ties share a rank). */
  rank: number | null;
  metrics: BenchMetricScore[];
  /** Metrics this library was scored over. */
  scoredMetricCount: number;
  error?: string;
}

/**
 * Score per library: 100 × geometric mean of (best / value) over the scored
 * metrics the library has. Geometric mean so a metric's scale (ms vs bytes)
 * can't dominate; equal weights. Errored libraries are excluded.
 */
export function scoreBenchResults(
  results: BenchResult[],
  bundleGzipBytes: Partial<Record<BenchLibraryId, number>>
): BenchLibraryScore[] {
  const metricValue = (
    result: BenchResult,
    metric: BenchScoreMetricId
  ): number | null => {
    let value: number | null | undefined;
    switch (metric) {
      case "mount":
        value = result.metrics.mountMs;
        break;
      case "update":
        value = result.metrics.updateMs;
        break;
      case "hover":
        value = result.metrics.hoverMs;
        break;
      case "domNodes":
        value = result.metrics.domNodes;
        break;
      default:
        value = bundleGzipBytes[result.library];
    }
    return value != null && Number.isFinite(value) && value > 0 ? value : null;
  };

  const scored = results.filter((r) => !r.error);
  const bestByMetric = new Map<BenchScoreMetricId, number | null>();
  for (const metric of BENCH_SCORE_METRICS) {
    let best: number | null = null;
    for (const result of scored) {
      const value = metricValue(result, metric.id);
      if (value != null && (best == null || value < best)) {
        best = value;
      }
    }
    bestByMetric.set(metric.id, best);
  }

  const scores: BenchLibraryScore[] = results.map((result) => {
    const metrics = BENCH_SCORE_METRICS.map((metric) => {
      const best = bestByMetric.get(metric.id) ?? null;
      const value = result.error ? null : metricValue(result, metric.id);
      const diff = value != null && best != null ? value / best - 1 : null;
      return {
        metric,
        value,
        best,
        diff,
        isBest: value != null && best != null && value === best,
      };
    });

    if (result.error) {
      return {
        library: result.library,
        score: null,
        rank: null,
        metrics,
        scoredMetricCount: 0,
        error: result.error,
      };
    }

    let logSum = 0;
    let count = 0;
    for (const { value, best } of metrics) {
      if (value != null && best != null) {
        logSum += Math.log(best / value);
        count += 1;
      }
    }
    return {
      library: result.library,
      score: count > 0 ? 100 * Math.exp(logSum / count) : null,
      rank: null,
      metrics,
      scoredMetricCount: count,
    };
  });

  const ranked = scores
    .filter((s) => s.score != null)
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  for (const entry of ranked) {
    entry.rank =
      1 +
      ranked.filter((other) => (other.score ?? 0) > (entry.score ?? 0)).length;
  }

  return [...scores].sort((a, b) => {
    if (a.score == null) {
      return b.score == null ? 0 : 1;
    }
    if (b.score == null) {
      return -1;
    }
    return b.score - a.score;
  });
}

/** "+38% slower", "12% fewer", "Best" — relative to the best value. */
export function describeDiff(
  diff: number | null,
  unit: BenchScoreUnit
): string {
  if (diff == null) {
    return "—";
  }
  if (diff === 0) {
    return "Best";
  }
  const word = { time: "slower", count: "more", size: "larger" }[unit];
  // From 10× worse, a multiplier reads better than "+900%".
  return diff >= 9
    ? `${(diff + 1).toFixed(1)}× ${word}`
    : `+${formatPercent(diff)} ${word}`;
}

/** Relative difference as a percent: "38%", "4.2%". */
export function formatPercent(ratio: number): string {
  const pct = ratio * 100;
  return `${pct < 10 ? pct.toFixed(1) : Math.round(pct)}%`;
}

/** bklit vs another library: overall score difference as a sentence. */
export function headToHead(
  subject: BenchLibraryScore,
  other: BenchLibraryScore
): { ratio: number; direction: "higher" | "lower" | "equal" } | null {
  if (subject.score == null || other.score == null || other.score === 0) {
    return null;
  }
  const ratio = subject.score / other.score - 1;
  if (Math.abs(ratio) < 0.005) {
    return { ratio: 0, direction: "equal" };
  }
  return { ratio: Math.abs(ratio), direction: ratio > 0 ? "higher" : "lower" };
}
