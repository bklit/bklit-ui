"use client";

import {
  ChartLoadingLabel,
  Grid,
  generateChartSkeletonData,
  Line,
  LineChart,
  LineLoadingPulse,
} from "@bklitui/ui/charts";
import { useMemo, useState } from "react";
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

/** Local preview for loading ↔ ready y-domain tween (stack 2). */
export function LineChartYDomainDemo() {
  const [status, setStatus] = useState<"loading" | "ready">("loading");
  const [pulseEpoch, setPulseEpoch] = useState(0);

  const loadingData = useMemo(
    () => generateChartSkeletonData({ dataKey: DATA_KEY }),
    []
  );
  const chartData = status === "loading" ? loadingData : readyData;

  return (
    <div className="space-y-3">
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
      <div className="relative h-[280px] w-full">
        <LineChart
          animationDuration={status === "ready" ? 1100 : 0}
          data={chartData}
          loadingLabel={status === "loading" ? "Loading revenue…" : undefined}
          status={status}
          yDomainTween
        >
          <Grid
            horizontal
            shimmer
            shimmerSync
            stroke="color-mix(in oklch, var(--chart-grid) 50%, transparent)"
          />
          <Line
            dataKey={DATA_KEY}
            fadeEdges={status === "ready"}
            showHighlight={status === "ready"}
            stroke={
              status === "ready" ? "var(--chart-line-primary)" : "transparent"
            }
          />
          {status === "loading" ? (
            <LineLoadingPulse
              dataKey={DATA_KEY}
              key={pulseEpoch}
              onCycleComplete={() => {
                window.setTimeout(() => {
                  setPulseEpoch((epoch) => epoch + 1);
                }, 280);
              }}
              stroke="var(--foreground)"
              strokeOpacity={0.5}
            />
          ) : null}
        </LineChart>
        {status === "loading" ? (
          <ChartLoadingLabel text="Loading revenue…" />
        ) : null}
      </div>
    </div>
  );
}
