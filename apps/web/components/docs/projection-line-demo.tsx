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
import { buildLineChartDemoData } from "@/components/docs/line-chart-demo-data";

const chartData = buildLineChartDemoData();

const targetProjectionPath = buildProjectionPath({
  sourceData: chartData,
  seriesKey: "value",
  mode: "target",
  pathDensity: "endpoints",
  horizonPoints: 6,
  endValue: 301,
});

const autoProjectionPath = buildProjectionPath({
  sourceData: chartData,
  seriesKey: "value",
  mode: "auto",
  autoMethod: "lastSegment",
  pathDensity: "endpoints",
  horizonPoints: 6,
});

export function ProjectionLineDemo() {
  return (
    <div className="w-full">
      <LineChart data={chartData}>
        <Grid horizontal />
        <Line dataKey="value" stroke="var(--chart-1)" strokeWidth={2} />
        <LineSeriesTerminalMarker
          dataKey="value"
          ringGap={6}
          stroke="var(--chart-1)"
        />
        <ProjectionLine
          curveKind="bezier"
          data={targetProjectionPath}
          gradientEnd="oklch(0.59 0.17 166.38)"
          gradientStart="oklch(0.979 0.037 110.273)"
          showEndMarker
          stroke="var(--chart-3)"
          strokeDasharray="1,4"
          strokeStyle="gradient"
          strokeWidth={2}
        />
        <ProjectionLine
          curveKind="bezier"
          data={autoProjectionPath}
          gradientEnd="oklch(0.849 0.232 16.498)"
          gradientStart="oklch(0.926 0.128 16.866 / 0.73)"
          showEndMarker
          stroke="oklch(0.926 0.128 32.86 / 0.73)"
          strokeDasharray="1,4"
          strokeStyle="gradient"
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
          curveKind="bezier"
          data={autoProjectionPath}
          gradientEnd="oklch(0.849 0.232 16.498)"
          gradientStart="oklch(0.926 0.128 16.866 / 0.73)"
          showEndMarker={false}
          stroke="oklch(0.926 0.128 32.86 / 0.73)"
          strokeStyle="gradient"
          strokeWidth={2}
        />
        <XAxis />
        <ChartTooltip />
      </LineChart>
    </div>
  );
}
