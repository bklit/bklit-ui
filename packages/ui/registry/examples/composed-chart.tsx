"use client"

// In your app (monorepo/npm): import { ComposedChart, SeriesBar, Area, Line, Grid, XAxis, ChartTooltip } from "@bklitui/ui/charts"
import { ComposedChart, SeriesBar, Area, Line, Grid, XAxis, ChartTooltip } from "@/components/charts"

import { curveNatural } from "@visx/curve";

const chartData = [
  { date: new Date("2024-01-01"), revenue: 4200, runRate: 3800 },
  { date: new Date("2024-02-01"), revenue: 5100, runRate: 4600 },
  { date: new Date("2024-03-01"), revenue: 4800, runRate: 5200 },
  { date: new Date("2024-04-01"), revenue: 5500, runRate: 5000 },
];

export default function Component() {
  return (
    <main className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-3xl">
        <ComposedChart data={chartData}>
  <Grid horizontal />
  <SeriesBar dataKey="revenue" fill="var(--chart-1)" />
  <Area dataKey="runRate" curve={curveNatural} fill="var(--chart-4)" fillOpacity={0.35} />
  <Line dataKey="runRate" curve={curveNatural} stroke="var(--chart-2)" />
  <XAxis />
  <ChartTooltip />
</ComposedChart>
      </div>
    </main>
  )
}
