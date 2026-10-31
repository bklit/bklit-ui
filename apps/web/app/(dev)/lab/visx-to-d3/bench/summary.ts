import type { RunRecord } from "./run-benchmark";
import { deltaPct, median } from "./stats";

/** Deltas inside ±5 % are treated as noise. */
export const NOISE_BAND_PCT = 5;

type NumericKey = {
  [K in keyof RunRecord]: RunRecord[K] extends number | null ? K : never;
}[keyof RunRecord];

export interface MetricDefinition {
  key: NumericKey;
  label: string;
  unit: "ms" | "count";
  /** `lower` metrics are colour-coded; `neutral` ones are informational. */
  better: "lower" | "neutral";
  hoverOnly?: boolean;
}

export const METRICS: MetricDefinition[] = [
  {
    key: "mountCommitMs",
    label: "Mount commit",
    unit: "ms",
    better: "lower",
  },
  {
    key: "totalCommitMs",
    label: "Commits until settle (sum)",
    unit: "ms",
    better: "lower",
  },
  { key: "commits", label: "Commit count", unit: "count", better: "lower" },
  { key: "settleMs", label: "Time to settle", unit: "ms", better: "lower" },
  { key: "frames", label: "Frames", unit: "count", better: "neutral" },
  { key: "meanFrameMs", label: "Mean frame", unit: "ms", better: "lower" },
  { key: "p95FrameMs", label: "p95 frame", unit: "ms", better: "lower" },
  { key: "maxFrameMs", label: "Max frame", unit: "ms", better: "lower" },
  {
    key: "longFrames",
    label: "Long frames (> 20 ms)",
    unit: "count",
    better: "lower",
  },
  {
    key: "hoverCommitMs",
    label: "Hover pass commits (sum)",
    unit: "ms",
    better: "lower",
    hoverOnly: true,
  },
  {
    key: "hoverCommits",
    label: "Hover pass commit count",
    unit: "count",
    better: "lower",
    hoverOnly: true,
  },
];

export type Verdict = "faster" | "slower" | "noise" | "neutral";

export interface MetricSummary {
  key: NumericKey;
  label: string;
  unit: MetricDefinition["unit"];
  /** Stored baseline median (0 when none is stored). */
  baseline: number;
  live: number;
  deltaPct: number | null;
  verdict: Verdict;
}

function values(records: RunRecord[], key: NumericKey): number[] {
  return records
    .map((r) => r[key])
    .filter((v): v is number => typeof v === "number");
}

function verdictFor(
  metric: MetricDefinition,
  baseline: number,
  live: number,
  delta: number | null
): Verdict {
  if (metric.better === "neutral") {
    return "neutral";
  }
  if (delta === null) {
    return live > baseline ? "slower" : "faster";
  }
  if (Math.abs(delta) <= NOISE_BAND_PCT) {
    return "noise";
  }
  return delta < 0 ? "faster" : "slower";
}

/** Medians of the measured live runs, keyed by metric, for a baseline. */
export function liveMedians(records: RunRecord[]): Record<string, number> {
  const measured = records.filter((r) => !r.warmup);
  const hasHover = measured.some((r) => r.hoverCommitMs !== null);
  return Object.fromEntries(
    METRICS.filter((m) => hasHover || !m.hoverOnly).map((metric) => [
      metric.key,
      median(values(measured, metric.key)),
    ])
  );
}

/**
 * Median per metric over the measured (non-warm-up) live runs, next to the
 * medians stored in the baseline (`reference`).
 */
export function summarize(
  records: RunRecord[],
  reference: Record<string, number>
): MetricSummary[] {
  const live = liveMedians(records);
  const hasHover = records.some((r) => !r.warmup && r.hoverCommitMs !== null);

  return METRICS.filter((m) => hasHover || !m.hoverOnly).map((metric) => {
    const b = reference[metric.key] ?? 0;
    const a = live[metric.key] ?? 0;
    const delta = deltaPct(b, a);
    return {
      key: metric.key,
      label: metric.label,
      unit: metric.unit,
      baseline: b,
      live: a,
      deltaPct: delta,
      verdict: verdictFor(metric, b, a, delta),
    };
  });
}
