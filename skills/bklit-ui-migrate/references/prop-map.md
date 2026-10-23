# Prop map: Recharts → bklit

Defaults quoted are bklit source defaults. "—" means no equivalent: see `rules/gaps.md` before inventing anything.

## Chart roots (`LineChart`, `AreaChart`, `BarChart`, `ComposedChart`, `ScatterChart`)

| Recharts | bklit | Notes |
|---|---|---|
| `data` | `data` | Same row objects. Bar/Line/Area/Scatter series read `row[dataKey]` as a number. Non-numbers plot as 0 — there is no gap / `connectNulls` support. |
| `XAxis dataKey` | root `xDataKey` | Line/Area/Composed/Scatter default `"date"`; Bar default `"name"`. |
| x values (time charts) | `Date`, ISO string or epoch ms | The shell does `value instanceof Date ? value : new Date(value)`. `"2024-04-01"` parses as **UTC midnight** → shows as Mar 31 west of UTC. Use `new Date(\`${d}T00:00:00\`)` for local days. Rows must be sorted by x (hover uses a bisector). |
| `width` / `height` | — | Roots fill their parent's width. Height comes from `aspectRatio` (default `"2 / 1"`) or from `className="h-[250px]"` (explicit width + height override aspect-ratio). `PieChart`, `RadarChart`, `RingChart` take `size` (px) or are `aspect-square w-full`. |
| `ResponsiveContainer` | — | Delete it; keep a sized wrapper if the old one set `height`. |
| `margin` | `margin` (`Partial<{top,right,bottom,left}>`) | Default **40** on every side (axis labels render in the margin). Copying a Recharts `margin={{ left: 0 }}` can clip `YAxis` labels. `RadarChart margin` is a single number (60). |
| `layout="vertical"` (BarChart) | `orientation="horizontal"` | Inverted naming. Categories go on `BarYAxis`; widen `margin.left` (~80) for labels. |
| `layout="vertical"` (other charts) | — | Keep Recharts. |
| `stackOffset` | — | Pre-normalise data. |
| `syncId` | — | No cross-chart hover sync. |
| `barSize` (BarChart) | `barWidth` (px) | Replaces the band width: bars (and `BarYAxis` labels) start at the band's leading edge instead of centring. Prefer tuning `barGap`. |
| `barSize` / `maxBarSize` (ComposedChart) | `barSize` / `maxBarSize` | ComposedChart only. |
| `barCategoryGap` | `barGap` (0–1 fraction of band, default 0.2) | `"20%"` → `0.2`. |
| `barGap` (px between grouped bars) | `Bar groupGap` (px, default 4) | On each `Bar`. ComposedChart: root `barGap` (px, default 4). |
| `stackId` on every `Bar` | root `stacked` (+ `stackGap` px) | One stack per chart, in child order. Multiple stack groups: gap. |
| `stackId` on `Area` | — | No area stacking. Workaround in `rules/gaps.md`. |
| `onClick`, `onMouseMove` | — | No per-datum click props on cartesian series. `PieChart`, `RingChart`, `RadarChart`, `FunnelChart` expose `hoveredIndex` / `onHoverChange`. |
| (animation) | `animationDuration` (ms, default 1100), `animationEasing` | `animationDuration={0}` disables the reveal. |

## Series

