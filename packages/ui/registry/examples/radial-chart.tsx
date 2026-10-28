"use client"

// In your app (monorepo/npm): import { RadialChart, RadialAxis, RadialBar, RadialCenter, RadialLegend } from "@bklitui/ui/charts"
import { RadialChart, RadialAxis, RadialBar, RadialCenter, RadialLegend } from "@/components/charts"

const series = [
  { dataKey: "desktop", label: "Desktop" },
  { dataKey: "mobile", label: "Mobile" },
];
const data = [
  { month: "Jan", desktop: 186, mobile: 80 },
  { month: "Feb", desktop: 305, mobile: 200 },
  { month: "Mar", desktop: 237, mobile: 120 },
  { month: "Apr", desktop: 173, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "Jun", desktop: 214, mobile: 140 },
  { month: "Jul", desktop: 248, mobile: 160 },
  { month: "Aug", desktop: 276, mobile: 175 },
  { month: "Sep", desktop: 231, mobile: 150 },
  { month: "Oct", desktop: 262, mobile: 185 },
  { month: "Nov", desktop: 290, mobile: 210 },
  { month: "Dec", desktop: 318, mobile: 240 },
];

export default function Component() {
  return (
    <main className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-3xl">
        <RadialChart angleType="band" data={data} xDataKey="month" series={series} maxValue="stacked">
  <RadialBar />
  <RadialAxis showCircle={false} />
  <RadialCenter />
  <RadialLegend />
</RadialChart>
      </div>
    </main>
  )
}
