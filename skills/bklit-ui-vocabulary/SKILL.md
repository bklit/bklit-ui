---
name: bklit-ui-vocabulary
description: >
  Reverse-lookup glossary for data visualization. It turns a loose description
  of a chart, chart part or chart behavior into its exact term and the Bklit UI
  component or prop that provides it. Examples: "the line that follows my
  mouse" → Crosshair (`ChartTooltip showCrosshair`); "the stick with a dot on
  top instead of a bar" → Lollipop (`BarLollipop`); "the shaded range
  around the line" → Range band (`Band`); "bars on top of each other" →
  Stacked bar (`BarChart stacked`). Use when someone asks "what's it called
  when…", describes a chart without knowing its name, or wants the right words
  to prompt an AI with. Also use whenever a chart request, including a request
  to build a Bklit chart, is phrased in another library's vocabulary: Nivo
  (`groupMode`, `enableSlices`, `useMesh`, `offsetType`, `ResponsiveLine`,
  `layers`), Recharts (`stackId`, `ResponsiveContainer`, `layout="vertical"`,
  `barCategoryGap`, `LabelList`), TanStack Charts (`elementType`,
  `primaryAxis`, `lineY`, `barY`) or d3 (`d3.stack`, `scaleBand`, `curveStep`,
  `d3.arc`). Translate those terms to Bklit components and props first, then
  hand off to bklit-ui to build and bklit-ui-design to style.
---

# Bklit chart vocabulary

Turn a vague description of a chart, a part of a chart, or a chart behavior
into the precise term. Then name the Bklit component or prop that provides
it, so the user knows what to ask for.

## Quick Start

The user describes a concept loosely. Return the matching term in this format:

```
**Crosshair** — A guide line that follows the pointer across the plot so you can read the exact x (and sometimes y) position.
Bklit: `ChartTooltip showCrosshair` (on by default for line and area); `ChartCrosshair` adds a free y line with a value pill.
```

If several terms could fit, list the best match first. Then give 1–2
alternates, each with a one-line note on how it differs.

## Instructions

