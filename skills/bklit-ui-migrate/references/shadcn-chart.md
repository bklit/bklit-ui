# Converting shadcn/ui charts (`components/ui/chart.tsx`)

shadcn's chart component is a thin wrapper around Recharts. A shadcn chart file imports Recharts primitives **and** wrapper pieces:

```tsx
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
```

Convert the Recharts primitives with `component-map.md` / `prop-map.md`, then replace each wrapper piece as below.

## What the wrapper does (and what you must replace)

| Wrapper piece | What it really does | bklit replacement |
|---|---|---|
| `ChartContainer config` | Wraps children in `ResponsiveContainer`, injects `--color-<key>` CSS variables from `config` (scoped by `data-chart`), applies `aspect-video` + Recharts text styling. | Delete. Size the bklit root with `aspectRatio` / `className`. Replace every `var(--color-<key>)` with the config colour. |
| `ChartConfig` | `{ [key]: { label, icon?, color? \| theme?: { light, dark } } }` | Keep it as a plain `const` (drop the `ChartConfig` type import) and read from it, or inline the values. |
| `ChartTooltip` | `= Recharts.Tooltip` | bklit `ChartTooltip` from `@/components/charts/tooltip` (same name — see collisions). |
| `ChartTooltipContent` | Renders rows from `payload` using `config[key].label` and series colour; `indicator`, `hideLabel`, `hideIndicator`, `labelFormatter`, `formatter`, `nameKey`, `labelKey`. | `rows={(point) => …}` on `ChartTooltip`. `hideLabel` / `labelFormatter` need `content`. `indicator` has no equivalent (rows always show a colour dot). |
| `ChartLegend` + `ChartLegendContent` | `Recharts.Legend` whose content lists `config[key].label` with colour swatches. | `Legend` + `LegendItem` + `LegendMarker` + `LegendLabel` from `@/components/charts/legend`, rendered **outside** the chart. |
| `ChartStyle` | Emits the `--color-*` `<style>` | Nothing. |

### `var(--color-<key>)` is the #1 migration bug

`--color-desktop` exists **only** inside a `ChartContainer` (it is generated from `config.desktop.color`). After removing the container, any `stroke="var(--color-desktop)"` silently becomes transparent / black. Resolve each one from the config:

| Config entry | Use in bklit |
|---|---|
| `color: "var(--chart-1)"` | `"var(--chart-1)"` |
| `color: "hsl(var(--chart-1))"` (Tailwind v3 shadcn) | `"hsl(var(--chart-1))"` |
| `color: "#2563eb"` | `"#2563eb"` |
| `theme: { light: "#2563eb", dark: "#60a5fa" }` | Define a CSS variable yourself (`:root { --series-desktop: #2563eb } .dark { --series-desktop: #60a5fa }`) and use `var(--series-desktop)`. |

`--chart-1 … --chart-5` already exist in every shadcn project. `npx shadcn add @bklit/…` adds the bklit tokens (`--chart-line-primary: var(--chart-1)`, `--chart-grid`, `--chart-crosshair`, tooltip colours, …) but does **not** overwrite existing variables, so the user's `--chart-1…5` palette is preserved.

### Sizing: `ChartContainer className` → bklit root

| shadcn `className` | bklit |
|---|---|
| (none) → default `aspect-video` | `aspectRatio="16 / 9"` |
| `aspect-auto h-[250px] w-full` | `className="h-[250px]"` (root is already `w-full`; explicit width + height override the default `aspectRatio="2 / 1"`) |
| `min-h-[200px] w-full` | keep default `aspectRatio` (or `className="min-h-[200px]"`) |
| `mx-auto aspect-square max-h-[250px]` (pie/radial) | `PieChart size={250}` / `RingChart size={250}` / `RadarChart size={250}`, or `className="mx-auto max-w-[250px]"` (they are `aspect-square w-full`) |

`ChartContainer` also set `text-xs` and Recharts tick colours; bklit axes/tooltip are already styled, so drop those.

### Labels: config → tooltip rows and legend items

bklit's default tooltip label is the series `dataKey` ("desktop"). To show `config.desktop.label`:

```tsx
<ChartTooltip
  rows={(point) => [
    { color: chartConfig.desktop.color, label: chartConfig.desktop.label, value: Number(point.desktop) },
    { color: chartConfig.mobile.color, label: chartConfig.mobile.label, value: Number(point.mobile) },
  ]}
/>
```

