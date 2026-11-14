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
import { RECIPE_REVENUE_GOAL, recipeRevenueData } from "../recipe-data";

const HISTORY = "var(--chart-positive)";
const FORECAST = "oklch(0.83 0.14 85)";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});
const formatCurrency = (value: number) => currency.format(value);

const projection = buildProjectionPath({
  sourceData: recipeRevenueData,
  seriesKey: "revenue",
  mode: "auto",
  autoMethod: "linearRegression",
  pathDensity: "endpoints",
  horizonPoints: 12,
});

function ProjectionHatched() {
  return (
    <AreaChart data={recipeRevenueData}>
      <Grid horizontal />
      <Area
        dataKey="revenue"
        fadeBottom={100}
        fill={HISTORY}
        fillOpacity={0.12}
        strokeWidth={2}
      />
      <LineSeriesTerminalMarker
        dataKey="revenue"
        fill="var(--background)"
        radius={4}
        stroke={HISTORY}
      />
      <ProjectionLine
        areaFadeBottom={100}
        areaFill="pattern"
        areaOpacity={0.35}
        areaPatternTint={0.12}
        data={projection}
        endMarkerFill="var(--background)"
        endpointRadius={5}
        formatEndLabel={formatCurrency}
        showEndLabel
        showGuides
        stroke={FORECAST}
        strokeDasharray="none"
        target={RECIPE_REVENUE_GOAL}
      />
      <XAxis />
      <ChartTooltip />
    </AreaChart>
  );
}

function ProjectionGradient() {
  return (
    <LineChart data={recipeRevenueData}>
      <Grid horizontal />
      <Line dataKey="revenue" stroke={HISTORY} strokeWidth={2} />
      <LineSeriesTerminalMarker
        dataKey="revenue"
        fill="var(--background)"
        radius={4}
        stroke={HISTORY}
      />
      <ProjectionLine
        areaFill="gradient"
        areaOpacity={0.3}
        data={projection}
        endMarkerFill="var(--background)"
        formatEndLabel={formatCurrency}
        gradientEnd={FORECAST}
        gradientStart={HISTORY}
        showEndLabel
        showGuides
        stroke={FORECAST}
        strokeDasharray="1,4"
        strokeStyle="gradient"
        target={RECIPE_REVENUE_GOAL}
      />
      <XAxis />
      <ChartTooltip />
    </LineChart>
  );
}

const imports = (chartImport: string) => `import { useMemo } from "react";
${chartImport}
import { Grid } from "@/components/charts/grid";
import { LineSeriesTerminalMarker } from "@/components/charts/line-series-terminal-marker";
import { ProjectionLine } from "@/components/charts/projection-line";
import { buildProjectionPath } from "@/components/charts/projection-utils";
import { ChartTooltip } from "@/components/charts/tooltip";
import { XAxis } from "@/components/charts/x-axis";`;

const SETUP = `const HISTORY = "var(--chart-positive)";
const FORECAST = "oklch(0.83 0.14 85)";
const GOAL = 10_000;

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});
const formatCurrency = (value: number) => currency.format(value);`;

const PROJECTION_HOOK = `  const projection = useMemo(
    () =>
      buildProjectionPath({
        sourceData: data,
        seriesKey: "revenue",
        mode: "auto",
        autoMethod: "linearRegression",
        pathDensity: "endpoints",
        horizonPoints: 12,
      }),
    [data]
  );`;

const TERMINAL_MARKER_JSX = `      <LineSeriesTerminalMarker
        dataKey="revenue"
        fill="var(--background)"
        radius={4}
        stroke={HISTORY}
      />`;

const STEPS = (root: string, fillStep: string) => [
  "Only convert time-series charts that have no `<ChartBrush>` — projections and brush zoom are not supported together. Project only the headline series (ideally a cumulative one, like month-to-date revenue).",
  'Build the forecast with `buildProjectionPath` (from `@/components/charts/projection-utils`) inside `useMemo`: `sourceData` = the chart data, `seriesKey` = the headline `dataKey`, `mode: "auto"`, `autoMethod: "linearRegression"`, `pathDensity: "endpoints"`, `horizonPoints` = the rows left until the period ends.',
  `Colour history and forecast apart: history in \`var(--chart-positive)\`, forecast in a warm gold (\`oklch(0.83 0.14 85)\`). Add a hollow \`<LineSeriesTerminalMarker dataKey="…" fill="var(--background)" radius={4} stroke="<history colour>" />\` after the series.`,
  `Add \`<ProjectionLine data={projection} stroke="<forecast colour>" target={<goal>} showGuides showEndLabel formatEndLabel={formatCurrency} endMarkerFill="var(--background)" … />\` inside \`<${root}>\`. \`target\` draws the dashed goal line and a ring where the forecast crosses it; \`showGuides\` adds dashed verticals at the hand-off and the crossing.`,
  fillStep,
  "Keep `<XAxis />` and `<ChartTooltip />` unchanged. The chart extends its x-domain to fit the horizon automatically.",
];

