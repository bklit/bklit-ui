"use client";

import {
  Background,
  Band,
  type BandFillType,
  buildProjectionPath,
  ChartBrushLayout,
  ChartLegend,
  ChartLegendHoverProvider,
  type ChartMarker,
  ChartMarkers,
  ChartTooltip,
  chartCssVars,
  Deadline,
  Grid,
  Legend,
  LegendItemComponent,
  LegendLabel,
  LegendMarker,
  Line,
  LineBackdrop,
  type LineBackdropStop,
  LineChart,
  LineChartLoading,
  type LineHighlight,
  LineSeriesTerminalMarker,
  MarkerTooltipContent,
  ProjectionLine,
  ReferenceArea,
  SegmentBackground,
  SegmentLineFrom,
  SegmentLineTo,
  TrendLine,
  useActiveMarkers,
  useChart,
  useChartStable,
  Weekends,
  withBollingerBands,
  XAxis,
  YAxis,
} from "@bklitui/ui/charts";
import {
  curveBasis,
  curveCatmullRom,
  curveLinear,
  curveMonotoneX,
  curveStep,
} from "d3-shape";
import { motion, useSpring, useTransform } from "motion/react";
import {
  type ReactNode,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  buildLineChartDemoData,
  REFERENCE_AREA_DEMO,
} from "@/components/docs/line-chart-demo-data";
import { brushScript, ProbedChartBrush } from "./interaction-scripts";
import {
  axisDemoData,
  bandPriceData,
  bandRangeData,
  brushData,
  chartMarginBiaxialYAxis,
  chartMarginLeftYAxis,
  type DateRangeDataset,
  dateRangeFullData,
  EXAMPLE_MARGIN,
  glowData,
  HeldDrag,
  LONG_RANGE_DUE_DATE,
  lineChartDocsData,
  lineChartDocsMarkers,
  lineData,
  lineMarkers,
  longRangeData,
  markersDemoData,
  multiLineData,
  PATTERN_FADE_EDGE,
  PROJECT_DUE_DATE,
  projectProgressData,
  recipeDailyData,
  recipeDiamondMarkers,
  recipeEventMarkers,
  recipeRangeData,
  recipeWeeklyData,
  richMarkers,
  segmentDemoData,
  sparseValueData,
  teamData,
  temperatureData,
  tooltipDemoData,
  trioData,
  useScriptedState,
  weeklyVisitorsDashFromIndex,
  weeklyVisitorsData,
  yDomainReadyData,
} from "./line-data";
import type { LabVariant } from "./types";

const EXAMPLES = "chart-examples.tsx";
const DOCS = "components/docs";
const RECIPES = "components/recipes/definitions";

// ---------------------------------------------------------------------------
// Shared pieces (copied from the sources)
// ---------------------------------------------------------------------------

/** chart-examples `LineExampleChart`: LineChart + the example margin. */
function ExampleLineChart({
  margin,
  ...props
}: React.ComponentProps<typeof LineChart>) {
  return <LineChart {...props} margin={{ ...EXAMPLE_MARGIN, ...margin }} />;
}

function Full({ children }: { children: ReactNode }) {
  return <div className="w-full">{children}</div>;
}

function MarkerContent({ markers }: { markers: ChartMarker[] }) {
  const activeMarkers = useActiveMarkers(markers);
  if (activeMarkers.length === 0) {
    return null;
  }
  return <MarkerTooltipContent markers={activeMarkers} />;
}

const lineDemoData = buildLineChartDemoData();

// Projection (docs/projection-line-demo.tsx)
const targetProjectionPath = buildProjectionPath({
  sourceData: lineDemoData,
  seriesKey: "value",
  mode: "target",
  pathDensity: "endpoints",
  horizonPoints: 6,
  endValue: 301,
});

const autoProjectionPath = buildProjectionPath({
  sourceData: lineDemoData,
  seriesKey: "value",
  mode: "auto",
  autoMethod: "lastSegment",
  pathDensity: "endpoints",
  horizonPoints: 6,
});

/** Props-table coverage: stepped linear-regression path, solid linear stroke. */
const steppedProjectionPath = buildProjectionPath({
  sourceData: lineDemoData,
  seriesKey: "value",
  mode: "auto",
  autoMethod: "linearRegression",
  pathDensity: "stepped",
  horizonPoints: 4,
});

const recipeProjection = buildProjectionPath({
  sourceData: recipeDailyData,
  seriesKey: "visitors",
  mode: "auto",
  autoMethod: "linearRegression",
  pathDensity: "endpoints",
  horizonPoints: 7,
});

const bollingerData = withBollingerBands(bandPriceData, {
  dataKey: "price",
  period: 10,
  multiplier: 2,
});

const smooth = curveCatmullRom.alpha(0.5);

// ---------------------------------------------------------------------------
// Stateful examples (fixed states / scripted timers instead of controls)
// ---------------------------------------------------------------------------

const TRIO_STROKES = {
  desktop: "var(--chart-1)",
  mobile: "var(--chart-2)",
  tablet: "var(--chart-3)",
} as const;

const TRIO_KEYS = ["desktop", "mobile", "tablet"] as const;

/** Brush strip margins (the interaction scripts aim inside the plot). */
const TRIO_STRIP_MARGIN = { top: 4, right: 8, bottom: 4, left: 8 };
const DOCS_STRIP_MARGIN = { top: 4, right: 40, bottom: 4, left: 40 };

/** components/charts/line-chart-studio-trio-demo.tsx (hero, height 540). */
function TrioWithBrush({ height }: { height: number }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const legendItems = useMemo(() => {
    const last = trioData.at(-1);
    if (!last) {
      return [];
    }
    return TRIO_KEYS.map((key) => ({
      label: key,
      value: last[key],
      color: TRIO_STROKES[key],
    }));
  }, []);

  return (
    <ChartLegendHoverProvider
      hoveredIndex={hoveredIndex}
      onHoverChange={setHoveredIndex}
    >
      <div className="flex w-full flex-col gap-2" style={{ height }}>
        <div className="flex justify-end px-2">
          <ChartLegend
            className="w-full flex-row flex-wrap gap-x-4 gap-y-2"
            hoveredIndex={hoveredIndex}
            itemClassName="w-auto shrink-0"
            items={legendItems}
            labelClassName="font-medium text-xs tabular-nums"
            onHover={setHoveredIndex}
            showValue={false}
          />
        </div>
        <ChartBrushLayout
          brushStrip={(brushLayout) => (
            <LineChart
              animationDuration={0}
              className="size-full"
              data={trioData}
              margin={TRIO_STRIP_MARGIN}
              status="ready"
              style={{ aspectRatio: "unset", height: "100%" }}
            >
              {TRIO_KEYS.map((key) => (
                <Line
                  animate={false}
                  curve={curveCatmullRom}
                  dataKey={key}
                  fadeEdges
                  key={`brush-${key}`}
                  showHighlight={false}
                  stroke={TRIO_STROKES[key]}
                  strokeWidth={2}
                />
              ))}
              <ProbedChartBrush
                initialSelection={brushLayout.brushSelection ?? undefined}
                onSelectionChange={brushLayout.onBrushSelectionChange}
              />
            </LineChart>
          )}
          data={trioData}
          enabled
          height={72}
        >
          {(brushLayout) => (
            <LineChart
              className="size-full"
              data={trioData}
              margin={{ top: 8, right: 8, bottom: 40, left: 8 }}
              style={{ aspectRatio: "unset", height: "100%" }}
              tweenYDomainOnXDomainChange
              xDomain={brushLayout.xDomain}
              xDomainSlotCount={brushLayout.xDomainSlotCount}
              yDomainTween
            >
              <Background opacity={0.85} pattern="dots" />
              {TRIO_KEYS.map((key) => (
                <Line
                  curve={curveCatmullRom}
                  dataKey={key}
                  fadeEdges
                  key={key}
                  showHighlight
                  stroke={TRIO_STROKES[key]}
                  strokeWidth={2}
                />
              ))}
              <XAxis />
              <ChartTooltip />
            </LineChart>
          )}
        </ChartBrushLayout>
      </div>
    </ChartLegendHoverProvider>
  );
}

/** docs/line-chart-brush-demo.tsx */
function BrushDemo() {
  return (
    <div className="w-full" style={{ height: 360 }}>
      <ChartBrushLayout
        brushStrip={(brushLayout) => (
          <LineChart
            animationDuration={0}
            className="size-full"
            data={brushData}
            margin={DOCS_STRIP_MARGIN}
            status="ready"
            style={{ aspectRatio: "unset", height: "100%" }}
          >
            <Line
              animate={false}
              dataKey="value"
              fadeEdges
              showHighlight={false}
              stroke="var(--chart-line-primary)"
              strokeWidth={2}
            />
            <ProbedChartBrush
              initialSelection={brushLayout.brushSelection ?? undefined}
              onSelectionChange={brushLayout.onBrushSelectionChange}
              selectionPattern={{ color: "var(--chart-1)", preset: "diagonal" }}
            />
          </LineChart>
        )}
        data={brushData}
        enabled
        height={72}
      >
        {(brushLayout) => (
          <LineChart
            className="size-full"
            data={brushData}
            style={{ aspectRatio: "unset", height: "100%" }}
            tweenYDomainOnXDomainChange
            xDomain={brushLayout.xDomain}
            xDomainSlotCount={brushLayout.xDomainSlotCount}
            yDomainTween
          >
            <Grid horizontal stroke="var(--chart-grid)" />
            <Line
              dataKey="value"
              fadeEdges
              stroke="var(--chart-line-primary)"
              strokeWidth={2}
            />
            <XAxis />
            <ChartTooltip />
          </LineChart>
        )}
      </ChartBrushLayout>
    </div>
  );
}

/** docs/date-highlights-demo.tsx `DateHighlightsBrushDemo` */
function DateHighlightsBrush() {
  return (
    <div className="w-full" style={{ height: 360 }}>
      <ChartBrushLayout
        brushStrip={(brushLayout) => (
          <LineChart
            animationDuration={0}
            className="size-full"
            data={longRangeData}
            margin={DOCS_STRIP_MARGIN}
            status="ready"
            style={{ aspectRatio: "unset", height: "100%" }}
          >
            <Deadline date={LONG_RANGE_DUE_DATE} />
            <Line
              animate={false}
              dataKey="value"
              showHighlight={false}
              stroke="var(--chart-line-primary)"
              strokeWidth={2}
            />
            <ProbedChartBrush
              initialSelection={brushLayout.brushSelection ?? undefined}
              onSelectionChange={brushLayout.onBrushSelectionChange}
            />
          </LineChart>
        )}
        data={longRangeData}
        enabled
        height={72}
      >
        {(brushLayout) => (
          <LineChart
            className="size-full"
            data={longRangeData}
            style={{ aspectRatio: "unset", height: "100%" }}
            tweenYDomainOnXDomainChange
            xDomain={brushLayout.xDomain}
            xDomainSlotCount={brushLayout.xDomainSlotCount}
            yDomainTween
          >
            <Grid horizontal />
            <Weekends />
            <Deadline date={LONG_RANGE_DUE_DATE} label="Launch" />
            <Line
              dataKey="value"
              stroke="var(--chart-line-primary)"
              strokeWidth={2}
            />
            <XAxis />
            <ChartTooltip />
          </LineChart>
        )}
      </ChartBrushLayout>
    </div>
  );
}

