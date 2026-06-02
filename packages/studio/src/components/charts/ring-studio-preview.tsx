"use client";

import { Ring, RingCenter, RingChart } from "@bklitui/ui/charts";
import { memo, useMemo } from "react";
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
import { useStudioChartContentFrame } from "@/lib/studio-chart-content-frame";
import { isStudioComponentVisible } from "@/lib/studio-component-visibility";
import { useStudioLegendHover } from "@/lib/studio-legend-hover";
import { studioStaticRingLegendItems } from "@/lib/studio-legend-items";
import type { StudioUrlState } from "@/lib/studio-parsers";
import { getEffectiveSeriesColor } from "@/lib/studio-series-design";

const RingChartBody = memo(function RingChartBody({
  state,
  chartKey,
  chartSize,
  data,
  motionEnter,
}: {
  state: StudioUrlState;
  chartKey: string;
  chartSize: number;
  data: ReturnType<typeof getRingData>;
  motionEnter: ReturnType<typeof getStudioMotionEnterProps>;
}) {
  const { hoveredIndex, setHoveredIndex } = useStudioLegendHover();

  const rings = useMemo(
    () =>
      data.map((item, index) =>
        isStudioComponentVisible(state, `ring.layer.${index}`) ? (
          <Ring index={index} key={item.label} showGlow={false} />
        ) : null
      ),
    [data, state]
  );

  return (
    <StudioRadialCenter frame={{ width: chartSize, height: chartSize }}>
      <RingChart
        baseInnerRadius={state.ringBaseInnerRadius}
        className="studio-ring-chart"
        data={data}
        enterStaggerScale={motionEnter.enterStaggerScale}
        enterTransition={motionEnter.enterTransition}
        hoveredIndex={hoveredIndex}
        key={chartKey}
        onHoverChange={setHoveredIndex}
        ringGap={state.ringGap}
        size={chartSize}
        strokeWidth={state.ringStrokeWidth}
      >
        {rings}
        {isStudioComponentVisible(state, "ring.center") ? (
          <RingCenter
            defaultLabel={state.ringCenterLabel}
            prefix={state.ringCenterPrefix || undefined}
            suffix={state.ringCenterSuffix || undefined}
          />
        ) : null}
      </RingChart>
    </StudioRadialCenter>
  );
});

export function RingStudioPreview({
  state,
  ctx,
}: {
  state: StudioUrlState;
  ctx: StudioRenderContext;
}) {
  const contentFrame = useStudioChartContentFrame(ctx.frame);
  const chartKey = studioPreviewChartKey(ctx);
  const chartSize = studioRadialSize(contentFrame, state.pieSize);

  const motionEnter = useMemo(
    () =>
      getStudioMotionEnterProps(state, {
        linear: ctx.isRecording,
      }),
    [state, ctx.isRecording]
  );

  const data = useMemo(
    () =>
      getRingData(ctx.dataSeed).map((item, index) => ({
        ...item,
        color: getEffectiveSeriesColor(state, index),
      })),
    [ctx.dataSeed, state]
  );

  const legendItems = useMemo(
    () => studioStaticRingLegendItems(state),
    [state]
  );

  return (
    <StudioChartShell
      legendComponentId="ring.legend"
      legendItems={legendItems}
      state={state}
    >
      <RingChartBody
        chartKey={chartKey}
        chartSize={chartSize}
        data={data}
        motionEnter={motionEnter}
        state={state}
      />
    </StudioChartShell>
  );
}
