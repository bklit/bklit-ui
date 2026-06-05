"use client";

import {
  Ring,
  RingCenter,
  RingChart,
  useChartLegendHover,
} from "@bklitui/ui/charts";
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
import { studioStaticRingLegendItems } from "@/lib/studio-legend-items";
import type { StudioUrlState } from "@/lib/studio-parsers";
import {
  studioPreviewColorState,
  studioPreviewMotionState,
} from "@/lib/studio-preview-state";
import { getEffectiveSeriesColor } from "@/lib/studio-series-design";

interface RingChartGeometry {
  baseInnerRadius: number;
  ringGap: number;
  strokeWidth: number;
  pieSize: number;
  showCenter: boolean;
  centerLabel: string;
  centerPrefix: string | undefined;
  centerSuffix: string | undefined;
}

const RingChartBody = memo(
  function RingChartBody({
    geometry,
    geometryScrubbing,
    chartKey,
    chartSize,
    data,
    motionEnter,
    visibilityState,
  }: {
    geometry: RingChartGeometry;
    geometryScrubbing: boolean;
    chartKey: string;
    chartSize: number;
    data: ReturnType<typeof getRingData>;
    motionEnter: ReturnType<typeof getStudioMotionEnterProps>;
    visibilityState: StudioUrlState;
  }) {
    const { hoveredIndex, setHoveredIndex } = useChartLegendHover();

    const rings = useMemo(() => {
      if (geometryScrubbing) {
        return null;
      }
      return data.map((item, index) =>
        isStudioComponentVisible(visibilityState, `ring.layer.${index}`) ? (
          <Ring index={index} key={item.label} showGlow={false} />
        ) : null
      );
    }, [data, geometryScrubbing, visibilityState]);

    return (
      <StudioRadialCenter frame={{ width: chartSize, height: chartSize }}>
        <RingChart
          baseInnerRadius={geometry.baseInnerRadius}
          className="studio-ring-chart"
          data={data}
          enterStaggerScale={motionEnter.enterStaggerScale}
          enterTransition={motionEnter.enterTransition}
          geometryScrubbing={geometryScrubbing}
          hoveredIndex={hoveredIndex}
          key={chartKey}
          onHoverChange={setHoveredIndex}
          ringGap={geometry.ringGap}
          size={chartSize}
          strokeWidth={geometry.strokeWidth}
        >
          {rings}
          {geometry.showCenter ? (
            <RingCenter
              defaultLabel={geometry.centerLabel}
              prefix={geometry.centerPrefix}
              suffix={geometry.centerSuffix}
            />
          ) : null}
        </RingChart>
      </StudioRadialCenter>
    );
  },
  (prev, next) =>
    prev.geometry === next.geometry &&
    prev.geometryScrubbing === next.geometryScrubbing &&
    prev.chartKey === next.chartKey &&
    prev.chartSize === next.chartSize &&
    prev.data === next.data &&
    prev.motionEnter === next.motionEnter &&
    prev.visibilityState === next.visibilityState
);

export const RingStudioPreview = memo(function RingStudioPreview({
  state,
  ctx,
}: {
  state: StudioUrlState;
  ctx: StudioRenderContext;
}) {
  const contentFrame = useStudioChartContentFrame(ctx.frame);
  const chartKey = studioPreviewChartKey(ctx);
  const motionState = studioPreviewMotionState(state, ctx);
  const colorState = studioPreviewColorState(state, ctx);
  const ringCenterVisible = isStudioComponentVisible(state, "ring.center");

  const geometry = useMemo(
    (): RingChartGeometry => ({
      baseInnerRadius: state.ringBaseInnerRadius,
      ringGap: state.ringGap,
      strokeWidth: state.ringStrokeWidth,
      pieSize: state.pieSize,
      showCenter: ringCenterVisible,
      centerLabel: state.ringCenterLabel,
      centerPrefix: state.ringCenterPrefix || undefined,
      centerSuffix: state.ringCenterSuffix || undefined,
    }),
    [
      state.ringBaseInnerRadius,
      state.ringGap,
      state.ringStrokeWidth,
      state.pieSize,
      state.ringCenterLabel,
      state.ringCenterPrefix,
      state.ringCenterSuffix,
      ringCenterVisible,
    ]
  );

  const chartSize = studioRadialSize(contentFrame, geometry.pieSize);

  const motionEnter = useMemo(
    () =>
      getStudioMotionEnterProps(motionState, {
        linear: ctx.isRecording,
      }),
    [ctx.isRecording, motionState]
  );

  const data = useMemo(
    () =>
      getRingData(ctx.dataSeed).map((item, index) => ({
        ...item,
        color: getEffectiveSeriesColor(colorState, index),
      })),
    [colorState, ctx.dataSeed]
  );

  const legendItems = useMemo(
    () => studioStaticRingLegendItems(ctx.chromeState),
    [ctx.chromeState]
  );

  return (
    <StudioChartShell
      legendComponentId="ring.legend"
      legendItems={legendItems}
      state={ctx.chromeState}
    >
      <RingChartBody
        chartKey={chartKey}
        chartSize={chartSize}
        data={data}
        geometry={geometry}
        geometryScrubbing={ctx.numberScrubbing}
        motionEnter={motionEnter}
        visibilityState={ctx.chromeState}
      />
    </StudioChartShell>
  );
});
