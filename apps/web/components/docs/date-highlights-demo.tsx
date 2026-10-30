"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  BarXAxis,
  ChartBrush,
  ChartBrushLayout,
  ChartTooltip,
  ComposedChart,
  Deadline,
  Grid,
  Line,
  LineChart,
  SeriesBar,
  Weekends,
  XAxis,
} from "@bklitui/ui/charts";
import { curveCatmullRom } from "d3-shape";
import { composedDemoData } from "@/lib/composed-demo-data";

const DAY_COUNT = 22;
const START = { year: 2026, month: 9, day: 1 }; // Oct 1, 2026

function dayDate(index: number): Date {
  return new Date(START.year, START.month, START.day + index);
}

/** Linear-style project progress: scope, started, completed (cumulative issues). */
export const projectProgressData = Array.from(
  { length: DAY_COUNT },
  (_, index) => {
    const u = index / (DAY_COUNT - 1);
    return {
      date: dayDate(index),
      scope: Math.round(48 * (1 - Math.exp(-u * 6)) + 2 * u),
      started: Math.round(46 * (1 - Math.exp(-u * 2.6))),
      completed: Math.round(43 * (1 - Math.exp(-u * 2.2))),
    };
  }
);

/** Due date: Oct 15, 2026. */
export const PROJECT_DUE_DATE = dayDate(14);

const smooth = curveCatmullRom.alpha(0.5);

export function WeekendsLineDemo() {
  return (
    <div className="w-full">
      <LineChart data={projectProgressData}>
        <Grid horizontal />
        <Weekends />
        <Line curve={smooth} dataKey="scope" stroke="var(--chart-4)" />
        <Line curve={smooth} dataKey="started" stroke="var(--chart-2)" />
        <Line curve={smooth} dataKey="completed" stroke="var(--chart-1)" />
        <XAxis />
        <ChartTooltip />
      </LineChart>
    </div>
  );
}

export function DeadlineLineDemo() {
  return (
    <div className="w-full">
      <LineChart data={projectProgressData}>
        <Grid horizontal />
        <Deadline date={PROJECT_DUE_DATE} label="Due Oct 15" />
        <Line curve={smooth} dataKey="scope" stroke="var(--chart-4)" />
        <Line curve={smooth} dataKey="started" stroke="var(--chart-2)" />
        <Line curve={smooth} dataKey="completed" stroke="var(--chart-1)" />
        <XAxis />
        <ChartTooltip />
      </LineChart>
    </div>
  );
}

export function DateHighlightsLineDemo() {
  return (
    <div className="w-full">
      <LineChart data={projectProgressData}>
        <Grid horizontal />
        <Weekends />
        <Deadline date={PROJECT_DUE_DATE} label="Due Oct 15" />
        <Line curve={smooth} dataKey="scope" stroke="var(--chart-4)" />
        <Line curve={smooth} dataKey="started" stroke="var(--chart-2)" />
        <Line curve={smooth} dataKey="completed" stroke="var(--chart-1)" />
        <XAxis />
        <ChartTooltip />
      </LineChart>
    </div>
  );
}

const fillTypes = ["pattern", "gradient", "solid"] as const;

export function DeadlineFillTypesDemo() {
  return (
    <div className="grid w-full gap-4 sm:grid-cols-3">
      {fillTypes.map((fillType) => (
        <div className="flex flex-col gap-1" key={fillType}>
          <span className="font-mono text-muted-foreground text-xs">
            fillType="{fillType}"
          </span>
          <LineChart
            aspectRatio="3 / 2"
            data={projectProgressData}
            margin={{ top: 16, right: 16, bottom: 32, left: 16 }}
          >
            <Deadline date={PROJECT_DUE_DATE} fillType={fillType} />
            <Line curve={smooth} dataKey="completed" stroke="var(--chart-1)" />
            <XAxis numTicks={3} />
          </LineChart>
        </div>
      ))}
    </div>
  );
}

const brushStripMargin = { top: 4, right: 40, bottom: 4, left: 40 };

