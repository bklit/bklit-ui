"use client";

import {
  ChartTooltip,
  Grid,
  Scatter,
  ScatterChart,
  XAxis,
  YAxis,
} from "@bklitui/ui/charts";
import {
  formatLoc,
  formatPrMonth,
  PrLocTooltip,
  prLocData,
  prLocSeries,
} from "@/lib/scatter-pr-demo-data";

const chartData = Array.from({ length: 24 }, (_, i) => ({
  date: new Date(2023, i, 1),
  sessions: Math.floor(140 + Math.sin(i / 3) * 90 + ((i * 11) % 40)),
  conversions: Math.floor(70 + Math.cos(i / 2.5) * 55 + ((i * 7) % 35)),
}));

export function ScatterChartDemo() {
  return (
    <div className="w-full">
      <ScatterChart data={chartData}>
        <Grid horizontal />
        <Scatter dataKey="sessions" />
        <Scatter dataKey="conversions" />
        <XAxis />
        <ChartTooltip />
      </ScatterChart>
    </div>
  );
}

export function ScatterJitterDemo() {
  return (
    <div className="w-full">
      <ScatterChart
        data={prLocData}
        formatXLabel={formatPrMonth}
        jitter={{ x: 0.6 }}
        margin={{ top: 40, right: 40, bottom: 40, left: 56 }}
      >
        <Grid
          highlightRowStrokeDasharray="4,4"
          highlightRowValues={[500]}
          horizontal
        />
        <Scatter
          dataKey="fastlane"
          fill={prLocSeries.fastlane.color}
          radius={3}
        />
        <Scatter dataKey="human" fill={prLocSeries.human.color} radius={3} />
        <YAxis formatValue={formatLoc} />
        <XAxis numTicks={12} />
        <ChartTooltip content={({ point }) => <PrLocTooltip point={point} />} />
      </ScatterChart>
    </div>
  );
}
