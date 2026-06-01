"use client";

import {
  RadarArea,
  RadarAxis,
  RadarChart,
  RadarGrid,
  RadarLabels,
} from "@bklitui/ui/charts";
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

export function RadarStudioPreview({
  state,
  ctx,
}: {
  state: StudioUrlState;
  ctx: StudioRenderContext;
}) {
  const motionEnter = getStudioMotionEnterProps(state, {
    linear: ctx.isRecording,
  });
  const contentFrame = useStudioChartContentFrame(ctx.frame);
  const radarData = getRadarData(ctx.dataSeed);

  return (
    <StudioChartShell
      legendComponentId="radar.legend"
      legendItems={studioRadarLegendItems(state, ctx.dataSeed)}
      state={state}
    >
      <StudioRadialCenter frame={contentFrame}>
        <RadarChart
          data={radarData}
          enterDurationMs={studioAnimationDurationMs(state)}
          enterTransition={motionEnter.enterTransition}
          key={studioPreviewChartKey(ctx)}
          levels={state.radarLevels}
          margin={state.radarMargin}
          metrics={radarMetrics5}
          motionReplayKey={studioPreviewChartKey(ctx)}
          size={studioRadialSize(contentFrame, state.radarSize)}
          staggerScale={motionEnter.enterStaggerScale}
        >
          {state.showRadarGrid ? (
            <RadarGrid />
          ) : (
            <RadarGrid showLabels={false} />
          )}
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
    </StudioChartShell>
  );
}
