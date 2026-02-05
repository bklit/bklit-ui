"use client";

import {
  Bar,
  BarChart,
  BarXAxis,
  BarYAxis,
  ChartTooltip,
  Grid,
  Legend,
  LegendItemComponent,
  LegendLabel,
  LegendMarker,
  LinearGradient,
  PatternLines,
  useChart,
} from "@bklitui/ui/charts";
import { motion, useSpring } from "motion/react";
import React, { useEffect } from "react";

const chartData = [
  { month: "Jan", revenue: 12_000, profit: 4500 },
  { month: "Feb", revenue: 15_500, profit: 5200 },
  { month: "Mar", revenue: 11_000, profit: 3800 },
  { month: "Apr", revenue: 18_500, profit: 7100 },
  { month: "May", revenue: 16_800, profit: 5400 },
  { month: "Jun", revenue: 21_200, profit: 8800 },
];

const stackedData = [
  { month: "Jan", desktop: 4000, mobile: 2400 },
  { month: "Feb", desktop: 5000, mobile: 3000 },
  { month: "Mar", desktop: 3500, mobile: 2800 },
  { month: "Apr", desktop: 4200, mobile: 3200 },
  { month: "May", desktop: 3800, mobile: 2600 },
  { month: "Jun", desktop: 5500, mobile: 3800 },
];

const browserData = [
  { browser: "Chrome", users: 275 },
  { browser: "Safari", users: 200 },
  { browser: "Firefox", users: 187 },
  { browser: "Edge", users: 173 },
  { browser: "Other", users: 90 },
];

// Generate consistent daily data (using seed-like approach)
const dailyData = Array.from({ length: 90 }, (_, i) => {
  const date = new Date(2026, 0, 1);
  date.setDate(date.getDate() + i);
  // Use a deterministic pattern instead of Math.random()
  const baseValue = 50 + Math.sin(i / 7) * 30;
  const variation = ((i * 7) % 37) - 18; // Pseudo-random variation
  return {
    day: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    value: Math.floor(baseValue + variation),
  };
});

export function BarChartStackedDemo() {
  return (
    <div className="w-full">
      <BarChart data={stackedData} stacked stackGap={3} xDataKey="month">
        <Grid horizontal />
        <Bar
          dataKey="desktop"
          fill="hsl(217, 91%, 60%)"
          lineCap={4}
          stackGap={3}
        />
        <Bar
          dataKey="mobile"
          fill="hsl(217, 91%, 75%)"
          lineCap={4}
          stackGap={3}
        />
        <BarXAxis />
        <ChartTooltip />
      </BarChart>
    </div>
  );
}

export function BarChartHorizontalDemo() {
  return (
    <div className="w-full">
      <BarChart
        aspectRatio="4 / 3"
        data={browserData}
        margin={{ left: 80 }}
        orientation="horizontal"
        xDataKey="browser"
      >
        <Grid fadeVertical horizontal={false} vertical />
        <Bar dataKey="users" fill="hsl(217, 91%, 60%)" lineCap={4} />
        <BarYAxis />
        <ChartTooltip showCrosshair={false} />
      </BarChart>
    </div>
  );
}

export function BarChart90DaysDemo() {
  return (
    <div className="w-full">
      <BarChart barGap={0.1} data={dailyData} xDataKey="day">
        <Grid horizontal />
        <Bar dataKey="value" lineCap="butt" />
        <BarXAxis maxLabels={8} />
        <ChartTooltip />
      </BarChart>
    </div>
  );
}

export function BarChartGradientDemo() {
  return (
    <div className="w-full">
      <BarChart data={chartData} xDataKey="month">
        <LinearGradient
          from="hsl(217, 91%, 60%)"
          id="barGradient"
          to="hsl(280, 87%, 65%)"
        />
        <Grid horizontal />
        <Bar
          dataKey="revenue"
          fill="url(#barGradient)"
          lineCap={4}
          stroke="hsl(217, 91%, 60%)"
        />
        <BarXAxis />
        <ChartTooltip />
      </BarChart>
    </div>
  );
}

export function BarChartPatternDemo() {
  return (
    <div className="w-full">
      <BarChart data={chartData} xDataKey="month">
        <PatternLines
          height={8}
          id="barPattern"
          orientation={["diagonal"]}
          stroke="hsl(217, 91%, 60%)"
          strokeWidth={2}
          width={8}
        />
        <Grid horizontal />
        <Bar
          dataKey="revenue"
          fill="url(#barPattern)"
          lineCap={4}
          stroke="hsl(217, 91%, 60%)"
        />
        <BarXAxis />
        <ChartTooltip />
      </BarChart>
    </div>
  );
}

