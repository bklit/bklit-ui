"use client";

import {
  Ring as D3Ring,
  RingChart as D3RingChart,
  Legend,
  LegendItemComponent,
  type LegendItemData,
  LegendLabel,
  LegendMarker,
  LegendProgress,
  LegendValue,
  RingCenter,
  type RingData,
  RingGrid,
  RingLabels,
} from "@bklitui/ui/charts";
import { LegacyRing, LegacyRingChart } from "@bklitui/ui/charts/legacy-visx";
import { useState } from "react";
import { chartExampleRadialShellClassName } from "@/components/charts/chart-example-preview";
import type { LabSide, LabVariant } from "./types";

const PARTS = {
  before: { RingChart: LegacyRingChart, Ring: LegacyRing },
  after: { RingChart: D3RingChart, Ring: D3Ring },
} as const;

const EXAMPLES = "chart-examples.tsx";
const DOCS = "docs/ring-chart-demo.tsx";

// Data copied verbatim from the sources.
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

const sessionsData: RingData[] = [
  { label: "Organic", value: 4250, maxValue: 5000, color: "#0ea5e9" },
  { label: "Paid", value: 3120, maxValue: 5000, color: "#a855f7" },
  { label: "Email", value: 2100, maxValue: 5000, color: "#f59e0b" },
  { label: "Social", value: 1580, maxValue: 5000, color: "#10b981" },
  { label: "Referral", value: 1050, maxValue: 5000, color: "#ef4444" },
  { label: "Direct", value: 747, maxValue: 5000, color: "#6366f1" },
];

const activityData: RingData[] = [
  { label: "Steps", value: 8200, maxValue: 10_000, color: "var(--chart-1)" },
  { label: "Calories", value: 1800, maxValue: 2500, color: "var(--chart-2)" },
  { label: "Distance", value: 4.2, maxValue: 5, color: "var(--chart-3)" },
];

function legendItems(data: RingData[]): LegendItemData[] {
  return data.map((d) => ({
    label: d.label,
    value: d.value,
    maxValue: d.maxValue,
    color: d.color || "",
  }));
}

function Shell({ children }: { children: React.ReactNode }) {
  return <div className={chartExampleRadialShellClassName}>{children}</div>;
}

