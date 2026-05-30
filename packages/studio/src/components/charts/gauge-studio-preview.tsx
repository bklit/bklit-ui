"use client";

import { Gauge } from "@bklitui/ui/charts";
import { studioFitAspectSize } from "@/components/charts/studio-chart-layout";
import {
  getStudioMotionEnterProps,
  studioPreviewChartKey,
} from "@/lib/chart-animation";
import type { StudioRenderContext } from "@/lib/render-context";
import type { StudioUrlState } from "@/lib/studio-parsers";

const gaugeFormat = {
  style: "currency" as const,
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
};

export function GaugeStudioPreview({
  state,
  ctx,
}: {
  state: StudioUrlState;
  ctx: StudioRenderContext;
}) {
  const { width, height } = studioFitAspectSize(ctx.frame, 21 / 16);
  const motionEnter = getStudioMotionEnterProps(state, {
    linear: ctx.isRecording,
  });

  return (
    <Gauge
      activeFill={ctx.patternFill}
      activeFillOpacity={state.activeFillOpacity}
      centerValue={state.centerValue}
      defaultLabel={state.gaugeLabel}
      endAngle={state.endAngle}
      enterStaggerScale={motionEnter.enterStaggerScale}
      enterTransition={motionEnter.enterTransition}
      formatOptions={gaugeFormat}
      height={height}
      inactiveFillOpacity={state.inactiveFillOpacity}
      key={studioPreviewChartKey(ctx)}
      notchCornerRadius={state.notchCornerRadius}
      notchLengthPercent={state.notchLengthPercent}
      spacing={state.spacing}
      startAngle={state.startAngle}
      totalNotches={state.totalNotches}
      uniformWidth={state.uniformWidth}
      useGradient={state.useGradient}
      value={state.value}
      width={width}
    >
      {ctx.patternDefs}
    </Gauge>
  );
}
