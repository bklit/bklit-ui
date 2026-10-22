"use client";

import {
  Area,
  AreaChart,
  ChartTooltip,
  chartCssVars,
  Grid,
  Line,
  LineChart,
  useChart,
  XAxis,
} from "@bklitui/ui/charts";
import type { Recipe } from "@/lib/recipes/types";
import { recipeDailyData, recipeDiamondMarkers } from "../recipe-data";

interface DiamondMarker {
  date: Date;
  title: string;
}

function isSameDay(value: unknown, date: Date) {
  const other = value instanceof Date ? value : new Date(value as string);
  return other.toDateString() === date.toDateString();
}

function DiamondMarkers({
  items,
  size = 8,
  y = -12,
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
              fill={
                active ? chartCssVars.linePrimary : chartCssVars.foregroundMuted
              }
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

// Render outside the series reveal clip so the diamond above the plot isn't cut off.
DiamondMarkers.__isPostOverlay = true;

function DiamondTooltipContent({ items }: { items: DiamondMarker[] }) {
  const { tooltipData } = useChart();
  const active = tooltipData
    ? items.filter((marker) => isSameDay(tooltipData.point.date, marker.date))
    : [];
  if (active.length === 0) {
    return null;
  }
  return (
    <div className="mt-2 space-y-1 border-chart-tooltip-muted border-t pt-2">
      {active.map((marker) => (
        <div
          className="flex items-center gap-2 text-chart-tooltip-foreground text-sm"
          key={marker.title}
        >
          <span
            aria-hidden
            className="size-2 rotate-45"
            style={{ background: chartCssVars.foregroundMuted }}
          />
          {marker.title}
        </div>
      ))}
    </div>
  );
}

function DiamondLine() {
  return (
    <LineChart data={recipeDailyData}>
      <Grid horizontal />
      <Line dataKey="visitors" strokeWidth={2} />
      <DiamondMarkers items={recipeDiamondMarkers} />
      <XAxis />
      <ChartTooltip>
        <DiamondTooltipContent items={recipeDiamondMarkers} />
      </ChartTooltip>
    </LineChart>
  );
}

function DiamondArea() {
  return (
    <AreaChart data={recipeDailyData}>
      <Grid horizontal />
      <Area
        dataKey="visitors"
        fill="var(--chart-line-primary)"
        fillOpacity={0.15}
        strokeWidth={2}
      />
      <DiamondMarkers items={recipeDiamondMarkers} />
      <XAxis />
      <ChartTooltip>
        <DiamondTooltipContent items={recipeDiamondMarkers} />
      </ChartTooltip>
    </AreaChart>
  );
}

const DIAMOND_SOURCE = `interface DiamondMarker {
  date: Date;
  title: string;
}

function isSameDay(value: unknown, date: Date) {
  const other = value instanceof Date ? value : new Date(value as string);
  return other.toDateString() === date.toDateString();
}

function DiamondMarkers({
  items,
  size = 8,
  y = -12,
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
          <g key={marker.date.toISOString()} transform={\`translate(\${x}, 0)\`}>
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
              fill={active ? chartCssVars.linePrimary : chartCssVars.foregroundMuted}
              height={size}
              transform={\`translate(0, \${y}) rotate(45)\`}
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

// Render outside the series reveal clip so the diamond above the plot isn't cut off.
DiamondMarkers.__isPostOverlay = true;

function DiamondTooltipContent({ items }: { items: DiamondMarker[] }) {
  const { tooltipData } = useChart();
  const active = tooltipData
    ? items.filter((marker) => isSameDay(tooltipData.point.date, marker.date))
    : [];
  if (active.length === 0) {
    return null;
  }
  return (
    <div className="mt-2 space-y-1 border-chart-tooltip-muted border-t pt-2">
      {active.map((marker) => (
        <div
          className="flex items-center gap-2 text-chart-tooltip-foreground text-sm"
          key={marker.title}
        >
          <span
            aria-hidden
            className="size-2 rotate-45"
            style={{ background: chartCssVars.foregroundMuted }}
          />
          {marker.title}
        </div>
      ))}
    </div>
  );
}

// Dates must land on the same calendar day as a data row.
const annotations: DiamondMarker[] = [
  { date: new Date(2026, 0, 12), title: "Deploy" },
  { date: new Date(2026, 0, 21), title: "Pricing change" },
];`;

const STEPS = (root: string, series: string) => [
  "Collect the project's annotations as `{ date, title }[]` (deploys, pricing changes, campaigns). Ask me where they come from if it isn't obvious; each `date` must land on the same calendar day as a data row.",
  'Add the `DiamondMarkers` and `DiamondTooltipContent` components from the reference (next to the chart, or in `components/charts/diamond-markers.tsx`). They read `xScale`, `innerHeight`, `tooltipData` and `isLoaded` from `useChart()` (`@/components/charts/chart-context`) and colour with `chartCssVars`. Keep `DiamondMarkers.__isPostOverlay = true` so the diamonds in the top margin aren\'t clipped, and `pointerEvents: "none"` so the crosshair still works.',
  `Render \`<DiamondMarkers items={annotations} />\` inside \`<${root}>\` after the ${series}, and \`<DiamondTooltipContent items={annotations} />\` as a child of \`<ChartTooltip>\`.`,
  "Keep at least ~20px of `margin.top` (default 40px is fine).",
];

export const diamondMarkers: Recipe = {
  id: "diamond-markers",
  title: "Diamond annotations",
  category: "hover-annotations",
  description:
    "Minimal diamond glyphs above the plot with dashed guides — a tiny custom layer on useChart.",
  look: "quiet annotations: a small muted diamond sits just above the plot at each annotated date with a fine dashed guide line down to the baseline. When the crosshair reaches that day the diamond turns the primary line colour, the guide goes fully opaque and the tooltip lists the annotation title under a hairline divider.",
  charts: [
    {
      id: "line",
      label: "Line",
      rootComponent: "LineChart",
      Preview: DiamondLine,
      install: ["line-chart"],
      steps: STEPS("LineChart", "`<Line>`s"),
      code: `"use client";

import { chartCssVars, useChart } from "@/components/charts/chart-context";
import { Grid } from "@/components/charts/grid";
import { Line, LineChart } from "@/components/charts/line-chart";
import { ChartTooltip } from "@/components/charts/tooltip";
import { XAxis } from "@/components/charts/x-axis";

${DIAMOND_SOURCE}

export function VisitorsChart({
  data,
}: {
  data: { date: Date; visitors: number }[];
}) {
  return (
    <LineChart data={data}>
      <Grid horizontal />
      <Line dataKey="visitors" strokeWidth={2} />
      <DiamondMarkers items={annotations} />
      <XAxis />
      <ChartTooltip>
        <DiamondTooltipContent items={annotations} />
      </ChartTooltip>
    </LineChart>
  );
}
`,
    },
    {
      id: "area",
      label: "Area",
      rootComponent: "AreaChart",
      Preview: DiamondArea,
      install: ["area-chart"],
      steps: [
        ...STEPS("AreaChart", "`<Area>`s"),
        'Give the `<Area>` a quiet fill: `fill="var(--chart-line-primary)"`, `fillOpacity={0.15}`, `strokeWidth={2}`.',
      ],
      code: `"use client";

import { Area, AreaChart } from "@/components/charts/area-chart";
import { chartCssVars, useChart } from "@/components/charts/chart-context";
import { Grid } from "@/components/charts/grid";
import { ChartTooltip } from "@/components/charts/tooltip";
import { XAxis } from "@/components/charts/x-axis";

${DIAMOND_SOURCE}

export function VisitorsChart({
  data,
}: {
  data: { date: Date; visitors: number }[];
}) {
  return (
    <AreaChart data={data}>
      <Grid horizontal />
      <Area
        dataKey="visitors"
        fill="var(--chart-line-primary)"
        fillOpacity={0.15}
        strokeWidth={2}
      />
      <DiamondMarkers items={annotations} />
      <XAxis />
      <ChartTooltip>
        <DiamondTooltipContent items={annotations} />
      </ChartTooltip>
    </AreaChart>
  );
}
`,
    },
  ],
};