const longRangeData = Array.from({ length: 120 }, (_, index) => ({
  date: new Date(2026, 6, 1 + index),
  value: Math.round(320 + Math.sin(index / 6) * 60 + index * 2.4),
}));

const LONG_RANGE_DUE_DATE = new Date(2026, 9, 1);

export function DateHighlightsBrushDemo() {
  return (
    <div className="w-full" style={{ height: 360 }}>
      <ChartBrushLayout
        brushStrip={(brushLayout) => (
          <LineChart
            animationDuration={0}
            className="size-full"
            data={longRangeData}
            margin={brushStripMargin}
            status="ready"
            style={{ aspectRatio: "unset", height: "100%" }}
          >
            <Deadline date={LONG_RANGE_DUE_DATE} />
            <Line
              animate={false}
              dataKey="value"
              showHighlight={false}
              stroke="var(--chart-line-primary)"
              strokeWidth={2}
            />
            <ChartBrush
              initialSelection={brushLayout.brushSelection ?? undefined}
              onSelectionChange={brushLayout.onBrushSelectionChange}
            />
          </LineChart>
        )}
        data={longRangeData}
        enabled
        height={72}
      >
        {(brushLayout) => (
          <LineChart
            className="size-full"
            data={longRangeData}
            style={{ aspectRatio: "unset", height: "100%" }}
            tweenYDomainOnXDomainChange
            xDomain={brushLayout.xDomain}
            xDomainSlotCount={brushLayout.xDomainSlotCount}
            yDomainTween
          >
            <Grid horizontal />
            <Weekends />
            <Deadline date={LONG_RANGE_DUE_DATE} label="Launch" />
            <Line
              dataKey="value"
              stroke="var(--chart-line-primary)"
              strokeWidth={2}
            />
            <XAxis />
            <ChartTooltip />
          </LineChart>
        )}
      </ChartBrushLayout>
    </div>
  );
}

export function DateHighlightsAreaDemo() {
  return (
    <div className="w-full">
      <AreaChart data={projectProgressData}>
        <Grid horizontal />
        <Weekends />
        <Deadline date={PROJECT_DUE_DATE} fillType="gradient" />
        <Area
          curve={smooth}
          dataKey="completed"
          fill="var(--chart-1)"
          stroke="var(--chart-1)"
        />
        <XAxis />
        <ChartTooltip />
      </AreaChart>
    </div>
  );
}

const composedDueDate = composedDemoData[21]?.date ?? "2024-01-22";

export function DateHighlightsComposedDemo() {
  return (
    <div className="w-full">
      <ComposedChart
        aspectRatio="2 / 1"
        barGap={0}
        data={composedDemoData}
        maxBarSize={24}
        xDataKey="date"
      >
        <Grid horizontal />
        <Weekends utc />
        <Deadline date={composedDueDate} label="Quarter close" />
        <SeriesBar dataKey="units" fill="var(--chart-3)" radius={3} />
        <Line
          curve={curveCatmullRom.alpha(0.42)}
          dataKey="revenue"
          stroke="var(--chart-1)"
        />
        <ChartTooltip showCrosshair={false} />
        <XAxis numTicks={8} />
      </ComposedChart>
    </div>
  );
}

const barDailyData = Array.from({ length: 21 }, (_, index) => ({
  date: dayDate(index),
  issues: Math.round(
    (index % 7 === 3 || index % 7 === 4 ? 2 : 8) +
      Math.abs(Math.sin(index * 1.3)) * 6
  ),
}));

export function DateHighlightsBarDemo() {
  return (
    <div className="w-full">
      <BarChart data={barDailyData} xDataKey="date">
        <Grid horizontal />
        <Weekends />
        <Deadline date={PROJECT_DUE_DATE} label="Due" />
        <Bar dataKey="issues" fill="var(--chart-line-primary)" lineCap={2} />
        <BarXAxis maxLabels={7} />
        <ChartTooltip />
      </BarChart>
    </div>
  );
}
