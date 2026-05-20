"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  BarXAxis,
  ChartTooltip,
  ChoroplethChart,
  ChoroplethFeatureComponent,
  ChoroplethTooltip,
  Gauge,
  Grid,
  Line,
  LineChart,
  PatternLines,
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
  SankeyChart,
  SankeyLink,
  SankeyNode,
  XAxis,
} from "@bklitui/ui/charts";
import { Refresh01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { curveStep } from "@visx/curve";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { ChartSlug } from "@/components/charts/chart-slugs";
import { useWorldDataStandalone } from "@/components/docs/use-world-data";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  previewCardClassName,
  previewCardContentClassName,
  previewCardContentFillClassName,
} from "@/components/ui/card";
import { studioChartDocsHref, studioChartHref } from "@/lib/studio/chart-links";
import { cn } from "@/lib/utils";

const easeOutQuint = [0.23, 1, 0.32, 1] as const;
const actionEnterDuration = 0.2;
const actionExitDuration = 0.16;
const actionStagger = 0.04;

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
            className="size-7 [&_svg]:size-3.5"
            onClick={onReplay}
            size="icon-sm"
            title="Replay animation"
            type="button"
            variant="outline"
          >
            <HugeiconsIcon icon={Refresh01Icon} size={14} strokeWidth={1.5} />
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
          <Button asChild size="lg" variant={variant}>
            <Link href={href}>{label}</Link>
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
        "relative flex min-h-0 flex-1 flex-col overflow-hidden",
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

function HomeChoropleth() {
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
      aspectRatio="16 / 9"
      className="size-full"
      data={worldData}
    >
      <ChoroplethFeatureComponent fill="var(--chart-3)" />
      <ChoroplethTooltip />
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

// Line chart data
const lineData = [
  { date: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000), users: 1200 },
  { date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000), users: 1450 },
  { date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000), users: 1320 },
  { date: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000), users: 1680 },
  { date: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000), users: 1520 },
  { date: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000), users: 1890 },
  { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), users: 2100 },
  { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), users: 2350 },
];

// Area chart data
const areaData = [
  { date: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000), value: 45 },
  { date: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000), value: 52 },
  { date: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000), value: 48 },
  { date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), value: 61 },
  { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), value: 55 },
  { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), value: 67 },
  { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), value: 72 },
];

// Ring chart data
const ringData: RingData[] = [
  { label: "Organic", value: 4250, maxValue: 5000 },
  { label: "Paid", value: 3120, maxValue: 5000 },
  { label: "Email", value: 2100, maxValue: 5000 },
  { label: "Social", value: 1580, maxValue: 5000 },
];

// Bar chart data - 60 days
const barData60Days = Array.from({ length: 60 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (59 - i));
  return {
    day: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    value: Math.floor(Math.random() * 60) + 40 + Math.sin(i / 5) * 20,
  };
});

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

// Simple sankey data
const sankeyData = {
  nodes: [
    { name: "A", category: "source" as const },
    { name: "B", category: "source" as const },
    { name: "C", category: "source" as const },
    { name: "X", category: "landing" as const },
    { name: "Y", category: "landing" as const },
    { name: "Z", category: "outcome" as const },
  ],
  links: [
    { source: 0, target: 3, value: 40 },
    { source: 0, target: 4, value: 20 },
    { source: 1, target: 3, value: 30 },
    { source: 1, target: 4, value: 35 },
    { source: 2, target: 4, value: 25 },
    { source: 3, target: 5, value: 70 },
    { source: 4, target: 5, value: 80 },
  ],
};

