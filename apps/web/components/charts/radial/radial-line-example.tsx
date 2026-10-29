"use client";

import {
  ChartStatFlow,
  RadialAxis,
  RadialCenter,
  type RadialCenterState,
  RadialChart,
  RadialLegend,
  RadialLine,
  RadialScrubber,
  type RadialSeries,
} from "@bklitui/ui/charts";
import { useMemo } from "react";
import { CenterCountDelta } from "@/components/charts/radial/center-delta";
import {
  type PullRequestBin,
  pullRequestNowLabel,
  usePullRequestDay,
} from "@/components/charts/radial/pull-request-day-data";
import type { RadialGalleryVariant } from "@/components/charts/radial/types";

// ---------------------------------------------------------------------------
// Data — merged PRs per 15-minute bin, today vs yesterday
// ---------------------------------------------------------------------------

interface MergedBin extends Record<string, unknown> {
  time: string;
  /** Today — null after "now" */
  merged: number | null;
  /** Yesterday, same bin (whole day) */
  yesterday: number;
}

const SMOOTH_RADIUS = 3;

/** Centred moving average; wraps round midnight when `wrap` is set. */
function smooth(values: number[], wrap: boolean): number[] {
  const n = values.length;
  return values.map((_, i) => {
    let sum = 0;
    let count = 0;
    for (let k = -SMOOTH_RADIUS; k <= SMOOTH_RADIUS; k++) {
      const j = wrap ? (i + k + n) % n : i + k;
      const v = values[j];
      if (v !== undefined) {
        sum += v;
        count += 1;
      }
    }
    return Math.round(sum / Math.max(1, count));
  });
}

interface MergedDay {
  data: MergedBin[];
  /** Shared by both lines so today and yesterday use one scale */
  maxMerged: number;
  /** Yesterday's (smoothed) merged PRs over the bins that have data today */
  yesterdaySoFar: number;
}

/** Smooths today (up to `nowIndex`) and yesterday (whole day) into lines. */
function toMergedDay(day: PullRequestBin[], nowIndex: number): MergedDay {
  const todaySmooth = smooth(
    day.slice(0, nowIndex + 1).map((d) => d.merged ?? 0),
    false
  );
  const yesterdaySmooth = smooth(
    day.map((d) => d.yesterdayMerged),
    true
  );
  const data: MergedBin[] = day.map((d, i) => ({
    time: d.time,
    merged: i <= nowIndex ? (todaySmooth[i] ?? 0) : null,
    yesterday: yesterdaySmooth[i] ?? 0,
  }));
  return {
    data,
    maxMerged: Math.max(
      ...data.map((d) => Math.max(d.merged ?? 0, d.yesterday))
    ),
    yesterdaySoFar: data
      .slice(0, nowIndex + 1)
      .reduce((total, d) => total + d.yesterday, 0),
  };
}

const mergedSeries: RadialSeries[] = [
  { dataKey: "merged", label: "Merged today", color: "var(--chart-1)" },
];

// ---------------------------------------------------------------------------
// Center
// ---------------------------------------------------------------------------

interface CenterContext {
  /** End of the "now" bin, e.g. "14:30" — today's line runs up to here */
  nowLabel: string;
  yesterdaySoFar: number;
}

function centerStat(
  { datum, isFuture, label, totals }: RadialCenterState,
  { nowLabel, yesterdaySoFar }: CenterContext
) {
  const bin = datum as MergedBin | null;
  if (!bin) {
    const merged = totals.merged ?? 0;
    return {
      value: merged,
      caption: `merged by ${nowLabel}`,
      delta: merged - yesterdaySoFar,
    };
  }
  if (isFuture || bin.merged === null) {
    return {
      value: bin.yesterday,
      caption: `merged at ${label} yesterday`,
      delta: null,
    };
  }
  return {
    value: bin.merged,
    caption: `merged at ${label}`,
    delta: bin.merged - bin.yesterday,
  };
}

