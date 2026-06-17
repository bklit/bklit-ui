"use client";

import { ProgressBar } from "@bklitui/ui/charts";

export function ProgressBarDemo() {
  return (
    <div className="mx-auto w-full min-w-[200px] max-w-lg py-4">
      <ProgressBar
        inactiveFillOpacity={0.4}
        notchCornerRadius={3}
        notchLengthPercent={38}
        spacing={0}
        totalNotches={72}
        useGradient
        value={72}
      />
    </div>
  );
}
