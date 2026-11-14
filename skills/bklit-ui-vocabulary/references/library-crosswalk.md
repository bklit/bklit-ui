# Library crosswalk: what each library calls it

Use this when the user knows a concept by another library's name. Find the
row, then answer with the glossary term and the Bklit column.

Columns:
- **Recharts**: Recharts 3.
- **Nivo**: `@nivo/*`.
- **RC3**: TanStack React Charts v3 (`react-charts`, `useChart`, `primaryAxis`, `getValue`, `elementType`).
- **TS1**: `@tanstack/charts` v1 (`defineChart({ marks })`, `lineY`, `barY`…). This is a different library from RC3. The **bklit-ui-migrate** skill covers TS1.
- **d3**: d3 modules.
- **Bklit**: the registry component or prop.

A dash (—) means the library has no named API for the concept. These names
were checked against Recharts 3.10, `@tanstack/charts` 1.1, the react-charts
v3 types, Nivo's source and d3js.org (November 2026). Libraries rename things,
so prefer the user's installed version if it disagrees.

## Chart types

| Concept | Recharts | Nivo | RC3 | TS1 | d3 | Bklit |
|---|---|---|---|---|---|---|
| Line | `LineChart` + `Line` | `Line` | `elementType: 'line'` | `lineY` | `d3.line()` | `LineChart` + `Line` |
| Area | `AreaChart` + `Area` | `Line enableArea` | `elementType: 'area'` | `areaY` | `d3.area()` | `AreaChart` + `Area` |
| Stacked area | `Area stackId` | `Line enableArea` + `yScale.stacked` | `stacked: true` | `areaY` + `stack()` | `d3.stack()` + `area()` | — |
| Streamgraph | `stackOffset="wiggle"` | `Stream` | `stackOffset` (d3 fn) | `stack({ offset: 'wiggle' })` | `stackOffsetWiggle` | — |
| Bar / column | `BarChart` + `Bar` | `Bar` | `elementType: 'bar'` | `barY` | `scaleBand` + `<rect>` | `BarChart` + `Bar` |
| Grouped bar | several `Bar`, no `stackId` | `groupMode="grouped"` | several bar series | `barY` with `z` | nested `scaleBand` | several `Bar` (default) |
| Stacked bar | shared `stackId` | `groupMode="stacked"` (default) | `stacked: true` | `barY` + `stack` | `d3.stack()` | `BarChart stacked` |
| Horizontal bar | `BarChart layout="vertical"` | `layout="horizontal"` | band axis `position: 'left'` | `barX` | swap scales | `BarChart orientation="horizontal"` |
| Histogram | `barCategoryGap={0}` | `Bar padding={0}` | — | `binX` | `d3.bin()` | `barGap={0}` + `lineCap="butt"` |
| Lollipop | custom `shape` | — | — | `ruleX` + `dot` | line + circle | `BarLollipop` |
| Scatter | `ScatterChart` + `Scatter` | `ScatterPlot` | `elementType: 'bubble'` | `dot` | circles | `ScatterChart` + `Scatter` |
| Bubble | `Scatter` + `ZAxis range` | `ScatterPlot nodeSize` | `elementType: 'bubble'` | `dot` `r` channel | `scaleSqrt` | — |
| Strip / beeswarm | — | `SwarmPlot` | — | `dodgeY` | `forceCollide` | `ScatterChart jitter` (jitter, not a swarm) |
| Candlestick / OHLC | — | — | — | `link` + `barY` | — | `CandlestickChart` |
| Combo / composed | `ComposedChart` | custom `layers` | `elementType` per axis | several marks | — | `ComposedChart` + `SeriesBar` |
| Step | `Line type="step"` | `curve="step"` | `curve: curveStep` | `curve: curveStep` | `curveStep` | `curve={curveStep}` |
| Range area / band | `Area dataKey` → `[lo, hi]` | — | — | `areaY` `y1`/`y2` | `area().y0().y1()` | `Band upperKey lowerKey` |
| Difference area | — | — | — | `differenceY` | two areas + clip | `Band negativeFill` |
| Trend line | — | — | — | `linearRegressionY` | — | `TrendLine` |
| Pie | `PieChart` + `Pie` | `Pie` | — | `polar()` + `pie` | `d3.pie()` + `d3.arc()` | `PieChart` + `PieSlice` |
| Donut | `Pie innerRadius` | `Pie innerRadius` (ratio) | — | `pie innerRadius` | `arc.innerRadius()` | `PieChart innerRadius` |
| Radial bar | `RadialBarChart` | `RadialBar` | — | `radialBarAngle` | `arc` + `scaleRadial` | `RadialChart` + `RadialBar` |
| Progress rings | `RadialBarChart` | `RadialBar` | — | — | `arc` | `RingChart` + `Ring` |
| Radar | `RadarChart` + `Radar` | `Radar` | — | `polar` + `radialArea` | `lineRadial` + `curveLinearClosed` | `RadarChart` + `RadarArea` |
| Gauge | half `RadialBarChart` / `Pie` | `RadialBar endAngle` | — | limited-angle `pie` | `arc` | `Gauge` |
| Heatmap | — | `HeatMap` | — | `cell` | two `scaleBand`s + `scaleSequential` | `HeatmapChart` |
| Calendar heatmap | — | `Calendar`, `TimeRange` | — | `cell` + binning | `d3.utcWeek` | `HeatmapChart` |
| Funnel | `FunnelChart` + `Funnel` | `Funnel` | — | — | — | `FunnelChart` |
| Sankey | `Sankey` | `Sankey` | — | `sankey` | `d3-sankey` | `SankeyChart` |
| Sunburst | `SunburstChart` | `Sunburst` | — | `sunburst` | `d3.partition()` + `arc` | `SunburstChart` |
| Treemap | `Treemap` | `TreeMap` | — | `treemap` | `d3.treemap()` | — |
| Chord | — | `Chord` | — | — | `d3.chord()` + `ribbon()` | — |
| Choropleth | — | `Choropleth` | — | `geoShape` | `d3.geoPath()` | `ChoroplethChart` |
| Sparkline | tiny `LineChart` | `Line` without axes | — | `lineY` `guides: false` | — | `LineSparkline` / `AreaSparkline` / `BarSparkline` |
| Box plot | — | `BoxPlot` | — | `boxY` | — | — |
| Bullet | — | `Bullet` | — | — | — | — |
| Waterfall | range `Bar` | — | — | `waterfall` | running totals | — |
| Bump | — | `Bump`, `AreaBump` | — | `rank` + `lineY` | `curveBumpX` | — |
| Error bar | `ErrorBar` | — | — | `ruleX` + `tickY` | — | — (use `Band`) |
| Waffle | — | `Waffle` | — | `waffleY` | — | — |
| Live / streaming | — | — | — | — | — | `LiveLineChart` |

