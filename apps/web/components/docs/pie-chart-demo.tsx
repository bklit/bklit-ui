"use client";

import {
  Legend,
  LegendItemComponent,
  type LegendItemData,
  LegendLabel,
  LegendMarker,
  LegendValue,
  PatternLines,
  PieCenter,
  PieChart,
  type PieData,
  PieSlice,
  type PieSliceHoverEffect,
  RadialGradient,
} from "@bklitui/ui/charts";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Sample data for pie charts
const salesData: PieData[] = [
  { label: "Electronics", value: 4250, color: "#0ea5e9" },
  { label: "Clothing", value: 3120, color: "#a855f7" },
  { label: "Food", value: 2100, color: "#f59e0b" },
  { label: "Home", value: 1580, color: "#10b981" },
  { label: "Other", value: 1050, color: "#ef4444" },
];

// Convert pie data to legend items
function toLegendItems(data: PieData[]): LegendItemData[] {
  return data.map((d) => ({
    label: d.label,
    value: d.value,
    color: d.color || "",
  }));
}

/**
 * Main demo with interactive legend
 */
export function PieChartDemo() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const legendItems = toLegendItems(salesData);

  return (
    <div className="flex flex-col items-center justify-center gap-8 lg:flex-row lg:gap-12">
      {/* Pie Chart */}
      <PieChart
        data={salesData}
        hoveredIndex={hoveredIndex}
        onHoverChange={setHoveredIndex}
        size={280}
      >
        {salesData.map((item, index) => (
          <PieSlice index={index} key={item.label} />
        ))}
      </PieChart>

      {/* Legend */}
      <Legend
        hoveredIndex={hoveredIndex}
        items={legendItems}
        onHoverChange={setHoveredIndex}
        title="Sales by Category"
      >
        <LegendItemComponent className="flex items-center gap-3">
          <LegendMarker />
          <LegendLabel className="flex-1" />
          <LegendValue showPercentage />
        </LegendItemComponent>
      </Legend>
    </div>
  );
}

/**
 * Basic pie chart without legend
 */
export function PieChartBasicDemo() {
  return (
    <PieChart data={salesData} size={240}>
      {salesData.map((item, index) => (
        <PieSlice index={index} key={item.label} />
      ))}
    </PieChart>
  );
}

/**
 * Donut chart with center content
 */
export function PieChartDonutDemo() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <PieChart
      data={salesData}
      hoveredIndex={hoveredIndex}
      innerRadius={70}
      onHoverChange={setHoveredIndex}
      size={280}
    >
      {salesData.map((item, index) => (
        <PieSlice index={index} key={item.label} />
      ))}
      <PieCenter defaultLabel="Total Sales" />
    </PieChart>
  );
}

/**
 * Donut chart with interactive legend
 */
export function PieChartDonutLegendDemo() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const legendItems = toLegendItems(salesData);

  return (
    <div className="flex flex-col items-center justify-center gap-8 lg:flex-row lg:gap-12">
      <PieChart
        data={salesData}
        hoveredIndex={hoveredIndex}
        innerRadius={70}
        onHoverChange={setHoveredIndex}
        size={280}
      >
        {salesData.map((item, index) => (
          <PieSlice index={index} key={item.label} />
        ))}
        <PieCenter defaultLabel="Total Sales" />
      </PieChart>

      <Legend
        hoveredIndex={hoveredIndex}
        items={legendItems}
        onHoverChange={setHoveredIndex}
        title="Sales by Category"
      >
        <LegendItemComponent className="flex items-center gap-3">
          <LegendMarker />
          <LegendLabel className="flex-1" />
          <LegendValue showPercentage />
        </LegendItemComponent>
      </Legend>
    </div>
  );
}

/**
 * Pie chart with patterns
 */
