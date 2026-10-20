# Design vocabulary → bklit props

Phrasebook for turning what people say into exact bklit JSX. Every prop and
default below was read from the bklit source (`packages/ui/src/charts`). If a
phrase is not here, read the installed source before guessing — and if no prop
exists, say so (see "Not supported" at the end).

## Where things live after install

Users install with `npx shadcn@latest add @bklit/<slug>`; files land in the
project's `components/charts/` (resolved from the `components` alias). Import
from the **project alias**, never from `@bklitui/ui/charts` (that package is
private to the bklit monorepo).

| Export(s) | Import from | Registry slug |
|---|---|---|
| `AreaChart`, `Area` | `@/components/charts/area-chart` | `@bklit/area-chart` |
| `PatternArea` | `@/components/charts/pattern-area` | `@bklit/area-chart` |
| `AreaChartLoading` | `@/components/charts/area-chart-loading` | `@bklit/area-chart` |
| `LineChart`, `Line` | `@/components/charts/line-chart` | `@bklit/line-chart` |
| `LineChartLoading` | `@/components/charts/line-chart-loading` | `@bklit/line-chart` |
| `ProjectionLine` | `@/components/charts/projection-line` | `@bklit/line-chart` (also `@bklit/projection-line`) |
| `buildProjectionPath` | `@/components/charts/projection-utils` | `@bklit/line-chart` |
| `LineSeriesTerminalMarker` | `@/components/charts/line-series-terminal-marker` | `@bklit/line-chart` |
| `BarChart` | `@/components/charts/bar-chart` | `@bklit/bar-chart` |
| `Bar` | `@/components/charts/bar` | `@bklit/bar-chart` |
| `BarXAxis` / `BarYAxis` | `@/components/charts/bar-x-axis` / `bar-y-axis` | `@bklit/bar-chart` |
| `BarSquares`, `BarColumnTrack` | `@/components/charts/bar-squares` | `@bklit/bar-chart` |
| `BarChartLoading` | `@/components/charts/bar-chart-loading` | `@bklit/bar-chart` |
| `renderPatternPreset` | `@/components/charts/pattern-preset` | `@bklit/bar-chart` or `@bklit/background` |
| `BarDepthBack`, `BarDepthFront`, `BarDepthProvider`, `BarPulse` | `@/components/charts/bar-depth` | `@bklit/bar-depth` |
| `ComposedChart` / `SeriesBar` | `@/components/charts/composed-chart` / `series-bar` | `@bklit/composed-chart` |
| `Grid` | `@/components/charts/grid` | `@bklit/grid` |
| `XAxis` / `YAxis` | `@/components/charts/x-axis` / `y-axis` | `@bklit/x-axis` / `@bklit/y-axis` |
| `ChartTooltip` | `@/components/charts/tooltip` | `@bklit/chart-tooltip` |
| `Background` | `@/components/charts/background` | `@bklit/background` |
| `PatternLines`, `PatternCircles`, `PatternWaves`, `PatternHexagons`, `PatternPath`, `Pattern` | `@/components/charts/patterns` | `@bklit/patterns` |
| `ReferenceArea` | `@/components/charts/reference-area` | `@bklit/reference-area` |
| `TrendLine` | `@/components/charts/trend-line` | `@bklit/trend-line` |
| `ChartMarkers` | `@/components/charts/markers` | `@bklit/markers` |
| `Legend`, `LegendItem`, `LegendMarker`, `LegendLabel`, `LegendValue`, `LegendProgress` | `@/components/charts/legend` | `@bklit/legend` |
| `PieChart` / `PieSlice` / `PieCenter` | `@/components/charts/pie-chart` / `pie-slice` / `pie-center` | `@bklit/pie-chart` |
| `RingChart` / `Ring` / `RingCenter` | `@/components/charts/ring-chart` / `ring` / `ring-center` | `@bklit/ring-chart` |
| `HeatmapChart`, `HeatmapCells`, `HeatmapLegend`, `HeatmapTooltip`, `HeatmapXAxis`, `HeatmapYAxis`, `HeatmapChartLoading` | `@/components/charts/heatmap` | `@bklit/heatmap-chart` |
| `chartCssVars`, `useChart`, `useChartStable` | `@/components/charts/chart-context` | `@bklit/chart-context` (pulled in by every chart) |
| `LinearGradient`, `RadialGradient` | `@visx/gradient` | npm dep of `@bklit/area-chart`, `@bklit/bar-chart` (pie/ring: `npm i @visx/gradient@4.0.0`) |
| `curveNatural`, `curveMonotoneX`, `curveLinear`, `curveStep`, `curveBasis`, `curveCatmullRom` | `@visx/curve` | npm dep of line/area charts |

