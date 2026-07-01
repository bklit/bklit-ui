"use client";

import { Icon } from "@bklitui/icons";
import { studioChartDocsHref, studioChartHref } from "@bklitui/studio";
import {
  Bar,
  BarChart,
  BarXAxis,
  ChartTooltip,
  ChoroplethChart,
  type ChoroplethFeature,
  ChoroplethFeatureComponent,
  ChoroplethTooltip,
  Gauge,
  Grid,
  HeatmapCells,
  HeatmapChart,
  HeatmapInteractionBoundary,
  HeatmapInteractionProvider,
  HeatmapLegend,
  type HeatmapLevelStyles,
  HeatmapTooltip,
  HeatmapXAxis,
  HeatmapYAxis,
  PatternLines,
  PieCenter,
  PieChart,
  type PieData,
  PieSlice,
  RadarArea,
  RadarAxis,
  RadarChart,
  type RadarData,
  RadarGrid,
  RadarLabels,
  type RadarMetric,
  Ring,
  RingCenter,
  RingChart,
  type RingData,
  TooltipContent,
} from "@bklitui/ui/charts";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { ChartSlug } from "@/components/charts/chart-slugs";
import { useWorldDataStandalone } from "@/components/docs/use-world-data";
import { HomeAreaChart } from "@/components/home-area-chart";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  previewCardClassName,
  previewCardContentClassName,
  previewCardContentFillClassName,
} from "@/components/ui/card";
import { getHeatmapDemoData } from "@/lib/heatmap-demo-data";
import {
  homeBarChartMargin,
  homeChoroplethMargin,
  homeHeatmapMargin,
  useHomeChartCompact,
} from "@/lib/home-chart-margin";
import { homeTooltipPanelStyle } from "@/lib/home-tooltip-style";
import { cn } from "@/lib/utils";

const easeOutQuint = [0.23, 1, 0.32, 1] as const;
const actionEnterDuration = 0.2;
const actionExitDuration = 0.16;
const actionStagger = 0.04;

const heatmapLevelStyles = [
  {
    color: "var(--chart-scale-01)",
    fillMode: "pattern",
    pattern: "diagonal",
    patternColor: "var(--chart-scale-pattern-color)",
    patternScale: 0.5,
  },
  {
    color: "var(--chart-scale-02)",
    fillMode: "solid",
    pattern: "none",
  },
  {
    color: "var(--chart-scale-03)",
    fillMode: "solid",
    pattern: "none",
  },
  {
    color: "var(--chart-scale-04)",
    fillMode: "solid",
    pattern: "none",
  },
  {
    color: "var(--chart-scale-05)",
    fillMode: "solid",
    pattern: "none",
  },
] as const satisfies HeatmapLevelStyles;

const HOME_CHOROPLETH_ZERO_PATTERN_ID = "home-choropleth-heatmap-0";

const homeChoroplethZeroPattern = (
  <PatternLines
    background="var(--chart-scale-01)"
    height={3}
    id={HOME_CHOROPLETH_ZERO_PATTERN_ID}
    orientation={["diagonal"]}
    stroke="var(--chart-scale-pattern-color)"
    strokeWidth={0.5}
    width={3}
  />
);

/** Maps a numeric value to the shared homepage heatmap level scale (0–4). */
function getHomeHeatmapLevel(value: number | undefined): number {
  if (value === undefined || value <= 0) {
    return 0;
  }
  const scaled = Math.ceil(value / 5);
  if (scaled <= 0) {
    return 0;
  }
  if (scaled === 1) {
    return 1;
  }
  if (scaled === 2) {
    return 2;
  }
  if (scaled === 3) {
    return 3;
  }
  return 4;
}

function getHomeHeatmapLevelColor(level: number): string {
  return heatmapLevelStyles[level]?.color ?? heatmapLevelStyles[0].color;
}

