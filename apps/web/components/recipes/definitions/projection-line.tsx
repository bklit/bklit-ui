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
  ProjectionLine,
  XAxis,
} from "@bklitui/ui/charts";
import type { Recipe } from "@/lib/recipes/types";
import { recipeDailyData } from "../recipe-data";

const projection = buildProjectionPath({
  sourceData: recipeDailyData,
  seriesKey: "visitors",
  mode: "auto",
  autoMethod: "linearRegression",
  pathDensity: "endpoints",
  horizonPoints: 7,
});

function ForecastLine() {
  return (
    <LineChart data={recipeDailyData}>
      <Grid horizontal />
      <Line dataKey="visitors" stroke="var(--chart-1)" strokeWidth={2} />
      <LineSeriesTerminalMarker
        dataKey="visitors"
        ringGap={6}
        stroke="var(--chart-1)"
      />
      <ProjectionLine
        curveKind="bezier"
        data={projection}
        gradientEnd="var(--chart-3)"
        gradientStart="var(--chart-1)"
        showEndMarker
        stroke="var(--chart-1)"
        strokeDasharray="1,4"
        strokeStyle="gradient"
      />
      <XAxis />
      <ChartTooltip />
    </LineChart>
  );
}

function ForecastArea() {
  return (
    <AreaChart data={recipeDailyData}>
      <Grid horizontal />
      <Area
        dataKey="visitors"
        fill="var(--chart-1)"
        fillOpacity={0.25}
        strokeWidth={2}
      />
      <LineSeriesTerminalMarker
        dataKey="visitors"
        ringGap={6}
        stroke="var(--chart-1)"
      />
      <ProjectionLine
        curveKind="bezier"
        data={projection}
        gradientEnd="var(--chart-3)"
        gradientStart="var(--chart-1)"
        showEndMarker
        stroke="var(--chart-1)"
        strokeDasharray="1,4"
        strokeStyle="gradient"
      />
      <XAxis />
      <ChartTooltip />
    </AreaChart>
  );
}

const projectionImports = (
  chartImport: string
) => `import { useMemo } from "react";
${chartImport}
import { Grid } from "@/components/charts/grid";
import { LineSeriesTerminalMarker } from "@/components/charts/line-series-terminal-marker";
import { ProjectionLine } from "@/components/charts/projection-line";
import { buildProjectionPath } from "@/components/charts/projection-utils";
import { ChartTooltip } from "@/components/charts/tooltip";
import { XAxis } from "@/components/charts/x-axis";`;

const PROJECTION_HOOK = `  const projection = useMemo(
    () =>
      buildProjectionPath({
        sourceData: data,
        seriesKey: "visitors",
        mode: "auto",
        autoMethod: "linearRegression",
        pathDensity: "endpoints",
        horizonPoints: 7,
      }),
    [data]
  );`;

const TERMINAL_MARKER_JSX = `      <LineSeriesTerminalMarker
        dataKey="visitors"
        ringGap={6}
        stroke="var(--chart-1)"
      />`;

const PROJECTION_JSX = `      <ProjectionLine
        curveKind="bezier"
        data={projection}
        gradientEnd="var(--chart-3)"
        gradientStart="var(--chart-1)"
        showEndMarker
        stroke="var(--chart-1)"
        strokeDasharray="1,4"
        strokeStyle="gradient"
      />`;

const STEPS = (root: string, series: string) => [
  "Only convert time-series charts that have no `<ChartBrush>` — projections and brush zoom are not supported together. Project only the headline series.",
  'Build the forecast with `buildProjectionPath` (from `@/components/charts/projection-utils`) inside `useMemo`: `sourceData` = the chart data, `seriesKey` = the headline `dataKey`, `mode: "auto"`, `autoMethod: "linearRegression"`, `pathDensity: "endpoints"`, `horizonPoints` ≈ a quarter of the visible points (7 for a month of days). If the product has a real target, use `mode: "target"` with `endValue` instead.',
  `Add \`<LineSeriesTerminalMarker dataKey="…" ringGap={6} stroke="<series colour>" />\` after the ${series} — a ring on the last real point where the forecast hands off.`,
  `Add \`<ProjectionLine data={projection} curveKind="bezier" strokeStyle="gradient" strokeDasharray="1,4" gradientStart="var(--chart-1)" gradientEnd="var(--chart-3)" showEndMarker />\` inside \`<${root}>\` (match \`gradientStart\` to the series colour). The chart extends its x-domain to fit the horizon automatically.`,
  "Keep `<XAxis />` and `<ChartTooltip />` unchanged.",
];

export const projectionLine: Recipe = {
  id: "projection-line",
  title: "Forecast projection",
  category: "forecasts-ranges",
  description:
    "Hand the series off to a dotted gradient forecast ending in a dot at the horizon.",
  look: "the headline series ends on its last real point, marked with a hollow ring, then continues as a dotted (`1,4`) bezier forecast whose stroke blends from the series colour (`--chart-1`) to `--chart-3`, ending in a small dot at the horizon. The x axis extends to fit the forecast; history keeps its normal styling.",
  charts: [
    {
      id: "line",
      label: "Line",
      rootComponent: "LineChart",
      Preview: ForecastLine,
      install: ["projection-line"],
      steps: STEPS("LineChart", "`<Line>`"),
      code: `"use client";

${projectionImports('import { Line, LineChart } from "@/components/charts/line-chart";')}

export function VisitorsChart({
  data,
}: {
  data: { date: Date; visitors: number }[];
}) {
${PROJECTION_HOOK}

  return (
    <LineChart data={data}>
      <Grid horizontal />
      <Line dataKey="visitors" stroke="var(--chart-1)" strokeWidth={2} />
${TERMINAL_MARKER_JSX}
${PROJECTION_JSX}
      <XAxis />
      <ChartTooltip />
    </LineChart>
  );
}
`,
    },
    {
      id: "area",
      label: "Area",
      rootComponent: "AreaChart",
      Preview: ForecastArea,
      install: ["projection-line", "area-chart"],
      steps: STEPS("AreaChart", "`<Area>`"),
      code: `"use client";

${projectionImports('import { Area, AreaChart } from "@/components/charts/area-chart";')}

export function VisitorsChart({
  data,
}: {
  data: { date: Date; visitors: number }[];
}) {
${PROJECTION_HOOK}

  return (
    <AreaChart data={data}>
      <Grid horizontal />
      <Area
        dataKey="visitors"
        fill="var(--chart-1)"
        fillOpacity={0.25}
        strokeWidth={2}
      />
${TERMINAL_MARKER_JSX}
${PROJECTION_JSX}
      <XAxis />
      <ChartTooltip />
    </AreaChart>
  );
}
`,
    },
  ],
};
