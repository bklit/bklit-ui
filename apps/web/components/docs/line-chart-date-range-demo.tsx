"use client";

import { Icon } from "@bklitui/icons";
import {
  ChartTooltip,
  Grid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "@bklitui/ui/charts";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  RadioGroupPrimitive,
  RadioPrimitive,
} from "@/components/ui/radio-group";
import {
  SegmentedControl,
  SegmentedControlItem,
} from "@/components/ui/segmented-control";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipPopup,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Dataset = "revenue" | "high" | "low";

// Revenue (~15k) is the default; High (~1,000) and Low (~10) let you flip between
// very different y-domains to stress the y-domain tween and y-axis labels.
const DATASET_SCALE: Record<Dataset, { base: number; amplitude: number }> = {
  revenue: { base: 15_000, amplitude: 3000 },
  high: { base: 1000, amplitude: 200 },
  low: { base: 10, amplitude: 2 },
};

const DATASETS: { value: Dataset; label: string }[] = [
  { value: "revenue", label: "Revenue" },
  { value: "high", label: "~1,000" },
  { value: "low", label: "~10" },
];

const fullData = Array.from({ length: 90 }, (_, index) => {
  const date = new Date();
  date.setDate(date.getDate() - (89 - index));
  const wave = Math.sin(index * 0.15);
  const noise = Math.random();
  const trend = index / 90;
  const point: Record<string, Date | number> = { date };
  for (const [key, { base, amplitude }] of Object.entries(DATASET_SCALE)) {
    point[key] = Math.round(
      base +
        wave * amplitude +
        noise * amplitude * 0.66 +
        trend * amplitude * 1.5
    );
  }
  return point;
});

type DateRange = "7d" | "30d" | "90d";

const DATE_RANGES: { value: DateRange; label: string }[] = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
];

export function LineChartDateRangeDemo() {
  const [range, setRange] = useState<DateRange>("30d");
  const [dataset, setDataset] = useState<Dataset>("revenue");
  const [showYAxis, setShowYAxis] = useState(false);
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
        <SegmentedControl
          aria-label="Dataset"
          render={
            <RadioGroupPrimitive
              onValueChange={(value) => setDataset(value as Dataset)}
              value={dataset}
            />
          }
        >
          {DATASETS.map((option) => (
            <SegmentedControlItem
              key={option.value}
              render={<RadioPrimitive.Root value={option.value} />}
            >
              {option.label}
            </SegmentedControlItem>
          ))}
        </SegmentedControl>
        <div className="mx-1 h-5 w-px bg-border" />
        <div className="flex items-center gap-2">
          <Switch
            checked={showYAxis}
            id="line-chart-date-range-y-axis"
            onCheckedChange={setShowYAxis}
          />
          <Label htmlFor="line-chart-date-range-y-axis">Y axis</Label>
        </div>
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
          <Line dataKey={dataset} stroke="var(--chart-line-primary)" />
          <XAxis />
          {showYAxis ? <YAxis orientation="left" /> : null}
          <ChartTooltip />
        </LineChart>
      </div>
    </div>
  );
}
