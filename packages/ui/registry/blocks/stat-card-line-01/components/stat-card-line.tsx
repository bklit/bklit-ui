"use client";

import { ChartStatFlow, LineSparkline } from "@/components/charts";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { sessionsSeries, sessionsStats } from "../data/sessions-series";
import {
  StatCardChart,
  statCardLabelClassName,
  statCardValueClassName,
} from "./stat-card-chart";
import {
  formatStatCardWeekday,
  useStatCardSparklineHover,
} from "./stat-card-sparkline-hover";
import { TrendBadge } from "./trend-badge";

const sessionValues = sessionsSeries.map((point) => point.value);
const sessionMin = Math.min(...sessionValues);
const sessionMax = Math.max(...sessionValues);
// 5% headroom above and below so the stroke doesn't clip at the card edges.
const sessionDomain: [number, number] = [
  sessionMin - (sessionMax - sessionMin) * 0.05,
  sessionMax + (sessionMax - sessionMin) * 0.05,
];

export function StatCardLine() {
  const { hover, sparklineProps } = useStatCardSparklineHover(
    sessionsSeries,
    formatStatCardWeekday
  );
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
        <StatCardChart size="md">
          <div className="pointer-events-none absolute right-4 bottom-4 z-10 flex flex-col items-end text-right">
            <ChartStatFlow
              label={displayLabel}
              labelClassName={statCardLabelClassName}
              value={displayValue}
              valueClassName={statCardValueClassName}
            />
          </div>

          <LineSparkline
            color="var(--chart-3)"
            crosshair="gradient"
            curve="monotone"
            data={sessionsSeries}
            dataKey="value"
            height={190}
            padding={0}
            strokeWidth={2.5}
            yDomain={sessionDomain}
            {...sparklineProps}
          />
        </StatCardChart>
      </CardContent>
    </Card>
  );
}