| Recharts | bklit | Notes |
|---|---|---|
| `type="linear"` (Recharts default) | `curve={curveLinear}` | Recharts' default is **linear**; bklit `Line` defaults to `curveNatural`, `Area` to `curveMonotoneX`. Set `curve` explicitly for parity. |
| `type="monotone"` | `curve={curveMonotoneX}` | `import { curveMonotoneX } from "@visx/curve"` (installed with line/area-chart). |
| `type="natural"` | `curve={curveNatural}` | |
| `type="step"` / `"stepBefore"` / `"stepAfter"` | `curveStep` / `curveStepBefore` / `curveStepAfter` | `@visx/curve`. |
| `type="basis"` / `"cardinal"` / `"monotoneY"` | `curveBasis` / `curveCardinal` / `curveMonotoneY` | `@visx/curve`. |
| `type="bump"` / `"bumpX"` | `curveBumpX` | Not in `@visx/curve` — `import { curveBumpX } from "d3-shape"` (installed with line/area-chart). |
| `stroke`, `strokeWidth` | `stroke`, `strokeWidth` | Line default stroke `var(--chart-line-primary)`, width 2.5; Area width 2. |
| (hard line ends) | `Line fadeEdges={false}` | bklit `Line` fades its stroke at both chart edges by default (`fadeEdges` true; `Area` default false). |
| `fill` (Area) | `fill` | Colour for the built-in vertical gradient (or a `url(#id)`; then also set `stroke`). |
| `fillOpacity` (Area) | `fillOpacity` (top stop, default 0.4) + `gradientToOpacity` (bottom stop, default 0) | Flat Recharts fill → set both to the same value. |
| `fill` (Bar) | `fill` | Colour, `url(#gradient)` or pattern url; set `stroke` for the tooltip dot when `fill` is a url. |
| `radius={4}` (Bar) | `lineCap={4}` | `lineCap`: `"round"` (default, radius `min(width/2, 8)`), `"butt"` (square), or a px number. Rounds **all four** corners; `[4,4,0,0]` has no exact match. Stacked without `stackGap`: only the last series is rounded. |
| no `radius` (square Recharts bars) | `lineCap="butt"` | bklit bars are rounded by default. |
| `radius` (Bar in ComposedChart) | `SeriesBar radius` (default 0) | |
| `minPointSize` (Bar) | `minBarHeight` | Non-stacked vertical bars. |
| `dot` (Line default **true**) | `showMarkers` (default false) + `markers={{ radius, fill, stroke, strokeWidth }}` | `dot={false}` → omit. |
| `activeDot={false}` | `ChartTooltip showDots={false}` | |
| `activeDot={{ r: 6 }}` | `ChartTooltip dotSize={6}` | `dotVariant="ring"` for hollow. |
| `strokeDasharray` (Line) | `dashFromIndex={0}` + `dashArray="6,4"` | `dashFromIndex={n}` dashes from row n onward (projections). |
| `isAnimationActive={false}` | `animate={false}` on the series | Also consider root `animationDuration={0}`. |
| `animationDuration` (series) | root `animationDuration` | |
| `name` | `ChartTooltip rows` labels / `Legend items` | Default tooltip label is the `dataKey`. |
| `unit` | format inside `rows` / `YAxis formatValue` | |
| `yAxisId` | `yAxisId` (Line, Area, Bar, Scatter) | Default `"left"`; pair with `YAxis yAxisId`. |
| `hide` | render conditionally | |
| `connectNulls` | — | Non-numbers plot at 0: filter or interpolate rows. |
| `label`, `LabelList` | — | Gap. |
| `shape` (custom renderer) | — | Gap → keep Recharts. |
| `data` on `<Scatter>` / `<Line>` | merge into root `data` | bklit series only take `dataKey`. |

## Axes and grid

| Recharts | bklit | Notes |
|---|---|---|
| `CartesianGrid` (both directions) | `<Grid horizontal vertical />` | `vertical` default false. |
| `CartesianGrid vertical={false}` | `<Grid horizontal />` | |
| `CartesianGrid` solid lines | `strokeDasharray="0"` | bklit default `"4,4"`. `"3 3"` → `"3,3"`. |
| `CartesianGrid stroke` | `stroke` (default `var(--chart-grid)`) | Grid rows fade at the edges (`fadeHorizontal`, default true); set `false` for parity. |
| `XAxis tickCount` / `interval` | `XAxis numTicks` (5) / `BarXAxis maxLabels` (12) | |
| `XAxis tickFormatter` | — | Time labels are fixed `"MMM d"` (`en-US`); `BarXAxis` prints the category string — reshape the data (e.g. `"January"` → `"Jan"`) instead. |
| `XAxis hide` / `YAxis hide` | omit the axis | bklit renders no axis unless you add one. |
| `XAxis angle` | — | |
| `XAxis type="number"` | — (time charts) | Workaround in `rules/gaps.md`. |
| `YAxis tickFormatter` | `YAxis formatValue` | Default `formatLargeNumbers` (`1000` → `1k`). |
| `YAxis tickCount` | `YAxis numTicks` (5, hint) | |
| `YAxis orientation="right"` | `YAxis orientation="right"` | Add `margin={{ right: 56 }}`-ish. |
| `YAxis width` | root `margin.left` / `margin.right` | |
| `YAxis domain` | — | Auto: `[0, max × 1.1]` niced for non-negative data, `[min − 5 %, max + 5 %]` otherwise (Line/Area/Composed). Bar and Scatter always start at 0. |
| `YAxis` category axis (`layout="vertical"`) | `BarYAxis` | `maxLabels` (20), `showAllLabels` (true). |