`@bklit/pie-chart` and `@bklit/ring-chart` do **not** pull in `@bklit/patterns`
— add it when a pie needs `PatternLines`.

Docs: `https://bklit.com/docs/components/<slug>` and
`https://bklit.com/docs/utility/<background|grid|tooltip|legend|reference-area|projection-line>`.
Gallery: `https://bklit.com/charts/<slug>`. Studio: `https://bklit.com/studio?chart=<slug>`.

---

## Backgrounds & patterns

`<Background>` fills the plot area with a pattern preset and fades it out.
Defaults (from `background.tsx`): `pattern="diagonal"`, `color="var(--chart-grid)"`,
`opacity={1}`, `scale={1}`, `fadeHorizontal` / `fadeVertical` **both true**,
`fadeHorizontalLength` / `fadeVerticalLength` = `10` (% per edge, clamped 0–45).
Presets (`PATTERN_PRESET_IDS`): `none`, `diagonal`, `horizontal`, `vertical`,
`cross`, `dots`, `circles`, `accent`. Works inside Area, Line, Bar, Composed,
Scatter, Candlestick and Profit/Loss charts. Use it **instead of** `<Grid>`.

| People say | JSX | Notes |
|---|---|---|
| "diagonal pattern background that fades out on all sides", "hatched backdrop", "striped plot area" | `<Background />` | Diagonal + 4-side fade is the default. `pattern="diagonal"` is optional. |
| "fade only left/right", "horizontal fade" | `<Background fadeVertical={false} />` | |
| "fade only top/bottom" | `<Background fadeHorizontal={false} />` | |
| "no fade", "hard edges" | `<Background fadeHorizontal={false} fadeVertical={false} />` | |
| "longer / softer fade", "vignette" | `<Background fadeHorizontalLength={30} fadeVerticalLength={30} />` | Max 45 per edge. |
| "dot grid", "polka dots", "graph paper dots", "stippled" | `<Background pattern="dots" opacity={0.85} />` | Gallery "Dot Grid Background". `dotFill={false}` → hollow dots. |
| "rings", "circles texture" | `<Background pattern="circles" />` | `radius` overrides dot/circle radius. |
| "crosshatch", "cross-hatched", "lattice", "argyle-ish" | `<Background pattern="cross" />` | Two diagonals (8px tile). |
| "pinstripe", "horizontal lines", "ruled paper" | `<Background pattern="horizontal" />` | |
| "vertical stripes", "barcode" | `<Background pattern="vertical" />` | |
| "denser / finer pattern" | `scale={0.75}` | Scales tile size and stroke. |
| "bigger / chunkier pattern" | `scale={1.5}` or `strokeWidth={2}` | |
| "stronger / more visible background" | `color="var(--chart-foreground-muted)"` | Default `--chart-grid` is deliberately faint. |
| "subtler background" | `opacity={0.6}` | |
| "pattern with tinted tiles" | `tileBackground="var(--muted)"` | Fills each tile behind the strokes. |
| "pink/fuchsia accent stripes" | `pattern="accent"` | Hardcoded `#e879f9`; ignores `color`. Avoid in themed apps. |
| "honeycomb", "hexagon background", "hex grid" | **No preset.** | See recipes.md "Honeycomb background (custom)". `PatternHexagons` only tiles cleanly at `height={1}` `size={3}` (tile is `size × √size`, hexagon side is `height`). |
| "wavy", "waves texture", "squiggle" | **No preset.** | Compose `<PatternWaves id width height stroke />` + `fill="url(#id)"` on a series; no fading Background equivalent. |
| "texture on the bars", "hatched bars", "striped bars" | `<PatternLines id="p" width={8} height={8} orientation={["diagonal"]} stroke="var(--chart-1)" strokeWidth={2} />` + `<Bar fill="url(#p)" stroke="var(--chart-1)" lineCap={4} />` | Gallery "Bar Chart - Pattern". `stroke` on Bar = tooltip dot color. |
| "hatched area", "striped fill under the line" | `<PatternLines id="a" width={6} height={6} orientation={["diagonal"]} stroke="var(--chart-1)" strokeWidth={1} />` + `<PatternArea dataKey="v" fill="url(#a)" />` + `<Area dataKey="v" fillOpacity={0} />` | Gallery "Area Chart - Pattern". `Area fill="url(#a)"` also works (stroke falls back to `--chart-line-primary`, no edge fade). |
| "patterned pie / donut", "accessible print-friendly pie" | `PatternLines` per slice + `<PieSlice fill="url(#id)" />` | Vary `orientation`: `diagonal`, `horizontal`, `vertical`, `diagonalRightToLeft`. Needs `@bklit/patterns`. |
| "patterned heatmap levels" | `levelStyles={[{ color, fillMode: "pattern", pattern: "diagonal", patternColor: "var(--chart-scale-pattern-color)" }, ...]}` | `HeatmapLevelStyle` also has `patternScale`, `patternStrokeWidth`, `patternOpacity`. |
| "patterned funnel" | `<FunnelChart renderPattern={(id, color) => <PatternLines id={id} ... stroke={color} />} />` | Pattern on innermost ring only. |

