---
title: Ring Chart
description: A composable multi-ring progress chart with animated arcs, hover interactions, and a reusable legend component
---

import { RingChart, Ring, RingCenter } from "@bklitui/ui/charts";
import { RingChartDemo } from "@/components/docs/ring-chart-demo";

<ComponentPreview registryName="ring-chart">
  <RingChartDemo />
</ComponentPreview>

## Installation

<InstallationTabs name="ring-chart" dependencies={["@visx/responsive", "@number-flow/react", "motion"]} />

## Usage

The Ring Chart uses a composable API similar to other charts in the library. Build charts by combining components:

```tsx
import { RingChart, Ring, RingCenter } from "@bklitui/ui/charts";

const data = [
  { label: "Organic", value: 4250, maxValue: 5000, color: "#0ea5e9" },
  { label: "Paid", value: 3120, maxValue: 5000, color: "#a855f7" },
  { label: "Email", value: 2100, maxValue: 5000, color: "#f59e0b" },
];

export default function SessionsChart() {
  return (
    <RingChart data={data} size={300}>
      {data.map((item, index) => (
        <Ring key={item.label} index={index} />
      ))}
      <RingCenter defaultLabel="Total Sessions" />
    </RingChart>
  );
}
```

## Components

### RingChart

The root component that provides context to all children.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `RingData[]` | required | Array of ring data items |
| `size` | `number` | auto | Fixed size in pixels (uses parent if not set) |
| `strokeWidth` | `number` | `12` | Width of each ring |
| `ringGap` | `number` | `6` | Gap between rings |
| `baseInnerRadius` | `number` | `60` | Inner radius of the innermost ring |
| `hoveredIndex` | `number \| null` | - | Controlled hover state |
| `onHoverChange` | `(index: number \| null) => void` | - | Hover state callback |
| `className` | `string` | `""` | Additional CSS class |

### Ring

Renders an individual ring with background track and animated progress arc.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `index` | `number` | required | Index of the ring in the data array |
| `color` | `string` | from data/palette | Optional color override |
| `animate` | `boolean` | `true` | Enable animation on mount |
| `showGlow` | `boolean` | `true` | Show glow effect on hover |
| `lineCap` | `"round" \| "butt"` | `"round"` | Line cap style for ring ends |

### RingCenter

Displays the total or hovered value in the center of the chart.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `defaultLabel` | `string` | `"Total"` | Label shown when not hovering |
| `formatValue` | `(value: number) => string` | `toLocaleString()` | Format function for values |
| `children` | `function` | - | Custom render function |
| `className` | `string` | `""` | Additional CSS class |

### Legend

A composable legend component for ring charts, pie charts, and other visualizations. See the full [Legend documentation](/docs/components/legend) for all components and options.

## Data Shape

```ts
interface RingData {
  label: string;      // Display label
  value: number;      // Current value
  maxValue: number;   // Maximum value (for percentage)
  color?: string;     // Optional color (falls back to palette)
}

interface LegendItem {
  label: string;
  value: number;
  maxValue?: number;  // Required if showProgress is true
  color: string;
}
```

See the [charts gallery](/charts/ring-chart) for custom colors, legend sync, and center content variations.

## Theming

The Ring Chart uses CSS variables for theming. The ring track uses `--border` (same as radar grid lines), and ring colors default to `--chart-1` through `--chart-5`:

```css
:root {
  --border: oklch(0.92 0.004 286.32);
  --chart-1: oklch(0.646 0.222 41.116);
  --chart-2: oklch(0.6 0.118 184.704);
  --chart-3: oklch(0.398 0.07 227.392);
  --chart-4: oklch(0.828 0.189 84.429);
  --chart-5: oklch(0.769 0.188 70.08);
}

.dark {
  --border: oklch(0.56 0.0195 267.65 / 0.2);
  --chart-1: oklch(0.488 0.243 264.376);
  --chart-2: oklch(0.696 0.17 162.48);
  --chart-3: oklch(0.769 0.188 70.08);
  --chart-4: oklch(0.627 0.265 303.9);
  --chart-5: oklch(0.645 0.246 16.439);
}
```

## Animation

The ring chart features a multi-phase animation on mount:

1. **Ring Expansion** - Background rings scale in with staggered timing
2. **Progress Arcs** - Progress arcs animate from 0 to their target value
3. **Center Content** - Value and label fade in
4. **Legend** - Items slide in from the right with progress bars filling

All animations use spring physics for natural motion.

## Dependencies

```bash
pnpm add @visx/shape @visx/group @visx/responsive motion
```
