---
title: Radar Chart
description: A composable multi-series radar chart with animated polygons, hover interactions, and customizable metrics
---

import { RadarChart, RadarGrid, RadarAxis, RadarLabels, RadarArea } from "@bklitui/ui/charts";
import { RadarChartDemo } from "@/components/docs/radar-chart-demo";

<ComponentPreview registryName="radar-chart">
  <RadarChartDemo />
</ComponentPreview>

## Installation

<InstallationTabs name="radar-chart" dependencies={["@visx/responsive", "d3-shape", "motion"]} />

## Usage

The Radar Chart uses a composable API. Define your metrics and data, then combine components:

```tsx
import { RadarChart, RadarGrid, RadarAxis, RadarLabels, RadarArea } from "@bklitui/ui/charts";

const metrics = [
  { key: "speed", label: "Speed" },
  { key: "power", label: "Power" },
  { key: "technique", label: "Technique" },
];

const data = [
  { label: "Player A", color: "#3b82f6", values: { speed: 85, power: 70, technique: 90 } },
  { label: "Player B", color: "#f59e0b", values: { speed: 65, power: 95, technique: 60 } },
];

export default function PerformanceRadar() {
  return (
    <RadarChart data={data} metrics={metrics} size={400}>
      <RadarGrid />
      <RadarAxis />
      <RadarLabels />
      {data.map((item, index) => (
        <RadarArea key={item.label} index={index} />
      ))}
    </RadarChart>
  );
}
```

## Components

### RadarChart

The root container that provides context to all children.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `RadarData[]` | required | Array of data series |
| `metrics` | `RadarMetric[]` | required | Metrics to display |
| `size` | `number` | auto | Fixed size in pixels |
| `levels` | `number` | `5` | Number of grid circles |
| `margin` | `number` | `60` | Margin around chart |
| `animate` | `boolean` | `true` | Enable animations |
| `hoveredIndex` | `number \| null` | - | Controlled hover state |
| `onHoverChange` | `(index: number \| null) => void` | - | Hover callback |
| `className` | `string` | `""` | Additional CSS class |

### RadarGrid

Renders the circular grid lines (spider web pattern).

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `showLabels` | `boolean` | `true` | Show level value labels |
| `className` | `string` | `""` | Additional CSS class |

### RadarAxis

Renders axis lines from center to each metric.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | `""` | Additional CSS class |

### RadarLabels

Renders metric labels around the perimeter.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `offset` | `number` | `24` | Distance from chart edge |
| `fontSize` | `number` | `11` | Font size for labels |
| `interactive` | `boolean` | `false` | Enable hover effects on labels |
| `className` | `string` | `""` | Additional CSS class |

### RadarArea

Renders a single data polygon with hover effects.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `index` | `number` | required | Index in the data array |
| `color` | `string` | from data | Optional color override |
| `showPoints` | `boolean` | `true` | Show data point circles |
| `showGlow` | `boolean` | `true` | Show glow effect on hover |
| `className` | `string` | `""` | Additional CSS class |

## Data Shape

```ts
interface RadarMetric {
  key: string;    // Unique identifier
  label: string;  // Display label
}

interface RadarData {
  label: string;                    // Series label
  color: string;                    // Series color
  values: Record<string, number>;   // metric key -> value (0-100)
}
```

See the [charts gallery](/charts/radar-chart) for minimal styles, legend sync, and layout variations.

## Theming

`RadarGrid` and `RadarAxis` stroke defaults use `radarCssVars.border` → **`var(--border)`** — the same token as ring tracks and gauge inactive notches. Override `--border` in your theme or pass a custom `stroke` prop.

Series fill colors default to `--chart-1` through `--chart-5` via `defaultRadarColors`.

## Hooks

### useRadar

Access the radar context from any child component:

```tsx
import { useRadar } from "@bklitui/ui/charts";

function CustomComponent() {
  const {
    data,
    metrics,
    radius,
    hoveredIndex,
    setHoveredIndex,
    getPointPosition,
  } = useRadar();
  // ...
}
```

## Animation

The radar chart features a multi-phase animation on mount:

1. **Grid Expansion** - Concentric circles scale in from center
2. **Axis Growth** - Lines grow outward from center
3. **Label Fade** - Metric labels fade in
4. **Area Expansion** - Data polygons animate from center to values

All animations use spring physics for natural motion. Hover interactions are instant with no delays.

## Dependencies

```bash
pnpm add @visx/group @visx/responsive @visx/scale @visx/shape motion
```
