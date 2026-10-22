"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  BarXAxis,
  ChartTooltip,
  Grid,
  XAxis,
} from "@bklitui/ui/charts";
import type { Recipe } from "@/lib/recipes/types";
import { recipeMonthlyData, recipeWeeklyData } from "../recipe-data";
import { BAR_MARGIN } from "./shared";

function LabelsArea() {
  return (
    <AreaChart data={recipeWeeklyData}>
      <Grid horizontal strokeDasharray="1,4" />
      <Area
        dataKey="visitors"
        fillOpacity={0.2}
        showValue
        strokeWidth={2}
        valueLabelMaxCount={6}
      />
      <XAxis />
      <ChartTooltip />
    </AreaChart>
  );
}

function LabelsBar() {
  return (
    <BarChart data={recipeMonthlyData} margin={BAR_MARGIN} xDataKey="month">
      <Grid horizontal strokeDasharray="1,4" />
      <Bar dataKey="revenue" lineCap={4} showValue />
      <BarXAxis />
      <ChartTooltip />
    </BarChart>
  );
}

export const valueLabels: Recipe = {
  id: "value-labels",
  title: "Value labels",
  category: "hover-annotations",
  description:
    "Print the numbers on the chart — collision-aware labels that adapt to the width.",
  look: "the values are readable without hovering: area series print a handful of sampled value labels just above the line (the count adapts to the chart width and skips collisions), bars carry their value inside the top of each bar (rotated in narrow bars, hidden if it fits neither way). Grid lines become fine dotted guides so the labels carry the reading.",
  charts: [
    {
      id: "area",
      label: "Area",
      rootComponent: "AreaChart",
      Preview: LabelsArea,
      install: ["area-chart"],
      steps: [
        "Make sure `components/charts/area.tsx` supports `showValue` (installed after the value-labels release). If the prop is missing, re-run the install command to update `@bklit/area-chart` — but diff and keep any local edits.",
        "On each `<Area>`, add `showValue` and `valueLabelMaxCount={6}`. When several areas show values they share one label count; give them the same `valueLabelMaxCount`.",
        'Pass `valueLabelFormatter` (e.g. `(value) => (value / 1000).toFixed(1) + "k"`) when the values need units, currency or a locale; the default is English integer formatting.',
        'Change the grid to `<Grid horizontal strokeDasharray="1,4" />` (add one as the first child if there is none). Keep `<XAxis />` and `<ChartTooltip />`.',
      ],
      code: `"use client";

import { Area, AreaChart } from "@/components/charts/area-chart";
import { Grid } from "@/components/charts/grid";
import { ChartTooltip } from "@/components/charts/tooltip";
import { XAxis } from "@/components/charts/x-axis";

export function VisitorsChart({
  data,
}: {
  data: { date: Date; visitors: number }[];
}) {
  return (
    <AreaChart data={data}>
      <Grid horizontal strokeDasharray="1,4" />
      <Area
        dataKey="visitors"
        fillOpacity={0.2}
        showValue
        strokeWidth={2}
        valueLabelMaxCount={6}
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
      Preview: LabelsBar,
      install: ["bar-chart"],
      steps: [
        "Make sure `components/charts/bar.tsx` supports `showValue` (installed after the value-labels release). If the prop is missing, re-run the install command to update `@bklit/bar-chart` — but diff and keep any local edits.",
        "On each `<Bar>`, add `showValue` and `lineCap={4}`. Labels pick horizontal or rotated orientation automatically and hide when a bar is too small.",
        "Pass `valueLabelFormatter` when the values need units, currency or a locale.",
        'Change the grid to `<Grid horizontal strokeDasharray="1,4" />`. Keep `<BarXAxis />` and `<ChartTooltip />`.',
      ],
      code: `"use client";

import { Bar } from "@/components/charts/bar";
import { BarChart } from "@/components/charts/bar-chart";
import { BarXAxis } from "@/components/charts/bar-x-axis";
import { Grid } from "@/components/charts/grid";
import { ChartTooltip } from "@/components/charts/tooltip";

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
      <Grid horizontal strokeDasharray="1,4" />
      <Bar dataKey="revenue" lineCap={4} showValue />
      <BarXAxis />
      <ChartTooltip />
    </BarChart>
  );
}
`,
    },
  ],
};