Keep row order identical to the series children order — row *i*'s colour is also used for series *i*'s hover dot.

`label` in a `ChartConfig` is `ReactNode`; tooltip rows and legend items need a `string`.

### Import collisions

shadcn's `chart.tsx` exports `ChartTooltip` and `ChartLegend`; bklit exports `ChartTooltip` (and `Legend`). In a converted file, delete the `@/components/ui/chart` import entirely. If a file still renders a Recharts chart you are keeping, alias one side:

```tsx
import { ChartTooltip as BklitChartTooltip } from "@/components/charts/tooltip";
import { ChartTooltip, ChartContainer } from "@/components/ui/chart"; // kept chart
```

Delete `components/ui/chart.tsx` only when nothing imports it (`scripts/detect-recharts.mjs` → `shadcnWrappers[].importedBy` is empty, and a repo-wide search for `ui/chart` finds nothing).

## Full before / after: "Area Chart - Interactive"

### Before (shadcn block, trimmed)

```tsx
"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartData = [
  { date: "2024-04-01", desktop: 222, mobile: 150 },
  { date: "2024-04-02", desktop: 97, mobile: 180 },
  // …
];

const chartConfig = {
  visitors: { label: "Visitors" },
  desktop: { label: "Desktop", color: "var(--chart-1)" },
  mobile: { label: "Mobile", color: "var(--chart-2)" },
} satisfies ChartConfig;

export function ChartAreaInteractive() {
  const [range, setRange] = React.useState<"all" | "last4">("all");
  const filteredData = range === "all" ? chartData : chartData.slice(-4);

  return (
    <div className="w-full">
      <button onClick={() => setRange(range === "all" ? "last4" : "all")} type="button">
        {range === "all" ? "Last 4 days" : "All"}
      </button>
      <ChartContainer className="aspect-auto h-[250px] w-full" config={chartConfig}>
        <AreaChart data={filteredData}>
          <defs>
            <linearGradient id="fillDesktop" x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor="var(--color-desktop)" stopOpacity={0.8} />
              <stop offset="95%" stopColor="var(--color-desktop)" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="fillMobile" x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor="var(--color-mobile)" stopOpacity={0.8} />
              <stop offset="95%" stopColor="var(--color-mobile)" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={(v) =>
              new Date(v).toLocaleDateString("en-US", { month: "short", day: "numeric" })
            }
          />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent indicator="dot" />}
          />
          <Area dataKey="mobile" type="natural" fill="url(#fillMobile)" stroke="var(--color-mobile)" stackId="a" />
          <Area dataKey="desktop" type="natural" fill="url(#fillDesktop)" stroke="var(--color-desktop)" stackId="a" />
          <ChartLegend content={<ChartLegendContent />} />
        </AreaChart>
      </ChartContainer>
    </div>
  );
}
```

Inventory → `AreaChart` · **needs workaround** (`stackId="a"` on areas). Ask the user: overlap the two areas (simplest, changes the meaning of the top band) or draw the cumulative stack (keeps the look). The after below keeps the stacked look.

Install: `npx shadcn@latest add @bklit/area-chart @bklit/legend`.

### After (bklit)

