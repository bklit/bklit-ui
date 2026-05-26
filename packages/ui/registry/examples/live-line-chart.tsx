"use client"

// In your app (monorepo/npm): import { LiveLineChart, LiveLine, LiveXAxis, LiveYAxis, ChartTooltip } from "@bklitui/ui/charts"
import { LiveLineChart, LiveLine, LiveXAxis, LiveYAxis, ChartTooltip } from "@/components/charts"

import { curveNatural } from "@visx/curve";

const initialData = Array.from({ length: 24 }, (_, i) => ({
  time: Date.now() - (23 - i) * 60_000,
  value: 50 + Math.sin(i / 3) * 20,
}));

export default function Component() {
  return (
    <main className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-3xl">
        <LiveLineChart
  data={initialData}
  interval={1000}
  maxPoints={24}
  xDataKey="time"
  yDataKey="value"
>
  <LiveLine curve={curveNatural} stroke="var(--chart-line-primary)" />
  <LiveXAxis />
  <LiveYAxis />
  <ChartTooltip />
</LiveLineChart>
      </div>
    </main>
  )
}
