---
title: Projection Line
description: Forecast segment extending a line series past the last data point — dashed stroke, gradient, and horizon marker
---

import { studioLineReferenceProjectionHref } from "@bklitui/studio";
import {
  buildProjectionPath,
  ChartTooltip,
  Grid,
  Line,
  LineChart,
  LineSeriesTerminalMarker,
  ProjectionLine,
  XAxis,
} from "@bklitui/ui/charts";
import {
  ProjectionLineDemo,
  ProjectionLineGradientDemo,
} from "@/components/docs/projection-line-demo";
import { OpenInStudioButton } from "@/components/docs/open-in-studio-button";

<ComponentPreview registryName="projection-line">
  <ProjectionLineDemo />
</ComponentPreview>

## Installation

<InstallationTabs name="projection-line" dependencies={["@visx/shape", "motion"]} />

## Usage

`ProjectionLine` draws a segment from the last data row (the anchor) into the future. It renders outside the series reveal clip so the horizon stays visible while the main line animates in.

Build the path with `buildProjectionPath`, or pass manual `{ date, value }[]` points. Pair with [`LineSeriesTerminalMarker`](/docs/utility/projection-line#terminal-marker) at the anchor when you want a ring at the hand-off.

```tsx
import {
  buildProjectionPath,
  ChartTooltip,
  Grid,
  Line,
  LineChart,
  LineSeriesTerminalMarker,
  ProjectionLine,
  XAxis,
} from "@bklitui/ui/charts";

const projectionPath = buildProjectionPath({
  sourceData: chartData,
  seriesKey: "value",
  mode: "target",
  pathDensity: "endpoints",
  horizonPoints: 6,
  endValue: 301,
});

<LineChart data={chartData}>
  <Grid horizontal />
  <Line dataKey="value" strokeWidth={2} />
  <LineSeriesTerminalMarker dataKey="value" />
  <ProjectionLine
    data={projectionPath}
    strokeDasharray="1,4"
    curveKind="bezier"
    strokeStyle="gradient"
    gradientStart="oklch(0.979 0.037 110.273)"
    gradientEnd="oklch(0.59 0.17 166.38)"
    showEndMarker
  />
  <XAxis />
  <ChartTooltip />
</LineChart>
```

The chart extends its x-domain to fit the projection horizon. Projections are intended for line charts without [brush zoom](/docs/utility/brush) — the two features are not supported together.

## ProjectionLine props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `ProjectionPoint[]` | required | Anchor + horizon points (`{ date, value }`) |
| `yAxisId` | `string \| number` | `"left"` | Y-scale group id |
| `stroke` | `string` | `var(--chart-3)` | Solid stroke color |
| `strokeStyle` | `"solid" \| "gradient"` | `"solid"` | Solid or path-aligned gradient stroke |
| `gradientStart` | `string` | `stroke` | Gradient start when `strokeStyle` is `"gradient"` |
| `gradientEnd` | `string` | `var(--chart-5)` | Gradient end when `strokeStyle` is `"gradient"` |
| `strokeWidth` | `number` | `2` | Stroke width |
| `curveKind` | `"linear" \| "bezier"` | `"linear"` | Straight segment or horizontal-tangent S-curve |
| `strokeDasharray` | `string` | `"6,4"` | Dash pattern |
| `strokeOpacity` | `number` | `1` | Stroke opacity |
| `showEndMarker` | `boolean` | `true` | Horizon endpoint dot (`ProjectionLineEndMarker`) |
| `endpointRadius` | `number` | `5` | Horizon marker radius |

## buildProjectionPath

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `sourceData` | `Record<string, unknown>[]` | required | Chart rows |
| `seriesKey` | `string` | required | Y value key |
| `xDataKey` | `string` | `"date"` | X value key |
| `mode` | `"auto" \| "target" \| "manual"` | required | How future points are generated |
| `autoMethod` | `"linearRegression" \| "lastSegment"` | `"linearRegression"` | Slope for `mode="auto"` |
| `pathDensity` | `"stepped" \| "endpoints"` | `"endpoints"` | Stepped path vs anchor + end only |
| `horizonPoints` | `number` | `6` | Future intervals for auto/target modes |
| `endValue` | `number` | — | Target Y when `mode="target"` |
| `points` | `ProjectionPoint[]` | — | Manual path when `mode="manual"` |
| `startIndex` | `number` | last row | Anchor row index |

## Terminal marker

`LineSeriesTerminalMarker` renders a hollow ring at the last data point for the given `dataKey`. It fades in after the clip reveal completes.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `dataKey` | `string` | required | Series to anchor |
| `yAxisId` | `string \| number` | `"left"` | Y-scale group id |
| `fill` | `string` | `transparent` | Dot fill |
| `stroke` | `string` | `var(--chart-1)` | Ring color |
| `radius` | `number` | `5` | Dot radius |
| `ringGap` | `number` | `0` | Gap between dot and ring |
| `strokeWidth` | `number` | `1.5` | Ring stroke width |

## Studio

<div className="not-prose mb-3 flex items-center justify-between gap-4">
  <h3 className="m-0 font-semibold text-foreground text-base tracking-tight">
    Edit in Studio
  </h3>
  <OpenInStudioButton
    href={studioLineReferenceProjectionHref()}
    slug="line-chart"
  />
</div>

Open [Studio with a projection](/studio?chart=line-chart) and use **Settings → Projections** or the series context menu to add a projection line. Tune stroke, dash, curve, and terminal marker in the layers panel.

## Examples

### Auto forecast with terminal marker

<ComponentShowcase code={`<LineChart data={chartData}>
  <Grid horizontal />
  <Line dataKey="value" strokeWidth={2} />
  <LineSeriesTerminalMarker dataKey="value" />
  <ProjectionLine
    data={projectionPath}
    strokeDasharray="6,4"
    curveKind="bezier"
    showEndMarker
  />
  <XAxis />
  <ChartTooltip />
</LineChart>`}>
  <ProjectionLineDemo />
</ComponentShowcase>

### Gradient stroke

<ComponentShowcase code={`  <ProjectionLine
    data={projectionPath}
    strokeStyle="gradient"
    gradientStart="oklch(0.926 0.128 16.866 / 0.73)"
    gradientEnd="oklch(0.849 0.232 16.498)"
    curveKind="bezier"
    strokeDasharray="1,4"
  />`}>
  <ProjectionLineGradientDemo />
</ComponentShowcase>

## Gallery

See **Projection** on the [line chart gallery](/charts/line-chart).
