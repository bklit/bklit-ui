"use client";

import {
  BarChart,
  BarColumnTrack,
  BarSquares,
  BarXAxis,
  ChartTooltip,
  PatternLines,
} from "@bklitui/ui/charts";
import { useId } from "react";
import {
  VERTICAL_FADE_SOURCE,
  VERTICAL_FADE_STEP,
} from "@/lib/recipes/snippets";
import type { Recipe } from "@/lib/recipes/types";
import { recipeMonthlyData } from "../recipe-data";
import { VerticalFade } from "../vertical-fade";
import { BAR_MARGIN } from "./shared";

const SQUARE_GAP = 3;
const GROUP_GAP = 4;
const SQUARE_RADIUS = 0.5;

function SquircleBarsPreview() {
  const uid = useId().replace(/:/g, "");
  return (
    <BarChart
      data={recipeMonthlyData}
      margin={BAR_MARGIN}
      squareSnap={{ squareGap: SQUARE_GAP, groupGap: GROUP_GAP }}
      xDataKey="month"
    >
      <PatternLines
        height={6}
        id={`${uid}-track`}
        orientation={["diagonal"]}
        stroke="var(--chart-grid)"
        strokeWidth={1}
        width={6}
      />
      <PatternLines
        height={6}
        id={`${uid}-previous`}
        orientation={["diagonal"]}
        stroke="var(--chart-5)"
        strokeWidth={1}
        width={6}
      />
      <VerticalFade>
        <BarColumnTrack
          fill={`url(#${uid}-track)`}
          groupGap={GROUP_GAP}
          opacity={0.65}
          squareGap={SQUARE_GAP}
          squareRadius={SQUARE_RADIUS}
        />
      </VerticalFade>
      <BarSquares
        dataKey="previous"
        fill={`url(#${uid}-previous)`}
        groupGap={GROUP_GAP}
        squareGap={SQUARE_GAP}
        squareRadius={SQUARE_RADIUS}
        stroke="var(--chart-5)"
      />
      <BarSquares
        dataKey="revenue"
        fill="var(--chart-1)"
        groupGap={GROUP_GAP}
        squareGap={SQUARE_GAP}
        squareRadius={SQUARE_RADIUS}
      />
      <BarXAxis />
      <ChartTooltip
        dotColor="color-mix(in oklch, var(--chart-tooltip-foreground) 70%, transparent)"
        dotRadiusFraction={SQUARE_RADIUS}
        dotStrokeWidth={1}
        dotVariant="ring"
        showCrosshair={false}
      />
    </BarChart>
  );
}

export const squircleBars: Recipe = {
  id: "squircle-bars",
  title: "Squircle bars",
  category: "color-shape",
  description:
    "Columns built from rounded squares over a faded hatch track, with a ring that hugs the top square.",
  look: "each bar is a stack of evenly spaced rounded squares (squircles, `squareRadius={0.5}`) instead of a solid column. The headline series is a solid `--chart-1` fill, comparison series use a diagonal hatch in `--chart-5`, and every column sits on a ghost track of hatched squircles in the grid colour that fades out over the top and bottom thirds of the plot. On hover there is no crosshair — a ring the same squircle shape snaps around the top square of each bar.",
  charts: [
    {
      id: "bar",
      label: "Bar",
      rootComponent: "BarChart",
      Preview: SquircleBarsPreview,
      install: ["bar-chart", "patterns"],
      steps: [
        'Only convert vertical `BarChart`s (not `orientation="horizontal"`, not stacked). Remove `<Grid />` and any `<Background />`.',
        "On `<BarChart>` add `squareSnap={{ squareGap: 3, groupGap: 4 }}` so tooltip rings align with the square columns.",
        "Replace every `<Bar dataKey=… />` with `<BarSquares dataKey=… squareGap={3} groupGap={4} squareRadius={0.5} />` (from `@/components/charts/bar-squares`). Keep `squareGap` / `groupGap` identical on `squareSnap`, every `BarSquares` and the track.",
        'Headline series: a solid `fill="var(--chart-1)"` (no gradient). Comparison series: a `<PatternLines>` diagonal hatch in `var(--chart-5)` as `fill="url(#…)"` with `stroke="var(--chart-5)"`.',
        VERTICAL_FADE_STEP,
        'Add a hatched ghost track before the first `BarSquares`: a `<PatternLines>` in `var(--chart-grid)` and `<VerticalFade><BarColumnTrack fill="url(#…)" opacity={0.65} squareGap={3} groupGap={4} squareRadius={0.5} /></VerticalFade>`. Make every pattern `id` unique with `useId()`.',
        'Replace the tooltip with `<ChartTooltip showCrosshair={false} dotVariant="ring" dotRadiusFraction={0.5} dotStrokeWidth={1} dotColor="color-mix(in oklch, var(--chart-tooltip-foreground) 70%, transparent)" />` — keep `dotRadiusFraction` equal to `squareRadius` so the ring hugs the squares.',
      ],
      code: `"use client";

import { type ReactNode, useId } from "react";
import { BarChart } from "@/components/charts/bar-chart";
import { BarColumnTrack, BarSquares } from "@/components/charts/bar-squares";
import { BarXAxis } from "@/components/charts/bar-x-axis";
import { useChartStable } from "@/components/charts/chart-context";
import { PatternLines } from "@/components/charts/patterns";
import { ChartTooltip } from "@/components/charts/tooltip";

${VERTICAL_FADE_SOURCE}

export function RevenueChart({
  data,
}: {
  data: { month: string; revenue: number; previous: number }[];
}) {
  const uid = useId().replace(/:/g, "");

  return (
    <BarChart
      data={data}
      margin={{ top: 8, right: 8, bottom: 40, left: 8 }}
      squareSnap={{ squareGap: 3, groupGap: 4 }}
      xDataKey="month"
    >
      <PatternLines
        height={6}
        id={\`\${uid}-track\`}
        orientation={["diagonal"]}
        stroke="var(--chart-grid)"
        strokeWidth={1}
        width={6}
      />
      <PatternLines
        height={6}
        id={\`\${uid}-previous\`}
        orientation={["diagonal"]}
        stroke="var(--chart-5)"
        strokeWidth={1}
        width={6}
      />
      <VerticalFade>
        <BarColumnTrack
          fill={\`url(#\${uid}-track)\`}
          groupGap={4}
          opacity={0.65}
          squareGap={3}
          squareRadius={0.5}
        />
      </VerticalFade>
      <BarSquares
        dataKey="previous"
        fill={\`url(#\${uid}-previous)\`}
        groupGap={4}
        squareGap={3}
        squareRadius={0.5}
        stroke="var(--chart-5)"
      />
      <BarSquares
        dataKey="revenue"
        fill="var(--chart-1)"
        groupGap={4}
        squareGap={3}
        squareRadius={0.5}
      />
      <BarXAxis />
      <ChartTooltip
        dotColor="color-mix(in oklch, var(--chart-tooltip-foreground) 70%, transparent)"
        dotRadiusFraction={0.5}
        dotStrokeWidth={1}
        dotVariant="ring"
        showCrosshair={false}
      />
    </BarChart>
  );
}
`,
    },
  ],
};
