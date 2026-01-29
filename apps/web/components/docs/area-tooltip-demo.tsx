"use client";

import { ChartTooltip } from "@bklitui/ui/charts";

export function AreaTooltipDemo() {
  return (
    <ChartTooltip
      rows={(point) => [
        {
          color: "var(--chart-line-primary)",
          label: "Revenue",
          value: `$${(point.revenue as number)?.toLocaleString() ?? 0}`,
        },
        {
          color: "var(--chart-line-secondary)",
          label: "Costs",
          value: `$${(point.costs as number)?.toLocaleString() ?? 0}`,
        },
      ]}
    />
  );
}