## Tooltip (`ChartTooltip` from `@/components/charts/tooltip`)

| Recharts | bklit | Notes |
|---|---|---|
| `<Tooltip />` | `<ChartTooltip />` | Crosshair, per-series dots, date pill, floating panel. |
| `cursor={false}` | `showCrosshair={false}` | |
| `cursor={{ stroke }}` | `indicatorColor` (string or `(point) => string`) | `indicatorDasharray` for dashes. |
| `formatter`, series `name` | `rows={(point) => [{ color, label, value }]}` | `value: string \| number`. **Order rows like the series children** — row *i* also colours series *i*'s hover dot. |
| `labelFormatter` | — / `content` | Title is fixed (`"EEE, MMM d"` for time, category for bars). Use `content` for a custom title. |
| `content={<Custom />}` | `content={({ point, index }) => …}` | Render function, not an element. |
| `contentStyle` / `wrapperStyle` | `className`, `panelStyle`, `backgroundColor` | |
| (x label pill) | `showDatePill` (default true) | Set `false` when x is not a real date. |

Passing `rows`/`content` functions requires the file to be a client component (`"use client"`).

## Pie / donut

| Recharts | bklit | Notes |
|---|---|---|
| `<Pie data dataKey nameKey>` | `PieChart data={rows.map(r => ({ label: r[nameKey], value: r[dataKey], color }))}` | |
| `<Cell fill>` | `color` on the data row, or `<PieSlice index={i} color=… />` | Without colours the palette is `var(--chart-1…5)`. |
| `innerRadius` (px) | `innerRadius` (px) | `"60%"` → compute from `size`. |
| `outerRadius`, `cx`, `cy` | — | Radius comes from `size`/container minus `hoverOffset` (10). |
| `paddingAngle` (degrees) | `padAngle` (radians) | `deg * Math.PI / 180`. |
| `cornerRadius` | `cornerRadius` | |
| `startAngle` / `endAngle` (degrees, 0 = 3 o'clock, counter-clockwise) | `startAngle` / `endAngle` (radians, 0 = 12 o'clock, clockwise) | `rad = (90 - deg) * Math.PI / 180`. Half donut `180 → 0` becomes `-Math.PI / 2 → Math.PI / 2`. Prefer `Gauge` for a half-ring KPI. |
| `activeShape` / `activeIndex` | `PieSlice hoverEffect` (`"translate"` default, `"grow"`, `"none"`), `PieChart hoveredIndex` | |
| centre `<Label>` | `<PieCenter defaultLabel prefix suffix formatOptions>` or `children={({ value, label, isHovered }) => …}` | Shows total, then hovered slice. |
| `<Tooltip>` | `PieCenter` | No floating tooltip on pies. |
| `label` / `labelLine` | — | Use `PieCenter` + `Legend`. |

## Radar

| Recharts | bklit |
|---|---|
| rows `{ subject, a, b }` | `metrics = rows.map(r => ({ key: slug(r.subject), label: r.subject }))` |
| `<Radar dataKey="a" name="A" fill>` | `data[i] = { label: "A", color, values: { [metric.key]: (r.a / max) * 100 } }` + `<RadarArea index={i} />` |
| `PolarRadiusAxis domain={[0, max]}` | normalise by that `max`; `RadarGrid` labels read 20…100 |
| `PolarGrid` | `<RadarGrid />` (`levels` on root, default 5) |
| `PolarAngleAxis` | `<RadarAxis />` (spokes) + `<RadarLabels />` |
| `fillOpacity` on `Radar` | — (not configurable on `RadarArea`) |

## Radial bar → Ring / Gauge

| Recharts | bklit |
|---|---|
| `RadialBar` rows `{ name, value, fill }` + `PolarAngleAxis domain={[0, max]}` | `RingChart data={rows.map(r => ({ label: r.name, value: r.value, maxValue: max, color: r.fill }))}` + `<Ring index={i} />` per row |
| `innerRadius`/`barSize` | `baseInnerRadius` (60) / `strokeWidth` (12) / `ringGap` (6) |
| centre label | `<RingCenter defaultLabel />` |
| single 0–100 KPI | `<Gauge value={pct} centerValue={pct} defaultLabel="…" />` |

## Funnel / Sankey

