"use client";

import {
  Band,
  ChartTooltip,
  Grid,
  Line,
  LineChart,
  XAxis,
} from "@bklitui/ui/charts";
import { curveLinear } from "d3-shape";
import type { Recipe, RecipeChart } from "@/lib/recipes/types";
import { recipeYearOverYearData } from "../recipe-data";

/** Last year: round-capped zero-length dashes read as dots. */
const LAST_YEAR_LINE = {
  curve: curveLinear,
  dashArray: "0,5",
  dashFromIndex: 0,
  stroke: "var(--chart-5)",
  strokeWidth: 2,
} as const;

const THIS_YEAR_LINE = {
  curve: curveLinear,
  stroke: "var(--chart-1)",
  strokeWidth: 1.5,
} as const;

function YoyGradient() {
  return (
    <LineChart data={recipeYearOverYearData}>
      <Grid horizontal />
      <Band
        curve={curveLinear}
        fill="var(--chart-1)"
        fillOpacity={0.3}
        fillType="gradient"
        label="Difference"
        lowerKey="lastYear"
        strokeWidth={0}
        upperKey="thisYear"
      />
      <Line dataKey="lastYear" {...LAST_YEAR_LINE} />
      <Line dataKey="thisYear" {...THIS_YEAR_LINE} />
      <XAxis />
      <ChartTooltip />
    </LineChart>
  );
}

function YoyPattern() {
  return (
    <LineChart data={recipeYearOverYearData}>
      <Grid horizontal />
      <Band
        curve={curveLinear}
        fill="var(--chart-1)"
        fillType="pattern"
        label="Difference"
        lowerKey="lastYear"
        pattern="diagonal-up"
        patternOpacity={0.5}
        strokeWidth={0}
        upperKey="thisYear"
      />
      <Line dataKey="lastYear" {...LAST_YEAR_LINE} />
      <Line dataKey="thisYear" {...THIS_YEAR_LINE} />
      <XAxis />
      <ChartTooltip />
    </LineChart>
  );
}

function YoyTwoTone() {
  return (
    <LineChart data={recipeYearOverYearData}>
      <Grid horizontal />
      <Band
        curve={curveLinear}
        fill="var(--chart-1)"
        fillOpacity={0.25}
        label="Difference"
        lowerKey="lastYear"
        negativeFill="var(--chart-negative, var(--color-red-500))"
        strokeWidth={0}
        upperKey="thisYear"
      />
      <Line dataKey="lastYear" {...LAST_YEAR_LINE} />
      <Line dataKey="thisYear" {...THIS_YEAR_LINE} />
      <XAxis />
      <ChartTooltip />
    </LineChart>
  );
}

const LINES_JSX = `      <Line
        curve={curveLinear}
        dashArray="0,5"
        dashFromIndex={0}
        dataKey="lastYear"
        stroke="var(--chart-5)"
        strokeWidth={2}
      />
      <Line
        curve={curveLinear}
        dataKey="thisYear"
        stroke="var(--chart-1)"
        strokeWidth={1.5}
      />`;

const chartCode = (imports: string, fillJsx: string) => `"use client";

import { curveLinear } from "d3-shape";
${imports}
import { Grid } from "@/components/charts/grid";
import { Line, LineChart } from "@/components/charts/line-chart";
import { ChartTooltip } from "@/components/charts/tooltip";
import { XAxis } from "@/components/charts/x-axis";

export function YearOverYearChart({
  data,
}: {
  data: { date: Date; thisYear: number; lastYear: number }[];
}) {
  return (
    <LineChart data={data}>
      <Grid horizontal />
${fillJsx}
${LINES_JSX}
      <XAxis />
      <ChartTooltip />
    </LineChart>
  );
}
`;

const BAND_IMPORT = 'import { Band } from "@/components/charts/band";';

const DATA_STEP =
  "Only convert charts whose rows carry this period's value and the same point in the previous period (e.g. `thisYear` / `lastYear`, aligned by day of year). If the previous period isn't in the data, tell me instead of inventing it.";

const STYLE_STEPS = [
  'Draw both series with `curve={curveLinear}` (from `d3-shape`) so the week-to-week noise stays jagged: this year as a thin solid line in the series colour — `<Line dataKey="thisYear" stroke="var(--chart-1)" strokeWidth={1.5} />` — and last year as a dotted line in `var(--chart-5)` — `<Line dataKey="lastYear" stroke="var(--chart-5)" strokeWidth={2} dashFromIndex={0} dashArray="0,5" />` (round caps turn zero-length dashes into dots). Put both lines **after** the fill.',
  "Keep `<Grid horizontal />`, `<XAxis />` and `<ChartTooltip />`.",
];

const bandStep = (fillProps: string) =>
  `Add \`<Band upperKey="thisYear" lowerKey="lastYear" label="Difference" curve={curveLinear} fill="var(--chart-1)" ${fillProps} strokeWidth={0} />\` (from \`@/components/charts/band\`) inside \`<LineChart>\` **before** both \`<Line>\`s, with the same \`curveLinear\` so the fill meets the lines exactly.`;

const bandVariant = (
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
  code: chartCode(BAND_IMPORT, bandJsx),
});

export const yearOverYear: Recipe = {
  id: "year-over-year",
  title: "Year over year",
  category: "forecasts-ranges",
  description:
    "This year as a jagged solid line, last year as a dotted line, with the gap between them filled.",
  look: "a performance chart comparing this year with the same days last year, using only chart palette colours: this year is a thin, jagged (linear-curve) solid line in the series colour (`var(--chart-1)`); last year is a dotted line of round dots in `var(--chart-5)` tracking the same shape lower down. The space between the two lines is filled in the series colour — a 50%-opacity diagonal hatch, a gradient fading downward, or two tones (`--chart-1` while this year leads, the negative colour (`--chart-negative`, as in profit/loss) while it trails, via `<Band negativeFill>`). The fill has no edge strokes; the lines are its edges.",
  charts: [
    bandVariant(
      "pattern",
      "Pattern",
      YoyPattern,
      'fillType="pattern" pattern="diagonal-up" patternOpacity={0.5}',
      `      <Band
        curve={curveLinear}
        fill="var(--chart-1)"
        fillType="pattern"
        label="Difference"
        lowerKey="lastYear"
        pattern="diagonal-up"
        patternOpacity={0.5}
        strokeWidth={0}
        upperKey="thisYear"
      />`
    ),
    bandVariant(
      "gradient",
      "Gradient",
      YoyGradient,
      'fillType="gradient" fillOpacity={0.3}',
      `      <Band
        curve={curveLinear}
        fill="var(--chart-1)"
        fillOpacity={0.3}
        fillType="gradient"
        label="Difference"
        lowerKey="lastYear"
        strokeWidth={0}
        upperKey="thisYear"
      />`
    ),
    bandVariant(
      "two-tone",
      "Ahead / behind",
      YoyTwoTone,
      'negativeFill="var(--chart-negative, var(--color-red-500))" fillOpacity={0.25}',
      `      <Band
        curve={curveLinear}
        fill="var(--chart-1)"
        fillOpacity={0.25}
        label="Difference"
        lowerKey="lastYear"
        negativeFill="var(--chart-negative, var(--color-red-500))"
        strokeWidth={0}
        upperKey="thisYear"
      />`
    ),
  ],
};
