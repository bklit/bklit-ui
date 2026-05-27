"use client";

import { ChartTooltip, Grid, Line, LineChart, XAxis } from "@bklitui/ui/charts";
import { StudioCartesianFill } from "@/components/studio/charts/studio-chart-layout";
import { fadeEdgesPropValue } from "@/components/studio/controls/fade-edges-picker";
import { useStudioMotionRemountKey } from "@/components/studio/use-studio-motion-remount";
import { getStudioCssRevealPropsForPreview } from "@/lib/studio/chart-animation";
import { resolveCurve } from "@/lib/studio/curves";
import {
  clampStudioSeriesCount,
  generateStudioCartesianData,
  STUDIO_SERIES_COLORS,
  STUDIO_SERIES_KEYS,
} from "@/lib/studio/demo-data";
import { seriesStrokePropsFromState } from "@/lib/studio/series-stroke-props";
import type { StudioUrlState } from "@/lib/studio/studio-parsers";

export function PlaygroundLineChart({
  state,
  committedState,
  motionCurveDragging,
  replayKey,
}: {
  state: StudioUrlState;
  committedState: StudioUrlState;
  motionCurveDragging: boolean;
  replayKey: number;
}) {
  const motionRemountKey = useStudioMotionRemountKey(state);
  const seriesCount = clampStudioSeriesCount(state.dataSeries);
  const data = generateStudioCartesianData({
    seriesCount,
    pointCount: state.dataPoints,
    xAxis: "date",
  });
  const seriesStroke = seriesStrokePropsFromState(state, data.length);
  const motionProps = getStudioCssRevealPropsForPreview(state, {
    motionCurveDragging,
    committedState,
    isRecording: false,
  });

  return (
    <StudioCartesianFill>
      <LineChart
        {...motionProps}
        className="size-full"
        data={data}
        key={`${replayKey}-${motionRemountKey}`}
      >
        <Grid horizontal />
        {STUDIO_SERIES_KEYS.slice(0, seriesCount).map((key, idx) => (
          <Line
            curve={resolveCurve(state.curve)}
            dataKey={key}
            fadeEdges={fadeEdgesPropValue(state.fadeEdges)}
            key={key}
            showHighlight={state.showHighlight}
            stroke={idx === 0 ? undefined : STUDIO_SERIES_COLORS[idx]}
            strokeWidth={state.strokeWidth}
            {...seriesStroke}
          />
        ))}
        <XAxis />
        <ChartTooltip />
      </LineChart>
    </StudioCartesianFill>
  );
}