export function PieChartPatternsDemo() {
  const patternData: PieData[] = [
    { label: "Category A", value: 35 },
    { label: "Category B", value: 25 },
    { label: "Category C", value: 20 },
    { label: "Category D", value: 20 },
  ];

  return (
    <PieChart data={patternData} size={280}>
      {/* Pattern definitions */}
      <PatternLines
        height={6}
        id="pie-pattern-1"
        orientation={["diagonal"]}
        stroke="var(--chart-1)"
        strokeWidth={1}
        width={6}
      />
      <PatternLines
        height={6}
        id="pie-pattern-2"
        orientation={["horizontal"]}
        stroke="var(--chart-2)"
        strokeWidth={1}
        width={6}
      />
      <PatternLines
        height={6}
        id="pie-pattern-3"
        orientation={["vertical"]}
        stroke="var(--chart-3)"
        strokeWidth={1}
        width={6}
      />
      <PatternLines
        height={8}
        id="pie-pattern-4"
        orientation={["diagonalRightToLeft"]}
        stroke="var(--chart-4)"
        strokeWidth={1}
        width={8}
      />

      {/* Slices with pattern fills */}
      <PieSlice fill="url(#pie-pattern-1)" index={0} />
      <PieSlice fill="url(#pie-pattern-2)" index={1} />
      <PieSlice fill="url(#pie-pattern-3)" index={2} />
      <PieSlice fill="url(#pie-pattern-4)" index={3} />
    </PieChart>
  );
}

/**
 * Pie chart with gradients
 */
export function PieChartGradientsDemo() {
  const gradientData: PieData[] = [
    { label: "Segment A", value: 40 },
    { label: "Segment B", value: 30 },
    { label: "Segment C", value: 30 },
  ];

  return (
    <PieChart data={gradientData} size={280}>
      {/* Gradient definitions */}
      <RadialGradient
        from="#0ea5e9"
        fromOffset="0%"
        id="pie-gradient-1"
        to="#06b6d4"
        toOffset="100%"
      />
      <RadialGradient
        from="#a855f7"
        fromOffset="0%"
        id="pie-gradient-2"
        to="#ec4899"
        toOffset="100%"
      />
      <RadialGradient
        from="#f59e0b"
        fromOffset="0%"
        id="pie-gradient-3"
        to="#ef4444"
        toOffset="100%"
      />

      {/* Slices with gradient fills */}
      <PieSlice fill="url(#pie-gradient-1)" index={0} />
      <PieSlice fill="url(#pie-gradient-2)" index={1} />
      <PieSlice fill="url(#pie-gradient-3)" index={2} />
    </PieChart>
  );
}

/**
 * Hover effect demo with selector
 */
export function PieChartHoverEffectDemo() {
  const [hoverEffect, setHoverEffect] =
    useState<PieSliceHoverEffect>("translate");

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex items-center gap-3">
        <span className="text-muted-foreground text-sm">Hover Effect:</span>
        <Select
          onValueChange={(v) => setHoverEffect(v as PieSliceHoverEffect)}
          value={hoverEffect}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="translate">Translate</SelectItem>
            <SelectItem value="grow">Grow</SelectItem>
            <SelectItem value="none">None</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <PieChart data={salesData} size={280}>
        {salesData.map((item, index) => (
          <PieSlice hoverEffect={hoverEffect} index={index} key={item.label} />
        ))}
      </PieChart>
    </div>
  );
}

/**
 * Donut with custom center content
 */
export function PieChartCustomCenterDemo() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <PieChart
      data={salesData}
      hoveredIndex={hoveredIndex}
      innerRadius={80}
      onHoverChange={setHoveredIndex}
      size={300}
    >
      {salesData.map((item, index) => (
        <PieSlice index={index} key={item.label} />
      ))}
      <PieCenter>
        {({ value, label, isHovered, data }) => (
          <div className="text-center">
            <div
              className="font-bold text-3xl"
              style={{ color: isHovered ? data.color : undefined }}
            >
              {value.toLocaleString()}
            </div>
            <div className="text-muted-foreground text-sm">{label}</div>
            {isHovered && (
              <div className="mt-1 text-muted-foreground text-xs">
                {(
                  (data.value / salesData.reduce((s, d) => s + d.value, 0)) *
                  100
                ).toFixed(1)}
                % of total
              </div>
            )}
          </div>
        )}
      </PieCenter>
    </PieChart>
  );
}
