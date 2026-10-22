"use client";

import {
  Area,
  AreaChart,
  type ChartMarker,
  ChartMarkers,
  ChartTooltip,
  chartCssVars,
  Grid,
  Line,
  LineChart,
  useChart,
  XAxis,
} from "@bklitui/ui/charts";
import { MarkerContentDemo } from "@/components/docs/marker-content-demo";

const DAY_MS = 24 * 60 * 60 * 1000;
const START = new Date(2024, 0, 1).getTime();

function dayAt(index: number) {
  return new Date(START + index * DAY_MS);
}

const chartData = Array.from({ length: 14 }, (_, i) => ({
  date: dayAt(i),
  value: Math.floor(
    1200 + i * 55 + Math.sin(i / 1.6) * 260 + Math.cos(i / 0.9) * 90
  ),
}));

/** Rich markers — two share a date, so hovering fans them out radially. */
export const richMarkers: ChartMarker[] = [
  {
    date: dayAt(3),
    icon: "🚀",
    title: "v2.0 Launch",
    description: "Major release with new features",
    href: "https://github.com/bklit/bklit-ui/releases",
    target: "_blank",
  },
  {
    date: dayAt(8),
    icon: "📣",
    title: "Marketing Push",
    description: "New ad campaign went live",
  },
  {
    date: dayAt(8),
    icon: "🐛",
    title: "Bug Fix",
    description: "Fixed tooltip positioning",
  },
  {
    date: dayAt(8),
    icon: "⚡",
    title: "Performance",
    description: "50% faster renders",
  },
  {
    date: dayAt(11),
    icon: "📦",
    title: "Dependency Update",
    description: "Updated motion to v12",
    color: "var(--chart-1)",
  },
];

export function MarkersDemo() {
  return (
    <div className="w-full">
      <LineChart data={chartData}>
        <Grid horizontal />
        <Line dataKey="value" strokeWidth={2} />
        <ChartMarkers items={richMarkers} />
        <XAxis />
        <ChartTooltip>
          <MarkerContentDemo markers={richMarkers} />
        </ChartTooltip>
      </LineChart>
    </div>
  );
}

export function MarkersCompactDemo() {
  return (
    <div className="w-full">
      <LineChart data={chartData} margin={{ top: 24 }}>
        <Grid horizontal />
        <Line dataKey="value" strokeWidth={2} />
        <ChartMarkers
          animate={false}
          items={richMarkers}
          showLines={false}
          size={20}
        />
        <XAxis />
        <ChartTooltip>
          <MarkerContentDemo markers={richMarkers} />
        </ChartTooltip>
      </LineChart>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Simple diamond markers — a custom layer built on useChart
// ---------------------------------------------------------------------------

export interface DiamondMarker {
  date: Date;
  title: string;
}

export const diamondMarkers: DiamondMarker[] = [
  { date: dayAt(4), title: "Deploy" },
  { date: dayAt(9), title: "Pricing change" },
];

function isSameDay(a: unknown, b: Date) {
  const date = a instanceof Date ? a : new Date(a as string | number);
  return date.toDateString() === b.toDateString();
}

export function DiamondMarkers({
  items,
  size = 8,
  y = -12,
}: {
  items: DiamondMarker[];
  /** Diamond width/height in px. */
  size?: number;
  /** Diamond center relative to the top of the plot (negative = above). */
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

// Render after the chart's interaction overlay, outside the series reveal
// clip, so the diamond in the top margin is not cut off (same flag as
// LineSeriesTerminalMarker / ProjectionLineEndMarker).
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

export function DiamondMarkersDemo() {
  return (
    <div className="w-full">
      <AreaChart data={chartData}>
        <Grid horizontal />
        <Area
          dataKey="value"
          fill="var(--chart-line-primary)"
          fillOpacity={0.15}
          strokeWidth={2}
        />
        <DiamondMarkers items={diamondMarkers} />
        <XAxis />
        <ChartTooltip>
          <DiamondTooltipContent items={diamondMarkers} />
        </ChartTooltip>
      </AreaChart>
    </div>
  );
}
