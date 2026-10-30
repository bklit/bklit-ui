"use client";

import {
  Background,
  Bar,
  BarChart,
  BarChartLoading,
  BarColumnTrack,
  BarDepthBack,
  BarDepthFront,
  BarDepthProvider,
  BarPulse,
  BarSquares,
  BarXAxis,
  BarYAxis,
  ChartTooltip,
  Deadline,
  Grid,
  Legend,
  LegendItemComponent,
  LegendLabel,
  LegendMarker,
  LinearGradient,
  PatternLines,
  ReferenceArea,
  renderPatternPreset,
  TrendLine,
  Weekends,
  YAxis,
} from "@bklitui/ui/charts";
import { type ReactNode, useEffect, useId, useState } from "react";
import { VerticalFade } from "@/components/recipes/vertical-fade";
import {
  BAR_MARGIN,
  BarLineIndicator,
  barDailyData,
  barData,
  barHeroData,
  barHorizontalData,
  barMinHeightData,
  barProfitLossData,
  barRevenueData,
  barShapeGradientStops,
  barShapePatternColor,
  barShapeTrackPatternColor,
  barStackedData,
  barValueLabelData,
  chartMarginBiaxialYAxis,
  chartMarginLeftYAxis,
  customIndicatorData,
  dateHighlightsBarData,
  docsRevenueProfitData,
  galleryMargin,
  PROJECT_DUE_DATE,
  RisingBarIndicator,
  recipeHalfYearData,
  recipeMonthlyData,
  stackedLegendItems,
} from "./bar-data";
import type { LabVariant } from "./types";

const EXAMPLES = "chart-examples.tsx";
const DOCS = "docs/bar-chart-demo.tsx";
const RECIPES = "recipes/definitions";
const PROPS = "bar-chart.mdx props (no ported example)";

/** Gallery `BarExampleChart` = BarChart with the desktop example margin. */
function GalleryBarChart({
  margin,
  ...props
}: React.ComponentProps<typeof BarChart>) {
  return <BarChart {...props} margin={galleryMargin(margin)} />;
}

/** Docs demos wrap every chart in `<div className="w-full">`. */
function Docs({ children }: { children: ReactNode }) {
  return <div className="w-full">{children}</div>;
}

/** 4 / 3 horizontal charts are ~480px tall at the 640px frame width. */
const HORIZONTAL_FRAME_HEIGHT = 490;

/**
 * docs/bar-chart-loading-demo.tsx with the Loading → Ready toggle replaced
 * by a fixed timer, so the looping shimmer stops and the enter settles.
 */
function LoadingThenReady({ delayMs }: { delayMs: number }) {
  const [status, setStatus] = useState<"loading" | "ready">("loading");
  useEffect(() => {
    const id = setTimeout(() => setStatus("ready"), delayMs);
    return () => clearTimeout(id);
  }, [delayMs]);
  return (
    <Docs>
      <BarChart data={barRevenueData} status={status} xDataKey="month">
        <Grid horizontal />
        <Bar dataKey="revenue" />
        <BarXAxis />
      </BarChart>
    </Docs>
  );
}

function GlowBar() {
  const gradientId = `recipe-glow-${useId().replace(/:/g, "")}`;
  return (
    <BarChart data={recipeMonthlyData} margin={BAR_MARGIN} xDataKey="month">
      <LinearGradient
        from="var(--chart-1)"
        fromOpacity={1}
        id={gradientId}
        to="var(--chart-1)"
        toOpacity={0.12}
      />
      <Bar
        dataKey="revenue"
        fill={`url(#${gradientId})`}
        lineCap={6}
        stroke="var(--chart-1)"
      />
      <BarXAxis />
      <ChartTooltip />
    </BarChart>
  );
}

function RisingBar() {
  const uid = useId().replace(/:/g, "");
  return (
    <BarChart
      barGap={0}
      data={recipeHalfYearData}
      margin={BAR_MARGIN}
      xDataKey="month"
    >
      <LinearGradient
        from="var(--chart-1)"
        id={`${uid}-fill`}
        to="var(--chart-1)"
        toOpacity={0.08}
      />
      <PatternLines
        height={6}
        id={`${uid}-hatch`}
        orientation={["diagonal"]}
        stroke="var(--chart-3)"
        strokeWidth={1.5}
        width={6}
      />
      <Grid horizontal />
      <Bar
        dataKey="revenue"
        fill={`url(#${uid}-fill)`}
        groupGap={0}
        lineCap="butt"
        stroke="var(--chart-1)"
      />
      <Bar
        dataKey="previous"
        fill={`url(#${uid}-hatch)`}
        groupGap={0}
        lineCap="butt"
        stroke="var(--chart-3)"
      />
      <BarXAxis />
      <ChartTooltip showCrosshair={false} showDots={false} />
      <RisingBarIndicator dataKeys={["revenue", "previous"]} />
    </BarChart>
  );
}

