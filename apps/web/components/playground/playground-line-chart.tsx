"use client";

import {
  clampStudioSeriesCount,
  fadeEdgesPropValue,
  generateStudioCartesianData,
  getStudioCssRevealPropsForPreview,
  resolveCurve,
  STUDIO_SERIES_COLORS,
  STUDIO_SERIES_KEYS,
  StudioCartesianFill,
  type StudioUrlState,
  seriesStrokePropsFromState,
  useStudioMotionRemountKey,
} from "@bklitui/studio";
import { ChartTooltip, Grid, Line, LineChart, XAxis } from "@bklitui/ui/charts";

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