function ShowcaseReplayAction({
  index,
  visible,
  reducedMotion,
  onReplay,
}: {
  index: number;
  visible: boolean;
  reducedMotion: boolean | null;
  onReplay: () => void;
}) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          animate={
            reducedMotion
              ? { opacity: 1, y: 0 }
              : {
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: actionEnterDuration,
                    ease: easeOutQuint,
                    delay: index * actionStagger,
                  },
                }
          }
          exit={
            reducedMotion
              ? undefined
              : {
                  opacity: 0,
                  y: 4,
                  transition: {
                    duration: actionExitDuration,
                    ease: easeOutQuint,
                  },
                }
          }
          initial={reducedMotion ? false : { opacity: 0, y: 6 }}
        >
          <Button
            aria-label="Replay animation"
            className="size-7 [&_svg]:size-4"
            onClick={onReplay}
            size="icon"
            title="Replay animation"
            type="button"
            variant="outline"
          >
            <Icon className="size-4" name="IconArrowRotateClockwise" />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function CardAction({
  href,
  label,
  variant,
  index,
  visible,
  reducedMotion,
}: {
  href: string;
  label: string;
  variant: "outline" | "default";
  index: number;
  visible: boolean;
  reducedMotion: boolean | null;
}) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          animate={
            reducedMotion
              ? { opacity: 1, y: 0 }
              : {
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: actionEnterDuration,
                    ease: easeOutQuint,
                    delay: index * actionStagger,
                  },
                }
          }
          exit={
            reducedMotion
              ? undefined
              : {
                  opacity: 0,
                  y: 4,
                  transition: {
                    duration: actionExitDuration,
                    ease: easeOutQuint,
                  },
                }
          }
          initial={reducedMotion ? false : { opacity: 0, y: 6 }}
        >
          <Button
            nativeButton={false}
            render={<Link href={href} />}
            size="sm"
            variant={variant}
          >
            {label}
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ShowcaseCard({
  chart,
  children,
  className = "",
}: {
  chart: ChartSlug;
  children?: React.ReactNode;
  className?: string;
}) {
  const reducedMotion = useReducedMotion();
  const [hoverFine, setHoverFine] = useState(false);
  const [focused, setFocused] = useState(false);
  const [coarsePointer, setCoarsePointer] = useState(false);
  const [replayKey, setReplayKey] = useState(0);

  const replay = useCallback(() => {
    setReplayKey((k) => k + 1);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setCoarsePointer(!mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const showActions =
    reducedMotion === true || coarsePointer || hoverFine || focused;

  return (
    <Card
      className={cn(
        "relative flex min-h-0 flex-1 flex-col overflow-visible",
        previewCardClassName,
        className
      )}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
          setFocused(false);
        }
      }}
      onFocusCapture={() => setFocused(true)}
      onPointerEnter={() => setHoverFine(true)}
      onPointerLeave={() => setHoverFine(false)}
    >
      <div className="absolute top-3 left-3 z-10">
        <ShowcaseReplayAction
          index={0}
          onReplay={replay}
          reducedMotion={reducedMotion}
          visible={showActions}
        />
      </div>
      <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
        <CardAction
          href={studioChartDocsHref(chart)}
          index={1}
          label="Docs"
          reducedMotion={reducedMotion}
          variant="outline"
          visible={showActions}
        />
        <CardAction
          href={studioChartHref(chart)}
          index={2}
          label="Open in Studio"
          reducedMotion={reducedMotion}
          variant="default"
          visible={showActions}
        />
      </div>
      <CardContent
        className={cn(
          previewCardContentClassName,
          previewCardContentFillClassName
        )}
      >
        <div
          className="flex size-full min-h-0 items-center justify-center"
          key={replayKey}
        >
          {children}
        </div>
      </CardContent>
    </Card>
  );
}

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

function getHomeVisitorValue(feat: ChoroplethFeature): number | undefined {
  return visitorsByCountry[feat.properties?.name as string];
}

function getHomeChoroplethFill(feat: ChoroplethFeature): string {
  return getHomeHeatmapLevelColor(
    getHomeHeatmapLevel(getHomeVisitorValue(feat))
  );
}

function getHomeChoroplethPattern(feat: ChoroplethFeature): string | null {
  return getHomeHeatmapLevel(getHomeVisitorValue(feat)) === 0
    ? HOME_CHOROPLETH_ZERO_PATTERN_ID
    : null;
}

function HomeChoroplethTooltipContent({
  feature,
}: {
  feature: ChoroplethFeature;
}) {
  const name = (feature.properties?.name as string) ?? "Unknown";
  const visitors = getHomeVisitorValue(feature);

  return (
    <TooltipContent
      rows={[
        {
          color: getHomeChoroplethFill(feature),
          label: "Visitors",
          value: visitors === undefined ? "0" : visitors,
        },
      ]}
      title={name}
    />
  );
}

function HomeChoropleth({
  aspectRatio = "16 / 9",
  compact,
}: {
  aspectRatio?: string;
  compact: boolean;
}) {
  const { worldData, isLoading } = useWorldDataStandalone();

  if (isLoading) {
    return (
      <span className="animate-pulse text-muted-foreground text-sm">
        Loading map…
      </span>
    );
  }

  if (!worldData) {
    return null;
  }

  return (
    <ChoroplethChart
      aspectRatio={aspectRatio}
      className={cn("w-full", compact ? "min-h-[220px]" : "min-h-0")}
      data={worldData}
      margin={homeChoroplethMargin(compact)}
    >
      <ChoroplethFeatureComponent
        getFeatureColor={getHomeChoroplethFill}
        getFeaturePattern={getHomeChoroplethPattern}
        patterns={homeChoroplethZeroPattern}
      />
      <ChoroplethTooltip
        content={({ feature }) => (
          <HomeChoroplethTooltipContent feature={feature} />
        )}
        panelStyle={homeTooltipPanelStyle}
      />
    </ChoroplethChart>
  );
}

