"use client";

import { ChartTooltip, Line, LineChart, XAxis } from "@bklitui/ui/charts";
import { useMemo } from "react";
import { StudioCartesianFill } from "@/components/charts/studio-chart-layout";
import {
  StudioChartShell,
  StudioVisibleLayer,
} from "@/components/charts/studio-chart-shell";
import {
  StudioChartYAxisLayers,
  timeSeriesChartMargin,
} from "@/components/charts/studio-chart-y-axis";
import { fadeEdgesPropValue } from "@/components/controls/fade-edges-picker";
import { getStudioCssRevealPropsForPreview } from "@/lib/chart-animation";
import { resolveCurve } from "@/lib/curves";
import {
  clampStudioSeriesCount,
  generateStudioCartesianData,
  STUDIO_SERIES_COLORS,
  STUDIO_SERIES_KEYS,
} from "@/lib/demo-data";
import { getLineSeriesYAxisId } from "@/lib/line-series-y-axis";
import type { StudioRenderContext } from "@/lib/render-context";
import { seriesStrokePropsFromState } from "@/lib/series-stroke-props";
import {
  studioCartesianGridLayer,
  studioCartesianSeriesLoadingProp,
  studioLoadingLabel,
  studioLoadingStrokeProps,
} from "@/lib/studio-cartesian-layers";
import { chartTooltipPropsFromState } from "@/lib/studio-chart-overlays";
import { isStudioComponentVisible } from "@/lib/studio-component-visibility";
import { studioCartesianLegendItems } from "@/lib/studio-legend-items";
import type { StudioUrlState } from "@/lib/studio-parsers";

export function LineChartStudioStandardPreview({
  state,
  ctx,
}: {
  state: StudioUrlState;
  ctx: StudioRenderContext;
}) {
  const isLoading = state.lineChartState === "loading";
  const seriesCount = clampStudioSeriesCount(state.dataSeries);
  const data = useMemo(
    () =>
      generateStudioCartesianData({
        seriesCount,
        pointCount: state.dataPoints,
        xAxis: "date",
        seed: ctx.dataSeed,
      }),
    [ctx.dataSeed, seriesCount, state.dataPoints]
  );
  const seriesStroke = useMemo(
    () => seriesStrokePropsFromState(state, data.length),
    [data.length, state]
  );

  return (
    <StudioChartShell
      legendComponentId="line.legend"
      legendItems={
        isLoading ? [] : studioCartesianLegendItems(state, seriesCount)
      }
      state={ctx.chromeState}
    >
      <StudioCartesianFill>
        <LineChart
          {...getStudioCssRevealPropsForPreview(state, ctx)}
          className="size-full"
          data={data}
          loadingLabel={studioLoadingLabel(state, "line.loading-label")}
          margin={timeSeriesChartMargin(state)}
          status={state.lineChartState}
          yDomainTween
        >
          {studioCartesianGridLayer(state, "line.grid")}
          {STUDIO_SERIES_KEYS.slice(0, seriesCount).map((key, idx) => {
            if (!isStudioComponentVisible(state, `line.series.${idx}`)) {
              return null;
            }

            const isPrimary = idx === 0;

            return (
              <Line
                curve={resolveCurve(state.curve)}
                dataKey={key}
                fadeEdges={fadeEdgesPropValue(state.fadeEdges)}
                key={key}
                loading={studioCartesianSeriesLoadingProp(isPrimary)}
                showHighlight={state.showHighlight}
                stroke={idx === 0 ? undefined : STUDIO_SERIES_COLORS[idx]}
                strokeWidth={state.strokeWidth}
                yAxisId={getLineSeriesYAxisId(state, idx)}
                {...seriesStroke}
                {...(isPrimary
                  ? studioLoadingStrokeProps(state, "line.loading-line")
                  : {})}
              />
            );
          })}
          {isLoading ? null : (
            <>
              <StudioChartYAxisLayers chartPrefix="line" state={state} />
              <StudioVisibleLayer componentId="line.xaxis" state={state}>
                <XAxis />
              </StudioVisibleLayer>
              <StudioVisibleLayer componentId="line.tooltip" state={state}>
                <ChartTooltip {...chartTooltipPropsFromState(state)} />
              </StudioVisibleLayer>
            </>
          )}
        </LineChart>
      </StudioCartesianFill>
    </StudioChartShell>
  );
}
