"use client";

import { Icon } from "@bklitui/icons";
import { ChartTooltip, Grid, Line, LineChart, XAxis } from "@bklitui/ui/charts";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger render={<span className="inline-flex" />}>
              <Button
                aria-label="Replay animation"
                className="size-8 [&_svg]:size-4"
                onClick={() => setReplayKey((key) => key + 1)}
                size="icon"
                type="button"
                variant="outline"
              >
                <Icon className="size-4" name="IconArrowRotateClockwise" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Replay animation</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="relative" key={replayKey}>
        <LineChart data={filteredData} yDomainTween>
          <Grid horizontal />
          <Line dataKey="revenue" stroke="var(--chart-line-primary)" />
          <XAxis />
          <ChartTooltip />
        </LineChart>
      </div>
    </div>
  );
}
