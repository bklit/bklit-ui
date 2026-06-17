"use client"

// In your app (monorepo/npm): import { ProgressBar } from "@bklitui/ui/charts"
import { ProgressBar } from "@/components/charts"



export default function Component() {
  return (
    <main className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-3xl">
        <ProgressBar
  value={72}
  totalNotches={72}
  spacing={0}
  notchCornerRadius={3}
  notchLengthPercent={38}
  inactiveFillOpacity={0.4}
  useGradient
/>
      </div>
    </main>
  )
}
