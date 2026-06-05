"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  BarXAxis,
  BarYAxis,
  Candlestick,
  CandlestickChart,
  type ChartMarker,
  ChartMarkers,
  type ChartStatFlowFormat,
  ChartTooltip,
  ChoroplethChart,
  type ChoroplethFeature,
  ChoroplethFeatureComponent,
  ChoroplethGraticule,
  ChoroplethTooltip,
  ComposedChart,
  FunnelChart,
  type FunnelStage,
  Gauge,
  Grid,
  Legend,
  LegendItemComponent,
  LegendLabel,
  LegendMarker,
  LegendProgress,
  LegendValue,
  Line,
  LinearGradient,
  LineChart,
  LineChartLoading,
  LiveLine,
  LiveLineChart,
  type LiveLinePoint,
  LiveXAxis,
  LiveYAxis,
  type MomentumColors,
  type OHLCDataPoint,
  PatternArea,
  PatternLines,
  PieCenter,
  PieChart,
  type PieData,
  PieSlice,
  ProfitLossLegend,
  ProfitLossLegendHoverProvider,
  ProfitLossLine,
  profitLossColor,
  RadarArea,
  RadarAxis,
  RadarChart,
  type RadarData,
  RadarGrid,
  RadarLabels,
  type RadarMetric,
  RadialGradient,
  Ring,
  RingCenter,
  RingChart,
  type RingData,
  resolveProfitLossTooltipLabel,
  SankeyChart,
  SankeyLink,
  SankeyNode,
  SankeyTooltip,
  Scatter,
  ScatterChart,
  SegmentBackground,
  SegmentLineFrom,
  SegmentLineTo,
  SeriesBar,
  useChart,
  XAxis,
  YAxis,
} from "@bklitui/ui/charts";
import {
  curveBasis,
  curveCatmullRom,
  curveLinear,
  curveMonotoneX,
  curveNatural,
  curveStep,
} from "@visx/curve";
import { DynamicCodeBlock } from "fumadocs-ui/components/dynamic-codeblock";
import { motion, useSpring } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ChartExamplePreviewFrame,
  type ChartExamplePreviewLayout,
  chartExampleCardClassName,
  chartExampleGaugeClassName,
  chartExampleGaugeShellClassName,
  chartExampleRadialShellClassName,
  getChartExampleContentPaddingClassName,
} from "@/components/charts/chart-example-preview";
import { CopyButton } from "@/components/copy-button";
import {
  PROFIT_LOSS_DATA_KEY,
  profitLossLineDocsData,
} from "@/components/docs/profit-loss-line-docs-data";
import { useWorldDataStandalone } from "@/components/docs/use-world-data";
import { HorizontalScrollArea } from "@/components/horizontal-scroll-area";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { createChartExamplePreview } from "@/lib/chart-example-preview";
import { codeThemes } from "@/lib/code-theme";
import {
  composedDemoData,
  composedStackedData,
  composedTriSeriesData,
} from "@/lib/composed-demo-data";
import { cn } from "@/lib/utils";
import {
  weeklyVisitorsDashFromIndex,
  weeklyVisitorsData,
} from "@/lib/weekly-visitors-demo-data";

/** tailwind fuchsia-400 — patterned SeriesBar stroke in composed pattern demo */
const COMPOSED_PATTERN_FUCHSIA = "#e879f9";

/** Smoother path through dense daily points (hero + docs preview revenue / runRate). */
const composedHeroSmoothCurve = curveCatmullRom.alpha(0.42);

/** tailwind lime-300, amber-300, red-500 — composed “accent” gallery demo */
const COMPOSED_ACCENT_LIME = "#bef264";
const COMPOSED_ACCENT_AMBER = "#fcd34d";
const COMPOSED_ACCENT_RED = "#ef4444";

// ---------------------------------------------------------------------------
// Shared data
// ---------------------------------------------------------------------------

const areaData = [
  { date: new Date(2024, 0, 1), desktop: 186, mobile: 80 },
  { date: new Date(2024, 1, 1), desktop: 305, mobile: 200 },
  { date: new Date(2024, 2, 1), desktop: 237, mobile: 120 },
  { date: new Date(2024, 3, 1), desktop: 73, mobile: 190 },
  { date: new Date(2024, 4, 1), desktop: 209, mobile: 130 },
  { date: new Date(2024, 5, 1), desktop: 214, mobile: 140 },
];

const lineData = [
  { date: new Date(2024, 0, 1), desktop: 186 },
  { date: new Date(2024, 1, 1), desktop: 305 },
  { date: new Date(2024, 2, 1), desktop: 237 },
  { date: new Date(2024, 3, 1), desktop: 73 },
  { date: new Date(2024, 4, 1), desktop: 209 },
  { date: new Date(2024, 5, 1), desktop: 214 },
];

const multiLineData = [
  { date: new Date(2024, 0, 1), desktop: 186, mobile: 80 },
  { date: new Date(2024, 1, 1), desktop: 305, mobile: 200 },
  { date: new Date(2024, 2, 1), desktop: 237, mobile: 120 },
  { date: new Date(2024, 3, 1), desktop: 73, mobile: 190 },
  { date: new Date(2024, 4, 1), desktop: 209, mobile: 130 },
  { date: new Date(2024, 5, 1), desktop: 214, mobile: 140 },
];

/** Room for Y-axis tick labels on the left; default right margin. */
const chartMarginLeftYAxis = {
  top: 8,
  right: 8,
  bottom: 40,
  left: 56,
} as const;

/** Biaxial charts with labels on both sides. */
const chartMarginBiaxialYAxis = {
  top: 8,
  right: 56,
  bottom: 40,
  left: 56,
} as const;

const weeklyVisitorsCast = weeklyVisitorsData as unknown as Record<
  string,
  unknown
>[];

/** 24 months — desktop vs mobile for scatter hero and gallery examples */
const scatterMultiSeriesData = Array.from({ length: 24 }, (_, i) => ({
  date: new Date(2023, i, 1),
  desktop: Math.floor(140 + Math.sin(i / 3) * 90 + ((i * 11) % 40)),
  mobile: Math.floor(70 + Math.cos(i / 2.5) * 55 + ((i * 7) % 35)),
}));

const scatterChartDataSnippet = `const chartData = Array.from({ length: 24 }, (_, i) => ({
  date: new Date(2023, i, 1),
  desktop: Math.floor(140 + Math.sin(i / 3) * 90 + ((i * 11) % 40)),
  mobile: Math.floor(70 + Math.cos(i / 2.5) * 55 + ((i * 7) % 35)),
}));`;

const lineMarkers: ChartMarker[] = [
  {
    date: new Date(2024, 2, 1),
    icon: "🚀",
    title: "v2.0 Launch",
    description: "Major release with new features",
  },
  {
    date: new Date(2024, 4, 1),
    icon: "📈",
    title: "Marketing Push",
    description: "Started new ad campaign",
  },
];

// Candlestick OHLC data (~30 days)
const candlestickOhlcData: OHLCDataPoint[] = (() => {
  const points: OHLCDataPoint[] = [];
  const days = 30;
  let open = 100;
  const base = new Date(2024, 0, 1).getTime();
  for (let i = 0; i < days; i++) {
    const date = new Date(base + i * 24 * 60 * 60 * 1000);
    const volatility = 1.5 + Math.random() * 1.5;
    const drift = (Math.random() - 0.48) * volatility;
    const high = open + Math.abs(drift) * (1.5 + Math.random());
    const low = open - Math.abs(drift) * (1.5 + Math.random());
    const close = low + Math.random() * (high - low);
    points.push({ date, open, high, low, close });
    open = close;
  }
  return points;
})();

