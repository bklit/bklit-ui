"use client";

import {
  Band,
  Candlestick,
  ChartTooltip,
  ComposedChart,
  Grid,
  Line,
  LineChart,
  Scatter,
  SeriesBar,
  XAxis,
  YAxis,
  type YDomainOverride,
} from "@bklitui/ui/charts";
import { curveMonotoneX } from "d3-shape";
import type { Recipe } from "@/lib/recipes/types";
import {
  RECIPE_FORECAST_START,
  recipeDailyData,
  recipeForecastData,
  recipeMarketData,
  recipeSignalData,
} from "../recipe-data";

const PRICE_MARGIN = { top: 8, right: 52, bottom: 40, left: 8 };

const formatPrice = (value: number) => `$${Math.round(value)}`;

/** Volume in the bottom quarter; the price axis floor drops so candles sit above it. */
const VOLUME_DOMAIN: Record<string, YDomainOverride> = {
  volume: ([, max]) => [0, max * 4],
  right: ([min, max]) => [min - (max - min) * 0.45, max],
};

/* ------------------------------------------------------------------ */
/* Price & volume                                                      */
/* ------------------------------------------------------------------ */

function PriceVolume() {
  return (
    <ComposedChart
      data={recipeMarketData}
      margin={PRICE_MARGIN}
      maxBarSize={9}
      yDomains={VOLUME_DOMAIN}
    >
      <Grid horizontal />
      <SeriesBar
        dataKey="volume"
        fadedOpacity={0.5}
        fill="color-mix(in oklch, var(--muted-foreground) 35%, transparent)"
        yAxisId="volume"
      />
      <Candlestick widthRatio={0.55} yAxisId="right" />
      <Line
        curve={curveMonotoneX}
        dataKey="average"
        stroke="var(--chart-1)"
        strokeWidth={1.5}
        yAxisId="right"
      />
      <YAxis formatValue={formatPrice} orientation="right" yAxisId="right" />
      <XAxis />
      <ChartTooltip />
    </ComposedChart>
  );
}

/* ------------------------------------------------------------------ */
/* Forecast hand-off                                                   */
/* ------------------------------------------------------------------ */

const FORECAST_DASH_FROM = RECIPE_FORECAST_START - 1;

function ForecastComposed() {
  return (
    <ComposedChart data={recipeForecastData} maxBarSize={14}>
      <Grid horizontal />
      <Band
        fill="var(--chart-2)"
        fillOpacity={0.3}
        fillType="gradient"
        label="Forecast range"
        lowerKey="low"
        strokeDasharray="3,4"
        strokeOpacity={0.5}
        upperKey="high"
      />
      <SeriesBar dataKey="actual" fill="var(--chart-3)" radius={3} />
      <Line
        dashArray="5,4"
        dashFromIndex={FORECAST_DASH_FROM}
        dataKey="forecast"
        stroke="var(--chart-2)"
        strokeWidth={2}
      />
      <XAxis />
      <ChartTooltip />
    </ComposedChart>
  );
}

function ForecastLine() {
  return (
    <LineChart data={recipeForecastData}>
      <Grid horizontal />
      <Band
        fill="var(--chart-2)"
        fillOpacity={0.3}
        fillType="gradient"
        label="Forecast range"
        lowerKey="low"
        strokeDasharray="3,4"
        strokeOpacity={0.5}
        upperKey="high"
      />
      <Line
        dashArray="5,4"
        dashFromIndex={FORECAST_DASH_FROM}
        dataKey="forecast"
        stroke="var(--chart-2)"
        strokeWidth={2}
      />
      <XAxis />
      <ChartTooltip />
    </LineChart>
  );
}

/* ------------------------------------------------------------------ */
/* Signal & noise                                                      */
/* ------------------------------------------------------------------ */

function SignalNoise() {
  return (
    <ComposedChart data={recipeSignalData}>
      <Grid horizontal />
      <Scatter
        dataKey="signups"
        fill="color-mix(in oklch, var(--chart-1) 45%, transparent)"
        radius={3.5}
      />
      <Line
        curve={curveMonotoneX}
        dataKey="average"
        stroke="var(--chart-1)"
        strokeWidth={2.5}
      />
      <XAxis />
      <ChartTooltip />
    </ComposedChart>
  );
}

/* ------------------------------------------------------------------ */
/* Context bars                                                        */
/* ------------------------------------------------------------------ */

