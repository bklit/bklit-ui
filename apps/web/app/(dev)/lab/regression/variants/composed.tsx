"use client";

import {
  Area,
  Background,
  ChartTooltip,
  ComposedChart,
  Deadline,
  Grid,
  Line,
  type Margin,
  PatternLines,
  ReferenceArea,
  SeriesBar,
  TrendLine,
  Weekends,
  XAxis,
  YAxis,
} from "@bklitui/ui/charts";
import {
  type CurveFactory,
  curveBasis,
  curveCatmullRom,
  curveLinear,
  curveMonotoneX,
  curveNatural,
  curveStep,
} from "d3-shape";
import type { ReactNode } from "react";
import {
  composedDemoData,
  composedStackedData,
  composedTriSeriesData,
} from "@/lib/composed-demo-data";
import type { LabVariant } from "./types";

const EXAMPLES = "chart-examples.tsx";

// lib/composed-demo-data.ts is deterministic (UTC-noon ISO dates, no clock).
const dataCast = composedDemoData as unknown as Record<string, unknown>[];
const stackedCast = composedStackedData as unknown as Record<string, unknown>[];
const triCast = composedTriSeriesData as unknown as Record<string, unknown>[];

/**
 * `createChartExamplePreview`'s margin (`useChartExampleMargin`), passed
 * explicitly; source margins are spread over it exactly like the wrapper does.
 */
const EXAMPLE_MARGIN: Margin = { top: 20, right: 8, bottom: 40, left: 8 };

function exampleMargin(margin?: Partial<Margin>): Margin {
  return { ...EXAMPLE_MARGIN, ...margin };
}

const chartMarginLeftYAxis = { top: 8, right: 8, bottom: 40, left: 56 };
const chartMarginBiaxialYAxis = { top: 8, right: 56, bottom: 40, left: 56 };

/** tailwind fuchsia-400 / lime-300 / amber-300 / red-500 (chart-examples.tsx). */
const COMPOSED_PATTERN_FUCHSIA = "#e879f9";
const COMPOSED_ACCENT_LIME = "#bef264";
const COMPOSED_ACCENT_AMBER = "#fcd34d";
const COMPOSED_ACCENT_RED = "#ef4444";

const composedHeroSmoothCurve = curveCatmullRom.alpha(0.42);

/** 3 / 2 at 640 px wide is ~427 px tall. */
const ASPECT_3_2_HEIGHT = 440;

/** chart-examples.tsx `HERO_CURVE_OPTIONS`. */
const HERO_CURVES: readonly {
  id: string;
  label: string;
  curve: CurveFactory;
}[] = [
  { id: "catmull-rom", label: "Catmull–Rom", curve: composedHeroSmoothCurve },
  { id: "natural", label: "Natural", curve: curveNatural },
  { id: "monotone-x", label: "Monotone X", curve: curveMonotoneX },
  { id: "linear", label: "Linear", curve: curveLinear },
  { id: "step", label: "Step", curve: curveStep },
  { id: "basis", label: "Basis", curve: curveBasis },
];

/** chart-examples.tsx `ComposedHeroWithCurveSelect` at a fixed curve (no toolbar). */
function ComposedHero({ curve }: { curve: CurveFactory }) {
  return (
    <ComposedChart
      aspectRatio="2 / 1"
      barGap={0}
      data={dataCast}
      margin={EXAMPLE_MARGIN}
      maxBarSize={32}
      xDataKey="date"
    >
      <Grid horizontal />
      <Area
        curve={curve}
        dataKey="runRate"
        fill="var(--chart-4)"
        fillOpacity={0.32}
      />
      <SeriesBar dataKey="units" fill="var(--chart-3)" radius={4} />
      <Line
        curve={curve}
        dataKey="revenue"
        stroke="var(--chart-1)"
        strokeWidth={2.5}
      />
      <ChartTooltip showCrosshair={false} />
      <XAxis numTicks={8} />
    </ComposedChart>
  );
}

/** Gallery background / reference-area base: units bars + revenue line. */
function UnitsRevenue({
  before,
  after,
  grid = false,
  lineStroke = "var(--chart-1)",
}: {
  before?: ReactNode;
  after?: ReactNode;
  grid?: boolean;
  lineStroke?: string;
}) {
  return (
    <ComposedChart data={dataCast} margin={EXAMPLE_MARGIN} xDataKey="date">
      {grid ? <Grid horizontal /> : null}
      {before}
      <SeriesBar dataKey="units" fill="var(--chart-3)" radius={4} />
      <Line dataKey="revenue" stroke={lineStroke} />
      {after}
      <ChartTooltip showCrosshair={false} />
      <XAxis numTicks={8} />
    </ComposedChart>
  );
}

