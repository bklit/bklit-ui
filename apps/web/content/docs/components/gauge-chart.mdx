---
title: Gauge
description: Notch-based radial or linear gauge with optional center label, theme fills, patterns, arc gradients, and responsive sizing
---

import { GaugeChartDemo } from "@/components/docs/gauge-chart-demo";

<ComponentPreview registryName="gauge-chart">
  <GaugeChartDemo />
</ComponentPreview>

## Installation

<InstallationTabs
  name="gauge-chart"
  dependencies={[
    "@visx/responsive",
    "@visx/pattern",
    "@number-flow/react",
    "motion",
    "d3-shape",
  ]}
/>

## Usage

`Gauge` draws **notches** around an arc (default) or along a horizontal track (`orientation="linear"`). The center label is **optional** — omit `centerValue` for a track-only gauge.

- **Fill vs center:** `value` is the fill level **0–100**. `centerValue` is the statistic shown in the label (often the same story or a related KPI).
- **Arc center:** arc gauges overlay the label in the middle of the sweep (PieCenter-style NumberFlow + caption).
- **Linear label placement:** with `orientation="linear"`, place the label above or below the track using `labelPlacement` (`top` | `bottom`) and `labelAlign` (`start` | `center` | `end`) — the same six-position model as chart legend (top/bottom × left/center/right).
- **Responsive:** omit `width` and `height` to fill the parent. Arc gauges use **`minWidth`** (default **300**) and an aspect ratio. Linear gauges fill the parent width and use **`linearHeight`** (default **24**).
- **Linear notches:** linear gauges default to **`uniformWidth`** (rectangular notches). Pass `uniformWidth={false}` for tapered ticks.
- **Patterns / gradients in `<defs>`:** pass **`PatternLines`**, **`LinearGradient`**, etc. as **`children`**, then set **`activeFill`** / **`inactiveFill`** to `url(#id)`.
- **Arc gradients:** set **`useGradient`**. Optional **`activeGradient`** and **`inactiveGradient`** are **`[hexFrom, hexTo]`** tuples (interpolated along the notch index).
- **Fill opacity:** `activeFillOpacity` and `inactiveFillOpacity` map to SVG `fill-opacity` (0–1). Defaults are **1** for active notches and **0.8** for the track; docs and gallery examples use **`inactiveFillOpacity={0.4}`** for a lighter track.
- **Corner radius:** `notchCornerRadius` is the fillet in **pixels** at each notch corner (**0** = sharp). Large values are clamped by edge length and radial depth so shapes can approach a **capsule** / near-circular look.

```tsx
import { Gauge, PatternLines } from "@bklitui/ui/charts";

export default function RevenueGauge() {
  return (
    <Gauge
      value={66}
      centerValue={428_000}
      spacing={25}
      inactiveFillOpacity={0.4}
      defaultLabel="ARR run rate"
      formatOptions={{
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }}
    />
  );
}
```

### Linear gauge

Track-only (no label):

```tsx
<Gauge
  orientation="linear"
  value={72}
  totalNotches={72}
  spacing={0}
  notchCornerRadius={3}
  inactiveFillOpacity={0.4}
  useGradient
/>
```

With label below center:

```tsx
<Gauge
  orientation="linear"
  value={72}
  centerValue={428_000}
  defaultLabel="ARR run rate"
  labelPlacement="bottom"
  labelAlign="center"
  totalNotches={72}
  spacing={0}
  notchCornerRadius={3}
  inactiveFillOpacity={0.4}
  useGradient
/>
```

## Props

### Gauge

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `orientation` | `"arc"` \| `"linear"` | `"arc"` | Arc (default) or horizontal linear notch track |
| `value` | `number` | required | Fill level **0–100** |
| `centerValue` | `number` | — | Optional center statistic (NumberFlow); omit for no label |
| `labelPlacement` | `"top"` \| `"bottom"` \| `"left"` \| `"right"` | `"top"` | Label position for linear gauges (`top` / `bottom` recommended) |
| `labelAlign` | `"start"` \| `"center"` \| `"end"` | `"start"` | Horizontal alignment for linear label (left / center / right) |
| `totalNotches` | `number` | `40` | Notch count |
| `spacing` | `number` | `25` | **%** gap between notches |
| `notchLengthPercent` | `number` | `100` | Notch depth as **%** of default (5–100); lower = shorter notches |
| `notchWidthPercent` | `number` | `80` | Linear only — notch width as **%** of slot |
| `notchCornerRadius` | `number` | `0` | Corner fillet in **px** (0 = sharp); large values clamp toward a capsule shape |
| `uniformWidth` | `boolean` | `false` (arc) / `true` (linear) | Rectangular notches vs tapered |
| `startAngle` / `endAngle` | `number` | `135` / `405` | Arc sweep in degrees (arc only) |
| `linearHeight` | `number` | `24` | Bar height in px (linear only) |
| `useGradient` | `boolean` | `false` | Per-notch color ramp |
| `activeGradient` | `[string, string]` | lime → emerald | Hex stops for active notches when `useGradient` |
| `inactiveGradient` | `[string, string]` | same as active | Hex stops for inactive notches when `useGradient` |
| `activeFill` / `inactiveFill` | `string` | `chart-1` / `border` | Solid, CSS color, or `url(#patternId)` |
| `activeFillOpacity` / `inactiveFillOpacity` | `number` | `1` / `0.8` | SVG `fill-opacity` (0–1) for active / track notches |
| `defaultLabel` | `string` | `"Total"` | Center label |
| `formatOptions` | `ChartStatFlowFormat` | standard | NumberFlow format |
| `prefix` / `suffix` | `string` | - | Center prefix / suffix |
| `width` / `height` | `number` | - | Fixed size; omit for responsive |
| `minWidth` | `number` | `300` (arc) / `200` (linear) | Min width (px) when responsive |
| `className` | `string` | - | Root wrapper |
| `children` | `ReactNode` | - | Defs (`Pattern*`, `*Gradient`, …) |

## Theming

Inactive (track) notches default to **`var(--border)`** — shared with ring tracks and radar grid lines. Active notches default to **`var(--chart-1)`**. Override with `inactiveFill` / `activeFill`, or tune **`--border`** / **`--chart-1`** in your theme. See [Theming](/docs/theming).

## Live examples

See the [Gauge gallery](/charts/gauge-chart) for arc and linear variants. Use [Studio](/studio?chart=gauge-chart) to tune every gauge prop interactively — toggle **Linear** for the horizontal notch track, **Show label** for optional center text, and the legend-style **Position** picker for label placement — then copy the resulting code.
