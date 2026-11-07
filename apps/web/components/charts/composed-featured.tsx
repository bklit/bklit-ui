"use client";

import {
  Band,
  ChartTooltip,
  Grid,
  Line,
  Scatter,
  SeriesBar,
  XAxis,
  type YDomainOverride,
} from "@bklitui/ui/charts";
import type { CurveFactory } from "d3-shape";
import type { ReactElement } from "react";
import { composedFeaturedData } from "@/lib/composed-demo-data";

export const composedFeaturedChartData =
  composedFeaturedData as unknown as Record<string, unknown>[];

const featuredValues = composedFeaturedData.flatMap((row) => [
  row.low,
  row.high,
  row.revenue,
]);
const featuredMin = Math.min(...featuredValues);
const featuredMax = Math.max(...featuredValues);
const featuredRange = featuredMax - featuredMin;

/**
 * Orders fill the bottom third on their own hidden axis; the revenue axis
 * floats so the band and points use the top two-thirds.
 */
export const COMPOSED_FEATURED_Y_DOMAINS: Record<string, YDomainOverride> = {
  orders: ([, max]) => [0, max * 3],
  left: [featuredMin - featuredRange * 0.6, featuredMax + featuredRange * 0.05],
};

/**
 * Featured composed layers — muted order bars, an expected-range band, raw
 * daily revenue points and the smoothed 7-day trend. Returned as an array
 * (not a fragment) so the chart shell can sort each child into its layer.
 */
export function composedFeaturedLayers(curve: CurveFactory): ReactElement[] {
  return [
    <Grid horizontal key="grid" />,
    <SeriesBar
      dataKey="orders"
      fadedOpacity={0.5}
      fill="color-mix(in oklch, var(--chart-3) 30%, transparent)"
      key="orders"
      radius={3}
      stroke="var(--chart-3)"
      yAxisId="orders"
    />,
    <Band
      curve={curve}
      fill="var(--chart-1)"
      fillOpacity={0.22}
      fillType="gradient"
      key="band"
      label="Expected"
      lowerKey="low"
      strokeDasharray="3,4"
      strokeOpacity={0.5}
      upperKey="high"
    />,
    <Scatter
      dataKey="revenue"
      fill="color-mix(in oklch, var(--chart-2) 75%, transparent)"
      key="revenue"
      radius={3.5}
    />,
    <Line
      curve={curve}
      dataKey="trend"
      key="trend"
      stroke="var(--chart-1)"
      strokeWidth={2.5}
    />,
    <ChartTooltip key="tooltip" />,
    <XAxis key="xaxis" numTicks={6} />,
  ];
}

export const COMPOSED_FEATURED_CODE = `const yDomains = {
  orders: ([, max]) => [0, max * 3], // bars in the bottom third
  left: [minValue - range * 0.6, maxValue + range * 0.05], // band + points above them
};

<ComposedChart data={data} xDataKey="date" aspectRatio="2 / 1" maxBarSize={14} yDomains={yDomains}>
  <Grid horizontal />
  <SeriesBar
    dataKey="orders"
    fill="color-mix(in oklch, var(--chart-3) 30%, transparent)"
    stroke="var(--chart-3)"
    radius={3}
    yAxisId="orders"
  />
  <Band
    upperKey="high"
    lowerKey="low"
    label="Expected"
    curve={curveCatmullRom.alpha(0.42)}
    fill="var(--chart-1)"
    fillType="gradient"
    fillOpacity={0.22}
    strokeDasharray="3,4"
    strokeOpacity={0.5}
  />
  <Scatter dataKey="revenue" fill="color-mix(in oklch, var(--chart-2) 75%, transparent)" radius={3.5} />
  <Line dataKey="trend" curve={curveCatmullRom.alpha(0.42)} stroke="var(--chart-1)" strokeWidth={2.5} />
  <ChartTooltip />
  <XAxis numTicks={6} />
</ComposedChart>`;
