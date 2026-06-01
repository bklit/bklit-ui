"use client";

import { PieCenter, PieChart, PieSlice } from "@bklitui/ui/charts";
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
import { studioStaticPieLegendItems } from "@/lib/studio-legend-items";
import type { StudioUrlState } from "@/lib/studio-parsers";
import {
  getEffectiveSeriesColor,
  getSeriesFillMode,
} from "@/lib/studio-series-design";

export function PieStudioPreview({
  state,
  ctx,
}: {
  state: StudioUrlState;
  ctx: StudioRenderContext;
}) {
  const motionEnter = getStudioMotionEnterProps(state, {
    linear: ctx.isRecording,
  });
  const data = getPieData(ctx.dataSeed).map((item, index) => ({
    ...item,
    color: getEffectiveSeriesColor(state, index),
  }));

  return (
    <StudioChartShell
      legendComponentId="pie.legend"
      legendItems={studioStaticPieLegendItems(state)}
      state={state}
    >
      <StudioRadialCenter frame={ctx.frame}>
        <PieChart
          cornerRadius={state.pieCornerRadius}
          data={data}
          endAngle={(state.pieEndAngleDeg * Math.PI) / 180}
          enterStaggerScale={motionEnter.enterStaggerScale}
          enterTransition={motionEnter.enterTransition}
          hoverOffset={state.pieHoverOffset}
          innerRadius={state.innerRadius || undefined}
          key={studioPreviewChartKey(ctx)}
          padAngle={state.padAngle}
          size={studioRadialSize(ctx.frame, state.pieSize)}
          startAngle={(state.pieStartAngleDeg * Math.PI) / 180}
        >
          {ctx.patternDefs}
          {data.map((item, index) => {
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
          })}
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
    </StudioChartShell>
  );
}
