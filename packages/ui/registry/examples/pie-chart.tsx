"use client"

// In your app (monorepo/npm): import { PieChart, PieSlice, PieCenter } from "@bklitui/ui/charts"
import { PieChart, PieSlice, PieCenter } from "@/components/charts"

const pieData = [
  { label: "Direct", value: 320 },
  { label: "Organic", value: 280 },
  { label: "Referral", value: 190 },
  { label: "Social", value: 140 },
];

export default function Component() {
  return (
    <main className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-3xl">
        <PieChart data={pieData} size={280}>
  {pieData.map((item, i) => (
    <PieSlice index={i} key={item.label} />
  ))}
  <PieCenter defaultLabel="Traffic" />
</PieChart>
      </div>
    </main>
  )
}
