"use client";

import { Ring, RingCenter, RingChart } from "@bklitui/ui/charts";
import {
  StudioRadialCenter,
  studioRadialSize,
} from "@/components/charts/studio-chart-layout";
import { StudioChartShell } from "@/components/charts/studio-chart-shell";
import {
  getStudioMotionEnterProps,
  studioPreviewChartKey,
} from "@/lib/chart-animation";
import { getRingData } from "@/lib/demo-data";
import type { StudioRenderContext } from "@/lib/render-context";
import { isStudioComponentVisible } from "@/lib/studio-component-visibility";
import { studioStaticRingLegendItems } from "@/lib/studio-legend-items";
import type { StudioUrlState } from "@/lib/studio-parsers";
import { getEffectiveSeriesColor } from "@/lib/studio-series-design";

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
  const data = getRingData(ctx.dataSeed).map((item, index) => ({
    ...item,
    color: getEffectiveSeriesColor(state, index),
  }));

  return (
    <StudioChartShell
      legendComponentId="ring.legend"
      legendItems={studioStaticRingLegendItems(state)}
      state={state}
    >
      <StudioRadialCenter frame={ctx.frame}>
        <RingChart
          baseInnerRadius={state.ringBaseInnerRadius}
          data={data}
          enterStaggerScale={motionEnter.enterStaggerScale}
          enterTransition={motionEnter.enterTransition}
          key={studioPreviewChartKey(ctx)}
          ringGap={state.ringGap}
          size={studioRadialSize(ctx.frame, state.pieSize)}
          strokeWidth={state.ringStrokeWidth}
        >
          {data.map((item, index) =>
            isStudioComponentVisible(state, `ring.layer.${index}`) ? (
              <Ring index={index} key={item.label} />
            ) : null
          )}
          {isStudioComponentVisible(state, "ring.center") ? (
            <RingCenter
              defaultLabel={state.ringCenterLabel}
              prefix={state.ringCenterPrefix || undefined}
              suffix={state.ringCenterSuffix || undefined}
            />
          ) : null}
        </RingChart>
      </StudioRadialCenter>
    </StudioChartShell>
  );
}
