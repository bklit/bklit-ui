"use client";

import {
  Area,
  AreaChart,
  buildProjectionPath,
  ChartTooltip,
  Grid,
  Line,
  LineChart,
  LineSeriesTerminalMarker,
  type ProjectionAreaFill,
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

const goalProjectionPath = buildProjectionPath({
  sourceData: chartData,
  seriesKey: "value",
  mode: "target",
  pathDensity: "endpoints",
  horizonPoints: 6,
  endValue: 262,
});

const PROJECTION_GOAL = 230;
const HISTORY_COLOR = "var(--chart-positive)";
const FORECAST_COLOR = "oklch(0.83 0.14 85)";

const AREA_FILL_PROPS: Record<
  Exclude<ProjectionAreaFill, "none">,
  {
    areaOpacity?: number;
    areaFadeBottom?: number;
    areaPatternTint?: number;
  }
> = {
  solid: { areaOpacity: 0.12 },
  gradient: { areaOpacity: 0.3 },
  pattern: { areaOpacity: 0.35, areaFadeBottom: 100, areaPatternTint: 0.12 },
};

/** Area history handing off to a filled projection with a goal crossing. */
export function ProjectionAreaDemo({
  areaFill = "pattern",
}: {
  areaFill?: Exclude<ProjectionAreaFill, "none">;
}) {
  return (
    <div className="w-full">
      <AreaChart data={chartData}>
        <Grid horizontal />
        <Area
          dataKey="value"
          fadeBottom={100}
          fill={HISTORY_COLOR}
          fillOpacity={0.12}
          strokeWidth={2}
        />
        <LineSeriesTerminalMarker
          dataKey="value"
          fill="var(--background)"
          radius={4}
          stroke={HISTORY_COLOR}
        />
        <ProjectionLine
          areaFill={areaFill}
          {...AREA_FILL_PROPS[areaFill]}
          data={goalProjectionPath}
          endMarkerFill="var(--background)"
          showEndLabel
          showGuides
          stroke={FORECAST_COLOR}
          strokeDasharray="none"
          target={PROJECTION_GOAL}
        />
        <XAxis />
        <ChartTooltip />
      </AreaChart>
    </div>
  );
}
