"use client";

import {
  Area,
  AreaChart,
  Background,
  ChartTooltip,
  chartCssVars,
  useChart,
} from "@bklitui/ui/charts";
import { curveNatural } from "d3-shape";
import {
  HomeAreaSelectionDemo,
  SegmentChangeBadge,
  TrendSegmentBackground,
  TrendSegmentLines,
} from "@/components/home-area-selection-demo";
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

interface DiamondMarker {
  date: Date;
  title: string;
}

/** Annotations on dates inside `lineData` (revenue climbs, then recovers). */
const diamondMarkers: DiamondMarker[] = [
  { date: new Date(2024, 0, 6), title: "Launch" },
  { date: new Date(2024, 0, 25), title: "Pricing change" },
];

/** Diamond center above the plot; the plot needs at least this much top margin. */
const DIAMOND_Y = -12;
const DIAMOND_MARGIN_TOP = 20;

function isSameDay(value: unknown, date: Date) {
  const other = value instanceof Date ? value : new Date(value as string);
  return other.toDateString() === date.toDateString();
}

/** Simple dashed ◆ marker layer (see docs/markers-demo.tsx). */
function DiamondMarkers({
  items,
  size = 8,
  y = DIAMOND_Y,
}: {
  items: DiamondMarker[];
  size?: number;
  y?: number;
}) {
  const { xScale, innerHeight, tooltipData, isLoaded } = useChart();
  const half = size / 2;

  return (
    <g
      style={{
        pointerEvents: "none",
        opacity: isLoaded ? 1 : 0,
        transition: "opacity 300ms ease-out",
      }}
    >
      {items.map((marker) => {
        const x = xScale(marker.date) ?? 0;
        const active = tooltipData
          ? isSameDay(tooltipData.point.date, marker.date)
          : false;
        return (
          <g key={marker.date.toISOString()} transform={`translate(${x}, 0)`}>
            <line
              stroke={chartCssVars.markerBorder}
              strokeDasharray="4,4"
              strokeOpacity={active ? 1 : 0.7}
              x1={0}
              x2={0}
              y1={y + half + 4}
              y2={innerHeight}
            />
            <rect
              fill={chartCssVars.foregroundMuted}
              height={size}
              transform={`translate(0, ${y}) rotate(45)`}
              width={size}
              x={-half}
              y={-half}
            />
          </g>
        );
      })}
    </g>
  );
}

// Render after the interaction overlay, outside the series reveal clip, so the
// diamond in the top margin is not cut off.
(DiamondMarkers as unknown as Record<string, boolean>).__isPostOverlay = true;

function DiamondTooltipContent({ items }: { items: DiamondMarker[] }) {
  const { tooltipData } = useChart();
  const active = tooltipData
    ? items.filter((m) => isSameDay(tooltipData.point.date, m.date))
    : [];
  if (active.length === 0) {
    return null;
  }
  return (
    <div className="mt-2 space-y-1 border-chart-tooltip-muted border-t pt-2">
      {active.map((m) => (
        <div
          className="flex items-center gap-2 text-chart-tooltip-foreground text-sm"
          key={m.title}
        >
          <span
            aria-hidden
            className="size-2 rotate-45"
            style={{ background: chartCssVars.foregroundMuted }}
          />
          {m.title}
        </div>
      ))}
    </div>
  );
}

export function HomeAreaChart({
  aspectRatio = "4 / 2",
  className,
  demo = false,
}: {
  aspectRatio?: string;
  className?: string;
  /** Play the scripted hover + drag-to-select cursor demo. */
  demo?: boolean;
}) {
  const compact = useHomeChartCompact();
  const margin = homeAreaChartMargin(compact);

  return (
    <AreaChart
      aspectRatio={aspectRatio}
      className={cn("min-h-[220px] w-full", className)}
      data={lineData}
      margin={{
        ...margin,
        top: Math.max(margin.top, DIAMOND_MARGIN_TOP),
      }}
    >
      <Background
        fadeHorizontalLength={30}
        fadeVerticalLength={30}
        pattern="dots"
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
      <TrendSegmentBackground valueKey="revenue" />
      <TrendSegmentLines valueKey="revenue" />
      <DiamondMarkers items={diamondMarkers} />
      <SegmentChangeBadge valueKey="revenue" />
      {demo ? <HomeAreaSelectionDemo /> : null}
      <ChartTooltip panelStyle={homeTooltipPanelStyle}>
        <DiamondTooltipContent items={diamondMarkers} />
      </ChartTooltip>
    </AreaChart>
  );
}

/** The homepage showcase's first card (sized like the other showcase charts). */
export function HomeShowcaseAreaChart() {
  const compact = useHomeChartCompact();

  return (
    <HomeAreaChart
      aspectRatio="5 / 2"
      className={compact ? "min-h-[120px]" : "min-h-[180px]"}
      demo
    />
  );
}
