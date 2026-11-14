"use client";

import {
  Band,
  ChartTooltip,
  Grid,
  Line,
  LineChart,
  XAxis,
} from "@bklitui/ui/charts";
import type { Recipe, RecipeChart } from "@/lib/recipes/types";
import { recipeProjectedData } from "../recipe-data";

/** Dashed line, same colour as the actual series, for the projection. */
const BASELINE_LINE = {
  dashArray: "4,4",
  dashFromIndex: 0,
  stroke: "var(--chart-1)",
  strokeWidth: 1.5,
} as const;

function GapSolid() {
  return (
    <LineChart data={recipeProjectedData}>
      <Grid horizontal />
      <Band
        fill="var(--chart-1)"
        fillOpacity={0.18}
        label="Gap"
        lowerKey="projected"
        strokeWidth={0}
        upperKey="actual"
      />
      <Line dataKey="projected" {...BASELINE_LINE} />
      <Line dataKey="actual" stroke="var(--chart-1)" strokeWidth={2} />
      <XAxis />
      <ChartTooltip />
    </LineChart>
  );
}

function GapGradient() {
  return (
    <LineChart data={recipeProjectedData}>
      <Grid horizontal />
      <Band
        fill="var(--chart-1)"
        fillOpacity={0.45}
        fillType="gradient"
        gradientToOpacity={0.02}
        label="Gap"
        lowerKey="projected"
        strokeWidth={0}
        upperKey="actual"
      />
      <Line dataKey="projected" {...BASELINE_LINE} />
      <Line dataKey="actual" stroke="var(--chart-1)" strokeWidth={2} />
      <XAxis />
      <ChartTooltip />
    </LineChart>
  );
}

function GapPattern() {
  return (
    <LineChart data={recipeProjectedData}>
      <Grid horizontal />
      <Band
        fill="var(--chart-1)"
        fillType="pattern"
        label="Gap"
        lowerKey="projected"
        pattern="diagonal-up"
        patternOpacity={0.5}
        strokeWidth={0}
        upperKey="actual"
      />
      <Line dataKey="projected" {...BASELINE_LINE} />
      <Line dataKey="actual" stroke="var(--chart-1)" strokeWidth={2} />
      <XAxis />
      <ChartTooltip />
    </LineChart>
  );
}

function GapTwoTone() {
  return (
    <LineChart data={recipeProjectedData}>
      <Grid horizontal />
      <Band
        fill="var(--chart-1)"
        fillOpacity={0.28}
        label="Gap"
        lowerKey="projected"
        negativeFill="var(--chart-negative, var(--color-red-500))"
        strokeWidth={0}
        upperKey="actual"
      />
      <Line dataKey="projected" {...BASELINE_LINE} />
      <Line dataKey="actual" stroke="var(--chart-1)" strokeWidth={2} />
      <XAxis />
      <ChartTooltip />
    </LineChart>
  );
}

const SINGLE_TONE_IMPORTS = `import { Band } from "@/components/charts/band";
import { Grid } from "@/components/charts/grid";
import { Line, LineChart } from "@/components/charts/line-chart";
import { ChartTooltip } from "@/components/charts/tooltip";
import { XAxis } from "@/components/charts/x-axis";`;

const BASELINE_JSX = (key: string) => `      <Line
        dashArray="4,4"
        dashFromIndex={0}
        dataKey="${key}"
        stroke="var(--chart-1)"
        strokeWidth={1.5}
      />
      <Line dataKey="actual" stroke="var(--chart-1)" strokeWidth={2} />`;

const singleToneCode = (bandJsx: string) => `"use client";

${SINGLE_TONE_IMPORTS}

export function GrowthChart({
  data,
}: {
  data: { date: Date; actual: number; projected: number }[];
}) {
  return (
    <LineChart data={data}>
      <Grid horizontal />
${bandJsx}
${BASELINE_JSX("projected")}
      <XAxis />
      <ChartTooltip />
    </LineChart>
  );
}
`;

