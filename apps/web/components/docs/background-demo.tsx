"use client";

import {
  Background,
  ChartTooltip,
  Line,
  LineChart,
  XAxis,
} from "@bklitui/ui/charts";

const chartData = [
  { date: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000), value: 1200 },
  { date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000), value: 1450 },
  { date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000), value: 1380 },
  { date: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000), value: 1620 },
  { date: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000), value: 1850 },
  { date: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000), value: 1750 },
  { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), value: 2100 },
  { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), value: 2320 },
];

export function BackgroundDiagonalDemo() {
  return (
    <div className="w-full">
      <LineChart data={chartData}>
        <Background />
        <Line dataKey="value" />
        <XAxis />
        <ChartTooltip />
      </LineChart>
    </div>
  );
}

export function BackgroundDotsDemo() {
  return (
    <div className="w-full">
      <LineChart data={chartData}>
        <Background opacity={0.85} pattern="dots" />
        <Line dataKey="value" />
        <XAxis />
        <ChartTooltip />
      </LineChart>
    </div>
  );
}

export function BackgroundCrossDemo() {
  return (
    <div className="w-full">
      <LineChart data={chartData}>
        <Background pattern="cross" scale={1.25} />
        <Line dataKey="value" />
        <XAxis />
        <ChartTooltip />
      </LineChart>
    </div>
  );
}

export function BackgroundNoFadeDemo() {
  return (
    <div className="w-full">
      <LineChart data={chartData}>
        <Background
          fadeHorizontal={false}
          fadeVertical={false}
          pattern="horizontal"
        />
        <Line dataKey="value" />
        <XAxis />
        <ChartTooltip />
      </LineChart>
    </div>
  );
}
