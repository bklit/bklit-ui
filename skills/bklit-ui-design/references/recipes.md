# Recipes

Copy-pasteable compositions for named looks. Each is derived from a gallery
example on `https://bklit.com/charts/<slug>` (title in brackets) with colours
moved onto theme tokens and imports rewritten for an installed project
(`@/components/charts/...`). Swap the `@/` alias for the user's own if
`components.json` says otherwise.

All charts are client components — keep `"use client"` at the top of the file
that renders them. Time-series charts (`LineChart`, `AreaChart`) expect a
`date: Date` field by default (`xDataKey="date"`); `BarChart` defaults to
`xDataKey="name"`.

Contents:

1. Faded diagonal background (area)
2. Dot-grid line
3. Squircle ring bars
4. Segmented gradient bars with a hatched track
5. 3D glass bars
6. 3D stacked glass bars
7. Hatched area
8. Soft gradient area with edge fade
9. Dashed tail with point markers
10. Projection / forecast
11. Loading skeleton → data
12. Hatched target band
13. Patterned donut with total
14. Half ring with linked legend
15. Honeycomb background (custom composition — fills a gap)

---

## 1. Faded diagonal background [Area Chart - Pattern Background]

"A diagonal pattern background that fades out on all sides." The four-side fade
is `Background`'s default — no extra props needed.

```bash
npx shadcn@latest add @bklit/area-chart @bklit/background
```

```tsx
"use client";

import { Area, AreaChart } from "@/components/charts/area-chart";
import { Background } from "@/components/charts/background";
import { ChartTooltip } from "@/components/charts/tooltip";
import { XAxis } from "@/components/charts/x-axis";

export function RevenueChart({ data }: { data: { date: Date; revenue: number }[] }) {
  return (
    <AreaChart data={data}>
      <Background />
      <Area dataKey="revenue" fillOpacity={0.3} />
      <XAxis />
      <ChartTooltip />
    </AreaChart>
  );
}
```

Variants: `<Background pattern="cross" />`, `<Background fadeVertical={false} />`
(sides only), `<Background fadeHorizontalLength={25} fadeVerticalLength={25} />`
(softer vignette).

## 2. Dot-grid line [Line Chart - Dot Grid Background]

```bash
npx shadcn@latest add @bklit/line-chart @bklit/background
```

```tsx
"use client";

import { Background } from "@/components/charts/background";
import { Line, LineChart } from "@/components/charts/line-chart";
import { ChartTooltip } from "@/components/charts/tooltip";
import { XAxis } from "@/components/charts/x-axis";

export function SessionsChart({ data }: { data: { date: Date; sessions: number }[] }) {
  return (
    <LineChart data={data}>
      <Background opacity={0.85} pattern="dots" />
      <Line dataKey="sessions" />
      <XAxis />
      <ChartTooltip />
    </LineChart>
  );
}
```

## 3. Squircle ring bars [Bar Chart - Shape Squircle Ring]

Rounded-square column segments over a hatched ghost track, with a squircle ring
hover indicator snapped to each column top. The headline series is a plain solid
`--chart-1` fill (no gradient); the comparison series is hatched.

```bash
npx shadcn@latest add @bklit/bar-chart @bklit/chart-tooltip
```

