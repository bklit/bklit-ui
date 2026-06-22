"use client";

import {
  HeatmapCells,
  HeatmapChart,
  HeatmapInteractionBoundary,
  HeatmapInteractionProvider,
  HeatmapLegend,
  HeatmapTooltip,
  HeatmapXAxis,
  HeatmapYAxis,
} from "@bklitui/ui/charts";
import { memo, useMemo } from "react";
import { StudioCartesianFill } from "@/components/charts/studio-chart-layout";
import { StudioVisibleLayer } from "@/components/charts/studio-chart-shell";
import {
  getStudioCssRevealPropsForPreview,
  studioEnterStaggerScale,
  studioPreviewChartKey,
} from "@/lib/chart-animation";
import { getHeatmapData, HEATMAP_WEEKS_ONE_YEAR } from "@/lib/demo-data";
import { studioHeatmapLevelStyles } from "@/lib/heatmap-studio-colors";
import type { StudioRenderContext } from "@/lib/render-context";
import { StudioChartContentViewport } from "@/lib/studio-chart-content-frame";
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
      {...motionProps}
    >
      {mountCells ? (
        <HeatmapCells
          cornerRadius={state.heatmapCornerRadius}
          fadedOpacity={state.heatmapCellsFadedOpacity}
        />
      ) : null}
      <StudioVisibleLayer componentId="heatmap.xaxis" state={state}>
        <HeatmapXAxis />
      </StudioVisibleLayer>
      <StudioVisibleLayer componentId="heatmap.yaxis" state={state}>
        <HeatmapYAxis />
      </StudioVisibleLayer>
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
  const legendVisible =
    chrome.showLegend && isStudioComponentVisible(state, "heatmap.legend");

  return (
    <HeatmapInteractionProvider>
      <HeatmapInteractionBoundary>
        <StudioChartContentViewport>
          <div className="flex size-full min-w-full items-center justify-center px-2">
            <div className="flex w-full min-w-full flex-col items-stretch gap-3">
              <StudioCartesianFill className="!h-auto min-h-0 w-full min-w-full">
                <HeatmapChartBody ctx={ctx} data={data} state={state} />
              </StudioCartesianFill>
              {legendVisible ? (
                <StudioVisibleLayer componentId="heatmap.legend" state={state}>
                  <div
                    className="self-center"
                    style={studioLegendWrapperStyle(state)}
                  >
                    <HeatmapLegend
                      align={state.legendAlign}
                      cellSize={state.heatmapLegendCellSize}
                      cornerRadius={state.heatmapCornerRadius}
                      gap={state.heatmapGap}
                      levelStyles={levelStyles}
                    />
                  </div>
                </StudioVisibleLayer>
              ) : null}
            </div>
          </div>
        </StudioChartContentViewport>
      </HeatmapInteractionBoundary>
    </HeatmapInteractionProvider>
  );
}
