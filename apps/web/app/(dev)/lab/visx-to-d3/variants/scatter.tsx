"use client";

import {
  Background,
  ChartTooltip,
  Grid,
  ReferenceArea,
  Scatter,
  ScatterChart,
  XAxis,
  YAxis,
} from "@bklitui/ui/charts";
import type { ComponentProps } from "react";
// Deterministic (seeded Park–Miller, fixed 2025 dates): safe to import.
import {
  formatLoc,
  formatPrMonth,
  PrLocTooltip,
  prLocData,
  prLocSeries,
} from "@/lib/scatter-pr-demo-data";
import {
  chartMarginBiaxialYAxis,
  chartMarginLeftYAxis,
  galleryMargin,
} from "./bar-data";
import type { LabVariant } from "./types";

const EXAMPLES = "chart-examples.tsx";
const DOCS = "docs/scatter-chart-demo.tsx";
const PROPS = "scatter-chart.mdx props (no ported example)";

// Data copied verbatim from chart-examples.tsx.

/** `multiLineData`: 6 monthly points. */
const multiLineData = [
  { date: new Date(2024, 0, 1), desktop: 186, mobile: 80 },
  { date: new Date(2024, 1, 1), desktop: 305, mobile: 200 },
  { date: new Date(2024, 2, 1), desktop: 237, mobile: 120 },
  { date: new Date(2024, 3, 1), desktop: 73, mobile: 190 },
  { date: new Date(2024, 4, 1), desktop: 209, mobile: 130 },
  { date: new Date(2024, 5, 1), desktop: 214, mobile: 140 },
];

/** `scatterMultiSeriesData`: 24 months (also docs `chartData`, renamed keys). */
const scatterMultiSeriesData = Array.from({ length: 24 }, (_, i) => ({
  date: new Date(2023, i, 1),
  desktop: Math.floor(140 + Math.sin(i / 3) * 90 + ((i * 11) % 40)),
  mobile: Math.floor(70 + Math.cos(i / 2.5) * 55 + ((i * 7) % 35)),
}));

/** Gallery `ScatterExampleChart` = ScatterChart + desktop example margin. */
function GalleryScatterChart({
  margin,
  ...props
}: ComponentProps<typeof ScatterChart>) {
  return <ScatterChart {...props} margin={galleryMargin(margin)} />;
}