```tsx
"use client";

import { BarChart } from "@/components/charts/bar-chart";
import { BarSquares, BarColumnTrack } from "@/components/charts/bar-squares";
import { BarXAxis } from "@/components/charts/bar-x-axis";
import { PatternLines } from "@/components/charts/patterns";
import { ChartTooltip } from "@/components/charts/tooltip";

export function SquircleBars({
  data,
}: {
  data: { month: string; desktop: number; mobile: number }[];
}) {
  return (
    <BarChart
      data={data}
      margin={{ top: 8, right: 8, bottom: 40, left: 8 }}
      squareSnap={{ squareGap: 3, groupGap: 4 }}
      xDataKey="month"
    >
      <PatternLines
        height={6}
        id="squircle-track"
        orientation={["diagonal"]}
        stroke="var(--chart-grid)"
        strokeWidth={1}
        width={6}
      />
      <BarColumnTrack
        fill="url(#squircle-track)"
        groupGap={4}
        opacity={0.65}
        squareGap={3}
        squareRadius={0.5}
      />
      <PatternLines
        height={6}
        id="squircle-desktop"
        orientation={["diagonal"]}
        stroke="var(--chart-5)"
        strokeWidth={1}
        width={6}
      />
      <BarSquares
        dataKey="desktop"
        fill="url(#squircle-desktop)"
        groupGap={4}
        squareGap={3}
        squareRadius={0.5}
        stroke="var(--chart-5)"
      />
      <BarSquares
        dataKey="mobile"
        fill="var(--chart-1)"
        groupGap={4}
        squareGap={3}
        squareRadius={0.5}
      />
      <BarXAxis />
      <ChartTooltip
        dotColor="color-mix(in oklch, var(--chart-tooltip-foreground) 70%, transparent)"
        dotRadiusFraction={0.5}
        dotStrokeWidth={1}
        dotVariant="ring"
        showCrosshair={false}
      />
    </BarChart>
  );
}
```

Keep `squareGap` / `groupGap` identical on `squareSnap`, every `BarSquares` and
`BarColumnTrack`, and keep `dotRadiusFraction` equal to `squareRadius` — that is
what makes the ring hug the squares. The gallery hardcodes
`dotColor="oklch(1 0.002 186.385 / 0.7)"` (a translucent near-white ring drawn
over the top square); the `color-mix` on `--chart-tooltip-foreground` is the
token-based equivalent. Single series: drop one `BarSquares` and the
`groupGap` props stop mattering (they only apply with 2+ series). Pattern ids
are document-global — prefix them with `useId()` if this chart can render more
than once on a page.

## 4. Segmented gradient bars with a hatched track [Bar Chart - Shape & Gradient]

Same as recipe 3 with `squareRadius={0.25}` everywhere (the default) and
`<ChartTooltip dotVariant="ring" dotScale={1.05} showCrosshair={false} />` (no
`dotRadiusFraction`), but the headline series is a gradient instead of a solid
fill:

```tsx
const gradientStops = [
  { offset: 0, color: "var(--chart-1)" },
  { offset: 25, color: "var(--chart-2)" },
  { offset: 50, color: "var(--chart-3)" },
  { offset: 75, color: "var(--chart-4)" },
  { offset: 100, color: "var(--chart-5)" },
];

<BarSquares
  dataKey="mobile"
  fill="var(--chart-1)"
  gradientStops={gradientStops}
  groupGap={4}
  squareGap={3}
  squareRadius={0.25}
  stroke="var(--chart-5)"
  useGradient
/>
```

`stroke` is needed here because the fill is a gradient — the tooltip dot reads
it. Use for "pixel", "LED", "segmented" or "blocky" requests; use 0 for hard
squares.

## 5. 3D glass bars [Bar Chart - 3D Depth]

```bash
npx shadcn@latest add @bklit/bar-chart @bklit/bar-depth @bklit/grid @bklit/chart-tooltip
```

```tsx
"use client";

import { Bar } from "@/components/charts/bar";
import { BarChart } from "@/components/charts/bar-chart";
import { BarDepthBack, BarDepthFront } from "@/components/charts/bar-depth";
import { BarXAxis } from "@/components/charts/bar-x-axis";
import { Grid } from "@/components/charts/grid";
import { ChartTooltip } from "@/components/charts/tooltip";

export function GlassBars({ data }: { data: { month: string; desktop: number }[] }) {
  return (
    <BarChart
      data={data}
      margin={{ top: 8, right: 8, bottom: 40, left: 8 }}
      xDataKey="month"
    >
      <Grid horizontal />
      <BarDepthBack color="var(--chart-1)" dataKey="desktop" />
      <Bar dataKey="desktop" fill="var(--chart-1)" perspective />
      <BarDepthFront dataKey="desktop" />
      <BarXAxis />
      <ChartTooltip showCrosshair={false} showDots={false} />
    </BarChart>
  );
}
```

