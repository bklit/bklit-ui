"use client";

import { ChartStatFlow, Line, LineChart } from "@/components/charts";
import { curveBasis } from "@visx/curve";
import { useState } from "react";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { sessionsSeries, sessionsStats } from "../data/sessions-series";
import { StatCardChart } from "./stat-card-chart";
import {
  formatStatCardWeekday,
  StatCardHoverBridge,
  type StatCardHoverState,
} from "./stat-card-hover-bridge";
import {
  statCardLabelClassName,
  statCardValueClassName,
} from "./stat-card-stat-styles";
import { TrendBadge } from "./trend-badge";

export function StatCardLine() {
  const [hover, setHover] = useState<StatCardHoverState>({
    value: null,
    label: null,
    trend: null,
  });
  const average = Math.round(sessionsStats.average);
  const displayValue = hover.value === null ? average : Math.round(hover.value);
  const displayLabel = hover.label ?? "Avg";
  const displayTrend = hover.trend ?? sessionsStats.trend;

  return (
    <Card className="w-full gap-0 py-0">
      <CardHeader className="px-4 py-3">
        <CardTitle>Active Sessions</CardTitle>
        <CardAction>
          <TrendBadge value={displayTrend} />
        </CardAction>
      </CardHeader>

      <CardContent className="px-4 pt-2 pb-3">
        <StatCardChart height={190}>
          <div className="pointer-events-none absolute right-4 bottom-4 z-10 flex flex-col items-end text-right">
            <ChartStatFlow
              label={displayLabel}
              labelClassName={statCardLabelClassName}
              value={displayValue}
              valueClassName={statCardValueClassName}
            />
          </div>

          <LineChart
            aspectRatio="2.5 / 1"
            className="w-full"
            data={sessionsSeries}
            margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
          >
            <StatCardHoverBridge
              dataKey="value"
              formatLabel={formatStatCardWeekday}
              onHoverChange={setHover}
            />
            <Line
              curve={curveBasis}
              dataKey="value"
              showHighlight
              stroke="var(--chart-3)"
              strokeWidth={2.5}
            />
          </LineChart>
        </StatCardChart>
      </CardContent>
    </Card>
  );
}
