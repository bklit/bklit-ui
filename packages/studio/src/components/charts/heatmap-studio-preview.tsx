"use client";

import {
  HEATMAP_WEEKS_ONE_YEAR,
  HeatmapCells,
  HeatmapChart,
  HeatmapInteractionBoundary,
  HeatmapInteractionProvider,
  HeatmapLegend,
  HeatmapSeparator,
  HeatmapTooltip,
  type HeatmapWeekStartDay,
  HeatmapXAxis,
  HeatmapYAxis,
} from "@bklitui/ui/charts";
import { memo, useMemo } from "react";
import { StudioCartesianFill } from "@/components/charts/studio-chart-layout";
import {
  StudioChartShell,
  StudioVisibleLayer,
} from "@/components/charts/studio-chart-shell";
import {
  getStudioCssRevealPropsForPreview,
  studioEnterStaggerScale,
  studioPreviewChartKey,
} from "@/lib/chart-animation";
import { getHeatmapData } from "@/lib/demo-data";
import { studioHeatmapLevelStyles } from "@/lib/heatmap-studio-colors";
import {
  HEATMAP_STUDIO_SEPARATOR_SPACING,
  HEATMAP_STUDIO_SEPARATOR_START_OFFSET,
  studioHeatmapSeparatorVisualProps,
} from "@/lib/heatmap-studio-props";
import type { StudioRenderContext } from "@/lib/render-context";
import {
  studioHeatmapLoadingCellsVisible,
  studioHeatmapLoadingLabel,
  studioHeatmapLoadingOpacity,
  studioLegendWrapperStyle,
  studioTooltipPanelStyle,
} from "@/lib/studio-chart-overlays";
import { isStudioComponentVisible } from "@/lib/studio-component-visibility";
import type { StudioUrlState } from "@/lib/studio-parsers";

function studioHeatmapCellsMounted(state: StudioUrlState): boolean {
  return (
    isStudioComponentVisible(state, "heatmap.cells") ||
    (state.heatmapChartState === "loading" &&
      studioHeatmapLoadingCellsVisible(state))
  );
}

const HeatmapChartBody = memo(function HeatmapChartBody({
  state,
  ctx,
  data,
}: {
  state: StudioUrlState;
  ctx: StudioRenderContext;
  data: ReturnType<typeof getHeatmapData>;
}) {
  const motionProps = useMemo(
    () => getStudioCssRevealPropsForPreview(state, ctx),
    [ctx, state]
  );
  const mountCells = studioHeatmapCellsMounted(state);
  const loadingCellsVisible = studioHeatmapLoadingCellsVisible(state);
  const levelStyles = useMemo(() => studioHeatmapLevelStyles(state), [state]);
  const separatorVisual = studioHeatmapSeparatorVisualProps(state);

  return (
    <HeatmapChart
      className="w-full min-w-full"
      data={data}
      enterStaggerScale={studioEnterStaggerScale(state)}
      gap={state.heatmapGap}
      key={studioPreviewChartKey(ctx)}
      layout="fluid"
      levelStyles={levelStyles}
      loadingCellMaxOpacity={state.heatmapLoadingCellMaxOpacity}
      loadingCellRandomness={state.heatmapLoadingCellRandomness}
      loadingLabel={studioHeatmapLoadingLabel(state)}
      loadingOpacity={studioHeatmapLoadingOpacity(state)}
      showLoadingCells={loadingCellsVisible}
      status={state.heatmapChartState}
      weekStartDay={Number(state.heatmapWeekStartDay) as HeatmapWeekStartDay}
      {...motionProps}
    >
      {mountCells ? (
        <HeatmapCells
          cornerRadius={state.heatmapCornerRadius}
          inactiveOpacity={state.heatmapCellsInactiveOpacity}
          inactiveScale={state.heatmapCellsInactiveScale}
        />
      ) : null}
      <StudioVisibleLayer componentId="heatmap.xaxis" state={state}>
        <HeatmapXAxis />
      </StudioVisibleLayer>
      <StudioVisibleLayer componentId="heatmap.yaxis" state={state}>
        <HeatmapYAxis
          labelFormat={state.heatmapYAxisLabelFormat}
          tickFilter={state.heatmapYAxisTickFilter}
        />
      </StudioVisibleLayer>
      {state.heatmapSeparatorGroupBy === "off" ? null : (
        <StudioVisibleLayer componentId="heatmap.separator" state={state}>
          <HeatmapSeparator
            every={
              state.heatmapSeparatorGroupBy === "every"
                ? state.heatmapSeparatorEvery
                : undefined
            }
            groupBy={
              state.heatmapSeparatorGroupBy === "quarter" ? "quarter" : "every"
            }
            labelClassName="text-black dark:text-white"
            showLabels={
              state.heatmapSeparatorGroupBy === "quarter" &&
              state.heatmapSeparatorShowLabels
            }
            spacing={HEATMAP_STUDIO_SEPARATOR_SPACING}
            startOffset={HEATMAP_STUDIO_SEPARATOR_START_OFFSET}
            {...separatorVisual}
          />
        </StudioVisibleLayer>
      )}
      <StudioVisibleLayer componentId="heatmap.tooltip" state={state}>
        <HeatmapTooltip panelStyle={studioTooltipPanelStyle(state)} />
      </StudioVisibleLayer>
    </HeatmapChart>
  );
});

export function HeatmapStudioPreview({
  state,
  ctx,
}: {
  state: StudioUrlState;
  ctx: StudioRenderContext;
}) {
  const levelStyles = useMemo(() => studioHeatmapLevelStyles(state), [state]);
  const data = useMemo(() => {
    const weeks =
      state.heatmapBinSize > 0 ? state.heatmapBinSize : HEATMAP_WEEKS_ONE_YEAR;
    return getHeatmapData(ctx.dataSeed, weeks);
  }, [ctx.dataSeed, state.heatmapBinSize]);
  const chrome = ctx.chromeState;

  return (
    <HeatmapInteractionProvider>
      <HeatmapInteractionBoundary>
        <div className="flex size-full min-w-full items-center justify-center px-2">
          <StudioChartShell
            legendComponentId="heatmap.legend"
            renderLegend={() => (
              <div style={studioLegendWrapperStyle(chrome)}>
                <HeatmapLegend
                  align={chrome.legendAlign}
                  cellSize={state.heatmapLegendCellSize}
                  cornerRadius={state.heatmapCornerRadius}
                  fontSize={state.legendFontSize}
                  gap={state.heatmapGap}
                  gradientSpan={state.heatmapLegendGradientSpan}
                  inactiveOpacity={state.heatmapCellsInactiveOpacity}
                  inactiveScale={state.heatmapCellsInactiveScale}
                  levelStyles={levelStyles}
                  variant={state.heatmapLegendVariant}
                />
              </div>
            )}
            state={chrome}
          >
            <StudioCartesianFill className="!h-auto min-h-0 w-full min-w-full">
              <HeatmapChartBody ctx={ctx} data={data} state={state} />
            </StudioCartesianFill>
          </StudioChartShell>
        </div>
      </HeatmapInteractionBoundary>
    </HeatmapInteractionProvider>
  );
}
