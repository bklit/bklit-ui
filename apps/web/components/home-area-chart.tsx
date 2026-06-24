"use client";

import { Area, AreaChart, Background, ChartTooltip } from "@bklitui/ui/charts";
import { curveNatural } from "@visx/curve";
import {
  homeAreaChartMargin,
  useHomeChartCompact,
} from "@/lib/home-chart-margin";
import { homeTooltipPanelStyle } from "@/lib/home-tooltip-style";
import { cn } from "@/lib/utils";

const lineData = Array.from({ length: 30 }, (_, i) => ({
  date: new Date(2024, 0, i + 1),
  revenue: Math.floor(8000 + Math.sin(i / 5) * 4000 + ((i * 11) % 2000)),
  costs: Math.floor(5000 + Math.cos(i / 4) * 2000 + ((i * 7) % 1500)),
}));

export function HomeAreaChart({
  aspectRatio = "4 / 2",
  className,
}: {
  aspectRatio?: string;
  className?: string;
}) {
  const compact = useHomeChartCompact();

  return (
    <AreaChart
      aspectRatio={aspectRatio}
      className={cn("min-h-[220px] w-full", className)}
      data={lineData}
      margin={homeAreaChartMargin(compact)}
    >
      <Background
        fadeHorizontalLength={30}
        fadeVerticalLength={30}
        pattern="dots"
        radius={0.5}
      />
      <Area
        curve={curveNatural}
        dataKey="revenue"
        fadeEdges
        fill="var(--chart-line-primary)"
        fillOpacity={0.1}
        strokeWidth={2}
      />
      <Area
        curve={curveNatural}
        dataKey="costs"
        fadeEdges
        fill="var(--chart-line-secondary)"
        fillOpacity={0.1}
        strokeWidth={1.5}
      />
      <ChartTooltip panelStyle={homeTooltipPanelStyle} />
    </AreaChart>
  );
}
