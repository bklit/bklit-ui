"use client";

import { ChartTooltip, Grid, Line, LineChart, XAxis } from "@bklitui/ui/charts";
import { RotateCcw } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
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
  const [replayKey, setReplayKey] = useState(0);

  const filteredData = useMemo(() => {
    const daysMap = { "7d": 7, "30d": 30, "90d": 90 };
    const days = daysMap[range];
    return fullData.slice(-days);
  }, [range]);

  const handleReplay = () => {
    setReplayKey((prev) => prev + 1);
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-wrap items-center gap-2">
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
        <div className="mx-1 h-5 w-px bg-border" />
        <motion.button
          className="flex items-center gap-1.5 rounded-md bg-muted px-3 py-1.5 font-medium text-muted-foreground text-sm transition-colors hover:bg-muted/80"
          onClick={handleReplay}
          type="button"
          whileTap={{ scale: 0.95, rotate: -180 }}
        >
          <RotateCcw className="size-3.5" />
          Replay
        </motion.button>
      </div>
      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4, position: "absolute", inset: 0 }}
            initial={{ opacity: 0, y: 4 }}
            key={range}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <LineChart
              animationDuration={600}
              data={filteredData}
              revealSignature={`replay-${replayKey}`}
              yDomainTween
              yDomainTweenDuration={400}
            >
              <Grid horizontal />
              <Line dataKey="revenue" stroke="var(--chart-line-primary)" />
              <XAxis />
              <ChartTooltip />
            </LineChart>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
