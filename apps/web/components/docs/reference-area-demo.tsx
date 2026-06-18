"use client";

import {
  ChartTooltip,
  Grid,
  Line,
  LineChart,
  ReferenceArea,
  XAxis,
} from "@bklitui/ui/charts";

const chartData = [
  { date: new Date(2024, 0, 1), value: 186 },
  { date: new Date(2024, 1, 1), value: 305 },
  { date: new Date(2024, 2, 1), value: 237 },
  { date: new Date(2024, 3, 1), value: 73 },
  { date: new Date(2024, 4, 1), value: 209 },
  { date: new Date(2024, 5, 1), value: 214 },
];

export function ReferenceAreaBandDemo() {
  return (
    <div className="w-full">
      <LineChart data={chartData}>
        <Grid horizontal />
        <ReferenceArea showMarkers strokeStyle="dashed" y1={160} y2={220} />
        <Line dataKey="value" />
        <XAxis />
        <ChartTooltip />
      </LineChart>
    </div>
  );
}

export function ReferenceAreaPatternDemo() {
  return (
    <div className="w-full">
      <LineChart data={chartData}>
        <Grid horizontal />
        <ReferenceArea
          axisLabelColor="var(--chart-1)"
          fillOpacity={0.85}
          pattern="diagonal"
          patternColor="var(--chart-foreground-muted)"
          y1={160}
          y2={220}
        />
        <Line dataKey="value" />
        <XAxis />
        <ChartTooltip />
      </LineChart>
    </div>
  );
}

export function ReferenceAreaMarkersDemo() {
  return (
    <div className="w-full">
      <LineChart data={chartData}>
        <Grid horizontal />
        <ReferenceArea
          markerColor="var(--chart-1)"
          showMarkers
          stroke="var(--chart-1)"
          strokeStyle="dashed"
          y1={160}
          y2={220}
        />
        <Line dataKey="value" />
        <XAxis />
        <ChartTooltip />
      </LineChart>
    </div>
  );
}
