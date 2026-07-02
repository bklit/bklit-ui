"use client";

import { ChartTooltip, Grid, Line, LineChart, XAxis } from "@bklitui/ui/charts";
import { useMemo, useState } from "react";

const fullData = Array.from({ length: 90 }, (_, index) => {
  const date = new Date();
  date.setDate(date.getDate() - (89 - index));
  return {
    date,
    revenue: Math.round(
      15_000 + Math.sin(index * 0.15) * 3000 + Math.random() * 2000 + index * 50
    ),
  };
});

type DateRange = "7d" | "30d" | "90d";

export function LineChartDateRangeDemo() {
  const [range, setRange] = useState<DateRange>("30d");

  const filteredData = useMemo(() => {
    const daysMap = { "7d": 7, "30d": 30, "90d": 90 };
    const days = daysMap[range];
    return fullData.slice(-days);
  }, [range]);

  return (
    <div className="w-full space-y-4">
      <div className="flex gap-2">
        <button
          className={`rounded-md px-3 py-1.5 font-medium text-sm transition-colors ${
            range === "7d"
              ? "bg-foreground text-background"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
          onClick={() => setRange("7d")}
          type="button"
        >
          Last 7 days
        </button>
        <button
          className={`rounded-md px-3 py-1.5 font-medium text-sm transition-colors ${
            range === "30d"
              ? "bg-foreground text-background"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
          onClick={() => setRange("30d")}
          type="button"
        >
          Last 30 days
        </button>
        <button
          className={`rounded-md px-3 py-1.5 font-medium text-sm transition-colors ${
            range === "90d"
              ? "bg-foreground text-background"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
          onClick={() => setRange("90d")}
          type="button"
        >
          Last 90 days
        </button>
      </div>
      <LineChart data={filteredData} yDomainTween>
        <Grid horizontal />
        <Line dataKey="revenue" stroke="var(--chart-line-primary)" />
        <XAxis />
        <ChartTooltip />
      </LineChart>
    </div>
  );
}
