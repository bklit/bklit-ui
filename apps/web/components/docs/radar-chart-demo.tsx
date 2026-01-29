"use client";

import {
  Legend,
  LegendItemComponent,
  type LegendItemData,
  LegendLabel,
  LegendMarker,
  LegendValue,
  RadarArea,
  RadarAxis,
  RadarChart,
  type RadarData,
  RadarGrid,
  RadarLabels,
  type RadarMetric,
} from "@bklitui/ui/charts";
import { useState } from "react";

// Campaign performance metrics
const metrics: RadarMetric[] = [
  { key: "engagement", label: "Engagement" },
  { key: "pagesPerSession", label: "Pages/Session" },
  { key: "sessionDuration", label: "Session Duration" },
  { key: "conversionRate", label: "Conversion" },
  { key: "bounceInverse", label: "Retention" },
];

// Campaign data with normalized values (0-100)
const campaignData: RadarData[] = [
  {
    label: "Google Search",
    color: "#3b82f6",
    values: {
      engagement: 72,
      pagesPerSession: 68,
      sessionDuration: 70,
      conversionRate: 75,
      bounceInverse: 65,
    },
  },
  {
    label: "Display Ads",
    color: "#f59e0b",
    values: {
      engagement: 85,
      pagesPerSession: 45,
      sessionDuration: 40,
      conversionRate: 30,
      bounceInverse: 88,
    },
  },
  {
    label: "Newsletter",
    color: "#10b981",
    values: {
      engagement: 45,
      pagesPerSession: 90,
      sessionDuration: 92,
      conversionRate: 88,
      bounceInverse: 42,
    },
  },
  {
    label: "Social",
    color: "#ec4899",
    values: {
      engagement: 95,
      pagesPerSession: 35,
      sessionDuration: 25,
      conversionRate: 55,
      bounceInverse: 78,
    },
  },
];

export function RadarChartDemo() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Convert radar data to legend items
  const legendItems: LegendItemData[] = campaignData.map((d, index) => ({
    label: d.label,
    value: Object.values(d.values).reduce((a, b) => a + b, 0) / metrics.length,
    maxValue: 100,
    color: d.color ?? `var(--chart-${index + 1})`,
  }));

  return (
    <div className="flex flex-col items-center justify-center gap-8 lg:flex-row lg:gap-12">
      {/* Chart */}
      <RadarChart
        data={campaignData}
        hoveredIndex={hoveredIndex}
        metrics={metrics}
        onHoverChange={setHoveredIndex}
        size={400}
      >
        <RadarGrid />
        <RadarAxis />
        <RadarLabels interactive />
        {campaignData.map((item, index) => (
          <RadarArea index={index} key={item.label} />
        ))}
      </RadarChart>

      {/* Legend */}
      <Legend
        hoveredIndex={hoveredIndex}
        items={legendItems}
        onHoverChange={setHoveredIndex}
        title="Campaign Performance"
      >
        <LegendItemComponent className="flex items-center gap-3">
          <LegendMarker />
          <LegendLabel className="flex-1" />
          <LegendValue formatValue={(v) => `${v.toFixed(0)}%`} />
        </LegendItemComponent>
      </Legend>
    </div>
  );
}

export function RadarChartBasicDemo() {
  return (
    <RadarChart data={campaignData} metrics={metrics} size={350}>
      <RadarGrid />
      <RadarAxis />
      <RadarLabels />
      {campaignData.map((item, index) => (
        <RadarArea index={index} key={item.label} />
      ))}
    </RadarChart>
  );
}

export function RadarChartMinimalDemo() {
  // Simpler 3-metric example
  const simpleMetrics: RadarMetric[] = [
    { key: "speed", label: "Speed" },
    { key: "power", label: "Power" },
    { key: "technique", label: "Technique" },
  ];

  const simpleData: RadarData[] = [
    {
      label: "Player A",
      color: "#6366f1",
      values: { speed: 85, power: 70, technique: 90 },
    },
    {
      label: "Player B",
      color: "#f97316",
      values: { speed: 65, power: 95, technique: 60 },
    },
  ];

  return (
    <RadarChart data={simpleData} levels={4} metrics={simpleMetrics} size={300}>
      <RadarGrid showLabels={false} />
      <RadarAxis />
      <RadarLabels fontSize={12} offset={20} />
      {simpleData.map((item, index) => (
        <RadarArea index={index} key={item.label} />
      ))}
    </RadarChart>
  );
}