const heroCurveVariants: LabVariant[] = HERO_CURVES.map(
  ({ id, label, curve }) => ({
    kind: "single",
    id: `hero-${id}`,
    label: `Hero · ${label}`,
    source:
      id === "catmull-rom"
        ? `${EXAMPLES}: Composed Chart hero (ComposedHeroWithCurveSelect default; also docs/composed-chart-docs-preview.tsx)`
        : `${EXAMPLES}: Composed Chart hero (ComposedHeroWithCurveSelect, curve "${label}")`,
    exercises:
      id === "catmull-rom"
        ? "Hero default: Area + SeriesBar + Line, barGap 0, Catmull–Rom α 0.42"
        : `Hero with the ${label} curve on the Line and Area`,
    render: () => <ComposedHero curve={curve} />,
  })
);

export const COMPOSED_VARIANTS: readonly LabVariant[] = [
  ...heroCurveVariants,
  {
    kind: "single",
    id: "bar-line",
    label: "Bar + line",
    source: `${EXAMPLES}: Composed Chart — Bar + line`,
    exercises: "Rounded SeriesBar (radius 5) + Line, aspect 3/2",
    height: ASPECT_3_2_HEIGHT,
    render: () => (
      <ComposedChart
        aspectRatio="3 / 2"
        barGap={0}
        data={dataCast}
        margin={EXAMPLE_MARGIN}
        maxBarSize={32}
        xDataKey="date"
      >
        <Grid horizontal />
        <SeriesBar dataKey="units" fill="var(--chart-3)" radius={5} />
        <Line dataKey="revenue" stroke="var(--chart-1)" />
        <ChartTooltip showCrosshair={false} />
        <XAxis numTicks={8} />
      </ComposedChart>
    ),
  },
  {
    kind: "single",
    id: "accent-colors",
    label: "Lime / amber / red",
    source: `${EXAMPLES}: Composed Chart — Lime / amber / red`,
    exercises: "Hex colors, stroked bars, Area under bars, strokeWidth 2.5",
    height: ASPECT_3_2_HEIGHT,
    render: () => (
      <ComposedChart
        aspectRatio="3 / 2"
        barGap={0}
        data={dataCast}
        margin={EXAMPLE_MARGIN}
        maxBarSize={30}
        xDataKey="date"
      >
        <Grid horizontal />
        <Area
          dataKey="runRate"
          fill={COMPOSED_ACCENT_RED}
          fillOpacity={0.22}
          stroke={COMPOSED_ACCENT_RED}
          strokeWidth={1.5}
        />
        <SeriesBar
          dataKey="units"
          fill={COMPOSED_ACCENT_LIME}
          radius={6}
          stroke={COMPOSED_ACCENT_LIME}
        />
        <Line
          dataKey="revenue"
          stroke={COMPOSED_ACCENT_AMBER}
          strokeWidth={2.5}
        />
        <ChartTooltip showCrosshair={false} />
        <XAxis numTicks={8} />
      </ComposedChart>
    ),
  },
  {
    kind: "single",
    id: "stacked",
    label: "Stacked bars + line",
    source: `${EXAMPLES}: Composed Chart — Stacked SeriesBar + line`,
    exercises: "stacked + stackGap={0} SeriesBar segments",
    height: ASPECT_3_2_HEIGHT,
    render: () => (
      <ComposedChart
        aspectRatio="3 / 2"
        barGap={0}
        data={stackedCast}
        margin={EXAMPLE_MARGIN}
        maxBarSize={28}
        stacked
        stackGap={0}
        xDataKey="date"
      >
        <Grid horizontal />
        <SeriesBar dataKey="direct" fill="var(--chart-3)" />
        <SeriesBar dataKey="partner" fill="var(--chart-5)" />
        <Line dataKey="revenue" stroke="var(--chart-1)" />
        <ChartTooltip showCrosshair={false} />
        <XAxis numTicks={8} />
      </ComposedChart>
    ),
  },
  {
    kind: "single",
    id: "grouped",
    label: "Grouped bars, no gap",
    source: `${EXAMPLES}: Composed Chart — Grouped bars, no gap`,
    exercises: "Two grouped SeriesBar series per x",
    height: ASPECT_3_2_HEIGHT,
    render: () => (
      <ComposedChart
        aspectRatio="3 / 2"
        barGap={0}
        data={dataCast}
        margin={EXAMPLE_MARGIN}
        maxBarSize={26}
        xDataKey="date"
      >
        <Grid horizontal />
        <SeriesBar dataKey="units" fill="var(--chart-3)" radius={4} />
        <SeriesBar dataKey="runRate" fill="var(--chart-5)" radius={4} />
        <Line dataKey="revenue" stroke="var(--chart-1)" />
        <ChartTooltip showCrosshair={false} />
        <XAxis numTicks={8} />
      </ComposedChart>
    ),
  },
  {
    kind: "single",
    id: "pattern",
    label: "Pattern fills",
    source: `${EXAMPLES}: Composed Chart — Pattern fills`,
    exercises: "PatternLines fill on one SeriesBar, solid on the other",
    height: ASPECT_3_2_HEIGHT,
    render: () => (
      <ComposedChart
        aspectRatio="3 / 2"
        barGap={0}
        data={dataCast}
        margin={EXAMPLE_MARGIN}
        maxBarSize={22}
        xDataKey="date"
      >
        <PatternLines
          height={6}
          id="composed-pat-fuchsia"
          orientation={["diagonal"]}
          stroke={COMPOSED_PATTERN_FUCHSIA}
          strokeWidth={1}
          width={6}
        />
        <Grid horizontal />
        <SeriesBar
          dataKey="units"
          fill="url(#composed-pat-fuchsia)"
          stroke={COMPOSED_PATTERN_FUCHSIA}
        />
        <SeriesBar dataKey="runRate" fill="var(--chart-5)" />
        <Line dataKey="revenue" stroke="var(--chart-1)" />
        <ChartTooltip showCrosshair={false} />
        <XAxis numTicks={8} />
      </ComposedChart>
    ),
  },
  {
    kind: "single",
    id: "bar-two-lines",
    label: "Bar + two lines",
    source: `${EXAMPLES}: Composed Chart — Bar + two lines`,
    exercises: "One SeriesBar + two Lines (tri-series data)",
    height: ASPECT_3_2_HEIGHT,
    render: () => (
      <ComposedChart
        aspectRatio="3 / 2"
        barGap={0}
        data={triCast}
        margin={EXAMPLE_MARGIN}
        maxBarSize={20}
        xDataKey="date"
      >
        <Grid horizontal />
        <SeriesBar dataKey="installs" fill="var(--chart-3)" radius={5} />
        <Line dataKey="desktop" stroke="var(--chart-1)" />
        <Line dataKey="mobile" stroke="var(--chart-2)" />
        <ChartTooltip showCrosshair={false} />
        <XAxis numTicks={8} />
      </ComposedChart>
    ),
  },
  {
    kind: "single",
    id: "markers-dashed-tail",
    label: "Markers & dashed tail",
    source: `${EXAMPLES}: Composed Chart — Markers & dashed tail`,
    exercises:
      "showMarkers + dashFromIndex on Area and Line, XAxis tickMode data",
    height: ASPECT_3_2_HEIGHT,
    render: () => (
      <ComposedChart
        aspectRatio="3 / 2"
        data={dataCast}
        margin={EXAMPLE_MARGIN}
        xDataKey="date"
      >
        <Grid horizontal />
        <SeriesBar dataKey="revenue" fill="var(--chart-1)" radius={4} />
        <Area
          dashArray="6,4"
          dashFromIndex={4}
          dataKey="runRate"
          fill="var(--chart-4)"
          fillOpacity={0.3}
          showMarkers
        />
        <Line
          dashArray="6,4"
          dashFromIndex={4}
          dataKey="runRate"
          showMarkers
          stroke="var(--chart-2)"
          strokeWidth={2}
        />
        <ChartTooltip showCrosshair={false} />
        <XAxis tickMode="data" />
      </ComposedChart>
    ),
  },
  {
    kind: "single",
    id: "y-axis-left",
    label: "Left Y axis",
    source: `${EXAMPLES}: Composed Chart — Left Y axis`,
    exercises: "Bars + line on one left scale with YAxis labels",
    render: () => (
      <ComposedChart
        barGap={0}
        data={dataCast}
        margin={exampleMargin(chartMarginLeftYAxis)}
        maxBarSize={32}
        xDataKey="date"
      >
        <Grid horizontal />
        <SeriesBar dataKey="units" fill="var(--chart-3)" radius={4} />
        <Line dataKey="revenue" stroke="var(--chart-1)" />
        <YAxis yAxisId="left" />
        <ChartTooltip showCrosshair={false} />
        <XAxis numTicks={8} />
      </ComposedChart>
    ),
  },
  {
    kind: "single",
    id: "y-axis-biaxial",
    label: "Left + right Y axes",
    source: `${EXAMPLES}: Composed Chart — Left and right Y axes`,
    exercises: "Units on the left scale, revenue Line on the right",
    render: () => (
      <ComposedChart
        barGap={0}
        data={dataCast}
        margin={exampleMargin(chartMarginBiaxialYAxis)}
        maxBarSize={32}
        xDataKey="date"
      >
        <Grid horizontal />
        <SeriesBar dataKey="units" fill="var(--chart-3)" radius={4} />
        <Line dataKey="revenue" stroke="var(--chart-1)" yAxisId="right" />
        <YAxis yAxisId="left" />
        <YAxis orientation="right" yAxisId="right" />
        <ChartTooltip showCrosshair={false} />
        <XAxis numTicks={8} />
      </ComposedChart>
    ),
  },
  {
    kind: "single",
    id: "y-axis-biaxial-area",
    label: "Biaxial area + right grid",
    source: "composed-chart.mdx: YAxis / yAxisId on Line and Area (no example)",
    exercises:
      "Area on the right scale, Grid yAxisId right, YAxis numTicks + formatValue",
    render: () => (
      <ComposedChart
        barGap={0}
        data={dataCast}
        margin={exampleMargin(chartMarginBiaxialYAxis)}
        maxBarSize={32}
        xDataKey="date"
      >
        <Grid horizontal yAxisId="right" />
        <Area
          dataKey="revenue"
          fill="var(--chart-4)"
          fillOpacity={0.3}
          yAxisId="right"
        />
        <SeriesBar dataKey="units" fill="var(--chart-3)" radius={4} />
        <YAxis numTicks={4} yAxisId="left" />
        <YAxis
          formatValue={(value) => `$${value}k`}
          orientation="right"
          yAxisId="right"
        />
        <ChartTooltip showCrosshair={false} />
        <XAxis numTicks={8} />
      </ComposedChart>
    ),
  },
  {
    kind: "single",
    id: "bar-size-crosshair",
    label: "barSize + crosshair",
    source: "composed-chart.mdx: barSize, fadedOpacity, ChartTooltip defaults",
    exercises:
      "Fixed barSize, SeriesBar fadedOpacity, default tooltip with crosshair + date pill",
    render: () => (
      <ComposedChart
        barSize={8}
        data={dataCast}
        margin={EXAMPLE_MARGIN}
        xDataKey="date"
      >
        <Grid horizontal />
        <SeriesBar
          dataKey="units"
          fadedOpacity={0.15}
          fill="var(--chart-3)"
          radius={2}
        />
        <Line dataKey="revenue" stroke="var(--chart-1)" />
        <ChartTooltip />
        <XAxis numTicks={8} />
      </ComposedChart>
    ),
  },
  {
    kind: "single",
    id: "animate-false",
    label: "animate={false}",
    source: "SeriesBar / Line / Area animate prop (no example)",
    exercises: "Every mark with animate={false}; only the chart reveal runs",
    render: () => (
      <ComposedChart
        barGap={0}
        data={dataCast}
        margin={EXAMPLE_MARGIN}
        maxBarSize={32}
        xDataKey="date"
      >
        <Grid horizontal />
        <Area
          animate={false}
          dataKey="runRate"
          fill="var(--chart-4)"
          fillOpacity={0.32}
        />
        <SeriesBar
          animate={false}
          dataKey="units"
          fill="var(--chart-3)"
          radius={4}
        />
        <Line animate={false} dataKey="revenue" stroke="var(--chart-1)" />
        <ChartTooltip showCrosshair={false} />
        <XAxis numTicks={8} />
      </ComposedChart>
    ),
  },
  {
    kind: "single",
    id: "background-pattern",
    label: "Pattern background",
    source: `${EXAMPLES}: Composed Chart - Pattern Background`,
    exercises: "Background (diagonal) instead of Grid behind bars",
    render: () => <UnitsRevenue before={<Background />} />,
  },
  {
    kind: "single",
    id: "background-dots",
    label: "Dot grid background",
    source: `${EXAMPLES}: Composed Chart - Dot Grid Background`,
    exercises: "Background dots with edge fade",
    render: () => (
      <UnitsRevenue before={<Background opacity={0.85} pattern="dots" />} />
    ),
  },
  {
    kind: "single",
    id: "reference-band",
    label: "Reference band",
    source: `${EXAMPLES}: Composed Chart - Reference Band`,
    exercises: "ReferenceArea y1 95 / y2 110, dashed edges + markers",
    render: () => (
      <UnitsRevenue
        before={
          <ReferenceArea showMarkers strokeStyle="dashed" y1={95} y2={110} />
        }
      />
    ),
  },
  {
    kind: "single",
    id: "reference-band-pattern",
    label: "Pattern reference band",
    source: `${EXAMPLES}: Composed Chart - Pattern Reference Band`,
    exercises: "ReferenceArea pattern fill (no YAxis: label color unused)",
    render: () => (
      <UnitsRevenue
        before={
          <ReferenceArea
            axisLabelColor="var(--chart-1)"
            fillOpacity={0.85}
            pattern="diagonal"
            patternColor="var(--chart-foreground-muted)"
            y1={95}
            y2={110}
          />
        }
      />
    ),
  },
  {
    kind: "single",
    id: "trend-line",
    label: "Trend line",
    source: `${EXAMPLES}: Composed Chart - Trend Line`,
    exercises: "Dashed TrendLine on the revenue Line",
    render: () => (
      <UnitsRevenue
        after={<TrendLine dataKey="revenue" stroke="var(--chart-1)" />}
        grid
        lineStroke="var(--chart-2)"
      />
    ),
  },
  {
    kind: "single",
    id: "trend-line-gradient",
    label: "Gradient trend line",
    source: `${EXAMPLES}: Composed Chart - Gradient Trend Line`,
    exercises: "Gradient TrendLine stroke with faded ends",
    render: () => (
      <UnitsRevenue
        after={
          <TrendLine
            dataKey="revenue"
            fadeEdges
            gradientEnd="var(--chart-1)"
            gradientStart="var(--chart-3)"
            strokeStyle="gradient"
            strokeWidth={2.5}
          />
        }
        grid
        lineStroke="var(--chart-2)"
      />
    ),
  },
  {
    kind: "single",
    id: "trend-line-docs",
    label: "Trend lines on bars + line (docs)",
    source:
      "docs/trend-line-demo.tsx: TrendLineComposedDemo (utility/trend-line.mdx)",
    exercises:
      "Two TrendLines (line series + SeriesBar series, custom dasharray), default margins",
    render: () => (
      <ComposedChart barGap={0} data={dataCast} maxBarSize={32} xDataKey="date">
        <Grid horizontal />
        <SeriesBar dataKey="units" fill="var(--chart-3)" radius={4} />
        <Line dataKey="revenue" stroke="var(--chart-1)" />
        <TrendLine dataKey="revenue" fadeEdges stroke="var(--chart-1)" />
        <TrendLine
          dataKey="units"
          stroke="var(--chart-3)"
          strokeDasharray="2,4"
        />
        <ChartTooltip showCrosshair={false} />
        <XAxis numTicks={8} />
      </ComposedChart>
    ),
  },
  {
    kind: "single",
    id: "date-highlights",
    label: "Weekends + deadline",
    source:
      "docs/date-highlights-demo.tsx: DateHighlightsComposedDemo (composed-chart.mdx, utility/weekends.mdx)",
    exercises:
      "Weekends utc (band centered on SeriesBar columns) + labelled Deadline",
    render: () => (
      <ComposedChart
        aspectRatio="2 / 1"
        barGap={0}
        data={dataCast}
        maxBarSize={24}
        xDataKey="date"
      >
        <Grid horizontal />
        <Weekends utc />
        <Deadline
          date={composedDemoData[21]?.date ?? "2024-01-22"}
          label="Quarter close"
        />
        <SeriesBar dataKey="units" fill="var(--chart-3)" radius={3} />
        <Line
          curve={curveCatmullRom.alpha(0.42)}
          dataKey="revenue"
          stroke="var(--chart-1)"
        />
        <ChartTooltip showCrosshair={false} />
        <XAxis numTicks={8} />
      </ComposedChart>
    ),
  },
];