type ChartStatus = "loading" | "ready";

/**
 * docs/line-chart-y-domain-demo.tsx: the Loading / Ready buttons become a
 * fixed script (`status` steps), the Pulse / Sweep toggle a prop.
 */
function YDomainStatusDemo({
  loadingStyle,
  script,
}: {
  loadingStyle: "pulse" | "sweep";
  script: {
    initial: ChartStatus;
    steps: readonly (readonly [number, ChartStatus])[];
  };
}) {
  const status = useScriptedState<ChartStatus>(script.initial, script.steps);
  return (
    <div className="w-full">
      <LineChart
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
        <Line
          dataKey="value"
          fadeEdges
          loadingStroke="var(--foreground)"
          loadingStrokeOpacity={0.5}
          loadingStyle={loadingStyle}
          showHighlight
          stroke="var(--chart-line-primary)"
        />
      </LineChart>
    </div>
  );
}

/** Flips loading → ready while the loading loop is still running. */
const LOADING_TO_READY = {
  initial: "loading",
  steps: [[1200, "ready"]],
} as const;

/** Ready → loading mid-enter, then back to ready while the pulse loops. */
const READY_LOADING_READY = {
  initial: "ready",
  steps: [
    [600, "loading"],
    [2400, "ready"],
  ],
} as const;

type DateRange = "7d" | "30d" | "90d";

/**
 * docs/line-chart-date-range-demo.tsx: the range / dataset / Y-axis controls
 * become a script that changes them while the enter is still running, so the
 * data morph and y-domain tween are recorded.
 */
function DateRangeDemo({
  steps,
  showYAxis,
}: {
  steps: readonly (readonly [
    number,
    { range: DateRange; dataset: DateRangeDataset },
  ])[];
  showYAxis: boolean;
}) {
  const state = useScriptedState<{
    range: DateRange;
    dataset: DateRangeDataset;
  }>({ range: "30d", dataset: "revenue" }, steps);
  const filteredData = useMemo(() => {
    const daysMap = { "7d": 7, "30d": 30, "90d": 90 };
    return dateRangeFullData.slice(-daysMap[state.range]);
  }, [state.range]);

  return (
    <div className="relative w-full">
      <LineChart data={filteredData} yDomainTween>
        <Grid horizontal />
        <Line dataKey={state.dataset} stroke="var(--chart-line-primary)" />
        <XAxis />
        {showYAxis ? <YAxis orientation="left" /> : null}
        <ChartTooltip />
      </LineChart>
    </div>
  );
}

const RANGE_MORPH_STEPS = [[700, { range: "7d", dataset: "revenue" }]] as const;
const DATASET_MORPH_STEPS = [[700, { range: "30d", dataset: "low" }]] as const;

// docs/segment-demo.tsx — stats header driven by the selection
interface SegmentStats {
  value: number;
  change: number;
  changePct: number;
  startDate: Date;
  endDate: Date;
}

function SegmentBridge({
  onSegmentChange,
}: {
  onSegmentChange: (stats: SegmentStats | null) => void;
}) {
  const { selection, data, xAccessor } = useChart();

  useEffect(() => {
    if (!selection?.active) {
      onSegmentChange(null);
      return;
    }
    const startIdx = Math.max(0, selection.startIndex);
    const endIdx = Math.min(data.length - 1, selection.endIndex);
    if (startIdx >= endIdx) {
      onSegmentChange(null);
      return;
    }
    const startPoint = data[startIdx];
    const endPoint = data[endIdx];
    if (!(startPoint && endPoint)) {
      onSegmentChange(null);
      return;
    }
    const startVal = startPoint.users;
    const endVal = endPoint.users;
    if (typeof startVal !== "number" || typeof endVal !== "number") {
      onSegmentChange(null);
      return;
    }
    onSegmentChange({
      value: endVal,
      change: endVal - startVal,
      changePct: startVal === 0 ? 0 : ((endVal - startVal) / startVal) * 100,
      startDate: xAccessor(startPoint),
      endDate: xAccessor(endPoint),
    });
  }, [selection, data, xAccessor, onSegmentChange]);

  return null;
}

function SegmentDocsDemo() {
  const [stats, setStats] = useState<SegmentStats | null>(null);
  const firstVal = segmentDemoData[0]?.users ?? 0;
  const lastVal = segmentDemoData.at(-1)?.users ?? 0;
  const displayValue = stats?.value ?? lastVal;
  const displayChange = stats?.change ?? lastVal - firstVal;
  const displayPct =
    stats?.changePct ??
    (firstVal > 0 ? ((lastVal - firstVal) / firstVal) * 100 : 0);
  const isPositive = displayChange >= 0;
  const startLabel = (
    stats?.startDate ?? segmentDemoData[0]?.date
  )?.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const endLabel = (
    stats?.endDate ?? segmentDemoData.at(-1)?.date
  )?.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  return (
    <div className="w-full">
      <div className="mb-4 space-y-1">
        <div className="flex items-baseline gap-2">
          <span className="font-semibold text-2xl tabular-nums">
            {displayValue.toLocaleString()}
          </span>
          <span className="text-muted-foreground text-sm">users</span>
        </div>
        <div className="flex items-baseline gap-2 text-sm">
          <span
            className={
              isPositive ? "text-chart-positive" : "text-chart-negative"
            }
          >
            {isPositive ? "+" : ""}
            {displayChange.toLocaleString()} ({isPositive ? "+" : ""}
            {displayPct.toFixed(1)}%)
          </span>
          <span className="text-muted-foreground">
            {startLabel} &ndash; {endLabel}
          </span>
        </div>
      </div>
      <LineChart data={segmentDemoData}>
        <Grid horizontal />
        <Line dataKey="users" stroke="var(--chart-line-primary)" />
        <SegmentBackground />
        <SegmentLineFrom />
        <SegmentLineTo />
        <XAxis />
        <ChartTooltip />
        <SegmentBridge onSegmentChange={setStats} />
      </LineChart>
    </div>
  );
}

// docs/line-chart-glow-demo.tsx
const SKY_STOPS: LineBackdropStop[] = [
  { offset: 0, color: "var(--sunset-horizon)", opacity: 1 },
  { offset: 0.22, color: "var(--sunset-horizon)", opacity: 0.85 },
  { offset: 0.45, color: "var(--sunset-warm)", opacity: 0.7 },
  { offset: 0.7, color: "var(--sunset-dusk)", opacity: 0.45 },
  { offset: 1, color: "var(--sunset-dusk)", opacity: 0 },
];

const SUN_STOPS: LineBackdropStop[] = [
  { offset: 0, color: "var(--sunset-sun)", opacity: 0.6 },
  { offset: 1, color: "var(--sunset-sun)", opacity: 0 },
];

const GLOW_HIGHLIGHT: LineHighlight = {
  dimOpacity: 0.25,
  fadeLength: 40,
  glow: { blur: 6, opacity: 1 },
  span: 3,
  strokeWidth: 2.5,
};

const GLOW_STARS = [
  { left: "38%", top: "13%" },
  { left: "77%", top: "4%" },
  { left: "92%", top: "26%" },
  { left: "14%", top: "22%" },
];

const glowDayFmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

function GlowTooltipContent({
  point,
  index,
}: {
  point: Record<string, unknown>;
  index: number;
}) {
  const value = point.sessions as number;
  const lastWeek = glowData[index - 7]?.sessions;
  const change =
    lastWeek === undefined ? null : ((value - lastWeek) / lastWeek) * 100;
  const isNormal = change === null || Math.abs(change) < 15;
  return (
    <div className="w-64 space-y-2 px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <span className="font-semibold text-sm">
          {glowDayFmt.format(point.date as Date)}
        </span>
        <span
          className={
            isNormal
              ? "flex items-center gap-1.5 text-emerald-600 text-xs dark:text-emerald-400"
              : "flex items-center gap-1.5 text-amber-600 text-xs dark:text-amber-400"
          }
        >
          <span aria-hidden className="size-2 bg-current" />
          {isNormal ? "Normal" : "Unusual"}
        </span>
      </div>
      <p className="text-muted-foreground text-xs leading-relaxed">
        {value.toFixed(1)}k sessions
        {change === null
          ? "."
          : ` — ${change >= 0 ? "up" : "down"} ${Math.abs(change).toFixed(0)}% on last week.`}
      </p>
    </div>
  );
}

function GlowDemo() {
  return (
    <div
      className={[
        "relative w-full overflow-hidden rounded-xl bg-(--sunset-bg)",
        "[--sunset-bg:#faf7f2] dark:[--sunset-bg:#19181d]",
        "[--sunset-horizon:#f6a560] dark:[--sunset-horizon:#b4703c]",
        "[--sunset-warm:#f3b48a] dark:[--sunset-warm:#7a4650]",
        "[--sunset-dusk:#c9b2e6] dark:[--sunset-dusk:#3e2a48]",
        "[--sunset-sun:#f2cf6b] dark:[--sunset-sun:#8a6a2a]",
        "[--sunset-line-start:#e2572a] dark:[--sunset-line-start:#d9622b]",
        "[--sunset-line-mid:#ec8f2f] dark:[--sunset-line-mid:#f0b25a]",
        "[--sunset-line-end:#d9a21f] dark:[--sunset-line-end:#f7dc9a]",
        "[--sunset-dot:#e8742a] dark:[--sunset-dot:#fff1d0]",
      ].join(" ")}
    >
      <LineChart
        aspectRatio="7 / 5"
        data={glowData}
        margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
        yScaleDomainMax={105}
      >
        <LineBackdrop
          center={{ x: 0.45, y: 0.82 }}
          dataKey="sessions"
          radius={{ x: 0.95, y: 0.6 }}
          stops={SKY_STOPS}
        />
        <LineBackdrop
          center={{ x: 0.88, y: 0.85 }}
          dataKey="sessions"
          radius={{ x: 0.35, y: 0.22 }}
          stops={SUN_STOPS}
        />
        <LineBackdrop dataKey="sessions">
          {GLOW_STARS.map((star) => (
            <rect
              className="hidden fill-white/30 dark:block"
              height={3}
              key={`${star.left}-${star.top}`}
              width={3}
              x={star.left}
              y={star.top}
            />
          ))}
        </LineBackdrop>
        <Line
          dataKey="sessions"
          fadeEdges={false}
          glow={{ blur: 5, opacity: 0.85 }}
          highlight={GLOW_HIGHLIGHT}
          stroke="var(--sunset-line-mid)"
          strokeGradient={[
            "var(--sunset-line-start)",
            "var(--sunset-line-mid)",
            "var(--sunset-line-end)",
          ]}
          strokeWidth={2}
        />
        <ChartTooltip
          backgroundColor="var(--popover)"
          content={GlowTooltipContent}
          dotColor="var(--sunset-dot)"
          dotHaloBlur={4}
          dotHaloOpacity={0.7}
          dotHaloScale={2.4}
          dotSize={4.5}
          indicatorColor="var(--sunset-dusk)"
          indicatorEnd="point"
          indicatorEndColor="var(--sunset-dot)"
          indicatorFadeEdges="top"
          indicatorFadeLength={35}
          showDatePill={false}
          topOffset={16}
        />
      </LineChart>
    </div>
  );
}

