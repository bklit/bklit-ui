"use client";

import {
  Area,
  AreaChart,
  ChartTooltip,
  Grid,
  Line,
  LineChart,
  XAxis,
} from "@bklitui/ui/charts";
import {
  weeklyVisitorsDashFromIndex,
  weeklyVisitorsData,
} from "@/lib/weekly-visitors-demo-data";

export function SeriesStrokeDocsDemo() {
  const data = weeklyVisitorsData as unknown as Record<string, unknown>[];

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="space-y-2">
        <p className="font-medium text-sm">Area — markers + dashed tail</p>
        <AreaChart aspectRatio="2 / 1" data={data} xDataKey="date">
          <Grid horizontal />
          <Area
            dashArray="6,4"
            dashFromIndex={weeklyVisitorsDashFromIndex}
            dataKey="visitors"
            fill="var(--chart-line-primary)"
            fillOpacity={0.35}
            showMarkers
            stroke="var(--chart-line-primary)"
          />
          <XAxis tickMode="data" />
          <ChartTooltip />
        </AreaChart>
      </div>
      <div className="space-y-2">
        <p className="font-medium text-sm">Line — markers + dashed tail</p>
        <LineChart aspectRatio="2 / 1" data={data} xDataKey="date">
          <Grid horizontal />
          <Line
            dashArray="6,4"
            dashFromIndex={weeklyVisitorsDashFromIndex}
            dataKey="visitors"
            showMarkers
            stroke="var(--chart-line-primary)"
            strokeWidth={2.5}
          />
          <XAxis tickMode="data" />
          <ChartTooltip />
        </LineChart>
      </div>
    </div>
  );
}
