"use client";

import {
  Area,
  AreaChart,
  Band,
  ChartTooltip,
  Grid,
  Line,
  LineChart,
  XAxis,
} from "@bklitui/ui/charts";
import type { Recipe } from "@/lib/recipes/types";
import { recipeRangeData } from "../recipe-data";

function BandLine() {
  return (
    <LineChart data={recipeRangeData}>
      <Grid horizontal />
      <Band
        fadeEdges={{ left: true, right: true }}
        fadeSize={0.15}
        fill="var(--chart-1)"
        fillOpacity={0.35}
        fillType="gradient"
        label="Range"
        lowerKey="low"
        strokeDasharray="3,4"
        strokeOpacity={0.6}
        upperKey="high"
      />
      <Line dataKey="visitors" stroke="var(--chart-1)" strokeWidth={2} />
      <XAxis />
      <ChartTooltip />
    </LineChart>
  );
}

function BandArea() {
  return (
    <AreaChart data={recipeRangeData}>
      <Grid horizontal />
      <Band
        fadeEdges={{ left: true, right: true }}
        fadeSize={0.15}
        fill="var(--chart-1)"
        fillOpacity={0.35}
        fillType="gradient"
        label="Range"
        lowerKey="low"
        strokeDasharray="3,4"
        strokeOpacity={0.6}
        upperKey="high"
      />
      <Area
        dataKey="visitors"
        fill="var(--chart-1)"
        fillOpacity={0.12}
        strokeWidth={2}
      />
      <XAxis />
      <ChartTooltip />
    </AreaChart>
  );
}

const BAND_JSX = `      <Band
        fadeEdges={{ left: true, right: true }}
        fadeSize={0.15}
        fill="var(--chart-1)"
        fillOpacity={0.35}
        fillType="gradient"
        label="Range"
        lowerKey="low"
        strokeDasharray="3,4"
        strokeOpacity={0.6}
        upperKey="high"
      />`;

const STEPS = (root: string, series: string) => [
  "Only convert charts whose rows carry a lower and upper bound for the headline series (min/max, p10/p90, confidence interval). If they don't, tell me instead of inventing bounds — or, for a price-like series, offer Bollinger bands via `withBollingerBands(data, { dataKey, period: 20, multiplier: 2 })` from `@/components/charts/bollinger`, which adds `<key>Upper` / `<key>Lower` fields.",
  `Add \`<Band lowerKey="…" upperKey="…" label="Range" fill="<series colour>" fillType="gradient" fillOpacity={0.35} strokeDasharray="3,4" strokeOpacity={0.6} fadeEdges={{ left: true, right: true }} fadeSize={0.15} />\` (from \`@/components/charts/band\`) inside \`<${root}>\`, **before** the ${series} so the series paints on top. The band shows up in the tooltip as "Range".`,
  "Keep the headline series solid (`strokeWidth={2}`) in the same colour as the band; keep `<Grid horizontal />`, `<XAxis />` and `<ChartTooltip />`.",
];

export const rangeBand: Recipe = {
  id: "range-band",
  title: "Range band",
  category: "forecasts-ranges",
  description:
    "Wrap the series in a soft gradient envelope with dashed bounds that fades at the edges.",
  look: "the headline series runs through a translucent envelope showing its expected range: a vertical gradient fill in the series colour bounded by fine dashed lines (`3,4`) at the lower and upper values, with the whole band fading out at the left and right edges. The tooltip lists the range alongside the value.",
  charts: [
    {
      id: "line",
      label: "Line",
      rootComponent: "LineChart",
      Preview: BandLine,
      install: ["band"],
      steps: STEPS("LineChart", "`<Line>`s"),
      code: `"use client";

import { Band } from "@/components/charts/band";
import { Grid } from "@/components/charts/grid";
import { Line, LineChart } from "@/components/charts/line-chart";
import { ChartTooltip } from "@/components/charts/tooltip";
import { XAxis } from "@/components/charts/x-axis";

export function VisitorsChart({
  data,
}: {
  data: { date: Date; visitors: number; low: number; high: number }[];
}) {
  return (
    <LineChart data={data}>
      <Grid horizontal />
${BAND_JSX}
      <Line dataKey="visitors" stroke="var(--chart-1)" strokeWidth={2} />
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
      Preview: BandArea,
      install: ["band", "area-chart"],
      steps: [
        ...STEPS("AreaChart", "`<Area>`s"),
        'Lower the `<Area>` fill to `fillOpacity={0.12}` (with `fill="var(--chart-1)"` or the series token) so the band stays readable underneath.',
      ],
      code: `"use client";

import { Area, AreaChart } from "@/components/charts/area-chart";
import { Band } from "@/components/charts/band";
import { Grid } from "@/components/charts/grid";
import { ChartTooltip } from "@/components/charts/tooltip";
import { XAxis } from "@/components/charts/x-axis";

export function VisitorsChart({
  data,
}: {
  data: { date: Date; visitors: number; low: number; high: number }[];
}) {
  return (
    <AreaChart data={data}>
      <Grid horizontal />
${BAND_JSX}
      <Area
        dataKey="visitors"
        fill="var(--chart-1)"
        fillOpacity={0.12}
        strokeWidth={2}
      />
      <XAxis />
      <ChartTooltip />
    </AreaChart>
  );
}
`,
    },
  ],
};
