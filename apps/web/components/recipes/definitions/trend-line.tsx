"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  BarXAxis,
  ChartTooltip,
  Grid,
  Line,
  LineChart,
  TrendLine,
  XAxis,
} from "@bklitui/ui/charts";
import type { Recipe } from "@/lib/recipes/types";
import { recipeDailyData, recipeMonthlyData } from "../recipe-data";
import { BAR_MARGIN } from "./shared";

function TrendOnLine() {
  return (
    <LineChart data={recipeDailyData}>
      <Grid horizontal />
      <Line
        dataKey="visitors"
        stroke="color-mix(in oklch, var(--chart-1) 55%, transparent)"
        strokeWidth={1.5}
      />
      <TrendLine
        dataKey="visitors"
        fadeEdges
        gradientEnd="var(--chart-1)"
        gradientStart="var(--chart-3)"
        strokeStyle="gradient"
        strokeWidth={2.5}
      />
      <XAxis />
      <ChartTooltip />
    </LineChart>
  );
}

function TrendOnArea() {
  return (
    <AreaChart data={recipeDailyData}>
      <Grid horizontal />
      <Area dataKey="visitors" fillOpacity={0.2} strokeWidth={1.5} />
      <TrendLine
        dataKey="visitors"
        fadeEdges
        gradientEnd="var(--chart-1)"
        gradientStart="var(--chart-3)"
        strokeStyle="gradient"
        strokeWidth={2.5}
      />
      <XAxis />
      <ChartTooltip />
    </AreaChart>
  );
}

function TrendOnBar() {
  return (
    <BarChart data={recipeMonthlyData} margin={BAR_MARGIN} xDataKey="month">
      <Grid horizontal />
      <Bar
        dataKey="revenue"
        fill="color-mix(in oklch, var(--chart-1) 45%, transparent)"
        lineCap="round"
        stroke="var(--chart-1)"
      />
      <TrendLine
        dataKey="revenue"
        fadeEdges
        gradientEnd="var(--chart-1)"
        gradientStart="var(--chart-3)"
        strokeStyle="gradient"
        strokeWidth={2.5}
      />
      <BarXAxis />
      <ChartTooltip showCrosshair={false} />
    </BarChart>
  );
}

const TREND_JSX = (dataKey: string) => `      <TrendLine
        dataKey="${dataKey}"
        fadeEdges
        gradientEnd="var(--chart-1)"
        gradientStart="var(--chart-3)"
        strokeStyle="gradient"
        strokeWidth={2.5}
      />`;

const TREND_STEP =
  'Add `<TrendLine dataKey="…" strokeStyle="gradient" gradientStart="var(--chart-3)" gradientEnd="var(--chart-1)" strokeWidth={2.5} fadeEdges />` (from `@/components/charts/trend-line`) **after** the series it fits, so it draws on top. It is a least-squares straight line across the full data range; use the headline series\' `dataKey`.';

export const trendLine: Recipe = {
  id: "trend-line",
  title: "Trend line",
  category: "forecasts-ranges",
  description:
    "Quiet the raw series and lay a bold gradient line of best fit across it.",
  look: "the raw series is pushed back (thinner stroke, lower opacity) and a bold straight line of best fit runs across the whole range on top of it, blending from `--chart-3` to `--chart-1` and fading out at both ends — the eye reads direction first, detail second.",
  charts: [
    {
      id: "line",
      label: "Line",
      rootComponent: "LineChart",
      Preview: TrendOnLine,
      install: ["trend-line"],
      steps: [
        'Soften the headline `<Line>`: `strokeWidth={1.5}` and a translucent stroke of its colour, e.g. `stroke="color-mix(in oklch, var(--chart-1) 55%, transparent)"`.',
        TREND_STEP,
        "Keep `<Grid horizontal />`, `<XAxis />` and `<ChartTooltip />`.",
      ],
      code: `"use client";

import { Grid } from "@/components/charts/grid";
import { Line, LineChart } from "@/components/charts/line-chart";
import { ChartTooltip } from "@/components/charts/tooltip";
import { TrendLine } from "@/components/charts/trend-line";
import { XAxis } from "@/components/charts/x-axis";

export function VisitorsChart({
  data,
}: {
  data: { date: Date; visitors: number }[];
}) {
  return (
    <LineChart data={data}>
      <Grid horizontal />
      <Line
        dataKey="visitors"
        stroke="color-mix(in oklch, var(--chart-1) 55%, transparent)"
        strokeWidth={1.5}
      />
${TREND_JSX("visitors")}
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
      Preview: TrendOnArea,
      install: ["trend-line"],
      steps: [
        "Soften the headline `<Area>`: `fillOpacity={0.2}` and `strokeWidth={1.5}`.",
        TREND_STEP,
        "Keep `<Grid horizontal />`, `<XAxis />` and `<ChartTooltip />`.",
      ],
      code: `"use client";

import { Area, AreaChart } from "@/components/charts/area-chart";
import { Grid } from "@/components/charts/grid";
import { ChartTooltip } from "@/components/charts/tooltip";
import { TrendLine } from "@/components/charts/trend-line";
import { XAxis } from "@/components/charts/x-axis";

export function VisitorsChart({
  data,
}: {
  data: { date: Date; visitors: number }[];
}) {
  return (
    <AreaChart data={data}>
      <Grid horizontal />
      <Area dataKey="visitors" fillOpacity={0.2} strokeWidth={1.5} />
${TREND_JSX("visitors")}
      <XAxis />
      <ChartTooltip />
    </AreaChart>
  );
}
`,
    },
    {
      id: "bar",
      label: "Bar",
      rootComponent: "BarChart",
      Preview: TrendOnBar,
      install: ["trend-line"],
      steps: [
        'Soften the headline `<Bar>`: a translucent fill of its colour, `fill="color-mix(in oklch, var(--chart-1) 45%, transparent)"`, keep the solid colour as `stroke` (the tooltip dot uses it) and `lineCap="round"`.',
        `${TREND_STEP} Works on vertical and horizontal bar charts.`,
        "Set `showCrosshair={false}` on `<ChartTooltip />` if it isn't already; keep `<Grid horizontal />` and `<BarXAxis />`.",
      ],
      code: `"use client";

import { Bar } from "@/components/charts/bar";
import { BarChart } from "@/components/charts/bar-chart";
import { BarXAxis } from "@/components/charts/bar-x-axis";
import { Grid } from "@/components/charts/grid";
import { ChartTooltip } from "@/components/charts/tooltip";
import { TrendLine } from "@/components/charts/trend-line";

export function RevenueChart({
  data,
}: {
  data: { month: string; revenue: number }[];
}) {
  return (
    <BarChart
      data={data}
      margin={{ top: 8, right: 8, bottom: 40, left: 8 }}
      xDataKey="month"
    >
      <Grid horizontal />
      <Bar
        dataKey="revenue"
        fill="color-mix(in oklch, var(--chart-1) 45%, transparent)"
        lineCap="round"
        stroke="var(--chart-1)"
      />
${TREND_JSX("revenue")}
      <BarXAxis />
      <ChartTooltip showCrosshair={false} />
    </BarChart>
  );
}
`,
    },
  ],
};
