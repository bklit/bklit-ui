"use client";

import { PieCenter, PieChart, PieSlice } from "@bklitui/ui/charts";
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
import { isStudioComponentVisible } from "@/lib/studio-component-visibility";
import { useStudioLegendHover } from "@/lib/studio-legend-hover";
import { studioStaticPieLegendItems } from "@/lib/studio-legend-items";
import type { StudioUrlState } from "@/lib/studio-parsers";
import {
  getEffectiveSeriesColor,
  getSeriesFillMode,
} from "@/lib/studio-series-design";

const PieChartBody = memo(function PieChartBody({
  state,
  ctx,
  data,
  motionEnter,
  showPatternDefs,
}: {
  state: StudioUrlState;
  ctx: StudioRenderContext;
  data: ReturnType<typeof getPieData>;
  motionEnter: ReturnType<typeof getStudioMotionEnterProps>;
  showPatternDefs: boolean;
}) {
  const { hoveredIndex, setHoveredIndex } = useStudioLegendHover();

  const slices = useMemo(
    () =>
      data.map((item, index) => {
        if (!isStudioComponentVisible(state, `pie.slice.${index}`)) {
          return null;
        }
        const patternFill = ctx.patternFillAt(index);
        const fill =
          getSeriesFillMode(state, index) === "pattern" && patternFill
            ? patternFill
            : item.color;

        return (
          <PieSlice
            fill={fill}
            hoverEffect={state.pieHoverEffect}
            index={index}
            key={item.label}
            showGlow={false}
          />
        );
      }),
    [ctx.patternFillAt, data, state]
  );

  return (
    <StudioRadialCenter frame={ctx.frame}>
      <PieChart
        cornerRadius={state.pieCornerRadius}
        data={data}
        endAngle={(state.pieEndAngleDeg * Math.PI) / 180}
        enterStaggerScale={motionEnter.enterStaggerScale}
        enterTransition={motionEnter.enterTransition}
        hoveredIndex={hoveredIndex}
        hoverOffset={state.pieHoverOffset}
        innerRadius={state.innerRadius || undefined}
        key={studioPreviewChartKey(ctx)}
        onHoverChange={setHoveredIndex}
        padAngle={state.padAngle}
        size={studioRadialSize(ctx.frame, state.pieSize)}
        startAngle={(state.pieStartAngleDeg * Math.PI) / 180}
      >
        {showPatternDefs ? ctx.patternDefs : null}
        {slices}
        {state.innerRadius > 0 &&
        isStudioComponentVisible(state, "pie.center") ? (
          <PieCenter
            defaultLabel={state.pieCenterLabel}
            prefix={state.pieCenterPrefix || undefined}
            suffix={state.pieCenterSuffix || undefined}
          />
        ) : null}
      </PieChart>
    </StudioRadialCenter>
  );
});

export function PieStudioPreview({
  state,
  ctx,
}: {
  state: StudioUrlState;
  ctx: StudioRenderContext;
}) {
  const motionEnter = useMemo(
    () =>
      getStudioMotionEnterProps(state, {
        linear: ctx.isRecording,
      }),
    [ctx.isRecording, state]
  );

  const data = useMemo(
    () =>
      getPieData(ctx.dataSeed).map((item, index) => ({
        ...item,
        color: getEffectiveSeriesColor(state, index),
      })),
    [ctx.dataSeed, state]
  );

  const showPatternDefs = useMemo(
    () =>
      data.some((_, index) => getSeriesFillMode(state, index) === "pattern"),
    [data, state]
  );

  const legendItems = useMemo(() => studioStaticPieLegendItems(state), [state]);

  return (
    <StudioChartShell
      legendComponentId="pie.legend"
      legendItems={legendItems}
      state={state}
    >
      <PieChartBody
        ctx={ctx}
        data={data}
        motionEnter={motionEnter}
        showPatternDefs={showPatternDefs}
        state={state}
      />
    </StudioChartShell>
  );
}
