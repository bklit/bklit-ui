"use client";

import { ChartTooltip, Grid, Line, LineChart, XAxis } from "@bklitui/ui/charts";

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

export function GridHorizontalDemo() {
  return (
    <div className="w-full">
      <LineChart data={chartData}>
        <Grid horizontal />
        <Line dataKey="value" />
        <XAxis />
        <ChartTooltip />
      </LineChart>
    </div>
  );
}

export function GridVerticalDemo() {
  return (
    <div className="w-full">
      <LineChart data={chartData}>
        <Grid horizontal={false} vertical />
        <Line dataKey="value" />
        <XAxis />
        <ChartTooltip />
      </LineChart>
    </div>
  );
}

export function GridBothDemo() {
  return (
    <div className="w-full">
      <LineChart data={chartData}>
        <Grid horizontal vertical />
        <Line dataKey="value" />
        <XAxis />
        <ChartTooltip />
      </LineChart>
    </div>
  );
}

export function GridSolidDemo() {
  return (
    <div className="w-full">
      <LineChart data={chartData}>
        <Grid horizontal strokeDasharray="" />
        <Line dataKey="value" />
        <XAxis />
        <ChartTooltip />
      </LineChart>
    </div>
  );
}

export function GridNoFadeDemo() {
  return (
    <div className="w-full">
      <LineChart data={chartData}>
        <Grid fadeHorizontal={false} horizontal />
        <Line dataKey="value" />
        <XAxis />
        <ChartTooltip />
      </LineChart>
    </div>
  );
}

export function GridDenseDemo() {
  return (
    <div className="w-full">
      <LineChart data={chartData}>
        <Grid horizontal numTicksColumns={15} numTicksRows={10} vertical />
        <Line dataKey="value" />
        <XAxis />
        <ChartTooltip />
      </LineChart>
    </div>
  );
}