`PatternLines` props: `id`, `width`, `height` (required), `stroke`, `strokeWidth`,
`orientation` (`"horizontal" | "vertical" | "diagonal" | "diagonalRightToLeft"`, array),
`background`, `strokeDasharray`, `strokeLinecap`, `shapeRendering`.
`PatternCircles`: `id`, `width`, `height`, `radius`, `fill`, `stroke`, `strokeWidth`, `complement`, `background`.
Shortcut: `renderPatternPreset("diagonal", "my-id", { color: "var(--chart-grid)" })`
returns the matching pattern node (same presets as `Background`).

## Fades

| People say | JSX | Notes |
|---|---|---|
| "line fades at the edges", "soft ends" | `<Line />` | `fadeEdges` defaults to **true** on `Line`. |
| "line goes all the way to the edge", "no fade" | `<Line fadeEdges={false} />` | Required when `stroke` is a `url(#gradient)` — the fade gradient uses `stroke` as a stop colour. |
| "fade only the left side" | `fadeEdges="left"` | Also `"right"`. |
| "area fades out at the sides" | `<Area fadeEdges />` | Default **false** on `Area`. Ignored for pattern fills. |
| "area fades to nothing at the bottom" | default | `gradientToOpacity={0}` is the default. |
| "keep some colour at the bottom" | `gradientToOpacity={0.05}` | Gallery "Area Chart - Gradient". |
| "gradient only near the top" | `gradientSpan={0.5}` | 0–1; default 1. |
| "grid lines fade at the sides" | `<Grid />` | `fadeHorizontal` default **true**. |
| "vertical grid fades top/bottom" | `<Grid vertical fadeVertical />` | `fadeVertical` default false. |
| "crosshair fades", "solid crosshair" | `<ChartTooltip indicatorFadeEdges="none" />` | `"both"` (default) / `"top"` / `"bottom"` / `"none"`; `indicatorFadeLength` default 10. |
| "reference band fades" | `<ReferenceArea fadeEdges />` | Default true, `fadeEdgesLength` 10. |
| "trend line fades at the ends" | `<TrendLine dataKey="v" fadeEdges />` | Default **false**; `fadeEdgesLength` 15 (% of line length per end). Composes with gradient and dashed strokes. |

## Bar shapes

