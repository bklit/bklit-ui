"use client"

// In your app (monorepo/npm): import { HeatmapCells, HeatmapChart, HeatmapInteractionBoundary, HeatmapInteractionProvider, HeatmapLegend, HeatmapTooltip, HeatmapXAxis, HeatmapYAxis } from "@bklitui/ui/charts"
import { HeatmapCells, HeatmapChart, HeatmapInteractionBoundary, HeatmapInteractionProvider, HeatmapLegend, HeatmapTooltip, HeatmapXAxis, HeatmapYAxis } from "@/components/charts"

const data = [
  {
    bin: 0,
    bins: [
      { bin: 0, count: 2, date: new Date(2024, 0, 1) },
      { bin: 1, count: 0, date: new Date(2024, 0, 2) },
      { bin: 2, count: 3, date: new Date(2024, 0, 3) },
      { bin: 3, count: 1, date: new Date(2024, 0, 4) },
      { bin: 4, count: 4, date: new Date(2024, 0, 5) },
      { bin: 5, count: 0, date: new Date(2024, 0, 6) },
      { bin: 6, count: 1, date: new Date(2024, 0, 7) },
    ],
  },
  {
    bin: 1,
    bins: [
      { bin: 0, count: 1, date: new Date(2024, 0, 8) },
      { bin: 1, count: 2, date: new Date(2024, 0, 9) },
      { bin: 2, count: 0, date: new Date(2024, 0, 10) },
      { bin: 3, count: 3, date: new Date(2024, 0, 11) },
      { bin: 4, count: 2, date: new Date(2024, 0, 12) },
      { bin: 5, count: 1, date: new Date(2024, 0, 13) },
      { bin: 6, count: 0, date: new Date(2024, 0, 14) },
    ],
  },
];

export default function Component() {
  return (
    <main className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-3xl">
        <HeatmapInteractionProvider>
  <HeatmapInteractionBoundary>
    <div className="flex w-full flex-col items-stretch gap-3">
      <HeatmapChart className="w-full" data={data} layout="fluid">
        <HeatmapCells />
        <HeatmapXAxis />
        <HeatmapYAxis />
        <HeatmapTooltip instant />
      </HeatmapChart>
      <HeatmapLegend />
    </div>
  </HeatmapInteractionBoundary>
</HeatmapInteractionProvider>
      </div>
    </main>
  )
}
