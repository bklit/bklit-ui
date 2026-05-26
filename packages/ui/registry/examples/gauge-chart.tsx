"use client"

// In your app (monorepo/npm): import { Gauge } from "@bklitui/ui/charts"
import { Gauge } from "@/components/charts"



export default function Component() {
  return (
    <main className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-3xl">
        <Gauge
  value={72}
  centerValue={72}
  totalNotches={40}
  defaultLabel="Score"
  formatOptions={{ style: "percent" }}
/>
      </div>
    </main>
  )
}