function ContextBars() {
  return (
    <ComposedChart barGap={0} data={recipeDailyData} maxBarSize={18}>
      <Grid horizontal />
      <SeriesBar
        dataKey="previous"
        fadedOpacity={0.6}
        fill="color-mix(in oklch, var(--muted-foreground) 22%, transparent)"
        radius={4}
        stroke="var(--muted-foreground)"
      />
      <Line
        curve={curveMonotoneX}
        dataKey="visitors"
        stroke="var(--chart-1)"
        strokeWidth={2.5}
      />
      <XAxis />
      <ChartTooltip />
    </ComposedChart>
  );
}

/* ------------------------------------------------------------------ */
/* Recipes                                                             */
/* ------------------------------------------------------------------ */

export const priceVolume: Recipe = {
  id: "price-volume",
  title: "Price & volume",
  category: "combos",
  description:
    "Candles with a moving average on a floating price axis, volume as quiet bars underneath.",
  look: "an OHLC candlestick series with a thin smoothed moving-average line on a right-hand price axis that hugs the price range (it does not start at zero), and muted translucent volume bars along the bottom on their own hidden axis. The tooltip lists the close, the average and the volume.",
  charts: [
    {
      id: "composed",
      label: "Composed",
      rootComponent: "ComposedChart",
      Preview: PriceVolume,
      install: ["composed-chart", "candlestick-chart", "y-axis"],
      steps: [
        "Only convert charts whose rows carry `open`, `high`, `low` and `close` (plus a volume-like count). If they don't, tell me instead of inventing prices.",
        "Use `<ComposedChart margin={{ top: 8, right: 52, bottom: 40, left: 8 }} maxBarSize={9}>` (from `@/components/charts/composed-chart`) as the root so candles, bars and lines share one x-scale and tooltip.",
        'Add `<SeriesBar dataKey="volume" yAxisId="volume" fill="color-mix(in oklch, var(--muted-foreground) 35%, transparent)" fadedOpacity={0.5} />` first. Its own `yAxisId` keeps the bars zero-based; don\'t render a `<YAxis>` for it.',
        'Add `<Candlestick yAxisId="right" widthRatio={0.55} />` (from `@/components/charts/candlestick`). On its axis, ComposedChart pads the domain around high/low instead of starting at zero.',
        'Add a moving average as `<Line dataKey="average" yAxisId="right" stroke="var(--chart-1)" strokeWidth={1.5} curve={curveMonotoneX} />` (compute a 5- or 20-period mean of `close` if the data lacks one), then `<YAxis yAxisId="right" orientation="right" formatValue={(v) => `$${Math.round(v)}`} />`.',
        "Keep volume and candles apart with a hoisted `const VOLUME_DOMAIN: Record<string, YDomainOverride> = { volume: ([, max]) => [0, max * 4], right: ([min, max]) => [min - (max - min) * 0.45, max] }` (type from `@/components/charts/y-domain-utils`) passed as `yDomains={VOLUME_DOMAIN}` on `<ComposedChart>`.",
        "Keep `<Grid horizontal />`, `<XAxis />` and `<ChartTooltip />`.",
      ],
      code: `"use client";

import { Candlestick } from "@/components/charts/candlestick";
import { ComposedChart } from "@/components/charts/composed-chart";
import { Grid } from "@/components/charts/grid";
import { Line } from "@/components/charts/line-chart";
import { SeriesBar } from "@/components/charts/series-bar";
import { ChartTooltip } from "@/components/charts/tooltip";
import { XAxis } from "@/components/charts/x-axis";
import { YAxis } from "@/components/charts/y-axis";
import type { YDomainOverride } from "@/components/charts/y-domain-utils";
import { curveMonotoneX } from "d3-shape";

// Volume in the bottom quarter; the price axis floor drops so candles sit above it.
const VOLUME_DOMAIN: Record<string, YDomainOverride> = {
  volume: ([, max]) => [0, max * 4],
  right: ([min, max]) => [min - (max - min) * 0.45, max],
};

export function PriceChart({
  data,
}: {
  data: {
    date: Date;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    average: number;
  }[];
}) {
  return (
    <ComposedChart
      data={data}
      margin={{ top: 8, right: 52, bottom: 40, left: 8 }}
      maxBarSize={9}
      yDomains={VOLUME_DOMAIN}
    >
      <Grid horizontal />
      <SeriesBar
        dataKey="volume"
        fadedOpacity={0.5}
        fill="color-mix(in oklch, var(--muted-foreground) 35%, transparent)"
        yAxisId="volume"
      />
      <Candlestick widthRatio={0.55} yAxisId="right" />
      <Line
        curve={curveMonotoneX}
        dataKey="average"
        stroke="var(--chart-1)"
        strokeWidth={1.5}
        yAxisId="right"
      />
      <YAxis
        formatValue={(value) => \`$\${Math.round(value)}\`}
        orientation="right"
        yAxisId="right"
      />
      <XAxis />
      <ChartTooltip />
    </ComposedChart>
  );
}
`,
    },
  ],
};