Order matters: `BarDepthBack` before `Bar`, `BarDepthFront` after. `perspective`
on `Bar` aligns the front face with the lid. Depth collapses below 0.5px, so very
dense charts (many bars) lose the side faces and keep only the glass sheen. The
gallery adds a site-only `BarLineIndicator`; it is not a registry export.
Add `<BarPulse dataKey="desktop" activeIndex={data.length - 1} />` after
`BarDepthFront` to pulse the live bar.

## 6. 3D stacked glass bars [Bar Chart - 3D Stacked]

```tsx
"use client";

import { Bar } from "@/components/charts/bar";
import { BarChart } from "@/components/charts/bar-chart";
import {
  BarDepthBack,
  BarDepthFront,
  BarDepthProvider,
} from "@/components/charts/bar-depth";
import { BarXAxis } from "@/components/charts/bar-x-axis";
import { Grid } from "@/components/charts/grid";
import { ChartTooltip } from "@/components/charts/tooltip";

export function StackedGlassBars({
  data,
}: {
  data: { month: string; desktop: number; mobile: number }[];
}) {
  return (
    <BarDepthProvider
      segmentsAccessor={(d) => [
        { value: d.desktop as number, color: "var(--chart-1)" },
        { value: d.mobile as number, color: "var(--chart-3)" },
      ]}
    >
      <BarChart
        data={data}
        margin={{ top: 8, right: 8, bottom: 40, left: 8 }}
        stacked
        xDataKey="month"
      >
        <Grid horizontal />
        <BarDepthBack dataKey="desktop" />
        <Bar dataKey="desktop" fill="var(--chart-1)" perspective />
        <Bar dataKey="mobile" fill="var(--chart-3)" perspective />
        <BarDepthFront dataKey="desktop" />
        <BarXAxis />
        <ChartTooltip showCrosshair={false} showDots={false} />
      </BarChart>
    </BarDepthProvider>
  );
}
```

The provider goes **around** `BarChart` (BarChart does not look inside
providers for its `Bar` children). `groundShadow={0}` on the provider removes the
contact shadow.

## 7. Hatched area [Area Chart - Pattern]

```bash
npx shadcn@latest add @bklit/area-chart @bklit/patterns
```

```tsx
"use client";

import { Area, AreaChart } from "@/components/charts/area-chart";
import { Grid } from "@/components/charts/grid";
import { PatternArea } from "@/components/charts/pattern-area";
import { PatternLines } from "@/components/charts/patterns";
import { ChartTooltip } from "@/components/charts/tooltip";
import { XAxis } from "@/components/charts/x-axis";

export function HatchedArea({ data }: { data: { date: Date; desktop: number }[] }) {
  return (
    <AreaChart data={data}>
      <PatternLines
        height={6}
        id="area-hatch"
        orientation={["diagonal"]}
        stroke="var(--chart-1)"
        strokeWidth={1}
        width={6}
      />
      <Grid horizontal />
      <PatternArea dataKey="desktop" fill="url(#area-hatch)" />
      <Area dataKey="desktop" fillOpacity={0} strokeWidth={2} />
      <XAxis />
      <ChartTooltip />
    </AreaChart>
  );
}
```

`Area` with `fillOpacity={0}` draws the stroke and drives the reveal + hover;
`PatternArea` draws the hatch. Use a unique `id` per chart instance on the page
(e.g. from `useId()`), or two charts will share one pattern.

## 8. Soft gradient area with edge fade [Area Chart - Gradient / Fade Edges]

```tsx
"use client";

import { Area, AreaChart } from "@/components/charts/area-chart";
import { Grid } from "@/components/charts/grid";
import { ChartTooltip } from "@/components/charts/tooltip";
import { XAxis } from "@/components/charts/x-axis";

export function SoftArea({ data }: { data: { date: Date; desktop: number }[] }) {
  return (
    <AreaChart data={data}>
      <Grid horizontal />
      <Area
        dataKey="desktop"
        fadeEdges
        fillOpacity={0.5}
        gradientToOpacity={0.05}
        strokeWidth={2}
      />
      <XAxis />
      <ChartTooltip />
    </AreaChart>
  );
}
```

