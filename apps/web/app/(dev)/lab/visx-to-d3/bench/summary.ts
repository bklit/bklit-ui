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
  before: number;
  after: number;
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
  before: number,
  after: number,
  delta: number | null
): Verdict {
  if (metric.better === "neutral") {
    return "neutral";
  }
  if (delta === null) {
    return after > before ? "slower" : "faster";
  }
  if (Math.abs(delta) <= NOISE_BAND_PCT) {
    return "noise";
  }
  return delta < 0 ? "faster" : "slower";
}

/** Medians of the live (After) runs, keyed by metric, for a baseline. */
export function liveMedians(records: RunRecord[]): Record<string, number> {
  const after = records.filter((r) => !r.warmup && r.variant === "after");
  const hasHover = after.some((r) => r.hoverCommitMs !== null);
  return Object.fromEntries(
    METRICS.filter((m) => hasHover || !m.hoverOnly).map((metric) => [
      metric.key,
      median(values(after, metric.key)),
    ])
  );
}

/**
 * Medians per metric over measured (non-warm-up) runs. With `reference`
 * (stored baseline medians), Before is the reference instead of Before runs.
 */
export function summarize(
  records: RunRecord[],
  reference?: Record<string, number>
): MetricSummary[] {
  const measured = records.filter((r) => !r.warmup);
  const before = measured.filter((r) => r.variant === "before");
  const after = measured.filter((r) => r.variant === "after");
  const hasHover = measured.some((r) => r.hoverCommitMs !== null);

  return METRICS.filter((m) => hasHover || !m.hoverOnly).map((metric) => {
    const b = reference
      ? (reference[metric.key] ?? 0)
      : median(values(before, metric.key));
    const a = median(values(after, metric.key));
    const delta = deltaPct(b, a);
    return {
      key: metric.key,
      label: metric.label,
      unit: metric.unit,
      before: b,
      after: a,
      deltaPct: delta,
      verdict: verdictFor(metric, b, a, delta),
    };
  });
}
