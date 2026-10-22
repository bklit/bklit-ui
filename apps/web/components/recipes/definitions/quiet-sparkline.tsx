"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  ChartTooltip,
  Line,
  LineChart,
} from "@bklitui/ui/charts";
import type { Recipe } from "@/lib/recipes/types";
import { recipeDailyData, recipeMonthlyData } from "../recipe-data";
import { SPARK_MARGIN } from "./shared";

function SparkLine() {
  return (
    <div className="mx-auto w-full max-w-xl">
      <LineChart
        aspectRatio="4 / 1"
        data={recipeDailyData}
        margin={SPARK_MARGIN}
      >
        <Line dataKey="visitors" strokeWidth={2} />
        <ChartTooltip showDatePill={false} />
      </LineChart>
    </div>
  );
}

function SparkArea() {
  return (
    <div className="mx-auto w-full max-w-xl">
      <AreaChart
        aspectRatio="4 / 1"
        data={recipeDailyData}
        margin={SPARK_MARGIN}
      >
        <Area dataKey="visitors" fillOpacity={0.2} strokeWidth={1.5} />
        <ChartTooltip showDatePill={false} />
      </AreaChart>
    </div>
  );
}

function SparkBar() {
  return (
    <div className="mx-auto w-full max-w-xl">
      <BarChart
        aspectRatio="4 / 1"
        barGap={0.35}
        data={recipeMonthlyData}
        margin={SPARK_MARGIN}
        xDataKey="month"
      >
        <Bar dataKey="revenue" lineCap={2} />
        <ChartTooltip />
      </BarChart>
    </div>
  );
}

export const quietSparkline: Recipe = {
  id: "quiet-sparkline",
  title: "Quiet sparkline",
  category: "color-shape",
  description:
    "Strip the chrome — no grid, no axes, tight margins — for cards and tables.",
  look: "a compact 4:1 strip with no grid, no background, no axes and only 8px margins; the series alone carries the shape, and the tooltip still works on hover without the date pill.",
  charts: [
    {
      id: "line",
      label: "Line",
      rootComponent: "LineChart",
      Preview: SparkLine,
      install: ["line-chart"],
      steps: [
        "Remove `<Grid />`, `<Background />`, `<XAxis />` and `<YAxis />` from `<LineChart>` (and their imports).",
        'On `<LineChart>`, set `aspectRatio="4 / 1"` and `margin={{ top: 8, right: 8, bottom: 8, left: 8 }}` — the default 40px margins only exist to make room for axes.',
        "Set `strokeWidth={2}` on each `<Line>`.",
        "Keep `<ChartTooltip />` but pass `showDatePill={false}` (there is no x-axis for the pill to sit on).",
      ],
      code: `"use client";

import { Line, LineChart } from "@/components/charts/line-chart";
import { ChartTooltip } from "@/components/charts/tooltip";

export function VisitorsSparkline({
  data,
}: {
  data: { date: Date; visitors: number }[];
}) {
  return (
    <LineChart
      aspectRatio="4 / 1"
      data={data}
      margin={{ top: 8, right: 8, bottom: 8, left: 8 }}
    >
      <Line dataKey="visitors" strokeWidth={2} />
      <ChartTooltip showDatePill={false} />
    </LineChart>
  );
}
`,
    },
    {
      id: "area",
      label: "Area",
      rootComponent: "AreaChart",
      Preview: SparkArea,
      install: ["area-chart"],
      steps: [
        "Remove `<Grid />`, `<Background />`, `<XAxis />` and `<YAxis />` from `<AreaChart>` (and their imports).",
        'On `<AreaChart>`, set `aspectRatio="4 / 1"` and `margin={{ top: 8, right: 8, bottom: 8, left: 8 }}`.',
        "On each `<Area>`, set `fillOpacity={0.2}` and `strokeWidth={1.5}` so the fill stays light at small sizes.",
        "Keep `<ChartTooltip />` but pass `showDatePill={false}`.",
      ],
      code: `"use client";

import { Area, AreaChart } from "@/components/charts/area-chart";
import { ChartTooltip } from "@/components/charts/tooltip";

export function VisitorsSparkline({
  data,
}: {
  data: { date: Date; visitors: number }[];
}) {
  return (
    <AreaChart
      aspectRatio="4 / 1"
      data={data}
      margin={{ top: 8, right: 8, bottom: 8, left: 8 }}
    >
      <Area dataKey="visitors" fillOpacity={0.2} strokeWidth={1.5} />
      <ChartTooltip showDatePill={false} />
    </AreaChart>
  );
}
`,
    },
    {
      id: "bar",
      label: "Bar",
      rootComponent: "BarChart",
      Preview: SparkBar,
      install: ["bar-chart"],
      steps: [
        "Remove `<Grid />`, `<Background />`, `<BarXAxis />` and `<BarYAxis />` from `<BarChart>` (and their imports).",
        'On `<BarChart>`, set `aspectRatio="4 / 1"`, `margin={{ top: 8, right: 8, bottom: 8, left: 8 }}` and `barGap={0.35}` for thinner bars.',
        "Set `lineCap={2}` on each `<Bar>` for a small corner radius.",
        "Keep `<ChartTooltip />` as is (bar charts already hide the crosshair line by default).",
      ],
      code: `"use client";

import { Bar } from "@/components/charts/bar";
import { BarChart } from "@/components/charts/bar-chart";
import { ChartTooltip } from "@/components/charts/tooltip";

export function RevenueSparkline({
  data,
}: {
  data: { month: string; revenue: number }[];
}) {
  return (
    <BarChart
      aspectRatio="4 / 1"
      barGap={0.35}
      data={data}
      margin={{ top: 8, right: 8, bottom: 8, left: 8 }}
      xDataKey="month"
    >
      <Bar dataKey="revenue" lineCap={2} />
      <ChartTooltip />
    </BarChart>
  );
}
`,
    },
  ],
};
