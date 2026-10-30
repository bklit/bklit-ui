# Worked examples

Ten before → after pairs. Every "after" imports from the files `npx shadcn@latest add @bklit/<slug>` installs (default alias `@/components`). The shadcn `ChartContainer` walkthrough is in `shadcn-chart.md`.

1. [Line, multi-series, dual formatting](#1-line-multi-series)
2. [Stacked bar (shadcn)](#2-stacked-bar-shadcn)
3. [Horizontal bar (`layout="vertical"`)](#3-horizontal-bar)
4. [Donut with centre label](#4-donut-with-centre-label)
5. [Radar (data pivot + normalisation)](#5-radar)
6. [Area with gradient](#6-area-with-gradient)
7. [Tiny line → `LineSparkline`](#7-tiny-line--linesparkline)
8. [Tiny area with tooltip → `AreaSparkline` + `useSparklineHover`](#8-tiny-area-with-tooltip--areasparkline--usesparklinehover)
9. [Tiny bar → `BarSparkline`](#9-tiny-bar--barsparkline)
10. [TanStack Charts KPI sparkline → `AreaSparkline`](#10-tanstack-charts-kpi-sparkline--areasparkline)

---

## 1. Line, multi-series

Before:

```tsx
import {
  CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";

const data = [
  { date: "2025-01-06", users: 1200, sessions: 1840 },
  { date: "2025-01-07", users: 1350, sessions: 2010 },
  // …
];

export function TrafficChart() {
  return (
    <ResponsiveContainer height={300} width="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="date" />
        <YAxis tickFormatter={(v: number) => `${(v / 1000).toFixed(1)}k`} />
        <Tooltip />
        <Legend />
        <Line dataKey="users" name="Users" stroke="#2563eb" strokeWidth={2} type="monotone" dot={false} />
        <Line dataKey="sessions" name="Sessions" stroke="#16a34a" strokeWidth={2} type="monotone" dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
```

Install: `npx shadcn@latest add @bklit/line-chart @bklit/y-axis @bklit/legend`

After:

```tsx
"use client";

import { curveMonotoneX } from "d3-shape";
import { Grid } from "@/components/charts/grid";
import {
  Legend,
  LegendItem,
  LegendLabel,
  LegendMarker,
} from "@/components/charts/legend";
import { Line, LineChart } from "@/components/charts/line-chart";
import { ChartTooltip } from "@/components/charts/tooltip";
import { XAxis } from "@/components/charts/x-axis";
import { YAxis } from "@/components/charts/y-axis";

const raw = [
  { date: "2025-01-06", users: 1200, sessions: 1840 },
  { date: "2025-01-07", users: 1350, sessions: 2010 },
  // …
];
// Local-day Dates (a bare ISO date string would parse as UTC midnight).
const data = raw.map((d) => ({ ...d, date: new Date(`${d.date}T00:00:00`) }));

const series = [
  { key: "users", label: "Users", color: "#2563eb" },
  { key: "sessions", label: "Sessions", color: "#16a34a" },
] as const;

export function TrafficChart() {
  return (
    <div className="w-full">
      <LineChart className="h-[300px]" data={data}>
        <Grid horizontal strokeDasharray="3,3" />
        {series.map((s) => (
          <Line
            curve={curveMonotoneX}
            dataKey={s.key}
            fadeEdges={false}
            key={s.key}
            stroke={s.color}
            strokeWidth={2}
          />
        ))}
        <XAxis />
        <YAxis formatValue={(v) => `${(v / 1000).toFixed(1)}k`} />
        <ChartTooltip
          rows={(point) =>
            series.map((s) => ({
              color: s.color,
              label: s.label,
              value: Number(point[s.key]),
            }))
          }
        />
      </LineChart>
      <Legend
        className="flex-row justify-center gap-4"
        items={series.map((s) => ({ label: s.label, color: s.color, value: 0 }))}
      >
        <LegendItem className="flex items-center gap-1.5">
          <LegendMarker />
          <LegendLabel />
        </LegendItem>
      </Legend>
    </div>
  );
}
```

Notes: `type="monotone"` → `curveMonotoneX`; `dot={false}` → nothing (markers are off by default); `fadeEdges={false}` keeps Recharts' hard line ends (bklit `Line` fades its edges by default); `name` → `rows` labels; `ResponsiveContainer height={300}` → `className="h-[300px]"`.

---

## 2. Stacked bar (shadcn)

Before:

```tsx
const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  // …
];
const chartConfig = {
  desktop: { label: "Desktop", color: "var(--chart-1)" },
  mobile: { label: "Mobile", color: "var(--chart-2)" },
} satisfies ChartConfig;

<ChartContainer className="min-h-[200px] w-full" config={chartConfig}>
  <BarChart accessibilityLayer data={chartData}>
    <CartesianGrid vertical={false} />
    <XAxis dataKey="month" tickFormatter={(value) => value.slice(0, 3)} tickLine={false} axisLine={false} />
    <ChartTooltip content={<ChartTooltipContent hideLabel />} />
    <ChartLegend content={<ChartLegendContent />} />
    <Bar dataKey="desktop" stackId="a" fill="var(--color-desktop)" radius={[0, 0, 4, 4]} />
    <Bar dataKey="mobile" stackId="a" fill="var(--color-mobile)" radius={[4, 4, 0, 0]} />
  </BarChart>
</ChartContainer>
```

Install: `npx shadcn@latest add @bklit/bar-chart @bklit/legend`

After:

```tsx
"use client";

import { Bar } from "@/components/charts/bar";
import { BarChart } from "@/components/charts/bar-chart";
import { BarXAxis } from "@/components/charts/bar-x-axis";
import { Grid } from "@/components/charts/grid";
import {
  Legend,
  LegendItem,
  LegendLabel,
  LegendMarker,
} from "@/components/charts/legend";
import { ChartTooltip } from "@/components/charts/tooltip";

const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  // …
];
const chartConfig = {
  desktop: { label: "Desktop", color: "var(--chart-1)" },
  mobile: { label: "Mobile", color: "var(--chart-2)" },
} as const;

// BarXAxis prints the raw category, so apply the old tickFormatter to the data.
const rows = chartData.map((d) => ({ ...d, month: d.month.slice(0, 3) }));

export function ChartBarStacked() {
  return (
    <div className="w-full">
      <BarChart className="min-h-[200px]" data={rows} stacked xDataKey="month">
        <Grid horizontal />
        <Bar dataKey="desktop" fill={chartConfig.desktop.color} lineCap={4} />
        <Bar dataKey="mobile" fill={chartConfig.mobile.color} lineCap={4} />
        <BarXAxis />
        <ChartTooltip
          rows={(point) => [
            { color: chartConfig.desktop.color, label: chartConfig.desktop.label, value: Number(point.desktop) },
            { color: chartConfig.mobile.color, label: chartConfig.mobile.label, value: Number(point.mobile) },
          ]}
        />
      </BarChart>
      <Legend
        className="flex-row justify-center gap-4"
        items={[
          { label: chartConfig.desktop.label, color: chartConfig.desktop.color, value: 0 },
          { label: chartConfig.mobile.label, color: chartConfig.mobile.color, value: 0 },
        ]}
      >
        <LegendItem className="flex items-center gap-1.5">
          <LegendMarker />
          <LegendLabel />
        </LegendItem>
      </Legend>
    </div>
  );
}
```

Notes: `stackId="a"` on both bars → `stacked` on the root. With `stackGap` 0 only the last series gets rounded corners, so `lineCap={4}` reproduces the rounded stack top (all four corners of the top segment are rounded — `[4,4,0,0]` has no exact equivalent). `hideLabel` is not available with `rows`; the panel title shows the category ("Jan").

---

## 3. Horizontal bar

Before:

```tsx
<ResponsiveContainer aspect={4 / 3} width="100%">
  <BarChart data={data} layout="vertical" margin={{ left: 24 }}>
    <CartesianGrid horizontal={false} />
    <XAxis hide type="number" />
    <YAxis dataKey="browser" type="category" width={72} />
    <Tooltip cursor={false} />
    <Bar dataKey="visitors" fill="#6366f1" radius={4} />
  </BarChart>
</ResponsiveContainer>
```

Install: `npx shadcn@latest add @bklit/bar-chart`

After:

```tsx
"use client";

import { Bar } from "@/components/charts/bar";
import { BarChart } from "@/components/charts/bar-chart";
import { BarYAxis } from "@/components/charts/bar-y-axis";
import { Grid } from "@/components/charts/grid";
import { ChartTooltip } from "@/components/charts/tooltip";

const data = [
  { browser: "Chrome", visitors: 275 },
  { browser: "Safari", visitors: 200 },
  // …
];

export function BrowserShare() {
  return (
    <BarChart
      aspectRatio="4 / 3"
      data={data}
      margin={{ left: 80 }}
      orientation="horizontal"
      xDataKey="browser"
    >
      <Grid fadeVertical horizontal={false} vertical />
      <Bar dataKey="visitors" fill="#6366f1" lineCap={4} />
      <BarYAxis />
      <ChartTooltip showCrosshair={false} />
    </BarChart>
  );
}
```

Notes: Recharts `layout="vertical"` (bars run horizontally) is bklit `orientation="horizontal"`. The category axis becomes `BarYAxis`; the hidden numeric `XAxis` is simply omitted. `xDataKey` still names the **category** key even though it is drawn on the y axis. `YAxis width={72}` → `margin.left` (labels are right-aligned in the margin, max 70px wide).

---

## 4. Donut with centre label

Before:

```tsx
import { Cell, Label, Pie, PieChart, Tooltip } from "recharts";

const plans = [
  { plan: "Free", seats: 540, fill: "#a1a1aa" },
  { plan: "Pro", seats: 310, fill: "#6366f1" },
  { plan: "Team", seats: 120, fill: "#22c55e" },
  { plan: "Enterprise", seats: 30, fill: "#f59e0b" },
];
const total = plans.reduce((sum, p) => sum + p.seats, 0);

<PieChart height={260} width={260}>
  <Tooltip />
  <Pie data={plans} dataKey="seats" nameKey="plan" innerRadius={70} outerRadius={110} paddingAngle={2}>
    {plans.map((p) => <Cell fill={p.fill} key={p.plan} />)}
    <Label position="center" value={`${total} seats`} />
  </Pie>
</PieChart>
```

Install: `npx shadcn@latest add @bklit/pie-chart`

After:

```tsx
"use client";

import { PieCenter } from "@/components/charts/pie-center";
import { PieChart } from "@/components/charts/pie-chart";
import { PieSlice } from "@/components/charts/pie-slice";

const plans = [
  { plan: "Free", seats: 540, fill: "#a1a1aa" },
  { plan: "Pro", seats: 310, fill: "#6366f1" },
  { plan: "Team", seats: 120, fill: "#22c55e" },
  { plan: "Enterprise", seats: 30, fill: "#f59e0b" },
];

// Pie dataKey/nameKey + Cell fill → PieData { label, value, color }.
const data = plans.map((p) => ({ label: p.plan, value: p.seats, color: p.fill }));

export function PlanMix() {
  return (
    <PieChart
      data={data}
      innerRadius={70}
      padAngle={(2 * Math.PI) / 180}
      size={260}
    >
      {data.map((d, i) => (
        <PieSlice index={i} key={d.label} />
      ))}
      <PieCenter defaultLabel="seats" />
    </PieChart>
  );
}
```

Notes: `paddingAngle` is degrees, `padAngle` radians. `outerRadius` has no prop — it is `size / 2 − hoverOffset` (10). `PieCenter` shows the total with `defaultLabel` underneath and switches to the hovered slice's label/value, replacing both the centre `Label` and the `Tooltip`.

---

## 5. Radar

Before:

```tsx
// Raw scores out of 150.
const data = [
  { subject: "Math", alice: 120, bob: 110 },
  { subject: "Chinese", alice: 98, bob: 130 },
  // …
];

<RadarChart data={data} outerRadius="80%">
  <PolarGrid />
  <PolarAngleAxis dataKey="subject" />
  <PolarRadiusAxis domain={[0, 150]} />
  <Radar dataKey="alice" name="Alice" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
  <Radar dataKey="bob" name="Bob" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
  <Legend />
</RadarChart>
```

Install: `npx shadcn@latest add @bklit/radar-chart @bklit/legend`

After:

```tsx
"use client";

import {
  Legend,
  LegendItem,
  LegendLabel,
  LegendMarker,
} from "@/components/charts/legend";
import { RadarArea } from "@/components/charts/radar-area";
import { RadarAxis } from "@/components/charts/radar-axis";
import { RadarChart } from "@/components/charts/radar-chart";
import { RadarGrid } from "@/components/charts/radar-grid";
import { RadarLabels } from "@/components/charts/radar-labels";

const MAX_SCORE = 150; // was PolarRadiusAxis domain={[0, 150]}

const data = [
  { subject: "Math", alice: 120, bob: 110 },
  { subject: "Chinese", alice: 98, bob: 130 },
  // …
];
const series = [
  { key: "alice", label: "Alice", color: "#8884d8" },
  { key: "bob", label: "Bob", color: "#82ca9d" },
] as const;

// Rows-per-axis → metrics + one RadarData per series, values normalised to 0–100.
const metrics = data.map((row) => ({ key: row.subject, label: row.subject }));
const radarData = series.map((s) => ({
  label: s.label,
  color: s.color,
  values: Object.fromEntries(
    data.map((row) => [row.subject, (row[s.key] / MAX_SCORE) * 100])
  ),
}));

export function SkillsRadar() {
  return (
    <div className="mx-auto w-full max-w-[360px]">
      <RadarChart data={radarData} metrics={metrics}>
        <RadarGrid />
        <RadarAxis />
        <RadarLabels />
        {radarData.map((d, i) => (
          <RadarArea index={i} key={d.label} />
        ))}
      </RadarChart>
      <Legend
        className="flex-row justify-center gap-4"
        items={radarData.map((d) => ({ label: d.label, color: d.color, value: 0 }))}
      >
        <LegendItem className="flex items-center gap-1.5">
          <LegendMarker />
          <LegendLabel />
        </LegendItem>
      </Legend>
    </div>
  );
}
```

Notes: bklit radar values are always on a 0–100 scale (`RadarGrid` labels read 20…100). Pick the old `PolarRadiusAxis domain` max (or the data max) as the divisor. `fillOpacity` is not configurable on `RadarArea`.

---

## 6. Area with gradient

Before:

```tsx
<ResponsiveContainer height={240} width="100%">
  <AreaChart data={data}>
    <defs>
      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
      </linearGradient>
    </defs>
    <XAxis dataKey="date" />
    <Tooltip />
    <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" fill="url(#colorRevenue)" />
  </AreaChart>
</ResponsiveContainer>
```

Install: `npx shadcn@latest add @bklit/area-chart`

After (built-in gradient — preferred):

```tsx
"use client";

import { Area, AreaChart } from "@/components/charts/area-chart";
import { ChartTooltip } from "@/components/charts/tooltip";
import { XAxis } from "@/components/charts/x-axis";

const data = [
  { date: "2025-03-01", revenue: 4200 },
  { date: "2025-03-02", revenue: 5100 },
  // …
].map((d) => ({ ...d, date: new Date(`${d.date}T00:00:00`) }));

export function RevenueArea() {
  return (
    <AreaChart className="h-[240px]" data={data}>
      <Area dataKey="revenue" fill="#8b5cf6" fillOpacity={0.8} gradientToOpacity={0} />
      <XAxis />
      <ChartTooltip />
    </AreaChart>
  );
}
```

After (multi-colour gradient via `url(#id)`):

```tsx
import { LinearGradient } from "@/components/charts/gradients";

<AreaChart className="h-[240px]" data={data}>
  <LinearGradient id="revenue-fill" from="#8b5cf6" to="#06b6d4" fromOpacity={0.6} toOpacity={0} />
  <Area dataKey="revenue" fill="url(#revenue-fill)" stroke="#8b5cf6" />
  <XAxis />
  <ChartTooltip />
</AreaChart>
```

Notes: `Area` already draws a vertical gradient from `fill` at `fillOpacity` (top) to `gradientToOpacity` (bottom); `gradientSpan` (0–1) compresses it toward the top. `curveMonotoneX` is `Area`'s default, so `type="monotone"` needs no prop. With a `url(...)` fill, set `stroke` explicitly (it otherwise falls back to `var(--chart-line-primary)`). `gradients.tsx` (`@bklit/gradients`) is installed by `@bklit/area-chart`; `LinearGradient` children are hoisted into the chart's `<defs>`. A raw `<defs><linearGradient …/></defs>` child also works.

---

## 7. Tiny line → `LineSparkline`

A Recharts chart with one series and no axes, grid or legend, rendered small, is a sparkline — use `@bklit/sparkline`, not `LineChart`.

Before (Recharts 3 "Tiny Line Chart"):

```tsx
import { Line, LineChart } from "recharts";

export function SignupsSparkline() {
  return (
    <LineChart
      data={weeks}
      responsive
      style={{ width: "100%", maxWidth: 100, maxHeight: 50, aspectRatio: 1.618 }}
    >
      <Line dataKey="signups" dot={false} stroke="#2563eb" strokeWidth={2} />
    </LineChart>
  );
}
```

Install: `npx shadcn@latest add @bklit/sparkline`

After:

```tsx
"use client";

import { LineSparkline } from "@/components/charts/sparkline";

export function SignupsSparkline() {
  return (
    <div className="w-full max-w-[100px]">
      <LineSparkline
        color="#2563eb"
        curve="linear"
        data={weeks}
        dataKey="signups"
        height={50}
        strokeWidth={2}
      />
    </div>
  );
}
```

Notes: `responsive` / `style.width: "100%"` → omit `width` (the sparkline fills its parent; the wrapper keeps the old `maxWidth`). `maxHeight` → `height`. Recharts' default curve is linear; sparklines default to `"monotone"`, so `curve="linear"` keeps parity (drop it if a smoother line is fine). `dot={false}` needs no prop — sparklines never draw per-point dots.

---

## 8. Tiny area with tooltip → `AreaSparkline` + `useSparklineHover`

Before (Recharts 2 style):

```tsx
import { Area, AreaChart, ResponsiveContainer, Tooltip } from "recharts";

export function RevenueSparkline() {
  return (
    <ResponsiveContainer height={48} width="100%">
      <AreaChart data={weeks} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
        <Tooltip cursor={false} />
        <Area
          dataKey="revenue"
          fill="#16a34a"
          fillOpacity={0.2}
          isAnimationActive={false}
          stroke="#16a34a"
          type="monotone"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
```

Install: `npx shadcn@latest add @bklit/sparkline`

After (needs-workaround: sparklines have no tooltip, so show the hovered value next to the chart — ask the user first):

```tsx
"use client";

import { AreaSparkline, useSparklineHover } from "@/components/charts/sparkline";

type Week = (typeof weeks)[number];

export function RevenueSparkline() {
  const hover = useSparklineHover<Week>();
  const shown = hover.datum ?? weeks.at(-1);

  return (
    <div className="flex items-center gap-3">
      <span className="w-16 text-right font-medium text-sm tabular-nums">
        {shown ? `$${shown.revenue.toLocaleString()}` : null}
      </span>
      <AreaSparkline
        animate={false}
        color="#16a34a"
        crosshair={false}
        data={weeks}
        dataKey="revenue"
        fill="solid"
        fillOpacity={0.2}
        height={48}
        padding={{ top: 5, right: 0, bottom: 5, left: 0 }}
        {...hover.sparklineProps}
      />
    </div>
  );
}
```

Notes: `margin` → `padding`. A flat Recharts `fillOpacity` → `fill="solid"` with the same opacity (the default `fill="gradient"` fades from 0.3 to 0, which usually looks better — offer it). `cursor={false}` → `crosshair={false}`. `isAnimationActive={false}` → `animate={false}`. To sync several sparklines' crosshairs (Recharts `syncId`), spread the same `hover.sparklineProps` onto each.

---

## 9. Tiny bar → `BarSparkline`

Before:

```tsx
import { Bar, BarChart } from "recharts";

<BarChart data={weeks} height={40} width={120}>
  <Bar dataKey="orders" fill="var(--chart-3)" radius={2} />
</BarChart>
```

After:

```tsx
import { BarSparkline } from "@/components/charts/sparkline";

<BarSparkline
  barRadius={2}
  color="var(--chart-3)"
  data={weeks}
  dataKey="orders"
  height={40}
  width={120}
/>
```

Notes: `radius` → `barRadius` (rounds the end away from the baseline; `[2, 2, 0, 0]` → `2`). Bars always include zero and support negative values. Hovering dims the other bars to `inactiveOpacity` (0.4).

---

## 10. TanStack Charts KPI sparkline → `AreaSparkline`

Before (`@tanstack/charts`):

```tsx
import { areaY, defineChart, lineY } from "@tanstack/charts";
import { Chart } from "@tanstack/charts/react";
import { scaleLinear } from "@tanstack/charts/scales/linear";
import { scalePoint } from "@tanstack/charts/scales/point";

const revenueSparkline = defineChart({
  marks: [
    areaY(rows, { x: "period", y: "value", fill: "url(#revenue-fill)", curve: "monotoneX" }),
    lineY(rows, { x: "period", y: "value", stroke: "var(--chart-1)", strokeWidth: 1.5, curve: "monotoneX" }),
  ],
  scales: {
    x: { scale: () => scalePoint<string>(), axis: false },
    y: { scale: () => scaleLinear().domain([10_000, 17_000]), axis: false },
  },
  gradients: [/* revenue-fill: var(--chart-1) 0.3 → 0 */],
  margin: { top: 4, right: 0, bottom: 4, left: 0 },
  guides: false,
  svgAnimation: true,
  tooltip: false,
});

<Chart
  ariaLabel="Revenue over the last 7 days"
  definition={revenueSparkline}
  height={40}
  idPrefix="revenue-kpi"
  width={160}
/>
```

Install: `npx shadcn@latest add @bklit/sparkline`

After:

```tsx
"use client";

import { AreaSparkline } from "@/components/charts/sparkline";

<AreaSparkline
  aria-label="Revenue over the last 7 days"
  color="var(--chart-1)"
  data={rows}
  dataKey="value"
  height={40}
  padding={{ top: 4, right: 0, bottom: 4, left: 0 }}
  width={160}
  yDomain={[10_000, 17_000]}
/>
```

Notes: the `areaY` + `lineY` pair is **one** `AreaSparkline` (it draws its own line). `y: "value"` → `dataKey`; the x channel is dropped (x is row order). `curve: "monotoneX"` → `curve="monotone"` (the default). The `gradients` entry → the default `fill="gradient"` (`fillOpacity` 0.3 → 0). `svgAnimation` / a `motion()` renderer → `animate` (default on, reduced motion handled). `idPrefix` is not needed (`useId`). `axis: false`, `guides: false` and `tooltip: false` need no props — sparklines have none. Full mapping: `tanstack-charts.md`.