// Radar chart data
const radarMetrics: RadarMetric[] = [
  { key: "speed", label: "Speed" },
  { key: "reliability", label: "Reliability" },
  { key: "comfort", label: "Comfort" },
  { key: "efficiency", label: "Efficiency" },
  { key: "safety", label: "Safety" },
];

const radarData: RadarData[] = [
  {
    label: "Model A",
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
    values: {
      speed: 72,
      reliability: 90,
      comfort: 65,
      efficiency: 88,
      safety: 75,
    },
  },
];

// Ring chart data
const ringData: RingData[] = [
  { label: "Organic", value: 4250, maxValue: 5000 },
  { label: "Paid", value: 3120, maxValue: 5000 },
  { label: "Email", value: 2100, maxValue: 5000 },
  { label: "Social", value: 1580, maxValue: 5000 },
];

// Bar chart data - 3 series
const barDataMultiSeries = [
  { month: "Jan", revenue: 12_000, expenses: 8500, profit: 3500 },
  { month: "Feb", revenue: 15_500, expenses: 9200, profit: 6300 },
  { month: "Mar", revenue: 11_000, expenses: 7800, profit: 3200 },
  { month: "Apr", revenue: 18_500, expenses: 10_100, profit: 8400 },
  { month: "May", revenue: 16_800, expenses: 9400, profit: 7400 },
  { month: "Jun", revenue: 21_200, expenses: 11_800, profit: 9400 },
];

// Pie chart data
const pieData: PieData[] = [
  { label: "Category A", value: 35 },
  { label: "Category B", value: 25 },
  { label: "Category C", value: 20 },
  { label: "Category D", value: 20 },
];

const contributionData = getHeatmapDemoData();

export type HomeShowcaseId =
  | "line"
  | "pie"
  | "ring"
  | "bar"
  | "choropleth"
  | "radar"
  | "gauge"
  | "heatmap";

function useShowcaseCompact() {
  return useHomeChartCompact();
}

function ShowcasePieChart({ compact }: { compact: boolean }) {
  return (
    <PieChart
      data={pieData}
      innerRadius={compact ? 52 : 58}
      size={compact ? 200 : 240}
    >
      <PatternLines
        height={6}
        id="home-pie-pattern-1"
        orientation={["vertical"]}
        stroke="var(--chart-3)"
        strokeWidth={1.5}
        width={6}
      />
      <PatternLines
        height={8}
        id="home-pie-pattern-2"
        orientation={["diagonalRightToLeft"]}
        stroke="var(--chart-4)"
        strokeWidth={1.5}
        width={8}
      />
      <PieSlice index={0} />
      <PieSlice index={1} />
      <PieSlice fill="url(#home-pie-pattern-1)" index={2} />
      <PieSlice fill="url(#home-pie-pattern-2)" index={3} />
      <PieCenter defaultLabel="Total" />
    </PieChart>
  );
}

function ShowcaseBarChart({ compact }: { compact: boolean }) {
  return (
    <BarChart
      aspectRatio={compact ? "5 / 2" : "5 / 2"}
      className={cn("w-full", compact ? "min-h-[120px]" : "min-h-[180px]")}
      data={barDataMultiSeries}
      margin={homeBarChartMargin(compact)}
      xDataKey="month"
    >
      <PatternLines
        height={8}
        id="barPattern"
        orientation={["diagonal"]}
        stroke="var(--chart-1)"
        strokeWidth={2}
        width={8}
      />
      <Grid horizontal />
      <Bar dataKey="revenue" fill="var(--chart-1)" lineCap="round" />
      <Bar dataKey="expenses" fill="var(--chart-2)" lineCap="round" />
      <Bar dataKey="profit" fill="url(#barPattern)" lineCap="round" />
      {!compact && <BarXAxis />}
      <ChartTooltip panelStyle={homeTooltipPanelStyle} showCrosshair={false} />
    </BarChart>
  );
}

function ShowcaseRadarChart({ compact }: { compact: boolean }) {
  return (
    <RadarChart
      data={radarData}
      metrics={radarMetrics}
      size={compact ? 250 : 300}
    >
      <RadarGrid stroke="var(--chart-grid)" strokeOpacity={1} />
      <RadarAxis stroke="var(--chart-grid)" strokeOpacity={1} />
      <RadarLabels fontSize={compact ? 10 : 11} offset={compact ? 14 : 16} />
      {radarData.map((item, index) => (
        <RadarArea index={index} key={item.label} showGlow={false} />
      ))}
    </RadarChart>
  );
}

