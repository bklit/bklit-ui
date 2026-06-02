"use client";

import {
  RadarArea,
  RadarAxis,
  RadarChart,
  RadarGrid,
  RadarLabels,
} from "@bklitui/ui/charts";
import { memo, useMemo } from "react";
import {
  StudioRadialCenter,
  studioRadialSize,
} from "@/components/charts/studio-chart-layout";
import { StudioChartShell } from "@/components/charts/studio-chart-shell";
import {
  getStudioMotionEnterProps,
  studioAnimationDurationMs,
  studioPreviewChartKey,
} from "@/lib/chart-animation";
import { getRadarData, radarMetrics5 } from "@/lib/demo-data";
import type { StudioRenderContext } from "@/lib/render-context";
import { useStudioChartContentFrame } from "@/lib/studio-chart-content-frame";
import { studioRadarLegendItems } from "@/lib/studio-legend-items";
import type { StudioUrlState } from "@/lib/studio-parsers";

const RadarChartBody = memo(function RadarChartBody({
  state,
  ctx,
  radarData,
  motionEnter,
  contentFrame,
}: {
  state: StudioUrlState;
  ctx: StudioRenderContext;
  radarData: ReturnType<typeof getRadarData>;
  motionEnter: ReturnType<typeof getStudioMotionEnterProps>;
  contentFrame: ReturnType<typeof useStudioChartContentFrame>;
}) {
  const chartKey = studioPreviewChartKey(ctx);

  return (
    <StudioRadialCenter frame={contentFrame}>
      <RadarChart
        data={radarData}
        enterDurationMs={studioAnimationDurationMs(state)}
        enterTransition={motionEnter.enterTransition}
        key={chartKey}
        levels={state.radarLevels}
        margin={state.radarMargin}
        metrics={radarMetrics5}
        motionReplayKey={chartKey}
        size={studioRadialSize(contentFrame, state.radarSize)}
        staggerScale={motionEnter.enterStaggerScale}
      >
        {state.showRadarGrid ? <RadarGrid /> : <RadarGrid showLabels={false} />}
        <RadarAxis />
        <RadarLabels fontSize={10} offset={16} />
        {radarData.map((item, index) => (
          <RadarArea
            index={index}
            key={item.label}
            showGlow={false}
            showPoints={state.radarShowPoints}
            showStroke={state.radarShowStroke}
          />
        ))}
      </RadarChart>
    </StudioRadialCenter>
  );
});

export function RadarStudioPreview({
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
  const contentFrame = useStudioChartContentFrame(ctx.frame);
  const radarData = useMemo(() => getRadarData(ctx.dataSeed), [ctx.dataSeed]);
  const legendItems = useMemo(
    () => studioRadarLegendItems(state, ctx.dataSeed),
    [state, ctx.dataSeed]
  );

  return (
    <StudioChartShell
      legendComponentId="radar.legend"
      legendItems={legendItems}
      state={state}
    >
      <RadarChartBody
        contentFrame={contentFrame}
        ctx={ctx}
        motionEnter={motionEnter}
        radarData={radarData}
        state={state}
      />
    </StudioChartShell>
  );
}
