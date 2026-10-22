"use client";

import {
  Area,
  AreaChart,
  Background,
  Bar,
  BarChart,
  BarXAxis,
  ChartTooltip,
  Line,
  LineChart,
  XAxis,
} from "@bklitui/ui/charts";
import { PATTERN_FADE_EDGE } from "@/lib/recipes/snippets";
import type { Recipe } from "@/lib/recipes/types";
import { recipeDailyData, recipeMonthlyData } from "../recipe-data";
import { BAR_MARGIN } from "./shared";

function HatchedLine() {
  return (
    <LineChart data={recipeDailyData}>
      <Background fadeVerticalLength={PATTERN_FADE_EDGE} pattern="diagonal" />
      <Line dataKey="visitors" />
      <XAxis />
      <ChartTooltip />
    </LineChart>
  );
}

function HatchedArea() {
  return (
    <AreaChart data={recipeDailyData}>
      <Background fadeVerticalLength={PATTERN_FADE_EDGE} pattern="diagonal" />
      <Area dataKey="visitors" fillOpacity={0.25} />
      <XAxis />
      <ChartTooltip />
    </AreaChart>
  );
}

function HatchedBar() {
  return (
    <BarChart data={recipeMonthlyData} margin={BAR_MARGIN} xDataKey="month">
      <Background fadeVerticalLength={PATTERN_FADE_EDGE} pattern="diagonal" />
      <Bar dataKey="revenue" lineCap={4} />
      <BarXAxis />
      <ChartTooltip />
    </BarChart>
  );
}

const BACKGROUND_STEP =
  "as the **first** child so it paints behind the series. `fadeVerticalLength={33}` fades the hatch in over the top 33% and out over the bottom 33% of the plot (solid only through the middle third); keep the default 10% fade on the left and right edges.";

export const hatchedBackdrop: Recipe = {
  id: "hatched-backdrop",
  title: "Hatched backdrop",
  category: "backgrounds",
  description:
    "Swap grid lines for a diagonal hatch that fades out over the top and bottom thirds.",
  look: "no grid lines; the plot area is filled with a thin diagonal hatch in the grid colour (`var(--chart-grid)`). The hatch is fully visible only through the middle of the plot — it fades to transparent over the top 33% and bottom 33% (and slightly at the left/right edges) — so the series reads against a soft band of texture instead of reference lines.",
  charts: [
    {
      id: "line",
      label: "Line",
      rootComponent: "LineChart",
      Preview: HatchedLine,
      install: ["background"],
      steps: [
        "Remove the `<Grid />` child of `<LineChart>` and its import — the hatch replaces grid lines.",
        `Add \`<Background pattern="diagonal" fadeVerticalLength={33} />\` (from \`@/components/charts/background\`) ${BACKGROUND_STEP}`,
        "Leave `<Line>`, `<XAxis />`, any `<YAxis />` and `<ChartTooltip />` unchanged.",
      ],
      code: `"use client";

import { Background } from "@/components/charts/background";
import { Line, LineChart } from "@/components/charts/line-chart";
import { ChartTooltip } from "@/components/charts/tooltip";
import { XAxis } from "@/components/charts/x-axis";

export function VisitorsChart({
  data,
}: {
  data: { date: Date; visitors: number }[];
}) {
  return (
    <LineChart data={data}>
      <Background fadeVerticalLength={33} pattern="diagonal" />
      <Line dataKey="visitors" />
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
      Preview: HatchedArea,
      install: ["background"],
      steps: [
        "Remove the `<Grid />` child of `<AreaChart>` and its import.",
        `Add \`<Background pattern="diagonal" fadeVerticalLength={33} />\` ${BACKGROUND_STEP}`,
        "Lower each `<Area>` to `fillOpacity={0.25}` so the hatch shows through the gradient fill. Keep stroke colours and widths.",
      ],
      code: `"use client";

import { Area, AreaChart } from "@/components/charts/area-chart";
import { Background } from "@/components/charts/background";
import { ChartTooltip } from "@/components/charts/tooltip";
import { XAxis } from "@/components/charts/x-axis";

export function VisitorsChart({
  data,
}: {
  data: { date: Date; visitors: number }[];
}) {
  return (
    <AreaChart data={data}>
      <Background fadeVerticalLength={33} pattern="diagonal" />
      <Area dataKey="visitors" fillOpacity={0.25} />
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
      Preview: HatchedBar,
      install: ["background"],
      steps: [
        "Remove the `<Grid />` child of `<BarChart>` and its import.",
        `Add \`<Background pattern="diagonal" fadeVerticalLength={33} />\` ${BACKGROUND_STEP}`,
        "Keep `<Bar>`, `<BarXAxis />` and `<ChartTooltip />` unchanged.",
      ],
      code: `"use client";

import { Background } from "@/components/charts/background";
import { Bar } from "@/components/charts/bar";
import { BarChart } from "@/components/charts/bar-chart";
import { BarXAxis } from "@/components/charts/bar-x-axis";
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
      <Background fadeVerticalLength={33} pattern="diagonal" />
      <Bar dataKey="revenue" lineCap={4} />
      <BarXAxis />
      <ChartTooltip />
    </BarChart>
  );
}
`,
    },
  ],
};
