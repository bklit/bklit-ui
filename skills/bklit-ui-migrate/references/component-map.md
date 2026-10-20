# Component map: Recharts → bklit

Every bklit name below is an export of the file the `@bklit/<slug>` registry item copies into the user's project (`target` in the registry JSON). Paths assume the default shadcn alias `@/components` — check `aliases.components` in `components.json` and adjust. **Never import from `@bklitui/ui/charts`** (that is the private monorepo package).

Docs: `https://bklit.com/docs/components/<slug>`.

## Chart roots

| Recharts | bklit export | Install | Import from | Notes |
|---|---|---|---|---|
| `LineChart` | `LineChart` | `@bklit/line-chart` | `@/components/charts/line-chart` | Time x only. `xDataKey` default `"date"`; values may be `Date`, ISO string or epoch ms (`new Date(value)`). |
| `AreaChart` | `AreaChart` | `@bklit/area-chart` | `@/components/charts/area-chart` | Time x only. No area stacking. |
| `BarChart` | `BarChart` | `@bklit/bar-chart` | `@/components/charts/bar-chart` | Categorical x. `xDataKey` default `"name"`. `stacked`, `orientation`. Value domain starts at 0. |
| `ComposedChart` | `ComposedChart` | `@bklit/composed-chart` | `@/components/charts/composed-chart` | Time x only. Children: `Line`, `Area`, `SeriesBar`. Installs line-chart, area-chart, y-axis too. |
| `ScatterChart` | `ScatterChart` | `@bklit/scatter-chart` | `@/components/charts/scatter-chart` | Time x only (`xDataKey` default `"date"`); y domain `[0, max*1.1]`. |
| `PieChart` + `Pie` | `PieChart` (data on root) | `@bklit/pie-chart` | `@/components/charts/pie-chart` | `data: PieData[]` = `{ label, value, color?, fill? }[]`. |
| `RadarChart` | `RadarChart` | `@bklit/radar-chart` | `@/components/charts/radar-chart` | `metrics: {key,label}[]`, `data: {label, color?, values: Record<key, 0-100>}[]`. |
| `RadialBarChart` | `RingChart` | `@bklit/ring-chart` | `@/components/charts/ring-chart` | `data: { label, value, maxValue, color? }[]` — progress rings. |
| `RadialBarChart` (one value) | `Gauge` | `@bklit/gauge-chart` | `@/components/charts/gauge` | `value` 0–100, notched arc or linear. |
| `FunnelChart` + `Funnel` | `FunnelChart` | `@bklit/funnel-chart` | `@/components/charts/funnel-chart` | `data: { label, value, displayValue?, color? }[]`. |
| `Sankey` | `SankeyChart` | `@bklit/sankey-chart` | `@/components/charts/sankey` | Same `{ nodes: [{name}], links: [{source, target, value}] }` shape. |
| `SunburstChart` (Recharts 3) | `SunburstChart` | `@bklit/sunburst-chart` | `@/components/charts/sunburst-chart` | Hierarchical `SunburstNode` data. |
| `Treemap` | — | — | — | No equivalent. Keep Recharts (see `rules/gaps.md`). |
| `ResponsiveContainer` | — (remove) | — | — | Every bklit root measures its parent (`ParentSize`). Use `aspectRatio` or a sized wrapper. |

## Series

| Recharts | bklit | Import from | Notes |
|---|---|---|---|
| `Line` | `Line` | `@/components/charts/line-chart` (re-export) or `@/components/charts/line` | `dataKey`, `stroke`, `strokeWidth` (2.5), `curve` (`curveNatural`), `yAxisId`. |
| `Area` | `Area` | `@/components/charts/area-chart` (re-export) or `@/components/charts/area` | `fill`, `fillOpacity` (0.4), `gradientToOpacity` (0), `stroke`, `curve` (`curveMonotoneX`). |
| `Bar` in `BarChart` | `Bar` | `@/components/charts/bar` | `fill`, `lineCap` (`"round"`), `groupGap` (4), `yAxisId`. |
| `Bar` in `ComposedChart` | `SeriesBar` | `@/components/charts/series-bar` | `fill`, `radius` (0), `fadedOpacity` (0.3). |
| `Scatter` | `Scatter` | `@/components/charts/scatter-chart` (re-export) or `@/components/charts/scatter` | `dataKey` is the **y** key; `fill`, `radius` (5). |
| `Pie` | — (props move to `PieChart`) | — | `innerRadius`, `padAngle`, `cornerRadius`, `startAngle`, `endAngle` on `PieChart`. |
| `Cell` | `PieSlice` | `@/components/charts/pie-slice` | One `<PieSlice index={i} />` per row; colour from `data[i].color` or `PieSlice color`. |
| `Radar` | `RadarArea` | `@/components/charts/radar-area` | `index` into `data`; `color`, `showPoints`, `showStroke`, `showGlow`. |
| `RadialBar` | `Ring` | `@/components/charts/ring` | One `<Ring index={i} />` per row; `lineCap`. |
| `Funnel` | — (data on `FunnelChart`) | — | |

## Axes, grid, chrome

