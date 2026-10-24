"use client";

import { Fragment, type ReactNode, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BENCH_ADAPTERS } from "./adapters";
import {
  BENCH_LIBRARY_COLORS,
  benchBundleSize,
  bestValue,
  formatCount,
  formatKb,
  formatMs,
} from "./benchmark-format";
import { BenchFrame, BenchPanel } from "./benchmark-frame";
import {
  type BenchMetricDatum,
  BenchmarkMetricChart,
} from "./benchmark-metric-chart";
import { BenchmarkScores } from "./benchmark-scores";
import type { BenchResult } from "./types";

const tableClassName =
  "w-full min-w-[640px] border-collapse text-left text-sm [&_td]:border-border [&_td]:border-t [&_td]:px-4 [&_td]:py-2.5 [&_th]:px-4 [&_th]:py-2.5 [&_th]:font-medium [&_th]:text-muted-foreground";

const REFERENCE_BADGE = (
  <Badge variant="outline">Reference — not included in scores</Badge>
);

function isFiniteNumber(value: number | null | undefined): value is number {
  return value != null && Number.isFinite(value);
}

function minSample(samples: number[]): number | undefined {
  return samples.length > 0 ? Math.min(...samples) : undefined;
}

function LibraryName({ library }: { library: BenchResult["library"] }) {
  const adapter = BENCH_ADAPTERS[library];
  return (
    <span className="flex items-center gap-2 font-medium">
      <span
        aria-hidden
        className="size-2.5 shrink-0 rounded-full"
        style={{ background: BENCH_LIBRARY_COLORS[library] }}
      />
      {adapter.name}
    </span>
  );
}

/** Exact values per library with the best one highlighted. */
function ValueList({
  items,
  best,
  format,
}: {
  items: { library: BenchResult["library"]; value: number | null }[];
  best: number | null;
  format: (value: number | null) => string;
}) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1">
      {items.map(({ library, value }) => {
        const isBest = value != null && best != null && value === best;
        return (
          <li className="flex items-center gap-1.5" key={library}>
            <span>{BENCH_ADAPTERS[library].name}</span>
            <span
              className={cn(
                "font-mono text-foreground tabular-nums",
                isBest && "font-semibold text-emerald-600 dark:text-emerald-400"
              )}
            >
              {format(value)}
            </span>
            {isBest ? <span className="sr-only">(best)</span> : null}
          </li>
        );
      })}
    </ul>
  );
}

function MetricFrame({
  title,
  description,
  badge,
  data,
  valueLabel,
  secondaryLabel,
  chartFormat,
  values,
  best,
  format,
  note,
}: {
  title: string;
  description: string;
  badge?: ReactNode;
  data: BenchMetricDatum[];
  valueLabel: string;
  secondaryLabel?: string;
  chartFormat: (value: number) => string;
  values: { library: BenchResult["library"]; value: number | null }[];
  best: number | null;
  format: (value: number | null) => string;
  note: string;
}) {
  return (
    <BenchFrame
      badge={badge}
      description={description}
      footer={
        <div className="flex flex-col gap-1.5">
          <ValueList best={best} format={format} items={values} />
          <p>{note}</p>
        </div>
      }
      title={title}
    >
      <BenchPanel className="px-2 py-4 sm:px-4">
        {data.length > 0 ? (
          <BenchmarkMetricChart
            data={data}
            format={chartFormat}
            secondaryLabel={secondaryLabel}
            valueLabel={valueLabel}
          />
        ) : (
          <p className="flex aspect-video items-center justify-center text-muted-foreground text-sm">
            No measured values.
          </p>
        )}
      </BenchPanel>
    </BenchFrame>
  );
}

const ROUND = (value: number) => Number(value.toFixed(3));

function timingFrame(
  results: BenchResult[],
  measured: BenchResult[],
  key: "mountMs" | "updateMs" | "hoverMs",
  title: string,
  description: string
) {
  const values = results.map((r) => ({
    library: r.library,
    value: r.error ? null : r.metrics[key],
  }));
  const data = measured
    .filter((r) => isFiniteNumber(r.metrics[key]))
    .map((r) => ({
      library: BENCH_ADAPTERS[r.library].name,
      libraryId: r.library,
      value: ROUND(r.metrics[key]),
      secondary: ROUND(minSample(r.samples[key]) ?? r.metrics[key]),
    }));
  return (
    <MetricFrame
      best={bestValue(results, (r) => r.metrics[key])}
      chartFormat={formatMs}
      data={data}
      description={description}
      format={formatMs}
      key={key}
      note="Median (solid) and fastest run (pattern), in ms. Lower is better."
      secondaryLabel="Fastest run"
      title={title}
      valueLabel="Median"
      values={values}
    />
  );
}

