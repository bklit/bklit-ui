"use client"

// In your app (monorepo/npm): import { FunnelChart } from "@bklitui/ui/charts"
import { FunnelChart } from "@/components/charts"

const funnelData = [
  { label: "Visitors", value: 12000 },
  { label: "Signups", value: 4800 },
  { label: "Activated", value: 2100 },
  { label: "Paid", value: 840 },
];

export default function Component() {
  return (
    <main className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-3xl">
        <FunnelChart data={funnelData} aspectRatio="2 / 1" />
      </div>
    </main>
  )
}