// recipes/sky-glow.tsx — Aurora scene
const AURORA_BACKDROPS: {
  center: { x: number; y: number };
  radius: { x: number; y: number };
  stops: LineBackdropStop[];
}[] = [
  {
    center: { x: 0.5, y: 1 },
    radius: { x: 1, y: 0.55 },
    stops: [
      { offset: 0, color: "#0f4a48", opacity: 0.8 },
      { offset: 1, color: "#0a2a30", opacity: 0 },
    ],
  },
  {
    center: { x: 0.18, y: 0.62 },
    radius: { x: 0.14, y: 0.75 },
    stops: [
      { offset: 0, color: "#38f5a6", opacity: 0.6 },
      { offset: 0.45, color: "#1fc8a0", opacity: 0.28 },
      { offset: 1, color: "#1fc8a0", opacity: 0 },
    ],
  },
  {
    center: { x: 0.42, y: 0.55 },
    radius: { x: 0.12, y: 0.85 },
    stops: [
      { offset: 0, color: "#4bf0c8", opacity: 0.55 },
      { offset: 0.5, color: "#2ab8c8", opacity: 0.22 },
      { offset: 1, color: "#2ab8c8", opacity: 0 },
    ],
  },
  {
    center: { x: 0.3, y: 0.5 },
    radius: { x: 0.05, y: 0.8 },
    stops: [
      { offset: 0, color: "#5cffc0", opacity: 0.4 },
      { offset: 1, color: "#5cffc0", opacity: 0 },
    ],
  },
  {
    center: { x: 0.75, y: 0.45 },
    radius: { x: 0.05, y: 0.75 },
    stops: [
      { offset: 0, color: "#8f8cff", opacity: 0.4 },
      { offset: 1, color: "#8f8cff", opacity: 0 },
    ],
  },
  {
    center: { x: 0.64, y: 0.5 },
    radius: { x: 0.13, y: 0.8 },
    stops: [
      { offset: 0, color: "#5fd9ff", opacity: 0.4 },
      { offset: 0.5, color: "#6b7cff", opacity: 0.22 },
      { offset: 1, color: "#6b7cff", opacity: 0 },
    ],
  },
  {
    center: { x: 0.86, y: 0.48 },
    radius: { x: 0.16, y: 0.75 },
    stops: [
      { offset: 0, color: "#b07bff", opacity: 0.55 },
      { offset: 0.5, color: "#8a5cf0", opacity: 0.25 },
      { offset: 1, color: "#8a5cf0", opacity: 0 },
    ],
  },
];

const AURORA_STARS = [
  { left: "9%", top: "8%", opacity: 0.5 },
  { left: "33%", top: "14%", opacity: 0.35 },
  { left: "55%", top: "5%", opacity: 0.45 },
  { left: "74%", top: "18%", opacity: 0.3 },
  { left: "96%", top: "10%", opacity: 0.5 },
];

const auroraData = (() => {
  const ridges = [
    { at: 0.12, height: 7, width: 0.1 },
    { at: 0.38, height: 12, width: 0.12 },
    { at: 0.66, height: 8, width: 0.1 },
    { at: 0.9, height: 10, width: 0.1 },
  ];
  return Array.from({ length: 28 }, (_, index) => {
    const t = index / 27;
    const ridge = ridges.reduce(
      (sum, r) => sum + r.height * Math.exp(-(((t - r.at) / r.width) ** 2)),
      0
    );
    return {
      date: new Date(2026, 9, index + 1),
      visitors: Math.round((30 + ridge + 0 * t) * 60),
    };
  });
})();

function AuroraSky() {
  const peak = Math.max(...auroraData.map((d) => d.visitors));
  return (
    <div
      className="relative w-full overflow-hidden rounded-xl"
      style={{ background: "linear-gradient(to bottom, #030812, #050d14)" }}
    >
      <LineChart
        data={auroraData}
        margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
        yScaleDomainMax={peak * 2.2}
      >
        {AURORA_BACKDROPS.map((backdrop) => (
          <LineBackdrop
            center={backdrop.center}
            dataKey="visitors"
            key={`${backdrop.center.x}-${backdrop.center.y}`}
            radius={backdrop.radius}
            stops={backdrop.stops}
          />
        ))}
        <LineBackdrop dataKey="visitors">
          {AURORA_STARS.map((star) => (
            <rect
              fill="#e8fff6"
              height={3}
              key={`${star.left}-${star.top}`}
              opacity={star.opacity}
              width={3}
              x={star.left}
              y={star.top}
            />
          ))}
        </LineBackdrop>
        <Line
          dataKey="visitors"
          fadeEdges={false}
          glow={{ blur: 6, opacity: 0.9 }}
          highlight={{
            dimOpacity: 0.25,
            fadeLength: 45,
            glow: { blur: 8 },
            span: 4,
            strokeWidth: 2.5,
          }}
          stroke="#3fd6e8"
          strokeGradient={["#3cf2a0", "#3fd6e8", "#a77bff"]}
          strokeWidth={2}
        />
        <ChartTooltip
          dotColor="#e8fff6"
          dotHaloBlur={4}
          dotHaloOpacity={0.7}
          dotHaloScale={2.4}
          dotSize={4.5}
          indicatorColor="#2ab8c8"
          indicatorEnd="point"
          indicatorEndColor="#e8fff6"
          indicatorFadeEdges="top"
          indicatorFadeLength={35}
          showDatePill={false}
          topOffset={16}
        />
      </LineChart>
    </div>
  );
}

// recipes/custom-indicators.tsx — spotlight beam
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

// recipes/diamond-markers.tsx — custom layer on useChart
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
(DiamondMarkers as unknown as Record<string, boolean>).__isPostOverlay = true;

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

// recipes/vertical-fade.tsx
function VerticalFade({
  children,
  edge = 33,
}: {
  children: ReactNode;
  edge?: number;
}) {
  const { innerWidth, innerHeight } = useChartStable();
  const id = useId().replace(/:/g, "");
  if (innerWidth <= 0 || innerHeight <= 0) {
    return null;
  }
  return (
    <g>
      <defs>
        <linearGradient id={`${id}-fade`} x1="0" x2="0" y1="0" y2="1">
          <stop offset={0} stopColor="white" stopOpacity={0} />
          <stop offset={edge / 100} stopColor="white" />
          <stop offset={1 - edge / 100} stopColor="white" />
          <stop offset={1} stopColor="white" stopOpacity={0} />
        </linearGradient>
        <mask
          height={innerHeight}
          id={`${id}-mask`}
          maskUnits="userSpaceOnUse"
          width={innerWidth}
          x={0}
          y={0}
        >
          <rect
            fill={`url(#${id}-fade)`}
            height={innerHeight}
            width={innerWidth}
          />
        </mask>
      </defs>
      <g mask={`url(#${id}-mask)`}>{children}</g>
    </g>
  );
}

// docs/band-demo.tsx — BandFillTypeDemo per segmented-control state
function BandFillTypeChart({ fillType }: { fillType: BandFillType }) {
  return (
    <LineChart data={bandRangeData}>
      <Grid horizontal />
      <Band
        fill="var(--chart-1)"
        fillOpacity={fillType === "gradient" ? 0.4 : 0.15}
        fillType={fillType}
        lowerKey="valueLower"
        pattern="diagonal"
        patternOpacity={0.6}
        strokeOpacity={0.5}
        upperKey="valueUpper"
      />
      <Line dataKey="value" stroke="var(--chart-1)" strokeWidth={2} />
      <XAxis />
      <ChartTooltip />
    </LineChart>
  );
}

// docs/date-highlights-demo.tsx — DeadlineFillTypesDemo, one cell each
function DeadlineFillType({
  fillType,
}: {
  fillType: "pattern" | "gradient" | "solid";
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-mono text-muted-foreground text-xs">
        fillType="{fillType}"
      </span>
      <LineChart
        aspectRatio="3 / 2"
        data={projectProgressData}
        margin={{ top: 16, right: 16, bottom: 32, left: 16 }}
      >
        <Deadline date={PROJECT_DUE_DATE} fillType={fillType} />
        <Line curve={smooth} dataKey="completed" stroke="var(--chart-1)" />
        <XAxis numTicks={3} />
      </LineChart>
    </div>
  );
}

/** The three progress series (a fragment, so LineChart still sees each `Line`). */
const progressLines = (
  <>
    <Line curve={smooth} dataKey="scope" stroke="var(--chart-4)" />
    <Line curve={smooth} dataKey="started" stroke="var(--chart-2)" />
    <Line curve={smooth} dataKey="completed" stroke="var(--chart-1)" />
  </>
);

/** Gallery cartesian helpers: one render for Background / ReferenceArea / TrendLine slots. */
function GalleryBackground({ background }: { background: ReactNode }) {
  return (
    <ExampleLineChart data={lineData}>
      {background}
      <Line dataKey="desktop" strokeWidth={2} />
      <XAxis />
      <ChartTooltip />
    </ExampleLineChart>
  );
}

function GalleryReferenceArea({ referenceArea }: { referenceArea: ReactNode }) {
  return (
    <ExampleLineChart data={lineDemoData}>
      {referenceArea}
      <Line dataKey="value" strokeWidth={2} />
      <XAxis />
      <ChartTooltip />
    </ExampleLineChart>
  );
}

function GalleryTrendLine({ trendLine }: { trendLine: ReactNode }) {
  return (
    <ExampleLineChart data={lineDemoData}>
      <Grid horizontal />
      <Line dataKey="value" strokeWidth={2} />
      {trendLine}
      <XAxis />
      <ChartTooltip />
    </ExampleLineChart>
  );
}

/** docs/line-chart-demo-data `LineTrendChart` (trend-line-demo.tsx). */
function DocsTrendChart({ children }: { children: ReactNode }) {
  return (
    <Full>
      <LineChart data={lineDemoData}>
        <Grid horizontal />
        <Line dataKey="value" strokeWidth={2} />
        {children}
        <XAxis />
        <ChartTooltip />
      </LineChart>
    </Full>
  );
}

function SparseChart({ children }: { children: ReactNode }) {
  return (
    <Full>
      <LineChart data={sparseValueData}>
        {children}
        <Line dataKey="value" />
        <XAxis />
        <ChartTooltip />
      </LineChart>
    </Full>
  );
}