function MetricFrames({ results }: { results: BenchResult[] }) {
  const measured = results.filter((r) => !r.error);

  const domValues = results.map((r) => ({
    library: r.library,
    value: r.error ? null : r.metrics.domNodes,
  }));
  const domData = measured
    .filter((r) => isFiniteNumber(r.metrics.domNodes))
    .map((r) => ({
      library: BENCH_ADAPTERS[r.library].name,
      libraryId: r.library,
      value: r.metrics.domNodes,
    }));

  const bundleValues = results.map((r) => ({
    library: r.library,
    value: benchBundleSize(r.library, r.animate)?.gzipBytes ?? null,
  }));
  const bundleData = results.flatMap((r) => {
    const bundle = benchBundleSize(r.library, r.animate);
    return bundle
      ? [
          {
            library: BENCH_ADAPTERS[r.library].name,
            libraryId: r.library,
            value: Number((bundle.gzipBytes / 1024).toFixed(1)),
            secondary: Number((bundle.minBytes / 1024).toFixed(1)),
          },
        ]
      : [];
  });

  const animationValues = results.map((r) => ({
    library: r.library,
    value: r.animation.observedMs,
  }));
  const animationData = results
    .filter((r) => isFiniteNumber(r.animation.observedMs))
    .map((r) => ({
      library: BENCH_ADAPTERS[r.library].name,
      libraryId: r.library,
      value: ROUND(r.animation.observedMs ?? 0),
      ...(r.animation.configuredMs == null
        ? {}
        : { secondary: r.animation.configuredMs }),
    }));

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
      {timingFrame(
        results,
        measured,
        "mountMs",
        "Mount",
        "React render call → first painted frame that shows the chart, including any frames a library waits to size itself. The enter animation is not counted."
      )}
      {timingFrame(
        results,
        measured,
        "updateMs",
        "Data update",
        "New same-size dataset → painted frame showing it (static), or the first painted frame (animated; the morph after it is not counted)."
      )}
      {timingFrame(
        results,
        measured,
        "hoverMs",
        "Hover",
        "Per pointer move → the painted frame showing the tooltip and crosshair update, including a frame a library defers it to."
      )}
      <MetricFrame
        best={bestValue(results, (r) => r.metrics.domNodes)}
        chartFormat={(value) => `${formatCount(value)} nodes`}
        data={domData}
        description="Elements inside the chart container once the enter animation has settled."
        format={formatCount}
        note="Element count. Lower is better."
        title="DOM nodes"
        valueLabel="Nodes"
        values={domValues}
      />
      <MetricFrame
        best={bestValue(
          results,
          (r) => benchBundleSize(r.library, r.animate)?.gzipBytes
        )}
        chartFormat={(value) => `${value.toFixed(1)} KB`}
        data={bundleData}
        description="A minimal line chart per library as benchmarked, bundled with esbuild (React external). TanStack ships its motion() renderer only when animation is on. Measured at build time."
        format={formatKb}
        note="Gzipped (solid) and minified (pattern), in KB. Lower is better."
        secondaryLabel="Minified"
        title="Bundle size"
        valueLabel="Gzipped"
        values={bundleValues}
      />
      <MetricFrame
        badge={REFERENCE_BADGE}
        best={null}
        chartFormat={formatMs}
        data={animationData}
        description="How long each library's default enter animation actually ran on this device."
        format={formatMs}
        note="Observed (solid) and configured default (pattern), in ms. Shown for reference; never part of a score."
        secondaryLabel="Default duration"
        title="Enter animation"
        valueLabel="Observed"
        values={animationValues}
      />
    </div>
  );
}

function BestCell({
  value,
  best,
  children,
}: {
  value: number | null | undefined;
  best: number | null;
  children: ReactNode;
}) {
  const isBest = value != null && best != null && value === best;
  return (
    <td
      className={cn(
        "font-mono tabular-nums",
        isBest && "font-semibold text-emerald-600 dark:text-emerald-400"
      )}
    >
      {children}
      {isBest ? <span className="sr-only"> (best)</span> : null}
    </td>
  );
}

function SamplesRow({ result }: { result: BenchResult }) {
  const rows: [string, number[]][] = [
    ["mount", result.samples.mountMs],
    ["update", result.samples.updateMs],
    ["hover", result.samples.hoverMs],
  ];
  return (
    <tr>
      <td className="bg-muted/40" colSpan={7}>
        <dl className="grid gap-1 font-mono text-xs">
          {rows.map(([label, samples]) => (
            <div className="flex flex-wrap gap-x-2" key={label}>
              <dt className="w-14 text-muted-foreground">{label}</dt>
              <dd className="tabular-nums">
                {samples.length > 0
                  ? samples.map((s) => s.toFixed(2)).join(", ")
                  : "—"}
              </dd>
            </div>
          ))}
        </dl>
      </td>
    </tr>
  );
}

