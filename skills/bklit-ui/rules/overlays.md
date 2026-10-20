# Overlays and add-ons

Install each with `npx shadcn@latest add @bklit/<item>` unless noted, then read the installed file for the full prop list. All cartesian overlays are **children of the root chart**.

## Legend — `@bklit/legend`

Standalone (outside the chart). Composable: define one item layout; it maps over `items` (`{ label, value, maxValue?, color }[]`).

```tsx
import { Legend, LegendItem, LegendLabel, LegendMarker, LegendValue } from "@/components/charts/legend";

const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

<RingChart data={data} hoveredIndex={hoveredIndex} onHoverChange={setHoveredIndex}>…</RingChart>
<Legend items={data} hoveredIndex={hoveredIndex} onHoverChange={setHoveredIndex}>
  <LegendItem className="flex items-center gap-3">
    <LegendMarker />
    <LegendLabel className="flex-1" />
    <LegendValue />
  </LegendItem>
</Legend>
```

`LegendProgress` adds a bar against `maxValue`. Docs show `LegendItemComponent` — that alias only exists in the monorepo barrel; in an installed project the export is `LegendItem`.

## Markers — `@bklit/markers`

Event callouts on a time axis. `ChartMarkers` is a **sibling** of `ChartTooltip`, not a child of it; the hover content for markers goes **inside** `ChartTooltip`.

### Incorrect

```tsx
<ChartTooltip>
  <ChartMarkers items={markers} />
</ChartTooltip>
```

### Correct

```tsx
import {
  ChartMarkers,
  MarkerTooltipContent,
  useActiveMarkers,
  type ChartMarker,
} from "@/components/charts/markers";

const markers: ChartMarker[] = [
  { date: new Date("2025-01-05"), icon: "🚀", title: "v1.2.0", description: "New animations" },
];

<LineChart data={data}>
  <Grid horizontal />
  <Line dataKey="users" />
  <ChartMarkers items={markers} />
  <XAxis />
  <ChartTooltip>
    <ActiveMarkers markers={markers} />
  </ChartTooltip>
</LineChart>

// MarkerTooltipContent renders whatever it is given — filter to the hovered date first
function ActiveMarkers({ markers }: { markers: ChartMarker[] }) {
  const active = useActiveMarkers(markers);
  return active.length ? <MarkerTooltipContent markers={active} /> : null;
}
```

## Reference area — `@bklit/reference-area`

Horizontal band between two Y values (target range, threshold). Renders behind series.

```tsx
<ReferenceArea y1={160} y2={220} strokeStyle="dashed" showMarkers />
```

Omit `y1`/`y2` to extend to the plot edge. Also: `x1`/`x2`, `fill`, `fillOpacity`, `pattern`, `axisLabelColor` (tints Y ticks inside the band), `yAxisId`. Works in line, area, bar, scatter, candlestick, composed, and live charts.

## Projection line — `@bklit/projection-line`

Dashed forecast from the last data row into the future (line charts). Build the path with `buildProjectionPath` (`mode: "auto" | "target" | "manual"`) from `@/components/charts/projection-utils`.

```tsx
const path = buildProjectionPath({ sourceData: data, seriesKey: "value", mode: "target", horizonPoints: 6, endValue: 301 });

<LineChart data={data}>
  <Line dataKey="value" />
  <LineSeriesTerminalMarker dataKey="value" />
  <ProjectionLine data={path} strokeDasharray="1,4" showEndMarker />
  <XAxis />
</LineChart>
```

For a dashed tail on **existing** data (incomplete period) use `Line` `dashFromIndex` instead. Projection and brush zoom are not supported together.

## Trend line — `@bklit/trend-line`

Linear least-squares fit of an existing series, drawn from the first to the last data row. Works inside `LineChart`, `AreaChart`, `BarChart` (vertical and `orientation="horizontal"`), and `ComposedChart`. It is an overlay, not a series — it doesn't add a bar slot or drive the y-domain. Place it **after** the series it fits so it paints on top.

```tsx
import { TrendLine } from "@/components/charts/trend-line";

<BarChart data={data} xDataKey="month">
  <Bar dataKey="revenue" />
  <BarXAxis />
  <TrendLine dataKey="revenue" strokeStyle="gradient" fadeEdges />
</BarChart>
```

Defaults: `strokeStyle="dashed"` (`"solid" | "dashed" | "gradient"`), `strokeDasharray="6,4"`, `stroke` = `var(--chart-line-primary)`, `strokeWidth` 2, `gradientStart` = `stroke`, `gradientEnd` = `var(--chart-5)`, `fadeEdges` false (`true`, `"left"`, `"right"`), `fadeEdgesLength` 15 (% of line length per end), `opacity` 1, `animate` true (fades in, tweens on data change), `yAxisId` for dual scales. The fade is a mask along the line, so it composes with gradient and dashed strokes. Needs at least two numeric points; otherwise renders nothing. `computeLinearRegression` / `computeTrendSegment` from `@/components/charts/trend-line-utils` expose the fit for custom labels (slope, etc.).

## Background — `@bklit/background`

Textured plot fill instead of (or with) `Grid`: `<Background pattern="diagonal" />`. Presets: `none`, `diagonal`, `horizontal`, `vertical`, `cross`, `dots`, `circles`, `accent`. Edge fades on by default (`fadeHorizontal`, `fadeVertical`). Pattern design choices → **bklit-ui-design**.

## Axes — `@bklit/x-axis`, `@bklit/y-axis`

`XAxis` comes with line/area/scatter/composed/candlestick. `YAxis` must be added separately for line/area/scatter (`npx shadcn@latest add @bklit/y-axis`); `ComposedChart` and `CandlestickChart` already depend on it. Dual scales: give series `yAxisId` and render one `YAxis` per id. Bar charts use `BarXAxis` / `BarYAxis`.

## Grid — `@bklit/grid`

`<Grid horizontal />` (also `vertical`, `numTicksRows`, `strokeDasharray`). Highlight a baseline with `highlightRowValues={[0]}`. `shimmer` animates it while loading.

## Brush — not in the registry

`ChartBrush` / `ChartBrushLayout` (time-range zoom strip, docs: https://bklit.com/docs/utility/brush) are **not** shipped by any `@bklit/*` item, including `area-chart` and `line-chart`. Don't invent `@bklit/brush` or import `ChartBrush` from `components/charts`. Tell the user it isn't installable yet; the charts do accept `xDomain` / `xDomainSlotCount` / `tweenYDomainOnXDomainChange`, so a custom range control can drive zoom.

## Profit / loss, bar depth, stat flow

- `@bklit/profit-loss-line`: `ProfitLossLine` inside `LineChart`, paired with a transparent `Line` for the same `dataKey`; `Grid highlightRowValues={[0]}`.
- `@bklit/bar-depth`: extruded/3D bars on `BarChart` (`BarDepthProvider`, `BarDepthBack`, `BarDepthFront`) — see **bklit-ui-design**.
- `@bklit/chart-stat-flow`: `ChartStatFlow` animated number for stat cards and chart centers.