| Recharts | bklit | Install | Import from | Notes |
|---|---|---|---|---|
| `CartesianGrid` | `Grid` | included with line/area/bar/composed/scatter | `@/components/charts/grid` | `horizontal` (true), `vertical` (false), dashed `"4,4"` by default. |
| `XAxis` (time charts) | `XAxis` | included (`@bklit/x-axis`) | `@/components/charts/x-axis` | `numTicks` (5), `tickMode` (`"data"`). Labels fixed `"MMM d"`. |
| `XAxis` (`BarChart`) | `BarXAxis` | included in bar-chart | `@/components/charts/bar-x-axis` | Category labels; `maxLabels` (12), `showAllLabels`. |
| `YAxis` (value) | `YAxis` | `@bklit/y-axis` (not bundled with line/area/bar) | `@/components/charts/y-axis` | `formatValue`, `numTicks`, `yAxisId`, `orientation`. |
| `YAxis` category (`layout="vertical"`) | `BarYAxis` | included in bar-chart | `@/components/charts/bar-y-axis` | Use with `BarChart orientation="horizontal"`. |
| `PolarGrid` + `PolarRadiusAxis` | `RadarGrid` | included | `@/components/charts/radar-grid` | `showLabels` prints 20/40/…/100. |
| `PolarAngleAxis` | `RadarLabels` (+ `RadarAxis` spokes) | included | `@/components/charts/radar-labels`, `@/components/charts/radar-axis` | |
| `Tooltip` (cartesian) | `ChartTooltip` | included (`@bklit/chart-tooltip`) | `@/components/charts/tooltip` | `rows`, `content`, `showCrosshair`, `showDots`, `showDatePill`. |
| `Tooltip` (pie / ring) | `PieCenter` / `RingCenter` | included | `@/components/charts/pie-center`, `@/components/charts/ring-center` | Hovered slice shows in the centre. |
| `Tooltip` (sankey) | `SankeyTooltip` | included | `@/components/charts/sankey` | |
| `Legend` | `Legend` + `LegendItem` + `LegendMarker` + `LegendLabel` (+ `LegendValue`) | `@bklit/legend` | `@/components/charts/legend` | HTML, rendered **outside** the chart root. Exported as `LegendItem` here (the monorepo alias `LegendItemComponent` does not exist in the registry file). |
| `ReferenceArea` | `ReferenceArea` | `@bklit/reference-area` | `@/components/charts/reference-area` | `x1`, `x2` (`Date \| number`), `y1`, `y2`, `fill`, `fillOpacity`, `stroke`, `strokeStyle`. |
| `Area dataKey={[lo, hi]}` (range / BandedChart) | `Band` | `@bklit/line-chart` | `@/components/charts/band` | Split the range into two keys: `upperKey`, `lowerKey`. Inside `LineChart`, before the `Line`. Not in tooltip. |
| `ReferenceLine y={v}` | `Grid highlightRowValues={[v]}` | — | grid | Or a thin `ReferenceArea y1 y2`. |
| `ReferenceDot` | `ChartMarkers` (approximation) | `@bklit/markers` | `@/components/charts/markers` | Date-anchored icon markers `{ date, icon, title }`, not an (x, y) dot. |
| `Brush` | `ChartBrush` + `ChartBrushLayout` | **not in any registry item** | — | Source exists in bklit; not installable via shadcn. Treat as a gap. |
| `defs > linearGradient` | `Area` built-in gradient, or a gradient child + `fill="url(#id)"` | — | — | See `prop-map.md`. |
| `LabelList`, `Label` (cartesian), `ErrorBar`, `Customized`, `ZAxis` | — | — | — | See `rules/gaps.md`. |

## shadcn wrapper (`components/ui/chart.tsx`)

| shadcn | bklit |
|---|---|
| `ChartContainer config className` | Remove. `className` → wrapper `div` or chart root `className`/`aspectRatio`. |
| `ChartConfig` | Keep as a plain object if you like; read `label`/`color` into series props, `rows`, `Legend items`. |
| `ChartTooltip content={<ChartTooltipContent />}` | `ChartTooltip rows={…}` from `@/components/charts/tooltip`. |
| `ChartLegend content={<ChartLegendContent />}` | `Legend items={…}` from `@/components/charts/legend`. |
| `var(--color-<key>)` | The config colour itself, e.g. `var(--chart-1)` (`--color-*` only exists inside `ChartContainer`). |

Full walkthrough: `shadcn-chart.md`.

## Registry slugs this skill installs

`line-chart`, `area-chart`, `bar-chart`, `composed-chart`, `scatter-chart`, `pie-chart`, `radar-chart`, `ring-chart`, `gauge-chart`, `funnel-chart`, `sankey-chart`, `sunburst-chart`, `y-axis`, `legend`, `reference-area`, `markers`.

Auto-included dependencies: line/area/scatter pull `grid`, `x-axis`, `chart-tooltip`; bar-chart pulls `grid`, `chart-tooltip` and ships `bar-x-axis`/`bar-y-axis`; composed-chart pulls line-chart, area-chart, `y-axis`.