const FORECAST_STEPS = [
  "Only convert charts that have a clear split between measured and projected rows, with a lower / upper bound on the projected ones. If there is no forecast, tell me instead of inventing one.",
  "Shape each row as `{ date, actual?, forecast, low, high }`. Leave `actual` off projected rows. On measured rows set `forecast` to the actual value and `low` / `high` to it as well, so the band is pinched shut until the forecast starts.",
  'Add `<Band lowerKey="low" upperKey="high" label="Forecast range" fill="var(--chart-2)" fillType="gradient" fillOpacity={0.3} strokeDasharray="3,4" strokeOpacity={0.5} />` (from `@/components/charts/band`) before the series.',
  'Add `<Line dataKey="forecast" stroke="var(--chart-2)" strokeWidth={2} dashArray="5,4" dashFromIndex={<last measured index>} />` so it turns dashed where the forecast starts.',
];

export const forecastHandoff: Recipe = {
  id: "forecast-handoff",
  title: "Forecast hand-off",
  category: "combos",
  description:
    "Measured bars hand off to a dashed forecast that widens into a gradient confidence band.",
  look: "solid rounded bars for the measured period; the series continues as a line that turns dashed exactly where the measurements stop, running through a soft gradient band with fine dashed edges that opens wider the further out the forecast goes. The tooltip shows the actual value, the forecast and the range.",
  charts: [
    {
      id: "composed",
      label: "Composed",
      rootComponent: "ComposedChart",
      Preview: ForecastComposed,
      install: ["composed-chart", "band"],
      steps: [
        ...FORECAST_STEPS,
        'Use `<ComposedChart maxBarSize={14}>` as the root and add `<SeriesBar dataKey="actual" fill="var(--chart-3)" radius={3} />` between the band and the line. Rows without `actual` just skip the bar.',
      ],
      code: `"use client";

import { Band } from "@/components/charts/band";
import { ComposedChart } from "@/components/charts/composed-chart";
import { Grid } from "@/components/charts/grid";
import { Line } from "@/components/charts/line-chart";
import { SeriesBar } from "@/components/charts/series-bar";
import { ChartTooltip } from "@/components/charts/tooltip";
import { XAxis } from "@/components/charts/x-axis";

export function ForecastChart({
  data,
  lastActualIndex,
}: {
  data: {
    date: Date;
    actual?: number;
    forecast: number;
    low: number;
    high: number;
  }[];
  lastActualIndex: number;
}) {
  return (
    <ComposedChart data={data} maxBarSize={14}>
      <Grid horizontal />
      <Band
        fill="var(--chart-2)"
        fillOpacity={0.3}
        fillType="gradient"
        label="Forecast range"
        lowerKey="low"
        strokeDasharray="3,4"
        strokeOpacity={0.5}
        upperKey="high"
      />
      <SeriesBar dataKey="actual" fill="var(--chart-3)" radius={3} />
      <Line
        dashArray="5,4"
        dashFromIndex={lastActualIndex}
        dataKey="forecast"
        stroke="var(--chart-2)"
        strokeWidth={2}
      />
      <XAxis />
      <ChartTooltip />
    </ComposedChart>
  );
}
`,
    },
    {
      id: "line",
      label: "Line",
      rootComponent: "LineChart",
      Preview: ForecastLine,
      install: ["line-chart", "band"],
      steps: [
        ...FORECAST_STEPS,
        "Keep `<LineChart>` as the root; the solid part of the line carries the measured values, so no bars are needed.",
      ],
      code: `"use client";

import { Band } from "@/components/charts/band";
import { Grid } from "@/components/charts/grid";
import { Line, LineChart } from "@/components/charts/line-chart";
import { ChartTooltip } from "@/components/charts/tooltip";
import { XAxis } from "@/components/charts/x-axis";

export function ForecastChart({
  data,
  lastActualIndex,
}: {
  data: { date: Date; forecast: number; low: number; high: number }[];
  lastActualIndex: number;
}) {
  return (
    <LineChart data={data}>
      <Grid horizontal />
      <Band
        fill="var(--chart-2)"
        fillOpacity={0.3}
        fillType="gradient"
        label="Forecast range"
        lowerKey="low"
        strokeDasharray="3,4"
        strokeOpacity={0.5}
        upperKey="high"
      />
      <Line
        dashArray="5,4"
        dashFromIndex={lastActualIndex}
        dataKey="forecast"
        stroke="var(--chart-2)"
        strokeWidth={2}
      />
      <XAxis />
      <ChartTooltip />
    </LineChart>
  );
}
`,
    },
  ],
};

