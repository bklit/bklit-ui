"use client";

import {
  Area,
  AreaChart,
  Background,
  ChartTooltip,
  Line,
  LineChart,
  XAxis,
} from "@bklitui/ui/charts";
import { PATTERN_FADE_EDGE } from "@/lib/recipes/snippets";
import type { Recipe } from "@/lib/recipes/types";
import { recipeWeeklyData } from "../recipe-data";

function DotMatrixLine() {
  return (
    <LineChart data={recipeWeeklyData}>
      <Background
        fadeHorizontalLength={20}
        fadeVerticalLength={PATTERN_FADE_EDGE}
        opacity={0.85}
        pattern="dots"
      />
      <Line dataKey="visitors" fadeEdges={false} showMarkers />
      <XAxis />
      <ChartTooltip />
    </LineChart>
  );
}

function DotMatrixArea() {
  return (
    <AreaChart data={recipeWeeklyData}>
      <Background
        fadeHorizontalLength={20}
        fadeVerticalLength={PATTERN_FADE_EDGE}
        opacity={0.85}
        pattern="dots"
      />
      <Area dataKey="visitors" fillOpacity={0.2} showMarkers />
      <XAxis />
      <ChartTooltip />
    </AreaChart>
  );
}

const BACKGROUND_PROPS =
  '`<Background pattern="dots" opacity={0.85} fadeHorizontalLength={20} fadeVerticalLength={33} />`';

export const dotMatrix: Recipe = {
  id: "dot-matrix",
  title: "Dot matrix",
  category: "backgrounds",
  description:
    "A soft dot-grid canvas, faded top and bottom, with ring markers on every point.",
  look: "no grid lines; a dot grid fills the plot, fully visible only through the middle — it fades to transparent over the top 33% and bottom 33% of the plot and over 20% at the left and right edges — and every data point gets a ring marker so the series reads like plotted measurements.",
  charts: [
    {
      id: "line",
      label: "Line",
      rootComponent: "LineChart",
      Preview: DotMatrixLine,
      install: ["background"],
      steps: [
        "Remove the `<Grid />` child of `<LineChart>` and its import.",
        `Add ${BACKGROUND_PROPS} as the **first** child of \`<LineChart>\`. \`fadeVerticalLength={33}\` fades the dots over the top and bottom thirds of the plot.`,
        "On each `<Line>`, add `showMarkers` and set `fadeEdges={false}` so the first and last markers don't float over a faded stroke.",
        "Markers suit up to ~20 points; for denser series keep the dot background and skip `showMarkers`.",
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
      <Background
        fadeHorizontalLength={20}
        fadeVerticalLength={33}
        opacity={0.85}
        pattern="dots"
      />
      <Line dataKey="visitors" fadeEdges={false} showMarkers />
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
      Preview: DotMatrixArea,
      install: ["background"],
      steps: [
        "Remove the `<Grid />` child of `<AreaChart>` and its import.",
        `Add ${BACKGROUND_PROPS} as the **first** child of \`<AreaChart>\`. \`fadeVerticalLength={33}\` fades the dots over the top and bottom thirds of the plot.`,
        "On each `<Area>`, add `showMarkers` and lower the fill to `fillOpacity={0.2}` so the dots stay visible under the gradient.",
        "Markers suit up to ~20 points; for denser series keep the dot background and skip `showMarkers`.",
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
      <Background
        fadeHorizontalLength={20}
        fadeVerticalLength={33}
        opacity={0.85}
        pattern="dots"
      />
      <Area dataKey="visitors" fillOpacity={0.2} showMarkers />
      <XAxis />
      <ChartTooltip />
    </AreaChart>
  );
}
`,
    },
  ],
};
