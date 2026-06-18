"use client";

import {
  Area,
  AreaChart,
  ChartBrush,
  ChartBrushLayout,
  ChartTooltip,
  PatternArea,
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
import { studioAreaLegendItems } from "@/lib/studio-legend-items";
import type { StudioUrlState } from "@/lib/studio-parsers";
import { getSeriesFillMode } from "@/lib/studio-series-design";
import {
  getSeriesCurve,
  getSeriesFadeEdges,
  getSeriesShowHighlight,
  getSeriesShowLine,
  getSeriesStrokeWidth,
} from "@/lib/studio-series-line-props";

function renderBrushStripAreas(
  state: StudioUrlState,
  ctx: StudioRenderContext,
  options: {
    dataLength: number;
    seriesCount: number;
  }
) {
  return STUDIO_SERIES_KEYS.slice(0, options.seriesCount).flatMap(
    (key, idx) => {
      if (!isStudioComponentVisible(state, `area.series.${idx}`)) {
        return [];
      }

      const patternFill =
        getSeriesFillMode(state, idx) === "pattern"
          ? ctx.patternFillAt(idx)
          : undefined;
      const fill = patternFill ?? `var(--chart-${(idx % 5) + 1})`;
      const curve = resolveCurve(getSeriesCurve(state, idx));

      const area = (
        <Area
          animate={false}
          curve={curve}
          dataKey={key}
          fadeEdges={
            patternFill || !state.brushFadeEdges
              ? false
              : fadeEdgesPropValue(getSeriesFadeEdges(state, idx))
          }
          fill={fill}
          fillOpacity={state.brushAreaOpacity}
          gradientSpan={state.brushGradientSpan}
          gradientToOpacity={state.brushGradientToOpacity}
          key={`brush-area-${key}`}
          showHighlight={false}
          showLine={getSeriesShowLine(state, idx)}
          stroke={idx === 0 ? undefined : STUDIO_SERIES_COLORS[idx]}
          strokeWidth={getSeriesStrokeWidth(state, idx)}
          yAxisId={getLineSeriesYAxisId(state, idx)}
          {...seriesStrokePropsFromState(state, options.dataLength, idx)}
        />
      );

      if (patternFill) {
        return [
          <PatternArea
            animate={false}
            curve={curve}
            dataKey={key}
            fill={patternFill}
            key={`brush-pattern-${key}`}
          />,
          area,
        ];
      }

      return [area];
    }
  );
}

function renderMainAreas(
  state: StudioUrlState,
  ctx: StudioRenderContext,
  options: {
    dataLength: number;
    isLoading: boolean;
    seriesCount: number;
  }
) {
  return STUDIO_SERIES_KEYS.slice(0, options.seriesCount).flatMap(
    (key, idx) => {
      if (!isStudioComponentVisible(state, `area.series.${idx}`)) {
        return [];
      }

      const isPrimary = idx === 0;
      const patternFill =
        getSeriesFillMode(state, idx) === "pattern"
          ? ctx.patternFillAt(idx)
          : undefined;
      const fill = patternFill ?? `var(--chart-${(idx % 5) + 1})`;
      const curve = resolveCurve(getSeriesCurve(state, idx));

      const area = (
        <Area
          curve={curve}
          dataKey={key}
          fadeEdges={
            patternFill
              ? false
              : fadeEdgesPropValue(getSeriesFadeEdges(state, idx))
          }
          fill={fill}
          fillOpacity={state.fillOpacity}
          gradientToOpacity={state.gradientToOpacity}
          key={`area-${key}`}
          loading={studioCartesianSeriesLoadingProp(isPrimary)}
          showHighlight={getSeriesShowHighlight(state, idx)}
          showLine={getSeriesShowLine(state, idx)}
          stroke={idx === 0 ? undefined : STUDIO_SERIES_COLORS[idx]}
          strokeWidth={getSeriesStrokeWidth(state, idx)}
          yAxisId={getLineSeriesYAxisId(state, idx)}
          {...seriesStrokePropsFromState(state, options.dataLength, idx)}
          {...(isPrimary
            ? studioLoadingStrokeProps(state, "area.loading-line")
            : {})}
        />
      );

      if (!options.isLoading && patternFill) {
        return [
          <PatternArea
            curve={curve}
            dataKey={key}
            fill={patternFill}
            key={`pattern-${key}`}
          />,
          area,
        ];
      }

      return [area];
    }
  );
}

export function AreaStudioPreview({
  state,
  ctx,
}: {
  state: StudioUrlState;
  ctx: StudioRenderContext;
}) {
  const isLoading = state.areaChartState === "loading";
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
    isStudioComponentVisible(state, "area.brush");

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
      legendComponentId="area.legend"
      legendItems={isLoading ? [] : studioAreaLegendItems(state)}
      state={ctx.chromeState}
    >
      <StudioCartesianFill>
        <ChartBrushLayout
          brushStrip={(brushLayout) => (
            <AreaChart
              animationDuration={0}
              className="size-full"
              data={data}
              margin={brushStripMargin}
              status="ready"
              style={{ aspectRatio: "unset", height: "100%" }}
            >
              {ctx.patternDefs}
              {renderBrushStripAreas(state, ctx, {
                dataLength: data.length,
                seriesCount,
              })}
              <ChartBrush
                {...studioChartBrushProps(state)}
                initialSelection={brushLayout.brushSelection ?? undefined}
                onSelectionChange={brushLayout.onBrushSelectionChange}
              />
            </AreaChart>
          )}
          data={data}
          enabled={brushVisible}
          height={state.brushHeight}
        >
          {(brushLayout) => (
            <AreaChart
              {...getStudioCssRevealPropsForPreview(state, ctx)}
              className="size-full"
              data={data}
              loadingLabel={studioLoadingLabel(state, "area.loading-label")}
              margin={margin}
              onPhaseChange={ctx.reportOgPhase}
              status={state.areaChartState}
              style={{ aspectRatio: "unset", height: "100%" }}
              tweenYDomainOnXDomainChange={brushVisible}
              xDomain={brushLayout.xDomain}
              xDomainSlotCount={brushLayout.xDomainSlotCount}
              yDomainTween
            >
              {studioCartesianBackgroundLayer(
                state,
                "area.background",
                "area.grid"
              )}
              {studioCartesianGridLayer(state, "area.grid")}
              <StudioReferenceAreaLayer
                componentId="area.reference-area"
                state={state}
              />
              {ctx.patternDefs}
              {renderMainAreas(state, ctx, {
                dataLength: data.length,
                isLoading,
                seriesCount,
              })}
              {isLoading ? null : (
                <>
                  <StudioChartYAxisLayers chartPrefix="area" state={state} />
                  <StudioVisibleLayer componentId="area.xaxis" state={state}>
                    <XAxis />
                  </StudioVisibleLayer>
                  <StudioVisibleLayer componentId="area.tooltip" state={state}>
                    <ChartTooltip {...chartTooltipPropsFromState(state)} />
                  </StudioVisibleLayer>
                </>
              )}
            </AreaChart>
          )}
        </ChartBrushLayout>
      </StudioCartesianFill>
    </StudioChartShell>
  );
}
