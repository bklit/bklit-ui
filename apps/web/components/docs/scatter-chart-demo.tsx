"use client";

import {
  ChartTooltip,
  Grid,
  Scatter,
  ScatterChart,
  XAxis,
} from "@bklitui/ui/charts";

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

/** 7 days × 24 samples — many rows share each date, so points overlap without jitter. */
const jitterData = Array.from({ length: 7 }, (_, day) =>
  Array.from({ length: 24 }, (_, i) => ({
    date: new Date(2024, 0, day + 1),
    desktop: 160 + day * 8 + ((i * 37 + day * 11) % 61) - 30,
    mobile: 120 + day * 6 + ((i * 53 + day * 7) % 51) - 25,
  }))
).flat();

export function ScatterJitterDemo() {
  return (
    <div className="w-full">
      <ScatterChart data={jitterData} jitter={{ x: 0.5 }}>
        <Grid horizontal />
        <Scatter dataKey="desktop" radius={3} />
        <Scatter dataKey="mobile" radius={3} />
        <XAxis numTicks={7} />
        <ChartTooltip />
      </ScatterChart>
    </div>
  );
}
