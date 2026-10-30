"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  BarXAxis,
  ChartTooltip,
  LinearGradient,
  XAxis,
} from "@bklitui/ui/charts";
import { useId } from "react";
import type { Recipe } from "@/lib/recipes/types";
import { recipeDailyData, recipeMonthlyData } from "../recipe-data";
import { BAR_MARGIN } from "./shared";

function GlowArea() {
  return (
    <AreaChart data={recipeDailyData}>
      <Area
        dataKey="visitors"
        fadeEdges
        fill="var(--chart-1)"
        fillOpacity={0.6}
        gradientToOpacity={0}
        strokeWidth={2}
      />
      <XAxis />
      <ChartTooltip />
    </AreaChart>
  );
}

function GlowBar() {
  const gradientId = `recipe-glow-${useId().replace(/:/g, "")}`;
  return (
    <BarChart data={recipeMonthlyData} margin={BAR_MARGIN} xDataKey="month">
      <LinearGradient
        from="var(--chart-1)"
        fromOpacity={1}
        id={gradientId}
        to="var(--chart-1)"
        toOpacity={0.12}
      />
      <Bar
        dataKey="revenue"
        fill={`url(#${gradientId})`}
        lineCap={6}
        stroke="var(--chart-1)"
      />
      <BarXAxis />
      <ChartTooltip />
    </BarChart>
  );
}

export const gradientGlow: Recipe = {
  id: "gradient-glow",
  title: "Gradient glow",
  category: "color-shape",
  description:
    "No grid at all — saturated fills that melt into the background.",
  look: "no grid lines or background texture; each series is filled with a strong `var(--chart-1)` gradient that fades to fully transparent at the baseline, so the shape seems to glow out of the page.",
  charts: [
    {
      id: "area",
      label: "Area",
      rootComponent: "AreaChart",
      Preview: GlowArea,
      install: ["area-chart"],
      steps: [
        "Remove the `<Grid />` (or `<Background />`) child of `<AreaChart>` and its import.",
        'On each `<Area>`, set `fill="var(--chart-1)"` (or the series\' existing `--chart-N` token), `fillOpacity={0.6}`, `gradientToOpacity={0}`, `strokeWidth={2}` and add `fadeEdges` so the fill also fades at the left and right edges.',
        "Keep `<XAxis />` and `<ChartTooltip />` unchanged.",
      ],
      code: `"use client";

import { Area, AreaChart } from "@/components/charts/area-chart";
import { ChartTooltip } from "@/components/charts/tooltip";
import { XAxis } from "@/components/charts/x-axis";

export function VisitorsChart({
  data,
}: {
  data: { date: Date; visitors: number }[];
}) {
  return (
    <AreaChart data={data}>
      <Area
        dataKey="visitors"
        fadeEdges
        fill="var(--chart-1)"
        fillOpacity={0.6}
        gradientToOpacity={0}
        strokeWidth={2}
      />
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
      Preview: GlowBar,
      install: ["bar-chart"],
      steps: [
        "Remove the `<Grid />` (or `<Background />`) child of `<BarChart>` and its import.",
        "Add a vertical `<LinearGradient>` (from `@/components/charts/gradients`, installed with `@bklit/bar-chart`) as the first child of `<BarChart>`: `from` and `to` set to the series colour (e.g. `var(--chart-1)`), `fromOpacity={1}`, `toOpacity={0.12}`, and an `id` made unique with `useId()`.",
        "On each `<Bar>`, set `fill` to `url(#<that id>)`, `stroke` to the solid series colour (the tooltip dot uses it, since the fill is a gradient) and `lineCap={6}` for softer tops.",
        "Keep `<BarXAxis />` and `<ChartTooltip />` unchanged.",
      ],
      code: `"use client";

import { useId } from "react";
import { Bar } from "@/components/charts/bar";
import { BarChart } from "@/components/charts/bar-chart";
import { BarXAxis } from "@/components/charts/bar-x-axis";
import { LinearGradient } from "@/components/charts/gradients";
import { ChartTooltip } from "@/components/charts/tooltip";

export function RevenueChart({
  data,
}: {
  data: { month: string; revenue: number }[];
}) {
  const gradientId = \`revenue-glow-\${useId().replace(/:/g, "")}\`;

  return (
    <BarChart
      data={data}
      margin={{ top: 8, right: 8, bottom: 40, left: 8 }}
      xDataKey="month"
    >
      <LinearGradient
        from="var(--chart-1)"
        fromOpacity={1}
        id={gradientId}
        to="var(--chart-1)"
        toOpacity={0.12}
      />
      <Bar
        dataKey="revenue"
        fill={\`url(#\${gradientId})\`}
        lineCap={6}
        stroke="var(--chart-1)"
      />
      <BarXAxis />
      <ChartTooltip />
    </BarChart>
  );
}
`,
    },
  ],
};