function ShowcaseGaugeChart({ compact }: { compact: boolean }) {
  const gaugeSize = compact ? 220 : 260;

  return (
    <Gauge
      centerValue={428_000}
      defaultLabel="ARR run rate"
      endAngle={405}
      formatOptions={{
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }}
      height={gaugeSize}
      inactiveFillOpacity={1}
      notchCornerRadius={4}
      notchLengthPercent={62}
      spacing={compact ? 14 : 15}
      startAngle={135}
      totalNotches={30}
      uniformWidth={false}
      useGradient={false}
      value={78}
      width={gaugeSize}
    />
  );
}

function ShowcaseHeatmapChart({ compact }: { compact: boolean }) {
  return (
    <HeatmapInteractionProvider>
      <HeatmapInteractionBoundary>
        <div className="flex min-h-[220px] w-full flex-col items-center justify-center gap-4 sm:gap-5 md:aspect-5/2 md:min-h-0">
          <HeatmapChart
            animationDuration={1100}
            className="w-full"
            data={contributionData}
            enterStaggerScale={1}
            enterTransition={{
              type: "tween",
              duration: 1.1,
              ease: [0.85, 0, 0.916, 0.282],
            }}
            gap={2}
            layout="fluid"
            levelStyles={heatmapLevelStyles}
            margin={homeHeatmapMargin(compact)}
          >
            <HeatmapCells cornerRadius={2} inactiveOpacity={0.3} />
            {!compact && <HeatmapXAxis />}
            {!compact && <HeatmapYAxis />}
            <HeatmapTooltip panelStyle={homeTooltipPanelStyle} />
          </HeatmapChart>
          <HeatmapLegend
            align="center"
            cornerRadius={2}
            gap={2}
            levelStyles={heatmapLevelStyles}
          />
        </div>
      </HeatmapInteractionBoundary>
    </HeatmapInteractionProvider>
  );
}

export function HomeShowcaseChart({ id }: { id: HomeShowcaseId }) {
  const compact = useShowcaseCompact();

  switch (id) {
    case "line":
      return (
        <HomeAreaChart
          aspectRatio={compact ? "5 / 2" : "5 / 2"}
          className={compact ? "min-h-[120px]" : "min-h-[180px]"}
        />
      );
    case "pie":
      return <ShowcasePieChart compact={compact} />;
    case "ring":
      return (
        <RingChart data={ringData} size={compact ? 200 : 300}>
          {ringData.map((item, index) => (
            <Ring index={index} key={item.label} />
          ))}
          <RingCenter defaultLabel="Sessions" />
        </RingChart>
      );
    case "bar":
      return <ShowcaseBarChart compact={compact} />;
    case "choropleth":
      return (
        <HomeChoropleth
          aspectRatio={compact ? "6 / 5" : "5 / 2"}
          compact={compact}
        />
      );
    case "radar":
      return <ShowcaseRadarChart compact={compact} />;
    case "gauge":
      return <ShowcaseGaugeChart compact={compact} />;
    case "heatmap":
      return <ShowcaseHeatmapChart compact={compact} />;
    default:
      return null;
  }
}

export function HomeComponents() {
  return (
    <>
      <ShowcaseCard
        chart="line-chart"
        className="col-span-full flex-1 sm:col-span-7"
      >
        <HomeShowcaseChart id="line" />
      </ShowcaseCard>

      <ShowcaseCard
        chart="pie-chart"
        className="col-span-full flex-1 sm:col-span-5"
      >
        <HomeShowcaseChart id="pie" />
      </ShowcaseCard>

      <ShowcaseCard
        chart="sankey-chart"
        className="col-span-full min-h-[200px] flex-1 sm:col-span-5"
      >
        <HomeShowcaseChart id="ring" />
      </ShowcaseCard>
      <ShowcaseCard
        chart="funnel-chart"
        className="col-span-full flex min-h-[300px] flex-col gap-4 sm:col-span-7"
      >
        <HomeShowcaseChart id="bar" />
      </ShowcaseCard>

      <ShowcaseCard
        chart="sankey-chart"
        className="col-span-full min-h-[200px] flex-1 sm:col-span-7"
      >
        <HomeShowcaseChart id="choropleth" />
      </ShowcaseCard>
      <ShowcaseCard
        chart="radar-chart"
        className="col-span-full flex min-h-[300px] flex-col gap-4 sm:col-span-5"
      >
        <HomeShowcaseChart id="radar" />
      </ShowcaseCard>

      <ShowcaseCard
        chart="bar-chart"
        className="col-span-full min-h-[200px] sm:col-span-5"
      >
        <HomeShowcaseChart id="gauge" />
      </ShowcaseCard>
      <ShowcaseCard
        chart="heatmap-chart"
        className="col-span-full min-h-[200px] sm:col-span-7"
      >
        <HomeShowcaseChart id="heatmap" />
      </ShowcaseCard>
    </>
  );
}
