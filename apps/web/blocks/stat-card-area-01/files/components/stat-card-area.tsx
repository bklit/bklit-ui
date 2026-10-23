"use client";

import { AreaSparkline, ChartStatFlow } from "@bklitui/ui/charts";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { revenueSeries, revenueStats } from "../data/revenue-series";
import {
  StatCardChart,
  statCardLabelClassName,
  statCardValueClassName,
} from "./stat-card-chart";
import {
  formatStatCardMonth,
  useStatCardSparklineHover,
} from "./stat-card-sparkline-hover";
import { TrendBadge } from "./trend-badge";

const revenueValues = revenueSeries.map((point) => point.value);
const revenueMin = Math.min(...revenueValues);
const revenueMax = Math.max(...revenueValues);
// 5% headroom above and below so peaks and dips don't touch the card edges.
const revenueDomain: [number, number] = [
  revenueMin - (revenueMax - revenueMin) * 0.05,
  revenueMax + (revenueMax - revenueMin) * 0.05,
];

export function StatCardArea() {
  const { hover, sparklineProps } = useStatCardSparklineHover(
    revenueSeries,
    formatStatCardMonth
  );
  const displayValue = hover.value ?? revenueStats.average;
  const displayLabel = hover.label ?? "Avg";
  const displayTrend = hover.trend ?? revenueStats.trend;

  return (
    <Card className="w-full gap-0 py-0">
      <CardHeader className="px-4 py-3">
        <CardTitle>Total Revenue</CardTitle>
        <CardAction>
          <TrendBadge value={displayTrend} />
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-col gap-3 px-4 pt-2 pb-3">
        <ChartStatFlow
          formatOptions={{
            currency: "USD",
            maximumFractionDigits: 0,
            style: "currency",
          }}
          label={displayLabel}
          labelClassName={statCardLabelClassName}
          value={displayValue}
          valueClassName={statCardValueClassName}
        />

        <StatCardChart size="md">
          <AreaSparkline
            color="var(--chart-1)"
            crosshair="gradient"
            data={revenueSeries}
            dataKey="value"
            fillOpacity={0.45}
            height={190}
            padding={0}
            strokeWidth={2}
            yDomain={revenueDomain}
            {...sparklineProps}
          />
        </StatCardChart>
      </CardContent>
    </Card>
  );
}
