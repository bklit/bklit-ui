"use client";

import {
  ChartBrush,
  ChartBrushLayout,
  ChartTooltip,
  Line,
  LineChart,
  LineSeriesTerminalMarker,
  ProjectionLine,
  ProjectionLineEndMarker,
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
  generateStudioTrendingData,
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
  buildStudioProjectionPath,
  getProjectionCount,
  getProjectionCurve,
  getProjectionDashArray,
  getProjectionEndMarkerStroke,
  getProjectionSeriesIndex,
  getProjectionShowEndpoints,
  getProjectionStroke,
  getProjectionStrokeGradientEnd,
  getProjectionStrokeGradientStart,
  getProjectionStrokeStyle,
  getProjectionStrokeWidth,
  getSeriesIndicesWithVisibleProjections,
  isLineChartBrushAvailable,
  studioBrushXExtentMax,
} from "@/lib/studio-projection-props";
import { getEffectiveSeriesColor } from "@/lib/studio-series-design";
import {
  getSeriesCurve,
  getSeriesFadeEdges,
  getSeriesShowHighlight,
  getSeriesStrokeWidth,
  getSeriesTerminalMarkerFill,
  getSeriesTerminalMarkerRingColor,
  getSeriesTerminalMarkerRingGap,
  getSeriesTerminalMarkerShow,
} from "@/lib/studio-series-line-props";

function renderBrushStripProjections(
  state: StudioUrlState,
  sourceData: Record<string, unknown>[],
  projectionCount: number
) {
  return Array.from({ length: projectionCount }, (_, index) => {
    const componentId = `line.projection.${index}`;
    if (!isStudioComponentVisible(state, componentId)) {
      return null;
    }

    const path = buildStudioProjectionPath(state, index, sourceData);
    if (path.length < 2) {
      return null;
    }

    const seriesIndex = getProjectionSeriesIndex(state, index);
    const strokeStyle = getProjectionStrokeStyle(state, index);

    return (
      <ProjectionLine
        curveKind={getProjectionCurve(state, index)}
        data={path}
        key={componentId}
        showEndMarker={false}
        stroke={getProjectionStroke(state, index)}
        strokeDasharray={getProjectionDashArray(state, index)}
        strokeStyle={strokeStyle}
        strokeWidth={getProjectionStrokeWidth(state, index)}
        yAxisId={getLineSeriesYAxisId(state, seriesIndex)}
      />
    );
  });
}

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
        stroke={getEffectiveSeriesColor(state, idx)}
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
        stroke={getEffectiveSeriesColor(state, idx)}
        strokeWidth={getSeriesStrokeWidth(state, idx)}
        yAxisId={getLineSeriesYAxisId(state, idx)}
        {...seriesStrokePropsFromState(state, options.dataLength, idx)}
        {...(isPrimary
          ? {
              ...studioLoadingStrokeProps(state, "line.loading-line"),
              loadingStyle: state.loadingStyle,
            }
          : {})}
      />
    );
  });
}

function renderProjectionTerminalMarkers(
  state: StudioUrlState,
  projectionCount: number
) {
  if (projectionCount === 0) {
    return null;
  }

  return getSeriesIndicesWithVisibleProjections(state).map((seriesIndex) => {
    const seriesKey = STUDIO_SERIES_KEYS[seriesIndex];
    if (!seriesKey) {
      return null;
    }
    if (!isStudioComponentVisible(state, `line.series.${seriesIndex}`)) {
      return null;
    }
    if (!getSeriesTerminalMarkerShow(state, seriesIndex)) {
      return null;
    }

    return (
      <LineSeriesTerminalMarker
        dataKey={seriesKey}
        fill={getSeriesTerminalMarkerFill(state, seriesIndex)}
        key={`line-terminal-marker-${seriesIndex}`}
        ringGap={getSeriesTerminalMarkerRingGap(state, seriesIndex)}
        stroke={getSeriesTerminalMarkerRingColor(state, seriesIndex)}
        yAxisId={getLineSeriesYAxisId(state, seriesIndex)}
      />
    );
  });
}

function renderProjectionLayers(
  state: StudioUrlState,
  sourceData: Record<string, unknown>[],
  projectionCount: number
) {
  return Array.from({ length: projectionCount }, (_, index) => {
    const componentId = `line.projection.${index}`;
    if (!isStudioComponentVisible(state, componentId)) {
      return null;
    }

    const path = buildStudioProjectionPath(state, index, sourceData);
    if (path.length < 2) {
      return null;
    }

    const showEndMarker = getProjectionShowEndpoints(state, index);
    const stroke = getProjectionStroke(state, index);
    const strokeStyle = getProjectionStrokeStyle(state, index);
    const seriesIndex = getProjectionSeriesIndex(state, index);

    return [
      <StudioVisibleLayer
        componentId={componentId}
        key={componentId}
        state={state}
      >
        <ProjectionLine
          curveKind={getProjectionCurve(state, index)}
          data={path}
          gradientEnd={getProjectionStrokeGradientEnd(state, index)}
          gradientStart={getProjectionStrokeGradientStart(state, index)}
          showEndMarker={false}
          stroke={stroke}
          strokeDasharray={getProjectionDashArray(state, index)}
          strokeStyle={strokeStyle}
          strokeWidth={getProjectionStrokeWidth(state, index)}
          yAxisId={getLineSeriesYAxisId(state, seriesIndex)}
        />
      </StudioVisibleLayer>,
      showEndMarker ? (
        <StudioVisibleLayer
          componentId={componentId}
          key={`${componentId}-end`}
          state={state}
        >
          <ProjectionLineEndMarker
            data={path}
            stroke={getProjectionEndMarkerStroke(state, index)}
            yAxisId={getLineSeriesYAxisId(state, seriesIndex)}
          />
        </StudioVisibleLayer>
      ) : null,
    ];
  })
    .flat()
    .filter(Boolean);
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
  const projectionCount = getProjectionCount(state);
  const data = useMemo(
    () =>
      projectionCount > 0
        ? generateStudioTrendingData({
            direction: state.lineDataTrend,
            seriesCount,
            pointCount: state.dataPoints,
            xAxis: "date",
          })
        : generateStudioCartesianData({
            seriesCount,
            pointCount: state.dataPoints,
            xAxis: "date",
            seed: ctx.dataSeed,
          }),
    [
      ctx.dataSeed,
      projectionCount,
      seriesCount,
      state.dataPoints,
      state.lineDataTrend,
    ]
  );
  const brushXExtentMax = useMemo(
    () => studioBrushXExtentMax(state, data, projectionCount),
    [state, data, projectionCount]
  );
  const margin = timeSeriesChartMargin(state);
  const brushVisible =
    isLineChartBrushAvailable(state) &&
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
        isLoading
          ? []
          : studioCartesianLegendItems(state, seriesCount, undefined, "line")
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
              {renderBrushStripProjections(state, data, projectionCount)}
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
          xExtentMax={brushXExtentMax}
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
              {isLoading
                ? null
                : renderProjectionLayers(state, data, projectionCount)}
              {isLoading
                ? null
                : renderProjectionTerminalMarkers(state, projectionCount)}
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