| People say | JSX | Notes |
|---|---|---|
| "rounded bars", "pill bars", "capsule" | `<Bar lineCap="round" />` | Default is already `"round"`. |
| "square bars", "sharp", "flat ends", "brutalist" | `<Bar lineCap="butt" />` | |
| "slightly rounded", "match my radius" | `<Bar lineCap={4} />` | Number = corner radius in px. See rules/taste.md for the `--radius` mapping. |
| "squircle bars", "rounded square blocks", "pixel/LED/segmented bars", "stacked dots column" | `BarSquares` with `squareRadius={0.5}` | `squareRadius` = fraction of square size: 0 flat, 0.25 default, 0.5 circle. Pair with `BarChart squareSnap={{ squareGap: 3, groupGap: 4 }}`. Recipe: "Squircle ring bars". |
| "segmented with a ghost track", "empty slots", "track behind bars" | `<BarColumnTrack fill="url(#track)" opacity={0.65} squareGap={3} squareRadius={0.5} groupGap={4} />` | Defaults: `fill="var(--chart-grid)"`, `opacity={0.3}`, `squareRadius={0.25}`. Hides while a bar is hovered. |
| "gradient squares", "heat-coloured column" | `<BarSquares useGradient gradientStops={[{ offset: 0, color: "var(--chart-1)" }, …, { offset: 100, color: "var(--chart-5)" }]} />` | `offset` is 0–100. |
| "each column its own colour" | `<BarSquares colorKey="color" />` | Datum string at `colorKey` solid-fills that column. Plain `Bar` has no per-datum colour. |
| "3D bars", "isometric", "glass blocks", "glassy", "extruded" | `<BarDepthBack dataKey color />` + `<Bar perspective />` + `<BarDepthFront dataKey />` | Back **before** Bar, Front **after**. Recipe: "3D glass bars". |
| "no shadow under 3D bars" | `<BarDepthProvider groundShadow={0}>` around `<BarChart>` | Default 0.26. Provider wraps the chart, not inside it. |
| "3D stacked" | `BarDepthProvider segmentsAccessor={(d) => [{ value, color }, …]}` + `<BarChart stacked>` | Gallery "Bar Chart - 3D Stacked". |
| "pulsing live bar", "heartbeat bar" | `<BarPulse dataKey="v" activeIndex={n} />` after `BarDepthFront` | |
| "tiny/zero bars still visible" | `<Bar minBarHeight={4} />` (+ same on `BarDepthProvider`) | Default 0. |
| "no gaps between bars", "histogram" | `<BarChart barGap={0}>` + `<Bar lineCap="butt" />` | `barGap` is a 0–1 band fraction, default 0.2. |
| "thin bars" | `<BarChart barWidth={8}>` | Fixed px width. |
| "horizontal bars" | `<BarChart orientation="horizontal">` + `<BarYAxis />` | `BarSquares` and `BarColumnTrack` render nothing when horizontal or stacked. |
| "stacked bars" | `<BarChart stacked stackGap={2}>` | |
| "gap inside grouped bars" | `<Bar groupGap={4} />` | Default 4. |

## Gradients

| People say | JSX | Notes |
|---|---|---|
| "gradient bars" | `<LinearGradient id="g" from="var(--chart-1)" to="var(--chart-3)" />` + `<Bar fill="url(#g)" stroke="var(--chart-1)" />` | `LinearGradient` from `@visx/gradient`. |
| "bars that fade to transparent" | `<LinearGradient id="g" from="var(--chart-3)" to="transparent" />` + `<Bar fill="url(#g)" lineCap="butt" />` | Gallery "Bar Chart - No Gap". |
| "soft/glassy area" | `<Area fillOpacity={0.5} gradientToOpacity={0.05} />` | `fillOpacity` default 0.4. |
| "radial gradient pie slices" | `<RadialGradient id="r" from="var(--chart-1)" to="var(--chart-2)" />` + `<PieSlice fill="url(#r)" />` | Gallery uses hex colours — replace with tokens. |
| "gradient trend line" | `<TrendLine dataKey="v" strokeStyle="gradient" gradientStart="var(--chart-1)" gradientEnd="var(--chart-5)" />` | Same defaults as `ProjectionLine`; gradient runs start → end of the fit. |
| "gradient projection line" | `<ProjectionLine strokeStyle="gradient" gradientStart="var(--chart-1)" gradientEnd="var(--chart-5)" />` | Defaults: `gradientStart` = `stroke`, `gradientEnd="var(--chart-5)"`. |
| "preset gradients" (`GradientPinkBlue`, `GradientTealBlue`, …) | `@visx/gradient` named gradients | Hardcoded colours — avoid in themed apps. |

## Lines & curves

`Line` defaults: `stroke="var(--chart-line-primary)"`, `strokeWidth={2.5}`,
`curve={curveNatural}`, `fadeEdges` true. `Area` defaults: `curve={curveMonotoneX}`,
`strokeWidth={2}`, `showLine` true.

