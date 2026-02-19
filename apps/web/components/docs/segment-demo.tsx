"use client";

import {
  ChartTooltip,
  Grid,
  Line,
  LineChart,
  SegmentBackground,
  SegmentLineFrom,
  SegmentLineTo,
  useChart,
  XAxis,
} from "@bklitui/ui/charts";
import { useEffect, useState } from "react";

const chartData = [
  { date: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000), users: 1200 },
  { date: new Date(Date.now() - 27 * 24 * 60 * 60 * 1000), users: 1100 },
  { date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000), users: 1380 },
  { date: new Date(Date.now() - 23 * 24 * 60 * 60 * 1000), users: 1600 },
  { date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000), users: 1550 },
  { date: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000), users: 1680 },
  { date: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000), users: 1620 },
  { date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), users: 1720 },
  { date: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000), users: 1780 },
  { date: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000), users: 1920 },
  { date: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000), users: 1750 },
  { date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), users: 2050 },
  { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), users: 2100 },
  { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), users: 2050 },
  { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), users: 2320 },
  { date: new Date(), users: 2400 },
];

interface SegmentStats {
  value: number;
  change: number;
  changePct: number;
  startDate: Date;
  endDate: Date;
}

function SegmentBridge({
  onSegmentChange,
}: {
  onSegmentChange: (stats: SegmentStats | null) => void;
}) {
  const { selection, data, xAccessor } = useChart();

  useEffect(() => {
    if (!selection?.active) {
      onSegmentChange(null);
      return;
    }

    const startIdx = Math.max(0, selection.startIndex);
    const endIdx = Math.min(data.length - 1, selection.endIndex);
    if (startIdx >= endIdx) {
      onSegmentChange(null);
      return;
    }

    const startPoint = data[startIdx];
    const endPoint = data[endIdx];
    if (!(startPoint && endPoint)) {
      onSegmentChange(null);
      return;
    }

    const startVal = startPoint.users;
    const endVal = endPoint.users;
    if (typeof startVal !== "number" || typeof endVal !== "number") {
      onSegmentChange(null);
      return;
    }

    onSegmentChange({
      value: endVal,
      change: endVal - startVal,
      changePct: startVal !== 0 ? ((endVal - startVal) / startVal) * 100 : 0,
      startDate: xAccessor(startPoint),
      endDate: xAccessor(endPoint),
    });
  }, [selection, data, xAccessor, onSegmentChange]);

  return null;
}

export function SegmentDemo() {
  const [stats, setStats] = useState<SegmentStats | null>(null);

  const firstVal = chartData[0]?.users ?? 0;
  const lastVal = chartData.at(-1)?.users ?? 0;

  const displayValue = stats?.value ?? lastVal;
  const displayChange = stats?.change ?? lastVal - firstVal;
  const displayPct =
    stats?.changePct ??
    (firstVal > 0 ? ((lastVal - firstVal) / firstVal) * 100 : 0);
  const isPositive = displayChange >= 0;

  const startLabel = (
    stats?.startDate ?? chartData[0]?.date
  )?.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const endLabel = (
    stats?.endDate ?? chartData.at(-1)?.date
  )?.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  return (
    <div className="w-full">
      <div className="mb-4 space-y-1">
        <div className="flex items-baseline gap-2">
          <span className="font-semibold text-2xl tabular-nums">
            {displayValue.toLocaleString()}
          </span>
          <span className="text-muted-foreground text-sm">users</span>
        </div>
        <div className="flex items-baseline gap-2 text-sm">
          <span className={isPositive ? "text-emerald-500" : "text-red-500"}>
            {isPositive ? "+" : ""}
            {displayChange.toLocaleString()} ({isPositive ? "+" : ""}
            {displayPct.toFixed(1)}%)
          </span>
          <span className="text-muted-foreground">
            {startLabel} &ndash; {endLabel}
          </span>
        </div>
      </div>

      <LineChart data={chartData}>
        <Grid horizontal />
        <Line dataKey="users" stroke="var(--chart-line-primary)" />
        <SegmentBackground />
        <SegmentLineFrom />
        <SegmentLineTo />
        <XAxis />
        <ChartTooltip />
        <SegmentBridge onSegmentChange={setStats} />
      </LineChart>
    </div>
  );
}
