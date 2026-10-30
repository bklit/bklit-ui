"use client";

import {
  RadarChart as D3RadarChart,
  RadarGrid as D3RadarGrid,
  Legend,
  LegendItemComponent,
  type LegendItemData,
  LegendLabel,
  LegendMarker,
  LegendValue,
  RadarArea,
  RadarAxis,
  type RadarData,
  RadarLabels,
  type RadarMetric,
} from "@bklitui/ui/charts";
import {
  LegacyRadarChart,
  LegacyRadarGrid,
} from "@bklitui/ui/charts/legacy-visx";
import { useState } from "react";
import { chartExampleRadialShellClassName } from "@/components/charts/chart-example-preview";
import type { LabSide, LabVariant } from "./types";

const PARTS = {
  before: { RadarChart: LegacyRadarChart, RadarGrid: LegacyRadarGrid },
  after: { RadarChart: D3RadarChart, RadarGrid: D3RadarGrid },
} as const;

const EXAMPLES = "chart-examples.tsx";
const DOCS = "docs/radar-chart-demo.tsx";

// Data copied verbatim from the sources.
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

const campaignMetrics: RadarMetric[] = [
  { key: "engagement", label: "Engagement" },
  { key: "pagesPerSession", label: "Pages/Session" },
  { key: "sessionDuration", label: "Session Duration" },
  { key: "conversionRate", label: "Conversion" },
  { key: "bounceInverse", label: "Retention" },
];

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

function Shell({ children }: { children: React.ReactNode }) {
  return <div className={chartExampleRadialShellClassName}>{children}</div>;
}

