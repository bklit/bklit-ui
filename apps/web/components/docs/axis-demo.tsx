"use client";

import {
  ChartTooltip,
  Grid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "@bklitui/ui/charts";

const chartData = [
  { date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), value: 1200 },
  { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), value: 1450 },
  { date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), value: 1380 },
  { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), value: 1620 },
  { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), value: 1850 },
  { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), value: 1750 },
  { date: new Date(), value: 2100 },
];

export function AxisBothDemo() {
  return (
    <div className="w-full">
      <LineChart data={chartData} margin={{ left: 50 }}>
        <Grid horizontal vertical />
        <Line dataKey="value" stroke="var(--chart-line-primary)" />
        <YAxis />
        <XAxis />
        <ChartTooltip />
      </LineChart>
    </div>
  );
}

export function AxisXOnlyDemo() {
  return (
    <div className="w-full">
      <LineChart data={chartData}>
        <Grid horizontal />
        <Line dataKey="value" stroke="var(--chart-line-primary)" />
        <XAxis />
        <ChartTooltip />
      </LineChart>
    </div>
  );
}

export function AxisYOnlyDemo() {
  return (
    <div className="w-full">
      <LineChart data={chartData} margin={{ left: 50 }}>
        <Grid horizontal />
        <Line dataKey="value" stroke="var(--chart-line-primary)" />
        <YAxis />
        <ChartTooltip />
      </LineChart>
    </div>
  );
}
