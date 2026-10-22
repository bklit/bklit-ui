"use client";

import { Gauge } from "@bklitui/ui/charts";
import { studioFitAspectSize } from "@/components/charts/studio-chart-layout";
import {
  getStudioMotionEnterProps,
  studioPreviewChartKey,
} from "@/lib/chart-animation";
import { scrambleGaugeValue } from "@/lib/demo-data";
import type { StudioRenderContext } from "@/lib/render-context";
import { isStudioComponentVisible } from "@/lib/studio-component-visibility";
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
  const isLinear = state.gaugeLinear;
  const motionEnter = getStudioMotionEnterProps(state, {
    linear: ctx.isRecording,
  });
  const trackFill = state.progressBarTrackFill.trim();
  const visible = (id: string) => isStudioComponentVisible(state, id);
  // Notches (and the arc they sit on) carry both the track and the fill.
  const notchesVisible =
    visible("gauge.notches") && (isLinear || visible("gauge.arc"));
  const trackVisible = notchesVisible && visible("gauge.track");
  const fillVisible = notchesVisible && visible("gauge.arc-fill");
  const centerValue =
    state.gaugeShowLabel && visible("gauge.center")
      ? state.centerValue
      : undefined;

  const sharedProps = {
    activeFill: ctx.patternFillAt(0),
    activeFillOpacity: fillVisible ? state.activeFillOpacity : 0,
    centerValue,
    defaultLabel: state.gaugeLabel,
    enterStaggerScale: motionEnter.enterStaggerScale,
    enterTransition: motionEnter.enterTransition,
    formatOptions: gaugeFormat,
    geometryScrubbing: isLinear ? ctx.numberScrubbing : undefined,
    inactiveFill: trackFill.length > 0 ? trackFill : undefined,
    inactiveFillOpacity: trackVisible ? state.inactiveFillOpacity : 0,
    key: studioPreviewChartKey(ctx),
    labelAlign: state.gaugeLabelAlign,
    labelPlacement: state.gaugeLabelPlacement,
    linearHeight: state.progressBarHeight,
    notchCornerRadius: state.notchCornerRadius,
    notchLengthPercent: state.notchLengthPercent,
    notchWidthPercent: state.notchWidthPercent,
    prefix: state.gaugeCenterPrefix || undefined,
    spacing: state.spacing,
    suffix: state.gaugeCenterSuffix || undefined,
    totalNotches: state.totalNotches,
    uniformWidth: state.uniformWidth,
    useGradient: state.useGradient,
    value: scrambleGaugeValue(state.value, ctx.dataSeed),
    children: ctx.patternDefs,
  } as const;

  if (isLinear) {
    return (
      <div className="flex size-full min-w-0 items-center justify-center px-8">
        <div className="w-full min-w-0">
          <Gauge orientation="linear" {...sharedProps} />
        </div>
      </div>
    );
  }

  const { width, height } = studioFitAspectSize(ctx.frame, 21 / 16);

  return (
    <Gauge
      endAngle={state.endAngle}
      height={height}
      orientation="arc"
      startAngle={state.startAngle}
      width={width}
      {...sharedProps}
    />
  );
}
