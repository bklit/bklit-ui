"use client";

import { FunnelChart } from "@bklitui/ui/charts";
import { studioFitAspectSize } from "@/components/charts/studio-chart-layout";
import {
  getStudioMotionEnterProps,
  studioEnterStaggerScale,
  studioPreviewChartKey,
} from "@/lib/chart-animation";
import { funnelData } from "@/lib/demo-data";
import type { StudioRenderContext } from "@/lib/render-context";
import type { StudioUrlState } from "@/lib/studio-parsers";

export function FunnelStudioPreview({
  state,
  ctx,
}: {
  state: StudioUrlState;
  ctx: StudioRenderContext;
}) {
  const widthOverHeight =
    state.funnelOrientation === "horizontal" ? 2.2 : 1 / 1.8;
  const { width, height } = studioFitAspectSize(ctx.frame, widthOverHeight);
  const motionEnter = getStudioMotionEnterProps(state, {
    linear: ctx.isRecording,
  });
  return (
    <div className="shrink-0" style={{ width, height }}>
      <FunnelChart
        className="size-full"
        color="var(--chart-1)"
        data={funnelData}
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
    </div>
  );
}
