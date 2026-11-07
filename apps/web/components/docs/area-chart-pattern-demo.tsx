"use client";

import {
  Area,
  AreaChart,
  ChartTooltip,
  Grid,
  PatternArea,
  PatternPreset,
  XAxis,
} from "@bklitui/ui/charts";

const chartData = [
  { date: new Date(2024, 0, 1), desktop: 186 },
  { date: new Date(2024, 1, 1), desktop: 305 },
  { date: new Date(2024, 2, 1), desktop: 237 },
  { date: new Date(2024, 3, 1), desktop: 73 },
  { date: new Date(2024, 4, 1), desktop: 209 },
  { date: new Date(2024, 5, 1), desktop: 214 },
];

export function AreaChartPatternDemo() {
  return (
    <div className="w-full">
      <AreaChart data={chartData}>
        <PatternPreset
          color="var(--chart-1)"
          id="area-doc-pattern"
          preset="diagonal-up"
        />
        <Grid horizontal />
        <PatternArea dataKey="desktop" fill="url(#area-doc-pattern)" />
        <Area dataKey="desktop" fillOpacity={0} strokeWidth={2} />
        <XAxis />
        <ChartTooltip />
      </AreaChart>
    </div>
  );
}
