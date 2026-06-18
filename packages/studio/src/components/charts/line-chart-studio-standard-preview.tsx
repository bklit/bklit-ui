"use client";

import {
  ChartBrush,
  ChartBrushLayout,
  ChartTooltip,
  Line,
  LineChart,
  XAxis,
} from "@bklitui/ui/charts";
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
import { StudioReferenceAreaLayer } from "@/components/charts/studio-reference-area-layer";
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
import { studioChartBrushProps } from "@/lib/studio-brush-props";
import {
  studioCartesianBackgroundLayer,
  studioCartesianGridLayer,
  studioCartesianSeriesLoadingProp,
  studioLoadingLabel,
  studioLoadingStrokeProps,
} from "@/lib/studio-cartesian-layers";
import { chartTooltipPropsFromState } from "@/lib/studio-chart-overlays";
import { isStudioComponentVisible } from "@/lib/studio-component-visibility";
import { studioCartesianLegendItems } from "@/lib/studio-legend-items";
import type { StudioUrlState } from "@/lib/studio-parsers";
import {
  getSeriesCurve,
  getSeriesFadeEdges,
  getSeriesShowHighlight,
  getSeriesStrokeWidth,
} from "@/lib/studio-series-line-props";

function renderBrushStripLines(
  state: StudioUrlState,
  options: {
    dataLength: number;
    seriesCount: number;
  }
) {
  return STUDIO_SERIES_KEYS.slice(0, options.seriesCount).map((key, idx) => {
    if (!isStudioComponentVisible(state, `line.series.${idx}`)) {
      return null;
    }

    return (
      <Line
        animate={false}
        curve={resolveCurve(getSeriesCurve(state, idx))}
        dataKey={key}
        fadeEdges={
          state.brushFadeEdges
            ? fadeEdgesPropValue(getSeriesFadeEdges(state, idx))
            : false
        }
        key={`brush-line-${key}`}
        showHighlight={false}
        stroke={idx === 0 ? undefined : STUDIO_SERIES_COLORS[idx]}
        strokeWidth={getSeriesStrokeWidth(state, idx)}
        yAxisId={getLineSeriesYAxisId(state, idx)}
        {...seriesStrokePropsFromState(state, options.dataLength, idx)}
      />
    );
  });
}

function renderMainLines(
  state: StudioUrlState,
  options: {
    dataLength: number;
    seriesCount: number;
  }
) {
  return STUDIO_SERIES_KEYS.slice(0, options.seriesCount).map((key, idx) => {
    if (!isStudioComponentVisible(state, `line.series.${idx}`)) {
      return null;
    }

    const isPrimary = idx === 0;

    return (
      <Line
        curve={resolveCurve(getSeriesCurve(state, idx))}
        dataKey={key}
        fadeEdges={fadeEdgesPropValue(getSeriesFadeEdges(state, idx))}
        key={`line-${key}`}
        loading={studioCartesianSeriesLoadingProp(isPrimary)}
        showHighlight={getSeriesShowHighlight(state, idx)}
        stroke={idx === 0 ? undefined : STUDIO_SERIES_COLORS[idx]}
        strokeWidth={getSeriesStrokeWidth(state, idx)}
        yAxisId={getLineSeriesYAxisId(state, idx)}
        {...seriesStrokePropsFromState(state, options.dataLength, idx)}
        {...(isPrimary
          ? studioLoadingStrokeProps(state, "line.loading-line")
          : {})}
      />
    );
  });
}

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
  const margin = timeSeriesChartMargin(state);
  const brushVisible =
    state.showBrush &&
    !isLoading &&
    isStudioComponentVisible(state, "line.brush");

  const brushStripMargin = useMemo(
    () => ({
      top: 4,
      right: margin.right,
      bottom: 4,
      left: margin.left,
    }),
    [margin.left, margin.right]
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
        <ChartBrushLayout
          brushStrip={(brushLayout) => (
            <LineChart
              animationDuration={0}
              className="size-full"
              data={data}
              margin={brushStripMargin}
              status="ready"
              style={{ aspectRatio: "unset", height: "100%" }}
            >
              {renderBrushStripLines(state, {
                dataLength: data.length,
                seriesCount,
              })}
              <ChartBrush
                {...studioChartBrushProps(state)}
                initialSelection={brushLayout.brushSelection ?? undefined}
                onSelectionChange={brushLayout.onBrushSelectionChange}
              />
            </LineChart>
          )}
          data={data}
          enabled={brushVisible}
          height={state.brushHeight}
        >
          {(brushLayout) => (
            <LineChart
              {...getStudioCssRevealPropsForPreview(state, ctx)}
              className="size-full"
              data={data}
              loadingLabel={studioLoadingLabel(state, "line.loading-label")}
              margin={margin}
              onPhaseChange={ctx.reportOgPhase}
              status={state.lineChartState}
              style={{ aspectRatio: "unset", height: "100%" }}
              tweenYDomainOnXDomainChange={brushVisible}
              xDomain={brushLayout.xDomain}
              xDomainSlotCount={brushLayout.xDomainSlotCount}
              yDomainTween
            >
              {studioCartesianBackgroundLayer(
                state,
                "line.background",
                "line.grid"
              )}
              {studioCartesianGridLayer(state, "line.grid")}
              <StudioReferenceAreaLayer
                componentId="line.reference-area"
                state={state}
              />
              {renderMainLines(state, {
                dataLength: data.length,
                seriesCount,
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
          )}
        </ChartBrushLayout>
      </StudioCartesianFill>
    </StudioChartShell>
  );
}