| People say | JSX |
|---|---|
| "smooth", "curvy", "organic" | default (`curveNatural` on Line) |
| "smooth but never overshoots", "monotone" | `curve={curveMonotoneX}` |
| "straight segments", "sharp", "polyline" | `curve={curveLinear}` |
| "step chart", "staircase" | `curve={curveStep}` |
| "very soft / loose" | `curve={curveBasis}` |
| "tension curve" | `curve={curveCatmullRom.alpha(0.42)}` (Studio's smooth preset) |
| "thin line", "hairline" | `strokeWidth={1.5}` |
| "bold line" | `strokeWidth={3}` |
| "dashed from today", "incomplete period", "dashed tail" | `dashFromIndex={n}` (inclusive) + optional `dashArray="6,4"` (default) |
| "area without the outline", "no stroke" | `<Area showLine={false} />` |
| "line only, no fill" | use `Line` in `LineChart` (or `Area fillOpacity={0}`) |
| "forecast", "projection", "target line" | `ProjectionLine` + `buildProjectionPath` (recipe "Projection") |
| "trend line", "line of best fit", "regression" | `<TrendLine dataKey="v" />` after the series — dashed `"6,4"` by default; `strokeStyle="solid"` for a solid fit. Line, area, bar (incl. horizontal), composed. |

## Markers & points

| People say | JSX | Notes |
|---|---|---|
| "dots on every point", "markers", "beads" | `<Line showMarkers />` / `<Area showMarkers />` | `markers={{ radius: 5, ringGap: 2, strokeWidth: 2 }}` — `SeriesPointMarkerStyle`: `fill`, `stroke`, `strokeWidth` (2), `ringGap` (2), `outlineWidth` (0), `outlineColor`, `radius` (5), `fadeOnHover` (true), `inactiveOpacity` (0.5), `inactiveBlur` (2), `enterBlur` (2), `showActiveHighlight` (true). Pair with `fadeEdges={false}` on Line so end points are visible. |
| "ring at the last point", "end dot" | `<LineSeriesTerminalMarker dataKey="v" />` | Defaults `fill="transparent"`, `stroke="var(--chart-1)"`, `radius={5}`, `strokeWidth={1.5}`. |
| "event pins", "annotations", "launch markers" | `<ChartMarkers items={[{ date, icon, title, description?, color?, href? }]} />` | `size` default 28, `showLines` default true. |

## Tooltips & crosshair

`ChartTooltip` defaults: `showDatePill` true, `showCrosshair` true, `showDots` true,
`dotVariant="dot"`, `dotSize={5}`, `dotScale={1}`.

| People say | JSX |
|---|---|
| "ring indicator", "hollow dot", "outlined hover dot" | `dotVariant="ring"` (ring stroke default 1.5 → `dotStrokeWidth`) |
| "squircle / rounded-square hover ring" | `dotVariant="ring" dotRadiusFraction={0.5}` (0 = square, 0.5 = circle) |
| "no crosshair line" (bars, squares) | `showCrosshair={false}` |
| "dashed crosshair" | `indicatorDasharray="4,4"` |
| "no date pill" | `showDatePill={false}` |
| "no dots" | `showDots={false}` |
| "snappier / instant tooltip" | `damping={0}`; `matchCrosshair` to lock panel to crosshair spring |
| "frosted / glass tooltip panel" | `panelStyle={{ backdropFilter: "blur(12px)" }}` + `backgroundColor="color-mix(in oklch, var(--popover) 70%, transparent)"` |
| "custom rows / currency" | `rows={(point) => [{ color, label, value }]}` |
| "fully custom tooltip" | `content={({ point, index }) => …}` |
| "crosshair coloured per point" | `indicatorColor={(point) => …}` |

## Grid

`Grid` defaults: `horizontal` true, `vertical` false, `numTicksRows={5}`,
`numTicksColumns={10}`, `stroke="var(--chart-grid)"`, `strokeDasharray="4,4"` (dashed),
`fadeHorizontal` true, `shimmer` false.

| People say | JSX |
|---|---|
| "solid grid lines" | `strokeDasharray="0"` |
| "fewer lines", "minimal grid" | `numTicksRows={3}` + `hideHorizontalEdgeLines` |
| "vertical grid", "columns" | `vertical` (`numTicksColumns` to tune) |
| "highlight the zero line", "baseline" | `highlightRowValues={[0]}` (solid, `--chart-foreground-muted`) |
| "no grid", "clean" | omit `<Grid>`; use `<Background>` for texture instead |
| "shimmering grid while loading" | `shimmer` — only animates while the chart is in loading status |

## Legends

| People say | JSX | Notes |
|---|---|---|
| "legend with values and progress bars" | `<Legend items={[{ label, value, maxValue, color }]} hoveredIndex onHoverChange><LegendItem><LegendMarker /><LegendLabel /><LegendValue showPercentage /><LegendProgress /></LegendItem></Legend>` | Share `hoveredIndex` with `RingChart`/`PieChart` for linked hover. Themed by `--legend*` vars. |
| "square legend swatches" | `<LegendMarker className="h-2.5 w-2.5 rounded-sm" />` | Default is `rounded-full`. |
| "heatmap scale legend" | `<HeatmapLegend align="center" gap={3} levelStyles={…} />` | |

## Loading states

| People say | JSX | Notes |
|---|---|---|
| "skeleton", "loading placeholder", "shimmer while fetching" | `<LineChart data={data} status={isLoading ? "loading" : "ready"} loadingLabel="Loading">` | Same on `AreaChart`, `BarChart`, `HeatmapChart`. The chart animates loading → ready. |
| "diagonal shimmer sweep" | `<Line loadingStyle="sweep" />` / `<Area loadingStyle="sweep" />` | Default `"pulse"` (traveling pulse). |
| "standalone skeleton component" | `<LineChartLoading />`, `<AreaChartLoading loadingStyle="sweep" />`, `<BarChartLoading />`, `<HeatmapChartLoading data gap label />` | `LineChartLoading`/`AreaChartLoading`: `gridShimmer` (true), `gridShimmerSync`, `label` ("Loading"), `stroke`, `strokeOpacity`. |
| "shimmering grid" | `<Grid shimmer shimmerSync />` | `shimmerLength` 140, `shimmerSpeed` 1. |

## Motion

| People say | JSX |
|---|---|
| "no animation", "static" | `animate={false}` on `Line` / `Area` / `Bar` / `BarSquares` / `PieSlice` / `Ring` |
| "faster / slower reveal" | `animationDuration={600}` on the chart root (default 1100 ms) |
| "springy entrance" | `enterTransition={{ type: "spring", stiffness: 140, damping: 20 }}` on the chart root |
| "bars fade in instead of growing" | `<Bar animationType="fade" />` (default `"grow"`) |
| "stagger bars" | `<Bar staggerDelay={0.05} />` (seconds; auto by default) |
| "dim others on hover more/less" | `<Bar fadedOpacity={0.15} />` (default 0.3) |
| "no hover highlight on line" | `<Line showHighlight={false} />` |

## Reference & annotation

| People say | JSX | Notes |
|---|---|---|
| "target range", "goal band", "normal range" | `<ReferenceArea y1={160} y2={220} strokeStyle="dashed" showMarkers />` | Defaults: `strokeStyle="dashed"`, `fadeEdges` true, `pattern="none"`. |
| "hatched target band" | `<ReferenceArea y1 y2 pattern="diagonal" patternColor="var(--chart-foreground-muted)" axisLabelColor="var(--chart-1)" fillOpacity={0.85} />` | Gallery "Pattern Reference Band". |
| "highlight a time window" | `<ReferenceArea x1={startDate} x2={endDate} />` | |

## Pie, donut, ring

| People say | JSX | Notes |
|---|---|---|
| "donut" | `<PieChart innerRadius={55}>` | Default 0 (solid pie). |
| "gaps between slices" | `padAngle={0.02}` | Radians. |
| "rounded slices" | `cornerRadius={4}` | |
| "slices grow on hover" | `<PieSlice hoverEffect="grow" />` | Default `"translate"`; `"none"` disables. |
| "no glow" | `<PieSlice showGlow={false} />` / `<Ring showGlow={false} />` | Default true. |
| "total in the middle" | `<PieCenter defaultLabel="Total" prefix="$" />` / `<RingCenter defaultLabel="Sessions" />` | |
| "half ring", "semicircle", "speedometer arc" | `<RingChart startAngle={-Math.PI} endAngle={0}>` | Gallery "Ring Chart - Half Circle". |
| "three-quarter ring" | `startAngle={-Math.PI} endAngle={Math.PI / 2}` | |
| "flat ring ends" | `<Ring lineCap="butt" />` | Default `"round"`. |
| "thicker rings" | `<RingChart strokeWidth={18} ringGap={8}>` | Defaults 12 / 6. |

Ring tracks use `--border`.

## Not supported (say so — do not invent props)

- Hexagon / honeycomb / wave **`Background` presets** — only the 8 presets above. Compose manually.
- Glow / neon on `Line`, `Area` or `Bar` — glow exists only on `PieSlice`, `Ring`, `RadarArea` (`showGlow`).
- Gradient `stroke` on `Line` while `fadeEdges` is on — set `fadeEdges={false}`.
- True stacked areas — `Area` has no stack prop; the gallery "Stacked" example overlaps translucent areas.
- Per-bar colours on plain `Bar` — use `BarSquares colorKey`, `BarDepthBack colorAccessor`, or separate series.
- `BarSquares` / `BarColumnTrack` in horizontal or stacked bar charts — they render nothing.
- Value labels printed on bars — no prop; use the tooltip or a custom SVG layer reading `useChart()`.
- Brush / range selection (`ChartBrush`, `SegmentBackground`) — not shipped in the public registry items.
