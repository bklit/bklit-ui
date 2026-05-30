"use client";

import { PieCenter, PieChart, PieSlice } from "@bklitui/ui/charts";
import {
  StudioRadialCenter,
  studioRadialSize,
} from "@/components/charts/studio-chart-layout";
import {
  getStudioMotionEnterProps,
  studioPreviewChartKey,
} from "@/lib/chart-animation";
import { pieData } from "@/lib/demo-data";
import {
  studioPiePatternDefs,
  studioPieSlicePatternFill,
} from "@/lib/patterns";
import type { StudioRenderContext } from "@/lib/render-context";
import type { StudioUrlState } from "@/lib/studio-parsers";

export function PieStudioPreview({
  state,
  ctx,
}: {
  state: StudioUrlState;
  ctx: StudioRenderContext;
}) {
  const useLines = state.pieFillMode === "lines";
  const motionEnter = getStudioMotionEnterProps(state, {
    linear: ctx.isRecording,
  });

  return (
    <StudioRadialCenter frame={ctx.frame}>
      <PieChart
        cornerRadius={state.pieCornerRadius}
        data={pieData}
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
        {useLines ? studioPiePatternDefs(pieData.length) : null}
        {pieData.map((item, index) => (
          <PieSlice
            fill={useLines ? studioPieSlicePatternFill(index) : undefined}
            hoverEffect={state.pieHoverEffect}
            index={index}
            key={item.label}
            showGlow={false}
          />
        ))}
        {state.innerRadius > 0 ? <PieCenter defaultLabel="Total" /> : null}
      </PieChart>
    </StudioRadialCenter>
  );
}