function RingWithLegend({ side }: { side: LabSide }) {
  const { RingChart, Ring } = PARTS[side];
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
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
        items={legendItems(ringData)}
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

function RingChartDemo({ side }: { side: LabSide }) {
  const { RingChart, Ring } = PARTS[side];
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  return (
    <div className="flex w-full min-w-0 max-w-full flex-col items-center justify-center gap-8 lg:w-auto lg:flex-row lg:gap-12">
      <RingChart
        data={sessionsData}
        hoveredIndex={hoveredIndex}
        onHoverChange={setHoveredIndex}
        size={320}
      >
        {sessionsData.map((item, index) => (
          <Ring index={index} key={item.label} />
        ))}
        <RingCenter defaultLabel="Total Sessions" />
      </RingChart>
      <Legend
        hoveredIndex={hoveredIndex}
        items={legendItems(sessionsData)}
        onHoverChange={setHoveredIndex}
        title="Sessions by Channel"
      >
        <LegendItemComponent className="grid grid-cols-[auto_1fr_auto] items-center gap-x-3 gap-y-1">
          <LegendMarker />
          <LegendLabel />
          <LegendValue showPercentage />
          <div className="col-span-full">
            <LegendProgress />
          </div>
        </LegendItemComponent>
      </Legend>
    </div>
  );
}

export const RING_VARIANTS: LabVariant[] = [
  {
    id: "default",
    label: "Ring",
    source: `${EXAMPLES}: Ring Chart`,
    exercises: "4 full rings, parent-sized, round caps, RingCenter",
    render: (side) => {
      const { RingChart, Ring } = PARTS[side];
      return (
        <Shell>
          <RingChart data={ringData}>
            {ringData.map((item, index) => (
              <Ring index={index} key={item.label} />
            ))}
            <RingCenter defaultLabel="Sessions" />
          </RingChart>
        </Shell>
      );
    },
  },
  {
    id: "flat-caps",
    label: "Flat caps",
    source: `${EXAMPLES}: Ring Chart - Flat Caps`,
    exercises: 'lineCap="butt"',
    render: (side) => {
      const { RingChart, Ring } = PARTS[side];
      return (
        <Shell>
          <RingChart data={ringData}>
            {ringData.map((item, index) => (
              <Ring index={index} key={item.label} lineCap="butt" />
            ))}
            <RingCenter defaultLabel="Sessions" />
          </RingChart>
        </Shell>
      );
    },
  },
  {
    id: "thick-rings",
    label: "Thick rings",
    source: `${EXAMPLES}: Ring Chart - Thick Rings (also ${DOCS}: RingChartCustomColorsDemo)`,
    exercises: "strokeWidth 18, ringGap 8, compact $ center",
    render: (side) => {
      const { RingChart, Ring } = PARTS[side];
      return (
        <Shell>
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
        </Shell>
      );
    },
  },
  {
    id: "three-quarter",
    label: "Three quarter",
    source: `${EXAMPLES}: Ring Chart - Three Quarter (also ${DOCS}: RingChartGridDemo, first chart)`,
    exercises: "270° arc (-π … π/2), RingGrid, RingLabels colorByRing",
    render: (side) => {
      const { RingChart, Ring } = PARTS[side];
      return (
        <Shell>
          <RingChart
            data={ringGoalData}
            endAngle={Math.PI / 2}
            startAngle={-Math.PI}
          >
            <RingGrid />
            {ringGoalData.map((item, index) => (
              <Ring index={index} key={item.label} />
            ))}
            <RingLabels colorByRing />
            <RingCenter defaultLabel="Activity" />
          </RingChart>
        </Shell>
      );
    },
  },
  {
    id: "half-circle",
    label: "Half circle",
    source: `${EXAMPLES}: Ring Chart - Half Circle`,
    exercises: "180° arc (-π/2 … π/2), RingGrid, RingLabels",
    render: (side) => {
      const { RingChart, Ring } = PARTS[side];
      return (
        <Shell>
          <RingChart
            data={ringData}
            endAngle={Math.PI / 2}
            startAngle={-Math.PI / 2}
          >
            <RingGrid />
            {ringData.map((item, index) => (
              <Ring index={index} key={item.label} />
            ))}
            <RingLabels />
            <RingCenter defaultLabel="Sessions" />
          </RingChart>
        </Shell>
      );
    },
  },
  {
    id: "grid-ticks",
    label: "Grid ticks",
    source: `${DOCS}: RingChartGridDemo, second chart (ring-chart.mdx)`,
    exercises: "Half circle, RingGrid ticks={[0, 0.5, 1]}, no RingCenter",
    render: (side) => {
      const { RingChart, Ring } = PARTS[side];
      return (
        <div className="aspect-square w-full max-w-[260px]">
          <RingChart
            data={activityData}
            endAngle={Math.PI / 2}
            startAngle={-Math.PI / 2}
          >
            <RingGrid ticks={[0, 0.5, 1]} />
            {activityData.map((item, index) => (
              <Ring index={index} key={item.label} />
            ))}
            <RingLabels />
          </RingChart>
        </div>
      );
    },
  },
  {
    id: "legend",
    label: "Legend",
    source: `${EXAMPLES}: Ring Chart - Legend (also recipes: Linked legend / Ring)`,
    exercises: "Controlled hover + Legend with progress bars",
    height: 460,
    render: (side) => <RingWithLegend side={side} />,
  },
  {
    id: "docs-hero",
    label: "Docs hero",
    source: `${DOCS}: RingChartDemo (ring-chart.mdx; also RingChartBasicDemo)`,
    exercises: "6 rings, fixed size={320}, Legend",
    width: 720,
    height: 380,
    render: (side) => <RingChartDemo side={side} />,
  },
  {
    id: "custom-radii",
    label: "Custom radii",
    source:
      "ring-chart.mdx RingChart/Ring props: baseInnerRadius, padding, showGlow",
    exercises: "baseInnerRadius 40, padding 20, showGlow={false}",
    render: (side) => {
      const { RingChart, Ring } = PARTS[side];
      return (
        <RingChart baseInnerRadius={40} data={ringData} padding={20} size={280}>
          {ringData.map((item, index) => (
            <Ring index={index} key={item.label} showGlow={false} />
          ))}
          <RingCenter defaultLabel="Sessions" />
        </RingChart>
      );
    },
  },
  {
    id: "no-animate",
    label: "animate={false}",
    source: "ring-chart.mdx Ring props: animate",
    exercises: "Static rings (no enter sweep), hover still on",
    render: (side) => {
      const { RingChart, Ring } = PARTS[side];
      return (
        <RingChart data={ringData} size={280}>
          {ringData.map((item, index) => (
            <Ring animate={false} index={index} key={item.label} />
          ))}
          <RingCenter defaultLabel="Sessions" />
        </RingChart>
      );
    },
  },
];
