"use client";

import {
  Candlestick,
  ChartTooltip,
  ComposedChart,
  Grid,
  Line,
  Scatter,
  SeriesBar,
  XAxis,
  YAxis,
  type YDomainOverride,
} from "@bklitui/ui/charts";
import { curveCatmullRom, curveMonotoneX } from "d3-shape";
import {
  COMPOSED_FEATURED_Y_DOMAINS,
  composedFeaturedChartData,
  composedFeaturedLayers,
} from "@/components/charts/composed-featured";
import {
  recipeMarketData,
  recipeSignalData,
} from "@/components/recipes/recipe-data";

/** Quiet context bars: the series colour at low strength, so lines read on top. */
export const COMPOSED_MUTED_BAR_FILL =
  "color-mix(in oklch, var(--chart-3) 32%, transparent)";

const featuredCurve = curveCatmullRom.alpha(0.42);

/** Hero: the featured scatter + band + line + bars composition. */
export function ComposedChartDocsPreview() {
  return (
    <div className="w-full">
      <ComposedChart
        aspectRatio="2 / 1"
        data={composedFeaturedChartData}
        maxBarSize={14}
        xDataKey="date"
        yDomains={COMPOSED_FEATURED_Y_DOMAINS}
      >
        {composedFeaturedLayers(featuredCurve)}
      </ComposedChart>
    </div>
  );
}

const PRICE_VOLUME_DOMAINS: Record<string, YDomainOverride> = {
  volume: ([, max]) => [0, max * 4],
  right: ([min, max]) => [min - (max - min) * 0.45, max],
};

const formatPrice = (value: number) => `$${Math.round(value)}`;

/** Candles + moving average on a floating price axis, volume underneath. */
export function ComposedPriceVolumeDemo() {
  return (
    <div className="w-full">
      <ComposedChart
        aspectRatio="2 / 1"
        data={recipeMarketData}
        margin={{ right: 56 }}
        maxBarSize={9}
        yDomains={PRICE_VOLUME_DOMAINS}
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
    </div>
  );
}

/** Raw daily points with a bold rolling average through them. */
export function ComposedSignalDemo() {
  return (
    <div className="w-full">
      <ComposedChart aspectRatio="2 / 1" data={recipeSignalData}>
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
    </div>
  );
}
