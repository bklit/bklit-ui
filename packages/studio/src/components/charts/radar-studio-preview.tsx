"use client";

import {
  RadarArea,
  RadarAxis,
  RadarChart,
  RadarGrid,
  RadarLabels,
  useChartLegendHover,
} from "@bklitui/ui/charts";
import { memo, useMemo } from "react";
import {
  StudioRadialCenter,
  studioRadialSize,
} from "@/components/charts/studio-chart-layout";
import {
  StudioChartShell,
  StudioVisibleLayer,
} from "@/components/charts/studio-chart-shell";
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
import { getSeriesPipeValue } from "@/lib/studio-series-line-props";

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
  const { hoveredIndex, setHoveredIndex } = useChartLegendHover();
  const chartKey = studioPreviewChartKey(ctx);

  return (
    <StudioRadialCenter frame={contentFrame}>
      <RadarChart
        data={radarData}
        enterDurationMs={studioAnimationDurationMs(state)}
        enterTransition={motionEnter.enterTransition}
        hoveredIndex={hoveredIndex}
        key={chartKey}
        levels={state.radarLevels}
        margin={state.radarMargin}
        metrics={radarMetrics5}
        motionReplayKey={chartKey}
        onHoverChange={setHoveredIndex}
        size={studioRadialSize(contentFrame, state.radarSize)}
        staggerScale={motionEnter.enterStaggerScale}
      >
        <StudioVisibleLayer componentId="radar.grid" state={state}>
          <RadarGrid
            showLabels={state.showRadarGrid}
            strokeOpacity={state.radarGridStrokeOpacity}
          />
        </StudioVisibleLayer>
        <StudioVisibleLayer componentId="radar.axis" state={state}>
          <RadarAxis strokeOpacity={state.radarAxisStrokeOpacity} />
        </StudioVisibleLayer>
        <StudioVisibleLayer componentId="radar.labels" state={state}>
          <RadarLabels
            fontSize={state.radarLabelFontSize}
            interactive={state.radarLabelsInteractive}
            offset={state.radarLabelOffset}
          />
        </StudioVisibleLayer>
        {radarData.map((item, index) => (
          <StudioVisibleLayer
            componentId={`radar.area.${index}`}
            key={item.label}
            state={state}
          >
            <RadarArea
              index={index}
              showGlow={getSeriesPipeValue(state, "radarShowGlow", index)}
              showPoints={getSeriesPipeValue(state, "radarShowPoints", index)}
              showStroke={getSeriesPipeValue(state, "radarShowStroke", index)}
            />
          </StudioVisibleLayer>
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
      state={ctx.chromeState}
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
