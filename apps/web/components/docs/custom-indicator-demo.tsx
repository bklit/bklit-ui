"use client";

import {
  Bar,
  BarChart,
  BarXAxis,
  ChartTooltip,
  Grid,
  LinearGradient,
  PatternLines,
  useChart,
} from "@bklitui/ui/charts";
import { motion, useSpring } from "motion/react";
import React, { useEffect } from "react";

// Sample data for the demo with two data keys
const chartData = [
  { month: "Jan", revenue: 12_000, cost: 8000 },
  { month: "Feb", revenue: 15_500, cost: 10_200 },
  { month: "Mar", revenue: 11_000, cost: 7500 },
  { month: "Apr", revenue: 18_500, cost: 12_000 },
  { month: "May", revenue: 16_800, cost: 11_500 },
  { month: "Jun", revenue: 21_200, cost: 14_000 },
];

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
function BarHorizontalLineIndicator({
  data,
  dataKeys,
}: {
  data: { month: string; revenue: number; cost: number }[];
  dataKeys: string[];
}) {
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

  // Calculate individual bar width when there are multiple bars per group
  const barCount = dataKeys.length;
  const individualBarWidth = bandWidth / barCount;

  return createPortal(
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-50"
      height="100%"
      width="100%"
    >
      <g transform={`translate(${margin.left},${margin.top})`}>
        {data.map((d, i) => {
          const groupX = barScale(d.month) ?? 0;
          const isHovered = hoveredBarIndex === i;

          return dataKeys.map((dataKey, barIndex) => {
            const value = d[dataKey as keyof typeof d] as number;
            const barTopY = yScale(value) ?? innerHeight;
            const barX = groupX + barIndex * individualBarWidth;

            return (
              <AnimatedBarLine
                barBottomY={innerHeight}
                barTopY={barTopY}
                barX={barX}
                isHovered={isHovered}
                key={`${d.month}-${dataKey}`}
                width={individualBarWidth}
              />
            );
          });
        })}
      </g>
    </svg>,
    container
  );
}

// Exported demo component for the documentation page
export function CustomIndicatorDemo() {
  return (
    <div className="w-full">
      <BarChart barGap={0} data={chartData} xDataKey="month">
        <LinearGradient
          from="var(--chart-3)"
          id="customIndicatorGradient"
          to="transparent"
        />
        <PatternLines
          height={6}
          id="diagonalPattern"
          orientation={["diagonal"]}
          stroke="var(--chart-4)"
          strokeWidth={1.5}
          width={6}
        />
        <Grid horizontal />
        <Bar
          dataKey="revenue"
          fill="url(#customIndicatorGradient)"
          groupGap={0}
          lineCap="butt"
          stroke="var(--chart-3)"
        />
        <Bar
          dataKey="cost"
          fill="url(#diagonalPattern)"
          groupGap={0}
          lineCap="butt"
          stroke="var(--chart-4)"
        />
        <BarXAxis />
        <ChartTooltip showCrosshair={false} showDots={false} />
        <BarHorizontalLineIndicator
          data={chartData}
          dataKeys={["revenue", "cost"]}
        />
      </BarChart>
    </div>
  );
}
