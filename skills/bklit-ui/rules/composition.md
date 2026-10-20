# Chart Composition

Bklit charts are composable: a root chart owns data, scales, and hover state through React context; everything else is a child that reads that context. Import paths below assume the default `@/components/charts/` location — use the alias from `shadcn info`.

## Root + children

### Incorrect

```tsx
// Children outside the root have no chart context
<div className="h-80">
  <Line dataKey="users" />
  <XAxis />
</div>
```

### Correct

```tsx
import { ChartTooltip } from "@/components/charts/tooltip";
import { Grid } from "@/components/charts/grid";
import { Line, LineChart } from "@/components/charts/line-chart";
import { XAxis } from "@/components/charts/x-axis";

<LineChart data={data}>
  <Grid horizontal />
  <Line dataKey="users" />
  <XAxis />
  <ChartTooltip />
</LineChart>
```

## Child order

`Grid` or `Background` → series → axes → overlays (`ReferenceArea`, `ProjectionLine`, `TrendLine`, `ChartMarkers`) → `ChartTooltip`. Grid first so series paint above it.

## Which pieces go with which root

| Root | Series | X axis | Notes |
|---|---|---|---|
| `LineChart` | `Line` | `XAxis` | `YAxis` needs `@bklit/y-axis` |
| `AreaChart` | `Area` | `XAxis` | same as line |
| `BarChart` | `Bar` | `BarXAxis` / `BarYAxis` | categorical band scale; `xDataKey` is a category key |
| `ComposedChart` | `SeriesBar`, `Line`, `Area` | `XAxis` | `SeriesBar` aligns bars to dates — **not** `Bar` |
| `ScatterChart` | `Scatter` | `XAxis` | colors default to `--chart-1…5` in child order |
| `CandlestickChart` | `Candlestick` | `XAxis` | |
| `LiveLineChart` | `LiveLine` | `LiveXAxis`, `LiveYAxis` | never `Line` / `XAxis` |
| `PieChart` | `PieSlice` per item | — | `PieCenter` for a center stat |
| `RingChart` | `Ring` per item | — | `RingCenter` |
| `RadarChart` | `RadarArea` per item | — | `RadarGrid`, `RadarAxis`, `RadarLabels` |
| `HeatmapChart` | `HeatmapCells` | `HeatmapXAxis`, `HeatmapYAxis` | wrap in `HeatmapInteractionProvider` + `HeatmapInteractionBoundary`; `HeatmapLegend`, `HeatmapTooltip` |
| `SankeyChart` | `SankeyLink`, `SankeyNode` | — | `SankeyTooltip` |
| `ChoroplethChart` | `ChoroplethFeatureComponent` | — | `ChoroplethGraticule`, `ChoroplethTooltip` |
| `SunburstChart` | `SunburstSegment` per arc (`buildArcs`) | — | `SunburstCenter`, `SunburstBreadcrumb`, `SunburstLabels`, `SunburstHint` |
| `Gauge`, `FunnelChart` | standalone | — | configured by props |

Mixing line and bar? Use **one** `ComposedChart`, not two stacked roots.

## Data shapes

- **Line / area / scatter / composed:** array of objects with a `Date` under `xDataKey` (default `"date"`) and numeric fields per `dataKey`.
- **Bar:** array of objects; set `xDataKey` to the category field (`"month"`).
- **Candlestick:** `{ date, open, high, low, close }`.
- **Live line:** `data: { time: unixSeconds, value }[]` **and** `value` (latest value) on the root; `window` is seconds (default 30). Append and trim (`prev.slice(-500)`) instead of rebuilding.
- **Pie:** `{ label, value, color? }[]`. **Ring / legend:** `{ label, value, maxValue?, color }[]`.
- **Radar:** `metrics: { key, label }[]` + `data: { label, color, values: Record<key, number> }[]`.
- **Funnel:** `{ label, value, displayValue? }[]`.
- **Sankey:** `{ nodes: { name, category? }[], links: { source, target, value }[] }` (indices).
- **Choropleth:** a GeoJSON `FeatureCollection` (e.g. `topojson.feature(...)`).
- **Heatmap:** columns `{ bin, bins: { bin, count, date }[] }[]` (one column per week).
- **Sunburst:** a tree `{ name, value?, children? }`.

When unsure, read the installed root component's `Props` interface — it is authoritative.

## Sizing

Cartesian roots default to `aspectRatio="2 / 1"`. In cards use `aspectRatio` or a sized parent (`style={{ height: 240 }}` / `className="h-60"`). Pie/ring/radar take `size`; `Gauge` fills its parent when `width`/`height` are omitted.

## Multi-series

One series child per `dataKey`. Distinguish them with `stroke`/`fill` set to `var(--chart-1)` … `var(--chart-5)` (see [theming.md](./theming.md)). Add a `Legend` (see [overlays.md](./overlays.md)) when there are 2+ series.
