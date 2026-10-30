"use client";

import {
  Area,
  ChartTooltip,
  ComposedChart,
  Grid,
  Line,
  SeriesBar,
  XAxis,
} from "@bklitui/ui/charts";
import { curveCatmullRom } from "d3-shape";
import { composedDemoData } from "@/lib/composed-demo-data";

const smoothCurve = curveCatmullRom.alpha(0.42);

export function ComposedChartDocsPreview() {
  return (
    <div className="w-full">
      <ComposedChart
        aspectRatio="2 / 1"
        barGap={0}
        data={composedDemoData}
        maxBarSize={32}
        xDataKey="date"
      >
        <Grid horizontal />
        <Area
          curve={smoothCurve}
          dataKey="runRate"
          fill="var(--chart-4)"
          fillOpacity={0.32}
        />
        <SeriesBar dataKey="units" fill="var(--chart-3)" radius={4} />
        <Line
          curve={smoothCurve}
          dataKey="revenue"
          stroke="var(--chart-1)"
          strokeWidth={2.5}
        />
        <ChartTooltip showCrosshair={false} />
        <XAxis numTicks={8} />
      </ComposedChart>
    </div>
  );
}
