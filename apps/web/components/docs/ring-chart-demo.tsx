"use client";

import {
  Legend,
  LegendItemComponent,
  type LegendItemData,
  LegendLabel,
  LegendMarker,
  LegendProgress,
  LegendValue,
  Ring,
  RingCenter,
  RingChart,
  type RingData,
} from "@bklitui/ui/charts";
import { useState } from "react";

// Sample session data
const sessionsData: RingData[] = [
  { label: "Organic", value: 4250, maxValue: 5000, color: "#0ea5e9" },
  { label: "Paid", value: 3120, maxValue: 5000, color: "#a855f7" },
  { label: "Email", value: 2100, maxValue: 5000, color: "#f59e0b" },
  { label: "Social", value: 1580, maxValue: 5000, color: "#10b981" },
  { label: "Referral", value: 1050, maxValue: 5000, color: "#ef4444" },
  { label: "Direct", value: 747, maxValue: 5000, color: "#6366f1" },
];

export function RingChartDemo() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Convert ring data to legend items
  const legendItems: LegendItemData[] = sessionsData.map((d) => ({
    label: d.label,
    value: d.value,
    maxValue: d.maxValue,
    color: d.color || "",
  }));

  return (
    <div className="flex flex-col items-center justify-center gap-8 lg:flex-row lg:gap-12">
      {/* Chart */}
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

      {/* Composable Legend */}
      <Legend
        hoveredIndex={hoveredIndex}
        items={legendItems}
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

export function RingChartBasicDemo() {
  return (
    <RingChart data={sessionsData} size={280}>
      {sessionsData.map((item, index) => (
        <Ring index={index} key={item.label} />
      ))}
      <RingCenter />
    </RingChart>
  );
}

export function RingChartCustomColorsDemo() {
  const customData: RingData[] = [
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

  return (
    <RingChart data={customData} ringGap={8} size={240} strokeWidth={16}>
      {customData.map((item, index) => (
        <Ring index={index} key={item.label} />
      ))}
      <RingCenter
        defaultLabel="Total"
        formatOptions={{ notation: "compact" }}
        prefix="$"
      />
    </RingChart>
  );
}
