"use client"

// In your app (monorepo/npm): import { buildArcs, SunburstBreadcrumb, SunburstCenter, SunburstChart, SunburstHint, SunburstLabels, SunburstSegment } from "@bklitui/ui/charts"
import { buildArcs, SunburstBreadcrumb, SunburstCenter, SunburstChart, SunburstHint, SunburstLabels, SunburstSegment } from "@/components/charts"

const data = {
  name: "Revenue",
  children: [
    {
      name: "Product",
      children: [
        { name: "Enterprise", value: 198 },
        { name: "Pro", value: 145 },
        { name: "Starter", value: 95 },
      ],
    },
    {
      name: "Services",
      children: [
        { name: "Consulting", value: 160 },
        { name: "Support", value: 90 },
        { name: "Training", value: 55 },
      ],
    },
    {
      name: "Partners",
      children: [
        { name: "Referrals", value: 120 },
        { name: "Affiliates", value: 75 },
      ],
    },
  ],
};

const { arcs } = buildArcs(data);

export default function Component() {
  return (
    <main className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-3xl">
        <SunburstChart data={data} size={360}>
  {arcs.map((arc) => (
    <SunburstSegment index={arc.arcIndex} key={arc.id} />
  ))}
  <SunburstCenter />
  <SunburstLabels />
  <SunburstHint />
</SunburstChart>
      </div>
    </main>
  )
}
