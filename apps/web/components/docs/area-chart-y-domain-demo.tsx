"use client";

import { Area, AreaChart, Grid } from "@bklitui/ui/charts";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const DATA_KEY = "value";

const readyData = Array.from({ length: 12 }, (_, index) => {
  const date = new Date("2025-01-01");
  date.setDate(date.getDate() + index);
  return {
    date,
    [DATA_KEY]: Math.round(420 + Math.sin(index * 0.9) * 80 + index * 18),
  };
});

/** Local preview for loading ↔ ready orchestration. */
export function AreaChartYDomainDemo() {
  const [status, setStatus] = useState<"loading" | "ready">("loading");

  return (
    <div className="w-full space-y-3">
      <div className="flex gap-2">
        <Button
          onClick={() => setStatus("loading")}
          size="sm"
          variant={status === "loading" ? "default" : "outline"}
        >
          Loading
        </Button>
        <Button
          onClick={() => setStatus("ready")}
          size="sm"
          variant={status === "ready" ? "default" : "outline"}
        >
          Ready
        </Button>
      </div>
      <div className="w-full">
        <AreaChart
          animationDuration={1100}
          data={readyData}
          loadingLabel="Loading revenue…"
          status={status}
          yDomainTween
        >
          <Grid
            horizontal
            loadingStroke="color-mix(in oklch, var(--chart-grid) 50%, transparent)"
            shimmer
            shimmerSync
            stroke="var(--chart-grid)"
          />
          <Area
            dataKey={DATA_KEY}
            fadeEdges
            fill="var(--chart-line-primary)"
            fillOpacity={0.35}
            loadingStroke="var(--foreground)"
            loadingStrokeOpacity={0.5}
            showHighlight
            strokeWidth={2}
          />
        </AreaChart>
      </div>
    </div>
  );
}