| Recharts | bklit |
|---|---|
| `<Funnel data dataKey nameKey>` + `Cell fill` | `FunnelChart data={rows.map(r => ({ label, value, color }))}`; `orientation` (`"horizontal"` default), `showPercentage`, `showValues`, `showLabels`, `formatValue` |
| `LabelList` on funnel | built-in labels (`showLabels`, `labelLayout`) |
| `<Sankey data nodePadding nodeWidth>` | `<SankeyChart data nodePadding nodeWidth>` + `<SankeyLink /> <SankeyNode /> <SankeyTooltip />` (defaults 24 / 16) |
| `node` / `link` custom renderers | — keep Recharts |

## Tiny charts → sparklines (`LineSparkline`, `AreaSparkline`, `BarSparkline` from `@/components/charts/sparkline`)

Sparklines are single elements: no children, no `Grid`/axes/`ChartTooltip`. Props go on the one component. TanStack Charts equivalents: `tanstack-charts.md`.

| Recharts | bklit sparkline | Notes |
|---|---|---|
| root `data` | `data` | Same rows. Any row shape; x is the row order (no x key, no dates needed). |
| series `dataKey` | `dataKey` | A key or an accessor `(d, i) => number`. One series only. |
| `ResponsiveContainer` / v3 `responsive` / `style={{ width: "100%" }}` | omit `width` | Fills the parent width (one shared `ResizeObserver` for every sparkline). |
| `width` / `height` / `ResponsiveContainer height` / `style.maxHeight` | `width` / `height` (px) | `height` defaults to **32**. Fixed `width` skips measuring. |
| `margin` | `padding` | Number or `{ top, right, bottom, left }`. Defaults 4 (line/area), 2 (bar) so strokes and the hover dot are not clipped. |
| `stroke` (Line/Area) / `fill` (Bar) | `color` | Default `var(--chart-line-primary)`. Use `var(--chart-1)` … tokens. |
| `strokeWidth` | `strokeWidth` (line/area) | Default 1.5. |
| `type="monotone"` / `"natural"` / `"linear"` / `"step"` | `curve="monotone" \| "natural" \| "linear" \| "step"` | A **string** (not `@visx/curve`). Default `"monotone"`; Recharts defaults to linear — set `curve="linear"` for parity. Other types → closest of the four. |
| `Area fill` + `fillOpacity` | `fill="gradient" \| "solid"` + `fillOpacity` | Default `"gradient"` at 0.3 fading to 0. A flat Recharts fill → `fill="solid"` with the same `fillOpacity`. Colour follows `color`. |
| `<defs><linearGradient>` + `fill="url(#…)"` | `fill="gradient"` | Built in; drop the defs. |
| `Bar radius={n}` / `[n, n, 0, 0]` | `barRadius={n}` | Rounds the end away from the baseline. Default 1. |
| `barCategoryGap` / `barGap` | `barGap` (px) | Default 2. |
| `dot={false}` (Line) | (default) | Sparklines never draw per-point dots. `endDot` keeps a dot on the last point. |
| `activeDot={false}` | `dot={false}` | `dot` = the hovered-point dot (default true). |
| `Tooltip cursor={false}` | `crosshair={false}` | `crosshair`: `"dashed"` (default), `"solid"`, `"gradient"`, `false`. |
| `<Tooltip />` | — | No tooltip by design. `const hover = useSparklineHover<Row>()`, spread `hover.sparklineProps`, render `hover.datum` yourself. See `rules/gaps.md`. |
| `syncId` | shared `useSparklineHover()` | Spread the same `sparklineProps` onto several sparklines to sync crosshairs. |
| `Tooltip` `animationDuration` / cursor animation | `hoverTransition`, `springConfig` | Crosshair + dot spring by default (300/30); `hoverTransition={false}` snaps. |
| `animationDuration` (data updates) | `dataTransitionDuration` | Data-change morph, default 500ms; enter animation is separate (`animationDuration`, 900ms). |
| `onMouseMove` / `onMouseLeave` | `onHoverChange(index, datum)` / `hoverIndex` | Controlled hover. `interactive={false}` removes pointer listeners entirely. |
| `isAnimationActive={false}` | `animate={false}` | Enter animation on by default (line draws, area wipes, bars grow); reduced motion becomes a short fade. |
| `animationDuration` / `animationEasing` | `animationDuration` (ms, default 900) / `animationEasing` (CSS easing) | |
| `YAxis domain` (hidden axis) | `yDomain={[min, max]}` | Either end may be `undefined` to use the data. Bars always include 0. |
| `accessibilityLayer` / `aria-label` | `aria-label` | Generated from the data when omitted. |
| `className` / `style` | `className` / `style` | On the wrapper `div`. |
