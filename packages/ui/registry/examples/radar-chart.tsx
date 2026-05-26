"use client"

// In your app (monorepo/npm): import { RadarChart, RadarGrid, RadarAxis, RadarLabels, RadarArea } from "@bklitui/ui/charts"
import { RadarChart, RadarGrid, RadarAxis, RadarLabels, RadarArea } from "@/components/charts"

const metrics = [
  { key: "speed", label: "Speed" },
  { key: "reliability", label: "Reliability" },
  { key: "comfort", label: "Comfort" },
  { key: "safety", label: "Safety" },
  { key: "efficiency", label: "Efficiency" },
];
const data = [
  { id: "a", speed: 80, reliability: 70, comfort: 60, safety: 90, efficiency: 75 },
];

export default function Component() {
  return (
    <main className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-3xl">
        <RadarChart data={data} metrics={metrics} size={320}>
  <RadarGrid />
  <RadarAxis />
  <RadarLabels fontSize={10} offset={16} />
  {data.map((row, i) => (
    <RadarArea key={row.id} index={i} fill="var(--chart-line-primary)" fillOpacity={0.35} />
  ))}
</RadarChart>
      </div>
    </main>
  )
}
