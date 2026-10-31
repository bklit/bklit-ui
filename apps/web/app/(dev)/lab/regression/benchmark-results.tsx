"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { BaselineBenchmark } from "./bench/baseline";
import type { RunRecord } from "./bench/run-benchmark";
import {
  type MetricSummary,
  NOISE_BAND_PCT,
  type Verdict,
} from "./bench/summary";
import type { BenchmarkOutcome } from "./benchmark-section";

/** The live run vs the medians stored in the baseline. */
export interface BaselineBenchmarkProps {
  reference: BaselineBenchmark | null;
  onStore: () => void;
  storeState: string | null;
}

const VERDICT_CLASS: Record<Verdict, string> = {
  faster: "text-emerald-600 dark:text-emerald-400",
  slower: "text-red-600 dark:text-red-400",
  noise: "text-muted-foreground",
  neutral: "text-muted-foreground",
};

function formatValue(value: number, unit: MetricSummary["unit"]): string {
  if (unit === "count") {
    return Number.isInteger(value) ? String(value) : value.toFixed(1);
  }
  return `${value.toFixed(value >= 100 ? 0 : 2)} ms`;
}

function formatDelta(metric: MetricSummary): string {
  if (metric.deltaPct === null) {
    const diff = metric.live - metric.baseline;
    return `${diff > 0 ? "+" : ""}${formatValue(diff, metric.unit)}`;
  }
  const sign = metric.deltaPct > 0 ? "+" : "";
  return `${sign}${metric.deltaPct.toFixed(1)}%`;
}

function buildJson(outcome: BenchmarkOutcome, summary: MetricSummary[]) {
  return JSON.stringify(
    {
      page: "/lab/regression",
      ...outcome,
      environment: {
        nodeEnv: process.env.NODE_ENV,
        userAgent: navigator.userAgent,
        devicePixelRatio: window.devicePixelRatio,
        viewport: { width: window.innerWidth, height: window.innerHeight },
        hardwareConcurrency: navigator.hardwareConcurrency,
      },
      noiseBandPct: NOISE_BAND_PCT,
      summary,
    },
    null,
    2
  );
}

