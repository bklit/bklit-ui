"use client"

// In your app (monorepo/npm): import { ChoroplethChart, ChoroplethFeatureComponent, ChoroplethTooltip } from "@bklitui/ui/charts"
import { ChoroplethChart, ChoroplethFeatureComponent, ChoroplethTooltip } from "@/components/charts"

const features = [
  { id: "US", name: "United States", value: 120 },
  { id: "CA", name: "Canada", value: 45 },
  { id: "GB", name: "United Kingdom", value: 62 },
];

export default function Component() {
  return (
    <main className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-3xl">
        <ChoroplethChart data={features} aspectRatio="2 / 1">
  <ChoroplethFeatureComponent />
  <ChoroplethTooltip />
</ChoroplethChart>
      </div>
    </main>
  )
}