## 9. Dashed tail with point markers [Line Chart - Dashed Tail / Series Markers]

"Today is incomplete — dash the last segment."

```tsx
"use client";

import { Grid } from "@/components/charts/grid";
import { Line, LineChart } from "@/components/charts/line-chart";
import { ChartTooltip } from "@/components/charts/tooltip";
import { XAxis } from "@/components/charts/x-axis";

export function WeeklyVisitors({ data }: { data: { date: Date; visitors: number }[] }) {
  return (
    <LineChart data={data}>
      <Grid horizontal />
      <Line
        dashArray="6,4"
        dashFromIndex={data.length - 2}
        dataKey="visitors"
        fadeEdges={false}
        showMarkers
        stroke="var(--chart-line-primary)"
        strokeWidth={2.5}
      />
      <XAxis tickMode="data" />
      <ChartTooltip />
    </LineChart>
  );
}
```

`dashFromIndex` is inclusive. Turn `fadeEdges` off whenever markers sit on the
first/last point, otherwise the end markers float over a faded stroke.

## 10. Projection / forecast [Line Chart - Projection]

```bash
npx shadcn@latest add @bklit/line-chart
```

```tsx
"use client";

import { useMemo } from "react";
import { Grid } from "@/components/charts/grid";
import { Line, LineChart } from "@/components/charts/line-chart";
import { LineSeriesTerminalMarker } from "@/components/charts/line-series-terminal-marker";
import { ProjectionLine } from "@/components/charts/projection-line";
import { buildProjectionPath } from "@/components/charts/projection-utils";
import { ChartTooltip } from "@/components/charts/tooltip";
import { XAxis } from "@/components/charts/x-axis";

export function ForecastChart({ data }: { data: { date: Date; value: number }[] }) {
  const projection = useMemo(
    () =>
      buildProjectionPath({
        sourceData: data,
        seriesKey: "value",
        mode: "auto",
        autoMethod: "lastSegment",
        pathDensity: "endpoints",
        horizonPoints: 6,
      }),
    [data]
  );

  return (
    <LineChart data={data}>
      <Grid horizontal />
      <Line dataKey="value" strokeWidth={2} />
      <LineSeriesTerminalMarker dataKey="value" />
      <ProjectionLine
        curveKind="bezier"
        data={projection}
        showEndMarker
        strokeDasharray="1,4"
        strokeStyle="gradient"
      />
      <XAxis />
      <ChartTooltip />
    </LineChart>
  );
}
```

`mode: "target"` + `endValue` draws toward a goal. Projections and brush zoom are
not supported together.

## 11. Loading skeleton → data [Line Chart - Loading (Sweep)]

Prefer one chart that toggles `status` over swapping components — the chart
animates from skeleton to data.

```tsx
"use client";

import { Grid } from "@/components/charts/grid";
import { Line, LineChart } from "@/components/charts/line-chart";
import { ChartTooltip } from "@/components/charts/tooltip";
import { XAxis } from "@/components/charts/x-axis";

export function TrafficChart({
  data,
  isLoading,
}: {
  data: { date: Date; visitors: number }[];
  isLoading: boolean;
}) {
  return (
    <LineChart
      data={data}
      loadingLabel="Loading traffic"
      status={isLoading ? "loading" : "ready"}
    >
      <Grid horizontal shimmer shimmerSync />
      <Line dataKey="visitors" loadingStyle="sweep" />
      <XAxis />
      <ChartTooltip />
    </LineChart>
  );
}
```

