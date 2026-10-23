"use client"

// In your app (monorepo/npm): import { AreaSparkline, BarSparkline, LineSparkline } from "@bklitui/ui/charts"
import { AreaSparkline, BarSparkline, LineSparkline } from "@/components/charts"

const data = Array.from({ length: 24 }, (_, i) => ({
  day: i + 1,
  value: Math.round(4200 + 40 * i + Math.sin(i * 0.7) * 500),
}));

export default function Component() {
  return (
    <main className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-3xl">
        <div className="grid gap-6 sm:grid-cols-3">
          <LineSparkline data={data} dataKey="value" height={48} endDot />
          <AreaSparkline data={data} dataKey="value" height={48} />
          <BarSparkline data={data} dataKey="value" height={48} />
        </div>
      </div>
    </main>
  )
}
