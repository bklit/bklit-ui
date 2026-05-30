"use client";

import { Ring, RingCenter, RingChart } from "@bklitui/ui/charts";
import {
  StudioRadialCenter,
  studioRadialSize,
} from "@/components/charts/studio-chart-layout";
import {
  getStudioMotionEnterProps,
  studioPreviewChartKey,
} from "@/lib/chart-animation";
import { ringData } from "@/lib/demo-data";
import type { StudioRenderContext } from "@/lib/render-context";
import type { StudioUrlState } from "@/lib/studio-parsers";

export function RingStudioPreview({
  state,
  ctx,
}: {
  state: StudioUrlState;
  ctx: StudioRenderContext;
}) {
  const motionEnter = getStudioMotionEnterProps(state, {
    linear: ctx.isRecording,
  });

  return (
    <StudioRadialCenter frame={ctx.frame}>
      <RingChart
        baseInnerRadius={state.ringBaseInnerRadius}
        data={ringData}
        enterStaggerScale={motionEnter.enterStaggerScale}
        enterTransition={motionEnter.enterTransition}
        key={studioPreviewChartKey(ctx)}
        ringGap={state.ringGap}
        size={studioRadialSize(ctx.frame, state.pieSize)}
        strokeWidth={state.strokeWidth}
      >
        {ringData.map((item, index) => (
          <Ring index={index} key={item.label} />
        ))}
        <RingCenter defaultLabel="Channels" />
      </RingChart>
    </StudioRadialCenter>
  );
}
