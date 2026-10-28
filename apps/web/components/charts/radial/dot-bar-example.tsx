"use client";

import {
  ChartStatFlow,
  RadialAxis,
  RadialCenter,
  type RadialCenterState,
  RadialChart,
  RadialDotBar,
  RadialLegend,
  RadialScrubber,
} from "@bklitui/ui/charts";
import { CenterCountDelta } from "@/components/charts/radial/center-delta";
import {
  PULL_REQUEST_NOW_INDEX,
  PULL_REQUEST_SPIKE_INDEX,
  type PullRequestBin,
  pullRequestDayData,
  pullRequestSeries,
} from "@/components/charts/radial/pull-request-day-data";
import type { RadialGalleryVariant } from "@/components/charts/radial/types";

/** The spike annotation labels the draft burst, so it takes the draft color. */
const DRAFT_COLOR =
  pullRequestSeries.find((s) => s.dataKey === "draft")?.color ??
  "var(--chart-3)";

// ---------------------------------------------------------------------------
// Center — merged PRs (a count) and the change vs yesterday at the same time
// ---------------------------------------------------------------------------

const liveBins = pullRequestDayData.slice(0, PULL_REQUEST_NOW_INDEX + 1);

/** Yesterday's merged PRs over the same bins that have data today. */
const yesterdayMergedSoFar = liveBins.reduce(
  (total, d) => total + d.yesterdayMerged,
  0
);

/** End of the "now" bin, e.g. "14:30" — today's totals run up to here. */
const nowLabel = pullRequestDayData[PULL_REQUEST_NOW_INDEX + 1]?.time ?? "now";

function centerStat({
  datum,
  isFuture,
  label,
  totals,
  values,
}: RadialCenterState) {
  const bin = datum as PullRequestBin | null;
  if (!bin) {
    const merged = totals.merged ?? 0;
    return {
      value: merged,
      caption: `merged by ${nowLabel}`,
      delta: merged - yesterdayMergedSoFar,
    };
  }
  if (isFuture) {
    return {
      value: bin.yesterdayMerged,
      caption: `merged at ${label} yesterday`,
      delta: null,
    };
  }
  const merged = values.merged ?? 0;
  return {
    value: merged,
    caption: `merged at ${label}`,
    delta: merged - bin.yesterdayMerged,
  };
}

const countFormat = { maximumFractionDigits: 0 };

function renderPullRequestCenter(state: RadialCenterState) {
  const { value, caption, delta } = centerStat(state);
  return (
    <>
      <ChartStatFlow
        formatOptions={countFormat}
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

export function RadialDotBarExample({
  animate = true,
  legend = true,
}: {
  /** Enter animations (off for static previews, e.g. the docs sidebar card) */
  animate?: boolean;
  legend?: boolean;
}) {
  return (
    <RadialChart
      animate={animate}
      data={pullRequestDayData}
      series={pullRequestSeries}
      xDataKey="time"
    >
      <RadialAxis centerGradient />
      <RadialDotBar
        annotations={[
          {
            index: PULL_REQUEST_SPIKE_INDEX,
            label: "02:14",
            color: DRAFT_COLOR,
          },
        ]}
        ghostDataKey="yesterday"
      />
      <RadialScrubber />
      <RadialCenter>{renderPullRequestCenter}</RadialCenter>
      {legend ? <RadialLegend /> : null}
    </RadialChart>
  );
}

const code = `const series = [
  { dataKey: "merged", label: "Merged", color: "var(--chart-1)", rampFrom: 0.4 },
  { dataKey: "ready", label: "Ready for merge", color: "var(--chart-2)" },
  { dataKey: "draft", label: "Draft", color: "var(--chart-3)", emphasize: true },
];

<RadialChart data={chartData} xDataKey="time" series={series}>
  <RadialAxis centerGradient />
  <RadialDotBar
    ghostDataKey="yesterday"
    annotations={[{ index: 8, label: "02:14", color: "var(--chart-3)" }]}
  />
  <RadialScrubber />
  <RadialCenter>
    {({ datum, isFuture, totals, values, label }) => {
      // Today vs yesterday over the same bins: a count, not a rate
      let merged = totals.merged;
      let delta = merged - yesterdayMergedSoFar;
      let caption = "merged by 14:30";
      if (datum) {
        merged = isFuture ? datum.yesterdayMerged : values.merged;
        delta = isFuture ? null : merged - datum.yesterdayMerged;
        caption = isFuture ? \`merged at \${label} yesterday\` : \`merged at \${label}\`;
      }
      return (
        <>
          <ChartStatFlow value={merged} label={caption} />
          {delta !== null && (
            <span style={{ color: delta < 0 ? "var(--chart-negative)" : "var(--chart-positive)" }}>
              {delta < 0 ? "−" : "+"}
              {Math.abs(delta).toLocaleString()} vs yesterday
            </span>
          )}
        </>
      );
    }}
  </RadialCenter>
  <RadialLegend />
</RadialChart>`;

const dataSnippet = `// 96 × 15-minute bins, clockwise from 00:00.
// Bins after "now" have null counts and are drawn as ghost dots from \`yesterday\`.
const chartData = [
  { time: "00:00", merged: 29, ready: 0, draft: 0, yesterday: 29, yesterdayMerged: 28 },
  // …
  { time: "02:00", merged: 47, ready: 0, draft: 720, yesterday: 86, yesterdayMerged: 83 },
  // …
  { time: "14:15", merged: 778, ready: 60, draft: 0, yesterday: 881, yesterdayMerged: 848 },
  { time: "14:30", merged: null, ready: null, draft: null, yesterday: 804, yesterdayMerged: 778 },
  // …
];

// Yesterday's merged PRs over the bins that have data today (00:00–14:30)
const yesterdayMergedSoFar = chartData
  .filter((d) => d.merged !== null)
  .reduce((total, d) => total + d.yesterdayMerged, 0);`;

export const radialDotBarVariant: RadialGalleryVariant = {
  title: "Radial Chart - Dot Bars",
  description:
    "24-hour clock of stacked dot columns per 15-minute bin, with yesterday ghosted for the rest of the day and a scrubber that follows the pointer",
  code,
  data: dataSnippet,
  footer:
    "The center counts merged PRs and compares them with yesterday over the same window; hover a bin for that 15 minutes. Hover the legend to isolate a series.",
  render: () => <RadialDotBarExample />,
};