Shortcuts when there is no data shape yet: `<LineChartLoading loadingStyle="sweep" />`,
`<AreaChartLoading />`, `<BarChartLoading />` (shimmer-swept placeholder bars),
`<HeatmapChartLoading data={columns} gap={3} label="Loading contributions" />`.
`AreaChartLoading`/`LineChartLoading` disable the grid shimmer when
`loadingStyle="sweep"` so only one shimmer runs.

## 12. Hatched target band [Pattern Reference Band]

```bash
npx shadcn@latest add @bklit/reference-area
```

```tsx
<AreaChart data={data}>
  <ReferenceArea
    axisLabelColor="var(--chart-1)"
    fillOpacity={0.85}
    pattern="diagonal"
    patternColor="var(--chart-foreground-muted)"
    y1={160}
    y2={220}
  />
  <Area dataKey="value" fillOpacity={0.3} />
  <YAxis />
  <XAxis />
  <ChartTooltip />
</AreaChart>
```

Imports: `ReferenceArea` from `@/components/charts/reference-area`, `YAxis` from
`@/components/charts/y-axis` (`axisLabelColor` tints Y tick labels inside the
band). Plain dashed band: `<ReferenceArea y1={160} y2={220} strokeStyle="dashed" showMarkers />`.

## 13. Patterned donut with total [Donut Chart - Patterns]

```bash
npx shadcn@latest add @bklit/pie-chart @bklit/patterns
```

```tsx
"use client";

import { useId } from "react";
import {
  PatternLines,
  type PatternOrientationType,
} from "@/components/charts/patterns";
import { PieCenter } from "@/components/charts/pie-center";
import { PieChart } from "@/components/charts/pie-chart";
import { PieSlice } from "@/components/charts/pie-slice";

const ORIENTATIONS: PatternOrientationType[] = [
  "diagonal",
  "horizontal",
  "vertical",
  "diagonalRightToLeft",
];

export function PatternDonut({ data }: { data: { label: string; value: number }[] }) {
  const uid = useId().replace(/:/g, "");
  const slices = data.map((d, i) => ({ ...d, color: `var(--chart-${(i % 5) + 1})` }));
  return (
    <PieChart data={slices} innerRadius={55}>
      {slices.map((item, i) => (
        <PatternLines
          height={6}
          id={`${uid}-p${i}`}
          key={`p-${item.label}`}
          orientation={[ORIENTATIONS[i % ORIENTATIONS.length] ?? "diagonal"]}
          stroke={item.color}
          strokeWidth={1}
          width={6}
        />
      ))}
      {slices.map((item, i) => (
        <PieSlice fill={`url(#${uid}-p${i})`} index={i} key={item.label} />
      ))}
      <PieCenter defaultLabel="Total" />
    </PieChart>
  );
}
```

`color` on each datum keeps the hover glow and the `PieCenter` hover colour in
step with the pattern stroke.

## 14. Half ring with linked legend [Ring Chart - Half Circle / Legend]

```bash
npx shadcn@latest add @bklit/ring-chart @bklit/legend
```

```tsx
"use client";

import { useState } from "react";
import {
  Legend,
  LegendItem,
  LegendLabel,
  LegendMarker,
  LegendProgress,
  LegendValue,
} from "@/components/charts/legend";
import { Ring } from "@/components/charts/ring";
import { RingCenter } from "@/components/charts/ring-center";
import { RingChart } from "@/components/charts/ring-chart";

type Goal = { label: string; value: number; maxValue: number; color: string };