```tsx
"use client";

import { curveNatural } from "d3-shape";
import { useState } from "react";
import { Area, AreaChart } from "@/components/charts/area-chart";
import { Grid } from "@/components/charts/grid";
import {
  Legend,
  LegendItem,
  LegendLabel,
  LegendMarker,
} from "@/components/charts/legend";
import { ChartTooltip } from "@/components/charts/tooltip";
import { XAxis } from "@/components/charts/x-axis";

const chartData = [
  { date: "2024-04-01", desktop: 222, mobile: 150 },
  { date: "2024-04-02", desktop: 97, mobile: 180 },
  // …
];

// Former ChartConfig: colours and labels now feed series, rows and legend directly.
const chartConfig = {
  desktop: { label: "Desktop", color: "var(--chart-1)" },
  mobile: { label: "Mobile", color: "var(--chart-2)" },
} as const;

const legendItems = [
  { label: chartConfig.desktop.label, color: chartConfig.desktop.color, value: 0 },
  { label: chartConfig.mobile.label, color: chartConfig.mobile.color, value: 0 },
];

export function ChartAreaInteractive() {
  const [range, setRange] = useState<"all" | "last4">("all");
  const filteredData = range === "all" ? chartData : chartData.slice(-4);

  // bklit x must be a Date: parse as a local day (a bare "2024-04-01" is UTC).
  // Recharts stacked mobile + desktop (stackId="a"); bklit areas don't stack,
  // so draw the stack top behind and mobile in front.
  const rows = filteredData.map((d) => ({
    ...d,
    date: new Date(`${d.date}T00:00:00`),
    stackTop: d.mobile + d.desktop,
  }));

  return (
    <div className="w-full">
      <button onClick={() => setRange(range === "all" ? "last4" : "all")} type="button">
        {range === "all" ? "Last 4 days" : "All"}
      </button>
      <AreaChart className="h-[250px]" data={rows}>
        <Grid horizontal />
        <Area
          curve={curveNatural}
          dataKey="stackTop"
          fill={chartConfig.desktop.color}
          fillOpacity={0.8}
          gradientToOpacity={0.1}
        />
        <Area
          curve={curveNatural}
          dataKey="mobile"
          fill={chartConfig.mobile.color}
          fillOpacity={0.8}
          gradientToOpacity={0.1}
        />
        <XAxis />
        <ChartTooltip
          rows={(point) => [
            {
              color: chartConfig.desktop.color,
              label: chartConfig.desktop.label,
              value: Number(point.desktop),
            },
            {
              color: chartConfig.mobile.color,
              label: chartConfig.mobile.label,
              value: Number(point.mobile),
            },
          ]}
          showCrosshair={false}
        />
      </AreaChart>
      <Legend className="flex-row justify-center gap-4 pt-3" items={legendItems}>
        <LegendItem className="flex items-center gap-1.5">
          <LegendMarker className="h-2 w-2" />
          <LegendLabel className="text-xs" />
        </LegendItem>
      </Legend>
    </div>
  );
}
```

What changed and why:

- `ChartContainer` → wrapper `div`; `aspect-auto h-[250px] w-full` → `AreaChart className="h-[250px]"`.
- `var(--color-desktop)` → `chartConfig.desktop.color` (`var(--chart-1)`).
- Gradient `<defs>` → `Area` built-in gradient: `fillOpacity` (top stop) 0.8, `gradientToOpacity` (bottom stop) 0.1. `stroke` defaults to `fill`.
- `type="natural"` → `curve={curveNatural}`.
- `CartesianGrid vertical={false}` → `<Grid horizontal />` (bklit grid is dashed and edge-faded by default).
- `XAxis tickFormatter` (month short + day) → plain `<XAxis />`: bklit's fixed `"MMM d"` labels already match. The tooltip title becomes `"Mon, Apr 1"` (fixed format; use `content` if it must differ).
- `cursor={false}` → `showCrosshair={false}`; `ChartTooltipContent` labels → `rows`, ordered like the `Area` children.
- `stackId="a"` → cumulative `stackTop` series drawn first. The hover dot of the first series sits on the stack top (where Recharts' desktop line was); the row still shows the raw `desktop` value.
- `ChartLegendContent` → `Legend` (HTML) below the chart. `LegendItemData.value` is required; it is unused without `LegendValue`.
- Removed imports: `recharts`, `@/components/ui/chart`. If no other file imports them, delete `components/ui/chart.tsx` and `npm uninstall recharts` (step 6 of the workflow).

## Other shadcn patterns

| shadcn | bklit |
|---|---|
| `<ChartTooltipContent hideLabel />` | `content={({ point }) => …}` rendering only the rows, or accept the date/category title |
| `<ChartTooltipContent indicator="line" />` | no equivalent — rows show a dot |
| `<ChartTooltipContent nameKey="browser" />` (pie) | `PieCenter` shows the hovered slice label/value |
| `ChartConfig` with `icon` | Render icons in `content` or next to `LegendLabel` yourself |
| Bar chart `accessibilityLayer` | drop |
| `<Bar dataKey fill="var(--color-desktop)" radius={8} />` | `<Bar dataKey fill="var(--chart-1)" lineCap={8} />` |
| `<Pie data dataKey="visitors" nameKey="browser" />` with `fill` per row (`"var(--color-chrome)"`) | `PieChart data={rows.map(r => ({ label: config[r.browser].label, value: r.visitors, color: config[r.browser].color }))}` |
| Radial "Shape"/"Text" examples using `PolarRadiusAxis` + `Label` | `RingChart` + `RingCenter`, or `Gauge` for one value |
