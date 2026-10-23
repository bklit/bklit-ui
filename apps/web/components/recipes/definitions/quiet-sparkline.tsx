"use client";

import { AreaSparkline, BarSparkline, LineSparkline } from "@bklitui/ui/charts";
import type { Recipe } from "@/lib/recipes/types";
import { recipeDailyData, recipeMonthlyData } from "../recipe-data";

const SPARK_HEIGHT = 72;

function SparkLine() {
  return (
    <div className="mx-auto w-full max-w-xl">
      <LineSparkline
        data={recipeDailyData}
        dataKey="visitors"
        height={SPARK_HEIGHT}
        strokeWidth={2}
      />
    </div>
  );
}

function SparkArea() {
  return (
    <div className="mx-auto w-full max-w-xl">
      <AreaSparkline
        data={recipeDailyData}
        dataKey="visitors"
        fillOpacity={0.2}
        height={SPARK_HEIGHT}
      />
    </div>
  );
}

function SparkBar() {
  return (
    <div className="mx-auto w-full max-w-xl">
      <BarSparkline
        barGap={6}
        barRadius={2}
        data={recipeMonthlyData}
        dataKey="revenue"
        height={SPARK_HEIGHT}
      />
    </div>
  );
}

const SHARED_STEPS = [
  "Find the compact charts used as sparklines (stat cards, table cells, list rows) — or the one I point you at. Leave full-size charts with axes alone.",
];

export const quietSparkline: Recipe = {
  id: "quiet-sparkline",
  title: "Quiet sparkline",
  category: "color-shape",
  description:
    "Swap compact charts for sparklines — one path, no grid, no axes — for cards and tables.",
  look: "a short fixed-height strip (about 72px) that fills its container's width, with no grid, no background, no axes and no tooltip; the series alone carries the shape, and hovering shows only a thin dashed crosshair and a dot on the nearest point.",
  charts: [
    {
      id: "line",
      label: "Line",
      rootComponent: "LineSparkline",
      Preview: SparkLine,
      install: ["sparkline"],
      steps: [
        ...SHARED_STEPS,
        'Replace each `<LineChart>` (with its `<Line>`, `<Grid />`, axes and `<ChartTooltip />`) with a single `<LineSparkline data={data} dataKey="visitors" height={72} strokeWidth={2} />` imported from `@/components/charts/sparkline`. Use the old `<Line>`\'s `dataKey`.',
        "Drop `aspectRatio` and `margin` — sparklines take a fixed `height` in px and fill their parent's width (pass `width` only for a fixed-size cell).",
        "Keep the series colour by passing the old `stroke` as `color` (defaults to `var(--chart-line-primary)`).",
      ],
      code: `"use client";

import { LineSparkline } from "@/components/charts/sparkline";

export function VisitorsSparkline({
  data,
}: {
  data: { date: Date; visitors: number }[];
}) {
  return (
    <LineSparkline data={data} dataKey="visitors" height={72} strokeWidth={2} />
  );
}
`,
    },
    {
      id: "area",
      label: "Area",
      rootComponent: "AreaSparkline",
      Preview: SparkArea,
      install: ["sparkline"],
      steps: [
        ...SHARED_STEPS,
        'Replace each `<AreaChart>` (with its `<Area>`, `<Grid />`, axes and `<ChartTooltip />`) with `<AreaSparkline data={data} dataKey="visitors" fillOpacity={0.2} height={72} />` imported from `@/components/charts/sparkline`. Use the old `<Area>`\'s `dataKey`.',
        "Drop `aspectRatio` and `margin` — sparklines take a fixed `height` in px and fill their parent's width.",
        "Keep `fillOpacity` low (0.2) so the gradient stays light at small sizes; pass the old `stroke` as `color` if it was customised.",
      ],
      code: `"use client";

import { AreaSparkline } from "@/components/charts/sparkline";

export function VisitorsSparkline({
  data,
}: {
  data: { date: Date; visitors: number }[];
}) {
  return (
    <AreaSparkline
      data={data}
      dataKey="visitors"
      fillOpacity={0.2}
      height={72}
    />
  );
}
`,
    },
    {
      id: "bar",
      label: "Bar",
      rootComponent: "BarSparkline",
      Preview: SparkBar,
      install: ["sparkline"],
      steps: [
        ...SHARED_STEPS,
        'Replace each `<BarChart>` (with its `<Bar>`, `<Grid />`, axes and `<ChartTooltip />`) with `<BarSparkline barGap={6} barRadius={2} data={data} dataKey="revenue" height={72} />` imported from `@/components/charts/sparkline`. Use the old `<Bar>`\'s `dataKey`; `xDataKey` is not needed.',
        "Drop `aspectRatio` and `margin`. `barGap` is in px (not a ratio like `BarChart`'s), and every bar is drawn as one path, so it stays cheap in long tables.",
        "Bars always start from zero; hovering dims the other bars to `inactiveOpacity` (0.4).",
      ],
      code: `"use client";

import { BarSparkline } from "@/components/charts/sparkline";

export function RevenueSparkline({
  data,
}: {
  data: { month: string; revenue: number }[];
}) {
  return (
    <BarSparkline
      barGap={6}
      barRadius={2}
      data={data}
      dataKey="revenue"
      height={72}
    />
  );
}
`,
    },
  ],
};
