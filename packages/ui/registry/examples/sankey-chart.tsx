"use client"

// In your app (monorepo/npm): import { SankeyChart, SankeyLink, SankeyNode, SankeyTooltip } from "@bklitui/ui/charts"
import { SankeyChart, SankeyLink, SankeyNode, SankeyTooltip } from "@/components/charts"

const data = {
  nodes: [
    { name: "Ads" },
    { name: "Organic" },
    { name: "Landing" },
    { name: "Product" },
    { name: "Checkout" },
  ],
  links: [
    { source: 0, target: 2, value: 40 },
    { source: 1, target: 2, value: 30 },
    { source: 2, target: 3, value: 50 },
    { source: 3, target: 4, value: 35 },
  ],
};

export default function Component() {
  return (
    <main className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-3xl">
        <SankeyChart data={data} aspectRatio="16 / 9">
  <SankeyLink />
  <SankeyNode />
  <SankeyTooltip />
</SankeyChart>
      </div>
    </main>
  )
}
