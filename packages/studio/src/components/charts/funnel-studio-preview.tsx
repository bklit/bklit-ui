"use client";

import { FunnelChart, useChartLegendHover } from "@bklitui/ui/charts";
import { memo, useMemo } from "react";
import { StudioCartesianFill } from "@/components/charts/studio-chart-layout";
import { StudioChartShell } from "@/components/charts/studio-chart-shell";
import {
  getStudioMotionEnterProps,
  studioEnterStaggerScale,
  studioPreviewChartKey,
} from "@/lib/chart-animation";
import { getFunnelData } from "@/lib/demo-data";
import type { StudioRenderContext } from "@/lib/render-context";
import { studioFunnelLegendItems } from "@/lib/studio-legend-items";
import type { StudioUrlState } from "@/lib/studio-parsers";
import { getEffectiveSeriesColor } from "@/lib/studio-series-design";

const FunnelChartBody = memo(function FunnelChartBody({
  state,
  ctx,
  stages,
  motionEnter,
}: {
  state: StudioUrlState;
  ctx: StudioRenderContext;
  stages: ReturnType<typeof getFunnelData>;
  motionEnter: ReturnType<typeof getStudioMotionEnterProps>;
}) {
  const { hoveredIndex, setHoveredIndex } = useChartLegendHover();

  return (
    <StudioCartesianFill>
      <FunnelChart
        className="size-full"
        color={getEffectiveSeriesColor(state, 0)}
        data={stages}
        edges={state.funnelEdges}
        enterTransition={motionEnter.enterTransition}
        gap={state.funnelGap}
        hoveredIndex={hoveredIndex}
        key={studioPreviewChartKey(ctx)}
        layers={state.funnelLayers}
        onHoverChange={setHoveredIndex}
        orientation={state.funnelOrientation}
        showLabels={state.funnelShowLabels}
        showPercentage={state.funnelShowPercentage}
        showValues={state.funnelShowValues}
        staggerDelay={0.12 * studioEnterStaggerScale(state)}
      />
    </StudioCartesianFill>
  );
});

export function FunnelStudioPreview({
  state,
  ctx,
}: {
  state: StudioUrlState;
  ctx: StudioRenderContext;
}) {
  const motionEnter = useMemo(
    () =>
      getStudioMotionEnterProps(state, {
        linear: ctx.isRecording,
      }),
    [ctx.isRecording, state]
  );

  const stages = useMemo(
    () =>
      getFunnelData(ctx.dataSeed).map((stage, index) => ({
        ...stage,
        color: getEffectiveSeriesColor(state, index),
      })),
    [ctx.dataSeed, state]
  );

  const legendItems = useMemo(() => studioFunnelLegendItems(state), [state]);

  return (
    <StudioChartShell
      legendComponentId="funnel.legend"
      legendItems={legendItems}
      state={ctx.chromeState}
    >
      <FunnelChartBody
        ctx={ctx}
        motionEnter={motionEnter}
        stages={stages}
        state={state}
      />
    </StudioChartShell>
  );
}