export const projectionArea: Recipe = {
  id: "projection-area",
  title: "Projected goal",
  category: "forecasts-ranges",
  description:
    "Project a running total to the end of the period, shade the forecast with its own fill, and mark where it crosses the goal.",
  look: "the history is a green (`--chart-positive`) series ending on a hollow ring; from there a gold forecast runs to the end of the period with its own fill underneath — a diagonal hatch over a soft gold wash that fades to nothing at the baseline (or a fading gradient on the line version). A dashed horizontal line marks the goal, a hollow ring with a soft glow sits where the forecast crosses it, dashed verticals drop from the hand-off and the crossing, and the horizon ends in a hollow ring labelled with the projected value in currency.",
  charts: [
    {
      id: "area",
      label: "Area",
      rootComponent: "AreaChart",
      Preview: ProjectionHatched,
      install: ["projection-line", "area-chart"],
      steps: STEPS(
        "AreaChart",
        'Shade the forecast with a hatch over a gradient: `areaFill="pattern" areaOpacity={0.35} areaPatternTint={0.12} areaFadeBottom={100}`, solid stroke (`strokeDasharray="none"`). Give the history `<Area>` a faint fill (`fillOpacity={0.12} fadeBottom={100}`).'
      ),
      code: `"use client";

${imports('import { Area, AreaChart } from "@/components/charts/area-chart";')}

${SETUP}

export function RevenueChart({
  data,
}: {
  data: { date: Date; revenue: number }[];
}) {
${PROJECTION_HOOK}

  return (
    <AreaChart data={data}>
      <Grid horizontal />
      <Area
        dataKey="revenue"
        fadeBottom={100}
        fill={HISTORY}
        fillOpacity={0.12}
        strokeWidth={2}
      />
${TERMINAL_MARKER_JSX}
      <ProjectionLine
        areaFadeBottom={100}
        areaFill="pattern"
        areaOpacity={0.35}
        areaPatternTint={0.12}
        data={projection}
        endMarkerFill="var(--background)"
        formatEndLabel={formatCurrency}
        showEndLabel
        showGuides
        stroke={FORECAST}
        strokeDasharray="none"
        target={GOAL}
      />
      <XAxis />
      <ChartTooltip />
    </AreaChart>
  );
}
`,
    },
    {
      id: "line",
      label: "Line",
      rootComponent: "LineChart",
      Preview: ProjectionGradient,
      install: ["projection-line"],
      steps: STEPS(
        "LineChart",
        'Shade the forecast with a fading gradient: `areaFill="gradient" areaOpacity={0.3}`, and blend the dotted stroke from history to forecast colour (`strokeStyle="gradient" gradientStart="<history>" gradientEnd="<forecast>" strokeDasharray="1,4"`).'
      ),
      code: `"use client";

${imports('import { Line, LineChart } from "@/components/charts/line-chart";')}

${SETUP}

export function RevenueChart({
  data,
}: {
  data: { date: Date; revenue: number }[];
}) {
${PROJECTION_HOOK}

  return (
    <LineChart data={data}>
      <Grid horizontal />
      <Line dataKey="revenue" stroke={HISTORY} strokeWidth={2} />
${TERMINAL_MARKER_JSX}
      <ProjectionLine
        areaFill="gradient"
        areaOpacity={0.3}
        data={projection}
        endMarkerFill="var(--background)"
        formatEndLabel={formatCurrency}
        gradientEnd={FORECAST}
        gradientStart={HISTORY}
        showEndLabel
        showGuides
        stroke={FORECAST}
        strokeDasharray="1,4"
        strokeStyle="gradient"
        target={GOAL}
      />
      <XAxis />
      <ChartTooltip />
    </LineChart>
  );
}
`,
    },
  ],
};
