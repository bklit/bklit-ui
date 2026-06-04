"use client";

import {
  chartTooltipPropsFromState,
  fadeEdgesPropValue,
  getStudioCssRevealPropsForPreview,
  resolveCurve,
  STUDIO_SERIES_COLORS,
  StudioChartShell,
  type StudioUrlState,
  StudioVisibleLayer,
  seriesStrokePropsFromState,
  studioCartesianLegendItems,
  useStudioMotionRemountKey,
} from "@bklitui/studio";
import {
  ChartTooltip,
  Grid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "@bklitui/ui/charts";
import { useMemo } from "react";

const BIAXIAL_SERIES = ["desktop", "mobile"] as const;

/** Biaxial demo (Recharts-style): two metrics on independent Y scales. */
function generateBiaxialDemoData(pointCount: number, seed = 0) {
  const baseYear = 2024;
  const phase = seed * 0.4;
  return Array.from({ length: pointCount }, (_, index) => ({
    date: new Date(baseYear, 0, index + 1),
    desktop: Math.round(2500 + Math.sin(index / 2 + phase) * 1200 + index * 35),
    mobile: Math.round(
      9000 + Math.cos(index / 2.5 + phase) * 3500 + index * 80
    ),
  }));
}

export function PlaygroundLineChart({
  state,
  committedState,
  motionCurveDragging,
  replayKey,
  dataSeed = 0,
}: {
  state: StudioUrlState;
  committedState: StudioUrlState;
  motionCurveDragging: boolean;
  replayKey: number;
  dataSeed?: number;
}) {
  const motionRemountKey = useStudioMotionRemountKey(state);
  const data = useMemo(
    () => generateBiaxialDemoData(state.dataPoints, dataSeed),
    [state.dataPoints, dataSeed]
  );
  const seriesStroke = seriesStrokePropsFromState(state, BIAXIAL_SERIES.length);
  const motionProps = getStudioCssRevealPropsForPreview(state, {
    motionCurveDragging,
    committedState,
    isRecording: false,
  });

  const legendItems = useMemo(() => {
    const last = data.at(-1);
    const values = BIAXIAL_SERIES.map((key) => {
      const value = last?.[key];
      return typeof value === "number" ? value : 0;
    });
    return studioCartesianLegendItems(state, BIAXIAL_SERIES.length, values);
  }, [data, state]);

  return (
    <StudioChartShell
      legendComponentId="line.legend"
      legendItems={legendItems}
      state={state}
    >
      <LineChart
        {...motionProps}
        className="size-full"
        data={data}
        key={`${replayKey}-${motionRemountKey}`}
        margin={{ top: 40, right: 56, bottom: 40, left: 56 }}
      >
        <StudioVisibleLayer componentId="line.grid" state={state}>
          <Grid horizontal />
        </StudioVisibleLayer>
        <StudioVisibleLayer componentId="line.series.0" state={state}>
          <Line
            curve={resolveCurve(state.curve)}
            dataKey="desktop"
            fadeEdges={fadeEdgesPropValue(state.fadeEdges)}
            showHighlight={state.showHighlight}
            strokeWidth={state.strokeWidth}
            yAxisId="left"
            {...seriesStroke}
          />
        </StudioVisibleLayer>
        <StudioVisibleLayer componentId="line.series.1" state={state}>
          <Line
            curve={resolveCurve(state.curve)}
            dataKey="mobile"
            fadeEdges={fadeEdgesPropValue(state.fadeEdges)}
            showHighlight={state.showHighlight}
            stroke={STUDIO_SERIES_COLORS[1]}
            strokeWidth={state.strokeWidth}
            yAxisId="right"
            {...seriesStroke}
          />
        </StudioVisibleLayer>
        <StudioVisibleLayer componentId="line.yaxis.left" state={state}>
          <YAxis
            formatValue={(v) => `${(v / 1000).toFixed(1)}k`}
            yAxisId="left"
          />
        </StudioVisibleLayer>
        <StudioVisibleLayer componentId="line.yaxis.right" state={state}>
          <YAxis
            formatValue={(v) => `${Math.round(v / 1000)}k`}
            orientation="right"
            yAxisId="right"
          />
        </StudioVisibleLayer>
        <StudioVisibleLayer componentId="line.xaxis" state={state}>
          <XAxis />
        </StudioVisibleLayer>
        <StudioVisibleLayer componentId="line.tooltip" state={state}>
          <ChartTooltip {...chartTooltipPropsFromState(state)} />
        </StudioVisibleLayer>
      </LineChart>
    </StudioChartShell>
  );
}