export const signalNoise: Recipe = {
  id: "signal-noise",
  title: "Signal & noise",
  category: "combos",
  description:
    "Raw daily values as faint points, with a bold rolling average drawn through them.",
  look: "every raw data point drawn as a small translucent dot in the series colour, with a bold smoothed rolling-average line in the full-strength colour running through the cloud. Hovering a day dims the other points and the tooltip lists the raw value next to the average.",
  charts: [
    {
      id: "composed",
      label: "Composed",
      rootComponent: "ComposedChart",
      Preview: SignalNoise,
      install: ["composed-chart", "scatter-chart"],
      steps: [
        "Use this on noisy daily series. If the rows have no rolling average, add one: a 7-row trailing mean of the raw value stored as `average`.",
        "Switch the root to `<ComposedChart>` (from `@/components/charts/composed-chart`) so points and lines share the tooltip and y-domain.",
        'Draw the raw values as `<Scatter dataKey="<raw key>" radius={3.5} fill="color-mix(in oklch, var(--chart-1) 45%, transparent)" />` (from `@/components/charts/scatter`), replacing the old `<Line>` for that key.',
        'Add `<Line dataKey="average" stroke="var(--chart-1)" strokeWidth={2.5} curve={curveMonotoneX} />` after the scatter so it paints on top.',
      ],
      code: `"use client";

import { ComposedChart } from "@/components/charts/composed-chart";
import { Grid } from "@/components/charts/grid";
import { Line } from "@/components/charts/line-chart";
import { Scatter } from "@/components/charts/scatter";
import { ChartTooltip } from "@/components/charts/tooltip";
import { XAxis } from "@/components/charts/x-axis";
import { curveMonotoneX } from "d3-shape";

export function SignupsChart({
  data,
}: {
  data: { date: Date; signups: number; average: number }[];
}) {
  return (
    <ComposedChart data={data}>
      <Grid horizontal />
      <Scatter
        dataKey="signups"
        fill="color-mix(in oklch, var(--chart-1) 45%, transparent)"
        radius={3.5}
      />
      <Line
        curve={curveMonotoneX}
        dataKey="average"
        stroke="var(--chart-1)"
        strokeWidth={2.5}
      />
      <XAxis />
      <ChartTooltip />
    </ComposedChart>
  );
}
`,
    },
  ],
};

export const contextBars: Recipe = {
  id: "context-bars",
  title: "Context bars",
  category: "combos",
  description:
    "Last period as ghosted bars behind this period's line, for an at-a-glance comparison.",
  look: "the comparison period drawn as wide, rounded, barely-there bars in a muted neutral tint behind the chart, with the current period as a bold smoothed line in the series colour over the top. The tooltip lists both values.",
  charts: [
    {
      id: "composed",
      label: "Composed",
      rootComponent: "ComposedChart",
      Preview: ContextBars,
      install: ["composed-chart"],
      steps: [
        "Only convert charts that carry a comparison series for the same dates (previous period, target, last year). If there isn't one, tell me instead of inventing it.",
        "Switch the root to `<ComposedChart barGap={0} maxBarSize={18}>` (from `@/components/charts/composed-chart`).",
        'Draw the comparison first as `<SeriesBar dataKey="<comparison key>" radius={4} fill="color-mix(in oklch, var(--muted-foreground) 22%, transparent)" stroke="var(--muted-foreground)" fadedOpacity={0.6} />`. `stroke` only sets the tooltip dot colour.',
        'Keep the headline as `<Line dataKey="<headline key>" stroke="var(--chart-1)" strokeWidth={2.5} curve={curveMonotoneX} />` after the bars.',
      ],
      code: `"use client";

import { ComposedChart } from "@/components/charts/composed-chart";
import { Grid } from "@/components/charts/grid";
import { Line } from "@/components/charts/line-chart";
import { SeriesBar } from "@/components/charts/series-bar";
import { ChartTooltip } from "@/components/charts/tooltip";
import { XAxis } from "@/components/charts/x-axis";
import { curveMonotoneX } from "d3-shape";

export function VisitorsChart({
  data,
}: {
  data: { date: Date; visitors: number; previous: number }[];
}) {
  return (
    <ComposedChart barGap={0} data={data} maxBarSize={18}>
      <Grid horizontal />
      <SeriesBar
        dataKey="previous"
        fadedOpacity={0.6}
        fill="color-mix(in oklch, var(--muted-foreground) 22%, transparent)"
        radius={4}
        stroke="var(--muted-foreground)"
      />
      <Line
        curve={curveMonotoneX}
        dataKey="visitors"
        stroke="var(--chart-1)"
        strokeWidth={2.5}
      />
      <XAxis />
      <ChartTooltip />
    </ComposedChart>
  );
}
`,
    },
  ],
};