function TooltipChart({
  pageviews,
  children,
}: {
  pageviews?: boolean;
  children: ReactNode;
}) {
  return (
    <Full>
      <LineChart data={tooltipDemoData}>
        <Grid horizontal />
        <Line dataKey="users" stroke="var(--chart-line-primary)" />
        {pageviews ? (
          <Line dataKey="pageviews" stroke="var(--chart-line-secondary)" />
        ) : null}
        <XAxis />
        {children}
      </LineChart>
    </Full>
  );
}

const crosshairLineProps = { showDatePill: false, showDots: false } as const;

/** Simple curve-type variants (Studio curve options not used by any example). */
function CurveChart({ curve }: { curve: typeof curveStep }) {
  return (
    <ExampleLineChart data={multiLineData}>
      <Grid horizontal />
      <Line curve={curve} dataKey="desktop" strokeWidth={2} />
      <Line
        curve={curve}
        dataKey="mobile"
        stroke="var(--chart-3)"
        strokeWidth={2}
      />
      <XAxis />
      <ChartTooltip />
    </ExampleLineChart>
  );
}

// ---------------------------------------------------------------------------
// Variants
// ---------------------------------------------------------------------------

export const LINE_VARIANTS: readonly LabVariant[] = [
  // --- Gallery (makeLineHero + makeLineExamples) ---------------------------
  {
    kind: "single",
    id: "hero-trio-brush",
    label: "Trio with brush (hero)",
    source: `${EXAMPLES}: makeLineHero "Line Chart - Trio with Brush" (LineChartStudioTrioDemo height 540)`,
    exercises:
      "ChartBrushLayout + ChartBrush strip, xDomain/xDomainSlotCount, tweenYDomainOnXDomainChange, dot Background, 3 catmullRom fadeEdges lines, ChartLegend hover provider",
    height: 560,
    interactions: brushScript(TRIO_STRIP_MARGIN),
    render: () => <TrioWithBrush height={540} />,
  },
  {
    kind: "single",
    id: "projection",
    label: "Projection",
    source: `${EXAMPLES}: "Line Chart - Projection" (ProjectionLineDemo); also line-chart.mdx + projection-line.mdx`,
    exercises:
      "ProjectionLine target + auto(lastSegment) bezier gradient dashed with end markers, LineSeriesTerminalMarker ringGap, x-domain extended to the horizon",
    render: () => (
      <Full>
        <LineChart data={lineDemoData}>
          <Grid horizontal />
          <Line dataKey="value" stroke="var(--chart-1)" strokeWidth={2} />
          <LineSeriesTerminalMarker
            dataKey="value"
            ringGap={6}
            stroke="var(--chart-1)"
          />
          <ProjectionLine
            curveKind="bezier"
            data={targetProjectionPath}
            gradientEnd="oklch(0.59 0.17 166.38)"
            gradientStart="oklch(0.979 0.037 110.273)"
            showEndMarker
            stroke="var(--chart-3)"
            strokeDasharray="1,4"
            strokeStyle="gradient"
            strokeWidth={2}
          />
          <ProjectionLine
            curveKind="bezier"
            data={autoProjectionPath}
            gradientEnd="oklch(0.849 0.232 16.498)"
            gradientStart="oklch(0.926 0.128 16.866 / 0.73)"
            showEndMarker
            stroke="oklch(0.926 0.128 32.86 / 0.73)"
            strokeDasharray="1,4"
            strokeStyle="gradient"
            strokeWidth={2}
          />
          <XAxis />
          <ChartTooltip />
        </LineChart>
      </Full>
    ),
  },
  {
    kind: "single",
    id: "linear",
    label: "Linear",
    source: `${EXAMPLES}: "Line Chart - Linear"`,
    exercises: "curveLinear, example margin, no x axis",
    render: () => (
      <ExampleLineChart data={lineData}>
        <Grid horizontal />
        <Line curve={curveLinear} dataKey="desktop" strokeWidth={2} />
        <ChartTooltip />
      </ExampleLineChart>
    ),
  },
  {
    kind: "single",
    id: "markers",
    label: "Markers",
    source: `${EXAMPLES}: "Line Chart - Markers"`,
    exercises: "ChartMarkers (2 single markers) with guide lines",
    render: () => (
      <ExampleLineChart data={lineData}>
        <Grid horizontal />
        <Line dataKey="desktop" strokeWidth={2} />
        <ChartMarkers items={lineMarkers} />
        <ChartTooltip />
      </ExampleLineChart>
    ),
  },
  {
    kind: "single",
    id: "segment-selection",
    label: "Segment selection (held drag)",
    source: `${EXAMPLES}: "Line Chart - Segment Selection"`,
    exercises:
      "mouse drag selection (useChartInteraction): a held drag starts once the chart is interactive, hover steps extend it; SegmentBackground + SegmentLineFrom/To + selected-path highlight",
    render: () => (
      <HeldDrag>
        <ExampleLineChart data={lineData}>
          <Grid horizontal />
          <Line dataKey="desktop" strokeWidth={2} />
          <SegmentBackground />
          <SegmentLineFrom />
          <SegmentLineTo />
          <ChartTooltip />
        </ExampleLineChart>
      </HeldDrag>
    ),
  },
  {
    kind: "single",
    id: "multiple-lines",
    label: "Multiple lines",
    source: `${EXAMPLES}: "Line Chart - Multiple Lines"`,
    exercises: "two series on one shared y scale, multi-row tooltip",
    render: () => (
      <ExampleLineChart data={multiLineData}>
        <Grid horizontal />
        <Line dataKey="desktop" stroke="var(--chart-1)" strokeWidth={2} />
        <Line dataKey="mobile" stroke="var(--chart-3)" strokeWidth={2} />
        <ChartTooltip />
      </ExampleLineChart>
    ),
  },
  {
    kind: "single",
    id: "x-axis",
    label: "X axis",
    source: `${EXAMPLES}: "Line Chart - X Axis"; ≈ docs/axis-demo AxisXOnlyDemo`,
    exercises: "XAxis labels + crosshair label fade",
    render: () => (
      <ExampleLineChart data={lineData}>
        <Grid horizontal />
        <Line dataKey="desktop" strokeWidth={2} />
        <XAxis />
        <ChartTooltip />
      </ExampleLineChart>
    ),
  },
  {
    kind: "single",
    id: "x-y-axis",
    label: "X & Y grid",
    source: `${EXAMPLES}: "Line Chart - X & Y Axis"; same Grid as docs/grid-demo GridBothDemo`,
    exercises: "Grid horizontal + vertical, fadeHorizontal={false}",
    render: () => (
      <ExampleLineChart data={lineData}>
        <Grid fadeHorizontal={false} horizontal vertical />
        <Line dataKey="desktop" strokeWidth={2} />
        <XAxis />
        <ChartTooltip />
      </ExampleLineChart>
    ),
  },
  {
    kind: "single",
    id: "series-markers",
    label: "Series markers",
    source: `${EXAMPLES}: "Line Chart - Series Markers" (weekly visitors, now = LAB_NOW)`,
    exercises:
      'showMarkers ring markers, fadeEdges={false}, XAxis tickMode="data", xDataKey',
    render: () => (
      <ExampleLineChart data={weeklyVisitorsData} xDataKey="date">
        <Grid horizontal />
        <Line
          dataKey="visitors"
          fadeEdges={false}
          showMarkers
          stroke="var(--chart-line-primary)"
          strokeWidth={2.5}
        />
        <XAxis tickMode="data" />
        <ChartTooltip />
      </ExampleLineChart>
    ),
  },
  {
    kind: "single",
    id: "loading-pulse",
    label: "Loading (pulse)",
    source: `${EXAMPLES}: "Line Chart - Loading" (LineChartLoading); docs/line-chart-loading-demo`,
    exercises: "LineChartLoading pulse loop + grid shimmer + shimmer label",
    hover: false,
    previewOnly:
      "loading pulse / grid shimmer loop forever; the transition out is recorded by loading-to-ready-pulse",
    render: () => <LineChartLoading margin={EXAMPLE_MARGIN} />,
  },
  {
    kind: "single",
    id: "loading-sweep",
    label: "Loading (sweep)",
    source: `${EXAMPLES}: "Line Chart - Loading (Sweep)"`,
    exercises: 'LineChartLoading loadingStyle="sweep"',
    hover: false,
    previewOnly:
      "sweep shimmer loops forever; the transition out is recorded by loading-to-ready-sweep",
    render: () => (
      <LineChartLoading loadingStyle="sweep" margin={EXAMPLE_MARGIN} />
    ),
  },
  {
    kind: "single",
    id: "dashed-tail",
    label: "Dashed tail",
    source: `${EXAMPLES}: "Line Chart - Dashed Tail" (weekly visitors, now = LAB_NOW)`,
    exercises: "dashFromIndex / dashArray tail overlay",
    render: () => (
      <ExampleLineChart data={weeklyVisitorsData} xDataKey="date">
        <Grid horizontal />
        <Line
          dashArray="6,4"
          dashFromIndex={weeklyVisitorsDashFromIndex}
          dataKey="visitors"
          stroke="var(--chart-line-primary)"
          strokeWidth={2.5}
        />
        <XAxis tickMode="data" />
        <ChartTooltip />
      </ExampleLineChart>
    ),
  },
  {
    kind: "single",
    id: "left-y-axis",
    label: "Left Y axis",
    source: `${EXAMPLES}: "Line Chart - Left Y axis"`,
    exercises: 'YAxis yAxisId="left" tick labels, wide left margin',
    render: () => (
      <ExampleLineChart data={multiLineData} margin={chartMarginLeftYAxis}>
        <Grid horizontal />
        <Line dataKey="desktop" strokeWidth={2.5} />
        <Line dataKey="mobile" stroke="var(--chart-2)" strokeWidth={2.5} />
        <YAxis yAxisId="left" />
        <XAxis />
        <ChartTooltip />
      </ExampleLineChart>
    ),
  },
  {
    kind: "single",
    id: "biaxial",
    label: "Left and right Y axes",
    source: `${EXAMPLES}: "Line Chart - Left and right Y axes"`,
    exercises: "two independent y scales (yAxisId left/right), right YAxis",
    render: () => (
      <ExampleLineChart data={multiLineData} margin={chartMarginBiaxialYAxis}>
        <Grid horizontal />
        <Line dataKey="desktop" yAxisId="left" />
        <Line dataKey="mobile" stroke="var(--chart-2)" yAxisId="right" />
        <YAxis yAxisId="left" />
        <YAxis orientation="right" yAxisId="right" />
        <XAxis />
        <ChartTooltip />
      </ExampleLineChart>
    ),
  },
  {
    kind: "single",
    id: "pattern-background",
    label: "Pattern background",
    source: `${EXAMPLES}: "Line Chart - Pattern Background"; ≈ docs/background-demo BackgroundDiagonalDemo`,
    exercises: "Background diagonal (fades in after reveal), no Grid",
    render: () => <GalleryBackground background={<Background />} />,
  },
  {
    kind: "single",
    id: "dot-background",
    label: "Dot grid background",
    source: `${EXAMPLES}: "Line Chart - Dot Grid Background"; ≈ docs/background-demo BackgroundDotsDemo`,
    exercises: 'Background pattern="dots" opacity 0.85',
    render: () => (
      <GalleryBackground
        background={<Background opacity={0.85} pattern="dots" />}
      />
    ),
  },
  {
    kind: "single",
    id: "reference-band",
    label: "Reference band",
    source: `${EXAMPLES}: "Line Chart - Reference Band"; ≈ docs/reference-area-demo ReferenceAreaBandDemo`,
    exercises: "ReferenceArea y1/y2 dashed + bracket markers",
    render: () => (
      <GalleryReferenceArea
        referenceArea={
          <ReferenceArea
            showMarkers
            strokeStyle="dashed"
            y1={REFERENCE_AREA_DEMO.y1}
            y2={REFERENCE_AREA_DEMO.y2}
          />
        }
      />
    ),
  },
  {
    kind: "single",
    id: "pattern-reference-band",
    label: "Pattern reference band",
    source: `${EXAMPLES}: "Line Chart - Pattern Reference Band"`,
    exercises: "ReferenceArea pattern fill + coloured axis labels",
    render: () => (
      <GalleryReferenceArea
        referenceArea={
          <ReferenceArea
            axisLabelColor="var(--chart-1)"
            fillOpacity={0.85}
            pattern="diagonal"
            patternColor="var(--chart-foreground-muted)"
            y1={REFERENCE_AREA_DEMO.y1}
            y2={REFERENCE_AREA_DEMO.y2}
          />
        }
      />
    ),
  },
  {
    kind: "single",
    id: "trend-line",
    label: "Trend line",
    source: `${EXAMPLES}: "Line Chart - Trend Line"; ≈ docs/trend-line-demo TrendLineDashedDemo / TrendLineDemo (dashed)`,
    exercises: "TrendLine least-squares dashed",
    render: () => (
      <GalleryTrendLine
        trendLine={<TrendLine dataKey="value" stroke="var(--chart-1)" />}
      />
    ),
  },
  {
    kind: "single",
    id: "gradient-trend-line",
    label: "Gradient trend line",
    source: `${EXAMPLES}: "Line Chart - Gradient Trend Line"; ≈ docs TrendLineGradientDemo / TrendLineDemo (gradient)`,
    exercises: "TrendLine gradient stroke + fadeEdges",
    render: () => (
      <GalleryTrendLine
        trendLine={
          <TrendLine
            dataKey="value"
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

  // --- Docs: line-chart.mdx -------------------------------------------------
  {
    kind: "single",
    id: "docs-hero",
    label: "Docs hero (stacked markers)",
    source:
      "line-chart.mdx ComponentPreview (line-chart-docs-data, Date.now → LAB_NOW)",
    exercises:
      "default LineChart margins, 30 daily points, 2 lines, 7 ChartMarkers (4 stacked on one day), MarkerTooltipContent inside ChartTooltip",
    render: () => (
      <Full>
        <LineChart data={lineChartDocsData}>
          <Grid horizontal />
          <Line dataKey="users" stroke="var(--chart-line-primary)" />
          <Line dataKey="pageviews" stroke="var(--chart-line-secondary)" />
          <ChartMarkers items={lineChartDocsMarkers} />
          <XAxis />
          <ChartTooltip>
            <MarkerContent markers={lineChartDocsMarkers} />
          </ChartTooltip>
        </LineChart>
      </Full>
    ),
  },
  {
    kind: "single",
    id: "date-range-morph",
    label: "Date range 30d → 7d",
    source: `${DOCS}/line-chart-date-range-demo.tsx (LineChartDateRangeDemo, seeded noise; range switched by timer)`,
    exercises:
      "data change mid-enter: line morph + yDomainTween without replaying the reveal",
    render: () => <DateRangeDemo showYAxis={false} steps={RANGE_MORPH_STEPS} />,
  },
  {
    kind: "single",
    id: "dataset-morph-y-axis",
    label: "Dataset revenue → ~10 (Y axis)",
    source: `${DOCS}/line-chart-date-range-demo.tsx (dataset + Y axis toggle; switched by timer)`,
    exercises:
      "large y-domain change: YAxis label exit/enter cascade, grid rescale, then line morph",
    render: () => <DateRangeDemo showYAxis steps={DATASET_MORPH_STEPS} />,
  },
  {
    kind: "single",
    id: "glow",
    label: "Glow (sunset)",
    source: `${DOCS}/line-chart-glow-demo.tsx (line-chart.mdx "Glow"); same structure as recipes/sky-glow Sunset`,
    exercises:
      "LineBackdrop radial gradients + children stars, strokeGradient, glow filter, highlight (fadeLength/glow/span/dimOpacity), yScaleDomainMax, zero margin, aspectRatio 7/5, indicatorEnd=point tooltip",
    height: 470,
    render: () => <GlowDemo />,
  },
  {
    kind: "single",
    id: "band-range",
    label: "Band range",
    source: `${DOCS}/band-demo.tsx BandRangeDemo (line-chart.mdx "Band", band.mdx)`,
    exercises: "Band upper/lower around a Line, y-domain covers both edges",
    render: () => (
      <Full>
        <LineChart data={bandRangeData}>
          <Grid horizontal />
          <Band
            fill="var(--chart-line-primary)"
            label="range"
            lowerKey="valueLower"
            strokeOpacity={0.4}
            upperKey="valueUpper"
          />
          <Line dataKey="value" stroke="var(--chart-line-primary)" />
          <XAxis />
          <ChartTooltip />
        </LineChart>
      </Full>
    ),
  },
  {
    kind: "single",
    id: "band-range-area",
    label: "Band only (range area)",
    source: `${DOCS}/band-demo.tsx BandRangeAreaDemo (band.mdx)`,
    exercises: "Band without a Line (band drives y-domain and tooltip)",
    render: () => (
      <Full>
        <LineChart data={temperatureData}>
          <Grid horizontal />
          <Band
            fill="var(--chart-1)"
            fillOpacity={0.3}
            label="Temperature"
            lowerKey="low"
            strokeWidth={1.5}
            upperKey="high"
          />
          <XAxis />
          <ChartTooltip />
        </LineChart>
      </Full>
    ),
  },
  {
    kind: "single",
    id: "band-combo",
    label: "Two bands + legend",
    source: `${DOCS}/band-demo.tsx BandRangeComboDemo (band.mdx)`,
    exercises: "two Bands strokeWidth 0 + two Lines, Legend below",
    height: 400,
    render: () => (
      <Full>
        <LineChart data={teamData}>
          <Grid horizontal />
          <Band
            fill="var(--chart-1)"
            fillOpacity={0.18}
            label="Team A range"
            lowerKey="teamAMin"
            strokeWidth={0}
            upperKey="teamAMax"
          />
          <Band
            fill="var(--chart-3)"
            fillOpacity={0.18}
            label="Team B range"
            lowerKey="teamBMin"
            strokeWidth={0}
            upperKey="teamBMax"
          />
          <Line dataKey="teamA" stroke="var(--chart-1)" strokeWidth={2} />
          <Line dataKey="teamB" stroke="var(--chart-3)" strokeWidth={2} />
          <XAxis />
          <ChartTooltip />
        </LineChart>
        <Legend
          className="flex-row justify-center gap-6"
          items={[
            { label: "Team A", value: 0, color: "var(--chart-1)" },
            { label: "Team B", value: 0, color: "var(--chart-3)" },
          ]}
        >
          <LegendItemComponent className="flex items-center gap-2">
            <LegendMarker />
            <LegendLabel />
          </LegendItemComponent>
        </Legend>
      </Full>
    ),
  },
  {
    kind: "single",
    id: "band-bollinger",
    label: "Bollinger bands",
    source: `${DOCS}/band-demo.tsx BandBollingerDemo (band.mdx)`,
    exercises:
      "withBollingerBands, null warm-up gaps, zero-height SMA band with dashed upper stroke only",
    render: () => (
      <Full>
        <LineChart data={bollingerData}>
          <Grid horizontal />
          <Band
            fill="var(--chart-1)"
            fillOpacity={0.12}
            label="Bollinger"
            lowerKey="priceLower"
            strokeOpacity={0.5}
            upperKey="priceUpper"
          />
          <Band
            fill="var(--chart-1)"
            fillOpacity={0}
            label="SMA"
            lowerKey="priceSma"
            lowerStroke={false}
            stroke="var(--chart-1)"
            strokeDasharray="4,4"
            strokeOpacity={0.8}
            upperKey="priceSma"
          />
          <Line
            dataKey="price"
            stroke="var(--chart-line-primary)"
            strokeWidth={2}
          />
          <XAxis />
          <ChartTooltip />
        </LineChart>
      </Full>
    ),
  },
  ...(["solid", "gradient", "pattern"] as const).map(
    (fillType): LabVariant => ({
      kind: "single",
      id: `band-fill-${fillType}`,
      label: `Band fill: ${fillType}`,
      source: `${DOCS}/band-demo.tsx BandFillTypeDemo (segmented control = ${fillType}; band.mdx)`,
      exercises: `Band fillType="${fillType}"`,
      render: () => <BandFillTypeChart fillType={fillType} />,
    })
  ),
  {
    kind: "single",
    id: "band-fade-edges",
    label: "Band fade edges",
    source: `${DOCS}/band-demo.tsx BandFadeEdgesDemo (band.mdx)`,
    exercises: "Band fadeEdges left/right + fadeSize, dashed edges",
    render: () => (
      <Full>
        <LineChart data={bandRangeData}>
          <Grid horizontal />
          <Band
            fadeEdges={{ left: true, right: true }}
            fadeSize={0.2}
            fill="var(--chart-3)"
            fillOpacity={0.2}
            lowerKey="valueLower"
            strokeDasharray="4,4"
            strokeOpacity={0.7}
            upperKey="valueUpper"
          />
          <Line dataKey="value" stroke="var(--chart-3)" strokeWidth={2} />
          <XAxis />
          <ChartTooltip />
        </LineChart>
      </Full>
    ),
  },
  {
    kind: "single",
    id: "band-edge-strokes",
    label: "Band edge strokes",
    source: `${DOCS}/band-demo.tsx BandEdgeStrokesDemo (band.mdx)`,
    exercises:
      "Band lowerStroke={false}, custom upperStroke dash, gradient fill",
    render: () => (
      <Full>
        <LineChart data={bandRangeData}>
          <Grid horizontal />
          <Band
            fill="var(--chart-line-primary)"
            fillOpacity={0.3}
            fillType="gradient"
            lowerKey="valueLower"
            lowerStroke={false}
            upperKey="valueUpper"
            upperStroke={{ strokeDasharray: "1,3", strokeWidth: 1.5 }}
          />
          <Line
            dataKey="value"
            stroke="var(--chart-line-primary)"
            strokeWidth={2}
          />
          <XAxis />
          <ChartTooltip />
        </LineChart>
      </Full>
    ),
  },
  {
    kind: "single",
    id: "date-highlights",
    label: "Weekends + deadline",
    source: `${DOCS}/date-highlights-demo.tsx DateHighlightsLineDemo (line-chart.mdx "Weekends and deadlines")`,
    exercises:
      "Weekends shading + Deadline line/label/striped region, 3 catmullRom(0.5) lines",
    render: () => (
      <Full>
        <LineChart data={projectProgressData}>
          <Grid horizontal />
          <Weekends />
          <Deadline date={PROJECT_DUE_DATE} label="Due Oct 15" />
          {progressLines}
          <XAxis />
          <ChartTooltip />
        </LineChart>
      </Full>
    ),
  },
  {
    kind: "single",
    id: "weekends",
    label: "Weekends",
    source: `${DOCS}/date-highlights-demo.tsx WeekendsLineDemo (weekends.mdx)`,
    exercises: "Weekends alone",
    render: () => (
      <Full>
        <LineChart data={projectProgressData}>
          <Grid horizontal />
          <Weekends />
          {progressLines}
          <XAxis />
          <ChartTooltip />
        </LineChart>
      </Full>
    ),
  },
  {
    kind: "single",
    id: "deadline",
    label: "Deadline",
    source: `${DOCS}/date-highlights-demo.tsx DeadlineLineDemo (deadline.mdx)`,
    exercises: "Deadline alone (default pattern fill)",
    render: () => (
      <Full>
        <LineChart data={projectProgressData}>
          <Grid horizontal />
          <Deadline date={PROJECT_DUE_DATE} label="Due Oct 15" />
          {progressLines}
          <XAxis />
          <ChartTooltip />
        </LineChart>
      </Full>
    ),
  },
  ...(["pattern", "gradient", "solid"] as const).map(
    (fillType): LabVariant => ({
      kind: "single",
      id: `deadline-fill-${fillType}`,
      label: `Deadline fill: ${fillType}`,
      source: `${DOCS}/date-highlights-demo.tsx DeadlineFillTypesDemo (cell "${fillType}"; deadline.mdx)`,
      exercises: `Deadline fillType="${fillType}", aspectRatio 3/2, XAxis numTicks 3, no tooltip`,
      width: 320,
      height: 260,
      render: () => <DeadlineFillType fillType={fillType} />,
    })
  ),
  {
    kind: "single",
    id: "date-highlights-brush",
    label: "Weekends + deadline with brush",
    source: `${DOCS}/date-highlights-demo.tsx DateHighlightsBrushDemo (weekends.mdx / deadline.mdx)`,
    exercises:
      "Weekends / Deadline clipped to the brushed x-domain, Deadline in the brush strip, 120 points",
    height: 380,
    interactions: brushScript(DOCS_STRIP_MARGIN),
    render: () => <DateHighlightsBrush />,
  },
  {
    kind: "single",
    id: "brush",
    label: "Brush zoom",
    source: `${DOCS}/line-chart-brush-demo.tsx (line-chart.mdx "Brush zoom")`,
    exercises:
      "ChartBrushLayout with diagonal selectionPattern, default margins, brushed xDomain + y-domain tween",
    height: 380,
    interactions: brushScript(DOCS_STRIP_MARGIN),
    render: () => <BrushDemo />,
  },
  {
    kind: "single",
    id: "loading-to-ready-pulse",
    label: "Loading → ready (pulse)",
    source: `${DOCS}/line-chart-y-domain-demo.tsx LineChartYDomainDemo (Loading → Ready after 1.2 s; line-chart.mdx "Loading state")`,
    exercises:
      'status="loading"→"ready" choreography: pulse exit, shimmer label exit, grid y-domain tween, clip reveal',
    render: () => (
      <YDomainStatusDemo loadingStyle="pulse" script={LOADING_TO_READY} />
    ),
  },
  {
    kind: "single",
    id: "loading-to-ready-sweep",
    label: "Loading → ready (sweep)",
    source: `${DOCS}/line-chart-y-domain-demo.tsx (Sweep toggle; Loading → Ready after 1.2 s)`,
    exercises: 'loadingStyle="sweep" loading state handing off to ready',
    render: () => (
      <YDomainStatusDemo loadingStyle="sweep" script={LOADING_TO_READY} />
    ),
  },
  {
    kind: "single",
    id: "ready-loading-ready",
    label: "Ready → loading → ready",
    source: `${DOCS}/line-chart-y-domain-demo.tsx (Loading at 0.6 s, Ready at 2.4 s)`,
    exercises: "ready→loading conceal mid-enter, then loading→ready again",
    render: () => (
      <YDomainStatusDemo loadingStyle="pulse" script={READY_LOADING_READY} />
    ),
  },
  {
    kind: "single",
    id: "segment-docs",
    label: "Segment selection + stats (docs)",
    source: `${DOCS}/segment-demo.tsx SegmentDemo (segment.mdx; Date.now → LAB_NOW)`,
    exercises:
      "useChart().selection read by a child (SegmentBridge) driving an HTML header, during a held drag",
    height: 420,
    render: () => (
      <HeldDrag from={0.2} to={0.6}>
        <SegmentDocsDemo />
      </HeldDrag>
    ),
  },
  {
    kind: "single",
    id: "segment-line-variants",
    label: "Segment lines solid / gradient",
    source: "line-chart.mdx SegmentLineFrom / SegmentLineTo props table",
    exercises:
      'SegmentLineFrom variant="solid", SegmentLineTo variant="gradient", custom SegmentBackground fill',
    render: () => (
      <HeldDrag from={0.3} to={0.7}>
        <Full>
          <LineChart data={segmentDemoData}>
            <Grid horizontal />
            <Line dataKey="users" />
            <SegmentBackground fill="color-mix(in oklch, var(--chart-1) 12%, transparent)" />
            <SegmentLineFrom
              stroke="var(--chart-1)"
              strokeWidth={2}
              variant="solid"
            />
            <SegmentLineTo stroke="var(--chart-1)" variant="gradient" />
            <XAxis />
            <ChartTooltip />
          </LineChart>
        </Full>
      </HeldDrag>
    ),
  },

  // --- Docs: utility pages --------------------------------------------------
  {
    kind: "single",
    id: "axis-both",
    label: "Y + X axis",
    source: `${DOCS}/axis-demo.tsx AxisBothDemo (axis.mdx; Date.now → LAB_NOW)`,
    exercises: "YAxis default (left) with margin.left 50, grid both directions",
    render: () => (
      <Full>
        <LineChart data={axisDemoData} margin={{ left: 50 }}>
          <Grid fadeHorizontal={false} horizontal vertical />
          <Line dataKey="value" stroke="var(--chart-line-primary)" />
          <YAxis />
          <XAxis />
          <ChartTooltip />
        </LineChart>
      </Full>
    ),
  },
  {
    kind: "single",
    id: "axis-y-only",
    label: "Y axis only",
    source: `${DOCS}/axis-demo.tsx AxisYOnlyDemo (axis.mdx)`,
    exercises: "YAxis without XAxis",
    render: () => (
      <Full>
        <LineChart data={axisDemoData} margin={{ left: 50 }}>
          <Grid horizontal />
          <Line dataKey="value" stroke="var(--chart-line-primary)" />
          <YAxis />
          <ChartTooltip />
        </LineChart>
      </Full>
    ),
  },
  {
    kind: "single",
    id: "background-cross",
    label: "Background cross",
    source: `${DOCS}/background-demo.tsx BackgroundCrossDemo (background.mdx)`,
    exercises: 'Background pattern="cross" scale 1.25',
    render: () => (
      <SparseChart>
        <Background pattern="cross" scale={1.25} />
      </SparseChart>
    ),
  },
  {
    kind: "single",
    id: "background-no-fade",
    label: "Background no fade",
    source: `${DOCS}/background-demo.tsx BackgroundNoFadeDemo (background.mdx)`,
    exercises:
      'Background pattern="horizontal", fadeHorizontal/fadeVertical off',
    render: () => (
      <SparseChart>
        <Background
          fadeHorizontal={false}
          fadeVertical={false}
          pattern="horizontal"
        />
      </SparseChart>
    ),
  },
  {
    kind: "single",
    id: "grid-horizontal",
    label: "Grid horizontal",
    source: `${DOCS}/grid-demo.tsx GridHorizontalDemo (grid.mdx)`,
    exercises:
      "default LineChart margins + Grid horizontal (fade) on sparse data",
    render: () => (
      <SparseChart>
        <Grid horizontal />
      </SparseChart>
    ),
  },
  {
    kind: "single",
    id: "grid-vertical",
    label: "Grid vertical only",
    source: `${DOCS}/grid-demo.tsx GridVerticalDemo (grid.mdx)`,
    exercises: "Grid horizontal={false} vertical",
    render: () => (
      <SparseChart>
        <Grid horizontal={false} vertical />
      </SparseChart>
    ),
  },
  {
    kind: "single",
    id: "grid-solid",
    label: "Grid solid",
    source: `${DOCS}/grid-demo.tsx GridSolidDemo (grid.mdx)`,
    exercises: 'Grid strokeDasharray=""',
    render: () => (
      <SparseChart>
        <Grid horizontal strokeDasharray="" />
      </SparseChart>
    ),
  },
  {
    kind: "single",
    id: "grid-no-fade",
    label: "Grid no fade",
    source: `${DOCS}/grid-demo.tsx GridNoFadeDemo (grid.mdx)`,
    exercises: "Grid fadeHorizontal={false}",
    render: () => (
      <SparseChart>
        <Grid fadeHorizontal={false} horizontal />
      </SparseChart>
    ),
  },
  {
    kind: "single",
    id: "grid-hide-edge-lines",
    label: "Grid hide edge lines",
    source: `${DOCS}/grid-demo.tsx GridHideEdgeLinesDemo (grid.mdx)`,
    exercises: "Grid hideHorizontalEdgeLines (filtered y ticks)",
    render: () => (
      <SparseChart>
        <Grid hideHorizontalEdgeLines horizontal />
      </SparseChart>
    ),
  },
  {
    kind: "single",
    id: "grid-dense",
    label: "Grid dense",
    source: `${DOCS}/grid-demo.tsx GridDenseDemo (grid.mdx)`,
    exercises: "Grid numTicksRows 10 / numTicksColumns 15",
    render: () => (
      <SparseChart>
        <Grid
          fadeHorizontal={false}
          horizontal
          numTicksColumns={15}
          numTicksRows={10}
          vertical
        />
      </SparseChart>
    ),
  },
  {
    kind: "single",
    id: "grid-highlight-row",
    label: "Grid highlight row",
    source: "line-chart.mdx Grid props table (highlightRow*)",
    exercises:
      "Grid highlightRowValues + custom highlight stroke/width/dash on positive data",
    render: () => (
      <SparseChart>
        <Grid
          highlightRowStroke="var(--chart-1)"
          highlightRowStrokeDasharray="2,2"
          highlightRowStrokeWidth={2}
          highlightRowValues={[1500, 2000]}
          horizontal
        />
      </SparseChart>
    ),
  },
  {
    kind: "single",
    id: "reference-area-pattern",
    label: "Reference area pattern (docs)",
    source: `${DOCS}/reference-area-demo.tsx ReferenceAreaPatternDemo (reference-area.mdx)`,
    exercises:
      "ReferenceArea patternScale / patternStrokeWidth / stroke / axisLabelColor, no markers",
    render: () => (
      <Full>
        <LineChart data={lineDemoData}>
          <Grid horizontal />
          <ReferenceArea
            axisLabelColor={REFERENCE_AREA_DEMO.axisLabelColor}
            pattern={REFERENCE_AREA_DEMO.pattern}
            patternColor={REFERENCE_AREA_DEMO.patternColor}
            patternScale={REFERENCE_AREA_DEMO.patternScale}
            patternStrokeWidth={REFERENCE_AREA_DEMO.patternStrokeWidth}
            showMarkers={REFERENCE_AREA_DEMO.showMarkers}
            stroke={REFERENCE_AREA_DEMO.stroke}
            y1={REFERENCE_AREA_DEMO.y1}
            y2={REFERENCE_AREA_DEMO.y2}
          />
          <Line dataKey="value" strokeWidth={2} />
          <XAxis />
          <ChartTooltip />
        </LineChart>
      </Full>
    ),
  },
  {
    kind: "single",
    id: "reference-area-markers",
    label: "Reference area markers",
    source: `${DOCS}/reference-area-demo.tsx ReferenceAreaMarkersDemo (reference-area.mdx)`,
    exercises: "ReferenceArea markerColor + stroke colour",
    render: () => (
      <Full>
        <LineChart data={lineDemoData}>
          <Grid horizontal />
          <ReferenceArea
            markerColor="var(--chart-1)"
            showMarkers
            stroke="var(--chart-1)"
            strokeStyle="dashed"
            y1={REFERENCE_AREA_DEMO.y1}
            y2={REFERENCE_AREA_DEMO.y2}
          />
          <Line dataKey="value" strokeWidth={2} />
          <XAxis />
          <ChartTooltip />
        </LineChart>
      </Full>
    ),
  },
  {
    kind: "single",
    id: "tooltip-default",
    label: "Tooltip default",
    source: `${DOCS}/tooltip-demo.tsx TooltipDefaultDemo (tooltip.mdx)`,
    exercises: "default ChartTooltip (date pill, dots, crosshair), 2 lines",
    render: () => (
      <TooltipChart pageviews>
        <ChartTooltip />
      </TooltipChart>
    ),
  },
  {
    kind: "single",
    id: "tooltip-crosshair-only",
    label: "Tooltip crosshair only",
    source: `${DOCS}/tooltip-demo.tsx TooltipCrosshairOnlyDemo`,
    exercises: "showDatePill={false} showDots={false}",
    render: () => (
      <TooltipChart>
        <ChartTooltip showDatePill={false} showDots={false} />
      </TooltipChart>
    ),
  },
  {
    kind: "single",
    id: "tooltip-minimal",
    label: "Tooltip minimal",
    source: `${DOCS}/tooltip-demo.tsx TooltipMinimalDemo`,
    exercises: "no crosshair, no pill, no dots (panel only)",
    render: () => (
      <TooltipChart>
        <ChartTooltip
          showCrosshair={false}
          showDatePill={false}
          showDots={false}
        />
      </TooltipChart>
    ),
  },
  {
    kind: "single",
    id: "tooltip-custom-rows",
    label: "Tooltip custom rows",
    source: `${DOCS}/tooltip-demo.tsx TooltipCustomRowsDemo`,
    exercises: "rows={(point) => …}",
    render: () => (
      <TooltipChart pageviews>
        <ChartTooltip
          rows={(point) => [
            {
              color: "var(--chart-line-primary)",
              label: "Active Users",
              value: (point.users as number)?.toLocaleString() ?? "0",
            },
            {
              color: "var(--chart-line-secondary)",
              label: "Page Views",
              value: (point.pageviews as number)?.toLocaleString() ?? "0",
            },
          ]}
        />
      </TooltipChart>
    ),
  },
  {
    kind: "single",
    id: "tooltip-solid-crosshair",
    label: "Tooltip solid crosshair",
    source: `${DOCS}/tooltip-demo.tsx TooltipSolidCrosshairDemo`,
    exercises: 'indicatorColor + indicatorFadeEdges="none"',
    render: () => (
      <TooltipChart>
        <ChartTooltip
          {...crosshairLineProps}
          indicatorColor="var(--chart-2)"
          indicatorFadeEdges="none"
        />
      </TooltipChart>
    ),
  },
  {
    kind: "single",
    id: "tooltip-crosshair-fade-top",
    label: "Tooltip crosshair fade top",
    source: `${DOCS}/tooltip-demo.tsx TooltipCrosshairFadeTopDemo`,
    exercises: 'indicatorFadeEdges="top" indicatorFadeLength 22',
    render: () => (
      <TooltipChart>
        <ChartTooltip
          {...crosshairLineProps}
          indicatorColor="var(--chart-2)"
          indicatorFadeEdges="top"
          indicatorFadeLength={22}
        />
      </TooltipChart>
    ),
  },
  {
    kind: "single",
    id: "tooltip-dashed-crosshair",
    label: "Tooltip dashed crosshair",
    source: `${DOCS}/tooltip-demo.tsx TooltipDashedCrosshairDemo`,
    exercises: 'indicatorDasharray="6,4"',
    render: () => (
      <TooltipChart>
        <ChartTooltip
          {...crosshairLineProps}
          indicatorColor="var(--chart-2)"
          indicatorDasharray="6,4"
        />
      </TooltipChart>
    ),
  },
  {
    kind: "single",
    id: "tooltip-match-crosshair",
    label: "Tooltip match crosshair",
    source: `${DOCS}/tooltip-demo.tsx TooltipMatchCrosshairDemo`,
    exercises: "matchCrosshair (panel follows the crosshair spring)",
    render: () => (
      <TooltipChart>
        <ChartTooltip matchCrosshair />
      </TooltipChart>
    ),
  },
  {
    kind: "single",
    id: "tooltip-damping",
    label: "Tooltip panel damping",
    source: `${DOCS}/tooltip-demo.tsx TooltipPanelDampingDemo`,
    exercises:
      "damping 55 (enter only: the overdamped low-stiffness panel spring takes > 8 s to come to rest after a hover move, past the recorder's settle timeout)",
    hover: false,
    render: () => (
      <TooltipChart>
        <ChartTooltip damping={55} indicatorColor="var(--chart-2)" />
      </TooltipChart>
    ),
  },
  {
    kind: "single",
    id: "tooltip-custom-content",
    label: "Tooltip custom content",
    source: `${DOCS}/tooltip-demo.tsx TooltipCustomContentDemo`,
    exercises: "content={({ point }) => …}",
    render: () => (
      <TooltipChart pageviews>
        <ChartTooltip
          content={({ point }) => (
            <div className="flex flex-col gap-2 p-3">
              <div className="font-medium text-sm">
                {point.date instanceof Date
                  ? point.date.toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })
                  : "—"}
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                <span className="text-zinc-400">Users</span>
                <span className="font-mono">
                  {(point.users as number)?.toLocaleString()}
                </span>
                <span className="text-zinc-400">Views</span>
                <span className="font-mono">
                  {(point.pageviews as number)?.toLocaleString()}
                </span>
                <span className="text-zinc-400">Ratio</span>
                <span className="font-mono">
                  {(
                    (point.pageviews as number) / (point.users as number)
                  ).toFixed(2)}
                  x
                </span>
              </div>
            </div>
          )}
        />
      </TooltipChart>
    ),
  },
  {
    kind: "single",
    id: "markers-rich",
    label: "Markers (fan-out)",
    source: `${DOCS}/markers-demo.tsx MarkersDemo (markers.mdx)`,
    exercises:
      "ChartMarkers with 3 on one date (fan out on hover), coloured marker, link markers",
    render: () => (
      <Full>
        <LineChart data={markersDemoData}>
          <Grid horizontal />
          <Line dataKey="value" strokeWidth={2} />
          <ChartMarkers items={richMarkers} />
          <XAxis />
          <ChartTooltip>
            <MarkerContent markers={richMarkers} />
          </ChartTooltip>
        </LineChart>
      </Full>
    ),
  },
  {
    kind: "single",
    id: "markers-compact",
    label: "Markers compact",
    source: `${DOCS}/markers-demo.tsx MarkersCompactDemo (markers.mdx)`,
    exercises:
      "ChartMarkers animate={false}, showLines={false}, size 20, margin.top 24",
    render: () => (
      <Full>
        <LineChart data={markersDemoData} margin={{ top: 24 }}>
          <Grid horizontal />
          <Line dataKey="value" strokeWidth={2} />
          <ChartMarkers
            animate={false}
            items={richMarkers}
            showLines={false}
            size={20}
          />
          <XAxis />
          <ChartTooltip>
            <MarkerContent markers={richMarkers} />
          </ChartTooltip>
        </LineChart>
      </Full>
    ),
  },
  {
    kind: "single",
    id: "trend-line-solid",
    label: "Trend line solid",
    source: `${DOCS}/trend-line-demo.tsx TrendLineSolidDemo / TrendLineDemo (solid) (trend-line.mdx)`,
    exercises: 'TrendLine strokeStyle="solid" opacity 0.8',
    render: () => (
      <DocsTrendChart>
        <TrendLine
          dataKey="value"
          opacity={0.8}
          stroke="var(--chart-1)"
          strokeStyle="solid"
        />
      </DocsTrendChart>
    ),
  },
  {
    kind: "single",
    id: "trend-line-fade-edges",
    label: "Trend line fade edges",
    source: `${DOCS}/trend-line-demo.tsx TrendLineFadeEdgesDemo (trend-line.mdx)`,
    exercises: "TrendLine fadeEdges + fadeEdgesLength 25",
    render: () => (
      <DocsTrendChart>
        <TrendLine
          dataKey="value"
          fadeEdges
          fadeEdgesLength={25}
          stroke="var(--chart-1)"
          strokeStyle="solid"
        />
      </DocsTrendChart>
    ),
  },
  {
    kind: "single",
    id: "projection-gradient",
    label: "Projection gradient (solid, no end marker)",
    source: `${DOCS}/projection-line-demo.tsx ProjectionLineGradientDemo (projection-line.mdx)`,
    exercises:
      "ProjectionLine gradient without dash or end marker, default terminal marker",
    render: () => (
      <Full>
        <LineChart data={lineDemoData}>
          <Grid horizontal />
          <Line dataKey="value" stroke="var(--chart-1)" strokeWidth={2} />
          <LineSeriesTerminalMarker dataKey="value" stroke="var(--chart-1)" />
          <ProjectionLine
            curveKind="bezier"
            data={autoProjectionPath}
            gradientEnd="oklch(0.849 0.232 16.498)"
            gradientStart="oklch(0.926 0.128 16.866 / 0.73)"
            showEndMarker={false}
            stroke="oklch(0.926 0.128 32.86 / 0.73)"
            strokeStyle="gradient"
            strokeWidth={2}
          />
          <XAxis />
          <ChartTooltip />
        </LineChart>
      </Full>
    ),
  },
  {
    kind: "single",
    id: "projection-stepped-linear",
    label: "Projection stepped, linear",
    source: "projection-line.mdx props table (buildProjectionPath options)",
    exercises:
      'pathDensity="stepped" linearRegression path, curveKind="linear", solid stroke, default dash, endpointRadius',
    render: () => (
      <Full>
        <LineChart data={lineDemoData}>
          <Grid horizontal />
          <Line dataKey="value" strokeWidth={2} />
          <LineSeriesTerminalMarker
            dataKey="value"
            fill="var(--chart-1)"
            radius={4}
          />
          <ProjectionLine
            data={steppedProjectionPath}
            endpointRadius={4}
            stroke="var(--chart-3)"
            strokeOpacity={0.8}
          />
          <XAxis />
          <ChartTooltip />
        </LineChart>
      </Full>
    ),
  },

  // --- Recipes --------------------------------------------------------------
  {
    kind: "single",
    id: "recipe-projection",
    label: "Recipe: forecast projection",
    source: `${RECIPES}/projection-line.tsx ForecastLine`,
    exercises: "linearRegression projection over 28 daily points",
    render: () => (
      <LineChart data={recipeDailyData}>
        <Grid horizontal />
        <Line dataKey="visitors" stroke="var(--chart-1)" strokeWidth={2} />
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
      </LineChart>
    ),
  },
  {
    kind: "single",
    id: "recipe-trend-line",
    label: "Recipe: trend line",
    source: `${RECIPES}/trend-line.tsx TrendOnLine`,
    exercises: "color-mix stroke, thin line + gradient TrendLine fadeEdges",
    render: () => (
      <LineChart data={recipeDailyData}>
        <Grid horizontal />
        <Line
          dataKey="visitors"
          stroke="color-mix(in oklch, var(--chart-1) 55%, transparent)"
          strokeWidth={1.5}
        />
        <TrendLine
          dataKey="visitors"
          fadeEdges
          gradientEnd="var(--chart-1)"
          gradientStart="var(--chart-3)"
          strokeStyle="gradient"
          strokeWidth={2.5}
        />
        <XAxis />
        <ChartTooltip />
      </LineChart>
    ),
  },
  {
    kind: "single",
    id: "recipe-hatched-backdrop",
    label: "Recipe: hatched backdrop",
    source: `${RECIPES}/hatched-backdrop.tsx HatchedLine`,
    exercises: "Background diagonal with fadeVerticalLength 33, default Line",
    render: () => (
      <LineChart data={recipeDailyData}>
        <Background fadeVerticalLength={PATTERN_FADE_EDGE} pattern="diagonal" />
        <Line dataKey="visitors" />
        <XAxis />
        <ChartTooltip />
      </LineChart>
    ),
  },
  {
    kind: "single",
    id: "recipe-event-markers",
    label: "Recipe: event markers",
    source: `${RECIPES}/event-markers.tsx MarkersLine`,
    exercises: "ChartMarkers on 28 daily points (2 share a day)",
    render: () => (
      <LineChart data={recipeDailyData}>
        <Grid horizontal />
        <Line dataKey="visitors" strokeWidth={2} />
        <ChartMarkers items={recipeEventMarkers} />
        <XAxis />
        <ChartTooltip>
          <MarkerContent markers={recipeEventMarkers} />
        </ChartTooltip>
      </LineChart>
    ),
  },
  {
    kind: "single",
    id: "recipe-dot-matrix",
    label: "Recipe: dot matrix",
    source: `${RECIPES}/dot-matrix.tsx DotMatrixLine`,
    exercises:
      "dot Background with fadeHorizontalLength/fadeVerticalLength, showMarkers, fadeEdges off",
    render: () => (
      <LineChart data={recipeWeeklyData}>
        <Background
          fadeHorizontalLength={20}
          fadeVerticalLength={PATTERN_FADE_EDGE}
          opacity={0.85}
          pattern="dots"
        />
        <Line dataKey="visitors" fadeEdges={false} showMarkers />
        <XAxis />
        <ChartTooltip />
      </LineChart>
    ),
  },
  {
    kind: "single",
    id: "recipe-monochrome",
    label: "Recipe: monochrome",
    source: `${RECIPES}/monochrome.tsx MonoLine`,
    exercises: 'Grid strokeDasharray="1,4", two foreground-token lines',
    render: () => (
      <LineChart data={recipeDailyData}>
        <Grid horizontal strokeDasharray="1,4" />
        <Line
          dataKey="previous"
          stroke="var(--muted-foreground)"
          strokeWidth={1.5}
        />
        <Line dataKey="visitors" stroke="var(--foreground)" strokeWidth={2} />
        <XAxis />
        <ChartTooltip />
      </LineChart>
    ),
  },
  {
    kind: "single",
    id: "recipe-sky-aurora",
    label: "Recipe: aurora sky",
    source: `${RECIPES}/sky-glow.tsx AuroraSky (Sunset ≈ the glow variant)`,
    exercises:
      "7 stacked LineBackdrops + stars, larger highlight span/glow, dotHaloScale",
    render: () => <AuroraSky />,
  },
  {
    kind: "single",
    id: "recipe-spotlight",
    label: "Recipe: spotlight indicator",
    source: `${RECIPES}/custom-indicators.tsx SpotlightLine`,
    exercises:
      "custom indicator layer reading useChart().tooltipData (x, yPositions) with Motion springs, showCrosshair={false}",
    render: () => (
      <LineChart data={recipeDailyData}>
        <Grid horizontal />
        <SpotlightIndicator seriesKey="visitors" />
        <Line dataKey="visitors" strokeWidth={2} />
        <XAxis />
        <ChartTooltip showCrosshair={false} />
      </LineChart>
    ),
  },
  {
    kind: "single",
    id: "recipe-diamond-markers",
    label: "Recipe: diamond markers",
    source: `${RECIPES}/diamond-markers.tsx DiamondLine`,
    exercises:
      "custom __isPostOverlay layer on useChart() xScale / innerHeight / isLoaded, tooltip children",
    render: () => (
      <LineChart data={recipeDailyData}>
        <Grid horizontal />
        <Line dataKey="visitors" strokeWidth={2} />
        <DiamondMarkers items={recipeDiamondMarkers} />
        <XAxis />
        <ChartTooltip>
          <DiamondTooltipContent items={recipeDiamondMarkers} />
        </ChartTooltip>
      </LineChart>
    ),
  },
  {
    kind: "single",
    id: "recipe-weekend-stripes",
    label: "Recipe: weekend stripes",
    source: `${RECIPES}/weekend-stripes.tsx WeekendLine`,
    exercises: "Weekends inside a useChartStable VerticalFade mask, no Grid",
    render: () => (
      <LineChart data={recipeDailyData}>
        <VerticalFade>
          <Weekends />
        </VerticalFade>
        <Line dataKey="visitors" />
        <XAxis />
        <ChartTooltip />
      </LineChart>
    ),
  },
  {
    kind: "single",
    id: "recipe-range-band",
    label: "Recipe: range band",
    source: `${RECIPES}/range-band.tsx BandLine`,
    exercises: "gradient Band with fadeEdges + dashed edges",
    render: () => (
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
    ),
  },

  // --- Props-table coverage (no example sets these) -------------------------
  {
    kind: "single",
    id: "curve-step",
    label: "Curve: step",
    source: "line-chart.mdx Line `curve` + Studio curve options",
    exercises: "curveStep",
    render: () => <CurveChart curve={curveStep} />,
  },
  {
    kind: "single",
    id: "curve-monotone",
    label: "Curve: monotoneX",
    source: "line-chart.mdx Line `curve` + Studio curve options",
    exercises: "curveMonotoneX",
    render: () => <CurveChart curve={curveMonotoneX} />,
  },
  {
    kind: "single",
    id: "curve-basis",
    label: "Curve: basis",
    source: "line-chart.mdx Line `curve` + Studio curve options",
    exercises: "curveBasis",
    render: () => <CurveChart curve={curveBasis} />,
  },
  {
    kind: "single",
    id: "no-animate",
    label: "animate={false}",
    source: "line-chart.mdx Line `animate`",
    exercises:
      "Line animate={false} next to an animated line, showHighlight={false}",
    render: () => (
      <ExampleLineChart data={multiLineData}>
        <Grid horizontal />
        <Line animate={false} dataKey="desktop" showHighlight={false} />
        <Line dataKey="mobile" stroke="var(--chart-2)" />
        <XAxis />
        <ChartTooltip />
      </ExampleLineChart>
    ),
  },
  {
    kind: "single",
    id: "fade-left-gradient",
    label: 'fadeEdges="left" + strokeGradient',
    source: "line-chart.mdx Line `fadeEdges` / `strokeGradient` / `highlight`",
    exercises:
      'fadeEdges="left", offset strokeGradient stops, plain highlight (stroke + width, no glow)',
    render: () => (
      <ExampleLineChart data={lineDemoData}>
        <Grid horizontal />
        <Line
          dataKey="value"
          fadeEdges="left"
          highlight={{ stroke: "var(--chart-2)", strokeWidth: 3, span: 2 }}
          strokeGradient={[
            { offset: 0, color: "var(--chart-1)" },
            { offset: 0.7, color: "var(--chart-3)" },
            { offset: 1, color: "var(--chart-5)" },
          ]}
          strokeWidth={3}
        />
        <XAxis />
        <ChartTooltip />
      </ExampleLineChart>
    ),
  },
  {
    kind: "single",
    id: "fast-enter-domain-max",
    label: "animationDuration 400 + yScaleDomainMax",
    source:
      "line-chart.mdx LineChart `animationDuration` / `yScaleDomainMax` / `aspectRatio`",
    exercises:
      'short clip reveal, fixed y-domain max with headroom, aspectRatio "3 / 1", YAxis',
    render: () => (
      <LineChart
        animationDuration={400}
        aspectRatio="3 / 1"
        data={lineData}
        margin={{ left: 48 }}
        yScaleDomainMax={400}
      >
        <Grid horizontal />
        <Line dataKey="desktop" />
        <YAxis />
        <XAxis />
        <ChartTooltip />
      </LineChart>
    ),
  },
];
