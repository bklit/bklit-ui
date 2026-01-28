"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  BarXAxis,
  ChartTooltip,
  Grid,
  Line,
  LineChart,
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
} from "@bklitui/ui/charts";
import { XAxis } from "@bklitui/ui/charts/x-axis";
import { curveStep } from "@visx/curve";

// Showcase card wrapper
function ShowcaseCard({
  children,
  className = "",
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center justify-center rounded-xl border border-border/50 bg-muted/30 p-6 ${className}`}
    >
      {children}
    </div>
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

export function HomeComponents() {
  return (
    <>
      {/* Row 1: Two bar charts side by side */}
      <ShowcaseCard className="col-span-full min-h-[200px] sm:col-span-6">
        <div className="h-full w-full">
          <BarChart barGap={0.1} data={barData60Days} xDataKey="day">
            <Grid horizontal />
            <Bar dataKey="value" lineCap="butt" />
            <BarXAxis maxLabels={6} />
            <ChartTooltip />
          </BarChart>
        </div>
      </ShowcaseCard>

      <ShowcaseCard className="col-span-full min-h-[200px] sm:col-span-6">
        <div className="h-full w-full">
          <BarChart data={barDataMultiSeries} xDataKey="month">
            <Grid horizontal />
            <Bar dataKey="revenue" fill="hsl(0, 0%, 65%)" lineCap="round" />
            <Bar dataKey="expenses" fill="hsl(0, 0%, 50%)" lineCap="round" />
            <Bar dataKey="profit" fill="hsl(0, 0%, 35%)" lineCap="round" />
            <BarXAxis />
            <ChartTooltip />
          </BarChart>
        </div>
      </ShowcaseCard>

      {/* Row 2: Radar + Ring, Line & Area */}
      <div className="col-span-full flex flex-col gap-4 sm:flex-row">
        <ShowcaseCard className="flex min-h-[300px] flex-col gap-4 sm:basis-5/12">
          <RadarChart data={radarData} metrics={radarMetrics} size={370}>
            <RadarGrid />
            <RadarAxis />
            <RadarLabels fontSize={11} offset={18} />
            {radarData.map((item, index) => (
              <RadarArea index={index} key={item.label} />
            ))}
          </RadarChart>
          <RingChart data={ringData} size={370}>
            {ringData.map((item, index) => (
              <Ring index={index} key={item.label} />
            ))}
            <RingCenter defaultLabel="Sessions" />
          </RingChart>
        </ShowcaseCard>

        <div className="flex flex-1 flex-col gap-4 sm:basis-7/12">
          <ShowcaseCard className="min-h-[200px] flex-1">
            <div className="h-full w-full">
              <LineChart data={lineData}>
                <ChartTooltip />
                <Grid horizontal />
                <Line dataKey="users" strokeWidth={2} />
              </LineChart>
            </div>
          </ShowcaseCard>

          <ShowcaseCard className="min-h-[200px] flex-1">
            <div className="h-full w-full">
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
            </div>
          </ShowcaseCard>
        </div>
      </div>
    </>
  );
}