## Anatomy, axes and scales

| Concept | Recharts | Nivo | RC3 | TS1 | d3 | Bklit |
|---|---|---|---|---|---|---|
| Plot area | `usePlotArea()` | `innerWidth` / `innerHeight` | — | `frame` | margin convention | `useChart()` `innerWidth` / `innerHeight` |
| Margin | `margin` | `margin` | `padding` | `margin` | margin convention | `margin` |
| Axis | `XAxis` / `YAxis` | `axisBottom` / `axisLeft`… | `primaryAxis` / `secondaryAxes` | `scales.x.axis` | `d3.axisBottom()` | `XAxis` / `YAxis` / `BarXAxis` / `BarYAxis` |
| Tick count | `tickCount` | `tickValues` | `tickCount` | `axis.ticks.count` | `axis.ticks()` | `numTicks` |
| Tick format | `tickFormatter` | `axis*.format` | `formatters.scale` | `axis.ticks.format` | `axis.tickFormat()` | `YAxis formatValue` |
| Gridlines | `CartesianGrid` | `enableGridX` / `enableGridY` | `showGrid` | `scales.y.grid` | `tickSize(-width)` | `Grid` |
| Legend | `Legend` | `legends` | — | `colorLegend` | — | `Legend` |
| Tooltip | `Tooltip` | `tooltip`, `sliceTooltip` | `tooltip` | `tooltip` | — | `ChartTooltip` |
| Crosshair / cursor | `Tooltip cursor` | `enableCrosshair` | `primaryCursor` | `crosshair()` | — | `ChartTooltip showCrosshair`, `ChartCrosshair` |
| Reference line | `ReferenceLine` | `markers` | — | `ruleY` / `ruleX` | `<line>` | `Grid highlightRowValues`, `ProjectionLine target`, `Deadline` |
| Reference area | `ReferenceArea` | — | — | `rect` | `<rect>` | `ReferenceArea` |
| Annotation | `ReferenceDot`, `Label` | `annotations` | — | `text`, `arrow` | d3-annotation | `ChartMarkers` |
| Data label | `label`, `LabelList` | `enableLabel`, `enableArcLabels` | — | `text` | `<text>` | `Bar showValue`, `Area showValue` |
| Series | one `<Line dataKey>` | `{ id, data }` / `keys` | `{ label, data }` | `z` channel | stack layer | one `<Line dataKey>` |
| Data key / accessor | `dataKey` | `keys`, `indexBy`, `id`, `value` | `getValue` | channel | accessor fn | `dataKey`, `xDataKey` |
| Domain | axis `domain` | scale `min` / `max` | `min` / `max` | `domain()` | `scale.domain()` | auto; `yScaleDomainMax`, `yDomains`, sparkline `yDomain` |
| Scale type | `XAxis type` + `scale` | `xScale.type` | `scaleType` | `scaleLinear`… | `scaleLinear`, `scaleTime`, `scaleBand`… | fixed per chart |
| Nice | `niceTicks` | `nice` | `shouldNice` | `nice` | `scale.nice()` | automatic |
| Band padding | `barCategoryGap`, `barGap` | `padding`, `innerPadding` | `innerBandPadding`… | band `padding` + `inset` | `paddingInner` / `paddingOuter` | `barGap` (fraction), `groupGap` (px) |
| Baseline | `Area baseValue` | `areaBaselineValue` | — | `areaY` `y1` | `area.y0()` | fixed 0 |
| Curve | `type="monotone"` | `curve="monotoneX"` | `curve` | `curve` | `curveMonotoneX`… | `curve={curveMonotoneX}` |
| Stack offset | `stackOffset` | `offsetType` | `stackOffset` | `offset` | `stackOffset*` | — |
| Stack order | `reverseStackOrder` | `order` | `getSeriesOrder` | `order` | `stackOrder*` | child order |
| Dual axis | `yAxisId` | — | several `secondaryAxes` | — | two scales | `yAxisId` + `YAxis orientation="right"` (`ComposedChart`) |

