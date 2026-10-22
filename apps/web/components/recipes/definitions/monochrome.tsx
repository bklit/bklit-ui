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
  XAxis,
} from "@bklitui/ui/charts";
import type { Recipe } from "@/lib/recipes/types";
import { recipeDailyData, recipeMonthlyData } from "../recipe-data";
import { BAR_MARGIN } from "./shared";

const MONO_FG = "var(--foreground)";
const MONO_MUTED = "var(--muted-foreground)";

function MonoLine() {
  return (
    <LineChart data={recipeDailyData}>
      <Grid horizontal strokeDasharray="1,4" />
      <Line dataKey="previous" stroke={MONO_MUTED} strokeWidth={1.5} />
      <Line dataKey="visitors" stroke={MONO_FG} strokeWidth={2} />
      <XAxis />
      <ChartTooltip />
    </LineChart>
  );
}

function MonoArea() {
  return (
    <AreaChart data={recipeDailyData}>
      <Grid horizontal strokeDasharray="1,4" />
      <Area
        dataKey="previous"
        fill={MONO_MUTED}
        fillOpacity={0.15}
        strokeWidth={1.5}
      />
      <Area dataKey="visitors" fill={MONO_FG} fillOpacity={0.12} />
      <XAxis />
      <ChartTooltip />
    </AreaChart>
  );
}

function MonoBar() {
  return (
    <BarChart data={recipeMonthlyData} margin={BAR_MARGIN} xDataKey="month">
      <Grid horizontal strokeDasharray="1,4" />
      <Bar dataKey="previous" fill={MONO_MUTED} lineCap={3} />
      <Bar dataKey="revenue" fill={MONO_FG} lineCap={3} />
      <BarXAxis />
      <ChartTooltip />
    </BarChart>
  );
}

export const monochrome: Recipe = {
  id: "monochrome",
  title: "Monochrome",
  category: "color-shape",
  description:
    "Ink-only charts: foreground for the headline series, muted for context, dotted guides.",
  look: "no palette colours — the headline series is drawn in the app's text colour (shadcn `var(--foreground)`), comparison series in `var(--muted-foreground)`, and grid lines become fine dotted guides. It follows light/dark mode automatically because both tokens flip.",
  charts: [
    {
      id: "line",
      label: "Line",
      rootComponent: "LineChart",
      Preview: MonoLine,
      install: ["line-chart"],
      steps: [
        'Set `<Grid horizontal strokeDasharray="1,4" />` (add a `<Grid />` first child if there is none) for dotted guides.',
        'Give the headline `<Line>` `stroke="var(--foreground)"` and `strokeWidth={2}`.',
        'Give every other `<Line>` `stroke="var(--muted-foreground)"` and `strokeWidth={1.5}`, and render them **before** the headline line so it paints on top.',
        "Remove any `--chart-N` / hex colours from the series; keep `<XAxis />` and `<ChartTooltip />`.",
      ],
      code: `"use client";

import { Grid } from "@/components/charts/grid";
import { Line, LineChart } from "@/components/charts/line-chart";
import { ChartTooltip } from "@/components/charts/tooltip";
import { XAxis } from "@/components/charts/x-axis";

export function VisitorsChart({
  data,
}: {
  data: { date: Date; visitors: number; previous: number }[];
}) {
  return (
    <LineChart data={data}>
      <Grid horizontal strokeDasharray="1,4" />
      <Line
        dataKey="previous"
        stroke="var(--muted-foreground)"
        strokeWidth={1.5}
      />
      <Line
        dataKey="visitors"
        stroke="var(--foreground)"
        strokeWidth={2}
      />
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
      Preview: MonoArea,
      install: ["area-chart"],
      steps: [
        'Set `<Grid horizontal strokeDasharray="1,4" />` (add a `<Grid />` first child if there is none).',
        'Give the headline `<Area>` `fill="var(--foreground)"` and `fillOpacity={0.12}` (its stroke follows `fill`).',
        'Give every other `<Area>` `fill="var(--muted-foreground)"`, `fillOpacity={0.15}` and `strokeWidth={1.5}`, rendered **before** the headline area.',
        "Remove any `--chart-N` / hex colours from the series; keep `<XAxis />` and `<ChartTooltip />`.",
      ],
      code: `"use client";

import { Area, AreaChart } from "@/components/charts/area-chart";
import { Grid } from "@/components/charts/grid";
import { ChartTooltip } from "@/components/charts/tooltip";
import { XAxis } from "@/components/charts/x-axis";

export function VisitorsChart({
  data,
}: {
  data: { date: Date; visitors: number; previous: number }[];
}) {
  return (
    <AreaChart data={data}>
      <Grid horizontal strokeDasharray="1,4" />
      <Area
        dataKey="previous"
        fill="var(--muted-foreground)"
        fillOpacity={0.15}
        strokeWidth={1.5}
      />
      <Area
        dataKey="visitors"
        fill="var(--foreground)"
        fillOpacity={0.12}
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
      Preview: MonoBar,
      install: ["bar-chart"],
      steps: [
        'Set `<Grid horizontal strokeDasharray="1,4" />` (add a `<Grid />` first child if there is none).',
        'Give the headline `<Bar>` `fill="var(--foreground)"` and every comparison `<Bar>` `fill="var(--muted-foreground)"`; use `lineCap={3}` on all of them.',
        "Remove any `--chart-N` / hex colours or gradient fills from the bars; keep `<BarXAxis />` and `<ChartTooltip />`.",
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
  data: { month: string; revenue: number; previous: number }[];
}) {
  return (
    <BarChart
      data={data}
      margin={{ top: 8, right: 8, bottom: 40, left: 8 }}
      xDataKey="month"
    >
      <Grid horizontal strokeDasharray="1,4" />
      <Bar dataKey="previous" fill="var(--muted-foreground)" lineCap={3} />
      <Bar dataKey="revenue" fill="var(--foreground)" lineCap={3} />
      <BarXAxis />
      <ChartTooltip />
    </BarChart>
  );
}
`,
    },
  ],
};