export const SCATTER_VARIANTS: readonly LabVariant[] = [
  {
    kind: "single",
    id: "hero",
    label: "Scatter (24 months)",
    source: `${EXAMPLES}: makeScatterHero; ${DOCS}: ScatterChartDemo (same data, default margin)`,
    exercises: "two series, default dots, hover dimming + crosshair",
    render: () => (
      <GalleryScatterChart data={scatterMultiSeriesData}>
        <Grid horizontal />
        <Scatter dataKey="desktop" />
        <Scatter dataKey="mobile" />
        <XAxis />
        <ChartTooltip />
      </GalleryScatterChart>
    ),
  },
  {
    kind: "single",
    id: "jitter",
    label: "Jitter (PR LOC)",
    source: `${EXAMPLES}: Scatter Chart - With Jitter; ${DOCS}: ScatterJitterDemo (margin 40/40/40/56)`,
    exercises:
      "jitter={{ x: 0.6 }} strip plot, formatXLabel, YAxis formatValue, dashed highlight row, nearest-point hover",
    render: () => (
      <GalleryScatterChart
        data={prLocData}
        formatXLabel={formatPrMonth}
        jitter={{ x: 0.6 }}
        margin={chartMarginLeftYAxis}
      >
        <Grid
          highlightRowStrokeDasharray="4,4"
          highlightRowValues={[500]}
          horizontal
        />
        <Scatter
          dataKey="fastlane"
          fill={prLocSeries.fastlane.color}
          radius={3}
        />
        <Scatter dataKey="human" fill={prLocSeries.human.color} radius={3} />
        <YAxis formatValue={formatLoc} />
        <XAxis numTicks={12} />
        <ChartTooltip content={({ point }) => <PrLocTooltip point={point} />} />
      </GalleryScatterChart>
    ),
  },
  {
    kind: "single",
    id: "jitter-xy-seed",
    label: "Jitter x + y + seed",
    source: `${PROPS}: jitter { x, y, seed }`,
    exercises: "vertical px jitter and a non-default seed",
    render: () => (
      <GalleryScatterChart
        data={prLocData}
        formatXLabel={formatPrMonth}
        jitter={{ x: 0.35, y: 6, seed: 7 }}
        margin={chartMarginLeftYAxis}
      >
        <Grid horizontal />
        <Scatter
          dataKey="fastlane"
          fill={prLocSeries.fastlane.color}
          radius={3}
        />
        <Scatter dataKey="human" fill={prLocSeries.human.color} radius={3} />
        <YAxis formatValue={formatLoc} />
        <XAxis numTicks={12} />
        <ChartTooltip />
      </GalleryScatterChart>
    ),
  },
  {
    kind: "single",
    id: "rings",
    label: "Rings",
    source: `${EXAMPLES}: Scatter Chart - Rings`,
    exercises: "strokeWidth={2} ringGap={2} offset rings",
    render: () => (
      <GalleryScatterChart data={multiLineData}>
        <Grid horizontal />
        <Scatter dataKey="desktop" ringGap={2} strokeWidth={2} />
        <Scatter dataKey="mobile" ringGap={2} strokeWidth={2} />
        <XAxis />
        <ChartTooltip />
      </GalleryScatterChart>
    ),
  },
  {
    kind: "single",
    id: "blur-inactive",
    label: "Blur inactive",
    source: `${EXAMPLES}: Scatter Chart - Blur Inactive`,
    exercises: 'inactiveMode="blur" on hover',
    render: () => (
      <GalleryScatterChart data={multiLineData}>
        <Grid horizontal />
        <Scatter dataKey="desktop" inactiveMode="blur" />
        <Scatter dataKey="mobile" inactiveMode="blur" />
        <XAxis />
        <ChartTooltip />
      </GalleryScatterChart>
    ),
  },
  {
    kind: "single",
    id: "small-dots",
    label: "Small dots",
    source: `${EXAMPLES}: Scatter Chart - Small Dots`,
    exercises: "radius={2} ringGap={1} strokeWidth={1}",
    render: () => (
      <GalleryScatterChart data={multiLineData}>
        <Grid horizontal />
        <Scatter dataKey="desktop" radius={2} ringGap={1} strokeWidth={1} />
        <Scatter dataKey="mobile" radius={2} ringGap={1} strokeWidth={1} />
        <XAxis />
        <ChartTooltip />
      </GalleryScatterChart>
    ),
  },
  {
    kind: "single",
    id: "wide-ring-gap",
    label: "Wide ring gap",
    source: `${EXAMPLES}: Scatter Chart - Wide Ring Gap`,
    exercises: "outlineWidth={0} radius={3} ringGap={5} strokeWidth={1}",
    render: () => (
      <GalleryScatterChart data={multiLineData}>
        <Grid horizontal />
        <Scatter
          dataKey="desktop"
          outlineWidth={0}
          radius={3}
          ringGap={5}
          strokeWidth={1}
        />
        <Scatter
          dataKey="mobile"
          outlineWidth={0}
          radius={3}
          ringGap={5}
          strokeWidth={1}
        />
        <XAxis />
        <ChartTooltip />
      </GalleryScatterChart>
    ),
  },
  {
    kind: "single",
    id: "left-y-axis",
    label: "Left Y axis",
    source: `${EXAMPLES}: Scatter Chart - Left Y axis`,
    exercises: "shared left scale with YAxis labels, custom stroke",
    render: () => (
      <GalleryScatterChart data={multiLineData} margin={chartMarginLeftYAxis}>
        <Grid horizontal />
        <Scatter dataKey="desktop" />
        <Scatter dataKey="mobile" stroke="var(--chart-2)" />
        <YAxis yAxisId="left" />
        <XAxis />
        <ChartTooltip />
      </GalleryScatterChart>
    ),
  },
  {
    kind: "single",
    id: "biaxial",
    label: "Left and right Y axes",
    source: `${EXAMPLES}: Scatter Chart - Left and right Y axes`,
    exercises: "independent yAxisId scales",
    render: () => (
      <GalleryScatterChart
        data={multiLineData}
        margin={chartMarginBiaxialYAxis}
      >
        <Grid horizontal />
        <Scatter dataKey="desktop" yAxisId="left" />
        <Scatter dataKey="mobile" stroke="var(--chart-2)" yAxisId="right" />
        <YAxis yAxisId="left" />
        <YAxis orientation="right" yAxisId="right" />
        <XAxis />
        <ChartTooltip />
      </GalleryScatterChart>
    ),
  },
  {
    kind: "single",
    id: "background-pattern",
    label: "Pattern background",
    source: `${EXAMPLES}: Scatter Chart - Pattern Background`,
    exercises: "Background (diagonal) instead of Grid",
    render: () => (
      <GalleryScatterChart data={scatterMultiSeriesData}>
        <Background />
        <Scatter dataKey="desktop" />
        <XAxis />
        <ChartTooltip />
      </GalleryScatterChart>
    ),
  },
  {
    kind: "single",
    id: "background-dots",
    label: "Dot grid background",
    source: `${EXAMPLES}: Scatter Chart - Dot Grid Background`,
    exercises: 'Background pattern="dots"',
    render: () => (
      <GalleryScatterChart data={scatterMultiSeriesData}>
        <Background opacity={0.85} pattern="dots" />
        <Scatter dataKey="desktop" />
        <XAxis />
        <ChartTooltip />
      </GalleryScatterChart>
    ),
  },
  {
    kind: "single",
    id: "reference-band",
    label: "Reference band",
    source: `${EXAMPLES}: Scatter Chart - Reference Band`,
    exercises: "ReferenceArea y1={120} y2={180} dashed with markers",
    render: () => (
      <GalleryScatterChart data={scatterMultiSeriesData}>
        <ReferenceArea showMarkers strokeStyle="dashed" y1={120} y2={180} />
        <Scatter dataKey="desktop" />
        <XAxis />
        <ChartTooltip />
      </GalleryScatterChart>
    ),
  },
  {
    kind: "single",
    id: "reference-band-pattern",
    label: "Pattern reference band",
    source: `${EXAMPLES}: Scatter Chart - Pattern Reference Band`,
    exercises: "ReferenceArea pattern + axis label colour",
    render: () => (
      <GalleryScatterChart data={scatterMultiSeriesData}>
        <ReferenceArea
          axisLabelColor="var(--chart-1)"
          fillOpacity={0.85}
          pattern="diagonal"
          patternColor="var(--chart-foreground-muted)"
          y1={120}
          y2={180}
        />
        <Scatter dataKey="desktop" />
        <XAxis />
        <ChartTooltip />
      </GalleryScatterChart>
    ),
  },
  {
    kind: "single",
    id: "y-gradient",
    label: "Y gradient",
    source: `${PROPS}: yGradient (default stops and custom from / to)`,
    exercises: "chart-space linearGradient fill by y position",
    render: () => (
      <GalleryScatterChart data={scatterMultiSeriesData}>
        <Grid horizontal />
        <Scatter dataKey="desktop" strokeWidth={0} yGradient />
        <Scatter
          dataKey="mobile"
          strokeWidth={0}
          yGradient={{
            from: "var(--color-red-500)",
            to: "var(--color-emerald-500)",
          }}
        />
        <XAxis />
        <ChartTooltip />
      </GalleryScatterChart>
    ),
  },
  {
    kind: "single",
    id: "hover-options",
    label: "No hover fade / highlight",
    source: `${PROPS}: fadeOnHover, showActiveHighlight, inactiveOpacity, inactiveBlur`,
    exercises:
      "series 1 never dims nor scales up; series 2 blurs 4px at opacity 0.15",
    render: () => (
      <GalleryScatterChart data={scatterMultiSeriesData}>
        <Grid horizontal />
        <Scatter
          dataKey="desktop"
          fadeOnHover={false}
          showActiveHighlight={false}
        />
        <Scatter
          dataKey="mobile"
          inactiveBlur={4}
          inactiveMode="blur"
          inactiveOpacity={0.15}
        />
        <XAxis />
        <ChartTooltip />
      </GalleryScatterChart>
    ),
  },
  {
    kind: "single",
    id: "no-animation",
    label: "animate={false}",
    source: `${PROPS}: Scatter animate`,
    exercises: "points at final positions without the clip reveal",
    render: () => (
      <GalleryScatterChart data={scatterMultiSeriesData}>
        <Grid horizontal />
        <Scatter animate={false} dataKey="desktop" />
        <Scatter animate={false} dataKey="mobile" />
        <XAxis />
        <ChartTooltip />
      </GalleryScatterChart>
    ),
  },
];