function SquircleBarsPreview() {
  const uid = useId().replace(/:/g, "");
  return (
    <BarChart
      data={recipeMonthlyData}
      margin={BAR_MARGIN}
      squareSnap={{ squareGap: 3, groupGap: 4 }}
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
          groupGap={4}
          opacity={0.65}
          squareGap={3}
          squareRadius={0.5}
        />
      </VerticalFade>
      <BarSquares
        dataKey="previous"
        fill={`url(#${uid}-previous)`}
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

export const BAR_VARIANTS: readonly LabVariant[] = [
  {
    kind: "single",
    id: "default",
    label: "Bar",
    source: `${EXAMPLES}: Bar Chart`,
    exercises: 'single series, lineCap="round", gallery margin',
    render: () => (
      <GalleryBarChart data={barData} xDataKey="month">
        <Grid horizontal />
        <Bar dataKey="desktop" lineCap="round" />
        <BarXAxis />
        <ChartTooltip />
      </GalleryBarChart>
    ),
  },
  {
    kind: "single",
    id: "docs-preview",
    label: "Docs preview (two series)",
    source: "bar-chart.mdx: ComponentPreview",
    exercises:
      "default BarChart margin (40) and aspect, grouped revenue + profit with line-primary / line-secondary fills",
    render: () => (
      <Docs>
        <BarChart data={docsRevenueProfitData} xDataKey="month">
          <Grid horizontal />
          <Bar
            dataKey="revenue"
            fill="var(--chart-line-primary)"
            lineCap="round"
          />
          <Bar
            dataKey="profit"
            fill="var(--chart-line-secondary)"
            lineCap="round"
          />
          <BarXAxis />
          <ChartTooltip />
        </BarChart>
      </Docs>
    ),
  },
  {
    kind: "single",
    id: "value-labels",
    label: "Value labels",
    source: `${EXAMPLES}: Bar Chart - Value Labels; ${RECIPES}/value-labels.tsx (same, dashed grid)`,
    exercises: "showValue auto orientation over 12 bars",
    render: () => (
      <GalleryBarChart data={barValueLabelData} xDataKey="month">
        <Grid horizontal />
        <Bar dataKey="orders" showValue />
        <BarXAxis />
        <ChartTooltip />
      </GalleryBarChart>
    ),
  },
  {
    kind: "single",
    id: "value-labels-options",
    label: "Value labels (rotated, bottom, formatter)",
    source: PROPS,
    exercises:
      'valueLabelOrientation="vertical", valueLabelPosition="bottom", valueLabelFormatter, valueLabelColor',
    render: () => (
      <GalleryBarChart data={barValueLabelData} xDataKey="month">
        <Grid horizontal />
        <Bar
          dataKey="orders"
          showValue
          valueLabelColor="var(--foreground)"
          valueLabelFormatter={(value) => `$${value.toLocaleString("en-US")}`}
          valueLabelOrientation="vertical"
          valueLabelPosition="bottom"
        />
        <BarXAxis />
        <ChartTooltip />
      </GalleryBarChart>
    ),
  },
  {
    kind: "single",
    id: "value-labels-horizontal",
    label: "Value labels (horizontal bars)",
    source: PROPS,
    exercises:
      'showValue on orientation="horizontal", valueLabelPosition="top"',
    height: HORIZONTAL_FRAME_HEIGHT,
    render: () => (
      <GalleryBarChart
        aspectRatio="4 / 3"
        data={barHorizontalData}
        margin={{ left: 80 }}
        orientation="horizontal"
        xDataKey="browser"
      >
        <Grid fadeVertical horizontal={false} vertical />
        <Bar
          dataKey="users"
          lineCap={4}
          showValue
          valueLabelOrientation="horizontal"
          valueLabelPosition="top"
        />
        <BarYAxis />
        <ChartTooltip showCrosshair={false} />
      </GalleryBarChart>
    ),
  },
  {
    kind: "single",
    id: "loading",
    label: "Loading (shimmer)",
    source: `${EXAMPLES}: Bar Chart - Loading`,
    exercises: "BarChartLoading skeleton",
    previewOnly: "the loading shimmer sweep repeats forever (never settles)",
    render: () => <BarChartLoading margin={galleryMargin()} />,
  },
  {
    kind: "single",
    id: "loading-to-ready",
    label: "Loading → ready",
    source:
      "docs/bar-chart-loading-demo.tsx (toggle replaced by a 900 ms timer)",
    exercises: 'status="loading" then "ready": skeleton → real bars enter',
    render: () => <LoadingThenReady delayMs={900} />,
  },
  {
    kind: "single",
    id: "depth-3d",
    label: "3D depth + line indicator",
    source: `${EXAMPLES}: Bar Chart - 3D Depth`,
    exercises:
      "BarDepthBack / perspective Bar / BarDepthFront, portal BarLineIndicator springs on hover",
    render: () => (
      <GalleryBarChart data={barData} xDataKey="month">
        <Grid horizontal />
        <BarDepthBack color="var(--chart-1)" dataKey="desktop" />
        <Bar dataKey="desktop" fill="var(--chart-1)" perspective />
        <BarDepthFront dataKey="desktop" />
        <BarXAxis />
        <ChartTooltip showCrosshair={false} showDots={false} />
        <BarLineIndicator data={barData} valueKey="desktop" xKey="month" />
      </GalleryBarChart>
    ),
  },
  {
    kind: "single",
    id: "depth-3d-stacked",
    label: "3D stacked",
    source: `${EXAMPLES}: Bar Chart - 3D Stacked`,
    exercises: "BarDepthProvider segmentsAccessor on stacked bars",
    render: () => (
      <BarDepthProvider
        segmentsAccessor={(d) => [
          { value: d.desktop as number, color: "var(--chart-1)" },
          { value: d.mobile as number, color: "var(--chart-3)" },
        ]}
      >
        <GalleryBarChart data={barStackedData} stacked xDataKey="month">
          <Grid horizontal />
          <BarDepthBack dataKey="desktop" />
          <Bar dataKey="desktop" fill="var(--chart-1)" perspective />
          <Bar dataKey="mobile" fill="var(--chart-3)" perspective />
          <BarDepthFront dataKey="desktop" />
          <BarXAxis />
          <ChartTooltip showCrosshair={false} showDots={false} />
        </GalleryBarChart>
      </BarDepthProvider>
    ),
  },
  {
    kind: "single",
    id: "depth-3d-options",
    label: "3D depth: colorAccessor, minBarHeight, groundShadow",
    source: `${PROPS}: BarDepthBack colorAccessor, BarDepthProvider groundShadow + minBarHeight`,
    exercises:
      "per-bar depth colour, zero / tiny bars floored to 6px on Bar and provider, lighter contact shadow",
    render: () => (
      <BarDepthProvider groundShadow={0.12} minBarHeight={6}>
        <GalleryBarChart data={barMinHeightData} xDataKey="month">
          <Grid horizontal />
          <BarDepthBack
            colorAccessor={(d) =>
              (d.value as number) >= 15_000
                ? "var(--chart-1)"
                : "var(--chart-3)"
            }
            dataKey="value"
          />
          <Bar
            dataKey="value"
            fill="var(--chart-1)"
            minBarHeight={6}
            perspective
          />
          <BarDepthFront dataKey="value" />
          <BarXAxis />
          <ChartTooltip showCrosshair={false} showDots={false} />
        </GalleryBarChart>
      </BarDepthProvider>
    ),
  },
  {
    kind: "single",
    id: "depth-3d-negative",
    label: "3D depth, negative values",
    source: `${PROPS}: "Negative values are supported" (3D depth section)`,
    exercises: "depth faces on bars growing down from the zero line",
    render: () => (
      <GalleryBarChart data={barProfitLossData} xDataKey="month">
        <Grid highlightRowValues={[0]} horizontal />
        <BarDepthBack color="var(--chart-1)" dataKey="profit" />
        <Bar dataKey="profit" fill="var(--chart-1)" perspective />
        <BarDepthFront dataKey="profit" />
        <BarXAxis />
        <ChartTooltip showCrosshair={false} showDots={false} />
      </GalleryBarChart>
    ),
  },
  {
    kind: "single",
    id: "depth-3d-pulse",
    label: "3D depth + BarPulse",
    source: `${PROPS}: BarPulse`,
    exercises: "looping sweep over the last bar",
    previewOnly: "BarPulse loops forever (repeat: Infinity), never settles",
    render: () => (
      <GalleryBarChart data={barData} xDataKey="month">
        <Grid horizontal />
        <BarDepthBack color="var(--chart-1)" dataKey="desktop" />
        <Bar dataKey="desktop" fill="var(--chart-1)" perspective />
        <BarDepthFront dataKey="desktop" />
        <BarPulse activeIndex={barData.length - 1} dataKey="desktop" />
        <BarXAxis />
        <ChartTooltip showCrosshair={false} showDots={false} />
      </GalleryBarChart>
    ),
  },
  {
    kind: "single",
    id: "multiple-series",
    label: "Grouped",
    source: `${EXAMPLES}: Bar Chart - Multiple Series`,
    exercises: "two grouped series per band",
    render: () => (
      <GalleryBarChart data={barStackedData} xDataKey="month">
        <Grid horizontal />
        <Bar dataKey="desktop" fill="var(--chart-1)" lineCap="round" />
        <Bar dataKey="mobile" fill="var(--chart-3)" lineCap="round" />
        <BarXAxis />
        <ChartTooltip />
      </GalleryBarChart>
    ),
  },
  {
    kind: "single",
    id: "stacked",
    label: "Stacked",
    source: `${EXAMPLES}: Bar Chart - Stacked`,
    exercises: 'stacked + stackGap={3}, lineCap="butt"',
    render: () => (
      <GalleryBarChart
        data={barStackedData}
        stacked
        stackGap={3}
        xDataKey="month"
      >
        <Grid horizontal />
        <Bar
          dataKey="desktop"
          fill="var(--chart-1)"
          lineCap="butt"
          stackGap={3}
        />
        <Bar
          dataKey="mobile"
          fill="var(--chart-3)"
          lineCap="butt"
          stackGap={3}
        />
        <BarXAxis />
        <ChartTooltip />
      </GalleryBarChart>
    ),
  },
  {
    kind: "single",
    id: "stacked-legend",
    label: "Stacked, rounded + legend",
    source: `${DOCS}: BarChartStackedDemo + BarChartStackedWithLegendDemo`,
    exercises:
      "stacked with lineCap={4} rounded segments, default margin, Legend below",
    render: () => (
      <Docs>
        <BarChart data={barStackedData} stacked stackGap={3} xDataKey="month">
          <Grid horizontal />
          <Bar
            dataKey="desktop"
            fill="hsl(217, 91%, 60%)"
            lineCap={4}
            stackGap={3}
          />
          <Bar
            dataKey="mobile"
            fill="hsl(217, 91%, 75%)"
            lineCap={4}
            stackGap={3}
          />
          <BarXAxis />
          <ChartTooltip />
        </BarChart>
        <Legend
          className="flex-row justify-center gap-6"
          items={stackedLegendItems}
        >
          <LegendItemComponent className="flex items-center gap-2">
            <LegendMarker />
            <LegendLabel />
          </LegendItemComponent>
        </Legend>
      </Docs>
    ),
  },
  {
    kind: "single",
    id: "horizontal",
    label: "Horizontal",
    source: `${EXAMPLES}: Bar Chart - Horizontal; ${DOCS}: BarChartHorizontalDemo (fill only)`,
    exercises: 'orientation="horizontal", BarYAxis, vertical faded grid',
    height: HORIZONTAL_FRAME_HEIGHT,
    render: () => (
      <GalleryBarChart
        aspectRatio="4 / 3"
        data={barHorizontalData}
        margin={{ left: 80 }}
        orientation="horizontal"
        xDataKey="browser"
      >
        <Grid fadeVertical horizontal={false} vertical />
        <Bar dataKey="users" lineCap={4} />
        <BarYAxis />
        <ChartTooltip showCrosshair={false} />
      </GalleryBarChart>
    ),
  },
  {
    kind: "single",
    id: "horizontal-stacked",
    label: "Horizontal stacked",
    source: `${PROPS}: orientation + stacked`,
    exercises: "stacked segments along the x value axis",
    height: HORIZONTAL_FRAME_HEIGHT,
    render: () => (
      <GalleryBarChart
        aspectRatio="4 / 3"
        data={barStackedData}
        margin={{ left: 80 }}
        orientation="horizontal"
        stacked
        stackGap={3}
        xDataKey="month"
      >
        <Grid fadeVertical horizontal={false} vertical />
        <Bar dataKey="desktop" fill="var(--chart-1)" lineCap={4} stackGap={3} />
        <Bar dataKey="mobile" fill="var(--chart-3)" lineCap={4} stackGap={3} />
        <BarYAxis />
        <ChartTooltip showCrosshair={false} />
      </GalleryBarChart>
    ),
  },
  {
    kind: "single",
    id: "positive-negative",
    label: "Positive & negative",
    source: `${EXAMPLES}: Bar Chart - Positive & Negative; docs/bar-chart-profit-loss-demo.tsx (default margin)`,
    exercises: "domain below zero, bars growing down, highlighted zero row",
    render: () => (
      <GalleryBarChart data={barProfitLossData} xDataKey="month">
        <Grid highlightRowValues={[0]} horizontal />
        <Bar dataKey="profit" lineCap={4} />
        <BarXAxis />
        <ChartTooltip />
      </GalleryBarChart>
    ),
  },
  {
    kind: "single",
    id: "dense",
    label: "Dense (60 days)",
    source: `${EXAMPLES}: Bar Chart - Dense Data`,
    exercises: "60 bands, barGap={0.1}, BarXAxis maxLabels={6}",
    render: () => (
      <GalleryBarChart barGap={0.1} data={barDailyData} xDataKey="day">
        <Grid horizontal />
        <Bar dataKey="value" lineCap="butt" />
        <BarXAxis maxLabels={6} />
        <ChartTooltip />
      </GalleryBarChart>
    ),
  },
  {
    kind: "single",
    id: "hero",
    label: "Hero (90 days, 4 / 1)",
    source: `${EXAMPLES}: makeBarHero; ${DOCS}: BarChart90DaysDemo (2026 labels, default margin)`,
    exercises: 'aspectRatio="4 / 1", 90 bands, maxLabels={8}',
    render: () => (
      <GalleryBarChart
        aspectRatio="4 / 1"
        barGap={0.1}
        data={barHeroData}
        xDataKey="day"
      >
        <Grid horizontal />
        <Bar dataKey="value" lineCap="butt" />
        <BarXAxis maxLabels={8} />
        <ChartTooltip />
      </GalleryBarChart>
    ),
  },
  {
    kind: "single",
    id: "gradient",
    label: "Gradient",
    source: `${EXAMPLES}: Bar Chart - Gradient; ${DOCS}: BarChartGradientDemo`,
    exercises: "LinearGradient fill + stroke for the tooltip dot",
    render: () => (
      <GalleryBarChart data={barRevenueData} xDataKey="month">
        <LinearGradient
          from="hsl(217, 91%, 60%)"
          id="bar-example-gradient"
          to="hsl(280, 87%, 65%)"
        />
        <Grid horizontal />
        <Bar
          dataKey="revenue"
          fill="url(#bar-example-gradient)"
          lineCap={4}
          stroke="hsl(217, 91%, 60%)"
        />
        <BarXAxis />
        <ChartTooltip />
      </GalleryBarChart>
    ),
  },
  {
    kind: "single",
    id: "glow-no-grid",
    label: "Gradient glow (no grid)",
    source: `${RECIPES}/gradient-glow.tsx: GlowBar`,
    exercises:
      "no Grid, LinearGradient with from/to opacity, lineCap={6}, 12 months, BAR_MARGIN",
    render: () => <GlowBar />,
  },
  {
    kind: "single",
    id: "shape-gradient",
    label: "Shape squares + gradient",
    source: `${EXAMPLES}: Bar Chart - Shape & Gradient`,
    exercises:
      "squareSnap, BarColumnTrack, BarSquares with pattern preset + useGradient, ring tooltip dots",
    render: () => (
      <GalleryBarChart
        data={barStackedData}
        squareSnap={{ groupGap: 4, squareGap: 3 }}
        xDataKey="month"
      >
        {renderPatternPreset("diagonal", "bar-shape-track-pattern", {
          color: barShapeTrackPatternColor,
        })}
        <BarColumnTrack
          fill="url(#bar-shape-track-pattern)"
          groupGap={4}
          opacity={0.65}
          squareGap={3}
          squareRadius={0.25}
        />
        {renderPatternPreset("diagonal", "bar-shape-desktop-pattern", {
          color: barShapePatternColor,
        })}
        <BarSquares
          dataKey="desktop"
          fill="url(#bar-shape-desktop-pattern)"
          groupGap={4}
          squareGap={3}
          squareRadius={0.25}
          stroke={barShapePatternColor}
        />
        <BarSquares
          dataKey="mobile"
          fill="var(--chart-1)"
          gradientStops={barShapeGradientStops}
          groupGap={4}
          squareGap={3}
          squareRadius={0.25}
          stroke="var(--chart-5)"
          useGradient
        />
        <BarXAxis />
        <ChartTooltip
          dotColor="oklch(1 0.002 186.385 / 0.7)"
          dotScale={1.05}
          dotVariant="ring"
          showCrosshair={false}
        />
      </GalleryBarChart>
    ),
  },
  {
    kind: "single",
    id: "shape-squircle",
    label: "Shape squircle ring",
    source: `${EXAMPLES}: Bar Chart - Shape Squircle Ring`,
    exercises: "squareRadius={0.5}, ring dot with dotRadiusFraction",
    render: () => (
      <GalleryBarChart
        data={barStackedData}
        squareSnap={{ groupGap: 4, squareGap: 3 }}
        xDataKey="month"
      >
        {renderPatternPreset("diagonal", "bar-shape-squircle-track", {
          color: barShapeTrackPatternColor,
        })}
        <BarColumnTrack
          fill="url(#bar-shape-squircle-track)"
          groupGap={4}
          opacity={0.65}
          squareGap={3}
          squareRadius={0.5}
        />
        {renderPatternPreset("diagonal", "bar-shape-squircle-desktop", {
          color: barShapePatternColor,
        })}
        <BarSquares
          dataKey="desktop"
          fill="url(#bar-shape-squircle-desktop)"
          groupGap={4}
          squareGap={3}
          squareRadius={0.5}
          stroke={barShapePatternColor}
        />
        <BarSquares
          dataKey="mobile"
          fill="var(--chart-1)"
          groupGap={4}
          squareGap={3}
          squareRadius={0.5}
        />
        <BarXAxis />
        <ChartTooltip
          dotColor="oklch(1 0.002 186.385 / 0.7)"
          dotRadiusFraction={0.5}
          dotStrokeWidth={1}
          dotVariant="ring"
          showCrosshair={false}
        />
      </GalleryBarChart>
    ),
  },
  {
    kind: "single",
    id: "squircle-recipe",
    label: "Squircle bars (12 months)",
    source: `${RECIPES}/squircle-bars.tsx: SquircleBarsPreview`,
    exercises:
      "BarSquares over 12 bands, VerticalFade-masked track (useChartStable), BAR_MARGIN",
    render: () => <SquircleBarsPreview />,
  },
  {
    kind: "single",
    id: "squares-fit",
    label: "Squares fit + pattern preset",
    source: `${PROPS}: BarSquares squareFit, patternPreset; squareSnap fit`,
    exercises: "gap redistributed so columns hit the exact bar height",
    render: () => (
      <GalleryBarChart
        data={barStackedData}
        squareSnap={{ fit: true, groupGap: 4, squareGap: 3 }}
        xDataKey="month"
      >
        <BarColumnTrack groupGap={4} squareFit squareGap={3} />
        {renderPatternPreset("dots", "bar-squares-fit-dots", {
          color: "var(--chart-2)",
        })}
        <BarSquares
          dataKey="desktop"
          fill="url(#bar-squares-fit-dots)"
          groupGap={4}
          patternPreset="dots"
          squareFit
          squareGap={3}
          stroke="var(--chart-2)"
        />
        <BarSquares
          dataKey="mobile"
          fill="var(--chart-3)"
          groupGap={4}
          squareFit
          squareGap={3}
        />
        <BarXAxis />
        <ChartTooltip dotVariant="ring" showCrosshair={false} />
      </GalleryBarChart>
    ),
  },
  {
    kind: "single",
    id: "pattern",
    label: "Pattern",
    source: `${EXAMPLES}: Bar Chart - Pattern; ${DOCS}: BarChartPatternDemo`,
    exercises: "PatternLines fill",
    render: () => (
      <GalleryBarChart data={barRevenueData} xDataKey="month">
        <PatternLines
          height={8}
          id="bar-example-pattern"
          orientation={["diagonal"]}
          stroke="var(--chart-1)"
          strokeWidth={2}
          width={8}
        />
        <Grid horizontal />
        <Bar
          dataKey="revenue"
          fill="url(#bar-example-pattern)"
          lineCap={4}
          stroke="var(--chart-1)"
        />
        <BarXAxis />
        <ChartTooltip />
      </GalleryBarChart>
    ),
  },
  {
    kind: "single",
    id: "no-gap",
    label: "No gap + line indicator",
    source: `${EXAMPLES}: Bar Chart - No Gap; ${DOCS}: BarChartNoGapGradientDemo`,
    exercises: "barGap={0}, fade-to-transparent gradient, portal indicator",
    render: () => (
      <GalleryBarChart barGap={0} data={barRevenueData} xDataKey="month">
        <LinearGradient
          from="var(--chart-3)"
          id="bar-example-nogap-gradient"
          to="transparent"
        />
        <Grid horizontal />
        <Bar
          dataKey="revenue"
          fill="url(#bar-example-nogap-gradient)"
          lineCap="butt"
          stroke="var(--chart-3)"
        />
        <BarXAxis />
        <ChartTooltip showCrosshair={false} showDots={false} />
        <BarLineIndicator
          data={barRevenueData}
          valueKey="revenue"
          xKey="month"
        />
      </GalleryBarChart>
    ),
  },
  {
    kind: "single",
    id: "custom-indicator",
    label: "Custom indicator (two series)",
    source:
      "docs/custom-indicator-demo.tsx: CustomIndicatorDemo (custom-indicator.mdx)",
    exercises:
      "groupGap={0} flush pair, gradient + pattern fills, portal indicator per key, default margin",
    render: () => (
      <Docs>
        <BarChart barGap={0} data={customIndicatorData} xDataKey="month">
          <LinearGradient
            from="var(--chart-3)"
            id="customIndicatorGradient"
            to="transparent"
          />
          <PatternLines
            height={6}
            id="diagonalPattern"
            orientation={["diagonal"]}
            stroke="var(--chart-4)"
            strokeWidth={1.5}
            width={6}
          />
          <Grid horizontal />
          <Bar
            dataKey="revenue"
            fill="url(#customIndicatorGradient)"
            groupGap={0}
            lineCap="butt"
            stroke="var(--chart-3)"
          />
          <Bar
            dataKey="cost"
            fill="url(#diagonalPattern)"
            groupGap={0}
            lineCap="butt"
            stroke="var(--chart-4)"
          />
          <BarXAxis />
          <ChartTooltip showCrosshair={false} showDots={false} />
          <BarLineIndicator
            data={customIndicatorData}
            overflowVisible={false}
            valueKeys={["revenue", "cost"]}
            xKey="month"
          />
        </BarChart>
      </Docs>
    ),
  },
  {
    kind: "single",
    id: "rising-indicator",
    label: "Rising indicator (post overlay)",
    source: `${RECIPES}/custom-indicators.tsx: RisingBar`,
    exercises:
      "in-SVG indicator with __isPostOverlay, reads barXAccessor from useChart",
    render: () => <RisingBar />,
  },
  {
    kind: "single",
    id: "custom-tooltip",
    label: "Custom tooltip rows",
    source: `${EXAMPLES}: Bar Chart - Custom Tooltip; ${DOCS}: BarChartCustomTooltipDemo; docs/tooltip-demo.tsx: TooltipBarChartDemo`,
    exercises: "ChartTooltip rows formatter",
    render: () => (
      <GalleryBarChart data={barRevenueData} xDataKey="month">
        <Grid horizontal />
        <Bar dataKey="revenue" lineCap="round" />
        <BarXAxis />
        <ChartTooltip
          rows={(point) => [
            {
              color: "var(--chart-line-primary)",
              label: "Revenue",
              value: `$${(point.revenue as number)?.toLocaleString()}`,
            },
          ]}
        />
      </GalleryBarChart>
    ),
  },
  {
    kind: "single",
    id: "narrow-gaps",
    label: "Narrow gaps",
    source: `${DOCS}: BarChartNarrowGapsDemo`,
    exercises: "barGap={0.1} on 6 bands, default margin",
    render: () => (
      <Docs>
        <BarChart barGap={0.1} data={docsRevenueProfitData} xDataKey="month">
          <Grid horizontal />
          <Bar
            dataKey="revenue"
            fill="var(--chart-line-primary)"
            lineCap="round"
          />
          <BarXAxis />
          <ChartTooltip />
        </BarChart>
      </Docs>
    ),
  },
  {
    kind: "single",
    id: "fixed-bar-width",
    label: "Fixed bar width",
    source: `${PROPS}: barWidth`,
    exercises: "barWidth={24} instead of band-derived width",
    render: () => (
      <GalleryBarChart barWidth={24} data={barStackedData} xDataKey="month">
        <Grid horizontal />
        <Bar dataKey="desktop" fill="var(--chart-1)" lineCap="round" />
        <Bar dataKey="mobile" fill="var(--chart-3)" lineCap="round" />
        <BarXAxis />
        <ChartTooltip />
      </GalleryBarChart>
    ),
  },
  {
    kind: "single",
    id: "left-y-axis",
    label: "Left Y axis",
    source: `${EXAMPLES}: Bar Chart - Left Y axis`,
    exercises: "YAxis on a band chart, grouped",
    render: () => (
      <GalleryBarChart
        data={barStackedData}
        margin={chartMarginLeftYAxis}
        xDataKey="month"
      >
        <Grid horizontal />
        <Bar dataKey="desktop" lineCap="round" />
        <Bar dataKey="mobile" fill="var(--chart-3)" lineCap="round" />
        <YAxis yAxisId="left" />
        <BarXAxis />
        <ChartTooltip />
      </GalleryBarChart>
    ),
  },
  {
    kind: "single",
    id: "biaxial",
    label: "Left and right Y axes",
    source: `${EXAMPLES}: Bar Chart - Left and right Y axes`,
    exercises: "independent yAxisId scales on a band chart",
    render: () => (
      <GalleryBarChart
        data={barStackedData}
        margin={chartMarginBiaxialYAxis}
        xDataKey="month"
      >
        <Grid horizontal />
        <Bar dataKey="desktop" lineCap="round" yAxisId="left" />
        <Bar
          dataKey="mobile"
          fill="var(--chart-3)"
          lineCap="round"
          yAxisId="right"
        />
        <YAxis yAxisId="left" />
        <YAxis orientation="right" yAxisId="right" />
        <BarXAxis />
        <ChartTooltip />
      </GalleryBarChart>
    ),
  },
  {
    kind: "single",
    id: "background-pattern",
    label: "Pattern background",
    source: `${EXAMPLES}: Bar Chart - Pattern Background`,
    exercises: "Background (diagonal) instead of Grid",
    render: () => (
      <GalleryBarChart data={barStackedData} xDataKey="month">
        <Background />
        <Bar dataKey="desktop" lineCap="round" />
        <BarXAxis />
        <ChartTooltip showCrosshair={false} />
      </GalleryBarChart>
    ),
  },
  {
    kind: "single",
    id: "background-dots",
    label: "Dot grid background",
    source: `${EXAMPLES}: Bar Chart - Dot Grid Background`,
    exercises: 'Background pattern="dots"',
    render: () => (
      <GalleryBarChart data={barStackedData} xDataKey="month">
        <Background opacity={0.85} pattern="dots" />
        <Bar dataKey="desktop" lineCap="round" />
        <BarXAxis />
        <ChartTooltip showCrosshair={false} />
      </GalleryBarChart>
    ),
  },
  {
    kind: "single",
    id: "hatched-backdrop",
    label: "Hatched backdrop (vertical fade)",
    source: `${RECIPES}/hatched-backdrop.tsx: HatchedBar`,
    exercises: "Background fadeVerticalLength={33}, 12 months",
    render: () => (
      <BarChart data={recipeMonthlyData} margin={BAR_MARGIN} xDataKey="month">
        <Background fadeVerticalLength={33} pattern="diagonal" />
        <Bar dataKey="revenue" lineCap={4} />
        <BarXAxis />
        <ChartTooltip />
      </BarChart>
    ),
  },
  {
    kind: "single",
    id: "monochrome",
    label: "Monochrome",
    source: `${RECIPES}/monochrome.tsx: MonoBar`,
    exercises: 'dashed grid (strokeDasharray="1,4"), grouped lineCap={3}',
    render: () => (
      <BarChart data={recipeMonthlyData} margin={BAR_MARGIN} xDataKey="month">
        <Grid horizontal strokeDasharray="1,4" />
        <Bar dataKey="previous" fill="var(--muted-foreground)" lineCap={3} />
        <Bar dataKey="revenue" fill="var(--foreground)" lineCap={3} />
        <BarXAxis />
        <ChartTooltip />
      </BarChart>
    ),
  },
  {
    kind: "single",
    id: "reference-band",
    label: "Reference band",
    source: `${EXAMPLES}: Bar Chart - Reference Band`,
    exercises: "ReferenceArea y1/y2 dashed with markers",
    render: () => (
      <GalleryBarChart data={barStackedData} xDataKey="month">
        <ReferenceArea showMarkers strokeStyle="dashed" y1={4200} y2={5000} />
        <Bar dataKey="desktop" lineCap="round" />
        <BarXAxis />
        <ChartTooltip showCrosshair={false} />
      </GalleryBarChart>
    ),
  },
  {
    kind: "single",
    id: "reference-band-pattern",
    label: "Pattern reference band",
    source: `${EXAMPLES}: Bar Chart - Pattern Reference Band`,
    exercises: "ReferenceArea pattern fill + axis label colour",
    render: () => (
      <GalleryBarChart data={barStackedData} xDataKey="month">
        <ReferenceArea
          axisLabelColor="var(--chart-1)"
          fillOpacity={0.85}
          pattern="diagonal"
          patternColor="var(--chart-foreground-muted)"
          y1={4200}
          y2={5000}
        />
        <Bar dataKey="desktop" lineCap="round" />
        <BarXAxis />
        <ChartTooltip showCrosshair={false} />
      </GalleryBarChart>
    ),
  },
  {
    kind: "single",
    id: "trend-line",
    label: "Trend line",
    source: `${EXAMPLES}: Bar Chart - Trend Line`,
    exercises: "TrendLine through vertical bar centers",
    render: () => (
      <GalleryBarChart data={barStackedData} xDataKey="month">
        <Grid horizontal />
        <Bar dataKey="desktop" lineCap="round" />
        <TrendLine dataKey="desktop" stroke="var(--chart-1)" />
        <BarXAxis />
        <ChartTooltip showCrosshair={false} />
      </GalleryBarChart>
    ),
  },
  {
    kind: "single",
    id: "trend-line-gradient",
    label: "Gradient trend line",
    source: `${EXAMPLES}: Bar Chart - Gradient Trend Line; ${RECIPES}/trend-line.tsx: TrendOnBar (same props); docs/trend-line-demo.tsx: TrendLineBarDemo (no fadeEdges)`,
    exercises: 'TrendLine strokeStyle="gradient" + fadeEdges',
    render: () => (
      <GalleryBarChart data={barStackedData} xDataKey="month">
        <Grid horizontal />
        <Bar dataKey="desktop" lineCap="round" />
        <TrendLine
          dataKey="desktop"
          fadeEdges
          gradientEnd="var(--chart-1)"
          gradientStart="var(--chart-3)"
          strokeStyle="gradient"
          strokeWidth={2.5}
        />
        <BarXAxis />
        <ChartTooltip showCrosshair={false} />
      </GalleryBarChart>
    ),
  },
  {
    kind: "single",
    id: "horizontal-trend-line",
    label: "Horizontal trend line",
    source: `${EXAMPLES}: Bar Chart - Horizontal Trend Line; docs/trend-line-demo.tsx: TrendLineHorizontalBarDemo`,
    exercises: "TrendLine along the value axis of horizontal bars",
    height: HORIZONTAL_FRAME_HEIGHT,
    render: () => (
      <GalleryBarChart
        aspectRatio="4 / 3"
        data={barHorizontalData}
        margin={{ left: 80 }}
        orientation="horizontal"
        xDataKey="browser"
      >
        <Grid fadeVertical horizontal={false} vertical />
        <Bar dataKey="users" lineCap={4} />
        <TrendLine dataKey="users" stroke="var(--chart-1)" />
        <BarYAxis />
        <ChartTooltip showCrosshair={false} />
      </GalleryBarChart>
    ),
  },
  {
    kind: "single",
    id: "weekends-deadline",
    label: "Weekends + deadline",
    source:
      "docs/date-highlights-demo.tsx: DateHighlightsBarDemo (bar-chart.mdx, weekends.mdx)",
    exercises: "Date x keys on a band scale, Weekends columns, Deadline",
    render: () => (
      <Docs>
        <BarChart data={dateHighlightsBarData} xDataKey="date">
          <Grid horizontal />
          <Weekends />
          <Deadline date={PROJECT_DUE_DATE} label="Due" />
          <Bar dataKey="issues" fill="var(--chart-line-primary)" lineCap={2} />
          <BarXAxis maxLabels={7} />
          <ChartTooltip />
        </BarChart>
      </Docs>
    ),
  },
  {
    kind: "single",
    id: "no-animation",
    label: "animate={false}",
    source: `${PROPS}: Bar animate`,
    exercises: "bars render at final geometry with no grow",
    render: () => (
      <GalleryBarChart data={barStackedData} xDataKey="month">
        <Grid horizontal />
        <Bar animate={false} dataKey="desktop" fill="var(--chart-1)" />
        <Bar animate={false} dataKey="mobile" fill="var(--chart-3)" />
        <BarXAxis />
        <ChartTooltip />
      </GalleryBarChart>
    ),
  },
  {
    kind: "single",
    id: "fade-animation",
    label: 'animationType="fade"',
    source: `${PROPS}: Bar animationType, fadedOpacity, staggerDelay`,
    exercises: "fade enter instead of grow, custom fadedOpacity + stagger",
    render: () => (
      <GalleryBarChart data={barStackedData} xDataKey="month">
        <Grid horizontal />
        <Bar
          animationType="fade"
          dataKey="desktop"
          fadedOpacity={0.15}
          fill="var(--chart-1)"
          staggerDelay={0.12}
        />
        <Bar
          animationType="fade"
          dataKey="mobile"
          fadedOpacity={0.15}
          fill="var(--chart-3)"
          staggerDelay={0.12}
        />
        <BarXAxis />
        <ChartTooltip />
      </GalleryBarChart>
    ),
  },
];
