"use client";

import {
  buildProjectionPath,
  ChartTooltip,
  Grid,
  Line,
  LineChart,
  LineSeriesTerminalMarker,
  ProjectionLine,
  XAxis,
} from "@bklitui/ui/charts";

const chartData = Array.from({ length: 14 }, (_, index) => {
  const date = new Date(2025, 0, 1 + index);
  return {
    date,
    value: Math.round(140 + index * 8 + Math.sin(index / 2) * 18),
  };
});

const projectionPath = buildProjectionPath({
  sourceData: chartData,
  seriesKey: "value",
  mode: "auto",
  autoMethod: "lastSegment",
  pathDensity: "endpoints",
  horizonPoints: 8,
});

export function ProjectionLineDemo() {
  return (
    <div className="w-full">
      <LineChart data={chartData}>
        <Grid horizontal />
        <Line dataKey="value" stroke="var(--chart-1)" strokeWidth={2} />
        <LineSeriesTerminalMarker
          dataKey="value"
          ringGap={2}
          stroke="var(--chart-1)"
        />
        <ProjectionLine
          curveKind="bezier"
          data={projectionPath}
          showEndMarker
          stroke="var(--chart-3)"
          strokeDasharray="6,4"
          strokeWidth={2}
        />
        <XAxis />
        <ChartTooltip />
      </LineChart>
    </div>
  );
}

export function ProjectionLineGradientDemo() {
  return (
    <div className="w-full">
      <LineChart data={chartData}>
        <Grid horizontal />
        <Line dataKey="value" stroke="var(--chart-1)" strokeWidth={2} />
        <LineSeriesTerminalMarker dataKey="value" stroke="var(--chart-1)" />
        <ProjectionLine
          curveKind="linear"
          data={projectionPath}
          gradientEnd="var(--chart-5)"
          gradientStart="var(--chart-3)"
          showEndMarker={false}
          stroke="var(--chart-3)"
          strokeStyle="gradient"
          strokeWidth={2.5}
        />
        <XAxis />
        <ChartTooltip />
      </LineChart>
    </div>
  );
}
