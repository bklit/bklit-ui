"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  BarXAxis,
  BarYAxis,
  ChartTooltip,
  ComposedChart,
  Grid,
  Line,
  LineChart,
  SeriesBar,
  TrendLine,
  type TrendLineStrokeStyle,
  XAxis,
} from "@bklitui/ui/charts";
import { type ReactNode, useState } from "react";
import { buildLineChartDemoData } from "@/components/docs/line-chart-demo-data";
import {
  RadioGroupPrimitive,
  RadioPrimitive,
} from "@/components/ui/radio-group";
import { composedDemoData } from "@/lib/composed-demo-data";
import {
  segmentedControlItemVariants,
  segmentedControlRootClassName,
} from "@/lib/segmented-control";

const lineData = buildLineChartDemoData();

const areaData = [
  { date: new Date("2024-01-01"), desktop: 186 },
  { date: new Date("2024-02-01"), desktop: 305 },
  { date: new Date("2024-03-01"), desktop: 237 },
  { date: new Date("2024-04-01"), desktop: 273 },
  { date: new Date("2024-05-01"), desktop: 209 },
  { date: new Date("2024-06-01"), desktop: 314 },
  { date: new Date("2024-07-01"), desktop: 352 },
  { date: new Date("2024-08-01"), desktop: 298 },
];

const barData = [
  { month: "Jan", revenue: 3200 },
  { month: "Feb", revenue: 4100 },
  { month: "Mar", revenue: 3600 },
  { month: "Apr", revenue: 4800 },
  { month: "May", revenue: 4300 },
  { month: "Jun", revenue: 5400 },
];

const horizontalBarData = [
  { browser: "Chrome", users: 820 },
  { browser: "Safari", users: 640 },
  { browser: "Firefox", users: 520 },
  { browser: "Edge", users: 410 },
  { browser: "Opera", users: 220 },
];

const composedData = composedDemoData as unknown as Record<string, unknown>[];

const STROKE_STYLES: { value: TrendLineStrokeStyle; label: string }[] = [
  { value: "dashed", label: "Dashed" },
  { value: "solid", label: "Solid" },
  { value: "gradient", label: "Gradient" },
];

const strokeStyleItemClassName = segmentedControlItemVariants({
  state: "checked",
});

function LineTrendChart({ children }: { children: ReactNode }) {
  return (
    <div className="w-full">
      <LineChart data={lineData}>
        <Grid horizontal />
        <Line dataKey="value" strokeWidth={2} />
        {children}
        <XAxis />
        <ChartTooltip />
      </LineChart>
    </div>
  );
}

/** Primary preview: switch between dashed, solid, and gradient strokes. */
export function TrendLineDemo() {
  const [strokeStyle, setStrokeStyle] =
    useState<TrendLineStrokeStyle>("dashed");

  return (
    <div className="w-full space-y-4">
      <RadioGroupPrimitive
        aria-label="Trend line stroke style"
        className={segmentedControlRootClassName}
        onValueChange={(value) => setStrokeStyle(value as TrendLineStrokeStyle)}
        value={strokeStyle}
      >
        {STROKE_STYLES.map((option) => (
          <RadioPrimitive.Root
            className={strokeStyleItemClassName}
            key={option.value}
            value={option.value}
          >
            {option.label}
          </RadioPrimitive.Root>
        ))}
      </RadioGroupPrimitive>
      <LineTrendChart>
        <TrendLine
          dataKey="value"
          fadeEdges={strokeStyle === "gradient"}
          gradientEnd="var(--chart-1)"
          gradientStart="var(--chart-3)"
          stroke="var(--chart-1)"
          strokeStyle={strokeStyle}
        />
      </LineTrendChart>
    </div>
  );
}

export function TrendLineDashedDemo() {
  return (
    <LineTrendChart>
      <TrendLine dataKey="value" stroke="var(--chart-1)" />
    </LineTrendChart>
  );
}

export function TrendLineSolidDemo() {
  return (
    <LineTrendChart>
      <TrendLine
        dataKey="value"
        opacity={0.8}
        stroke="var(--chart-1)"
        strokeStyle="solid"
      />
    </LineTrendChart>
  );
}

export function TrendLineGradientDemo() {
  return (
    <LineTrendChart>
      <TrendLine
        dataKey="value"
        gradientEnd="var(--chart-1)"
        gradientStart="var(--chart-3)"
        strokeStyle="gradient"
        strokeWidth={2.5}
      />
    </LineTrendChart>
  );
}

export function TrendLineFadeEdgesDemo() {
  return (
    <LineTrendChart>
      <TrendLine
        dataKey="value"
        fadeEdges
        fadeEdgesLength={25}
        stroke="var(--chart-1)"
        strokeStyle="solid"
      />
    </LineTrendChart>
  );
}

export function TrendLineAreaDemo() {
  return (
    <div className="w-full">
      <AreaChart data={areaData}>
        <Grid horizontal />
        <Area dataKey="desktop" fillOpacity={0.3} strokeWidth={2} />
        <TrendLine dataKey="desktop" fadeEdges stroke="var(--chart-1)" />
        <XAxis />
        <ChartTooltip />
      </AreaChart>
    </div>
  );
}

export function TrendLineBarDemo() {
  return (
    <div className="w-full">
      <BarChart data={barData} xDataKey="month">
        <Grid horizontal />
        <Bar dataKey="revenue" lineCap="round" />
        <TrendLine
          dataKey="revenue"
          gradientEnd="var(--chart-1)"
          gradientStart="var(--chart-3)"
          strokeStyle="gradient"
        />
        <BarXAxis />
        <ChartTooltip showCrosshair={false} />
      </BarChart>
    </div>
  );
}

export function TrendLineHorizontalBarDemo() {
  return (
    <div className="w-full">
      <BarChart
        aspectRatio="4 / 3"
        data={horizontalBarData}
        margin={{ left: 80 }}
        orientation="horizontal"
        xDataKey="browser"
      >
        <Grid fadeVertical horizontal={false} vertical />
        <Bar dataKey="users" lineCap={4} />
        <TrendLine dataKey="users" stroke="var(--chart-1)" />
        <BarYAxis />
        <ChartTooltip showCrosshair={false} />
      </BarChart>
    </div>
  );
}

export function TrendLineComposedDemo() {
  return (
    <div className="w-full">
      <ComposedChart
        barGap={0}
        data={composedData}
        maxBarSize={32}
        xDataKey="date"
      >
        <Grid horizontal />
        <SeriesBar dataKey="units" fill="var(--chart-3)" radius={4} />
        <Line dataKey="revenue" stroke="var(--chart-1)" />
        <TrendLine dataKey="revenue" fadeEdges stroke="var(--chart-1)" />
        <TrendLine
          dataKey="units"
          stroke="var(--chart-3)"
          strokeDasharray="2,4"
        />
        <ChartTooltip showCrosshair={false} />
        <XAxis numTicks={8} />
      </ComposedChart>
    </div>
  );
}