export function BenchmarkResults({
  outcome,
  summary,
  baseline,
}: {
  outcome: BenchmarkOutcome;
  summary: MetricSummary[];
  baseline: BaselineBenchmarkProps;
}) {
  const [copied, setCopied] = useState(false);
  const profilerMissing = outcome.records.every((r) => r.commits === 0);
  const unsettled = outcome.records.filter((r) => !r.settled).length;
  const { config } = outcome;

  const copy = async () => {
    await navigator.clipboard.writeText(buildJson(outcome, summary));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-muted-foreground text-xs">
          <span>
            {config.chart} · {config.variant} · {config.copies}{" "}
            {config.copies === 1 ? "copy" : "copies"} · {config.iterations}{" "}
            iterations{config.hover ? " · hover pass" : ""} ·{" "}
            {(outcome.durationMs / 1000).toFixed(1)} s
          </span>
          {outcome.cancelled ? (
            <Badge variant="warning">Cancelled</Badge>
          ) : null}
          {unsettled > 0 ? (
            <Badge variant="warning">
              {unsettled} runs hit the settle timeout
            </Badge>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StoreMediansButton
            baseline={baseline}
            disabled={outcome.cancelled}
          />
          <Button onClick={copy} size="xs" variant="outline">
            {copied ? "Copied" : "Copy results as JSON"}
          </Button>
        </div>
      </div>
      <ReferenceNote reference={baseline.reference} />

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm tabular-nums">
          <thead className="bg-muted text-muted-foreground text-xs">
            <tr>
              <th className="px-3 py-2 text-left font-medium">
                Metric (median)
              </th>
              <th className="px-3 py-2 text-right font-medium">Baseline</th>
              <th className="px-3 py-2 text-right font-medium">Live</th>
              <th className="px-3 py-2 text-right font-medium">Δ</th>
            </tr>
          </thead>
          <tbody>
            {summary.map((metric) => (
              <tr className="border-t" key={metric.key}>
                <td className="px-3 py-1.5">{metric.label}</td>
                <td className="px-3 py-1.5 text-right">
                  {formatValue(metric.baseline, metric.unit)}
                </td>
                <td className="px-3 py-1.5 text-right">
                  {formatValue(metric.live, metric.unit)}
                </td>
                <td
                  className={cn(
                    "px-3 py-1.5 text-right font-medium",
                    VERDICT_CLASS[metric.verdict]
                  )}
                >
                  {formatDelta(metric)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="list-disc space-y-1 pl-5 text-muted-foreground text-xs">
        <li>
          Green is faster, red is slower beyond the ±{NOISE_BAND_PCT}% noise
          band, grey is within noise (or informational, like frame count).
        </li>
        <li>
          Numbers are noisy on a busy machine: close other tabs, keep this tab
          focused, and rerun before trusting a small delta. The first run is a
          warm-up and is discarded.
        </li>
        <li>
          {process.env.NODE_ENV === "production"
            ? "Production build: React only reports Profiler timings in profiling builds (next build --profile)."
            : "Dev build: React dev mode inflates commit times; compare deltas, not absolutes."}
          {profilerMissing
            ? " No Profiler commits were recorded this run."
            : ""}
        </li>
      </ul>

      <RunsTable records={outcome.records} />
    </div>
  );
}

function RunsTable({ records }: { records: RunRecord[] }) {
  return (
    <details className="rounded-lg border">
      <summary className="cursor-pointer px-3 py-2 text-muted-foreground text-xs">
        All runs ({records.length})
      </summary>
      <div className="overflow-x-auto border-t">
        <table className="w-full font-mono text-xs tabular-nums">
          <thead className="text-muted-foreground">
            <tr>
              {[
                "#",
                "mount",
                "commits Σ",
                "n",
                "settle",
                "frames",
                "mean",
                "p95",
                "max",
                "long",
                "hover Σ",
              ].map((h) => (
                <th className="px-2 py-1.5 text-right font-medium" key={h}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr
                className={cn("border-t", r.warmup && "text-muted-foreground")}
                key={r.run}
              >
                <td className="px-2 py-1 text-right">
                  {r.run}
                  {r.warmup ? "w" : ""}
                </td>
                <td className="px-2 py-1 text-right">
                  {r.mountCommitMs.toFixed(2)}
                </td>
                <td className="px-2 py-1 text-right">
                  {r.totalCommitMs.toFixed(2)}
                </td>
                <td className="px-2 py-1 text-right">{r.commits}</td>
                <td className="px-2 py-1 text-right">
                  {r.settleMs.toFixed(0)}
                  {r.settled ? "" : "!"}
                </td>
                <td className="px-2 py-1 text-right">{r.frames}</td>
                <td className="px-2 py-1 text-right">
                  {r.meanFrameMs.toFixed(1)}
                </td>
                <td className="px-2 py-1 text-right">
                  {r.p95FrameMs.toFixed(1)}
                </td>
                <td className="px-2 py-1 text-right">
                  {r.maxFrameMs.toFixed(1)}
                </td>
                <td className="px-2 py-1 text-right">{r.longFrames}</td>
                <td className="px-2 py-1 text-right">
                  {r.hoverCommitMs === null ? "–" : r.hoverCommitMs.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}

function StoreMediansButton({
  baseline,
  disabled,
}: {
  baseline: BaselineBenchmarkProps;
  disabled: boolean;
}) {
  return (
    <>
      {baseline.storeState ? (
        <span className="text-muted-foreground text-xs">
          {baseline.storeState}
        </span>
      ) : null}
      <Button
        disabled={disabled}
        onClick={baseline.onStore}
        size="xs"
        variant="outline"
      >
        Store medians in baseline
      </Button>
    </>
  );
}

function ReferenceNote({ reference }: { reference: BaselineBenchmark | null }) {
  if (!reference) {
    return (
      <p className="text-muted-foreground text-xs">
        No benchmark medians stored in this variant&apos;s baseline yet: the
        Baseline column is empty.
      </p>
    );
  }
  const copies = `${reference.copies} ${reference.copies === 1 ? "copy" : "copies"}`;
  return (
    <p className="text-muted-foreground text-xs">
      Baseline medians: {reference.machine}, {reference.recordedAt} (
      {reference.iterations} iterations, {copies}
      {reference.hover ? ", hover pass" : ""}). Only compare runs with the same
      settings on the same machine.
    </p>
  );
}