export function GoalsRing({ data }: { data: Goal[] }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  return (
    <div className="flex w-full flex-col items-center gap-3">
      <RingChart
        data={data}
        endAngle={0}
        hoveredIndex={hoveredIndex}
        onHoverChange={setHoveredIndex}
        startAngle={-Math.PI}
      >
        {data.map((item, index) => (
          <Ring index={index} key={item.label} />
        ))}
        <RingCenter defaultLabel="Sessions" />
      </RingChart>
      <Legend
        className="w-full"
        hoveredIndex={hoveredIndex}
        items={data}
        onHoverChange={setHoveredIndex}
      >
        <LegendItem className="grid grid-cols-[auto_1fr_auto] items-center gap-x-2 gap-y-0.5">
          <LegendMarker />
          <LegendLabel className="text-xs" />
          <LegendValue className="text-xs" showPercentage />
          <div className="col-span-full">
            <LegendProgress />
          </div>
        </LegendItem>
      </Legend>
    </div>
  );
}
```

Use `color: "var(--chart-N)"` in the data — the legend marker paints
`item.color` inline.

## 15. Honeycomb background (custom composition)

`Background` has no hexagon preset, and the ported `PatternHexagons` only tiles
cleanly at `height={1}` / `size={3}` (its tile is `size × √size` while the
hexagon side is `height`). For "honeycomb background that fades", either offer
the nearest preset (`<Background pattern="cross" />` or `pattern="dots"`) or add
this small component next to the installed charts. It reuses the same
two-gradient mask technique as `background.tsx`.

```tsx
"use client";

import { useId } from "react";
import { useChartStable } from "@/components/charts/chart-context";
import { Pattern } from "@/components/charts/patterns";

const SQRT3 = Math.sqrt(3);

interface HoneycombBackgroundProps {
  /** Hexagon side length in px. */
  side?: number;
  color?: string;
  strokeWidth?: number;
  /** Fade zone per edge, % of plot size (0–45). */
  fade?: number;
}

export function HoneycombBackground({
  side = 6,
  color = "var(--chart-grid)",
  strokeWidth = 1,
  fade = 10,
}: HoneycombBackgroundProps) {
  const { innerWidth, innerHeight } = useChartStable();
  const id = useId().replace(/:/g, "");
  if (innerWidth <= 0 || innerHeight <= 0) {
    return null;
  }
  const h = side * SQRT3;
  const edge = Math.min(45, Math.max(0, fade));
  const stops = [
    { offset: "0%", opacity: 0 },
    { offset: `${edge}%`, opacity: 1 },
    { offset: `${100 - edge}%`, opacity: 1 },
    { offset: "100%", opacity: 0 },
  ];
  const hexPath = `M ${side},0 l ${side},0 l ${side / 2},${h / 2} l ${-side / 2},${h / 2} l ${-side},0 l ${-side / 2},${-h / 2} Z M 0,${h / 2} l ${side / 2},0 M ${3 * side},${h / 2} l ${-side / 2},0`;

  return (
    <g aria-hidden="true">
      <Pattern height={h} id={`${id}-hex`} width={3 * side}>
        <path d={hexPath} fill="none" stroke={color} strokeWidth={strokeWidth} />
      </Pattern>
      <defs>
        <linearGradient id={`${id}-gh`} x1="0%" x2="100%" y1="0%" y2="0%">
          {stops.map((s) => (
            <stop key={s.offset} offset={s.offset} stopColor="white" stopOpacity={s.opacity} />
          ))}
        </linearGradient>
        <linearGradient id={`${id}-gv`} x1="0%" x2="0%" y1="0%" y2="100%">
          {stops.map((s) => (
            <stop key={s.offset} offset={s.offset} stopColor="white" stopOpacity={s.opacity} />
          ))}
        </linearGradient>
        <mask id={`${id}-mh`}>
          <rect fill={`url(#${id}-gh)`} height={innerHeight} width={innerWidth} />
        </mask>
        <mask id={`${id}-m`}>
          <g mask={`url(#${id}-mh)`}>
            <rect fill={`url(#${id}-gv)`} height={innerHeight} width={innerWidth} />
          </g>
        </mask>
      </defs>
      <rect
        fill={`url(#${id}-hex)`}
        height={innerHeight}
        mask={`url(#${id}-m)`}
        width={innerWidth}
      />
    </g>
  );
}
```

Use it as the first child: `<AreaChart data={data}><HoneycombBackground /><Area … /></AreaChart>`.
Differences from `Background` to mention: it is revealed with the series clip
(only components named `Background`/`Grid`/axes are excluded from the reveal)
and has no fade-in of its own. Requires `@bklit/patterns` for `Pattern`.