1. **Read for intent, not keywords.** People describe what they see ("the dots
   that hug each other", "the faint lines behind the chart", "the box that
   follows my mouse"), not the technical name. Map the description to the
   glossary below.
2. **Quote the glossary verbatim.** Its definitions and `Bklit:` lines are
   authoritative. Use them as written; don't paraphrase.
3. **Always give the Bklit mapping.** Every answer ends with the `Bklit:` line
   from the entry. If the entry says **No Bklit equivalent**, say that plainly
   and give the nearest composition the entry lists. Never invent a prop.
4. **Translate other libraries' words.** If the user names a Recharts, Nivo,
   TanStack Charts or d3 term (`ResponsiveContainer`, `stackId`, `groupMode`,
   `useMesh`, `elementType`, `d3.stack`, `scaleBand`…), look it up in
   [references/library-crosswalk.md](./references/library-crosswalk.md).
   Check its **False friends** list before answering. The same word often
   means different things across libraries (`range`, `layout`, `barGap`,
   `markers`, `Cell`, `padding`).
5. **Disambiguate close terms.** When two terms compete, contrast them so the
   user can pick. Common pairs: *Crosshair* vs *Tooltip*, *Reference area* vs
   *Range band*, *Trend line* vs *Projection*, *Grouped* vs *Stacked*,
   *Donut* vs *Ring* vs *Radial bar* vs *Gauge*, *Grid* vs *Background*,
   *Marker (event pin)* vs *Point marker (dot)*, *Data label* vs *Tooltip*.
6. **When nothing matches exactly,** name the closest term and say it is an
   approximation. Or describe the concept in the glossary's words, e.g. "that's
   a *range band* drawn with a *pattern fill*".
7. **Stay within this glossary.** If a term isn't here, say so rather than
   inventing one. You may still explain the concept using these words.
8. **Translate build requests before building.** When a request to build a
   chart uses another library's terms ("a Nivo-style stream chart with
   `enableSlices`"), write a one-line translation first, for example
   "`groupMode="stacked"` → `BarChart stacked`; `enableSlices="x"` → the default
   `ChartTooltip`". Flag anything with no Bklit equivalent, then build with
   bklit-ui.
9. **Keep it tight.** A naming question wants a name, not an essay. Lead with
   the term and expand only if asked. If the user then wants it built, use the
   **bklit-ui** skill to install and compose it, and **bklit-ui-design** for
   how it looks (patterns, fades, bar shapes, theming).

The Bklit lines name the shipped registry source. After `npx shadcn@latest
add @bklit/<item>`, the user's `components/charts/*` files are the contract. If
a prop here is missing from the installed file, trust the file.

## Examples

**Example 1: describing a behavior**
User: "What's it called when hovering the chart shows a vertical line and the values at that date?"
```
**Crosshair** — A guide line that follows the pointer across the plot so you can read the exact x (and sometimes y) position.
Bklit: `ChartTooltip showCrosshair` (on by default for line and area); `ChartCrosshair` adds a free y line with a value pill.

Often paired with:
- **Tooltip**: the floating panel with the values. The crosshair is only the line.
```

**Example 2: describing a shape**
User: "Instead of bars I want a thin line with a circle on the end."
```
**Lollipop chart** — A thin stem from the baseline with a dot at the value; a lighter-ink alternative to bars.
Bklit: `BarLollipop` inside `BarChart` (vertical, non-stacked only). Negative values hang below zero.
```

**Example 3: another library's word**
User: "In Recharts I'd use `stackId` on my `<Area>`s. What's the Bklit version?"
```
**Stacked area** — Areas piled on top of each other so the top edge shows the running total.
Bklit: **No Bklit equivalent.** `Area` has no stack prop. Nearest: overlapping translucent `Area`s, or precompute cumulative values per row.
```

**Example 4: two terms compete**
User: "The shaded strip that shows the normal range."
```
**Reference area** — A shaded rectangle at fixed values that marks a goal range or a time window.
Bklit: `ReferenceArea y1 y2` (value range) or `x1 x2` (time window).

Close alternate:
- **Range band**: if the strip's top and bottom change at every point (min/max, confidence). Bklit: `Band upperKey lowerKey`.
```

## Glossary

### Chart types: picking the right chart

- **Line chart** — Points joined by a line, usually over time; best for trends. Bklit: `LineChart` + `Line`.
- **Area chart** — A line with the space down to the baseline filled; trend plus magnitude. Bklit: `AreaChart` + `Area`.
- **Step chart** — A line that moves in flat stairs rather than slopes, for values that change in jumps (prices, plan tiers). Bklit: `curve={curveStep}` on `Line`/`Area` (from `d3-shape`).
- **Bar chart** — One rectangle per category whose length is the value. Also called a column chart when vertical. Bklit: `BarChart` + `Bar`.
- **Horizontal bar chart** — Bars grow left to right, with categories down the y axis; good for long labels and rankings. Bklit: `BarChart orientation="horizontal"` + `BarYAxis`.
- **Grouped bar chart** — Several series' bars side by side within each category. Also called clustered bars. Bklit: several `<Bar dataKey>` children (the default); `Bar groupGap` sets the gap.
- **Stacked bar chart** — Series bars piled into one bar per category, so the top shows the total. Bklit: `BarChart stacked` (+ `stackGap`).
- **Histogram** — Touching bars over value bins that show how often values occur. Bklit: pre-bin the data, then `BarChart barGap={0}` + `Bar lineCap="butt"`.
- **Lollipop chart** — A thin stem from the baseline with a dot at the value; a lighter-ink alternative to bars. Bklit: `BarLollipop` inside `BarChart` (vertical, non-stacked only). Negative values hang below zero.
- **Segmented bar** — A bar built from a stack of small squares or dots, like an LED meter. Also called pixel bars or squircle bars. Bklit: `BarSquares` (+ `BarChart squareSnap`, optional `BarColumnTrack` ghost track).
- **3D bar** — Bars drawn with an extruded front and side face. Also called isometric or glass bars. Bklit: `BarDepthBack` → `Bar perspective` → `BarDepthFront` (from `@bklit/bar-depth`).
- **Combo chart** — Different mark types (bars plus a line or area) sharing one x axis, often with two y axes. Also called a composed chart. Bklit: `ComposedChart` + `SeriesBar` + `Line`/`Area`.
- **Scatter plot** — A dot at each (x, y) pair, showing spread and clusters. Bklit: `ScatterChart` + `Scatter` (the x axis is time).
- **Strip plot** — Many dots per category, nudged sideways so they don't overlap. Also called a jitter plot; a beeswarm packs them precisely instead. Bklit: `ScatterChart jitter` (seeded random offset, not a true beeswarm).
- **Candlestick chart** — Open, high, low and close per period, drawn as a body and a wick. Also called OHLC. Bklit: `CandlestickChart` + `Candlestick`.
- **Profit/loss line** — One series that crosses zero, colored by sign (green above, red below). Bklit: `ProfitLossLine` (`@bklit/profit-loss-line`).
- **Live line chart** — A line that scrolls smoothly as new points stream in. Also called a real-time or streaming chart. Bklit: `LiveLineChart` + `LiveLine` (`window`, `paused`).
- **Sparkline** — A tiny chart the size of a word, with no axes or grid, for table cells and KPI cards. Bklit: `LineSparkline` / `AreaSparkline` / `BarSparkline`, plus `useSparklineHover` to read the hovered value.
- **Pie chart** — A circle cut into slices sized by share of the whole. Bklit: `PieChart` + `PieSlice`.
- **Donut chart** — A pie with a hollow center, often with a total inside. Bklit: `PieChart innerRadius={…}` + `PieCenter`.
- **Ring chart** — Concentric progress arcs, one ring per metric, each filled toward its own goal. Also called concentric rings or activity rings. Bklit: `RingChart` + `Ring` + `RingCenter`.
- **Radial bar chart** — Bars bent around a circle, for a cycle such as hours of the day or months. Also called a circular bar or clock chart. Bklit: `RadialChart` + `RadialBar` / `RadialRingBar` / `RadialDotBar` (also `RadialLine`, `RadialArea`).
- **Radar chart** — Values on spokes around a circle, joined into a polygon to compare profiles. Also called spider or web chart. Bklit: `RadarChart` + `RadarGrid` + `RadarAxis` + `RadarLabels` + `RadarArea`.
- **Gauge** — One value on a partial arc against a scale, like a speedometer. Also called a dial or meter. Bklit: `Gauge` (`@bklit/gauge-chart`); `arcStyle`, `needle`, `zones`, `orientation="linear"` for a bar meter.
- **Heatmap** — A grid of cells colored by value. Bklit: `HeatmapChart` + `HeatmapCells`.
- **Calendar heatmap** — A heatmap laid out as days in week columns, like a contribution graph. Bklit: `HeatmapChart` with daily data (`weekStartDay`) + `HeatmapLegend`.
- **Funnel chart** — Shrinking stages that show drop-off between steps. Bklit: `FunnelChart` (`edges`, `layers`, `showPercentage`).
- **Sankey diagram** — Flows between nodes, where link width is the quantity. Bklit: `SankeyChart` + `SankeyNode` + `SankeyLink`.
- **Sunburst chart** — A hierarchy drawn as nested rings of arcs; click to drill down. Bklit: `SunburstChart` (`focusId`, `SunburstBreadcrumb`).
- **Choropleth map** — A map with regions shaded by value. Bklit: `ChoroplethChart` (`zoomEnabled`, `clickToZoom`, `ChoroplethMarker`).
- **Range area chart** — A filled band between a low and a high value at each point, with no line of its own. Bklit: `Band upperKey lowerKey` alone in a `LineChart`.

### Anatomy: the parts of a chart

- **Plot area** — The inner rectangle where the data is drawn, inside the margins. Bklit: `innerWidth` / `innerHeight` from `useChart()`.
- **Margin** — Space around the plot area that holds axes and labels. Bklit: `margin` on the chart root (40px each side by default).
- **Axis** — The ruler along an edge that shows what positions mean. Bklit: `XAxis`, `YAxis` (bar charts use `BarXAxis` / `BarYAxis`).
- **Tick** — A mark at a value along an axis. Its text is the **tick label**. Bklit: `numTicks` on `XAxis` / `YAxis`; `YAxis formatValue` formats labels.
- **Gridlines** — Faint lines across the plot at tick positions, to help the eye read values. Bklit: `Grid` (`horizontal` on, `vertical` opt-in, dashed by default).
- **Baseline / zero line** — The line bars and areas grow from, usually 0. Bklit: emphasized with `Grid highlightRowValues={[0]}`.
- **Background texture** — A decorative pattern filling the plot area, used instead of gridlines. Bklit: `Background` (pattern presets, fades on all four edges by default).
- **Legend** — The key that maps colors or shapes to series. Bklit: `Legend` + `LegendItem` / `LegendMarker` / `LegendLabel` / `LegendValue` / `LegendProgress`; `HeatmapLegend` for color scales.
- **Series** — One named group of values drawn as one line, one set of bars or one set of slices. Bklit: one `<Line dataKey>` / `<Bar dataKey>` / `<Area dataKey>` per series.
- **Datum** — One data point, usually one row of your data array. Bklit: one object in `data`.
- **Data key** — The field name a chart reads values from. Also called an accessor (d3) or a channel (TanStack Charts). Bklit: `dataKey` on a series (y value); `xDataKey` on the chart root (defaults to `"date"`, or `"name"` on `BarChart`).
- **Center label** — A stat printed in the hole of a donut, ring or gauge. Bklit: `PieCenter`, `RingCenter`, `RadialCenter`, `SunburstCenter`.

### Scales and axes: how values become positions

- **Scale** — The function that maps data values (the **domain**) to pixels (the **range**). Bklit: chosen by the chart (time x on line and area, band x on bar, linear y).
- **Domain** — The span of data values a scale covers, such as 0–500 or Jan–Dec. Bklit: automatic. `LineChart yScaleDomainMax` caps the top; `ComposedChart yDomains` sets it per axis; sparklines take `yDomain`.
- **Time scale** — An x axis that spaces dates by real elapsed time. Bklit: line, area, composed, scatter and candlestick charts expect `Date` x values.
- **Band scale** — Equal slots for categories, each holding a bar or group. Bklit: `BarChart` x axis; `barGap` (0–1 fraction of a slot) and `barWidth` (px).
- **Band padding** — The gap between category slots, or between bars inside a group. Bklit: `BarChart barGap` (between slots), `Bar groupGap` (inside a group, px).
- **Dual axis** — Two y axes with different scales on one chart. Bklit: `ComposedChart` with `yAxisId` on series and a second `YAxis orientation="right"`.
- **Nice ticks** — Axis ends rounded to tidy numbers (0, 50, 100), not raw extremes. Bklit: automatic.
- **Large-number formatting** — Abbreviating axis values (1.2k, 3.4M). Bklit: `YAxis formatLargeNumbers` (on by default) or `formatValue`.

### Marks and shape: how series are drawn

- **Curve** — How the path is smoothed between points. Also called interpolation. Bklit: `curve={curveNatural | curveMonotoneX | curveLinear | curveStep | curveBasis | curveCatmullRom}` from `d3-shape`. `Line` defaults to natural, `Area` to monotone.
- **Monotone curve** — Smooth, but never overshoots above or below the data. Bklit: `curve={curveMonotoneX}`.
- **Point marker** — A dot drawn at every data point on a line or area. Also called a vertex marker or bead. Bklit: `showMarkers` (+ `markers={{ radius, ringGap, … }}`).
- **Terminal marker** — One dot or ring at the last point of a line, marking "now". Bklit: `LineSeriesTerminalMarker`.
- **Dashed tail** — The last part of a line drawn dashed to show an incomplete period. Bklit: `Line dashFromIndex={n}` (+ `dashArray`).
- **Edge fade** — A line, gridline or texture fading to transparent at the chart's sides. Bklit: `Line fadeEdges` (on by default), `Area fadeEdges`, `Grid fadeHorizontal`, `Background fadeHorizontal` / `fadeVertical`.
- **Gradient fill** — An area fill that fades from the line color toward transparent at the bottom. Bklit: `Area` default (`gradientToOpacity`, `gradientSpan`).
- **Stroke gradient** — A line whose color ramps from left to right. Bklit: `Line strokeGradient={[…colors]}`.
- **Glow** — A soft blurred halo behind a line or shape. Bklit: `Line glow` (or `{ blur, opacity, strokeWidth }`), `Ring showGlow`, `PieSlice showGlow`, `RadarArea showGlow`, `Gauge glow`. No glow on `Area` or `Bar`.
- **Pattern fill** — Hatching, dots or other texture used as the fill of a series instead of a flat color. Bklit: `PatternPreset id` + `fill="url(#id)"`; `PatternArea` for areas.
- **Bar corner radius** — Rounding on the bar ends. Bklit: `Bar lineCap="round" | "butt" | number`.
- **Data label** — The number printed on or next to a mark. Also called a value label. Bklit: `Bar showValue` (+ `valueLabelFormatter`, `valueLabelPosition`, `valueLabelOrientation`); `Area showValue` (+ `valueLabelMinCount`, `valueLabelMaxCount`).
- **Ghost series** — A faint comparison series, such as "yesterday", drawn behind the current one. Bklit: `ghostDataKey` on `RadialBar` / `RadialArea` / `RadialDotBar`; a dashed second `Line` elsewhere.

### Series layout: stacking and comparing

- **Stacking** — Placing series on top of each other so values add up. Bklit: bars only, `BarChart stacked`.
- **Stack offset** — How a stack's baseline is chosen: from zero, normalized to 100%, or centered. Bklit: **No Bklit equivalent.** Precompute the values (for example, percentages per row).
- **Normalized (100%) stack** — Stacked bars scaled so every bar is the same height and shows share. Also called expand. Bklit: **No built-in.** Convert rows to percentages, then `BarChart stacked`.
- **Diverging** — Positive values go up (or right) and negative values go down from a shared zero. Bklit: `Bar` and `BarLollipop` draw negatives below zero; `ProfitLossLine` colors by sign.
- **Small multiples** — The same small chart repeated per category in a grid. Also called faceting or a trellis. Bklit: render several charts in a CSS grid; sparklines are built for this.

### Color and encoding

- **Categorical palette** — Distinct hues for unrelated series. Bklit: `var(--chart-1)` … `var(--chart-5)`.
- **Sequential scale** — Light-to-dark steps for ordered magnitude. Bklit: `--chart-scale-01` … `--chart-scale-05` (heatmap, choropleth).
- **Diverging scale** — Two hues meeting at a neutral midpoint, for above/below a reference. Bklit: `--chart-positive` / `--chart-negative` (profit/loss, `Band negativeFill`).
- **Binned color (quantize / threshold)** — Continuous values cut into a few discrete color steps. Bklit: `HeatmapChart` levels (`levelStyles`).
- **Semantic color** — Color that carries meaning, such as up/down or good/bad, rather than identity. Bklit: `--chart-positive`, `--chart-negative`; `Candlestick positiveFill` / `negativeFill`.
- **Design tokens** — Theme variables the chart reads, so it follows light and dark mode. Bklit: CSS variables `--chart-*`, typed via `chartCssVars`.

### Reference and annotation

- **Reference line** — A straight line at a fixed value, such as a target, average or zero. Bklit: `Grid highlightRowValues={[v]}` for a value line; `ProjectionLine target` for a goal on a forecast; `Deadline fillType="none"` for a vertical date line.
- **Reference area** — A shaded rectangle at fixed values that marks a goal range or a time window. Bklit: `ReferenceArea y1 y2` (value range) or `x1 x2` (time window).
- **Range band** — A shaded band whose top and bottom vary at each point, such as min/max or a confidence interval. Also called an error band. Bklit: `Band upperKey lowerKey` (before the `Line`).
- **Difference area** — Shading between two lines, colored by which one is ahead. Also called a gap fill. Bklit: `Band upperKey lowerKey negativeFill`.
- **Bollinger bands** — A moving average with bands a set number of standard deviations above and below. Bklit: `withBollingerBands(data, { dataKey })` + `Band`.
- **Trend line** — A best-fit straight line through the data (least-squares regression). Bklit: `TrendLine dataKey`.
- **Projection** — A forecast line extending past the last real point. Also called an extrapolation. Bklit: `ProjectionLine` + `buildProjectionPath`; `areaFill` shades under it; `target` adds a goal and rings the crossing.
- **Goal crossing** — The point where a forecast first reaches a target value. Bklit: `ProjectionLine target={v}` (`showTargetMarker`, `showGuides`).
- **Event marker** — An icon pinned to a date to annotate an event (a launch, an incident). Also called an annotation. Bklit: `ChartMarkers items={[{ date, icon, title }]}`.
- **Deadline** — A vertical marker at a due date, shading the time after it. Bklit: `Deadline date label` (`fillType="pattern" | "gradient" | "solid" | "none"`).
- **Weekend shading** — Bands over Saturdays and Sundays on a date axis. Bklit: `Weekends`.

### Interaction

- **Tooltip** — The floating panel that shows exact values for the hovered point. Bklit: `ChartTooltip` (`rows`, `content`); `HeatmapTooltip`, `SankeyTooltip`, `ChoroplethTooltip`.
- **Crosshair** — A guide line that follows the pointer across the plot so you can read the exact x (and sometimes y) position. Bklit: `ChartTooltip showCrosshair` (on by default for line and area); `ChartCrosshair` adds a free y line with a value pill.
- **Date pill** — The small label on the x axis that shows the hovered date. Bklit: `ChartTooltip showDatePill`.
- **Hover dot** — The dot drawn on each series at the hovered x. Bklit: `ChartTooltip showDots`, `dotVariant="dot" | "ring"`.
- **Nearest-point hover** — Hover snaps to the closest data point rather than needing an exact hit. In other libraries this is often called Voronoi or mesh. Bklit: built in. Time-series charts snap to the nearest x; jittered `ScatterChart` snaps to the nearest dot.
- **Hover highlight** — The hovered series or segment is emphasized while the rest dims. Also called focus + context. Bklit: `Line showHighlight` + `highlight={{ span, dimOpacity, glow }}`; `Bar fadedOpacity`; `Scatter inactiveMode`.
- **Linked hover** — Hovering one element (a legend row, a ring) highlights the matching part of another. Bklit: share `hoveredIndex` / `onHoverChange` between `Legend` and `PieChart` / `RingChart` / `RadialChart` / `FunnelChart`.
- **Scrubber** — A handle you drag around a radial chart to read values. Bklit: `RadialScrubber`.
- **Drill-down** — Clicking a segment to zoom into its children. Bklit: `SunburstChart focusId` / `onFocusChange`; `ChoroplethChart clickToZoom`.
- **Zoom / pan** — Wheel or drag to change the visible area. Bklit: choropleth only (`zoomEnabled`). Cartesian charts zoom through a **Brush** instead.
- **Brush** — A draggable selection on a mini chart that sets the main chart's x range. Bklit: `ChartBrushLayout` + `ChartBrush` (`@bklit/brush`), for area and line charts with a date x axis.
- **Responsive container** — The chart resizes to fill its parent. Bklit: built in; set the size on the wrapper, or use `aspectRatio` on the root.

### Motion and loading

- **Enter animation** — How marks draw in on mount: grow, fade or reveal. Bklit: on by default; `animationDuration` / `enterTransition` on the root, `Bar animationType="grow" | "fade"`, `animate={false}` per series.
- **Stagger** — Each bar or slice starts its animation slightly after the previous one. Bklit: `Bar staggerDelay`, `FunnelChart staggerDelay`.
- **Spring** — Physics-based easing that settles naturally instead of on a fixed curve. Bklit: `enterTransition={{ type: "spring", stiffness, damping }}`.
- **Data transition** — Animating from old values to new ones when the data changes. Bklit: built in; `yDomainTween` animates the y axis.
- **Skeleton** — A placeholder chart shown while data loads. Bklit: `status="loading"` on `LineChart` / `AreaChart` / `BarChart` / `HeatmapChart` / `ComposedChart`; standalone `*ChartLoading`.
- **Shimmer** — A light sweep that moves across a loading placeholder. Bklit: `loadingStyle="pulse" | "sweep"` on `Line` / `Area`; `Grid shimmer`.
- **Reduced motion** — Turning animation down or off for users who ask the OS to reduce motion. Bklit: `animate={false}`; respect `prefers-reduced-motion` in the app.

### Radial geometry

- **Inner radius** — The radius of the hole in a donut or ring. Bklit: `PieChart innerRadius` (px); `RingChart baseInnerRadius`.
- **Pad angle** — The angular gap between neighboring slices. Bklit: `PieChart padAngle` (radians).
- **Corner radius** — Rounded corners on slices or arcs. Bklit: `PieChart cornerRadius`, `RadialBar cornerRadius`; `Ring lineCap`.
- **Start / end angle** — Where the arc sweep starts and stops, for semicircles and gauges. Bklit: `startAngle` / `endAngle` in radians, with 0 at 12 o'clock, clockwise (`Gauge` uses degrees).
- **Arc** — One curved segment of a pie, ring or gauge. Bklit: `PieSlice`, `Ring`, `SunburstSegment`.

### Named charts Bklit does not ship

When a request names one of these, say plainly that Bklit has no component for
it, and offer the nearest option listed.

- **Stacked area / streamgraph** — Areas piled into a running total, or centered and flowing. Bklit: **No Bklit equivalent.** Nearest: overlapping translucent `Area`s, or stacked bars.
- **Bubble chart** — A scatter where dot size encodes a third value. Bklit: **No Bklit equivalent.** `Scatter radius` is fixed per series.
- **Box plot** — Median, quartiles, whiskers and outliers per group. Bklit: **No Bklit equivalent.** Nearest: `Band` for a range.
- **Waterfall chart** — Floating bars that show step-by-step gains and losses up to a total. Bklit: **No Bklit equivalent.**
- **Bullet chart** — One bar against shaded qualitative ranges and a target tick. Bklit: **No Bklit equivalent.** Nearest: `Gauge orientation="linear"` (a single-value meter), or a `ReferenceArea` behind bars.
- **Treemap** — A hierarchy as nested rectangles sized by value. Bklit: **No Bklit equivalent.** Nearest: `SunburstChart`.
- **Chord diagram** — Flows between groups drawn as ribbons inside a circle. Bklit: **No Bklit equivalent.** Nearest: `SankeyChart`.
- **Bump chart** — Lines tracking rank position over time. Bklit: **No Bklit equivalent.** Nearest: a `LineChart` of ranks.
- **Error bars** — Whiskers that show uncertainty around each value. Bklit: **No Bklit equivalent.** Nearest: `Band` around a line.