## Radial geometry, color, interaction and motion

| Concept | Recharts | Nivo | RC3 | TS1 | d3 | Bklit |
|---|---|---|---|---|---|---|
| Inner radius | `innerRadius` (px or %) | `innerRadius` (ratio) | — | `innerRadius` | `arc.innerRadius()` (px) | `innerRadius` (px) |
| Pad angle | `paddingAngle` (deg) | `padAngle` (deg) | — | `padAngle` (rad) | `padAngle()` (rad) | `padAngle` (rad) |
| Corner radius | `cornerRadius`, Bar `radius` | `cornerRadius`, `borderRadius` | — | `cornerRadius` | `arc.cornerRadius()` | `cornerRadius`, Bar `lineCap` |
| Start / end angle | deg, 0 = 3 o'clock, CCW | deg | — | rad, 0 = 12 o'clock | rad, 0 = 12 o'clock, CW | rad, 0 = 12 o'clock, CW (`Gauge`: deg) |
| Palette | `fill` / `stroke`, `Cell` | `colors={{ scheme }}` | `defaultColors` | `color` scale | `d3-scale-chromatic` | `var(--chart-1…5)` |
| Sequential / diverging | by hand | `colors.type` | — | `scaleSequential` | `scaleSequential` / `scaleDiverging` | `--chart-scale-01…05`, `--chart-positive` / `--chart-negative` |
| Binned color | `scale="quantize"` | `type: 'quantize'` | — | `scaleQuantize` | `scaleQuantize` / `scaleThreshold` | `HeatmapChart levelStyles` |
| Per-datum color | `Cell` | `colors` fn | `getDatumStyle` | `fill` channel | fill accessor | `BarSquares colorKey`, `BarLollipop colorKey`, one `PieSlice` each |
| Nearest-point hover | `Tooltip shared` | `useMesh`, `enableSlices` | `interactionMode: 'closest'` | `focus: 'nearest-x'` | `d3-delaunay` | built in |
| Synced hover | `syncId` | — | — | linked selection | — | `hoveredIndex` / `onHoverChange` (legend ↔ radial); `useSparklineHover` |
| Brush | `Brush` | — | `brush.onSelect` | `brushX` | `d3.brushX()` | `ChartBrushLayout` + `ChartBrush` (`@bklit/brush`) |
| Zoom / pan | — | — | — | `zoomX` | `d3.zoom()` | `ChoroplethChart zoomEnabled` only |
| Responsive | `ResponsiveContainer` | `ResponsiveLine`… | fills parent | observes container | `viewBox` / ResizeObserver | built in; `aspectRatio` |
| Animation | `isAnimationActive`, `animationDuration` | `animate`, `motionConfig` | built-in | `svgAnimation` | `.transition().duration()` | `animate`, `animationDuration`, `enterTransition` |
| Loading / skeleton | — | — | — | — | — | `status="loading"`, `*ChartLoading` |
| Theme | `RechartsThemeProvider` | `theme` | `dark` | theme | — | CSS variables `--chart-*` |

