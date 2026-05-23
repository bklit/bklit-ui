"use client";

import { curveCardinal } from "@visx/curve";
import { useState } from "react";
import {
  Area,
  AreaChart,
  ChartStatFlow,
  LinearGradient,
} from "@/components/charts";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { revenueSeries, revenueStats } from "../data/revenue-series";
import { StatCardChart } from "./stat-card-chart";
import {
  formatStatCardMonth,
  StatCardHoverBridge,
  type StatCardHoverState,
} from "./stat-card-hover-bridge";
import {
  statCardLabelClassName,
  statCardValueClassName,
} from "./stat-card-stat-styles";
import { TrendBadge } from "./trend-badge";

export function StatCardArea() {
  const [hover, setHover] = useState<StatCardHoverState>({
    value: null,
    label: null,
    trend: null,
  });
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

        <StatCardChart height={190}>
          <AreaChart
            aspectRatio="2.5 / 1"
            className="w-full"
            data={revenueSeries}
            margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
          >
            <StatCardHoverBridge
              dataKey="value"
              formatLabel={formatStatCardMonth}
              onHoverChange={setHover}
            />
            <LinearGradient
              from="var(--chart-1)"
              fromOpacity={0.45}
              id="stat-card-area-fill"
              to="var(--chart-1)"
              toOpacity={0}
            />
            <Area
              curve={curveCardinal.tension(0.65)}
              dataKey="value"
              fill="url(#stat-card-area-fill)"
              fillOpacity={1}
              gradientToOpacity={0}
              showHighlight
              stroke="var(--chart-1)"
              strokeWidth={2}
            />
          </AreaChart>
        </StatCardChart>
      </CardContent>
    </Card>
  );
}
