"use client";

import {
  PieCenter,
  PieChart,
  PieSlice,
  type PieSliceHoverEffect,
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
import { getPieData } from "@/lib/demo-data";
import type { StudioRenderContext } from "@/lib/render-context";
import { useStudioChartContentFrame } from "@/lib/studio-chart-content-frame";
import { isStudioComponentVisible } from "@/lib/studio-component-visibility";
import { studioStaticPieLegendItems } from "@/lib/studio-legend-items";
import type { StudioUrlState } from "@/lib/studio-parsers";
import {
  studioPreviewColorState,
  studioPreviewMotionState,
} from "@/lib/studio-preview-state";
import {
  getEffectiveSeriesColor,
  getSeriesFillMode,
} from "@/lib/studio-series-design";

interface PieChartGeometry {
  padAngle: number;
  cornerRadius: number;
  innerRadius: number;
  pieSize: number;
  startAngleRad: number;
  endAngleRad: number;
  hoverOffset: number;
  hoverEffect: PieSliceHoverEffect;
  showCenter: boolean;
  centerLabel: string;
  centerPrefix: string | undefined;
  centerSuffix: string | undefined;
}

const PieChartBody = memo(
  function PieChartBody({
    geometry,
    geometryScrubbing,
    ctx,
    data,
    motionEnter,
    showPatternDefs,
    visibilityState,
    patternFillState,
  }: {
    geometry: PieChartGeometry;
    geometryScrubbing: boolean;
    ctx: StudioRenderContext;
    data: ReturnType<typeof getPieData>;
    motionEnter: ReturnType<typeof getStudioMotionEnterProps>;
    showPatternDefs: boolean;
    visibilityState: StudioUrlState;
    patternFillState: StudioUrlState;
  }) {
    const { hoveredIndex, setHoveredIndex } = useChartLegendHover();
    const contentFrame = useStudioChartContentFrame(ctx.frame);
    const chartSize = studioRadialSize(contentFrame, geometry.pieSize);

    const slices = useMemo(() => {
      if (geometryScrubbing) {
        return null;
      }
      return data.map((item, index) => {
        if (!isStudioComponentVisible(visibilityState, `pie.slice.${index}`)) {
          return null;
        }
        const patternFill = ctx.patternFillAt(index);
        const fill =
          getSeriesFillMode(patternFillState, index) === "pattern" &&
          patternFill
            ? patternFill
            : item.color;

        return (
          <PieSlice
            fill={fill}
            hoverEffect={geometry.hoverEffect}
            index={index}
            key={item.label}
            showGlow={false}
          />
        );
      });
    }, [
      ctx.patternFillAt,
      data,
      geometry.hoverEffect,
      geometryScrubbing,
      patternFillState,
      visibilityState,
    ]);

    return (
      <StudioRadialCenter frame={contentFrame}>
        <PieChart
          cornerRadius={geometry.cornerRadius}
          data={data}
          endAngle={geometry.endAngleRad}
          enterStaggerScale={motionEnter.enterStaggerScale}
          enterTransition={motionEnter.enterTransition}
          geometryScrubbing={geometryScrubbing}
          hoveredIndex={hoveredIndex}
          hoverOffset={geometry.hoverOffset}
          innerRadius={geometry.innerRadius || undefined}
          key={studioPreviewChartKey(ctx)}
          onHoverChange={setHoveredIndex}
          padAngle={geometry.padAngle}
          size={chartSize}
          startAngle={geometry.startAngleRad}
        >
          {showPatternDefs ? ctx.patternDefs : null}
          {slices}
          {geometry.showCenter ? (
            <PieCenter
              defaultLabel={geometry.centerLabel}
              prefix={geometry.centerPrefix}
              suffix={geometry.centerSuffix}
            />
          ) : null}
        </PieChart>
      </StudioRadialCenter>
    );
  },
  (prev, next) =>
    prev.geometry === next.geometry &&
    prev.geometryScrubbing === next.geometryScrubbing &&
    prev.ctx === next.ctx &&
    prev.data === next.data &&
    prev.motionEnter === next.motionEnter &&
    prev.showPatternDefs === next.showPatternDefs &&
    prev.visibilityState === next.visibilityState &&
    prev.patternFillState === next.patternFillState
);

export const PieStudioPreview = memo(function PieStudioPreview({
  state,
  ctx,
}: {
  state: StudioUrlState;
  ctx: StudioRenderContext;
}) {
  const motionState = studioPreviewMotionState(state, ctx);
  const colorState = studioPreviewColorState(state, ctx);
  const pieCenterVisible = isStudioComponentVisible(state, "pie.center");

  const geometry = useMemo(
    (): PieChartGeometry => ({
      padAngle: state.padAngle,
      cornerRadius: state.pieCornerRadius,
      innerRadius: state.innerRadius || 0,
      pieSize: state.pieSize,
      startAngleRad: (state.pieStartAngleDeg * Math.PI) / 180,
      endAngleRad: (state.pieEndAngleDeg * Math.PI) / 180,
      hoverOffset: state.pieHoverOffset,
      hoverEffect: state.pieHoverEffect,
      showCenter: state.innerRadius > 0 && pieCenterVisible,
      centerLabel: state.pieCenterLabel,
      centerPrefix: state.pieCenterPrefix || undefined,
      centerSuffix: state.pieCenterSuffix || undefined,
    }),
    [
      state.padAngle,
      state.pieCornerRadius,
      state.innerRadius,
      state.pieSize,
      state.pieStartAngleDeg,
      state.pieEndAngleDeg,
      state.pieHoverOffset,
      state.pieHoverEffect,
      state.pieCenterLabel,
      state.pieCenterPrefix,
      state.pieCenterSuffix,
      pieCenterVisible,
    ]
  );

  const motionEnter = useMemo(
    () =>
      getStudioMotionEnterProps(motionState, {
        linear: ctx.isRecording,
      }),
    [ctx.isRecording, motionState]
  );

  const data = useMemo(
    () =>
      getPieData(ctx.dataSeed).map((item, index) => ({
        ...item,
        color: getEffectiveSeriesColor(colorState, index),
      })),
    [colorState, ctx.dataSeed]
  );

  const showPatternDefs = useMemo(
    () =>
      data.some(
        (_, index) => getSeriesFillMode(colorState, index) === "pattern"
      ),
    [colorState, data]
  );

  const legendItems = useMemo(
    () => studioStaticPieLegendItems(ctx.chromeState),
    [ctx.chromeState]
  );

  return (
    <StudioChartShell
      legendComponentId="pie.legend"
      legendItems={legendItems}
      state={ctx.chromeState}
    >
      <PieChartBody
        ctx={ctx}
        data={data}
        geometry={geometry}
        geometryScrubbing={ctx.numberScrubbing}
        motionEnter={motionEnter}
        patternFillState={colorState}
        showPatternDefs={showPatternDefs}
        visibilityState={ctx.chromeState}
      />
    </StudioChartShell>
  );
});
