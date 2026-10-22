"use client";

import { Icon, type IconName } from "@bklitui/icons";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { BENCH_ADAPTERS } from "./adapters";
import {
  BENCH_BUNDLE_SIZES,
  BENCH_LIBRARY_COLORS,
  formatCount,
  formatKb,
  formatMs,
} from "./benchmark-format";
import { BenchFrame, BenchPanel } from "./benchmark-frame";
import {
  type BenchLibraryScore,
  type BenchScoreMetricId,
  type BenchScoreUnit,
  describeDiff,
  formatPercent,
  headToHead,
  scoreBenchResults,
} from "./benchmark-score";
import type { BenchLibraryId, BenchResult } from "./types";

const RANK_ICONS: Record<number, IconName> = {
  1: "IconTrophy",
  2: "IconSilverMedal",
  3: "IconBronceMedal",
};

const RANK_LABELS: Record<number, string> = { 1: "1st", 2: "2nd", 3: "3rd" };

const METRIC_ICONS: Record<BenchScoreMetricId, IconName> = {
  mount: "IconStopwatch",
  update: "IconArrowRotateClockwise",
  hover: "IconCursor",
  domNodes: "IconLayersThree",
  bundle: "IconPackage",
};

const HEAD_TO_HEAD_ICONS: Record<"higher" | "lower" | "equal", IconName> = {
  higher: "IconArrowUp",
  lower: "IconArrowDown",
  equal: "IconMathEquals",
};

const FORMATTERS: Record<BenchScoreUnit, (value: number | null) => string> = {
  time: formatMs,
  count: formatCount,
  size: formatKb,
};

function bundleGzipBytes(): Partial<Record<BenchLibraryId, number>> {
  const out: Partial<Record<BenchLibraryId, number>> = {};
  for (const [library, size] of Object.entries(BENCH_BUNDLE_SIZES)) {
    if (size) {
      out[library as BenchLibraryId] = size.gzipBytes;
    }
  }
  return out;
}

function ScoreCard({ entry }: { entry: BenchLibraryScore }) {
  const adapter = BENCH_ADAPTERS[entry.library];
  const rankIcon = entry.rank == null ? undefined : RANK_ICONS[entry.rank];

  return (
    <BenchPanel className="flex flex-col gap-4 lg:p-5 xl:p-6">
      <div className="flex items-start justify-between gap-3">
        <span className="flex items-center gap-2 font-medium text-sm">
          <span
            aria-hidden
            className="size-2.5 shrink-0 rounded-full"
            style={{ background: BENCH_LIBRARY_COLORS[entry.library] }}
          />
          {adapter.name}
        </span>
        {entry.rank == null ? null : (
          <Badge
            className={cn(
              "gap-1",
              entry.rank === 1 &&
                "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300"
            )}
            variant="outline"
          >
            {rankIcon ? <Icon className="size-3.5" name={rankIcon} /> : null}
            {RANK_LABELS[entry.rank] ?? `#${entry.rank}`}
          </Badge>
        )}
      </div>

      {entry.score == null ? (
        <div className="flex flex-col gap-1">
          <span className="font-heading font-semibold text-4xl text-muted-foreground tabular-nums">
            —
          </span>
          <span className="text-destructive-foreground text-xs">
            {entry.error ?? "No scored metrics."}
          </span>
        </div>
      ) : (
        <div className="flex items-baseline gap-1.5">
          <span className="font-heading font-semibold text-4xl tabular-nums">
            {Math.round(entry.score)}
          </span>
          <span className="text-muted-foreground text-sm">/ 100</span>
        </div>
      )}

      <ul className="flex flex-col gap-2 border-border border-t pt-3 text-sm">
        {entry.metrics.map(({ metric, value, diff, isBest }) => (
          <li
            className="flex items-center justify-between gap-2"
            key={metric.id}
          >
            <span className="flex min-w-0 items-center gap-2 text-muted-foreground">
              <Icon
                className="size-4 shrink-0"
                name={METRIC_ICONS[metric.id]}
              />
              <span className="truncate">{metric.label}</span>
            </span>
            <span className="flex shrink-0 items-center gap-2">
              <span className="font-mono tabular-nums">
                {FORMATTERS[metric.unit](value)}
              </span>
              {diff == null ? null : (
                <span
                  className={cn(
                    "rounded-md px-1.5 py-0.5 font-medium text-xs tabular-nums",
                    isBest
                      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                      : "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                  )}
                >
                  {describeDiff(diff, metric.unit)}
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>
    </BenchPanel>
  );
}

function HeadToHead({ scores }: { scores: BenchLibraryScore[] }) {
  const bklit = scores.find((s) => s.library === "bklit");
  if (!bklit || bklit.score == null) {
    return null;
  }
  const lines = scores
    .filter((s) => s.library !== "bklit")
    .map((other) => ({ other, result: headToHead(bklit, other) }))
    .filter(
      (
        line
      ): line is {
        other: BenchLibraryScore;
        result: NonNullable<ReturnType<typeof headToHead>>;
      } => line.result != null
    );
  if (lines.length === 0) {
    return null;
  }

  return (
    <BenchPanel className="mt-1" variant="ghost">
      <ul className="flex flex-col gap-2 text-sm sm:flex-row sm:flex-wrap sm:gap-x-8">
        {lines.map(({ other, result }) => (
          <li className="flex items-center gap-2" key={other.library}>
            <Icon
              className={cn(
                "size-4 shrink-0",
                result.direction === "higher"
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-muted-foreground"
              )}
              name={HEAD_TO_HEAD_ICONS[result.direction]}
            />
            <span>
              bklit{" "}
              {result.direction === "equal" ? (
                "scores the same as"
              ) : (
                <>
                  scores{" "}
                  <span className="font-semibold tabular-nums">
                    {formatPercent(result.ratio)} {result.direction}
                  </span>{" "}
                  than
                </>
              )}{" "}
              {BENCH_ADAPTERS[other.library].name}
            </span>
          </li>
        ))}
      </ul>
    </BenchPanel>
  );
}

/**
 * Overall score per library from the scored metrics (enter animation is
 * reference only), with each metric's % difference from the best library.
 */
export function BenchmarkScores({ results }: { results: BenchResult[] }) {
  const scores = scoreBenchResults(results, bundleGzipBytes());
  const partial = scores.some(
    (s) => s.score != null && s.scoredMetricCount < s.metrics.length
  );

  return (
    <BenchFrame
      description="Overall score out of 100 and how far each metric is from the best library. Lower raw values are better."
      footer={
        <div className="flex flex-col gap-1">
          <p>
            Score = 100 × geometric mean of (best ÷ yours) across mount, update,
            hover, DOM nodes and bundle size, equally weighted. The best library
            on every metric scores 100. % differences are yours ÷ best − 1.
          </p>
          <p>
            The enter animation is reference only and never part of the score.
            {partial
              ? " Libraries missing a metric are scored over the metrics they have."
              : ""}
          </p>
        </div>
      }
      title="Score"
    >
      <div className="grid grid-cols-1 gap-1 lg:grid-cols-3">
        {scores.map((entry) => (
          <ScoreCard entry={entry} key={entry.library} />
        ))}
      </div>
      <HeadToHead scores={scores} />
    </BenchFrame>
  );
}