export function HomeComponents() {
  return (
    <>
      <ShowcaseCard
        chart="line-chart"
        className="col-span-full flex-1 sm:col-span-7"
      >
        <LineChart data={lineData}>
          <ChartTooltip />
          <Grid horizontal />
          <Line dataKey="users" strokeWidth={2} />
        </LineChart>
      </ShowcaseCard>

      <ShowcaseCard
        chart="pie-chart"
        className="col-span-full flex-1 sm:col-span-5"
      >
        <PieChart data={pieData} size={240}>
          <PatternLines
            height={6}
            id="home-pie-pattern-1"
            orientation={["diagonal"]}
            stroke="var(--chart-1)"
            strokeWidth={1}
            width={6}
          />
          <PatternLines
            height={6}
            id="home-pie-pattern-2"
            orientation={["horizontal"]}
            stroke="var(--chart-2)"
            strokeWidth={1}
            width={6}
          />
          <PatternLines
            height={6}
            id="home-pie-pattern-3"
            orientation={["vertical"]}
            stroke="var(--chart-3)"
            strokeWidth={1}
            width={6}
          />
          <PatternLines
            height={8}
            id="home-pie-pattern-4"
            orientation={["diagonalRightToLeft"]}
            stroke="var(--chart-4)"
            strokeWidth={1}
            width={8}
          />
          <PieSlice fill="url(#home-pie-pattern-1)" index={0} />
          <PieSlice fill="url(#home-pie-pattern-2)" index={1} />
          <PieSlice fill="url(#home-pie-pattern-3)" index={2} />
          <PieSlice fill="url(#home-pie-pattern-4)" index={3} />
        </PieChart>
      </ShowcaseCard>

      <ShowcaseCard
        chart="bar-chart"
        className="col-span-full min-h-[200px] sm:col-span-6"
      >
        <BarChart barGap={0.1} data={barData60Days} xDataKey="day">
          <Grid horizontal />
          <Bar dataKey="value" fill="var(--chart-1)" lineCap="butt" />
          <BarXAxis maxLabels={6} />
          <ChartTooltip />
        </BarChart>
      </ShowcaseCard>

      <ShowcaseCard
        chart="bar-chart"
        className="col-span-full min-h-[200px] sm:col-span-6"
      >
        <BarChart data={barDataMultiSeries} xDataKey="month">
          <Grid horizontal />
          <Bar dataKey="revenue" fill="var(--chart-1)" lineCap="round" />
          <Bar dataKey="expenses" fill="var(--chart-2)" lineCap="round" />
          <Bar dataKey="profit" fill="var(--chart-3)" lineCap="round" />
          <BarXAxis />
          <ChartTooltip />
        </BarChart>
      </ShowcaseCard>

      <ShowcaseCard
        chart="sankey-chart"
        className="col-span-full min-h-[200px] flex-1 sm:col-span-7"
      >
        <SankeyChart
          data={sankeyData}
          margin={{ top: 16, right: 16, bottom: 16, left: 16 }}
          nodePadding={20}
          nodeWidth={12}
        >
          <SankeyLink strokeOpacity={0.4} />
          <SankeyNode lineCap={3} showLabels={false} />
        </SankeyChart>
      </ShowcaseCard>

      <ShowcaseCard
        chart="radar-chart"
        className="col-span-full flex min-h-[300px] flex-col gap-4 sm:col-span-5"
      >
        <RadarChart data={radarData} metrics={radarMetrics} size={320}>
          <RadarGrid />
          <RadarAxis />
          <RadarLabels fontSize={11} offset={18} />
          {radarData.map((item, index) => (
            <RadarArea index={index} key={item.label} />
          ))}
        </RadarChart>
      </ShowcaseCard>

      <ShowcaseCard
        chart="ring-chart"
        className="col-span-full flex min-h-[300px] flex-col gap-4 sm:col-span-5"
      >
        <RingChart data={ringData} size={370}>
          {ringData.map((item, index) => (
            <Ring index={index} key={item.label} />
          ))}
          <RingCenter defaultLabel="Sessions" />
        </RingChart>
      </ShowcaseCard>

      <ShowcaseCard
        chart="area-chart"
        className="col-span-full min-h-[200px] flex-1 sm:col-span-7"
      >
        <AreaChart data={areaData}>
          <ChartTooltip />
          <Area
            curve={curveStep}
            dataKey="value"
            fadeEdges
            fillOpacity={0.3}
            strokeWidth={2}
          />
          <XAxis />
        </AreaChart>
      </ShowcaseCard>

      <ShowcaseCard
        chart="choropleth-chart"
        className="col-span-full min-h-[220px] flex-1 sm:col-span-7"
      >
        <HomeChoropleth />
      </ShowcaseCard>

      <ShowcaseCard
        chart="gauge-chart"
        className="col-span-full flex min-h-[280px] flex-col gap-4 sm:col-span-5"
      >
        <Gauge
          centerValue={428_000}
          defaultLabel="ARR run rate"
          endAngle={405}
          formatOptions={{
            style: "currency",
            currency: "USD",
            maximumFractionDigits: 0,
          }}
          height={300}
          inactiveFillOpacity={0.4}
          notchCornerRadius={12}
          notchLengthPercent={36}
          spacing={17}
          startAngle={135}
          totalNotches={33}
          uniformWidth={false}
          useGradient={false}
          value={66}
          width={300}
        />
      </ShowcaseCard>
    </>
  );
}
