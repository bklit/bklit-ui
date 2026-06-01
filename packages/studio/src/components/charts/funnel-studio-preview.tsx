"use client";

import { FunnelChart } from "@bklitui/ui/charts";
import { StudioCartesianFill } from "@/components/charts/studio-chart-layout";
import {
  getStudioMotionEnterProps,
  studioEnterStaggerScale,
  studioPreviewChartKey,
} from "@/lib/chart-animation";
import { getFunnelData } from "@/lib/demo-data";
import type { StudioRenderContext } from "@/lib/render-context";
import type { StudioUrlState } from "@/lib/studio-parsers";
import { getEffectiveSeriesColor } from "@/lib/studio-series-design";

export function FunnelStudioPreview({
  state,
  ctx,
}: {
  state: StudioUrlState;
  ctx: StudioRenderContext;
}) {
  const motionEnter = getStudioMotionEnterProps(state, {
    linear: ctx.isRecording,
  });
  const stages = getFunnelData(ctx.dataSeed).map((stage, index) => ({
    ...stage,
    color: getEffectiveSeriesColor(state, index),
  }));

  return (
    <StudioCartesianFill>
      <FunnelChart
        className="size-full"
        color={getEffectiveSeriesColor(state, 0)}
        data={stages}
        edges={state.funnelEdges}
        enterTransition={motionEnter.enterTransition}
        gap={state.funnelGap}
        key={studioPreviewChartKey(ctx)}
        layers={state.funnelLayers}
        orientation={state.funnelOrientation}
        showLabels={state.funnelShowLabels}
        showPercentage={state.funnelShowPercentage}
        showValues={state.funnelShowValues}
        staggerDelay={0.12 * studioEnterStaggerScale(state)}
      />
    </StudioCartesianFill>
  );
}