function MergedCenter({
  context,
  state,
}: {
  context: CenterContext;
  state: RadialCenterState;
}) {
  const { value, caption, delta } = centerStat(state, context);
  return (
    <>
      <ChartStatFlow
        label={caption}
        labelClassName="mt-[4cqw] text-muted-foreground text-[clamp(0.625rem,7cqw,1.125rem)]"
        value={value}
        valueClassName="font-bold leading-none tracking-tight text-[clamp(1.25rem,17cqw,2.75rem)]"
      />
      <CenterCountDelta comparison="vs yesterday" delta={delta} />
    </>
  );
}

// ---------------------------------------------------------------------------
// Example
// ---------------------------------------------------------------------------

export function RadialLineExample() {
  const { data: day, nowIndex } = usePullRequestDay();
  const { data, maxMerged, yesterdaySoFar } = useMemo(
    () => toMergedDay(day, nowIndex),
    [day, nowIndex]
  );

  const renderCenter = useMemo(() => {
    const context: CenterContext = {
      nowLabel: pullRequestNowLabel(nowIndex),
      yesterdaySoFar,
    };
    return (state: RadialCenterState) => (
      <MergedCenter context={context} state={state} />
    );
  }, [nowIndex, yesterdaySoFar]);

  return (
    <RadialChart
      data={data}
      nowIndex={nowIndex}
      series={mergedSeries}
      xDataKey="time"
    >
      <RadialAxis />
      <RadialLine
        dash
        dataKey="yesterday"
        maxValue={maxMerged}
        stroke="var(--muted-foreground)"
        strokeOpacity={0.7}
        strokeWidth={1.5}
      />
      <RadialLine
        dataKey="merged"
        enterDelay={0.15}
        maxValue={maxMerged}
        strokeWidth={2.25}
      />
      <RadialScrubber variant="gradient" />
      <RadialCenter>{renderCenter}</RadialCenter>
      <RadialLegend />
    </RadialChart>
  );
}

const code = `const series = [
  { dataKey: "merged", label: "Merged today", color: "var(--chart-1)" },
];

<RadialChart data={chartData} xDataKey="time" series={series}>
  <RadialAxis />
  {/* Not a series: drawn as a comparison line for the whole day */}
  <RadialLine
    dataKey="yesterday"
    dash
    stroke="var(--muted-foreground)"
    strokeOpacity={0.7}
    strokeWidth={1.5}
    maxValue={maxValue}
  />
  <RadialLine dataKey="merged" strokeWidth={2.25} maxValue={maxValue} />
  <RadialScrubber variant="gradient" />
  <RadialCenter>
    {({ datum, totals, label }) => (
      <ChartStatFlow
        value={datum ? (datum.merged ?? datum.yesterday) : totals.merged}
        label={datum ? \`merged at \${label}\` : \`merged by \${nowLabel}\`}
      />
    )}
  </RadialCenter>
  <RadialLegend />
</RadialChart>`;

const dataSnippet = `// 96 × 15-minute bins, clockwise from 00:00.
// Today's line runs up to the viewer's local time ("now"); yesterday closes the loop.
const chartData = [
  { time: "00:00", merged: 44, yesterday: 58 },
  // …
  { time: "14:15", merged: 846, yesterday: 870 }, // now
  { time: "14:30", merged: null, yesterday: 862 },
  // …
];

// End of the "now" bin, e.g. "14:30"
const nowIndex = chartData.findLastIndex((d) => d.merged !== null);
const nowLabel = chartData[nowIndex + 1]?.time ?? "24:00";

// Share one scale between the lines
const maxValue = Math.max(...chartData.map((d) => Math.max(d.merged ?? 0, d.yesterday)));`;

export const radialLineVariant: RadialGalleryVariant = {
  title: "Radial Chart - Line",
  description:
    "Smooth radial lines around a 24-hour clock: today's merged PRs drawn clockwise up to your local time, with yesterday dashed for the whole day",
  code,
  data: dataSnippet,
  footer:
    "Hover around the clock to compare today and yesterday at the same time of day.",
  render: () => <RadialLineExample />,
};
