"use client";

import { ProgressBar } from "@bklitui/ui/charts";
import { studioFitAspectSize } from "@/components/charts/studio-chart-layout";
import {
  getStudioMotionEnterProps,
  studioPreviewChartKey,
} from "@/lib/chart-animation";
import { scrambleGaugeValue } from "@/lib/demo-data";
import type { StudioRenderContext } from "@/lib/render-context";
import type { StudioUrlState } from "@/lib/studio-parsers";

export function ProgressBarStudioPreview({
  state,
  ctx,
}: {
  state: StudioUrlState;
  ctx: StudioRenderContext;
}) {
  const { width } = studioFitAspectSize(ctx.frame, 16 / 1);
  const height = state.progressBarHeight;
  const motionEnter = getStudioMotionEnterProps(state, {
    linear: ctx.isRecording,
  });

  return (
    <div className="flex size-full items-center justify-center px-8">
      <ProgressBar
        activeFill={ctx.patternFillAt(0)}
        enterStaggerScale={motionEnter.enterStaggerScale}
        enterTransition={motionEnter.enterTransition}
        geometryScrubbing={ctx.numberScrubbing}
        height={height}
        inactiveFillOpacity={state.inactiveFillOpacity}
        key={studioPreviewChartKey(ctx)}
        notchCornerRadius={state.notchCornerRadius}
        notchLengthPercent={state.notchLengthPercent}
        spacing={state.spacing}
        totalNotches={state.totalNotches}
        uniformWidth={state.uniformWidth}
        useGradient={state.useGradient}
        value={scrambleGaugeValue(state.value, ctx.dataSeed)}
        width={width}
      >
        {ctx.patternDefs}
      </ProgressBar>
    </div>
  );
}
