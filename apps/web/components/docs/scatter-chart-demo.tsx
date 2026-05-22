"use client";

import {
  ChartTooltip,
  Grid,
  Scatter,
  ScatterChart,
  XAxis,
} from "@bklitui/ui/charts";

const chartData = [
  { date: new Date("2024-01-01"), sessions: 420, conversions: 28 },
  { date: new Date("2024-02-01"), sessions: 510, conversions: 34 },
  { date: new Date("2024-03-01"), sessions: 390, conversions: 22 },
  { date: new Date("2024-04-01"), sessions: 580, conversions: 41 },
  { date: new Date("2024-05-01"), sessions: 620, conversions: 38 },
  { date: new Date("2024-06-01"), sessions: 710, conversions: 52 },
];

export function ScatterChartDemo() {
  return (
    <div className="w-full">
      <ScatterChart data={chartData}>
        <Grid horizontal />
        <Scatter dataKey="sessions" radius={6} ringGap={2} strokeWidth={2} />
        <Scatter dataKey="conversions" radius={6} ringGap={2} strokeWidth={2} />
        <XAxis />
        <ChartTooltip />
      </ScatterChart>
    </div>
  );
}