function RadarChartDemo({ side }: { side: LabSide }) {
  const { RadarChart, RadarGrid } = PARTS[side];
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const legendItems: LegendItemData[] = campaignData.map((d, index) => ({
    label: d.label,
    value:
      Object.values(d.values).reduce((a, b) => a + b, 0) /
      campaignMetrics.length,
    maxValue: 100,
    color: d.color ?? `var(--chart-${index + 1})`,
  }));
  return (
    <div className="flex w-full min-w-0 max-w-full flex-col items-center justify-center gap-8 lg:w-auto lg:flex-row lg:gap-12">
      <RadarChart
        className="w-full max-w-[400px] lg:w-[400px] lg:shrink-0"
        data={campaignData}
        hoveredIndex={hoveredIndex}
        metrics={campaignMetrics}
        onHoverChange={setHoveredIndex}
      >
        <RadarGrid />
        <RadarAxis />
        <RadarLabels interactive />
        {campaignData.map((item, index) => (
          <RadarArea index={index} key={item.label} />
        ))}
      </RadarChart>
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

export const RADAR_VARIANTS: LabVariant[] = [
  {
    id: "default",
    label: "Radar",
    source: `${EXAMPLES}: Radar Chart`,
    exercises: "5 metrics × 2 series, grid labels, axis, points",
    render: (side) => {
      const { RadarChart, RadarGrid } = PARTS[side];
      return (
        <Shell>
          <RadarChart data={radarDataDual} metrics={radarMetrics5}>
            <RadarGrid />
            <RadarAxis />
            <RadarLabels fontSize={10} offset={16} />
            {radarDataDual.map((item, index) => (
              <RadarArea index={index} key={item.label} />
            ))}
          </RadarChart>
        </Shell>
      );
    },
  },
  {
    id: "triangle",
    label: "Triangle",
    source: `${EXAMPLES}: Radar Chart - Triangle (also ${DOCS}: RadarChartMinimalDemo)`,
    exercises: "3 metrics (triangular grid)",
    render: (side) => {
      const { RadarChart, RadarGrid } = PARTS[side];
      return (
        <Shell>
          <RadarChart data={radarDataTriangle} metrics={radarMetrics3}>
            <RadarGrid />
            <RadarAxis />
            <RadarLabels fontSize={10} offset={16} />
            {radarDataTriangle.map((item, index) => (
              <RadarArea index={index} key={item.label} />
            ))}
          </RadarChart>
        </Shell>
      );
    },
  },
  {
    id: "hexagon",
    label: "Hexagon",
    source: `${EXAMPLES}: Radar Chart - Hexagon`,
    exercises: "6 metrics, no axis, grid showLabels={false}, fill-only areas",
    render: (side) => {
      const { RadarChart, RadarGrid } = PARTS[side];
      return (
        <Shell>
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
        </Shell>
      );
    },
  },
  {
    id: "single-series",
    label: "Single series",
    source: `${EXAMPLES}: Radar Chart - Single Series`,
    exercises: "1 lopsided series, showPoints={false}",
    render: (side) => {
      const { RadarChart, RadarGrid } = PARTS[side];
      return (
        <Shell>
          <RadarChart data={radarDataLopsided} metrics={radarMetrics5}>
            <RadarGrid />
            <RadarAxis />
            <RadarLabels fontSize={10} offset={16} />
            <RadarArea index={0} showPoints={false} />
          </RadarChart>
        </Shell>
      );
    },
  },
  {
    id: "minimal",
    label: "Minimal",
    source: `${EXAMPLES}: Radar Chart - Minimal`,
    exercises: "levels={3}, no grid labels, no axis, no points",
    render: (side) => {
      const { RadarChart, RadarGrid } = PARTS[side];
      return (
        <Shell>
          <RadarChart data={radarDataDual} levels={3} metrics={radarMetrics5}>
            <RadarGrid showLabels={false} />
            <RadarLabels fontSize={10} offset={16} />
            {radarDataDual.map((item, index) => (
              <RadarArea index={index} key={item.label} showPoints={false} />
            ))}
          </RadarChart>
        </Shell>
      );
    },
  },
  {
    id: "grid-only",
    label: "Grid only",
    source: `${EXAMPLES}: Radar Chart - Grid Only`,
    exercises: "Triangle without axis lines, showGlow={false}",
    render: (side) => {
      const { RadarChart, RadarGrid } = PARTS[side];
      return (
        <Shell>
          <RadarChart data={radarDataTriangle} metrics={radarMetrics3}>
            <RadarGrid />
            <RadarLabels fontSize={10} offset={16} />
            {radarDataTriangle.map((item, index) => (
              <RadarArea index={index} key={item.label} showGlow={false} />
            ))}
          </RadarChart>
        </Shell>
      );
    },
  },
  {
    id: "docs-hero",
    label: "Docs hero",
    source: `${DOCS}: RadarChartDemo (radar-chart.mdx; also RadarChartBasicDemo)`,
    exercises:
      "4 series, className-sized (w-[400px]), interactive labels, Legend",
    width: 760,
    height: 460,
    render: (side) => <RadarChartDemo side={side} />,
  },
  {
    id: "glow-margin",
    label: "Glow + margin",
    source: "radar-chart.mdx RadarChart/RadarArea props: margin, showGlow",
    exercises: "margin={40}, levels={4}, showGlow on every area",
    render: (side) => {
      const { RadarChart, RadarGrid } = PARTS[side];
      return (
        <RadarChart
          data={radarDataDual}
          levels={4}
          margin={40}
          metrics={radarMetrics5}
          size={300}
        >
          <RadarGrid />
          <RadarAxis />
          <RadarLabels />
          {radarDataDual.map((item, index) => (
            <RadarArea index={index} key={item.label} showGlow />
          ))}
        </RadarChart>
      );
    },
  },
  {
    id: "no-animate",
    label: "animate={false}",
    source: "radar-chart.mdx RadarChart props: animate",
    exercises: "Static grid + areas (no enter grow), hover still on",
    render: (side) => {
      const { RadarChart, RadarGrid } = PARTS[side];
      return (
        <RadarChart
          animate={false}
          data={radarDataDual}
          metrics={radarMetrics5}
          size={300}
        >
          <RadarGrid />
          <RadarAxis />
          <RadarLabels fontSize={10} offset={16} />
          {radarDataDual.map((item, index) => (
            <RadarArea index={index} key={item.label} />
          ))}
        </RadarChart>
      );
    },
  },
];