const DATA_STEP =
  "Only convert charts whose rows carry both an actual value and a projected (or target / previous-period) value for the same series. If they don't, ask me which series to compare against instead of inventing a projection.";

const STYLE_STEPS = [
  'Draw both lines in the **same** series colour: the projection dashed and thinner — `<Line dataKey="<projected key>" stroke="<series colour>" strokeWidth={1.5} dashFromIndex={0} dashArray="4,4" />` — and the actual series solid (`strokeWidth={2}`). Put both lines **after** the fill so they paint on top.',
  "Keep `<Grid horizontal />`, `<XAxis />` and `<ChartTooltip />`.",
];

const bandStep = (fillProps: string) =>
  `Add \`<Band upperKey="<actual key>" lowerKey="<projected key>" label="Gap" fill="<series colour>" ${fillProps} strokeWidth={0} />\` (from \`@/components/charts/band\`) inside \`<LineChart>\` **before** both \`<Line>\`s. \`strokeWidth={0}\` hides the band's own edges — the two lines are the edges.`;

const singleTone = (
  id: string,
  label: string,
  Preview: RecipeChart["Preview"],
  fillProps: string,
  bandJsx: string
): RecipeChart => ({
  id,
  label,
  rootComponent: "LineChart",
  Preview,
  install: ["band"],
  steps: [DATA_STEP, bandStep(fillProps), ...STYLE_STEPS],
  code: singleToneCode(bandJsx),
});

export const gapFill: Recipe = {
  id: "gap-fill",
  title: "Gap fill",
  category: "forecasts-ranges",
  description:
    "Actual vs projected growth: shade the gap between the real series and its dashed projection — solid, gradient, hatched or two-tone.",
  look: "actual vs projected growth: the actual series is a solid 2px line and the projection a thinner dashed (`4,4`) straight-line trend, both in the same series colour. The gap between them is filled — a soft solid tint, a vertical gradient that fades downward, a 50%-opacity diagonal hatch, or two tones that switch exactly where the lines cross — the series colour while actual is ahead of the projection and the negative colour (`--chart-negative`, as in profit/loss) while it's behind, via `<Band negativeFill>`. The fill has no edge strokes of its own; the two lines are its edges.",
  charts: [
    singleTone(
      "pattern",
      "Pattern",
      GapPattern,
      'fillType="pattern" pattern="diagonal-up" patternOpacity={0.5}',
      `      <Band
        fill="var(--chart-1)"
        fillType="pattern"
        label="Gap"
        lowerKey="projected"
        pattern="diagonal-up"
        patternOpacity={0.5}
        strokeWidth={0}
        upperKey="actual"
      />`
    ),
    singleTone(
      "solid",
      "Solid",
      GapSolid,
      "fillOpacity={0.18}",
      `      <Band
        fill="var(--chart-1)"
        fillOpacity={0.18}
        label="Gap"
        lowerKey="projected"
        strokeWidth={0}
        upperKey="actual"
      />`
    ),
    singleTone(
      "gradient",
      "Gradient",
      GapGradient,
      'fillType="gradient" fillOpacity={0.45} gradientToOpacity={0.02}',
      `      <Band
        fill="var(--chart-1)"
        fillOpacity={0.45}
        fillType="gradient"
        gradientToOpacity={0.02}
        label="Gap"
        lowerKey="projected"
        strokeWidth={0}
        upperKey="actual"
      />`
    ),
    singleTone(
      "two-tone",
      "Ahead / behind",
      GapTwoTone,
      'negativeFill="var(--chart-negative, var(--color-red-500))" fillOpacity={0.28}',
      `      <Band
        fill="var(--chart-1)"
        fillOpacity={0.28}
        label="Gap"
        lowerKey="projected"
        negativeFill="var(--chart-negative, var(--color-red-500))"
        strokeWidth={0}
        upperKey="actual"
      />`
    ),
  ],
};
