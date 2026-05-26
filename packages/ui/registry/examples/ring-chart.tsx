"use client"

// In your app (monorepo/npm): import { RingChart, Ring, RingCenter } from "@bklitui/ui/charts"
import { RingChart, Ring, RingCenter } from "@/components/charts"

const ringData = [
  { label: "Email", value: 42 },
  { label: "Social", value: 28 },
  { label: "Direct", value: 18 },
  { label: "Other", value: 12 },
];

export default function Component() {
  return (
    <main className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-3xl">
        <RingChart data={ringData} size={280} strokeWidth={14}>
  {ringData.map((item, i) => (
    <Ring index={i} key={item.label} />
  ))}
  <RingCenter defaultLabel="Channels" />
</RingChart>
      </div>
    </main>
  )
}
