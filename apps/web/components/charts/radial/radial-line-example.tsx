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
import { CenterCountDelta } from "@/components/charts/radial/center-delta";
import {
  PULL_REQUEST_NOW_INDEX,
  pullRequestDayData,
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

const todayRaw = pullRequestDayData
  .slice(0, PULL_REQUEST_NOW_INDEX + 1)
  .map((d) => d.merged ?? 0);
const todaySmooth = smooth(todayRaw, false);
const yesterdaySmooth = smooth(
  pullRequestDayData.map((d) => d.yesterdayMerged),
  true
);

const mergedDayData: MergedBin[] = pullRequestDayData.map((d, i) => ({
  time: d.time,
  merged: i <= PULL_REQUEST_NOW_INDEX ? (todaySmooth[i] ?? 0) : null,
  yesterday: yesterdaySmooth[i] ?? 0,
}));

/** Shared by both lines so today and yesterday use one scale. */
const maxMerged = Math.max(
  ...mergedDayData.map((d) => Math.max(d.merged ?? 0, d.yesterday))
);

const mergedSeries: RadialSeries[] = [
  { dataKey: "merged", label: "Merged today", color: "var(--chart-1)" },
];

const yesterdaySoFar = mergedDayData
  .slice(0, PULL_REQUEST_NOW_INDEX + 1)
  .reduce((total, d) => total + d.yesterday, 0);

// ---------------------------------------------------------------------------
// Center
// ---------------------------------------------------------------------------

/** End of the "now" bin, e.g. "14:30" — today's line runs up to here. */
const nowLabel = mergedDayData[PULL_REQUEST_NOW_INDEX + 1]?.time ?? "now";

function centerStat({ datum, isFuture, label, totals }: RadialCenterState) {
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

function renderMergedCenter(state: RadialCenterState) {
  const { value, caption, delta } = centerStat(state);
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
  return (
    <RadialChart
      data={mergedDayData}
      nowIndex={PULL_REQUEST_NOW_INDEX}
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
      <RadialCenter>{renderMergedCenter}</RadialCenter>
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
        label={datum ? \`merged at \${label}\` : "merged by 14:30"}
      />
    )}
  </RadialCenter>
  <RadialLegend />
</RadialChart>`;

const dataSnippet = `// 96 × 15-minute bins, clockwise from 00:00.
// Today's line ends at "now"; yesterday closes the loop.
const chartData = [
  { time: "00:00", merged: 44, yesterday: 58 },
  // …
  { time: "14:15", merged: 846, yesterday: 870 },
  { time: "14:30", merged: null, yesterday: 862 },
  // …
];

// Share one scale between the lines
const maxValue = Math.max(...chartData.map((d) => Math.max(d.merged ?? 0, d.yesterday)));`;

export const radialLineVariant: RadialGalleryVariant = {
  title: "Radial Chart - Line",
  description:
    "Smooth radial lines around a 24-hour clock: today's merged PRs drawn clockwise up to now, with yesterday dashed for the whole day",
  code,
  data: dataSnippet,
  footer:
    "Hover around the clock to compare today and yesterday at the same time of day.",
  render: () => <RadialLineExample />,
};
