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
  type RadialSeries,
} from "@bklitui/ui/charts";
import { memo, useCallback, useMemo } from "react";
import {
  StudioRadialCenter,
  studioRadialSize,
} from "@/components/charts/studio-chart-layout";
import { StudioChartShell } from "@/components/charts/studio-chart-shell";
import { studioPreviewChartKey } from "@/lib/chart-animation";
import {
  PULL_REQUEST_SPIKE_INDEX,
  type PullRequestBin,
  pullRequestBinEndLabel,
  pullRequestSeries,
  usePullRequestDay,
} from "@/lib/radial-demo-data";
import type { StudioRenderContext } from "@/lib/render-context";
import { useStudioChartContentFrame } from "@/lib/studio-chart-content-frame";
import { isStudioComponentVisible } from "@/lib/studio-component-visibility";
import type { StudioUrlState } from "@/lib/studio-parsers";
import { studioPreviewColorState } from "@/lib/studio-preview-state";
import {
  getEffectiveSeriesColor,
  getSeriesPattern,
} from "@/lib/studio-series-design";

/** Room under the clock for the inline RadialLegend row. */
const LEGEND_HEIGHT = 36;

const countFormat = { maximumFractionDigits: 0 };
const deltaFormat = new Intl.NumberFormat("en-US", countFormat);

/** Today so far: caption end time and yesterday's merged PRs over the same bins. */
interface DaySoFar {
  nowLabel: string;
  yesterdayMergedSoFar: number;
}

function centerStat(
  { datum, isFuture, label, totals, values }: RadialCenterState,
  { nowLabel, yesterdayMergedSoFar }: DaySoFar
) {
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

function deltaColor(delta: number) {
  if (delta > 0) {
    return "var(--chart-positive)";
  }
  if (delta < 0) {
    return "var(--chart-negative)";
  }
  return "var(--muted-foreground)";
}

function renderCenter(state: RadialCenterState, soFar: DaySoFar) {
  const { value, caption, delta } = centerStat(state, soFar);
  const rounded = Math.round(delta ?? 0);
  return (
    <>
      <ChartStatFlow
        formatOptions={countFormat}
        label={caption}
        labelClassName="mt-[4cqw] text-muted-foreground text-[clamp(0.625rem,7cqw,1.125rem)]"
        value={value}
        valueClassName="font-bold leading-none tracking-tight text-[clamp(1.25rem,17cqw,2.75rem)]"
      />
      <span
        className="mt-[2cqw] text-[clamp(0.5625rem,6.5cqw,1.125rem)] text-muted-foreground tabular-nums"
        style={{ visibility: delta === null ? "hidden" : undefined }}
      >
        <span className="font-semibold" style={{ color: deltaColor(rounded) }}>
          {rounded === 0
            ? "±0"
            : `${rounded < 0 ? "−" : "+"}${deltaFormat.format(Math.abs(rounded))}`}
        </span>{" "}
        vs yesterday
      </span>
    </>
  );
}

/** Spike callout takes the draft series color (index 2); hidden until it happens. */
function spikeAnnotations(series: RadialSeries[], nowIndex: number) {
  if (PULL_REQUEST_SPIKE_INDEX > nowIndex) {
    return [];
  }
  return [
    {
      index: PULL_REQUEST_SPIKE_INDEX,
      label: "02:14",
      color: series[2]?.color ?? "var(--chart-3)",
    },
  ];
}

const RadialChartBody = memo(function RadialChartBody({
  state,
  ctx,
}: {
  state: StudioUrlState;
  ctx: StudioRenderContext;
}) {
  const contentFrame = useStudioChartContentFrame(ctx.frame);
  const colorState = studioPreviewColorState(state, ctx);
  const showLegend =
    state.showLegend && isStudioComponentVisible(state, "radial.legend");
  const size = studioRadialSize(
    {
      width: contentFrame.width,
      height: contentFrame.height - (showLegend ? LEGEND_HEIGHT : 0),
    },
    state.radialSize
  );

  const series = useMemo(
    () =>
      pullRequestSeries.map((s, index) => ({
        ...s,
        color: getEffectiveSeriesColor(colorState, index),
      })),
    [colorState]
  );
  const visibleSeries = useMemo(
    () =>
      series.filter((_, index) =>
        isStudioComponentVisible(state, `radial.series.${index}`)
      ),
    [series, state]
  );
  const patterns = useMemo(() => {
    const entries = pullRequestSeries.flatMap((s, index) => {
      const preset = getSeriesPattern(colorState, index);
      return preset === "none" ? [] : [[s.dataKey, preset] as const];
    });
    return entries.length > 0 ? Object.fromEntries(entries) : undefined;
  }, [colorState]);
  const { data, nowIndex } = usePullRequestDay();
  const soFar = useMemo<DaySoFar>(
    () => ({
      nowLabel: pullRequestBinEndLabel(nowIndex),
      yesterdayMergedSoFar: data
        .slice(0, nowIndex + 1)
        .reduce((total, d) => total + d.yesterdayMerged, 0),
    }),
    [data, nowIndex]
  );
  const center = useCallback(
    (centerState: RadialCenterState) => renderCenter(centerState, soFar),
    [soFar]
  );
  const annotations = useMemo(
    () => spikeAnnotations(series, nowIndex),
    [series, nowIndex]
  );

  return (
    <StudioRadialCenter frame={contentFrame}>
      <div style={{ width: size }}>
        <RadialChart
          data={data}
          key={studioPreviewChartKey(ctx)}
          maxWidth={size}
          series={visibleSeries}
          xDataKey="time"
        >
          {isStudioComponentVisible(state, "radial.axis") ? (
            <RadialAxis
              centerGradient={state.radialCenterGradient}
              showCircle={state.radialAxisCircle}
            />
          ) : null}
          {isStudioComponentVisible(state, "radial.dotBar") ? (
            <RadialDotBar
              annotations={state.radialAnnotations ? annotations : undefined}
              dotSize={state.radialDotSize}
              fadedOpacity={state.radialFadedOpacity}
              ghostDataKey={state.radialGhost ? "yesterday" : undefined}
              layout={state.radialDotLayout}
              patterns={patterns}
              rows={state.radialRows}
            />
          ) : null}
          {isStudioComponentVisible(state, "radial.scrubber") ? (
            <RadialScrubber variant={state.radialScrubberVariant} />
          ) : null}
          {isStudioComponentVisible(state, "radial.center") ? (
            <RadialCenter>{center}</RadialCenter>
          ) : null}
          {showLegend ? (
            <RadialLegend showValues={state.radialLegendValues} />
          ) : null}
        </RadialChart>
      </div>
    </StudioRadialCenter>
  );
});

/**
 * Studio preview for the radial chart — the featured docs example (pull
 * requests per 15-minute bin, dot bars with yesterday ghosted). The legend is
 * the chart's own `RadialLegend` (it isolates series on hover), so the shell's
 * `ChartLegend` slot stays empty.
 */
export function RadialStudioPreview({
  state,
  ctx,
}: {
  state: StudioUrlState;
  ctx: StudioRenderContext;
}) {
  return (
    <StudioChartShell legendComponentId="radial.legend" state={ctx.chromeState}>
      <RadialChartBody ctx={ctx} state={state} />
    </StudioChartShell>
  );
}
