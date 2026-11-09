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
| `ScatterChart` | `Scatter` | `XAxis` | colors default to `--chart-1…5` in child order; solid dots + opacity hover dim by default (rings via `strokeWidth`, blur via `inactiveMode="blur"`); `jitter` on the root spreads points that share a date (hover snaps to the nearest point; crosshair off by default); `formatXLabel` formats axis labels |
| `CandlestickChart` | `Candlestick` | `XAxis` | |
| `LiveLineChart` | `LiveLine` | `LiveXAxis`, `LiveYAxis` | never `Line` / `XAxis` |
| `PieChart` | `PieSlice` per item, or one `PieTicks` (tick ring) | — | `PieCenter` for a center stat (`valueDisplay="percent"` for shares) |
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

## Gauge

`Gauge` is one component configured by props — no children except `<defs>` content (`PatternPreset`, gradients) referenced by `url(#id)`. `value` is always **0–100**; map real units yourself (`value={(reading / max) * 100}`) and show the reading in `centerValue` (+ `defaultLabel`, `prefix`/`suffix`, `formatOptions`).

Arc-only dial props (ignored by `orientation="linear"`); each takes `true` for defaults or an options object. Sizes noted as "fraction" are relative to the gauge's smaller side.

| Prop | Shape | Notes |
|---|---|---|
| `arcStyle` | `"notches"` (default) \| `"solid"` \| `"none"` | `arcThickness` (fraction, default `0.035`) for `solid`; `none` drops the track so a sector / ring / dots carry the value |
| `ruler` | `{ position: "inside"\|"outside", ticks: 50, majorEvery: 5, color, majorLength, minorLength, gap, highlightActive: true, labels }` | `labels`: `true`/`"majors"`, `"ends"`, or `{ show, min, max, format, color }` (label domain defaults 0–100) |
| `needle` | `true` (= `"gradient"`) \| `"line"\|"gradient"\|"triangle"\|"polygon"` \| `{ variant, color, width, length: 0.55, pivot, tip }` | `tip`: `"inner"` (default, inside the track), `"outer"` (track edge), `"edge"` (past ring / zone band / outside ruler) |
| `zones` + `zoneDisplay` | `{ from, to, color }[]` on 0–100 · `"band"` (default) \| `"fill"` \| `"both"` | `fill` recolours lit notches / the solid fill inside each zone |
| `sector` | `{ gradient: "conic"\|"radial"\|"none", color, opacity: 0.85, innerRadius }` | `none`/`radial` accept any SVG paint incl. `url(#pattern)`; starts at the center disc edge when `centerDisc` is on |
| `progressRing` | `{ color, trackColor, trackOpacity, width, gap }` | thin value ring outside the track |
| `dots` | `{ rings: 5, spacing, radius, color, dimOpacity, litOpacity, fadeInward }` | concentric dot rings lighting up to the value |
| `glow` | `{ blur: 6, intensity: 0.8 }` | on lit notches, solid arc and progress ring |
| `centerDisc` | `{ radius: 0.19, fill, stroke, strokeOpacity, strokeWidth }` | ringed disc behind the label |

Outer layers (progress ring → zone band → outside ruler) reserve space from the outside in and the track shrinks to fit — don't hand-tune radii. Option types (`GaugeRulerOptions`, `GaugeNeedleOptions`, `GaugeZone`, `GaugeSectorOptions`, …) are exported from the installed `gauge.tsx`.

```tsx
import { Gauge } from "@/components/charts/gauge";

<Gauge
  value={(speed / 260) * 100}
  centerValue={speed}
  defaultLabel="km/h"
  totalNotches={90}
  spacing={35}
  notchLengthPercent={55}
  glow
  zones={[{ from: 78, to: 100, color: "var(--destructive)" }]}
  zoneDisplay="fill"
  ruler={{ position: "outside", ticks: 26, majorEvery: 2, highlightActive: false }}
  needle={{ variant: "triangle", tip: "outer" }}
/>
```

Animation is built in (see [animation.md](./animation.md#gauge)) — don't wrap it in your own tween.

## Multi-series

One series child per `dataKey`. Distinguish them with `stroke`/`fill` set to `var(--chart-1)` … `var(--chart-5)` (see [theming.md](./theming.md)). Add a `Legend` (see [overlays.md](./overlays.md)) when there are 2+ series.
