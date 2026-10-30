"use client";

import {
  Area,
  AreaChart,
  AreaChartLoading,
  Background,
  Band,
  buildProjectionPath,
  ChartBrush,
  ChartBrushLayout,
  type ChartMarker,
  ChartMarkers,
  ChartTooltip,
  chartCssVars,
  Deadline,
  Grid,
  LineSeriesTerminalMarker,
  type Margin,
  MarkerTooltipContent,
  PatternArea,
  PatternLines,
  ProjectionLine,
  ReferenceArea,
  SegmentBackground,
  SegmentLineFrom,
  SegmentLineTo,
  TrendLine,
  useActiveMarkers,
  useChart,
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
import { motion, useSpring, useTransform } from "motion/react";
import { type ReactNode, useEffect, useId, useRef, useState } from "react";
import {
  recipeDailyData,
  recipeDiamondMarkers,
  recipeEventMarkers,
  recipeRangeData,
  recipeWeeklyData,
} from "@/components/recipes/recipe-data";
import { VerticalFade } from "@/components/recipes/vertical-fade";
import { homeTooltipPanelStyle } from "@/lib/home-tooltip-style";
import {
  areaData,
  areaHeroData,
  brushData,
  docsRevenueData,
  multiSeries24Data,
  PROJECT_DUE_DATE,
  projectProgressData,
  trendLineAreaData,
  weeklyVisitorsDashFromIndex,
  weeklyVisitorsData,
  yDomainReadyData,
} from "./area-data";
import type { LabVariant } from "./types";

const EXAMPLES = "chart-examples.tsx";
const RECIPES = "recipes/definitions";

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

/** chart-examples.tsx `HERO_CURVE_OPTIONS` (Catmull–Rom α 0.42). */
const HERO_CURVES: readonly {
  id: string;
  label: string;
  curve: CurveFactory;
}[] = [
  { id: "natural", label: "Natural", curve: curveNatural },
  { id: "monotone-x", label: "Monotone X", curve: curveMonotoneX },
  { id: "linear", label: "Linear", curve: curveLinear },
  { id: "step", label: "Step", curve: curveStep },
  { id: "basis", label: "Basis", curve: curveBasis },
  {
    id: "catmull-rom",
    label: "Catmull–Rom",
    curve: curveCatmullRom.alpha(0.42),
  },
];

/** chart-examples.tsx `AreaHeroWithCurveSelect` at a fixed curve (no toolbar). */
function AreaHero({ curve }: { curve: CurveFactory }) {
  return (
    <AreaChart aspectRatio="4 / 1" data={areaHeroData} margin={EXAMPLE_MARGIN}>
      <Grid horizontal />
      <Area
        curve={curve}
        dataKey="revenue"
        fill="var(--chart-line-primary)"
        fillOpacity={0.3}
        strokeWidth={2}
      />
      <Area
        curve={curve}
        dataKey="costs"
        fill="var(--chart-line-secondary)"
        fillOpacity={0.2}
        strokeWidth={1.5}
      />
      <SegmentBackground />
      <SegmentLineFrom />
      <SegmentLineTo />
      <XAxis />
      <ChartTooltip />
    </AreaChart>
  );
}

/** The gallery's "desktop" area on `areaData`, around a swappable layer. */
function DesktopArea({
  before,
  after,
  grid = true,
}: {
  before?: ReactNode;
  after?: ReactNode;
  grid?: boolean;
}) {
  return (
    <AreaChart data={areaData} margin={EXAMPLE_MARGIN}>
      {grid ? <Grid horizontal /> : null}
      {before}
      <Area dataKey="desktop" fillOpacity={0.3} strokeWidth={2} />
      {after}
      <XAxis />
      <ChartTooltip />
    </AreaChart>
  );
}

/** docs/area-tooltip-demo.tsx */
function AreaTooltipDemo() {
  return (
    <ChartTooltip
      rows={(point) => [
        {
          color: "var(--chart-line-primary)",
          label: "Revenue",
          value: `$${(point.revenue as number)?.toLocaleString() ?? 0}`,
        },
        {
          color: "var(--chart-line-secondary)",
          label: "Costs",
          value: `$${(point.costs as number)?.toLocaleString() ?? 0}`,
        },
      ]}
    />
  );
}

/** docs/area-chart-brush-demo.tsx */
const brushStripMargin = { top: 4, right: 40, bottom: 4, left: 40 };

function AreaBrush() {
  return (
    <div className="w-full" style={{ height: 360 }}>
      <ChartBrushLayout
        brushStrip={(brushLayout) => (
          <AreaChart
            animationDuration={0}
            className="size-full"
            data={brushData}
            margin={brushStripMargin}
            status="ready"
            style={{ aspectRatio: "unset", height: "100%" }}
          >
            <Area
              animate={false}
              dataKey="value"
              fadeEdges
              fill="var(--chart-line-primary)"
              fillOpacity={0.15}
              showHighlight={false}
              strokeWidth={2}
            />
            <ChartBrush
              fadeOuterEdges
              initialSelection={brushLayout.brushSelection ?? undefined}
              onSelectionChange={brushLayout.onBrushSelectionChange}
              selectionPattern={{
                color: "color-mix(in oklch, var(--chart-1) 20%, transparent)",
                preset: "diagonal",
              }}
            />
          </AreaChart>
        )}
        data={brushData}
        enabled
        height={72}
      >
        {(brushLayout) => (
          <AreaChart
            className="size-full"
            data={brushData}
            style={{ aspectRatio: "unset", height: "100%" }}
            tweenYDomainOnXDomainChange
            xDomain={brushLayout.xDomain}
            xDomainSlotCount={brushLayout.xDomainSlotCount}
            yDomainTween
          >
            <Grid horizontal stroke="var(--chart-grid)" />
            <Area
              dataKey="value"
              fadeEdges
              fill="var(--chart-line-primary)"
              fillOpacity={0.35}
              strokeWidth={2}
            />
            <XAxis />
            <ChartTooltip />
          </AreaChart>
        )}
      </ChartBrushLayout>
    </div>
  );
}

/** Flips loading → ready once, after a fixed delay (the demo's Ready button). */
const READY_AFTER_MS = 1500;

/** docs/area-chart-y-domain-demo.tsx with the buttons replaced by a timer. */
function AreaLoadingToReady({
  loadingStyle,
}: {
  loadingStyle: "pulse" | "sweep";
}) {
  const [status, setStatus] = useState<"loading" | "ready">("loading");
  useEffect(() => {
    const timer = setTimeout(() => setStatus("ready"), READY_AFTER_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AreaChart
      animationDuration={1100}
      data={yDomainReadyData}
      loadingLabel="Loading revenue…"
      status={status}
      yDomainTween
    >
      <Grid
        horizontal
        loadingStroke="color-mix(in oklch, var(--chart-grid) 50%, transparent)"
        shimmer={loadingStyle === "pulse"}
        shimmerSync
        stroke="var(--chart-grid)"
      />
      <Area
        dataKey="value"
        fadeEdges
        fill="var(--chart-line-primary)"
        fillOpacity={0.35}
        loadingStroke="var(--foreground)"
        loadingStrokeOpacity={0.5}
        loadingStyle={loadingStyle}
        showHighlight
        strokeWidth={2}
      />
    </AreaChart>
  );
}

/** recipes/definitions/event-markers.tsx */
const eventMarkers: ChartMarker[] = recipeEventMarkers;

function ActiveMarkers({ items }: { items: ChartMarker[] }) {
  const active = useActiveMarkers(items);
  if (active.length === 0) {
    return null;
  }
  return <MarkerTooltipContent markers={active} />;
}

/** recipes/definitions/diamond-markers.tsx (a custom `useChart` layer). */
interface DiamondMarker {
  date: Date;
  title: string;
}

function isSameDay(value: unknown, date: Date) {
  const other = value instanceof Date ? value : new Date(value as string);
  return other.toDateString() === date.toDateString();
}

function DiamondMarkers({
  items,
  size = 8,
  y = -12,
}: {
  items: DiamondMarker[];
  size?: number;
  y?: number;
}) {
  const { xScale, innerHeight, tooltipData, isLoaded } = useChart();
  const half = size / 2;

  return (
    <g
      style={{
        pointerEvents: "none",
        opacity: isLoaded ? 1 : 0,
        transition: "opacity 300ms ease-out",
      }}
    >
      {items.map((marker) => {
        const x = xScale(marker.date) ?? 0;
        const active = tooltipData
          ? isSameDay(tooltipData.point.date, marker.date)
          : false;
        return (
          <g key={marker.date.toISOString()} transform={`translate(${x}, 0)`}>
            <line
              stroke={chartCssVars.markerBorder}
              strokeDasharray="4,4"
              strokeOpacity={active ? 1 : 0.7}
              x1={0}
              x2={0}
              y1={y + half + 4}
              y2={innerHeight}
            />
            <rect
              fill={
                active ? chartCssVars.linePrimary : chartCssVars.foregroundMuted
              }
              height={size}
              transform={`translate(0, ${y}) rotate(45)`}
              width={size}
              x={-half}
              y={-half}
            />
          </g>
        );
      })}
    </g>
  );
}

// Render outside the series reveal clip so the diamond above the plot isn't cut off.
DiamondMarkers.__isPostOverlay = true;

function DiamondTooltipContent({ items }: { items: DiamondMarker[] }) {
  const { tooltipData } = useChart();
  const active = tooltipData
    ? items.filter((marker) => isSameDay(tooltipData.point.date, marker.date))
    : [];
  if (active.length === 0) {
    return null;
  }
  return (
    <div className="mt-2 space-y-1 border-chart-tooltip-muted border-t pt-2">
      {active.map((marker) => (
        <div
          className="flex items-center gap-2 text-chart-tooltip-foreground text-sm"
          key={marker.title}
        >
          <span
            aria-hidden
            className="size-2 rotate-45"
            style={{ background: chartCssVars.foregroundMuted }}
          />
          {marker.title}
        </div>
      ))}
    </div>
  );
}

/** recipes/definitions/custom-indicators.tsx `SpotlightIndicator`. */
function SpotlightIndicator({
  seriesKey,
  color = "var(--chart-1)",
  width = 28,
}: {
  seriesKey: string;
  color?: string;
  width?: number;
}) {
  const { tooltipData, innerHeight } = useChart();
  const id = useId().replace(/:/g, "");
  const x = useSpring(0, { stiffness: 380, damping: 36 });
  const top = useSpring(innerHeight, { stiffness: 380, damping: 36 });
  const opacity = useSpring(0, { stiffness: 300, damping: 30 });
  const height = useTransform(top, (value) => Math.max(0, innerHeight - value));
  const visible = useRef(false);

  const targetX = tooltipData?.x;
  const targetY = tooltipData?.yPositions[seriesKey];

  useEffect(() => {
    if (targetX === undefined || targetY === undefined) {
      visible.current = false;
      opacity.set(0);
      return;
    }
    if (visible.current) {
      x.set(targetX);
      top.set(targetY);
    } else {
      x.jump(targetX);
      top.jump(targetY);
    }
    visible.current = true;
    opacity.set(1);
  }, [targetX, targetY, x, top, opacity]);

  return (
    <g pointerEvents="none">
      <defs>
        <linearGradient id={`${id}-beam`} x1="0" x2="0" y1="0" y2="1">
          <stop offset={0} stopColor={color} stopOpacity={0.32} />
          <stop offset={1} stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <motion.rect
        fill={`url(#${id}-beam)`}
        height={height}
        rx={4}
        style={{ x, y: top, opacity }}
        width={width}
        x={-width / 2}
      />
    </g>
  );
}

/** recipes/definitions/projection-line.tsx */
const recipeProjection = buildProjectionPath({
  sourceData: recipeDailyData,
  seriesKey: "visitors",
  mode: "auto",
  autoMethod: "linearRegression",
  pathDensity: "endpoints",
  horizonPoints: 7,
});

const MONO_FG = "var(--foreground)";
const MONO_MUTED = "var(--muted-foreground)";
const PATTERN_FADE_EDGE = 33;

const usdFormatter = (value: number) => `$${value.toLocaleString("en-US")}`;

const heroCurveVariants: LabVariant[] = HERO_CURVES.map(
  ({ id, label, curve }) => ({
    kind: "single",
    id: `hero-${id}`,
    label: `Hero · ${label}`,
    source: `${EXAMPLES}: Area Chart - Interactive (AreaHeroWithCurveSelect, curve "${label}")`,
    exercises:
      id === "monotone-x"
        ? "Hero default: 4/1, two areas, segment selection layers, monotoneX"
        : `Hero with the ${label} curve on both areas (path interpolation)`,
    height: 200,
    render: () => <AreaHero curve={curve} />,
  })
);

export const AREA_VARIANTS: readonly LabVariant[] = [
  ...heroCurveVariants,
  {
    kind: "single",
    id: "default",
    label: "Default",
    source: `${EXAMPLES}: Area Chart`,
    exercises: "Baseline: one area, gradient fill, Grid, XAxis, tooltip",
    render: () => <DesktopArea />,
  },
  {
    kind: "single",
    id: "value-labels",
    label: "Value labels",
    source: `${EXAMPLES}: Area Chart - Value Labels`,
    exercises:
      "24 months, two series with shared collision-aware labels (max 5)",
    render: () => (
      <AreaChart data={multiSeries24Data} margin={EXAMPLE_MARGIN}>
        <Grid horizontal />
        <Area dataKey="desktop" showValue valueLabelMaxCount={5} />
        <Area
          dataKey="mobile"
          fill="var(--chart-line-secondary)"
          showValue
          valueLabelMaxCount={5}
        />
        <XAxis />
        <ChartTooltip />
      </AreaChart>
    ),
  },
  {
    kind: "single",
    id: "value-labels-options",
    label: "Value labels · options",
    source: "area-chart.mdx: Value labels props table (no example)",
    exercises:
      "valueLabelMinCount, formatter, valueLabelColor, fadeEdges + fadeValueLabels",
    render: () => (
      <AreaChart data={areaData} margin={EXAMPLE_MARGIN}>
        <Grid horizontal />
        <Area
          dataKey="desktop"
          fadeEdges
          fadeValueLabels
          showValue
          valueLabelFormatter={usdFormatter}
          valueLabelMinCount={3}
        />
        <Area
          dataKey="mobile"
          fill="var(--chart-line-secondary)"
          showValue
          valueLabelColor="var(--chart-2)"
          valueLabelFormatter={usdFormatter}
          valueLabelMinCount={3}
        />
        <XAxis />
        <ChartTooltip />
      </AreaChart>
    ),
  },
  {
    kind: "single",
    id: "step",
    label: "Step",
    source: `${EXAMPLES}: Area Chart - Step`,
    exercises: "curveStep on a sparse series",
    render: () => (
      <AreaChart data={areaData} margin={EXAMPLE_MARGIN}>
        <Grid horizontal />
        <Area curve={curveStep} dataKey="desktop" fillOpacity={0.3} />
        <XAxis />
        <ChartTooltip />
      </AreaChart>
    ),
  },
  {
    kind: "single",
    id: "stacked",
    label: "Stacked (layered)",
    source: `${EXAMPLES}: Area Chart - Stacked`,
    exercises: "Two layered areas sharing one y scale",
    render: () => (
      <AreaChart data={areaData} margin={EXAMPLE_MARGIN}>
        <Grid horizontal />
        <Area
          dataKey="desktop"
          fill="var(--chart-line-primary)"
          fillOpacity={0.3}
          strokeWidth={2}
        />
        <Area
          dataKey="mobile"
          fill="var(--chart-line-secondary)"
          fillOpacity={0.3}
          strokeWidth={2}
        />
        <XAxis />
        <ChartTooltip />
      </AreaChart>
    ),
  },
  {
    kind: "single",
    id: "gradient",
    label: "Gradient",
    source: `${EXAMPLES}: Area Chart - Gradient`,
    exercises: "gradientToOpacity, no Grid, no XAxis",
    render: () => (
      <AreaChart data={areaData} margin={EXAMPLE_MARGIN}>
        <Area
          dataKey="desktop"
          fillOpacity={0.5}
          gradientToOpacity={0.05}
          strokeWidth={2}
        />
        <ChartTooltip />
      </AreaChart>
    ),
  },
  {
    kind: "single",
    id: "no-stroke",
    label: "No stroke",
    source: `${EXAMPLES}: Area Chart - No Stroke`,
    exercises: "showLine={false} (fill only)",
    render: () => (
      <AreaChart data={areaData} margin={EXAMPLE_MARGIN}>
        <Area dataKey="desktop" fillOpacity={0.5} showLine={false} />
        <XAxis />
        <ChartTooltip />
      </AreaChart>
    ),
  },
  {
    kind: "single",
    id: "fade-edges",
    label: "Fade edges",
    source: `${EXAMPLES}: Area Chart - Fade Edges`,
    exercises: "fadeEdges on both sides",
    render: () => (
      <AreaChart data={areaData} margin={EXAMPLE_MARGIN}>
        <Grid horizontal />
        <Area dataKey="desktop" fadeEdges fillOpacity={0.3} strokeWidth={2} />
        <XAxis />
        <ChartTooltip />
      </AreaChart>
    ),
  },
  {
    kind: "single",
    id: "fade-left-gradient-span",
    label: "Fade left · gradient span",
    source: "area-chart.mdx: Area props (fadeEdges, gradientSpan)",
    exercises: 'fadeEdges="left" and a compressed gradientSpan={0.5}',
    render: () => (
      <AreaChart data={areaData} margin={EXAMPLE_MARGIN}>
        <Grid horizontal />
        <Area
          dataKey="desktop"
          fadeEdges="left"
          fillOpacity={0.5}
          gradientSpan={0.5}
          strokeWidth={2}
        />
        <XAxis />
        <ChartTooltip />
      </AreaChart>
    ),
  },
  {
    kind: "single",
    id: "animate-false",
    label: "animate={false}",
    source: "area-chart.mdx: Area props (animate)",
    exercises: "No grow animation on the area; chart reveal still runs",
    render: () => (
      <AreaChart data={areaData} margin={EXAMPLE_MARGIN}>
        <Grid horizontal />
        <Area
          animate={false}
          dataKey="desktop"
          fillOpacity={0.3}
          strokeWidth={2}
        />
        <XAxis />
        <ChartTooltip />
      </AreaChart>
    ),
  },
  {
    kind: "single",
    id: "segment-selection",
    label: "Segment selection",
    source: `${EXAMPLES}: Area Chart - Segment Selection`,
    exercises: "Segment layers on the 6-point series (hover only; no drag)",
    render: () => (
      <DesktopArea
        after={
          <>
            <SegmentBackground />
            <SegmentLineFrom />
            <SegmentLineTo />
          </>
        }
      />
    ),
  },
  {
    kind: "single",
    id: "pattern",
    label: "Pattern",
    source: `${EXAMPLES}: Area Chart - Pattern (also docs/area-chart-pattern-demo.tsx)`,
    exercises: "PatternLines + PatternArea under a fillOpacity 0 Area",
    render: () => (
      <AreaChart data={areaData} margin={EXAMPLE_MARGIN}>
        <PatternLines
          height={6}
          id="area-example-pattern"
          orientation={["diagonal"]}
          stroke="var(--chart-1)"
          strokeWidth={1}
          width={6}
        />
        <Grid horizontal />
        <PatternArea dataKey="desktop" fill="url(#area-example-pattern)" />
        <Area dataKey="desktop" fillOpacity={0} strokeWidth={2} />
        <XAxis />
        <ChartTooltip />
      </AreaChart>
    ),
  },
  {
    kind: "single",
    id: "series-markers",
    label: "Series markers",
    source: `${EXAMPLES}: Area Chart - Series Markers`,
    exercises: "showMarkers (default style), XAxis tickMode data, 7 days",
    render: () => (
      <AreaChart
        data={weeklyVisitorsData}
        margin={EXAMPLE_MARGIN}
        xDataKey="date"
      >
        <Grid horizontal />
        <Area
          dataKey="visitors"
          fill="var(--chart-line-primary)"
          fillOpacity={0.35}
          showMarkers
          stroke="var(--chart-line-primary)"
        />
        <XAxis tickMode="data" />
        <ChartTooltip />
      </AreaChart>
    ),
  },
  {
    kind: "single",
    id: "series-markers-custom",
    label: "Series markers · custom",
    source: `${EXAMPLES}: Area Chart - Series Markers (code snippet's markers prop)`,
    exercises: "markers={{ radius: 5, ringGap: 2, strokeWidth: 2 }}",
    render: () => (
      <AreaChart
        data={weeklyVisitorsData}
        margin={EXAMPLE_MARGIN}
        xDataKey="date"
      >
        <Grid horizontal />
        <Area
          dataKey="visitors"
          fill="var(--chart-line-primary)"
          fillOpacity={0.35}
          markers={{ radius: 5, ringGap: 2, strokeWidth: 2 }}
          showMarkers
        />
        <XAxis tickMode="data" />
        <ChartTooltip />
      </AreaChart>
    ),
  },
  {
    kind: "single",
    id: "dashed-tail",
    label: "Dashed tail",
    source: `${EXAMPLES}: Area Chart - Dashed Tail`,
    exercises: "dashFromIndex / dashArray stroke split",
    render: () => (
      <AreaChart
        data={weeklyVisitorsData}
        margin={EXAMPLE_MARGIN}
        xDataKey="date"
      >
        <Grid horizontal />
        <Area
          dashArray="6,4"
          dashFromIndex={weeklyVisitorsDashFromIndex}
          dataKey="visitors"
          fill="var(--chart-line-primary)"
          fillOpacity={0.35}
          stroke="var(--chart-line-primary)"
        />
        <XAxis tickMode="data" />
        <ChartTooltip />
      </AreaChart>
    ),
  },
  {
    kind: "single",
    id: "y-axis-left",
    label: "Left Y axis",
    source: `${EXAMPLES}: Area Chart - Left Y axis`,
    exercises: "YAxis left labels, two areas on one scale",
    render: () => (
      <AreaChart data={areaData} margin={exampleMargin(chartMarginLeftYAxis)}>
        <Grid horizontal />
        <Area dataKey="desktop" fillOpacity={0.3} strokeWidth={2} />
        <Area
          dataKey="mobile"
          fill="var(--chart-2)"
          fillOpacity={0.3}
          strokeWidth={2}
        />
        <YAxis yAxisId="left" />
        <XAxis />
        <ChartTooltip />
      </AreaChart>
    ),
  },
  {
    kind: "single",
    id: "y-axis-biaxial",
    label: "Left + right Y axes",
    source: `${EXAMPLES}: Area Chart - Left and right Y axes`,
    exercises: "Independent left/right y scales (yAxisId per Area)",
    render: () => (
      <AreaChart
        data={areaData}
        margin={exampleMargin(chartMarginBiaxialYAxis)}
      >
        <Grid horizontal />
        <Area
          dataKey="desktop"
          fillOpacity={0.3}
          strokeWidth={2}
          yAxisId="left"
        />
        <Area
          dataKey="mobile"
          fill="var(--chart-2)"
          fillOpacity={0.3}
          strokeWidth={2}
          yAxisId="right"
        />
        <YAxis yAxisId="left" />
        <YAxis orientation="right" yAxisId="right" />
        <XAxis />
        <ChartTooltip />
      </AreaChart>
    ),
  },
  {
    kind: "single",
    id: "y-axis-format",
    label: "Y axis · ticks + format",
    source: "utility/axis/y-axis (YAxis props; no area example)",
    exercises:
      "YAxis numTicks={3} + formatValue, large-number data, Grid numTicksRows",
    render: () => (
      <AreaChart
        data={areaHeroData}
        margin={exampleMargin(chartMarginLeftYAxis)}
      >
        <Grid horizontal numTicksRows={3} />
        <Area dataKey="revenue" fillOpacity={0.3} strokeWidth={2} />
        <YAxis formatValue={usdFormatter} numTicks={3} />
        <XAxis />
        <ChartTooltip />
      </AreaChart>
    ),
  },
  {
    kind: "single",
    id: "grid-vertical",
    label: "Grid · vertical + highlight",
    source: "area-chart.mdx: Grid props (vertical, numTicksColumns, …)",
    exercises:
      "Grid vertical + horizontal, fadeVertical, highlightRowValues, XAxis tickMode domain",
    render: () => (
      <AreaChart data={areaData} margin={EXAMPLE_MARGIN}>
        <Grid
          fadeVertical
          highlightRowValues={[200]}
          horizontal
          numTicksColumns={6}
          vertical
        />
        <Area dataKey="desktop" fillOpacity={0.3} strokeWidth={2} />
        <XAxis tickMode="domain" />
        <ChartTooltip />
      </AreaChart>
    ),
  },
  {
    kind: "single",
    id: "tooltip-options",
    label: "Tooltip options",
    source: "area-chart.mdx: ChartTooltip props",
    exercises:
      "No date pill, point-ended dashed crosshair in a custom color, matchCrosshair",
    render: () => (
      <AreaChart data={areaData} margin={EXAMPLE_MARGIN}>
        <Grid horizontal />
        <Area dataKey="desktop" fillOpacity={0.3} strokeWidth={2} />
        <XAxis />
        <ChartTooltip
          indicatorColor="var(--chart-2)"
          indicatorDasharray="4,4"
          indicatorEnd="point"
          matchCrosshair
          showDatePill={false}
        />
      </AreaChart>
    ),
  },
  {
    kind: "single",
    id: "background-pattern",
    label: "Pattern background",
    source: `${EXAMPLES}: Area Chart - Pattern Background`,
    exercises: "Background (diagonal) instead of Grid",
    render: () => <DesktopArea before={<Background />} grid={false} />,
  },
  {
    kind: "single",
    id: "background-dots",
    label: "Dot grid background",
    source: `${EXAMPLES}: Area Chart - Dot Grid Background`,
    exercises: "Background dots with edge fade",
    render: () => (
      <DesktopArea
        before={<Background opacity={0.85} pattern="dots" />}
        grid={false}
      />
    ),
  },
  {
    kind: "single",
    id: "reference-band",
    label: "Reference band",
    source: `${EXAMPLES}: Area Chart - Reference Band`,
    exercises: "ReferenceArea y1/y2 with dashed edges + markers",
    render: () => (
      <DesktopArea
        before={
          <ReferenceArea showMarkers strokeStyle="dashed" y1={160} y2={220} />
        }
        grid={false}
      />
    ),
  },
  {
    kind: "single",
    id: "reference-band-pattern",
    label: "Pattern reference band",
    source: `${EXAMPLES}: Area Chart - Pattern Reference Band`,
    exercises: "ReferenceArea pattern fill + colored y tick labels",
    render: () => (
      <DesktopArea
        before={
          <ReferenceArea
            axisLabelColor="var(--chart-1)"
            fillOpacity={0.85}
            pattern="diagonal"
            patternColor="var(--chart-foreground-muted)"
            y1={160}
            y2={220}
          />
        }
        grid={false}
      />
    ),
  },
  {
    kind: "single",
    id: "trend-line",
    label: "Trend line",
    source: `${EXAMPLES}: Area Chart - Trend Line`,
    exercises: "Dashed least-squares TrendLine over the area",
    render: () => (
      <DesktopArea
        after={<TrendLine dataKey="desktop" stroke="var(--chart-1)" />}
      />
    ),
  },
  {
    kind: "single",
    id: "trend-line-gradient",
    label: "Gradient trend line",
    source: `${EXAMPLES}: Area Chart - Gradient Trend Line (also ${RECIPES}/trend-line.tsx TrendOnArea)`,
    exercises: "Gradient TrendLine stroke with faded ends",
    render: () => (
      <DesktopArea
        after={
          <TrendLine
            dataKey="desktop"
            fadeEdges
            gradientEnd="var(--chart-1)"
            gradientStart="var(--chart-3)"
            strokeStyle="gradient"
            strokeWidth={2.5}
          />
        }
      />
    ),
  },
  {
    kind: "single",
    id: "trend-line-docs",
    label: "Trend line (docs)",
    source: "docs/trend-line-demo.tsx: TrendLineAreaDemo",
    exercises: "Solid faded TrendLine, default 40px margins, UTC dates",
    render: () => (
      <AreaChart data={trendLineAreaData}>
        <Grid horizontal />
        <Area dataKey="desktop" fillOpacity={0.3} strokeWidth={2} />
        <TrendLine dataKey="desktop" fadeEdges stroke="var(--chart-1)" />
        <XAxis />
        <ChartTooltip />
      </AreaChart>
    ),
  },
  {
    kind: "single",
    id: "docs-preview",
    label: "Docs preview",
    source: "area-chart.mdx: ComponentPreview (+ docs/area-tooltip-demo.tsx)",
    exercises:
      "Default margins, two fadeEdges areas, custom tooltip rows, 30 days",
    render: () => (
      <AreaChart data={docsRevenueData}>
        <Grid horizontal />
        <Area
          dataKey="revenue"
          fadeEdges
          fill="var(--chart-line-primary)"
          fillOpacity={0.3}
        />
        <Area
          dataKey="costs"
          fadeEdges
          fill="var(--chart-line-secondary)"
          fillOpacity={0.3}
        />
        <XAxis />
        <AreaTooltipDemo />
      </AreaChart>
    ),
  },
  {
    kind: "single",
    id: "brush",
    label: "Brush zoom",
    source:
      "docs/area-chart-brush-demo.tsx: AreaChartBrushDemo (area-chart.mdx, utility/brush.mdx)",
    exercises:
      "ChartBrushLayout: main chart on xDomain + strip with ChartBrush (animate off)",
    height: 380,
    render: () => <AreaBrush />,
  },
  {
    kind: "single",
    id: "loading-to-ready-pulse",
    label: "Loading → ready (pulse)",
    source:
      "docs/area-chart-y-domain-demo.tsx: AreaChartYDomainDemo (Ready after 1.5 s)",
    exercises:
      "status loading→ready: pulse exit, label exit, y-domain tween, clip reveal",
    render: () => <AreaLoadingToReady loadingStyle="pulse" />,
  },
  {
    kind: "single",
    id: "loading-to-ready-sweep",
    label: "Loading → ready (sweep)",
    source:
      "docs/area-chart-y-domain-demo.tsx: AreaChartYDomainDemo (Sweep, Ready after 1.5 s)",
    exercises: "Same transition from the sweep loading style",
    render: () => <AreaLoadingToReady loadingStyle="sweep" />,
  },
  {
    kind: "single",
    id: "loading",
    label: "Loading (pulse)",
    source: `${EXAMPLES}: Area Chart - Loading`,
    exercises: "AreaChartLoading: grid shimmer + pulse + shimmer label",
    hover: false,
    previewOnly:
      "Loops forever (status stays loading); the settled transition is covered by loading-to-ready-pulse",
    render: () => (
      <AreaChartLoading
        gridShimmerSync
        label="Loading"
        margin={EXAMPLE_MARGIN}
        stroke="var(--foreground)"
        strokeOpacity={0.5}
      />
    ),
  },
  {
    kind: "single",
    id: "loading-sweep",
    label: "Loading (sweep)",
    source: `${EXAMPLES}: Area Chart - Loading (Sweep)`,
    exercises: 'AreaChartLoading loadingStyle="sweep"',
    hover: false,
    previewOnly:
      "Loops forever (status stays loading); the settled transition is covered by loading-to-ready-sweep",
    render: () => (
      <AreaChartLoading loadingStyle="sweep" margin={EXAMPLE_MARGIN} />
    ),
  },
  {
    kind: "single",
    id: "date-highlights",
    label: "Weekends + deadline",
    source:
      "docs/date-highlights-demo.tsx: DateHighlightsAreaDemo (area-chart.mdx, utility/deadline.mdx)",
    exercises: "Weekends + gradient Deadline underlay, Catmull–Rom α 0.5",
    render: () => (
      <AreaChart data={projectProgressData}>
        <Grid horizontal />
        <Weekends />
        <Deadline date={PROJECT_DUE_DATE} fillType="gradient" />
        <Area
          curve={curveCatmullRom.alpha(0.5)}
          dataKey="completed"
          fill="var(--chart-1)"
          stroke="var(--chart-1)"
        />
        <XAxis />
        <ChartTooltip />
      </AreaChart>
    ),
  },
  {
    kind: "single",
    id: "home",
    label: "Home showcase",
    source:
      "home-area-chart.tsx: HomeShowcaseAreaChart (desktop margin, aspect 5/2)",
    exercises:
      "Dots Background with fades, curveNatural fadeEdges areas, tooltip panelStyle, no axes",
    render: () => (
      <AreaChart
        aspectRatio="5 / 2"
        className="min-h-[180px] w-full"
        data={areaHeroData}
        margin={{ top: 40, right: 40, bottom: 20, left: 40 }}
      >
        <Background
          fadeHorizontalLength={30}
          fadeVerticalLength={30}
          pattern="dots"
          radius={0.5}
        />
        <Area
          curve={curveNatural}
          dataKey="revenue"
          fadeEdges
          fill="var(--chart-line-primary)"
          fillOpacity={0.1}
          strokeWidth={2}
        />
        <Area
          curve={curveNatural}
          dataKey="costs"
          fadeEdges
          fill="var(--chart-line-secondary)"
          fillOpacity={0.1}
          strokeWidth={1.5}
        />
        <ChartTooltip panelStyle={homeTooltipPanelStyle} />
      </AreaChart>
    ),
  },
  {
    kind: "single",
    id: "recipe-gradient-glow",
    label: "Recipe · gradient glow",
    source: `${RECIPES}/gradient-glow.tsx: GlowArea`,
    exercises: "No grid, fillOpacity 0.6 → 0, fadeEdges, 28 days",
    render: () => (
      <AreaChart data={recipeDailyData}>
        <Area
          dataKey="visitors"
          fadeEdges
          fill="var(--chart-1)"
          fillOpacity={0.6}
          gradientToOpacity={0}
          strokeWidth={2}
        />
        <XAxis />
        <ChartTooltip />
      </AreaChart>
    ),
  },
  {
    kind: "single",
    id: "recipe-monochrome",
    label: "Recipe · monochrome",
    source: `${RECIPES}/monochrome.tsx: MonoArea`,
    exercises: 'Grid strokeDasharray "1,4", two foreground-colored areas',
    render: () => (
      <AreaChart data={recipeDailyData}>
        <Grid horizontal strokeDasharray="1,4" />
        <Area
          dataKey="previous"
          fill={MONO_MUTED}
          fillOpacity={0.15}
          strokeWidth={1.5}
        />
        <Area dataKey="visitors" fill={MONO_FG} fillOpacity={0.12} />
        <XAxis />
        <ChartTooltip />
      </AreaChart>
    ),
  },
  {
    kind: "single",
    id: "recipe-dot-matrix",
    label: "Recipe · dot matrix",
    source: `${RECIPES}/dot-matrix.tsx: DotMatrixArea`,
    exercises: "Dots Background with vertical + horizontal fade, markers",
    render: () => (
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
    ),
  },
  {
    kind: "single",
    id: "recipe-hatched-backdrop",
    label: "Recipe · hatched backdrop",
    source: `${RECIPES}/hatched-backdrop.tsx: HatchedArea`,
    exercises: "Diagonal Background with vertical fade",
    render: () => (
      <AreaChart data={recipeDailyData}>
        <Background fadeVerticalLength={PATTERN_FADE_EDGE} pattern="diagonal" />
        <Area dataKey="visitors" fillOpacity={0.25} />
        <XAxis />
        <ChartTooltip />
      </AreaChart>
    ),
  },
  {
    kind: "single",
    id: "recipe-range-band",
    label: "Recipe · range band",
    source: `${RECIPES}/range-band.tsx: BandArea`,
    exercises:
      "Band (gradient, faded edges, dashed bounds, label) under an area",
    render: () => (
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
    ),
  },
  {
    kind: "single",
    id: "recipe-value-labels",
    label: "Recipe · value labels",
    source: `${RECIPES}/value-labels.tsx: LabelsArea`,
    exercises: "Single-series value labels (max 6), default margins",
    render: () => (
      <AreaChart data={recipeWeeklyData}>
        <Grid horizontal strokeDasharray="1,4" />
        <Area
          dataKey="visitors"
          fillOpacity={0.2}
          showValue
          strokeWidth={2}
          valueLabelMaxCount={6}
        />
        <XAxis />
        <ChartTooltip />
      </AreaChart>
    ),
  },
  {
    kind: "single",
    id: "recipe-weekend-stripes",
    label: "Recipe · weekend stripes",
    source: `${RECIPES}/weekend-stripes.tsx: WeekendArea`,
    exercises: "Weekends inside a VerticalFade mask (useChartStable layer)",
    render: () => (
      <AreaChart data={recipeDailyData}>
        <VerticalFade>
          <Weekends />
        </VerticalFade>
        <Area dataKey="visitors" fillOpacity={0.3} />
        <XAxis />
        <ChartTooltip />
      </AreaChart>
    ),
  },
  {
    kind: "single",
    id: "recipe-projection-line",
    label: "Recipe · projection line",
    source: `${RECIPES}/projection-line.tsx: ForecastArea`,
    exercises:
      "LineSeriesTerminalMarker + gradient bezier ProjectionLine with end marker",
    render: () => (
      <AreaChart data={recipeDailyData}>
        <Grid horizontal />
        <Area
          dataKey="visitors"
          fill="var(--chart-1)"
          fillOpacity={0.25}
          strokeWidth={2}
        />
        <LineSeriesTerminalMarker
          dataKey="visitors"
          ringGap={6}
          stroke="var(--chart-1)"
        />
        <ProjectionLine
          curveKind="bezier"
          data={recipeProjection}
          gradientEnd="var(--chart-3)"
          gradientStart="var(--chart-1)"
          showEndMarker
          stroke="var(--chart-1)"
          strokeDasharray="1,4"
          strokeStyle="gradient"
        />
        <XAxis />
        <ChartTooltip />
      </AreaChart>
    ),
  },
  {
    kind: "single",
    id: "recipe-event-markers",
    label: "Recipe · event markers",
    source: `${RECIPES}/event-markers.tsx: MarkersArea`,
    exercises: "ChartMarkers (shared-date fan-out) + marker tooltip content",
    render: () => (
      <AreaChart data={recipeDailyData}>
        <Grid horizontal />
        <Area dataKey="visitors" fillOpacity={0.25} strokeWidth={2} />
        <ChartMarkers items={eventMarkers} />
        <XAxis />
        <ChartTooltip>
          <ActiveMarkers items={eventMarkers} />
        </ChartTooltip>
      </AreaChart>
    ),
  },
  {
    kind: "single",
    id: "recipe-diamond-markers",
    label: "Recipe · diamond markers",
    source: `${RECIPES}/diamond-markers.tsx: DiamondArea (also docs/markers-demo.tsx DiamondMarkersDemo)`,
    exercises:
      "Custom post-overlay layer reading xScale / tooltipData from useChart",
    render: () => (
      <AreaChart data={recipeDailyData}>
        <Grid horizontal />
        <Area
          dataKey="visitors"
          fill="var(--chart-line-primary)"
          fillOpacity={0.15}
          strokeWidth={2}
        />
        <DiamondMarkers items={recipeDiamondMarkers} />
        <XAxis />
        <ChartTooltip>
          <DiamondTooltipContent items={recipeDiamondMarkers} />
        </ChartTooltip>
      </AreaChart>
    ),
  },
  {
    kind: "single",
    id: "recipe-spotlight",
    label: "Recipe · spotlight indicator",
    source: `${RECIPES}/custom-indicators.tsx: SpotlightArea`,
    exercises:
      "Custom spring indicator from tooltipData.x / yPositions, no crosshair",
    render: () => (
      <AreaChart data={recipeDailyData}>
        <Grid horizontal />
        <SpotlightIndicator seriesKey="visitors" />
        <Area dataKey="visitors" fillOpacity={0.25} strokeWidth={2} />
        <XAxis />
        <ChartTooltip showCrosshair={false} />
      </AreaChart>
    ),
  },
];
