"use client";

import { Grid, Line, LineChart } from "@bklitui/ui/charts";
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

/** Local preview for loading ↔ ready orchestration (stack 4). */
export function LineChartYDomainDemo() {
  const [status, setStatus] = useState<"loading" | "ready">("loading");
  const [loadingStyle, setLoadingStyle] = useState<"pulse" | "sweep">("pulse");

  return (
    <div className="w-full space-y-3">
      <div className="flex flex-wrap gap-2">
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
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => setLoadingStyle("pulse")}
          size="sm"
          variant={loadingStyle === "pulse" ? "default" : "outline"}
        >
          Pulse
        </Button>
        <Button
          onClick={() => setLoadingStyle("sweep")}
          size="sm"
          variant={loadingStyle === "sweep" ? "default" : "outline"}
        >
          Sweep
        </Button>
      </div>
      <div className="w-full">
        <LineChart
          animationDuration={1100}
          data={readyData}
          loadingLabel="Loading revenue…"
          status={status}
          yDomainTween
        >
          <Grid
            horizontal
            loadingStroke="color-mix(in oklch, var(--chart-grid) 50%, transparent)"
            shimmer={loadingStyle === "pulse"}
            shimmerSync
            stroke="var(--chart-grid)"
          />
          <Line
            dataKey={DATA_KEY}
            fadeEdges
            loadingStroke="var(--foreground)"
            loadingStrokeOpacity={0.5}
            loadingStyle={loadingStyle}
            showHighlight
            stroke="var(--chart-line-primary)"
          />
        </LineChart>
      </div>
    </div>
  );
}