const stackedLegendItems = [
  { label: "Desktop", value: 0, color: "hsl(217, 91%, 60%)" },
  { label: "Mobile", value: 0, color: "hsl(217, 91%, 75%)" },
];

export function BarChartStackedWithLegendDemo() {
  return (
    <div className="w-full">
      <BarChart data={stackedData} stacked stackGap={3} xDataKey="month">
        <Grid horizontal />
        <Bar
          dataKey="desktop"
          fill="hsl(217, 91%, 60%)"
          lineCap={4}
          stackGap={3}
        />
        <Bar
          dataKey="mobile"
          fill="hsl(217, 91%, 75%)"
          lineCap={4}
          stackGap={3}
        />
        <BarXAxis />
        <ChartTooltip />
      </BarChart>
      <Legend
        className="flex-row justify-center gap-6"
        items={stackedLegendItems}
      >
        <LegendItemComponent className="flex items-center gap-2">
          <LegendMarker />
          <LegendLabel />
        </LegendItemComponent>
      </Legend>
    </div>
  );
}

export function BarChartNarrowGapsDemo() {
  return (
    <div className="w-full">
      <BarChart barGap={0.1} data={chartData} xDataKey="month">
        <Grid horizontal />
        <Bar
          dataKey="revenue"
          fill="var(--chart-line-primary)"
          lineCap="round"
        />
        <BarXAxis />
        <ChartTooltip />
      </BarChart>
    </div>
  );
}

export function BarChartCustomTooltipDemo() {
  return (
    <div className="w-full">
      <BarChart data={chartData} xDataKey="month">
        <Grid horizontal />
        <Bar
          dataKey="revenue"
          fill="var(--chart-line-primary)"
          lineCap="round"
        />
        <BarXAxis />
        <ChartTooltip
          rows={(point) => [
            {
              color: "var(--chart-line-primary)",
              label: "Revenue",
              value: `$${(point.revenue as number)?.toLocaleString()}`,
            },
          ]}
        />
      </BarChart>
    </div>
  );
}

// Individual animated line for a single bar
function AnimatedBarLine({
  barX,
  barTopY,
  barBottomY,
  width,
  isHovered,
}: {
  barX: number;
  barTopY: number;
  barBottomY: number;
  width: number;
  isHovered: boolean;
}) {
  const animatedY = useSpring(barBottomY, { stiffness: 300, damping: 30 });
  const animatedOpacity = useSpring(0, { stiffness: 300, damping: 30 });

  useEffect(() => {
    animatedY.set(isHovered ? barTopY : barBottomY);
    animatedOpacity.set(isHovered ? 1 : 0);
  }, [isHovered, barTopY, barBottomY, animatedY, animatedOpacity]);

  return (
    <motion.rect
      fill="var(--chart-indicator-color)"
      height={2}
      style={{
        opacity: animatedOpacity,
        y: animatedY,
      }}
      width={width}
      x={barX}
    />
  );
}

// Custom horizontal line indicator - each bar has its own line that rises on hover
function BarHorizontalLineIndicator({ data }: { data: typeof chartData }) {
  const {
    barScale,
    bandWidth,
    innerHeight,
    margin,
    containerRef,
    hoveredBarIndex,
    yScale,
  } = useChart();
  const [mounted, setMounted] = React.useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const container = containerRef.current;
  if (!(mounted && container && bandWidth && barScale)) {
    return null;
  }

  const { createPortal } = require("react-dom") as typeof import("react-dom");

  return createPortal(
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-50"
      height="100%"
      width="100%"
    >
      <g transform={`translate(${margin.left},${margin.top})`}>
        {data.map((d, i) => {
          const barX = barScale(d.month) ?? 0;
          const barTopY = yScale(d.revenue) ?? innerHeight;
          const isHovered = hoveredBarIndex === i;

          return (
            <AnimatedBarLine
              barBottomY={innerHeight}
              barTopY={barTopY}
              barX={barX}
              isHovered={isHovered}
              key={d.month}
              width={bandWidth}
            />
          );
        })}
      </g>
    </svg>,
    container
  );
}

export function BarChartNoGapGradientDemo() {
  return (
    <div className="w-full">
      <BarChart barGap={0} data={chartData} xDataKey="month">
        <LinearGradient
          from="var(--chart-3)"
          id="noGapGradient"
          to="transparent"
        />
        <Grid horizontal />
        <Bar
          dataKey="revenue"
          fill="url(#noGapGradient)"
          lineCap="butt"
          stroke="var(--chart-3)"
        />
        <BarXAxis />
        <ChartTooltip showCrosshair={false} showDots={false} />
        <BarHorizontalLineIndicator data={chartData} />
      </BarChart>
    </div>
  );
}