function CandlestickTooltipContent({
  point,
}: {
  point: Record<string, unknown>;
  index: number;
}) {
  const date = point.date instanceof Date ? point.date : new Date();
  const open = (point.open as number) ?? 0;
  const high = (point.high as number) ?? 0;
  const low = (point.low as number) ?? 0;
  const close = (point.close as number) ?? 0;
  const fmt = (v: number) => `$${v.toFixed(2)}`;
  return (
    <div className="px-3 py-2.5">
      <div className="mb-1.5 font-medium text-chart-tooltip-foreground text-xs opacity-60">
        {date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
      </div>
      <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-sm">
        <span className="text-chart-tooltip-muted">Open</span>
        <span className="text-chart-tooltip-foreground tabular-nums">
          {fmt(open)}
        </span>
        <span className="text-chart-tooltip-muted">High</span>
        <span className="text-emerald-600 tabular-nums dark:text-emerald-400">
          {fmt(high)}
        </span>
        <span className="text-chart-tooltip-muted">Low</span>
        <span className="text-red-600 tabular-nums dark:text-red-400">
          {fmt(low)}
        </span>
        <span className="text-chart-tooltip-muted">Close</span>
        <span className="text-chart-tooltip-foreground tabular-nums">
          {fmt(close)}
        </span>
      </div>
    </div>
  );
}

// Live line chart: minimal hook for streaming demo data
function useLiveData(
  initialPrice: number,
  intervalMs: number,
  paused = false
): { data: LiveLinePoint[]; value: number } {
  const [data, setData] = useState<LiveLinePoint[]>([]);
  const [value, setValue] = useState(initialPrice);
  const priceRef = useRef(initialPrice);
  const momentumRef = useRef(0);
  const pausedRef = useRef(paused);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    const nowSec = Date.now() / 1000;
    const seed: LiveLinePoint[] = [];
    let p = initialPrice;
    let mom = 0;
    for (let i = 40; i > 0; i--) {
      mom = mom * 0.92 + (Math.random() - 0.48) * 0.012;
      p *= 1 + mom;
      p = Math.max(p, 1);
      seed.push({
        time: nowSec - i * (intervalMs / 1000),
        value: Math.round(p * 100) / 100,
      });
    }
    priceRef.current = p;
    momentumRef.current = mom;
    setData(seed);
    setValue(p);
  }, [initialPrice, intervalMs]);

  useEffect(() => {
    const id = setInterval(() => {
      if (pausedRef.current) {
        return;
      }
      momentumRef.current =
        momentumRef.current * 0.88 + (Math.random() - 0.48) * 0.008;
      momentumRef.current *= 0.995;
      priceRef.current *= 1 + momentumRef.current;
      priceRef.current = Math.max(priceRef.current, 1);
      const rounded = Math.round(priceRef.current * 100) / 100;
      setData((prev) => {
        const cutoff = Date.now() / 1000 - 120;
        return [
          ...prev.filter((p) => p.time >= cutoff),
          { time: Date.now() / 1000, value: rounded },
        ];
      });
      setValue(rounded);
    }, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return { data, value };
}

const barData = [
  { month: "Jan", desktop: 186 },
  { month: "Feb", desktop: 305 },
  { month: "Mar", desktop: 237 },
  { month: "Apr", desktop: 73 },
  { month: "May", desktop: 209 },
  { month: "Jun", desktop: 214 },
];

const barStackedData = [
  { month: "Jan", desktop: 4000, mobile: 2400 },
  { month: "Feb", desktop: 5000, mobile: 3000 },
  { month: "Mar", desktop: 3500, mobile: 2800 },
  { month: "Apr", desktop: 4200, mobile: 3200 },
  { month: "May", desktop: 3800, mobile: 2600 },
  { month: "Jun", desktop: 5500, mobile: 3800 },
];

const barHorizontalData = [
  { browser: "Chrome", users: 275 },
  { browser: "Safari", users: 200 },
  { browser: "Firefox", users: 187 },
  { browser: "Edge", users: 173 },
  { browser: "Other", users: 90 },
];

const barDailyData = Array.from({ length: 60 }, (_, i) => {
  const date = new Date(2024, 0, 1);
  date.setDate(date.getDate() + i);
  const baseValue = 50 + Math.sin(i / 7) * 30;
  const variation = ((i * 7) % 37) - 18;
  return {
    day: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    value: Math.floor(baseValue + variation),
  };
});

const barRevenueData = [
  { month: "Jan", revenue: 12_000 },
  { month: "Feb", revenue: 15_500 },
  { month: "Mar", revenue: 11_000 },
  { month: "Apr", revenue: 18_500 },
  { month: "May", revenue: 16_800 },
  { month: "Jun", revenue: 21_200 },
];

const pieData: PieData[] = [
  { label: "Chrome", value: 275, color: "var(--chart-1)" },
  { label: "Safari", value: 200, color: "var(--chart-2)" },
  { label: "Firefox", value: 187, color: "var(--chart-3)" },
  { label: "Edge", value: 173, color: "var(--chart-4)" },
  { label: "Other", value: 90, color: "var(--chart-5)" },
];

const radarMetrics5: RadarMetric[] = [
  { key: "speed", label: "Speed" },
  { key: "reliability", label: "Reliability" },
  { key: "comfort", label: "Comfort" },
  { key: "efficiency", label: "Efficiency" },
  { key: "safety", label: "Safety" },
];

const radarMetrics3: RadarMetric[] = [
  { key: "attack", label: "Attack" },
  { key: "defense", label: "Defense" },
  { key: "magic", label: "Magic" },
];

const radarMetrics6: RadarMetric[] = [
  { key: "js", label: "JS" },
  { key: "ts", label: "TS" },
  { key: "react", label: "React" },
  { key: "css", label: "CSS" },
  { key: "node", label: "Node" },
  { key: "sql", label: "SQL" },
];

const radarDataDual: RadarData[] = [
  {
    label: "Model A",
    color: "var(--chart-1)",
    values: {
      speed: 85,
      reliability: 78,
      comfort: 92,
      efficiency: 70,
      safety: 88,
    },
  },
  {
    label: "Model B",
    color: "var(--chart-3)",
    values: {
      speed: 72,
      reliability: 90,
      comfort: 65,
      efficiency: 88,
      safety: 75,
    },
  },
];

const radarDataTriangle: RadarData[] = [
  {
    label: "Warrior",
    color: "var(--chart-1)",
    values: { attack: 90, defense: 75, magic: 30 },
  },
  {
    label: "Mage",
    color: "var(--chart-4)",
    values: { attack: 35, defense: 40, magic: 95 },
  },
];

const radarDataSkills: RadarData[] = [
  {
    label: "Senior",
    color: "var(--chart-1)",
    values: { js: 95, ts: 90, react: 88, css: 75, node: 82, sql: 70 },
  },
  {
    label: "Junior",
    color: "var(--chart-3)",
    values: { js: 70, ts: 50, react: 65, css: 80, node: 40, sql: 35 },
  },
];

const radarDataLopsided: RadarData[] = [
  {
    label: "Product",
    color: "var(--chart-2)",
    values: {
      speed: 95,
      reliability: 40,
      comfort: 20,
      efficiency: 90,
      safety: 55,
    },
  },
];

const ringData: RingData[] = [
  { label: "Organic", value: 4250, maxValue: 5000, color: "var(--chart-1)" },
  { label: "Paid", value: 3120, maxValue: 5000, color: "var(--chart-2)" },
  { label: "Email", value: 2100, maxValue: 5000, color: "var(--chart-3)" },
  { label: "Social", value: 1580, maxValue: 5000, color: "var(--chart-4)" },
];

const ringFinanceData: RingData[] = [
  {
    label: "Revenue",
    value: 85_000,
    maxValue: 100_000,
    color: "var(--chart-1)",
  },
  {
    label: "Expenses",
    value: 62_000,
    maxValue: 100_000,
    color: "var(--chart-2)",
  },
  {
    label: "Profit",
    value: 23_000,
    maxValue: 100_000,
    color: "var(--chart-3)",
  },
];

const ringGoalData: RingData[] = [
  { label: "Steps", value: 8200, maxValue: 10_000, color: "#0ea5e9" },
  { label: "Calories", value: 1800, maxValue: 2500, color: "#a855f7" },
  { label: "Distance", value: 4.2, maxValue: 5, color: "#10b981" },
];

const sankeySimple = {
  nodes: [
    { name: "A", category: "source" as const },
    { name: "B", category: "source" as const },
    { name: "X", category: "landing" as const },
    { name: "Y", category: "landing" as const },
    { name: "Z", category: "outcome" as const },
  ],
  links: [
    { source: 0, target: 2, value: 40 },
    { source: 0, target: 3, value: 20 },
    { source: 1, target: 2, value: 30 },
    { source: 1, target: 3, value: 35 },
    { source: 2, target: 4, value: 70 },
    { source: 3, target: 4, value: 55 },
  ],
};

const sankeyAnalytics = {
  nodes: [
    { name: "Organic", category: "source" as const },
    { name: "Paid", category: "source" as const },
    { name: "Social", category: "source" as const },
    { name: "Direct", category: "source" as const },
    { name: "Blog", category: "landing" as const },
    { name: "Pricing", category: "landing" as const },
    { name: "Product", category: "landing" as const },
    { name: "Converted", category: "outcome" as const },
    { name: "Bounced", category: "outcome" as const },
  ],
  links: [
    { source: 0, target: 4, value: 4200 },
    { source: 0, target: 5, value: 1500 },
    { source: 1, target: 5, value: 3100 },
    { source: 1, target: 6, value: 2200 },
    { source: 2, target: 4, value: 2800 },
    { source: 2, target: 6, value: 600 },
    { source: 3, target: 5, value: 1800 },
    { source: 3, target: 6, value: 1100 },
    { source: 4, target: 7, value: 3500 },
    { source: 4, target: 8, value: 3500 },
    { source: 5, target: 7, value: 4200 },
    { source: 5, target: 8, value: 2200 },
    { source: 6, target: 7, value: 2500 },
    { source: 6, target: 8, value: 1400 },
  ],
};

// ---------------------------------------------------------------------------
// Example card wrapper
// ---------------------------------------------------------------------------

interface ChartExampleCardProps {
  title: string;
  description: string;
  code: string;
  data?: string;
  footer?: string;
  previewLayout?: ChartExamplePreviewLayout;
  previewRole?: "hero" | "example";
  children: ReactNode;
}

function ChartExampleCard({
  title,
  description,
  code,
  data,
  footer = "Trending up by 5.2% this month",
  previewLayout = "cartesian",
  previewRole = "example",
  children,
}: ChartExampleCardProps) {
  const fullCode = data ? `${data}\n\n${code}` : code;
  const contentPaddingClassName =
    getChartExampleContentPaddingClassName(previewLayout);

  return (
    <Card className={chartExampleCardClassName}>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <CardTitle className="text-base">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <CopyButton text={fullCode} />
            <Sheet>
              <SheetTrigger className="shrink-0 rounded-md border px-2.5 py-1 font-medium text-muted-foreground text-xs transition-colors hover:bg-muted hover:text-foreground">
                View Code
              </SheetTrigger>
              <SheetContent className="overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>{title}</SheetTitle>
                  <SheetDescription>{description}</SheetDescription>
                </SheetHeader>
                <div className="space-y-4 px-6 pb-6">
                  <div className="overflow-hidden rounded-lg border [&_figure]:my-0! [&_pre]:my-0!">
                    <DynamicCodeBlock
                      code={code}
                      lang="tsx"
                      options={{ themes: codeThemes }}
                    />
                  </div>
                  {data && (
                    <>
                      <p className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
                        Data
                      </p>
                      <div className="overflow-hidden rounded-lg border [&_figure]:my-0! [&_pre]:my-0!">
                        <DynamicCodeBlock
                          code={data}
                          lang="tsx"
                          options={{ themes: codeThemes }}
                        />
                      </div>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </CardHeader>
      <CardContent className={contentPaddingClassName}>
        <ChartExamplePreviewFrame layout={previewLayout} role={previewRole}>
          {children}
        </ChartExamplePreviewFrame>
      </CardContent>
      <CardFooter>
        <p className="text-muted-foreground text-xs">{footer}</p>
      </CardFooter>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Bar line indicator (animated line that rises to bar top on hover)
// ---------------------------------------------------------------------------

function AnimatedBarLine({
  barX,
  barTopY,
  barBottomY,
  width,
  isHovered,
}: {
  barX: number;
  barTopY: number;
  barBottomY: number;
  width: number;
  isHovered: boolean;
}) {
  const animatedY = useSpring(barBottomY, { stiffness: 300, damping: 30 });
  const animatedOpacity = useSpring(0, { stiffness: 300, damping: 30 });

  useEffect(() => {
    animatedY.set(isHovered ? barTopY : barBottomY);
    animatedOpacity.set(isHovered ? 1 : 0);
  }, [isHovered, barTopY, barBottomY, animatedY, animatedOpacity]);

  return (
    <motion.rect
      fill="var(--chart-indicator-color)"
      height={2}
      style={{ opacity: animatedOpacity, y: animatedY }}
      width={width}
      x={barX}
    />
  );
}

function BarLineIndicator({
  data,
  valueKey,
  xKey,
}: {
  data: Record<string, unknown>[];
  valueKey: string;
  xKey: string;
}) {
  const {
    barScale,
    bandWidth,
    innerHeight,
    margin,
    containerRef,
    hoveredBarIndex,
    yScale,
  } = useChart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const container = containerRef.current;
  if (!(mounted && container && bandWidth && barScale)) {
    return null;
  }

  const { createPortal } = require("react-dom") as typeof import("react-dom");

  return createPortal(
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-50"
      height="100%"
      width="100%"
    >
      <g transform={`translate(${margin.left},${margin.top})`}>
        {data.map((d, i) => {
          const xVal = d[xKey];
          const barX = barScale(String(xVal)) ?? 0;
          const yVal = d[valueKey];
          const barTopY =
            typeof yVal === "number"
              ? (yScale(yVal) ?? innerHeight)
              : innerHeight;

          return (
            <AnimatedBarLine
              barBottomY={innerHeight}
              barTopY={barTopY}
              barX={barX}
              isHovered={hoveredBarIndex === i}
              key={String(xVal)}
              width={bandWidth}
            />
          );
        })}
      </g>
    </svg>,
    container
  );
}

// ---------------------------------------------------------------------------
// Example definitions per chart type
// ---------------------------------------------------------------------------

interface ChartExample {
  title: string;
  description: string;
  code: string;
  data?: string;
  footer?: string;
  render: () => ReactNode;
}

const AreaExampleChart = createChartExamplePreview(AreaChart);
const BarExampleChart = createChartExamplePreview(BarChart);
const LineExampleChart = createChartExamplePreview(LineChart);
const LineChartLoadingExample = createChartExamplePreview(LineChartLoading);
const ComposedExampleChart = createChartExamplePreview(ComposedChart);
const CandlestickExampleChart = createChartExamplePreview(CandlestickChart);
const LiveLineExampleChart = createChartExamplePreview(LiveLineChart);
const ChoroplethExampleChart = createChartExamplePreview(ChoroplethChart);
const SankeyExampleChart = createChartExamplePreview(SankeyChart);
const ScatterExampleChart = createChartExamplePreview(ScatterChart);

function ProfitLossLineExample({
  legendHoveredIndex,
  onLegendHoverChange,
}: {
  legendHoveredIndex: number | null;
  onLegendHoverChange: (index: number | null) => void;
}) {
  return (
    <div className="flex w-full flex-col gap-2">
      <LineExampleChart data={profitLossLineDocsData}>
        <Grid
          highlightRowStroke="var(--foreground)"
          highlightRowStrokeOpacity={0.35}
          highlightRowValues={[0]}
          horizontal
        />
        <Line
          curve={curveLinear}
          dataKey={PROFIT_LOSS_DATA_KEY}
          fadeEdges={false}
          showHighlight={false}
          stroke="transparent"
          strokeWidth={0}
        />
        <ProfitLossLegendHoverProvider hoveredIndex={legendHoveredIndex}>
          <ProfitLossLine dataKey={PROFIT_LOSS_DATA_KEY} />
        </ProfitLossLegendHoverProvider>
        <XAxis />
        <ChartTooltip
          indicatorColor={(point) =>
            profitLossColor((point[PROFIT_LOSS_DATA_KEY] as number) ?? 0)
          }
          rows={(point) => {
            const value = (point[PROFIT_LOSS_DATA_KEY] as number) ?? 0;
            return [
              {
                color: profitLossColor(value),
                label: resolveProfitLossTooltipLabel(""),
                value,
              },
            ];
          }}
        />
      </LineExampleChart>
      <ProfitLossLegend
        align="center"
        hoveredIndex={legendHoveredIndex}
        onHoverChange={onLegendHoverChange}
      />
    </div>
  );
}

function ProfitLossLineExampleWithState() {
  const [legendHoveredIndex, setLegendHoveredIndex] = useState<number | null>(
    null
  );

  return (
    <ProfitLossLineExample
      legendHoveredIndex={legendHoveredIndex}
      onLegendHoverChange={setLegendHoveredIndex}
    />
  );
}

function makeAreaExamples(): ChartExample[] {
  return [
    {
      title: "Area Chart",
      description: "Default area with gradient fill and smooth curve",
      code: `<AreaChart data={chartData}>
  <Grid horizontal />
  <Area dataKey="desktop" fillOpacity={0.3} strokeWidth={2} />
  <XAxis />
  <ChartTooltip />
</AreaChart>`,
      render: () => (
        <AreaExampleChart data={areaData}>
          <Grid horizontal />
          <Area dataKey="desktop" fillOpacity={0.3} strokeWidth={2} />
          <XAxis />
          <ChartTooltip />
        </AreaExampleChart>
      ),
    },
    {
      title: "Area Chart - Step",
      description: "Discrete step interpolation between points",
      code: `import { curveStep } from "@visx/curve";

<AreaChart data={chartData}>
  <Grid horizontal />
  <Area dataKey="desktop" curve={curveStep} fillOpacity={0.3} />
  <XAxis />
  <ChartTooltip />
</AreaChart>`,
      render: () => (
        <AreaExampleChart data={areaData}>
          <Grid horizontal />
          <Area curve={curveStep} dataKey="desktop" fillOpacity={0.3} />
          <XAxis />
          <ChartTooltip />
        </AreaExampleChart>
      ),
    },
    {
      title: "Area Chart - Stacked",
      description: "Layered areas comparing desktop and mobile",
      code: `<AreaChart data={chartData}>
  <Grid horizontal />
  <Area
    dataKey="desktop"
    fill="var(--chart-line-primary)"
    fillOpacity={0.3}
  />
  <Area
    dataKey="mobile"
    fill="var(--chart-line-secondary)"
    fillOpacity={0.3}
  />
  <XAxis />
  <ChartTooltip />
</AreaChart>`,
      render: () => (
        <AreaExampleChart data={areaData}>
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
        </AreaExampleChart>
      ),
    },
    {
      title: "Area Chart - Gradient",
      description: "Solid fill with gradientToOpacity control",
      code: `<AreaChart data={chartData}>
  <Area
    dataKey="desktop"
    fillOpacity={0.5}
    gradientToOpacity={0.05}
    strokeWidth={2}
  />
  <ChartTooltip />
</AreaChart>`,
      render: () => (
        <AreaExampleChart data={areaData}>
          <Area
            dataKey="desktop"
            fillOpacity={0.5}
            gradientToOpacity={0.05}
            strokeWidth={2}
          />
          <ChartTooltip />
        </AreaExampleChart>
      ),
    },
    {
      title: "Area Chart - No Stroke",
      description: "Softer look with the stroke line hidden",
      code: `<AreaChart data={chartData}>
  <Area
    dataKey="desktop"
    fillOpacity={0.5}
    showLine={false}
  />
  <XAxis />
  <ChartTooltip />
</AreaChart>`,
      render: () => (
        <AreaExampleChart data={areaData}>
          <Area dataKey="desktop" fillOpacity={0.5} showLine={false} />
          <XAxis />
          <ChartTooltip />
        </AreaExampleChart>
      ),
    },
    {
      title: "Area Chart - Fade Edges",
      description: "Area fill fades at the left and right edges",
      code: `<AreaChart data={chartData}>
  <Grid horizontal />
  <Area
    dataKey="desktop"
    fadeEdges
    fillOpacity={0.3}
    strokeWidth={2}
  />
  <XAxis />
  <ChartTooltip />
</AreaChart>`,
      render: () => (
        <AreaExampleChart data={areaData}>
          <Grid horizontal />
          <Area dataKey="desktop" fadeEdges fillOpacity={0.3} strokeWidth={2} />
          <XAxis />
          <ChartTooltip />
        </AreaExampleChart>
      ),
    },
    {
      title: "Area Chart - Segment Selection",
      description: "Click and drag to select a range",
      code: `<AreaChart data={chartData}>
  <Grid horizontal />
  <Area dataKey="desktop" fillOpacity={0.3} strokeWidth={2} />
  <SegmentBackground />
  <SegmentLineFrom />
  <SegmentLineTo />
  <XAxis />
  <ChartTooltip />
</AreaChart>`,
      footer: "Click and drag on the chart to select a segment",
      render: () => (
        <AreaExampleChart data={areaData}>
          <Grid horizontal />
          <Area dataKey="desktop" fillOpacity={0.3} strokeWidth={2} />
          <SegmentBackground />
          <SegmentLineFrom />
          <SegmentLineTo />
          <XAxis />
          <ChartTooltip />
        </AreaExampleChart>
      ),
    },
    {
      title: "Area Chart - Pattern",
      description: "Diagonal line pattern fill instead of gradient",
      code: `<AreaChart data={chartData}>
  <PatternLines
    height={6}
    id="area-pattern"
    orientation={["diagonal"]}
    stroke="var(--chart-1)"
    strokeWidth={1}
    width={6}
  />
  <PatternArea dataKey="desktop" fill="url(#area-pattern)" />
  <Area dataKey="desktop" fillOpacity={0} strokeWidth={2} />
  <XAxis />
  <ChartTooltip />
</AreaChart>`,
      render: () => (
        <AreaExampleChart data={areaData}>
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
        </AreaExampleChart>
      ),
    },
    {
      title: "Area Chart - Series Markers",
      description:
        "Scatter-style ring markers at each point — same styling as Scatter",
      code: `<AreaChart data={chartData} xDataKey="date">
  <Grid horizontal />
  <Area
    dataKey="visitors"
    fill="var(--chart-line-primary)"
    fillOpacity={0.35}
    showMarkers
    markers={{ radius: 5, ringGap: 2, strokeWidth: 2 }}
  />
  <XAxis tickMode="data" />
  <ChartTooltip />
</AreaChart>`,
      render: () => (
        <AreaExampleChart data={weeklyVisitorsCast} xDataKey="date">
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
        </AreaExampleChart>
      ),
    },
    {
      title: "Area Chart - Dashed Tail",
      description:
        "Solid stroke through yesterday, dashed projection for the in-progress day",
      code: `<AreaChart data={chartData} xDataKey="date">
  <Grid horizontal />
  <Area
    dataKey="visitors"
    dashArray="6,4"
    dashFromIndex={5}
    fill="var(--chart-line-primary)"
    fillOpacity={0.35}
    stroke="var(--chart-line-primary)"
  />
  <XAxis tickMode="data" />
  <ChartTooltip />
</AreaChart>`,
      footer:
        "dashFromIndex is inclusive — the stroke dashes from that data row through the end",
      render: () => (
        <AreaExampleChart data={weeklyVisitorsCast} xDataKey="date">
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
        </AreaExampleChart>
      ),
    },
    {
      title: "Area Chart - Left Y axis",
      description:
        "Both series share the left scale with explicit Y-axis labels",
      code: `<AreaChart data={chartData} margin={{ top: 8, right: 8, bottom: 40, left: 56 }}>
  <Grid horizontal />
  <Area dataKey="desktop" fillOpacity={0.3} strokeWidth={2} />
  <Area dataKey="mobile" fill="var(--chart-2)" fillOpacity={0.3} strokeWidth={2} />
  <YAxis yAxisId="left" />
  <XAxis />
  <ChartTooltip />
</AreaChart>`,
      render: () => (
        <AreaExampleChart data={areaData} margin={chartMarginLeftYAxis}>
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
        </AreaExampleChart>
      ),
    },
    {
      title: "Area Chart - Left and right Y axes",
      description: "Independent left and right scales (biaxial)",
      code: `<AreaChart data={chartData} margin={{ top: 8, right: 56, bottom: 40, left: 56 }}>
  <Grid horizontal />
  <Area dataKey="desktop" yAxisId="left" fillOpacity={0.3} strokeWidth={2} />
  <Area dataKey="mobile" yAxisId="right" fill="var(--chart-2)" fillOpacity={0.3} strokeWidth={2} />
  <YAxis yAxisId="left" />
  <YAxis yAxisId="right" orientation="right" />
  <XAxis />
  <ChartTooltip />
</AreaChart>`,
      render: () => (
        <AreaExampleChart data={areaData} margin={chartMarginBiaxialYAxis}>
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
        </AreaExampleChart>
      ),
    },
  ];
}

function makeBarExamples(): ChartExample[] {
  return [
    {
      title: "Bar Chart",
      description: "Default vertical bar chart with rounded caps",
      code: `<BarChart margin={{ top: 8, right: 8, bottom: 40, left: 8 }} data={chartData} xDataKey="month">
  <Grid horizontal />
  <Bar dataKey="desktop" lineCap="round" />
  <BarXAxis />
  <ChartTooltip />
</BarChart>`,
      render: () => (
        <BarExampleChart data={barData} xDataKey="month">
          <Grid horizontal />
          <Bar dataKey="desktop" lineCap="round" />
          <BarXAxis />
          <ChartTooltip />
        </BarExampleChart>
      ),
    },
    {
      title: "Bar Chart - Multiple Series",
      description: "Grouped bars comparing two metrics",
      code: `<BarChart margin={{ top: 8, right: 8, bottom: 40, left: 8 }} data={chartData} xDataKey="month">
  <Grid horizontal />
  <Bar dataKey="desktop" fill="var(--chart-1)" lineCap="round" />
  <Bar dataKey="mobile" fill="var(--chart-3)" lineCap="round" />
  <BarXAxis />
  <ChartTooltip />
</BarChart>`,
      render: () => (
        <BarExampleChart data={barStackedData} xDataKey="month">
          <Grid horizontal />
          <Bar dataKey="desktop" fill="var(--chart-1)" lineCap="round" />
          <Bar dataKey="mobile" fill="var(--chart-3)" lineCap="round" />
          <BarXAxis />
          <ChartTooltip />
        </BarExampleChart>
      ),
    },
    {
      title: "Bar Chart - Stacked",
      description: "Stacked bars with gap between segments",
      code: `<BarChart margin={{ top: 8, right: 8, bottom: 40, left: 8 }} data={chartData} xDataKey="month" stacked stackGap={3}>
  <Grid horizontal />
  <Bar dataKey="desktop" fill="var(--chart-1)" lineCap="butt" stackGap={3} />
  <Bar dataKey="mobile" fill="var(--chart-3)" lineCap="butt" stackGap={3} />
  <BarXAxis />
  <ChartTooltip />
</BarChart>`,
      render: () => (
        <BarExampleChart
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
        </BarExampleChart>
      ),
    },
    {
      title: "Bar Chart - Horizontal",
      description: "Horizontal orientation with y-axis labels",
      code: `<BarChart
  data={chartData}
  xDataKey="browser"
  orientation="horizontal"
  margin={{ top: 8, right: 8, bottom: 40, left: 80 }}
  aspectRatio="4 / 3"
>
  <Grid horizontal={false} vertical fadeVertical />
  <Bar dataKey="users" lineCap={4} />
  <BarYAxis />
  <ChartTooltip showCrosshair={false} />
</BarChart>`,
      render: () => (
        <BarExampleChart
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
        </BarExampleChart>
      ),
    },
    {
      title: "Bar Chart - Dense Data",
      description: "60 days of data with narrow gaps",
      code: `<BarChart margin={{ top: 8, right: 8, bottom: 40, left: 8 }} data={dailyData} xDataKey="day" barGap={0.1}>
  <Grid horizontal />
  <Bar dataKey="value" lineCap="butt" />
  <BarXAxis maxLabels={6} />
  <ChartTooltip />
</BarChart>`,
      render: () => (
        <BarExampleChart barGap={0.1} data={barDailyData} xDataKey="day">
          <Grid horizontal />
          <Bar dataKey="value" lineCap="butt" />
          <BarXAxis maxLabels={6} />
          <ChartTooltip />
        </BarExampleChart>
      ),
    },
    {
      title: "Bar Chart - Gradient",
      description: "Linear gradient fill from blue to purple",
      code: `<BarChart margin={{ top: 8, right: 8, bottom: 40, left: 8 }} data={chartData} xDataKey="month">
  <LinearGradient
    from="hsl(217, 91%, 60%)"
    id="barGradient"
    to="hsl(280, 87%, 65%)"
  />
  <Grid horizontal />
  <Bar
    dataKey="revenue"
    fill="url(#barGradient)"
    lineCap={4}
    stroke="hsl(217, 91%, 60%)"
  />
  <BarXAxis />
  <ChartTooltip />
</BarChart>`,
      render: () => (
        <BarExampleChart data={barRevenueData} xDataKey="month">
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
        </BarExampleChart>
      ),
    },
    {
      title: "Bar Chart - Pattern",
      description: "Diagonal line pattern fill",
      code: `<BarChart margin={{ top: 8, right: 8, bottom: 40, left: 8 }} data={chartData} xDataKey="month">
  <PatternLines
    height={8}
    id="barPattern"
    orientation={["diagonal"]}
    stroke="var(--chart-1)"
    strokeWidth={2}
    width={8}
  />
  <Grid horizontal />
  <Bar
    dataKey="revenue"
    fill="url(#barPattern)"
    lineCap={4}
    stroke="var(--chart-1)"
  />
  <BarXAxis />
  <ChartTooltip />
</BarChart>`,
      render: () => (
        <BarExampleChart data={barRevenueData} xDataKey="month">
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
        </BarExampleChart>
      ),
    },
    {
      title: "Bar Chart - No Gap",
      description: "Zero gap with gradient and animated line indicator",
      code: `<BarChart margin={{ top: 8, right: 8, bottom: 40, left: 8 }} data={chartData} xDataKey="month" barGap={0}>
  <LinearGradient
    from="var(--chart-3)"
    id="noGapGradient"
    to="transparent"
  />
  <Grid horizontal />
  <Bar
    dataKey="revenue"
    fill="url(#noGapGradient)"
    lineCap="butt"
    stroke="var(--chart-3)"
  />
  <BarXAxis />
  <ChartTooltip showCrosshair={false} showDots={false} />
  <BarLineIndicator data={chartData} valueKey="revenue" xKey="month" />
</BarChart>`,
      footer: "Hover over bars to see the animated line indicator",
      render: () => (
        <BarExampleChart barGap={0} data={barRevenueData} xDataKey="month">
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
        </BarExampleChart>
      ),
    },
    {
      title: "Bar Chart - Custom Tooltip",
      description: "Formatted currency values in tooltip",
      code: `<BarChart margin={{ top: 8, right: 8, bottom: 40, left: 8 }} data={chartData} xDataKey="month">
  <Grid horizontal />
  <Bar dataKey="revenue" lineCap="round" />
  <BarXAxis />
  <ChartTooltip
    rows={(point) => [
      {
        color: "var(--chart-line-primary)",
        label: "Revenue",
        value: \`$\${(point.revenue as number)?.toLocaleString()}\`,
      },
    ]}
  />
</BarChart>`,
      render: () => (
        <BarExampleChart data={barRevenueData} xDataKey="month">
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
        </BarExampleChart>
      ),
    },
    {
      title: "Bar Chart - Left Y axis",
      description:
        "Grouped vertical bars with a single left value scale and Y-axis labels",
      code: `<BarChart data={chartData} xDataKey="month" margin={{ top: 8, right: 8, bottom: 40, left: 56 }}>
  <Grid horizontal />
  <Bar dataKey="desktop" lineCap="round" />
  <Bar dataKey="mobile" fill="var(--chart-3)" lineCap="round" />
  <YAxis yAxisId="left" />
  <BarXAxis />
  <ChartTooltip />
</BarChart>`,
      render: () => (
        <BarExampleChart
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
        </BarExampleChart>
      ),
    },
    {
      title: "Bar Chart - Left and right Y axes",
      description: "Independent left and right value scales (biaxial)",
      code: `<BarChart data={chartData} xDataKey="month" margin={{ top: 8, right: 56, bottom: 40, left: 56 }}>
  <Grid horizontal />
  <Bar dataKey="desktop" yAxisId="left" lineCap="round" />
  <Bar dataKey="mobile" yAxisId="right" fill="var(--chart-3)" lineCap="round" />
  <YAxis yAxisId="left" />
  <YAxis yAxisId="right" orientation="right" />
  <BarXAxis />
  <ChartTooltip />
</BarChart>`,
      render: () => (
        <BarExampleChart
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
        </BarExampleChart>
      ),
    },
  ];
}

function makeComposedExamples(): ChartExample[] {
  const dataCast = composedDemoData as unknown as Record<string, unknown>[];
  const stackedCast = composedStackedData as unknown as Record<
    string,
    unknown
  >[];
  const triCast = composedTriSeriesData as unknown as Record<string, unknown>[];

  return [
    {
      title: "Composed Chart — Bar + line",
      description:
        "30 daily points with rounded SeriesBar tops (`radius`) and a smoothed revenue line",
      code: `<ComposedChart margin={{ top: 8, right: 8, bottom: 40, left: 8 }} data={data} xDataKey="date" aspectRatio="3 / 2" barGap={0} maxBarSize={32}>
  <Grid horizontal />
  <SeriesBar dataKey="units" fill="var(--chart-3)" radius={5} />
  <Line dataKey="revenue" stroke="var(--chart-1)" />
  <ChartTooltip showCrosshair={false} />
  <XAxis numTicks={8} />
</ComposedChart>`,
      footer:
        'Dense time series: use default XAxis ticks (numTicks) so labels stay readable. Use tickMode="data" when you only have a few rows (e.g. one bar per month).',
      render: () => (
        <ComposedExampleChart
          aspectRatio="3 / 2"
          barGap={0}
          data={dataCast}
          maxBarSize={32}
          xDataKey="date"
        >
          <Grid horizontal />
          <SeriesBar dataKey="units" fill="var(--chart-3)" radius={5} />
          <Line dataKey="revenue" stroke="var(--chart-1)" />
          <ChartTooltip showCrosshair={false} />
          <XAxis numTicks={8} />
        </ComposedExampleChart>
      ),
    },
    {
      title: "Composed Chart — Lime / amber / red",
      description:
        "Fixed hex accents (tailwind lime-300, amber-300, red-500) with rounded bars",
      code: `<ComposedChart margin={{ top: 8, right: 8, bottom: 40, left: 8 }} data={data} aspectRatio="3 / 2" barGap={0} maxBarSize={30} xDataKey="date">
  <Grid horizontal />
  <Area dataKey="runRate" fill="#ef4444" fillOpacity={0.22} stroke="#ef4444" strokeWidth={1.5} />
  <SeriesBar dataKey="units" fill="#bef264" radius={6} stroke="#bef264" />
  <Line dataKey="revenue" stroke="#fcd34d" strokeWidth={2.5} />
  <ChartTooltip showCrosshair={false} />
  <XAxis numTicks={8} />
</ComposedChart>`,
      render: () => (
        <ComposedExampleChart
          aspectRatio="3 / 2"
          barGap={0}
          data={dataCast}
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
        </ComposedExampleChart>
      ),
    },
    {
      title: "Composed Chart — Stacked SeriesBar + line",
      description:
        "Two stack segments per day with the same 30-day timeline; stackGap={0} for flush stacks",
      code: `<ComposedChart margin={{ top: 8, right: 8, bottom: 40, left: 8 }} data={data} aspectRatio="3 / 2" stacked stackGap={0} barGap={0} maxBarSize={28}>
  <Grid horizontal />
  <SeriesBar dataKey="direct" fill="var(--chart-3)" />
  <SeriesBar dataKey="partner" fill="var(--chart-5)" />
  <Line dataKey="revenue" stroke="var(--chart-1)" />
  <ChartTooltip showCrosshair={false} />
  <XAxis numTicks={8} />
</ComposedChart>`,
      render: () => (
        <ComposedExampleChart
          aspectRatio="3 / 2"
          barGap={0}
          data={stackedCast}
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
        </ComposedExampleChart>
      ),
    },
    {
      title: "Composed Chart — Grouped bars, no gap",
      description:
        "Two SeriesBar series per day with barGap={0}; rounded tops on both bar series",
      code: `<ComposedChart margin={{ top: 8, right: 8, bottom: 40, left: 8 }} data={data} aspectRatio="3 / 2" barGap={0} maxBarSize={26}>
  <Grid horizontal />
  <SeriesBar dataKey="units" fill="var(--chart-3)" radius={4} />
  <SeriesBar dataKey="runRate" fill="var(--chart-5)" radius={4} />
  <Line dataKey="revenue" stroke="var(--chart-1)" />
  <ChartTooltip showCrosshair={false} />
  <XAxis numTicks={8} />
</ComposedChart>`,
      render: () => (
        <ComposedExampleChart
          aspectRatio="3 / 2"
          barGap={0}
          data={dataCast}
          maxBarSize={26}
          xDataKey="date"
        >
          <Grid horizontal />
          <SeriesBar dataKey="units" fill="var(--chart-3)" radius={4} />
          <SeriesBar dataKey="runRate" fill="var(--chart-5)" radius={4} />
          <Line dataKey="revenue" stroke="var(--chart-1)" />
          <ChartTooltip showCrosshair={false} />
          <XAxis numTicks={8} />
        </ComposedExampleChart>
      ),
    },
    {
      title: "Composed Chart — Pattern fills",
      description:
        "One SeriesBar with a fuchsia-400 diagonal pattern, one solid bar on theme colors; revenue line unchanged",
      code: `import { PatternLines } from "@bklitui/ui/charts";

<ComposedChart margin={{ top: 8, right: 8, bottom: 40, left: 8 }} data={data} aspectRatio="3 / 2" barGap={0} maxBarSize={22}>
  <PatternLines id="composed-pat-fuchsia" height={6} width={6} orientation={["diagonal"]} stroke="#e879f9" strokeWidth={1} />
  <Grid horizontal />
  <SeriesBar dataKey="units" fill="url(#composed-pat-fuchsia)" stroke="#e879f9" />
  <SeriesBar dataKey="runRate" fill="var(--chart-5)" />
  <Line dataKey="revenue" stroke="var(--chart-1)" />
  <ChartTooltip showCrosshair={false} />
  <XAxis numTicks={8} />
</ComposedChart>`,
      render: () => (
        <ComposedExampleChart
          aspectRatio="3 / 2"
          barGap={0}
          data={dataCast}
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
        </ComposedExampleChart>
      ),
    },
    {
      title: "Composed Chart — Bar + two lines",
      description:
        "Installs as daily columns (rounded) with desktop and mobile lines (30-day variation)",
      code: `<ComposedChart margin={{ top: 8, right: 8, bottom: 40, left: 8 }} data={data} aspectRatio="3 / 2" barGap={0} maxBarSize={20}>
  <Grid horizontal />
  <SeriesBar dataKey="installs" fill="var(--chart-3)" radius={5} />
  <Line dataKey="desktop" stroke="var(--chart-1)" />
  <Line dataKey="mobile" stroke="var(--chart-2)" />
  <ChartTooltip showCrosshair={false} />
  <XAxis numTicks={8} />
</ComposedChart>`,
      render: () => (
        <ComposedExampleChart
          aspectRatio="3 / 2"
          barGap={0}
          data={triCast}
          maxBarSize={20}
          xDataKey="date"
        >
          <Grid horizontal />
          <SeriesBar dataKey="installs" fill="var(--chart-3)" radius={5} />
          <Line dataKey="desktop" stroke="var(--chart-1)" />
          <Line dataKey="mobile" stroke="var(--chart-2)" />
          <ChartTooltip showCrosshair={false} />
          <XAxis numTicks={8} />
        </ComposedExampleChart>
      ),
    },
    {
      title: "Composed Chart — Markers & dashed tail",
      description:
        "Ring markers and a dashed projection on the run-rate line and area stroke",
      code: `<ComposedChart data={data} xDataKey="date" aspectRatio="3 / 2">
  <Grid horizontal />
  <SeriesBar dataKey="revenue" fill="var(--chart-1)" radius={4} />
  <Area
    dataKey="runRate"
    dashArray="6,4"
    dashFromIndex={4}
    fill="var(--chart-4)"
    fillOpacity={0.3}
    showMarkers
  />
  <Line
    dataKey="runRate"
    dashArray="6,4"
    dashFromIndex={4}
    showMarkers
    stroke="var(--chart-2)"
    strokeWidth={2}
  />
  <ChartTooltip showCrosshair={false} />
  <XAxis tickMode="data" />
</ComposedChart>`,
      footer:
        "Use dashFromIndex on Line and Area when projecting an incomplete final period",
      render: () => (
        <ComposedExampleChart
          aspectRatio="3 / 2"
          data={dataCast}
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
        </ComposedExampleChart>
      ),
    },
    {
      title: "Composed Chart — Left Y axis",
      description:
        "Bars and line share one left value scale with Y-axis labels",
      code: `<ComposedChart data={data} xDataKey="date" margin={{ top: 8, right: 8, bottom: 40, left: 56 }} barGap={0} maxBarSize={32}>
  <Grid horizontal />
  <SeriesBar dataKey="units" fill="var(--chart-3)" radius={4} />
  <Line dataKey="revenue" stroke="var(--chart-1)" />
  <YAxis yAxisId="left" />
  <ChartTooltip showCrosshair={false} />
  <XAxis numTicks={8} />
</ComposedChart>`,
      render: () => (
        <ComposedExampleChart
          barGap={0}
          data={dataCast}
          margin={chartMarginLeftYAxis}
          maxBarSize={32}
          xDataKey="date"
        >
          <Grid horizontal />
          <SeriesBar dataKey="units" fill="var(--chart-3)" radius={4} />
          <Line dataKey="revenue" stroke="var(--chart-1)" />
          <YAxis yAxisId="left" />
          <ChartTooltip showCrosshair={false} />
          <XAxis numTicks={8} />
        </ComposedExampleChart>
      ),
    },
    {
      title: "Composed Chart — Left and right Y axes",
      description:
        "Units on the left scale, revenue line on the right (biaxial)",
      code: `<ComposedChart data={data} xDataKey="date" margin={{ top: 8, right: 56, bottom: 40, left: 56 }} barGap={0} maxBarSize={32}>
  <Grid horizontal />
  <SeriesBar dataKey="units" fill="var(--chart-3)" radius={4} />
  <Line dataKey="revenue" yAxisId="right" stroke="var(--chart-1)" />
  <YAxis yAxisId="left" />
  <YAxis yAxisId="right" orientation="right" />
  <ChartTooltip showCrosshair={false} />
  <XAxis numTicks={8} />
</ComposedChart>`,
      render: () => (
        <ComposedExampleChart
          barGap={0}
          data={dataCast}
          margin={chartMarginBiaxialYAxis}
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
        </ComposedExampleChart>
      ),
    },
  ];
}

function makeComposedHero(): ChartExample {
  return {
    title: "Composed Chart",
    description:
      "One time axis, one Y scale: combine SeriesBar, Line, and Area. Use the curve menu to swap the shared Line and Area interpolation.",
    code: `import { curveCatmullRom } from "@visx/curve";

<ComposedChart margin={{ top: 8, right: 8, bottom: 40, left: 8 }} data={data} xDataKey="date" aspectRatio="2 / 1" barGap={0} maxBarSize={32}>
  <Grid horizontal />
  <Area dataKey="runRate" curve={curveCatmullRom.alpha(0.42)} fill="var(--chart-4)" fillOpacity={0.32} />
  <SeriesBar dataKey="units" fill="var(--chart-3)" radius={4} />
  <Line dataKey="revenue" curve={curveCatmullRom.alpha(0.42)} stroke="var(--chart-1)" strokeWidth={2.5} />
  <ChartTooltip showCrosshair={false} />
  <XAxis numTicks={8} />
</ComposedChart>`,
    footer:
      "Hero uses a Radix Select for the Line and Area `curve` prop (SeriesBar shape is unchanged). See https://visx.airbnb.tech/docs/curve.",
    render: () => <ComposedHeroWithCurveSelect />,
  };
}

function makeLineExamples(): ChartExample[] {
  return [
    {
      title: "Line Chart - Linear",
      description: "Straight lines between data points",
      code: `import { curveLinear } from "@visx/curve";

<LineChart margin={{ top: 8, right: 8, bottom: 40, left: 8 }} data={chartData}>
  <Grid horizontal />
  <Line dataKey="desktop" curve={curveLinear} strokeWidth={2} />
  <ChartTooltip />
</LineChart>`,
      render: () => (
        <LineExampleChart data={lineData}>
          <Grid horizontal />
          <Line curve={curveLinear} dataKey="desktop" strokeWidth={2} />
          <ChartTooltip />
        </LineExampleChart>
      ),
    },
    {
      title: "Line Chart - Markers",
      description: "Custom markers to annotate key events",
      code: `const markers = [
  { date: new Date(2024, 2, 1), icon: "🚀", title: "v2.0 Launch" },
  { date: new Date(2024, 4, 1), icon: "📈", title: "Marketing Push" },
];

<LineChart margin={{ top: 8, right: 8, bottom: 40, left: 8 }} data={chartData}>
  <Grid horizontal />
  <Line dataKey="desktop" strokeWidth={2} />
  <ChartMarkers items={markers} />
  <ChartTooltip />
</LineChart>`,
      render: () => (
        <LineExampleChart data={lineData}>
          <Grid horizontal />
          <Line dataKey="desktop" strokeWidth={2} />
          <ChartMarkers items={lineMarkers} />
          <ChartTooltip />
        </LineExampleChart>
      ),
    },
    {
      title: "Line Chart - Segment Selection",
      description: "Click and drag to select a range",
      code: `<LineChart margin={{ top: 8, right: 8, bottom: 40, left: 8 }} data={chartData}>
  <Grid horizontal />
  <Line dataKey="desktop" strokeWidth={2} />
  <SegmentBackground />
  <SegmentLineFrom />
  <SegmentLineTo />
  <ChartTooltip />
</LineChart>`,
      footer: "Click and drag on the chart to select a segment",
      render: () => (
        <LineExampleChart data={lineData}>
          <Grid horizontal />
          <Line dataKey="desktop" strokeWidth={2} />
          <SegmentBackground />
          <SegmentLineFrom />
          <SegmentLineTo />
          <ChartTooltip />
        </LineExampleChart>
      ),
    },
    {
      title: "Line Chart - Multiple Lines",
      description: "Desktop vs mobile visitors over time",
      code: `<LineChart margin={{ top: 8, right: 8, bottom: 40, left: 8 }} data={chartData}>
  <Grid horizontal />
  <Line dataKey="desktop" stroke="var(--chart-1)" strokeWidth={2} />
  <Line dataKey="mobile" stroke="var(--chart-3)" strokeWidth={2} />
  <ChartTooltip />
</LineChart>`,
      render: () => (
        <LineExampleChart data={multiLineData}>
          <Grid horizontal />
          <Line dataKey="desktop" stroke="var(--chart-1)" strokeWidth={2} />
          <Line dataKey="mobile" stroke="var(--chart-3)" strokeWidth={2} />
          <ChartTooltip />
        </LineExampleChart>
      ),
    },
    {
      title: "Line Chart - X Axis",
      description: "With labeled x-axis dates",
      code: `<LineChart margin={{ top: 8, right: 8, bottom: 40, left: 8 }} data={chartData}>
  <Grid horizontal />
  <Line dataKey="desktop" strokeWidth={2} />
  <XAxis />
  <ChartTooltip />
</LineChart>`,
      render: () => (
        <LineExampleChart data={lineData}>
          <Grid horizontal />
          <Line dataKey="desktop" strokeWidth={2} />
          <XAxis />
          <ChartTooltip />
        </LineExampleChart>
      ),
    },
    {
      title: "Line Chart - X & Y Axis",
      description: "With both horizontal grid and x-axis labels",
      code: `<LineChart margin={{ top: 8, right: 8, bottom: 40, left: 8 }} data={chartData}>
  <Grid horizontal vertical />
  <Line dataKey="desktop" strokeWidth={2} />
  <XAxis />
  <ChartTooltip />
</LineChart>`,
      footer: "Horizontal grid lines serve as the y-axis reference",
      render: () => (
        <LineExampleChart data={lineData}>
          <Grid horizontal vertical />
          <Line dataKey="desktop" strokeWidth={2} />
          <XAxis />
          <ChartTooltip />
        </LineExampleChart>
      ),
    },
    {
      title: "Line Chart - Series Markers",
      description:
        "Ring markers at each data point with the same config as Scatter",
      code: `<LineChart data={chartData} xDataKey="date">
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
</LineChart>`,
      render: () => (
        <LineExampleChart data={weeklyVisitorsCast} xDataKey="date">
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
        </LineExampleChart>
      ),
    },
    {
      title: "Line Chart - Loading",
      description:
        "Skeleton grid, pulsing foreground segment, and shimmer label while data loads",
      code: `import { LineChartLoading } from "@bklitui/ui/charts";

<LineChartLoading
  gridStrokeOpacity={0.5}
  label="Loading"
  stroke="var(--foreground)"
  strokeOpacity={0.5}
/>`,
      footer:
        "Uses @ncdai/shimmering-text for the label — installed with @bklit/line-chart",
      render: () => <LineChartLoadingExample />,
    },
    {
      title: "Line Chart - Dashed Tail",
      description:
        "Curved dashed segment from a chosen index — useful for incomplete periods",
      code: `<LineChart data={chartData} xDataKey="date">
  <Grid horizontal />
  <Line
    dataKey="visitors"
    dashArray="6,4"
    dashFromIndex={5}
    stroke="var(--chart-line-primary)"
    strokeWidth={2.5}
  />
  <XAxis tickMode="data" />
  <ChartTooltip />
</LineChart>`,
      footer:
        "The dashed tail follows the same curve and edge fade as the solid stroke",
      render: () => (
        <LineExampleChart data={weeklyVisitorsCast} xDataKey="date">
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
        </LineExampleChart>
      ),
    },
    {
      title: "Line Chart - Left Y axis",
      description:
        "Both series on the left scale with explicit Y-axis tick labels",
      code: `<LineChart data={chartData} margin={{ top: 8, right: 8, bottom: 40, left: 56 }}>
  <Grid horizontal />
  <Line dataKey="desktop" strokeWidth={2.5} />
  <Line dataKey="mobile" stroke="var(--chart-2)" strokeWidth={2.5} />
  <YAxis yAxisId="left" />
  <XAxis />
  <ChartTooltip />
</LineChart>`,
      render: () => (
        <LineExampleChart data={multiLineData} margin={chartMarginLeftYAxis}>
          <Grid horizontal />
          <Line dataKey="desktop" strokeWidth={2.5} />
          <Line dataKey="mobile" stroke="var(--chart-2)" strokeWidth={2.5} />
          <YAxis yAxisId="left" />
          <XAxis />
          <ChartTooltip />
        </LineExampleChart>
      ),
    },
    {
      title: "Line Chart - Left and right Y axes",
      description: "Independent left and right scales (biaxial)",
      code: `<LineChart data={chartData} margin={{ top: 8, right: 56, bottom: 40, left: 56 }}>
  <Grid horizontal />
  <Line dataKey="desktop" yAxisId="left" />
  <Line dataKey="mobile" yAxisId="right" stroke="var(--chart-2)" />
  <YAxis yAxisId="left" />
  <YAxis yAxisId="right" orientation="right" />
  <XAxis />
  <ChartTooltip />
</LineChart>`,
      render: () => (
        <LineExampleChart data={multiLineData} margin={chartMarginBiaxialYAxis}>
          <Grid horizontal />
          <Line dataKey="desktop" yAxisId="left" />
          <Line dataKey="mobile" stroke="var(--chart-2)" yAxisId="right" />
          <YAxis yAxisId="left" />
          <YAxis orientation="right" yAxisId="right" />
          <XAxis />
          <ChartTooltip />
        </LineExampleChart>
      ),
    },
    {
      title: "Line Chart - Profit/Loss",
      description:
        "Sign-colored segments with a highlighted zero baseline and optional legend hover",
      code: `import {
  ProfitLossLine,
  ProfitLossLegend,
  ProfitLossLegendHoverProvider,
  profitLossColor,
  resolveProfitLossTooltipLabel,
} from "@bklitui/ui/charts";

<LineChart data={data}>
  <Grid highlightRowValues={[0]} horizontal />
  <Line dataKey="pnl" stroke="transparent" strokeWidth={0} showHighlight={false} />
  <ProfitLossLegendHoverProvider hoveredIndex={legendHoveredIndex}>
    <ProfitLossLine dataKey="pnl" />
  </ProfitLossLegendHoverProvider>
  <XAxis />
  <ChartTooltip
    indicatorColor={(point) => profitLossColor(point.pnl ?? 0)}
    rows={(point) => [{
      label: resolveProfitLossTooltipLabel(""),
      value: point.pnl ?? 0,
      color: profitLossColor(point.pnl ?? 0),
    }]}
  />
</LineChart>`,
      footer: "Legend below the chart, centered",
      render: () => <ProfitLossLineExampleWithState />,
    },
  ];
}

// ---------------------------------------------------------------------------
// Live line chart examples
// ---------------------------------------------------------------------------

function LiveLineBasicDemo() {
  const { data, value } = useLiveData(142.5, 600);
  const formatUsd = useCallback((v: number) => `$${v.toFixed(2)}`, []);
  return (
    <LiveLineExampleChart
      data={data}
      margin={{ left: 28 }}
      style={{ height: 240 }}
      value={value}
      window={30}
    >
      <LiveLine
        dataKey="value"
        formatValue={formatUsd}
        stroke="var(--chart-1)"
      />
      <ChartTooltip
        content={({ point }) => (
          <div className="px-3 py-2.5 text-sm">
            <span className="text-muted-foreground">
              {(point.value as number)?.toFixed(2)}
            </span>
          </div>
        )}
        showDatePill={false}
      />
      <LiveXAxis />
      <LiveYAxis formatValue={formatUsd} position="left" />
    </LiveLineExampleChart>
  );
}

function LiveLineOffsetDemo() {
  const { data, value } = useLiveData(0.002_34, 500);
  const formatSats = useCallback((v: number) => `${v.toFixed(5)} BTC`, []);
  return (
    <LiveLineExampleChart
      data={data}
      exaggerate
      margin={{ left: 36 }}
      nowOffsetUnits={1}
      style={{ height: 220 }}
      value={value}
      window={20}
    >
      <LiveLine
        dataKey="value"
        dotSize={4}
        formatValue={formatSats}
        stroke="var(--chart-3)"
      />
      <ChartTooltip
        content={({ point }) => (
          <div className="px-3 py-2.5 text-sm tabular-nums">
            {formatSats((point.value as number) ?? 0)}
          </div>
        )}
        showDatePill={false}
      />
      <LiveXAxis />
      <LiveYAxis formatValue={formatSats} position="left" />
    </LiveLineExampleChart>
  );
}

const momentumColors: MomentumColors = {
  up: "var(--color-emerald-500)",
  down: "var(--color-red-500)",
  flat: "var(--muted-foreground)",
};

function LiveLineMomentumDemo() {
  const { data, value } = useLiveData(85, 500);
  const formatUsd = useCallback((v: number) => `$${v.toFixed(2)}`, []);
  return (
    <LiveLineExampleChart
      data={data}
      margin={{ left: 28 }}
      style={{ height: 240 }}
      value={value}
      window={25}
    >
      <LiveLine
        dataKey="value"
        dotSize={5}
        formatValue={formatUsd}
        momentumColors={momentumColors}
      />
      <ChartTooltip
        content={({ point }) => (
          <div className="px-3 py-2.5 text-sm tabular-nums">
            {formatUsd((point.value as number) ?? 0)}
          </div>
        )}
        showDatePill={false}
      />
      <LiveXAxis />
      <LiveYAxis formatValue={formatUsd} position="left" />
    </LiveLineExampleChart>
  );
}

function LiveLineNoFillDemo() {
  const { data, value } = useLiveData(72, 550);
  const formatUsd = useCallback((v: number) => `$${v.toFixed(2)}`, []);
  return (
    <LiveLineExampleChart
      data={data}
      margin={{ left: 28 }}
      style={{ height: 240 }}
      value={value}
      window={28}
    >
      <LiveLine
        dataKey="value"
        fill={false}
        formatValue={formatUsd}
        stroke="var(--chart-1)"
      />
      <ChartTooltip
        content={({ point }) => (
          <div className="px-3 py-2.5 text-sm tabular-nums">
            {formatUsd((point.value as number) ?? 0)}
          </div>
        )}
        showDatePill={false}
      />
      <LiveXAxis />
      <LiveYAxis formatValue={formatUsd} position="left" />
    </LiveLineExampleChart>
  );
}

function makeLiveLineExamples(): ChartExample[] {
  return [
    {
      title: "Live Line Chart",
      description: "Streaming data with smooth scroll, live dot, and crosshair",
      code: `<LiveLineChart margin={{ top: 8, right: 8, bottom: 40, left: 8 }} data={data} value={value} window={30}>
  <LiveLine dataKey="value" stroke="var(--chart-1)" formatValue={(v) => \`$\${v.toFixed(2)}\`} />
  <ChartTooltip showDatePill={false} content={TooltipContent} />
  <LiveXAxis />
  <LiveYAxis position="left" formatValue={(v) => \`$\${v.toFixed(2)}\`} />
</LiveLineChart>`,
      render: () => <LiveLineBasicDemo />,
    },
    {
      title: "Live Line - Now Offset",
      description: "Leading gap so the line fades at the right edge",
      code: `<LiveLineChart margin={{ top: 8, right: 8, bottom: 40, left: 8 }} data={data} value={value} window={20} nowOffsetUnits={1}>
  <LiveLine dataKey="value" stroke="var(--chart-3)" formatValue={formatSats} dotSize={4} />
  <LiveXAxis />
  <LiveYAxis position="left" formatValue={formatSats} />
</LiveLineChart>`,
      render: () => <LiveLineOffsetDemo />,
    },
    {
      title: "Live Line - Momentum Colors",
      description: "Green for increase, red for decrease",
      code: `const momentumColors = { up: "var(--color-emerald-500)", down: "var(--color-red-500)", flat: "var(--muted-foreground)" };

<LiveLineChart margin={{ top: 8, right: 8, bottom: 40, left: 8 }} data={data} value={value} window={25}>
  <LiveLine dataKey="value" momentumColors={momentumColors} formatValue={formatUsd} dotSize={5} />
  <LiveXAxis />
  <LiveYAxis position="left" formatValue={formatUsd} />
</LiveLineChart>`,
      render: () => <LiveLineMomentumDemo />,
    },
    {
      title: "Live Line - Line Only",
      description: "No area fill — simple line and live dot",
      code: `<LiveLineChart margin={{ top: 8, right: 8, bottom: 40, left: 8 }} data={data} value={value} window={28}>
  <LiveLine dataKey="value" fill={false} stroke="var(--chart-1)" formatValue={formatUsd} />
  <LiveXAxis />
  <LiveYAxis position="left" formatValue={formatUsd} />
</LiveLineChart>`,
      render: () => <LiveLineNoFillDemo />,
    },
  ];
}

function makeLiveLineHero(): ChartExample {
  return {
    title: "Live Line Chart - Interactive",
    description: "Real-time streaming with crosshair and animated axes",
    code: `<LiveLineChart margin={{ top: 8, right: 8, bottom: 40, left: 8 }} data={data} value={value} window={30}>
  <LiveLine dataKey="value" stroke="var(--chart-line-primary)" formatValue={(v) => \`$\${v.toFixed(2)}\`} />
  <ChartTooltip showDatePill={false} content={TooltipContent} />
  <LiveXAxis />
  <LiveYAxis position="left" formatValue={(v) => \`$\${v.toFixed(2)}\`} />
</LiveLineChart>`,
    footer: "Data streams in real time; hover to scrub the crosshair",
    render: () => <LiveLineBasicDemo />,
  };
}

// ---------------------------------------------------------------------------
// Choropleth helpers
// ---------------------------------------------------------------------------

const visitorsByCountry: Record<string, number> = {
  "United States": 18,
  "United Kingdom": 12,
  Germany: 17,
  France: 9,
  Canada: 8,
  Australia: 6,
  Netherlands: 5,
  Brazil: 7,
  India: 11,
  Japan: 4,
  Spain: 3,
  Italy: 6,
  Mexico: 5,
  Poland: 4,
  Sweden: 3,
  "South Africa": 4,
  Argentina: 3,
  Indonesia: 2,
  Philippines: 3,
  Thailand: 2,
};

function getVisitorColor(feat: ChoroplethFeature): string {
  const visitors = visitorsByCountry[feat.properties?.name as string];
  if (!visitors) {
    return "var(--muted)";
  }
  if (visitors >= 17) {
    return "var(--chart-1)";
  }
  if (visitors >= 13) {
    return "var(--chart-2)";
  }
  if (visitors >= 9) {
    return "var(--chart-3)";
  }
  if (visitors >= 5) {
    return "var(--chart-4)";
  }
  return "var(--chart-5)";
}

function getVisitorValue(feat: ChoroplethFeature): number | undefined {
  return visitorsByCountry[feat.properties?.name as string];
}

function ChoroplethLoading() {
  return (
    <div className="flex h-[200px] items-center justify-center">
      <div className="animate-pulse text-muted-foreground text-sm">
        Loading map...
      </div>
    </div>
  );
}

function ChoroplethBasic() {
  const { worldData, isLoading } = useWorldDataStandalone();
  if (isLoading || !worldData) {
    return <ChoroplethLoading />;
  }
  return (
    <ChoroplethExampleChart aspectRatio="16 / 9" data={worldData}>
      <ChoroplethGraticule />
      <ChoroplethFeatureComponent fill="var(--chart-3)" />
      <ChoroplethTooltip />
    </ChoroplethExampleChart>
  );
}

function ChoroplethAnalytics() {
  const { worldData, isLoading } = useWorldDataStandalone();
  if (isLoading || !worldData) {
    return <ChoroplethLoading />;
  }
  return (
    <ChoroplethExampleChart aspectRatio="16 / 9" data={worldData}>
      <ChoroplethFeatureComponent getFeatureColor={getVisitorColor} />
      <ChoroplethTooltip
        getFeatureValue={getVisitorValue}
        valueLabel="Visitors"
      />
    </ChoroplethExampleChart>
  );
}

function ChoroplethWithGraticule() {
  const { worldData, isLoading } = useWorldDataStandalone();
  if (isLoading || !worldData) {
    return <ChoroplethLoading />;
  }
  return (
    <ChoroplethExampleChart aspectRatio="16 / 9" data={worldData}>
      <ChoroplethGraticule stroke="rgba(255,255,255,0.15)" />
      <ChoroplethFeatureComponent fill="var(--chart-1)" />
      <ChoroplethTooltip />
    </ChoroplethExampleChart>
  );
}

function getRegionCategory(name: string) {
  const c = name.charAt(0).toUpperCase();
  if ("ABCD".includes(c)) {
    return "americas";
  }
  if ("EFGH".includes(c)) {
    return "europe";
  }
  if ("IJKLM".includes(c)) {
    return "asia";
  }
  if ("NOPQR".includes(c)) {
    return "africa";
  }
  return "oceania";
}

function ChoroplethPattern() {
  const { worldData, isLoading } = useWorldDataStandalone();
  if (isLoading || !worldData) {
    return <ChoroplethLoading />;
  }

  return (
    <ChoroplethExampleChart aspectRatio="16 / 9" data={worldData}>
      <ChoroplethFeatureComponent
        getFeaturePattern={(feat) => {
          const name = feat.properties?.name;
          return name ? `choro-p-${getRegionCategory(name as string)}` : null;
        }}
        patterns={
          <>
            <PatternLines
              height={6}
              id="choro-p-americas"
              orientation={["diagonal"]}
              stroke="var(--chart-1)"
              strokeWidth={2}
              width={6}
            />
            <PatternLines
              height={6}
              id="choro-p-europe"
              orientation={["diagonal"]}
              stroke="var(--chart-2)"
              strokeWidth={2}
              width={6}
            />
            <PatternLines
              height={6}
              id="choro-p-asia"
              orientation={["diagonal"]}
              stroke="var(--chart-3)"
              strokeWidth={2}
              width={6}
            />
            <PatternLines
              height={6}
              id="choro-p-africa"
              orientation={["diagonal"]}
              stroke="var(--chart-4)"
              strokeWidth={2}
              width={6}
            />
            <PatternLines
              height={6}
              id="choro-p-oceania"
              orientation={["diagonal"]}
              stroke="var(--chart-5)"
              strokeWidth={2}
              width={6}
            />
          </>
        }
      />
      <ChoroplethTooltip />
    </ChoroplethExampleChart>
  );
}

function RingWithLegend() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const legendItems = ringData.map((d) => ({
    label: d.label,
    value: d.value,
    maxValue: d.maxValue,
    color: d.color || "",
  }));
  return (
    <div className="flex w-full flex-col items-center gap-3">
      <div className="mx-auto w-full max-w-[240px]">
        <RingChart
          data={ringData}
          hoveredIndex={hoveredIndex}
          onHoverChange={setHoveredIndex}
        >
          {ringData.map((item, index) => (
            <Ring index={index} key={item.label} />
          ))}
          <RingCenter defaultLabel="Sessions" />
        </RingChart>
      </div>
      <Legend
        className="w-full"
        hoveredIndex={hoveredIndex}
        items={legendItems}
        onHoverChange={setHoveredIndex}
      >
        <LegendItemComponent className="grid grid-cols-[auto_1fr_auto] items-center gap-x-2 gap-y-0.5">
          <LegendMarker />
          <LegendLabel className="text-xs" />
          <LegendValue className="text-xs" showPercentage />
          <div className="col-span-full">
            <LegendProgress />
          </div>
        </LegendItemComponent>
      </Legend>
    </div>
  );
}

function PieDonutInteractive() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  return (
    <div className={chartExampleRadialShellClassName}>
      <PieChart
        data={pieData}
        hoveredIndex={hoveredIndex}
        innerRadius={60}
        onHoverChange={setHoveredIndex}
      >
        {pieData.map((item, index) => (
          <PieSlice index={index} key={item.label} />
        ))}
        <PieCenter defaultLabel="Total" />
      </PieChart>
    </div>
  );
}

function PieWithLegend() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const legendItems = pieData.map((d) => ({
    label: d.label,
    value: d.value,
    color: d.color || "",
  }));
  return (
    <div className="flex flex-col items-center gap-4">
      <PieChart
        data={pieData}
        hoveredIndex={hoveredIndex}
        innerRadius={55}
        onHoverChange={setHoveredIndex}
      >
        {pieData.map((item, index) => (
          <PieSlice index={index} key={item.label} />
        ))}
        <PieCenter defaultLabel="Browsers" />
      </PieChart>
      <Legend
        className="flex-row flex-wrap justify-center gap-x-4 gap-y-1"
        hoveredIndex={hoveredIndex}
        items={legendItems}
        onHoverChange={setHoveredIndex}
      >
        <LegendItemComponent className="flex items-center gap-1.5">
          <LegendMarker />
          <LegendLabel className="text-xs" />
        </LegendItemComponent>
      </Legend>
    </div>
  );
}

function PieGrowHover() {
  return (
    <div className={chartExampleRadialShellClassName}>
      <PieChart data={pieData}>
        {pieData.map((item, index) => (
          <PieSlice hoverEffect="grow" index={index} key={item.label} />
        ))}
      </PieChart>
    </div>
  );
}

function PieCustomCenter() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const total = pieData.reduce((s, d) => s + d.value, 0);
  return (
    <div className={chartExampleRadialShellClassName}>
      <PieChart
        data={pieData}
        hoveredIndex={hoveredIndex}
        innerRadius={65}
        onHoverChange={setHoveredIndex}
      >
        {pieData.map((item, index) => (
          <PieSlice index={index} key={item.label} />
        ))}
        <PieCenter>
          {({ value, label, isHovered, data: d }) => (
            <div className="text-center">
              <div
                className="font-bold text-xl"
                style={{ color: isHovered ? d.color : undefined }}
              >
                {value.toLocaleString()}
              </div>
              <div className="text-muted-foreground text-xs">{label}</div>
              {isHovered && (
                <div className="mt-0.5 text-[10px] text-muted-foreground">
                  {((d.value / total) * 100).toFixed(1)}%
                </div>
              )}
            </div>
          )}
        </PieCenter>
      </PieChart>
    </div>
  );
}

const piePatternData: PieData[] = [
  { label: "Category A", value: 35 },
  { label: "Category B", value: 25 },
  { label: "Category C", value: 20 },
  { label: "Category D", value: 20 },
];

const pieGradientData: PieData[] = [
  { label: "Segment A", value: 40 },
  { label: "Segment B", value: 30 },
  { label: "Segment C", value: 30 },
];

function makePieExamples(): ChartExample[] {
  return [
    {
      title: "Pie Chart",
      description: "Basic pie chart with colored slices",
      code: `<PieChart data={pieData} size={200}>
  {pieData.map((item, index) => (
    <PieSlice index={index} key={item.label} />
  ))}
</PieChart>`,
      render: () => (
        <div className={chartExampleRadialShellClassName}>
          <PieChart data={pieData}>
            {pieData.map((item, index) => (
              <PieSlice index={index} key={item.label} />
            ))}
          </PieChart>
        </div>
      ),
    },
    {
      title: "Pie Chart - Donut",
      description: "Hollow center with animated value display",
      code: `<PieChart data={pieData} innerRadius={60} size={200}>
  {pieData.map((item, index) => (
    <PieSlice index={index} key={item.label} />
  ))}
  <PieCenter defaultLabel="Total" />
</PieChart>`,
      render: () => (
        <div className={chartExampleRadialShellClassName}>
          <PieDonutInteractive />
        </div>
      ),
    },
    {
      title: "Pie Chart - Legend",
      description: "Interactive legend synced with chart hover",
      code: `const [hoveredIndex, setHoveredIndex] = useState(null);

<PieChart
  data={pieData}
  hoveredIndex={hoveredIndex}
  innerRadius={55}
  onHoverChange={setHoveredIndex}
  size={180}
>
  {pieData.map((_, i) => <PieSlice index={i} key={i} />)}
  <PieCenter defaultLabel="Browsers" />
</PieChart>
<Legend
  hoveredIndex={hoveredIndex}
  items={legendItems}
  onHoverChange={setHoveredIndex}
>
  <LegendItemComponent>
    <LegendMarker />
    <LegendLabel />
  </LegendItemComponent>
</Legend>`,
      render: () => (
        <div className={chartExampleRadialShellClassName}>
          <PieWithLegend />
        </div>
      ),
    },
    {
      title: "Pie Chart - Patterns",
      description: "Diagonal line patterns for each slice",
      code: `<PieChart data={pieData} size={200}>
  <PatternLines height={6} id="pp-1" orientation={["diagonal"]}
    stroke="var(--chart-1)" width={6} />
  <PatternLines height={6} id="pp-2" orientation={["horizontal"]}
    stroke="var(--chart-2)" width={6} />
  <PatternLines height={6} id="pp-3" orientation={["vertical"]}
    stroke="var(--chart-3)" width={6} />
  <PatternLines height={8} id="pp-4" orientation={["diagonalRightToLeft"]}
    stroke="var(--chart-4)" width={8} />
  <PieSlice fill="url(#pp-1)" index={0} />
  <PieSlice fill="url(#pp-2)" index={1} />
  <PieSlice fill="url(#pp-3)" index={2} />
  <PieSlice fill="url(#pp-4)" index={3} />
</PieChart>`,
      render: () => (
        <div className={chartExampleRadialShellClassName}>
          <PieChart data={piePatternData}>
            <PatternLines
              height={6}
              id="pie-ex-p1"
              orientation={["diagonal"]}
              stroke="var(--chart-1)"
              strokeWidth={1}
              width={6}
            />
            <PatternLines
              height={6}
              id="pie-ex-p2"
              orientation={["horizontal"]}
              stroke="var(--chart-2)"
              strokeWidth={1}
              width={6}
            />
            <PatternLines
              height={6}
              id="pie-ex-p3"
              orientation={["vertical"]}
              stroke="var(--chart-3)"
              strokeWidth={1}
              width={6}
            />
            <PatternLines
              height={8}
              id="pie-ex-p4"
              orientation={["diagonalRightToLeft"]}
              stroke="var(--chart-4)"
              strokeWidth={1}
              width={8}
            />
            <PieSlice fill="url(#pie-ex-p1)" index={0} />
            <PieSlice fill="url(#pie-ex-p2)" index={1} />
            <PieSlice fill="url(#pie-ex-p3)" index={2} />
            <PieSlice fill="url(#pie-ex-p4)" index={3} />
          </PieChart>
        </div>
      ),
    },
    {
      title: "Pie Chart - Gradients",
      description: "Radial gradient fills on each slice",
      code: `<PieChart data={pieData} size={200}>
  <RadialGradient from="#0ea5e9" id="pg-1" to="#06b6d4" />
  <RadialGradient from="#a855f7" id="pg-2" to="#ec4899" />
  <RadialGradient from="#f59e0b" id="pg-3" to="#ef4444" />
  <PieSlice fill="url(#pg-1)" index={0} />
  <PieSlice fill="url(#pg-2)" index={1} />
  <PieSlice fill="url(#pg-3)" index={2} />
</PieChart>`,
      render: () => (
        <div className={chartExampleRadialShellClassName}>
          <PieChart data={pieGradientData}>
            <RadialGradient
              from="#0ea5e9"
              fromOffset="0%"
              id="pie-ex-g1"
              to="#06b6d4"
              toOffset="100%"
            />
            <RadialGradient
              from="#a855f7"
              fromOffset="0%"
              id="pie-ex-g2"
              to="#ec4899"
              toOffset="100%"
            />
            <RadialGradient
              from="#f59e0b"
              fromOffset="0%"
              id="pie-ex-g3"
              to="#ef4444"
              toOffset="100%"
            />
            <PieSlice fill="url(#pie-ex-g1)" index={0} />
            <PieSlice fill="url(#pie-ex-g2)" index={1} />
            <PieSlice fill="url(#pie-ex-g3)" index={2} />
          </PieChart>
        </div>
      ),
    },
    {
      title: "Pie Chart - Grow Hover",
      description: "Slices extend outward on hover instead of translating",
      code: `<PieChart data={pieData} size={200}>
  {pieData.map((item, index) => (
    <PieSlice hoverEffect="grow" index={index} key={item.label} />
  ))}
</PieChart>`,
      render: () => (
        <div className={chartExampleRadialShellClassName}>
          <PieGrowHover />
        </div>
      ),
    },
    {
      title: "Pie Chart - Custom Center",
      description: "Render prop for full control over center content",
      code: `<PieChart data={pieData} innerRadius={65} size={200}>
  {pieData.map((_, i) => <PieSlice index={i} key={i} />)}
  <PieCenter>
    {({ value, label, isHovered, data }) => (
      <div className="text-center">
        <div className="font-bold text-xl"
          style={{ color: isHovered ? data.color : undefined }}>
          {value.toLocaleString()}
        </div>
        <div className="text-muted-foreground text-xs">{label}</div>
      </div>
    )}
  </PieCenter>
</PieChart>`,
      render: () => (
        <div className={chartExampleRadialShellClassName}>
          <PieCustomCenter />
        </div>
      ),
    },
    {
      title: "Donut Chart - Patterns",
      description: "Donut with patterned slices and center label",
      code: `<PieChart data={pieData} innerRadius={55} size={200}>
  <PatternLines height={6} id="dp-1" orientation={["diagonal"]}
    stroke="var(--chart-1)" width={6} />
  <PatternLines height={6} id="dp-2" orientation={["horizontal"]}
    stroke="var(--chart-2)" width={6} />
  <PatternLines height={6} id="dp-3" orientation={["vertical"]}
    stroke="var(--chart-3)" width={6} />
  <PatternLines height={8} id="dp-4" orientation={["diagonalRightToLeft"]}
    stroke="var(--chart-4)" width={8} />
  <PieSlice fill="url(#dp-1)" index={0} />
  <PieSlice fill="url(#dp-2)" index={1} />
  <PieSlice fill="url(#dp-3)" index={2} />
  <PieSlice fill="url(#dp-4)" index={3} />
  <PieCenter defaultLabel="Total" />
</PieChart>`,
      render: () => (
        <div className={chartExampleRadialShellClassName}>
          <PieChart data={piePatternData} innerRadius={55}>
            <PatternLines
              height={6}
              id="donut-ex-p1"
              orientation={["diagonal"]}
              stroke="var(--chart-1)"
              strokeWidth={1}
              width={6}
            />
            <PatternLines
              height={6}
              id="donut-ex-p2"
              orientation={["horizontal"]}
              stroke="var(--chart-2)"
              strokeWidth={1}
              width={6}
            />
            <PatternLines
              height={6}
              id="donut-ex-p3"
              orientation={["vertical"]}
              stroke="var(--chart-3)"
              strokeWidth={1}
              width={6}
            />
            <PatternLines
              height={8}
              id="donut-ex-p4"
              orientation={["diagonalRightToLeft"]}
              stroke="var(--chart-4)"
              strokeWidth={1}
              width={8}
            />
            <PieSlice fill="url(#donut-ex-p1)" index={0} />
            <PieSlice fill="url(#donut-ex-p2)" index={1} />
            <PieSlice fill="url(#donut-ex-p3)" index={2} />
            <PieSlice fill="url(#donut-ex-p4)" index={3} />
            <PieCenter defaultLabel="Total" />
          </PieChart>
        </div>
      ),
    },
    {
      title: "Donut Chart - Grow Hover",
      description: "Donut with grow effect and center value",
      code: `<PieChart data={pieData} innerRadius={55} size={200}>
  {pieData.map((item, index) => (
    <PieSlice hoverEffect="grow" index={index} key={item.label} />
  ))}
  <PieCenter defaultLabel="Browsers" />
</PieChart>`,
      render: () => (
        <div className={chartExampleRadialShellClassName}>
          <PieChart data={pieData} innerRadius={55}>
            {pieData.map((item, index) => (
              <PieSlice hoverEffect="grow" index={index} key={item.label} />
            ))}
            <PieCenter defaultLabel="Browsers" />
          </PieChart>
        </div>
      ),
    },
  ];
}

function makeRadarExamples(): ChartExample[] {
  return [
    {
      title: "Radar Chart",
      description: "Two models compared across five metrics",
      code: `<RadarChart data={radarData} metrics={metrics} size={250}>
  <RadarGrid />
  <RadarAxis />
  <RadarLabels />
  {radarData.map((item, index) => (
    <RadarArea index={index} key={item.label} />
  ))}
</RadarChart>`,
      render: () => (
        <div className={chartExampleRadialShellClassName}>
          <RadarChart data={radarDataDual} metrics={radarMetrics5}>
            <RadarGrid />
            <RadarAxis />
            <RadarLabels fontSize={10} offset={16} />
            {radarDataDual.map((item, index) => (
              <RadarArea index={index} key={item.label} />
            ))}
          </RadarChart>
        </div>
      ),
    },
    {
      title: "Radar Chart - Triangle",
      description: "Three metrics with two contrasting profiles",
      code: `const metrics = [
  { key: "attack", label: "Attack" },
  { key: "defense", label: "Defense" },
  { key: "magic", label: "Magic" },
];

<RadarChart data={data} metrics={metrics} size={250}>
  <RadarGrid />
  <RadarAxis />
  <RadarLabels />
  {data.map((item, i) => (
    <RadarArea index={i} key={item.label} />
  ))}
</RadarChart>`,
      render: () => (
        <div className={chartExampleRadialShellClassName}>
          <RadarChart data={radarDataTriangle} metrics={radarMetrics3}>
            <RadarGrid />
            <RadarAxis />
            <RadarLabels fontSize={10} offset={16} />
            {radarDataTriangle.map((item, index) => (
              <RadarArea index={index} key={item.label} />
            ))}
          </RadarChart>
        </div>
      ),
    },
    {
      title: "Radar Chart - Hexagon",
      description: "Six metrics, fill only without stroke or dots",
      code: `<RadarChart data={skillsData} metrics={skillMetrics} size={250}>
  <RadarGrid showLabels={false} />
  <RadarLabels />
  {skillsData.map((item, i) => (
    <RadarArea
      index={i}
      key={item.label}
      showGlow={false}
      showPoints={false}
      showStroke={false}
    />
  ))}
</RadarChart>`,
      render: () => (
        <div className={chartExampleRadialShellClassName}>
          <RadarChart data={radarDataSkills} metrics={radarMetrics6}>
            <RadarGrid showLabels={false} />
            <RadarLabels fontSize={10} offset={16} />
            {radarDataSkills.map((item, index) => (
              <RadarArea
                index={index}
                key={item.label}
                showGlow={false}
                showPoints={false}
                showStroke={false}
              />
            ))}
          </RadarChart>
        </div>
      ),
    },
    {
      title: "Radar Chart - Single Series",
      description: "One asymmetric profile without corner dots",
      code: `<RadarChart data={[data[0]]} metrics={metrics} size={250}>
  <RadarGrid />
  <RadarAxis />
  <RadarLabels />
  <RadarArea index={0} showPoints={false} />
</RadarChart>`,
      render: () => (
        <div className={chartExampleRadialShellClassName}>
          <RadarChart data={radarDataLopsided} metrics={radarMetrics5}>
            <RadarGrid />
            <RadarAxis />
            <RadarLabels fontSize={10} offset={16} />
            <RadarArea index={0} showPoints={false} />
          </RadarChart>
        </div>
      ),
    },
    {
      title: "Radar Chart - Minimal",
      description: "No grid labels, fewer levels, clean look",
      code: `<RadarChart data={data} levels={3} metrics={metrics} size={250}>
  <RadarGrid showLabels={false} />
  <RadarLabels />
  {data.map((item, i) => (
    <RadarArea index={i} key={item.label} showPoints={false} />
  ))}
</RadarChart>`,
      render: () => (
        <div className={chartExampleRadialShellClassName}>
          <RadarChart data={radarDataDual} levels={3} metrics={radarMetrics5}>
            <RadarGrid showLabels={false} />
            <RadarLabels fontSize={10} offset={16} />
            {radarDataDual.map((item, index) => (
              <RadarArea index={index} key={item.label} showPoints={false} />
            ))}
          </RadarChart>
        </div>
      ),
    },
    {
      title: "Radar Chart - Grid Only",
      description: "No axis lines for a softer appearance",
      code: `<RadarChart data={data} metrics={metrics} size={250}>
  <RadarGrid />
  <RadarLabels />
  {data.map((item, i) => (
    <RadarArea index={i} key={item.label} />
  ))}
</RadarChart>`,
      render: () => (
        <div className={chartExampleRadialShellClassName}>
          <RadarChart data={radarDataTriangle} metrics={radarMetrics3}>
            <RadarGrid />
            <RadarLabels fontSize={10} offset={16} />
            {radarDataTriangle.map((item, index) => (
              <RadarArea index={index} key={item.label} showGlow={false} />
            ))}
          </RadarChart>
        </div>
      ),
    },
  ];
}

function makeRingExamples(): ChartExample[] {
  return [
    {
      title: "Ring Chart",
      description: "Multi-ring progress with center value",
      code: `<RingChart data={ringData} size={250}>
  {ringData.map((item, index) => (
    <Ring index={index} key={item.label} />
  ))}
  <RingCenter defaultLabel="Sessions" />
</RingChart>`,
      render: () => (
        <div className={chartExampleRadialShellClassName}>
          <RingChart data={ringData}>
            {ringData.map((item, index) => (
              <Ring index={index} key={item.label} />
            ))}
            <RingCenter defaultLabel="Sessions" />
          </RingChart>
        </div>
      ),
    },
    {
      title: "Ring Chart - Flat Caps",
      description: "Square ring ends instead of rounded",
      code: `<RingChart data={ringData} size={250}>
  {ringData.map((item, index) => (
    <Ring index={index} key={item.label} lineCap="butt" />
  ))}
  <RingCenter defaultLabel="Sessions" />
</RingChart>`,
      render: () => (
        <div className={chartExampleRadialShellClassName}>
          <RingChart data={ringData}>
            {ringData.map((item, index) => (
              <Ring index={index} key={item.label} lineCap="butt" />
            ))}
            <RingCenter defaultLabel="Sessions" />
          </RingChart>
        </div>
      ),
    },
    {
      title: "Ring Chart - Thick Rings",
      description: "Wider stroke with larger gap between rings",
      code: `<RingChart data={financeData} ringGap={8} size={250} strokeWidth={18}>
  {financeData.map((item, index) => (
    <Ring index={index} key={item.label} />
  ))}
  <RingCenter defaultLabel="Total" formatOptions={{ notation: "compact" }} prefix="$" />
</RingChart>`,
      render: () => (
        <div className={chartExampleRadialShellClassName}>
          <RingChart data={ringFinanceData} ringGap={8} strokeWidth={18}>
            {ringFinanceData.map((item, index) => (
              <Ring index={index} key={item.label} />
            ))}
            <RingCenter
              defaultLabel="Total"
              formatOptions={{ notation: "compact" }}
              prefix="$"
            />
          </RingChart>
        </div>
      ),
    },
    {
      title: "Ring Chart - Three Quarter",
      description: "270-degree arc from top-left to bottom-left",
      code: `<RingChart
  data={goalData}
  endAngle={Math.PI / 2}
  size={250}
  startAngle={-Math.PI}
>
  {goalData.map((item, index) => (
    <Ring index={index} key={item.label} />
  ))}
  <RingCenter defaultLabel="Activity" />
</RingChart>`,
      render: () => (
        <div className={chartExampleRadialShellClassName}>
          <RingChart
            data={ringGoalData}
            endAngle={Math.PI / 2}
            startAngle={-Math.PI}
          >
            {ringGoalData.map((item, index) => (
              <Ring index={index} key={item.label} />
            ))}
            <RingCenter defaultLabel="Activity" />
          </RingChart>
        </div>
      ),
    },
    {
      title: "Ring Chart - Half Circle",
      description: "180-degree arc across the top",
      code: `<RingChart
  data={ringData}
  endAngle={0}
  size={250}
  startAngle={-Math.PI}
>
  {ringData.map((item, index) => (
    <Ring index={index} key={item.label} />
  ))}
</RingChart>`,
      render: () => (
        <div className={chartExampleRadialShellClassName}>
          <RingChart data={ringData} endAngle={0} startAngle={-Math.PI}>
            {ringData.map((item, index) => (
              <Ring index={index} key={item.label} />
            ))}
            <RingCenter defaultLabel="Sessions" />
          </RingChart>
        </div>
      ),
    },
    {
      title: "Ring Chart - Legend",
      description: "Interactive legend with progress bars",
      code: `const [hoveredIndex, setHoveredIndex] = useState(null);

<RingChart
  data={ringData}
  hoveredIndex={hoveredIndex}
  onHoverChange={setHoveredIndex}
  size={180}
>
  {ringData.map((_, i) => <Ring index={i} key={i} />)}
  <RingCenter defaultLabel="Sessions" />
</RingChart>
<Legend
  hoveredIndex={hoveredIndex}
  items={ringData}
  onHoverChange={setHoveredIndex}
>
  <LegendItemComponent>
    <LegendMarker />
    <LegendLabel />
    <LegendValue showPercentage />
    <LegendProgress />
  </LegendItemComponent>
</Legend>`,
      render: () => <RingWithLegend />,
    },
  ];
}

const gaugeGalleryUsdFormat: ChartStatFlowFormat = {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
};

function makeGaugeHero(): ChartExample {
  return {
    title: "Gauge",
    description:
      "Notch arc with PieCenter-style NumberFlow, theme fills, optional patterns in defs, and separate active / inactive arc gradients when enabled.",
    code: `<Gauge
  centerValue={428_000}
  defaultLabel="ARR run rate"
  formatOptions={{ style: "currency", currency: "USD", maximumFractionDigits: 0 }}
  inactiveFillOpacity={0.4}
  spacing={25}
  value={66}
/>`,
    data: "// Omit width and height for a responsive layout (min-width 300px by default).",
    render: () => (
      <div className={chartExampleGaugeShellClassName}>
        <Gauge
          centerValue={428_000}
          className={chartExampleGaugeClassName}
          defaultLabel="ARR run rate"
          formatOptions={gaugeGalleryUsdFormat}
          inactiveFillOpacity={0.4}
          minWidth={0}
          spacing={25}
          value={66}
        />
      </div>
    ),
  };
}

function makeGaugeExamples(): ChartExample[] {
  return [
    {
      title: "Gauge — tight arc, filleted corners",
      description:
        "No spacing between notches, 7px corner radius, custom sweep from 140° to 400°.",
      code: `<Gauge
  centerValue={428_000}
  defaultLabel="ARR run rate"
  endAngle={400}
  formatOptions={{ style: "currency", currency: "USD", maximumFractionDigits: 0 }}
  inactiveFillOpacity={0.4}
  notchCornerRadius={7}
  spacing={0}
  startAngle={140}
  value={66}
/>`,
      render: () => (
        <div className={chartExampleGaugeShellClassName}>
          <Gauge
            centerValue={428_000}
            className={chartExampleGaugeClassName}
            defaultLabel="ARR run rate"
            endAngle={400}
            formatOptions={gaugeGalleryUsdFormat}
            inactiveFillOpacity={0.4}
            minWidth={0}
            notchCornerRadius={7}
            spacing={0}
            startAngle={140}
            value={66}
          />
        </div>
      ),
    },
    {
      title: "Gauge — dual arc gradients",
      description:
        "Foreground and background notches each get their own hex ramp along the arc (requires useGradient).",
      code: `<Gauge
  activeGradient={["#a855f7", "#06b6d4"]}
  centerValue={428_000}
  defaultLabel="ARR run rate"
  endAngle={400}
  formatOptions={{ style: "currency", currency: "USD", maximumFractionDigits: 0 }}
  inactiveFillOpacity={0.4}
  inactiveGradient={["#334155", "#38bdf8"]}
  notchCornerRadius={7}
  spacing={0}
  startAngle={140}
  useGradient
  value={66}
/>`,
      render: () => (
        <div className={chartExampleGaugeShellClassName}>
          <Gauge
            activeGradient={["#a855f7", "#06b6d4"]}
            centerValue={428_000}
            className={chartExampleGaugeClassName}
            defaultLabel="ARR run rate"
            endAngle={400}
            formatOptions={gaugeGalleryUsdFormat}
            inactiveFillOpacity={0.4}
            inactiveGradient={["#334155", "#38bdf8"]}
            minWidth={0}
            notchCornerRadius={7}
            spacing={0}
            startAngle={140}
            useGradient
            value={66}
          />
        </div>
      ),
    },
    {
      title: "Gauge — pattern foreground, dim solid track",
      description:
        "Diagonal PatternLines on active notches; inactive track uses `chart-1` at 0.4 fill opacity.",
      code: `<Gauge
  activeFill="url(#gauge-gallery-ex3-fg)"
  centerValue={1840}
  defaultLabel="Trials converted (30d)"
  endAngle={400}
  formatOptions={{ maximumFractionDigits: 0 }}
  inactiveFill="var(--chart-1)"
  inactiveFillOpacity={0.4}
  notchCornerRadius={7}
  spacing={0}
  startAngle={140}
  value={66}
>
  <PatternLines
    height={6}
    id="gauge-gallery-ex3-fg"
    orientation={["diagonal"]}
    stroke="var(--chart-1)"
    strokeWidth={1}
    width={6}
  />
</Gauge>`,
      render: () => (
        <div className={chartExampleGaugeShellClassName}>
          <Gauge
            activeFill="url(#gauge-gallery-ex3-fg)"
            centerValue={1840}
            className={chartExampleGaugeClassName}
            defaultLabel="Trials converted (30d)"
            endAngle={400}
            formatOptions={{ maximumFractionDigits: 0 }}
            inactiveFill="var(--chart-1)"
            inactiveFillOpacity={0.4}
            minWidth={0}
            notchCornerRadius={7}
            spacing={0}
            startAngle={140}
            value={66}
          >
            <PatternLines
              height={6}
              id="gauge-gallery-ex3-fg"
              orientation={["diagonal"]}
              stroke="var(--chart-1)"
              strokeWidth={1}
              width={6}
            />
          </Gauge>
        </div>
      ),
    },
    {
      title: "Gauge — sparse ring, quarter sweep",
      description:
        "Fewer notches, wide spacing, sharp corners, 90° → 270° sweep — reads like a progress ring segment.",
      code: `<Gauge
  centerValue={12}
  defaultLabel="Active squads"
  endAngle={270}
  formatOptions={{ maximumFractionDigits: 0 }}
  inactiveFillOpacity={0.4}
  spacing={60}
  startAngle={90}
  totalNotches={33}
  value={66}
/>`,
      render: () => (
        <div className={chartExampleGaugeShellClassName}>
          <Gauge
            centerValue={12}
            className={chartExampleGaugeClassName}
            defaultLabel="Active squads"
            endAngle={270}
            formatOptions={{ maximumFractionDigits: 0 }}
            inactiveFillOpacity={0.4}
            minWidth={0}
            spacing={60}
            startAngle={90}
            totalNotches={33}
            value={66}
          />
        </div>
      ),
    },
    {
      title: "Gauge — same density, bottom half sweep",
      description:
        "Same notch layout as the sparse ring example, but the arc runs 180° → 360° (lower semicircle emphasis).",
      code: `<Gauge
  centerValue={12}
  defaultLabel="Active squads"
  endAngle={360}
  formatOptions={{ maximumFractionDigits: 0 }}
  inactiveFillOpacity={0.4}
  spacing={60}
  startAngle={180}
  totalNotches={33}
  value={66}
/>`,
      render: () => (
        <div className={chartExampleGaugeShellClassName}>
          <Gauge
            centerValue={12}
            className={chartExampleGaugeClassName}
            defaultLabel="Active squads"
            endAngle={360}
            formatOptions={{ maximumFractionDigits: 0 }}
            inactiveFillOpacity={0.4}
            minWidth={0}
            spacing={60}
            startAngle={180}
            totalNotches={33}
            value={66}
          />
        </div>
      ),
    },
    {
      title: "Gauge — flipped sweep (270° → 450°)",
      description:
        "Same spacing and notch count as the quarter sweep, rotated so the gap sits on the opposite side of the ring.",
      code: `<Gauge
  centerValue={12}
  defaultLabel="Active squads"
  endAngle={450}
  formatOptions={{ maximumFractionDigits: 0 }}
  inactiveFillOpacity={0.4}
  spacing={60}
  startAngle={270}
  totalNotches={33}
  value={66}
/>`,
      render: () => (
        <div className={chartExampleGaugeShellClassName}>
          <Gauge
            centerValue={12}
            className={chartExampleGaugeClassName}
            defaultLabel="Active squads"
            endAngle={450}
            formatOptions={{ maximumFractionDigits: 0 }}
            inactiveFillOpacity={0.4}
            minWidth={0}
            spacing={60}
            startAngle={270}
            totalNotches={33}
            value={66}
          />
        </div>
      ),
    },
    {
      title: "Gauge — soft fillets, full depth",
      description:
        "Default notch length with an 8px corner radius — smooth joints without going fully pill-shaped.",
      code: `<Gauge
  centerValue={428_000}
  defaultLabel="ARR run rate"
  formatOptions={{ style: "currency", currency: "USD", maximumFractionDigits: 0 }}
  inactiveFillOpacity={0.4}
  notchCornerRadius={8}
  notchLengthPercent={100}
  spacing={25}
  value={66}
/>`,
      render: () => (
        <div className={chartExampleGaugeShellClassName}>
          <Gauge
            centerValue={428_000}
            className={chartExampleGaugeClassName}
            defaultLabel="ARR run rate"
            formatOptions={gaugeGalleryUsdFormat}
            inactiveFillOpacity={0.4}
            minWidth={0}
            notchCornerRadius={8}
            notchLengthPercent={100}
            spacing={25}
            value={66}
          />
        </div>
      ),
    },
    {
      title: "Gauge — short notches, bold corners",
      description:
        "Radial depth at 38% with a 12px fillet — stubbier ticks that still read soft at the tips.",
      code: `<Gauge
  centerValue={428_000}
  defaultLabel="ARR run rate"
  formatOptions={{ style: "currency", currency: "USD", maximumFractionDigits: 0 }}
  inactiveFillOpacity={0.4}
  notchCornerRadius={12}
  notchLengthPercent={38}
  spacing={25}
  value={66}
/>`,
      render: () => (
        <div className={chartExampleGaugeShellClassName}>
          <Gauge
            centerValue={428_000}
            className={chartExampleGaugeClassName}
            defaultLabel="ARR run rate"
            formatOptions={gaugeGalleryUsdFormat}
            inactiveFillOpacity={0.4}
            minWidth={0}
            notchCornerRadius={12}
            notchLengthPercent={38}
            spacing={25}
            value={66}
          />
        </div>
      ),
    },
    {
      title: "Gauge — near-circular notches",
      description:
        "Full default depth with a 22px corner radius (geometry-clamped) for a capsule / almost-round look.",
      code: `<Gauge
  centerValue={428_000}
  defaultLabel="ARR run rate"
  endAngle={400}
  formatOptions={{ style: "currency", currency: "USD", maximumFractionDigits: 0 }}
  inactiveFillOpacity={0.4}
  notchCornerRadius={22}
  notchLengthPercent={100}
  spacing={0}
  startAngle={140}
  value={66}
/>`,
      render: () => (
        <div className={chartExampleGaugeShellClassName}>
          <Gauge
            centerValue={428_000}
            className={chartExampleGaugeClassName}
            defaultLabel="ARR run rate"
            endAngle={400}
            formatOptions={gaugeGalleryUsdFormat}
            inactiveFillOpacity={0.4}
            minWidth={0}
            notchCornerRadius={22}
            notchLengthPercent={100}
            spacing={0}
            startAngle={140}
            value={66}
          />
        </div>
      ),
    },
  ];
}

function makeSankeyExamples(): ChartExample[] {
  return [
    {
      title: "Sankey Chart",
      description: "User flow with labels and tooltip",
      code: `<SankeyChart data={data} margin={{ top: 8, right: 8, bottom: 40, left: 8 }} nodePadding={24} nodeWidth={16}>
  <SankeyLink />
  <SankeyNode lineCap={4} />
  <SankeyTooltip />
</SankeyChart>`,
      render: () => (
        <SankeyExampleChart
          aspectRatio="4 / 3"
          data={sankeyAnalytics}
          nodePadding={24}
          nodeWidth={16}
        >
          <SankeyLink />
          <SankeyNode lineCap={4} />
          <SankeyTooltip />
        </SankeyExampleChart>
      ),
    },
    {
      title: "Sankey Chart - No Labels",
      description: "Compact diagram without node labels",
      code: `<SankeyChart
  data={data}
  margin={{ top: 8, right: 8, bottom: 40, left: 8 }}
  nodePadding={24}
  nodeWidth={16}
>
  <SankeyLink />
  <SankeyNode lineCap={4} showLabels={false} />
  <SankeyTooltip />
</SankeyChart>`,
      render: () => (
        <SankeyExampleChart
          aspectRatio="4 / 3"
          data={sankeyAnalytics}
          nodePadding={24}
          nodeWidth={16}
        >
          <SankeyLink />
          <SankeyNode lineCap={4} showLabels={false} />
          <SankeyTooltip />
        </SankeyExampleChart>
      ),
    },
    {
      title: "Sankey Chart - Simple",
      description: "Minimal flow with fewer nodes",
      code: `<SankeyChart data={simpleData} margin={{ top: 8, right: 8, bottom: 40, left: 8 }} nodePadding={20} nodeWidth={12}>
  <SankeyLink strokeOpacity={0.5} />
  <SankeyNode lineCap={3} />
  <SankeyTooltip />
</SankeyChart>`,
      render: () => (
        <SankeyExampleChart
          aspectRatio="4 / 3"
          data={sankeySimple}
          nodePadding={20}
          nodeWidth={12}
        >
          <SankeyLink strokeOpacity={0.5} />
          <SankeyNode lineCap={3} />
          <SankeyTooltip />
        </SankeyExampleChart>
      ),
    },
    {
      title: "Sankey Chart - Solid Links",
      description: "Single-color links instead of gradients",
      code: `<SankeyChart data={data} margin={{ top: 8, right: 8, bottom: 40, left: 8 }} nodePadding={24} nodeWidth={16}>
  <SankeyLink stroke="var(--chart-3)" strokeOpacity={0.3} useGradient={false} />
  <SankeyNode lineCap={4} />
  <SankeyTooltip />
</SankeyChart>`,
      render: () => (
        <SankeyExampleChart
          aspectRatio="4 / 3"
          data={sankeyAnalytics}
          nodePadding={24}
          nodeWidth={16}
        >
          <SankeyLink
            stroke="var(--chart-3)"
            strokeOpacity={0.3}
            useGradient={false}
          />
          <SankeyNode lineCap={4} />
          <SankeyTooltip />
        </SankeyExampleChart>
      ),
    },
  ];
}

function makeChoroplethExamples(): ChartExample[] {
  return [
    {
      title: "Choropleth Chart",
      description: "World map with single fill color and graticule",
      code: `<ChoroplethChart aspectRatio="16 / 9" data={geojson} margin={{ top: 8, right: 8, bottom: 40, left: 8 }}>
  <ChoroplethGraticule />
  <ChoroplethFeatureComponent fill="var(--chart-3)" />
  <ChoroplethTooltip />
</ChoroplethChart>`,
      render: () => <ChoroplethBasic />,
    },
    {
      title: "Choropleth Chart - Analytics",
      description: "Color scale based on visitor traffic by country",
      code: `<ChoroplethChart aspectRatio="16 / 9" data={geojson} margin={{ top: 8, right: 8, bottom: 40, left: 8 }}>
  <ChoroplethFeatureComponent getFeatureColor={getVisitorColor} />
  <ChoroplethTooltip
    getFeatureValue={getVisitorValue}
    valueLabel="Visitors"
  />
</ChoroplethChart>`,
      render: () => <ChoroplethAnalytics />,
    },
    {
      title: "Choropleth Chart - Graticule",
      description: "Visible latitude and longitude grid lines",
      code: `<ChoroplethChart aspectRatio="16 / 9" data={geojson} margin={{ top: 8, right: 8, bottom: 40, left: 8 }}>
  <ChoroplethGraticule stroke="rgba(255,255,255,0.15)" />
  <ChoroplethFeatureComponent fill="var(--chart-1)" />
  <ChoroplethTooltip />
</ChoroplethChart>`,
      render: () => <ChoroplethWithGraticule />,
    },
    {
      title: "Choropleth Chart - Patterns",
      description: "Diagonal line patterns colored by region",
      code: `<ChoroplethChart aspectRatio="16 / 9" data={geojson} margin={{ top: 8, right: 8, bottom: 40, left: 8 }}>
  <ChoroplethFeatureComponent
    patterns={<PatternLines id="p-americas" stroke="var(--chart-1)" ... />}
    getFeaturePattern={(feat) => \`pattern-\${getRegion(feat)}\`}
  />
  <ChoroplethTooltip />
</ChoroplethChart>`,
      render: () => <ChoroplethPattern />,
    },
  ];
}

function candlestickIndicatorColor(point: Record<string, unknown>): string {
  const close = (point.close as number) ?? 0;
  const open = (point.open as number) ?? 0;
  return close >= open ? "var(--color-emerald-500)" : "var(--color-red-500)";
}

function makeCandlestickExamples(): ChartExample[] {
  return [
    {
      title: "Candlestick – Tooltip line matches candle",
      description:
        "Lime–emerald and yellow–red gradients. Crosshair color matches the focused candle (green/red); no dot.",
      code: `<LinearGradient from="var(--color-lime-400)" id="candle-up" to="var(--color-emerald-500)" />
<LinearGradient from="var(--color-yellow-400)" id="candle-down" to="var(--color-red-500)" />
<CandlestickChart data={ohlcData} margin={{ top: 8, right: 8, bottom: 40, left: 8 }} style={{ height: 320 }}>
  <Candlestick
    fadedOpacity={0.25}
    negativeFill="url(#candle-down)"
    positiveFill="url(#candle-up)"
  />
  <ChartTooltip
    content={OHLCTooltipContent}
    indicatorColor={(p) => (p.close >= p.open) ? "var(--color-emerald-500)" : "var(--color-red-500)"}
    showDots={false}
  />
  <XAxis />
</CandlestickChart>`,
      render: () => (
        <CandlestickExampleChart
          data={candlestickOhlcData}
          style={{ height: 320 }}
        >
          <LinearGradient
            from="var(--color-lime-400)"
            id="candlestick-hero-up"
            to="var(--color-emerald-500)"
          />
          <LinearGradient
            from="var(--color-yellow-400)"
            id="candlestick-hero-down"
            to="var(--color-red-500)"
          />
          <Candlestick
            fadedOpacity={0.25}
            negativeFill="url(#candlestick-hero-down)"
            positiveFill="url(#candlestick-hero-up)"
          />
          <ChartTooltip
            content={CandlestickTooltipContent}
            indicatorColor={candlestickIndicatorColor}
            showDots={false}
          />
          <XAxis />
        </CandlestickExampleChart>
      ),
    },
    {
      title: "Candlestick – Chart 1 & 3",
      description: "Using --chart-1 and --chart-3 for a stronger contrast",
      code: `<CandlestickChart data={ohlcData} margin={{ top: 8, right: 8, bottom: 40, left: 8 }} style={{ height: 320 }}>
  <Candlestick
    fadedOpacity={0.25}
    negativeFill="var(--chart-3)"
    positiveFill="var(--chart-1)"
  />
  <ChartTooltip content={CandlestickTooltipContent} />
  <XAxis />
</CandlestickChart>`,
      render: () => (
        <CandlestickExampleChart
          data={candlestickOhlcData}
          style={{ height: 320 }}
        >
          <Candlestick
            fadedOpacity={0.25}
            negativeFill="var(--chart-3)"
            positiveFill="var(--chart-1)"
          />
          <ChartTooltip content={CandlestickTooltipContent} />
          <XAxis />
        </CandlestickExampleChart>
      ),
    },
    {
      title: "Candlestick – Lime to emerald, yellow to red",
      description: "Custom gradients: lime–emerald for up, yellow–red for down",
      code: `<LinearGradient from="var(--color-lime-400)" id="up" to="var(--color-emerald-500)" />
<LinearGradient from="var(--color-yellow-400)" id="down" to="var(--color-red-500)" />
<CandlestickChart data={ohlcData} margin={{ top: 8, right: 8, bottom: 40, left: 8 }} style={{ height: 320 }}>
  <Candlestick fadedOpacity={0.25} negativeFill="url(#down)" positiveFill="url(#up)" />
  <ChartTooltip content={CandlestickTooltipContent} />
  <XAxis />
</CandlestickChart>`,
      render: () => (
        <CandlestickExampleChart
          data={candlestickOhlcData}
          style={{ height: 320 }}
        >
          <LinearGradient
            from="var(--color-lime-400)"
            id="candlestick-lime-emerald"
            to="var(--color-emerald-500)"
          />
          <LinearGradient
            from="var(--color-yellow-400)"
            id="candlestick-yellow-red"
            to="var(--color-red-500)"
          />
          <Candlestick
            fadedOpacity={0.25}
            negativeFill="url(#candlestick-yellow-red)"
            positiveFill="url(#candlestick-lime-emerald)"
          />
          <ChartTooltip content={CandlestickTooltipContent} />
          <XAxis />
        </CandlestickExampleChart>
      ),
    },
    {
      title: "Candlestick – Solid colors",
      description: "Solid emerald/red fills instead of gradients",
      code: `<CandlestickChart candleWidth={8} data={ohlcData} margin={{ top: 8, right: 8, bottom: 40, left: 8 }} style={{ height: 320 }}>
  <Candlestick
    negativeFill="var(--color-red-500)"
    positiveFill="var(--color-emerald-500)"
  />
  <ChartTooltip content={CandlestickTooltipContent} />
  <XAxis />
</CandlestickChart>`,
      render: () => (
        <CandlestickExampleChart
          candleWidth={8}
          data={candlestickOhlcData}
          style={{ height: 320 }}
        >
          <Candlestick
            negativeFill="var(--color-red-500)"
            positiveFill="var(--color-emerald-500)"
          />
          <ChartTooltip content={CandlestickTooltipContent} />
          <XAxis />
        </CandlestickExampleChart>
      ),
    },
    {
      title: "Candlestick – Pattern",
      description: "Diagonal pattern overlay on candle bodies",
      code: `<CandlestickChart candleGap={0.15} data={ohlcData} margin={{ top: 8, right: 8, bottom: 40, left: 8 }} style={{ height: 320 }}>
  <PatternLines id="candle-up" orientation={["diagonal"]} stroke="rgba(0,0,0,0.35)" ... PatternLines
  >/> id="candle-down" orientation={["diagonal"]} stroke="rgba(0,0,0,0.35)" ... Candlestick
  >/> bodyPatternNegative="url(#candle-down)" bodyPatternPositive="url(#candle-up)" />
  <ChartTooltip content={CandlestickTooltipContent} />
  <XAxis />
</CandlestickChart>`,
      render: () => (
        <CandlestickExampleChart
          candleGap={0.15}
          data={candlestickOhlcData}
          style={{ height: 320 }}
        >
          <PatternLines
            height={8}
            id="candle-pattern-up"
            orientation={["diagonal"]}
            stroke="rgba(0,0,0,0.35)"
            strokeWidth={1.5}
            width={8}
          />
          <PatternLines
            height={8}
            id="candle-pattern-down"
            orientation={["diagonal"]}
            stroke="rgba(0,0,0,0.35)"
            strokeWidth={1.5}
            width={8}
          />
          <Candlestick
            bodyPatternNegative="url(#candle-pattern-down)"
            bodyPatternPositive="url(#candle-pattern-up)"
            insideStrokeWidth={1}
          />
          <ChartTooltip content={CandlestickTooltipContent} />
          <XAxis />
        </CandlestickExampleChart>
      ),
    },
    {
      title: "Candlestick – Tooltip only",
      description: "Tooltip box without crosshair or dots",
      code: `<CandlestickChart data={ohlcData} margin={{ top: 8, right: 8, bottom: 40, left: 8 }} style={{ height: 320 }}>
  <Candlestick fadedOpacity={0.25} />
  <ChartTooltip content={CandlestickTooltipContent} showCrosshair={false} showDots={false} />
  <XAxis />
</CandlestickChart>`,
      render: () => (
        <CandlestickExampleChart
          data={candlestickOhlcData}
          style={{ height: 320 }}
        >
          <Candlestick fadedOpacity={0.25} />
          <ChartTooltip
            content={CandlestickTooltipContent}
            showCrosshair={false}
            showDots={false}
          />
          <XAxis />
        </CandlestickExampleChart>
      ),
    },
  ];
}

function candlestickChartPaletteIndicatorColor(
  point: Record<string, unknown>
): string {
  const close = (point.close as number) ?? 0;
  const open = (point.open as number) ?? 0;
  return close >= open ? "var(--chart-1)" : "var(--chart-5)";
}

function makeCandlestickHero(): ChartExample {
  return {
    title: "Candlestick Chart – Tooltip line matches candle",
    description:
      "Default palette (--chart-1 and --chart-5). The crosshair color follows the focused candle; no dot.",
    code: `<CandlestickChart data={ohlcData} margin={{ top: 8, right: 8, bottom: 40, left: 8 }} style={{ height: 320 }}>
  <Candlestick
    fadedOpacity={0.25}
    negativeFill="var(--chart-5)"
    positiveFill="var(--chart-1)"
  />
  <ChartTooltip
    content={OHLCTooltipContent}
    indicatorColor={(p) => (p.close >= p.open) ? "var(--chart-1)" : "var(--chart-5)"}
    showDots={false}
  />
  <XAxis />
</CandlestickChart>`,
    data: `interface OHLCDataPoint {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
}
const ohlcData: OHLCDataPoint[] = [ ... ];`,
    render: () => (
      <CandlestickExampleChart
        data={candlestickOhlcData}
        style={{ height: 320 }}
      >
        <Candlestick
          fadedOpacity={0.25}
          negativeFill="var(--chart-5)"
          positiveFill="var(--chart-1)"
        />
        <ChartTooltip
          content={CandlestickTooltipContent}
          indicatorColor={candlestickChartPaletteIndicatorColor}
          showDots={false}
        />
        <XAxis />
      </CandlestickExampleChart>
    ),
  };
}

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Hero examples (full-width, richer composition)
// ---------------------------------------------------------------------------

/** Catmull–Rom (α 0.42) for hero curve menu + composed gallery; see https://visx.airbnb.tech/docs/curve */

const HERO_CURVE_OPTIONS = [
  { value: "natural", label: "Natural", curve: curveNatural },
  { value: "monotoneX", label: "Monotone X", curve: curveMonotoneX },
  { value: "linear", label: "Linear", curve: curveLinear },
  { value: "step", label: "Step", curve: curveStep },
  { value: "basis", label: "Basis", curve: curveBasis },
  {
    value: "catmullRom",
    label: "Catmull–Rom",
    curve: composedHeroSmoothCurve,
  },
] as const;

const lineHeroData = Array.from({ length: 30 }, (_, i) => ({
  date: new Date(2024, 0, i + 1),
  desktop: Math.floor(150 + Math.sin(i / 4) * 80 + ((i * 7) % 31)),
  mobile: Math.floor(80 + Math.cos(i / 3) * 50 + ((i * 5) % 23)),
}));

const areaHeroData = Array.from({ length: 30 }, (_, i) => ({
  date: new Date(2024, 0, i + 1),
  revenue: Math.floor(8000 + Math.sin(i / 5) * 4000 + ((i * 11) % 2000)),
  costs: Math.floor(5000 + Math.cos(i / 4) * 2000 + ((i * 7) % 1500)),
}));

function ChartHeroCurveToolbar({
  value,
  onValueChange,
}: {
  value: string;
  onValueChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <span className="text-muted-foreground text-xs">Curve</span>
      <Select
        onValueChange={(v) => {
          if (v != null) {
            onValueChange(v);
          }
        }}
        value={value}
      >
        <SelectTrigger
          aria-label="Chart curve"
          className="h-8 w-[min(100%,11rem)] text-xs"
        >
          <SelectValue placeholder="Curve" />
        </SelectTrigger>
        <SelectContent alignItemWithTrigger={false}>
          {HERO_CURVE_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function LineHeroWithCurveSelect() {
  const [curveId, setCurveId] = useState("natural");
  const curve = useMemo(() => {
    const hit = HERO_CURVE_OPTIONS.find((o) => o.value === curveId);
    return hit?.curve ?? curveNatural;
  }, [curveId]);

  return (
    <div className="space-y-3">
      <ChartHeroCurveToolbar onValueChange={setCurveId} value={curveId} />
      <LineExampleChart aspectRatio="4 / 1" data={lineHeroData}>
        <Grid horizontal />
        <Line
          curve={curve}
          dataKey="desktop"
          stroke="var(--chart-1)"
          strokeWidth={2}
        />
        <Line
          curve={curve}
          dataKey="mobile"
          stroke="var(--chart-3)"
          strokeWidth={2}
        />
        <XAxis />
        <ChartTooltip />
      </LineExampleChart>
    </div>
  );
}

function AreaHeroWithCurveSelect() {
  const [curveId, setCurveId] = useState("monotoneX");
  const curve = useMemo(() => {
    const hit = HERO_CURVE_OPTIONS.find((o) => o.value === curveId);
    return hit?.curve ?? curveMonotoneX;
  }, [curveId]);

  return (
    <div className="space-y-3">
      <ChartHeroCurveToolbar onValueChange={setCurveId} value={curveId} />
      <AreaExampleChart aspectRatio="4 / 1" data={areaHeroData}>
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
      </AreaExampleChart>
    </div>
  );
}

function ComposedHeroWithCurveSelect() {
  const [curveId, setCurveId] = useState("catmullRom");
  const curve = useMemo(() => {
    const hit = HERO_CURVE_OPTIONS.find((o) => o.value === curveId);
    return hit?.curve ?? composedHeroSmoothCurve;
  }, [curveId]);

  return (
    <div className="space-y-3">
      <ChartHeroCurveToolbar onValueChange={setCurveId} value={curveId} />
      <ComposedExampleChart
        aspectRatio="2 / 1"
        barGap={0}
        data={composedDemoData as unknown as Record<string, unknown>[]}
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
      </ComposedExampleChart>
    </div>
  );
}

const barHeroData = Array.from({ length: 90 }, (_, i) => {
  const date = new Date(2024, 0, 1);
  date.setDate(date.getDate() + i);
  const baseValue = 50 + Math.sin(i / 7) * 30;
  const variation = ((i * 7) % 37) - 18;
  return {
    day: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    value: Math.floor(baseValue + variation),
  };
});

function makeProfitLossLineExamples(): ChartExample[] {
  return [
    {
      title: "Profit/Loss Line",
      description:
        "Sign-colored segments with a highlighted zero baseline and legend hover",
      code: `import {
  ProfitLossLine,
  ProfitLossLegend,
  ProfitLossLegendHoverProvider,
  profitLossColor,
  resolveProfitLossTooltipLabel,
} from "@bklitui/ui/charts";

<LineChart data={data}>
  <Grid highlightRowValues={[0]} horizontal />
  <Line dataKey="pnl" stroke="transparent" strokeWidth={0} showHighlight={false} />
  <ProfitLossLegendHoverProvider hoveredIndex={legendHoveredIndex}>
    <ProfitLossLine dataKey="pnl" />
  </ProfitLossLegendHoverProvider>
  <XAxis />
  <ChartTooltip
    indicatorColor={(point) => profitLossColor(point.pnl ?? 0)}
    rows={(point) => [{
      label: resolveProfitLossTooltipLabel(""),
      value: point.pnl ?? 0,
      color: profitLossColor(point.pnl ?? 0),
    }]}
  />
</LineChart>
<ProfitLossLegend align="center" />`,
      footer: "Legend below the chart, centered",
      render: () => <ProfitLossLineExampleWithState />,
    },
    {
      title: "Profit/Loss Line - Left Y axis",
      description:
        "Sign-colored line with a left Y-axis scale and zero baseline",
      code: `<LineChart data={data} margin={{ top: 40, right: 40, bottom: 40, left: 56 }}>
  <Grid highlightRowValues={[0]} horizontal />
  <Line dataKey="pnl" stroke="transparent" strokeWidth={0} showHighlight={false} />
  <ProfitLossLine dataKey="pnl" />
  <YAxis yAxisId="left" />
  <XAxis />
  <ChartTooltip />
</LineChart>`,
      render: () => (
        <LineExampleChart
          data={profitLossLineDocsData}
          margin={{ top: 40, right: 40, bottom: 40, left: 56 }}
        >
          <Grid highlightRowValues={[0]} horizontal />
          <Line
            dataKey="pnl"
            showHighlight={false}
            stroke="transparent"
            strokeWidth={0}
          />
          <ProfitLossLine dataKey="pnl" />
          <YAxis yAxisId="left" />
          <XAxis />
          <ChartTooltip
            indicatorColor={(point) =>
              profitLossColor((point.pnl as number) ?? 0)
            }
            rows={(point) => [
              {
                label: resolveProfitLossTooltipLabel(""),
                value: (point.pnl as number) ?? 0,
                color: profitLossColor((point.pnl as number) ?? 0),
              },
            ]}
          />
        </LineExampleChart>
      ),
    },
  ];
}

function makeLineHero(): ChartExample {
  return {
    title: "Line Chart - Interactive",
    description:
      "Desktop vs mobile visitors over 30 days. Use the curve menu to compare @visx/curve factories on both lines.",
    code: `import { curveNatural } from "@visx/curve";

<LineChart data={chartData} margin={{ top: 8, right: 8, bottom: 40, left: 8 }}>
  <Grid horizontal />
  <Line curve={curveNatural} dataKey="desktop" stroke="var(--chart-1)" strokeWidth={2} />
  <Line curve={curveNatural} dataKey="mobile" stroke="var(--chart-3)" strokeWidth={2} />
  <XAxis />
  <ChartTooltip />
</LineChart>`,
    data: `const chartData = Array.from({ length: 30 }, (_, i) => ({
  date: new Date(2024, 0, i + 1),
  desktop: Math.floor(150 + Math.sin(i / 4) * 80 + ((i * 7) % 31)),
  mobile: Math.floor(80 + Math.cos(i / 3) * 50 + ((i * 5) % 23)),
}));`,
    footer:
      "Hero uses a Radix Select to swap curves live; see https://visx.airbnb.tech/docs/curve for the full list.",
    render: () => <LineHeroWithCurveSelect />,
  };
}

function makeAreaHero(): ChartExample {
  return {
    title: "Area Chart - Interactive",
    description:
      "Revenue vs costs over 30 days with segment selection. Use the curve menu to compare @visx/curve on both areas.",
    code: `import { curveMonotoneX } from "@visx/curve";

<AreaChart aspectRatio="4 / 1" data={chartData}>
  <Grid horizontal />
  <Area curve={curveMonotoneX} dataKey="revenue" fill="var(--chart-line-primary)" fillOpacity={0.3} strokeWidth={2} />
  <Area curve={curveMonotoneX} dataKey="costs" fill="var(--chart-line-secondary)" fillOpacity={0.2} strokeWidth={1.5} />
  <SegmentBackground />
  <SegmentLineFrom />
  <SegmentLineTo />
  <XAxis />
  <ChartTooltip />
</AreaChart>`,
    data: `const chartData = Array.from({ length: 30 }, (_, i) => ({
  date: new Date(2024, 0, i + 1),
  revenue: Math.floor(8000 + Math.sin(i / 5) * 4000 + ((i * 11) % 2000)),
  costs: Math.floor(5000 + Math.cos(i / 4) * 2000 + ((i * 7) % 1500)),
}));`,
    footer:
      "Click and drag to select a range. Hero curve menu uses the same Area `curve` prop for revenue and costs.",
    render: () => <AreaHeroWithCurveSelect />,
  };
}

function makeBarHero(): ChartExample {
  return {
    title: "Bar Chart - Interactive",
    description: "Daily activity over the last 90 days",
    code: `<BarChart aspectRatio="4 / 1" barGap={0.1} data={dailyData} margin={{ top: 8, right: 8, bottom: 40, left: 8 }} xDataKey="day">
  <Grid horizontal />
  <Bar dataKey="value" lineCap="butt" />
  <BarXAxis maxLabels={8} />
  <ChartTooltip />
</BarChart>`,
    data: `const dailyData = Array.from({ length: 90 }, (_, i) => {
  const date = new Date(2024, 0, 1);
  date.setDate(date.getDate() + i);
  return {
    day: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    value: Math.floor(50 + Math.sin(i / 7) * 30 + ((i * 7) % 37) - 18),
  };
});`,
    render: () => (
      <BarExampleChart
        aspectRatio="4 / 1"
        barGap={0.1}
        data={barHeroData}
        xDataKey="day"
      >
        <Grid horizontal />
        <Bar dataKey="value" lineCap="butt" />
        <BarXAxis maxLabels={8} />
        <ChartTooltip />
      </BarExampleChart>
    ),
  };
}

function SankeyHeroInner() {
  return (
    <SankeyExampleChart
      aspectRatio="5 / 2"
      data={sankeyAnalytics}
      nodePadding={24}
      nodeWidth={16}
    >
      <SankeyLink />
      <SankeyNode lineCap={4} />
      <SankeyTooltip />
    </SankeyExampleChart>
  );
}

function makeSankeyHero(): ChartExample {
  return {
    title: "Sankey Chart - Interactive",
    description: "User flow from source to outcome",
    code: `<SankeyChart data={analyticsData} margin={{ top: 8, right: 8, bottom: 40, left: 8 }} nodePadding={24} nodeWidth={16}>
  <SankeyLink />
  <SankeyNode lineCap={4} />
  <SankeyTooltip />
</SankeyChart>`,
    render: () => <SankeyHeroInner />,
  };
}

function ChoroplethHeroInner() {
  const { worldData, isLoading } = useWorldDataStandalone();
  if (isLoading || !worldData) {
    return <ChoroplethLoading />;
  }
  return (
    <ChoroplethExampleChart aspectRatio="2 / 1" data={worldData}>
      <ChoroplethGraticule />
      <ChoroplethFeatureComponent getFeatureColor={getVisitorColor} />
      <ChoroplethTooltip
        getFeatureValue={getVisitorValue}
        valueLabel="Visitors"
      />
    </ChoroplethExampleChart>
  );
}

function makeChoroplethHero(): ChartExample {
  return {
    title: "Choropleth Chart - Interactive",
    description: "Visitor traffic by country",
    code: `<ChoroplethChart aspectRatio="2 / 1" data={geojson} margin={{ top: 8, right: 8, bottom: 40, left: 8 }}>
  <ChoroplethGraticule />
  <ChoroplethFeatureComponent getFeatureColor={getVisitorColor} />
  <ChoroplethTooltip getFeatureValue={getVisitorValue} valueLabel="Visitors" />
</ChoroplethChart>`,
    render: () => <ChoroplethHeroInner />,
  };
}

// ---------------------------------------------------------------------------
// Funnel chart examples
// ---------------------------------------------------------------------------

const funnelData: FunnelStage[] = [
  { label: "Visitors", value: 12_400, displayValue: "12.4k" },
  { label: "Leads", value: 6800, displayValue: "6.8k" },
  { label: "Qualified", value: 3200, displayValue: "3.2k" },
  { label: "Proposals", value: 1500, displayValue: "1.5k" },
  { label: "Closed", value: 620, displayValue: "620" },
];

const funnelDataColored: FunnelStage[] = [
  { label: "Awareness", value: 4100, color: "var(--chart-1)" },
  { label: "Interest", value: 2957, color: "var(--chart-2)" },
  { label: "Consideration", value: 1084, color: "var(--chart-3)" },
  { label: "Intent", value: 1038, color: "var(--chart-4)" },
  { label: "Purchase", value: 320, color: "var(--chart-5)" },
];

const funnelDataGradient: FunnelStage[] = [
  {
    label: "Awareness",
    value: 4100,
    gradient: [
      { offset: "0%", color: "var(--chart-1)" },
      { offset: "100%", color: "var(--chart-2)" },
    ],
  },
  {
    label: "Interest",
    value: 2957,
    gradient: [
      { offset: "0%", color: "var(--chart-2)" },
      { offset: "100%", color: "var(--chart-3)" },
    ],
  },
  {
    label: "Consideration",
    value: 1084,
    gradient: [
      { offset: "0%", color: "var(--chart-3)" },
      { offset: "100%", color: "var(--chart-4)" },
    ],
  },
  {
    label: "Intent",
    value: 1038,
    gradient: [
      { offset: "0%", color: "var(--chart-4)" },
      { offset: "100%", color: "var(--chart-5)" },
    ],
  },
  {
    label: "Purchase",
    value: 320,
    gradient: [
      { offset: "0%", color: "var(--chart-5)" },
      { offset: "100%", color: "var(--chart-5)" },
    ],
  },
];

function FunnelHeroWithLegend() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const legendItems = funnelData.map((d) => ({
    label: d.label,
    value: d.value,
    color: "var(--chart-1)",
  }));
  return (
    <div className="flex flex-col gap-4">
      <FunnelChart
        className="max-h-[350px]"
        color="var(--chart-1)"
        data={funnelData}
        hoveredIndex={hoveredIndex}
        layers={3}
        onHoverChange={setHoveredIndex}
        orientation="horizontal"
      />
      <Legend
        className="flex-row flex-wrap justify-center gap-x-4 gap-y-1"
        hoveredIndex={hoveredIndex}
        items={legendItems}
        onHoverChange={setHoveredIndex}
      >
        <LegendItemComponent className="flex items-center gap-1.5">
          <LegendMarker />
          <LegendLabel className="text-xs" />
        </LegendItemComponent>
      </Legend>
    </div>
  );
}

function makeFunnelHero(): ChartExample {
  return {
    title: "Funnel Chart",
    description:
      "Animated funnel chart with multi-layer halo rings, hover interactions, and an interactive legend.",
    code: `const [hoveredIndex, setHoveredIndex] = useState(null);

const legendItems = data.map((d) => ({
  label: d.label,
  value: d.value,
  color: "var(--chart-1)",
}));

<FunnelChart
  color="var(--chart-1)"
  data={data}
  hoveredIndex={hoveredIndex}
  layers={3}
  onHoverChange={setHoveredIndex}
/>
<Legend
  hoveredIndex={hoveredIndex}
  items={legendItems}
  onHoverChange={setHoveredIndex}
>
  <LegendItemComponent>
    <LegendMarker />
    <LegendLabel />
  </LegendItemComponent>
</Legend>`,
    data: `const data: FunnelStage[] = [
  { label: "Visitors", value: 12400, displayValue: "12.4k" },
  { label: "Leads", value: 6800, displayValue: "6.8k" },
  { label: "Qualified", value: 3200, displayValue: "3.2k" },
  { label: "Proposals", value: 1500, displayValue: "1.5k" },
  { label: "Closed", value: 620, displayValue: "620" },
];`,
    render: () => <FunnelHeroWithLegend />,
  };
}

function makeFunnelExamples(): ChartExample[] {
  return [
    {
      title: "Vertical",
      description: "Vertical orientation with top-to-bottom flow",
      code: `<FunnelChart
  color="var(--chart-1)"
  data={data}
  layers={3}
  orientation="vertical"
/>`,
      render: () => (
        <FunnelChart
          className="max-h-[400px]"
          color="var(--chart-1)"
          data={funnelData}
          layers={3}
          orientation="vertical"
        />
      ),
    },
    {
      title: "Vertical Straight with Grid",
      description: "Combining vertical orientation, straight edges, and grid",
      code: `<FunnelChart
  color="var(--chart-1)"
  data={data}
  edges="straight"
  grid={{ bands: false, lines: true }}
  layers={3}
  orientation="vertical"
/>`,
      render: () => (
        <FunnelChart
          className="max-h-[360px]"
          color="var(--chart-1)"
          data={funnelData}
          edges="straight"
          grid={{ bands: false, lines: true }}
          layers={3}
          orientation="vertical"
        />
      ),
    },
    {
      title: "Straight Edges",
      description: "Sharp geometric edges instead of smooth curves",
      code: `<FunnelChart
  color="var(--chart-1)"
  data={data}
  edges="straight"
  layers={3}
  orientation="horizontal"
/>`,
      render: () => (
        <FunnelChart
          color="var(--chart-1)"
          data={funnelData}
          edges="straight"
          layers={3}
          orientation="horizontal"
        />
      ),
    },
    {
      title: "Per-Segment Colors",
      description: "Each segment with its own color from the chart palette",
      code: `<FunnelChart
  data={[
    { label: "Awareness", value: 4100, color: "var(--chart-1)" },
    { label: "Interest", value: 2957, color: "var(--chart-2)" },
    { label: "Consideration", value: 1084, color: "var(--chart-3)" },
    { label: "Intent", value: 1038, color: "var(--chart-4)" },
    { label: "Purchase", value: 320, color: "var(--chart-5)" },
  ]}
  layers={3}
/>`,
      render: () => <FunnelChart data={funnelDataColored} layers={3} />,
    },
    {
      title: "Gradient Segments",
      description: "Linear gradients flowing between chart palette colors",
      code: `<FunnelChart
  data={[
    {
      label: "Awareness",
      value: 4100,
      gradient: [
        { offset: "0%", color: "var(--chart-1)" },
        { offset: "100%", color: "var(--chart-2)" },
      ],
    },
    // ... more segments
  ]}
  layers={3}
/>`,
      render: () => <FunnelChart data={funnelDataGradient} layers={3} />,
    },
    {
      title: "Pattern Fill",
      description:
        "Diagonal line pattern on the innermost ring via renderPattern",
      code: `<FunnelChart
  color="var(--chart-3)"
  data={data}
  layers={3}
  renderPattern={(id, color) => (
    <PatternLines
      background={color}
      height={8}
      id={id}
      orientation={["diagonal"]}
      stroke="rgba(255,255,255,0.35)"
      strokeWidth={2}
      width={8}
    />
  )}
/>`,
      render: () => (
        <FunnelChart
          color="var(--chart-3)"
          data={funnelData}
          layers={3}
          renderPattern={(id, color) => (
            <PatternLines
              background={color}
              height={8}
              id={id}
              orientation={["diagonal"]}
              stroke="rgba(255,255,255,0.35)"
              strokeWidth={2}
              width={8}
            />
          )}
        />
      ),
    },
    {
      title: "Grouped Labels",
      description: "Labels stacked together in a compact group",
      code: `<FunnelChart
  color="var(--chart-1)"
  data={data}
  labelAlign="center"
  labelLayout="grouped"
  labelOrientation="vertical"
  layers={3}
/>`,
      render: () => (
        <FunnelChart
          color="var(--chart-1)"
          data={funnelData}
          labelAlign="center"
          labelLayout="grouped"
          labelOrientation="vertical"
          layers={3}
        />
      ),
    },
    {
      title: "Grid Background",
      description: "Alternating bands and grid lines for easier comparison",
      code: `<FunnelChart
  color="var(--chart-1)"
  data={data}
  grid
  layers={3}
/>`,
      render: () => (
        <FunnelChart color="var(--chart-1)" data={funnelData} grid layers={3} />
      ),
    },
  ];
}

// ---------------------------------------------------------------------------
// Scatter chart examples
// ---------------------------------------------------------------------------

function makeScatterExamples(): ChartExample[] {
  return [
    {
      title: "Scatter Chart - No Rings",
      description:
        "Solid fills only — set `strokeWidth={0}` to hide the outer ring",
      code: `<ScatterChart data={chartData} margin={{ top: 8, right: 8, bottom: 40, left: 8 }}>
  <Grid horizontal />
  <Scatter dataKey="desktop" strokeWidth={0} />
  <Scatter dataKey="mobile" strokeWidth={0} />
  <XAxis />
  <ChartTooltip />
</ScatterChart>`,
      render: () => (
        <ScatterExampleChart data={multiLineData}>
          <Grid horizontal />
          <Scatter dataKey="desktop" strokeWidth={0} />
          <Scatter dataKey="mobile" strokeWidth={0} />
          <XAxis />
          <ChartTooltip />
        </ScatterExampleChart>
      ),
    },
    {
      title: "Scatter Chart - Small Dots",
      description: "Compact markers with a 2px radius and thin 1px rings",
      code: `<ScatterChart data={chartData} margin={{ top: 8, right: 8, bottom: 40, left: 8 }}>
  <Grid horizontal />
  <Scatter dataKey="desktop" radius={2} ringGap={1} strokeWidth={1} />
  <Scatter dataKey="mobile" radius={2} ringGap={1} strokeWidth={1} />
  <XAxis />
  <ChartTooltip />
</ScatterChart>`,
      render: () => (
        <ScatterExampleChart data={multiLineData}>
          <Grid horizontal />
          <Scatter dataKey="desktop" radius={2} ringGap={1} strokeWidth={1} />
          <Scatter dataKey="mobile" radius={2} ringGap={1} strokeWidth={1} />
          <XAxis />
          <ChartTooltip />
        </ScatterExampleChart>
      ),
    },
    {
      title: "Scatter Chart - Wide Ring Gap",
      description:
        "1px ring, 3px dot, 5px gap between fill and ring (`outlineWidth={0}`)",
      code: `<ScatterChart data={chartData} margin={{ top: 8, right: 8, bottom: 40, left: 8 }}>
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
</ScatterChart>`,
      render: () => (
        <ScatterExampleChart data={multiLineData}>
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
        </ScatterExampleChart>
      ),
    },
    {
      title: "Scatter Chart - Left Y axis",
      description: "Both series share the left scale with Y-axis value labels",
      code: `<ScatterChart data={chartData} margin={{ top: 8, right: 8, bottom: 40, left: 56 }}>
  <Grid horizontal />
  <Scatter dataKey="desktop" />
  <Scatter dataKey="mobile" stroke="var(--chart-2)" />
  <YAxis yAxisId="left" />
  <XAxis />
  <ChartTooltip />
</ScatterChart>`,
      render: () => (
        <ScatterExampleChart data={multiLineData} margin={chartMarginLeftYAxis}>
          <Grid horizontal />
          <Scatter dataKey="desktop" />
          <Scatter dataKey="mobile" stroke="var(--chart-2)" />
          <YAxis yAxisId="left" />
          <XAxis />
          <ChartTooltip />
        </ScatterExampleChart>
      ),
    },
    {
      title: "Scatter Chart - Left and right Y axes",
      description: "Independent left and right scales (biaxial)",
      code: `<ScatterChart data={chartData} margin={{ top: 8, right: 56, bottom: 40, left: 56 }}>
  <Grid horizontal />
  <Scatter dataKey="desktop" yAxisId="left" />
  <Scatter dataKey="mobile" yAxisId="right" stroke="var(--chart-2)" />
  <YAxis yAxisId="left" />
  <YAxis yAxisId="right" orientation="right" />
  <XAxis />
  <ChartTooltip />
</ScatterChart>`,
      render: () => (
        <ScatterExampleChart
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
        </ScatterExampleChart>
      ),
    },
  ];
}

function makeScatterHero(): ChartExample {
  return {
    title: "Scatter Chart",
    description:
      "Desktop vs mobile over 24 months with default offset rings and crosshair tooltip",
    code: `<ScatterChart data={chartData} margin={{ top: 8, right: 8, bottom: 40, left: 8 }}>
  <Grid horizontal />
  <Scatter dataKey="desktop" />
  <Scatter dataKey="mobile" />
  <XAxis />
  <ChartTooltip />
</ScatterChart>`,
    data: scatterChartDataSnippet,
    render: () => (
      <ScatterExampleChart data={scatterMultiSeriesData}>
        <Grid horizontal />
        <Scatter dataKey="desktop" />
        <Scatter dataKey="mobile" />
        <XAxis />
        <ChartTooltip />
      </ScatterExampleChart>
    ),
  };
}

// ---------------------------------------------------------------------------
// Chart type navigation
// ---------------------------------------------------------------------------

const chartTypes = [
  { label: "Area Chart", slug: "area-chart" },
  { label: "Bar Chart", slug: "bar-chart" },
  { label: "Candlestick Chart", slug: "candlestick-chart" },
  { label: "Choropleth Chart", slug: "choropleth-chart" },
  { label: "Composed Chart", slug: "composed-chart" },
  { label: "Funnel Chart", slug: "funnel-chart" },
  { label: "Gauge", slug: "gauge-chart" },
  { label: "Line Chart", slug: "line-chart" },
  { label: "Live Line Chart", slug: "live-line-chart" },
  { label: "Pie Chart", slug: "pie-chart" },
  { label: "Radar Chart", slug: "radar-chart" },
  { label: "Ring Chart", slug: "ring-chart" },
  { label: "Scatter Chart", slug: "scatter-chart" },
  { label: "Sankey Chart", slug: "sankey-chart" },
];

function ChartNav() {
  const pathname = usePathname();

  return (
    <HorizontalScrollArea className="pb-6">
      <nav className="flex gap-1">
        {chartTypes.map((chart) => {
          const href = `/charts/${chart.slug}`;
          const isActive = pathname === href;

          return (
            <Link
              className={cn(
                "shrink-0 rounded-md px-3 py-1.5 font-medium text-sm transition-colors",
                isActive
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
              href={href}
              key={chart.slug}
            >
              {chart.label}
            </Link>
          );
        })}
      </nav>
    </HorizontalScrollArea>
  );
}

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

interface RegistryEntry {
  factory: () => ChartExample[];
  columns?: 2 | 3;
  hero?: () => ChartExample;
  notice?: string;
  previewLayout?: ChartExamplePreviewLayout;
}

const chartExamplesRegistry: Record<string, RegistryEntry> = {
  "area-chart": { factory: makeAreaExamples, hero: makeAreaHero },
  "bar-chart": { factory: makeBarExamples, hero: makeBarHero },
  "candlestick-chart": {
    factory: makeCandlestickExamples,
    hero: makeCandlestickHero,
  },
  "choropleth-chart": {
    factory: makeChoroplethExamples,
    columns: 2,
    hero: makeChoroplethHero,
    previewLayout: "wide",
  },
  "composed-chart": {
    factory: makeComposedExamples,
    columns: 2,
    hero: makeComposedHero,
  },
  "funnel-chart": {
    factory: makeFunnelExamples,
    columns: 2,
    hero: makeFunnelHero,
    previewLayout: "compact",
  },
  "gauge-chart": {
    factory: makeGaugeExamples,
    hero: makeGaugeHero,
    previewLayout: "compact",
  },
  "line-chart": { factory: makeLineExamples, hero: makeLineHero },
  "profit-loss-line": { factory: makeProfitLossLineExamples },
  "live-line-chart": {
    columns: 2,
    factory: makeLiveLineExamples,
    hero: makeLiveLineHero,
  },
  "pie-chart": { factory: makePieExamples, previewLayout: "compact" },
  "radar-chart": { factory: makeRadarExamples, previewLayout: "compact" },
  "ring-chart": { factory: makeRingExamples, previewLayout: "compact" },
  "scatter-chart": { factory: makeScatterExamples, hero: makeScatterHero },
  "sankey-chart": {
    factory: makeSankeyExamples,
    columns: 2,
    hero: makeSankeyHero,
    previewLayout: "wide",
    notice:
      "The Sankey chart is in pre-alpha and is being actively developed. APIs may change.",
  },
};

// ---------------------------------------------------------------------------
// Public component
// ---------------------------------------------------------------------------

export function ChartExamplesGrid({ chartSlug }: { chartSlug: string }) {
  const entry = chartExamplesRegistry[chartSlug];

  if (!entry) {
    return (
      <div className="py-24 text-center text-muted-foreground">
        Chart type not found.
      </div>
    );
  }

  const examples = entry.factory();
  const hero = entry.hero?.();
  const gridCols =
    entry.columns === 2
      ? "grid grid-cols-1 gap-6 md:grid-cols-2"
      : "grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3";

  return (
    <div className="space-y-6">
      <ChartNav />

      {entry.notice && (
        <div className="rounded-lg border border-border/50 bg-muted/30 px-4 py-3 text-muted-foreground text-sm">
          {entry.notice}
        </div>
      )}

      {hero && (
        <ChartExampleCard
          code={hero.code}
          data={hero.data}
          description={hero.description}
          footer={hero.footer}
          previewLayout={entry.previewLayout}
          previewRole="hero"
          title={hero.title}
        >
          {hero.render()}
        </ChartExampleCard>
      )}

      <div className={gridCols}>
        {examples.map((example) => (
          <ChartExampleCard
            code={example.code}
            data={example.data}
            description={example.description}
            footer={example.footer}
            key={example.title}
            previewLayout={entry.previewLayout}
            title={example.title}
          >
            {example.render()}
          </ChartExampleCard>
        ))}
      </div>
    </div>
  );
}
