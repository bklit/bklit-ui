"use client";

import { Icon } from "@bklitui/icons";
import { ChartTooltip, Grid, Line, LineChart, XAxis } from "@bklitui/ui/charts";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  RadioGroupPrimitive,
  RadioPrimitive,
} from "@/components/ui/radio-group";
import {
  SegmentedControl,
  SegmentedControlItem,
} from "@/components/ui/segmented-control";
import {
  Tooltip,
  TooltipPopup,
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

const DATE_RANGES: { value: DateRange; label: string }[] = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
];

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
        <SegmentedControl
          aria-label="Date range"
          render={
            <RadioGroupPrimitive
              onValueChange={(value) => setRange(value as DateRange)}
              value={range}
            />
          }
        >
          {DATE_RANGES.map((option) => (
            <SegmentedControlItem
              key={option.value}
              render={<RadioPrimitive.Root value={option.value} />}
            >
              {option.label}
            </SegmentedControlItem>
          ))}
        </SegmentedControl>
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
            <TooltipPopup>Replay animation</TooltipPopup>
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