## False friends

The same word means different things in different libraries. Check this list
before you translate a word.

- **range**: in d3 a scale's `range()` is the **output pixels**. A *range area* is a **band between low and high values**. In Recharts, `ZAxis range` is the **bubble size**. In Nivo Bullet, `ranges` are the **background bands**.
- **layout / orientation**: Recharts `layout="vertical"` makes **horizontal bars**. Nivo `layout="horizontal"` and Bklit `orientation="horizontal"` describe the same picture using the opposite word.
- **barGap**: Recharts `barGap` is the **px gap between bars in a group**. Bklit `BarChart barGap` is a **fraction of the category slot**, closer to Recharts `barCategoryGap`. Bklit `ComposedChart barGap` is px.
- **padding**: d3 band padding is a ratio. Nivo `padding` is a ratio, but `innerPadding` is px. RC3 `padding` is the **chart margin**. Bklit sparkline `padding` is also a margin.
- **markers**: Nivo `markers` are **reference lines**. Bklit `ChartMarkers` are **event pins** with icons, and `showMarkers` draws **dots on every point**.
- **Cell**: Recharts `Cell` is a **per-datum style override** inside `Pie` / `Bar` (in Bklit, one `PieSlice` per slice). TS1 `cell` is a **heatmap rectangle** (Bklit `HeatmapCells`).
- **layers**: Nivo `layers` is an ordered list of built-in layer ids plus your own components. Recharts `Layer` is an SVG `<g>`. In Bklit, layering is **JSX child order**.
- **dataKey**: Recharts `dataKey` may be a string or a function. Bklit `dataKey` is a **string**, always the y value; x comes from the root's `xDataKey`. RC3 uses `getValue` per axis.
- **label**: an RC3 series `label` is the **series name**. Recharts `label` on a series turns on **data labels**. Nivo `label` is an accessor for label text.
- **type**: Recharts `Line type` is the **curve**. Recharts `XAxis type` is number vs category. Nivo `xScale.type` is the **scale**.
- **Band**: d3 `scaleBand` is a **category scale**. Bklit `Band` is a **range area** between two keys.
- **Brush**: Recharts `Brush` is an **index slider** under the chart. d3-brush is a **pixel drag selection**. Bklit's `ChartBrush` (`@bklit/brush`) is a **time-range** selection on a mini chart, driving the main chart's `xDomain`.
- **bump / step**: Recharts `type="bump"` and d3 `curveBumpX` are **curve shapes**. Nivo `Bump` is a **ranking chart**. "Step" is always a curve, never a chart component.
- **Stack offsets**: "100%" is `expand` in d3, Recharts and Nivo, but `normalize` in TS1. "Positives up, negatives down" is `diverging` in most libraries, but `sign` in Recharts.
- **Angles**: Recharts uses **degrees, 0 at 3 o'clock, counter-clockwise**. d3, TS1 and Bklit use **radians, 0 at 12 o'clock, clockwise**. Bklit `Gauge` angles are degrees.
- **innerRadius**: px or `%` in Recharts, a **ratio** in Nivo, px in d3 and Bklit.
- **Responsive**: Recharts wraps the chart in `ResponsiveContainer`. Nivo exports `ResponsiveX` twins. Bklit charts size to their parent automatically, so don't add a wrapper.
- **motionConfig**: Nivo's `motionConfig` is a react-spring preset. It has nothing to do with Motion's `MotionConfig`.
- **Radial bar vs ring vs gauge**: Recharts has one `RadialBarChart` for all three. Bklit splits them into `RadialChart` (bars around a cycle), `RingChart` (progress rings) and `Gauge` (one value).