function ResultsTable({ results }: { results: BenchResult[] }) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const best = {
    mount: bestValue(results, (r) => r.metrics.mountMs),
    update: bestValue(results, (r) => r.metrics.updateMs),
    hover: bestValue(results, (r) => r.metrics.hoverMs),
    dom: bestValue(results, (r) => r.metrics.domNodes),
    bundle: bestValue(
      results,
      (r) => benchBundleSize(r.library, r.animate)?.gzipBytes
    ),
  };

  const toggle = (library: string) => {
    setExpanded((previous) => {
      const next = new Set(previous);
      if (next.has(library)) {
        next.delete(library);
      } else {
        next.add(library);
      }
      return next;
    });
  };

  return (
    <div className="overflow-x-auto">
      <table className={tableClassName}>
        <thead>
          <tr>
            <th scope="col">Library</th>
            <th scope="col">Mount</th>
            <th scope="col">Update</th>
            <th scope="col">Hover / move</th>
            <th scope="col">DOM nodes</th>
            <th scope="col">Bundle (gzip)*</th>
            <th scope="col">
              <span className="sr-only">Raw samples</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {results.map((result) => {
            const adapter = BENCH_ADAPTERS[result.library];
            const bundle = benchBundleSize(result.library, result.animate);
            const isOpen = expanded.has(result.library);
            return (
              <Fragment key={result.library}>
                <tr>
                  <td>
                    <span className="flex items-center gap-2">
                      <LibraryName library={result.library} />
                      <span className="font-mono text-muted-foreground text-xs">
                        v{adapter.version}
                      </span>
                    </span>
                    {result.error ? (
                      <p className="mt-1 text-destructive-foreground text-xs">
                        {result.error}
                      </p>
                    ) : null}
                  </td>
                  <BestCell best={best.mount} value={result.metrics.mountMs}>
                    {formatMs(result.metrics.mountMs)}
                  </BestCell>
                  <BestCell best={best.update} value={result.metrics.updateMs}>
                    {formatMs(result.metrics.updateMs)}
                  </BestCell>
                  <BestCell best={best.hover} value={result.metrics.hoverMs}>
                    {formatMs(result.metrics.hoverMs)}
                  </BestCell>
                  <BestCell best={best.dom} value={result.metrics.domNodes}>
                    {formatCount(result.metrics.domNodes)}
                  </BestCell>
                  <BestCell best={best.bundle} value={bundle?.gzipBytes}>
                    {formatKb(bundle?.gzipBytes)}
                  </BestCell>
                  <td className="text-right">
                    <Button
                      aria-expanded={isOpen}
                      onClick={() => toggle(result.library)}
                      size="xs"
                      variant="ghost"
                    >
                      {isOpen ? "Hide samples" : "Samples"}
                    </Button>
                  </td>
                </tr>
                {isOpen ? <SamplesRow result={result} /> : null}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/** Enter-animation figures: shown beside the scores, never folded into them. */
function AnimationTable({ results }: { results: BenchResult[] }) {
  return (
    <div className="overflow-x-auto">
      <table className={tableClassName}>
        <thead>
          <tr>
            <th scope="col">Library</th>
            <th scope="col">Default duration</th>
            <th scope="col">Observed</th>
            <th scope="col">Avg frame</th>
            <th scope="col">Long frames</th>
          </tr>
        </thead>
        <tbody>
          {results.map((result) => (
            <tr key={result.library}>
              <td>
                <LibraryName library={result.library} />
              </td>
              <td className="font-mono tabular-nums">
                {result.animation.configuredMs == null
                  ? "none"
                  : formatMs(result.animation.configuredMs)}
              </td>
              <td className="font-mono tabular-nums">
                {formatMs(result.animation.observedMs)}
              </td>
              <td className="font-mono tabular-nums">
                {formatMs(result.animation.avgFrameMs)}
              </td>
              <td className="font-mono tabular-nums">
                {formatCount(result.animation.longFrames)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function BenchmarkResults({
  results,
  summary,
  action,
}: {
  results: BenchResult[];
  /** Run configuration line, e.g. "Line chart · 1,000 points · …". */
  summary: string;
  /** Header action for the detailed results frame (copy JSON). */
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 lg:gap-6">
      {results.some((r) => r.error) ? (
        <p className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-destructive-foreground text-sm">
          Some libraries couldn&apos;t be measured. If you switched tabs or
          scrolled the live run area away, keep it visible and run again.
        </p>
      ) : null}
      <BenchmarkScores results={results} />
      <MetricFrames results={results} />
      <BenchFrame
        action={action}
        description={summary}
        footer={
          <p>
            Medians over the measured iterations; best value per column is
            highlighted. *Bundle size is a minimal line chart per library
            (minified + gzip, React excluded), measured at build time, so it
            doesn&apos;t change with the chart type.
          </p>
        }
        title="Detailed results"
      >
        <BenchPanel className="p-0 sm:p-0">
          <ResultsTable results={results} />
        </BenchPanel>
      </BenchFrame>
      <BenchFrame
        badge={REFERENCE_BADGE}
        description="Each library's default enter animation, measured in a separate pass with animation on."
        footer={
          <p>
            Observed runs from the first painted frame until the chart stops
            changing the DOM. Long frames are frames over 1.5× your display's
            frame budget. None of these feed into the scores above.
          </p>
        }
        title="Enter animation"
      >
        <BenchPanel className="p-0 sm:p-0">
          <AnimationTable results={results} />
        </BenchPanel>
      </BenchFrame>
    </div>
  );
}
