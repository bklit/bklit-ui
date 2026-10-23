# TanStack Charts → bklit

[TanStack Charts](https://tanstack.com/charts) (`@tanstack/charts`) describes a chart as data: `defineChart({ marks, scales, … })` rendered by `<Chart definition>` from `@tanstack/charts/react` (or `mountChart` from `@tanstack/charts/dom`). bklit charts are React components, so a migration replaces the definition **and** the `<Chart>` element with bklit components.

**Coverage is focused on what bklit supports.** The common, well-mapped case is the KPI / table-cell **sparkline** (`lineY` / `areaY` / `barY` with axes hidden) → `@bklit/sparkline`. Full `lineY` / `areaY` / `barY` charts map to `LineChart` / `AreaChart` / `BarChart` only at a high level — the shapes match, but scales, axes, colour scales and interactions need checking by hand. Every other mark (`dot`, `rect`, `cell`, `ruleX`/`ruleY`, `text`, `arrow`, `frame`, `hexagon`, `link`, `tickX`/`tickY`, `vector`, `areaX`, `facet`) and the vanilla / canvas hosts have no direct bklit mapping: keep those charts on TanStack Charts unless the user agrees to a redesign.

The same ground rules as Recharts apply: never invent props, ask before any needs-workaround conversion, import from `@/components/charts/*` (never `@bklitui/ui/charts`), and remove `@tanstack/charts` only when nothing imports it.

## Detect

`scripts/detect-recharts.mjs` also scans `@tanstack/charts` imports (any subpath). Each `defineChart(...)` call is reported with `"library": "@tanstack/charts"`, the marks it uses, a bklit target and a class:

| Definition | Target | Class |
|---|---|---|
| one `lineY` / `areaY` (+ matching `lineY`) / `barY`, no `z` channel, no legend, axes hidden (`axis: false`) or `<Chart height>` ≤ 120 | `LineSparkline` / `AreaSparkline` / `BarSparkline` (`@bklit/sparkline`) | clean (needs-workaround if a tooltip is enabled) |
| only `lineY` / `areaY` / `barY` / `barX`, with axes or several series | `LineChart` / `AreaChart` / `BarChart` / `ComposedChart` | needs-workaround (high-level mapping) |
| any other mark | — | `keep-tanstack` |

## Sparklines (`LineSparkline`, `AreaSparkline`, `BarSparkline`)

| TanStack Charts | bklit | Notes |
|---|---|---|
| `lineY(rows, …)` alone | `<LineSparkline data={rows} …>` | |
| `areaY(rows, …)` + `lineY(rows, …)` (same `y`) | **one** `<AreaSparkline data={rows} …>` | The area draws its own line. |
| `barY(rows, …)` | `<BarSparkline data={rows} …>` | Bars always include zero. |
| data passed to the mark | `data` | Same rows. |
| `y: "value"` | `dataKey="value"` | Or an accessor `(d, i) => number`. |
| `x: "period"` + `scalePoint()` / `scaleBand()` | — | Sparklines plot rows in order; drop the x channel and scale. Sort rows first. |
| `stroke` | `color` | Use tokens: `var(--chart-1)` … |
| `strokeWidth` | `strokeWidth` | Default 1.5. |
| `curve: "linear" \| "monotoneX" \| "natural" \| "step"` | `curve="linear" \| "monotone" \| "natural" \| "step"` | Default `"monotone"`; other curves → closest. |
| `fill` + `gradients: [...]` | `fill="gradient"` (default) + `fillOpacity` | Peak opacity of the gradient's top stop (default 0.3); drop the gradient definition. Flat fill → `fill="solid"`. |
| `y: { scale: scaleLinear().domain([a, b]) }` | `yDomain={[a, b]}` | Either end may be `undefined`. |
| `axis: false`, `grid: false`, `guides: false`, `clip: true` | — | Sparklines have no axes or grid. |
| `margin` | `padding` | Number or `{ top, right, bottom, left }`. |
| `<Chart width height>` | `width` / `height` | Omit `width` to fill the parent; `height` defaults to 32. |
| `svgAnimation: true` / `renderer={motion({ … })}` (spring transitions) | `animate` (default `true`) + `animationDuration` / `animationEasing` | CSS easing, not springs. Reduced motion is respected automatically (`respectReducedMotion`). |
| `svgAnimation: false` | `animate={false}` | |
| `pointer: false` / all interactions off | `interactive={false}` | No pointer listeners at all. |
| `tooltip` / `tooltip: true` | — | No tooltip by design: `useSparklineHover()` + render `hover.datum` yourself (needs-workaround, ask first). |
| `focus` / crosshair | `crosshair="dashed" \| "solid" \| "gradient" \| false`, `dot` | Hover guide line and hovered-point dot. |
| `ariaLabel` | `aria-label` | Generated from the data when omitted. |
| `idPrefix` | — | Ids are scoped with `useId`. |

Worked example: `examples.md` §10.

## Full charts (high-level)

Map the marks to a bklit root and series, then read `component-map.md` / `prop-map.md` for each prop. Expect to rework scales and chrome.

| TanStack Charts | bklit | Notes |
|---|---|---|
| `lineY(rows, { x, y })` | `LineChart data xDataKey` + `<Line dataKey={y}>` | Time x only: `x` values must be `Date`s (or ISO / epoch ms). Categorical x (`scalePoint`) → map to dates or use `BarChart`. |
| `areaY(rows, { x, y })` | `AreaChart` + `<Area dataKey>` | Same x rule. No area stacking. |
| `barY(rows, { x, y })` | `BarChart xDataKey={x}` + `<Bar dataKey={y}>` + `BarXAxis` | Categorical x. |
| `barX(rows, { x, y })` | `BarChart orientation="horizontal" xDataKey={y}` + `BarYAxis` | The category is TanStack's `y` channel. |
| `barY` + `lineY` on one date axis | `ComposedChart` + `SeriesBar` + `Line` | |
| `z: "series"` (long rows) | one series per value | Pivot to wide rows (`{ date, query, router }`), one `<Line>` per key. |
| `stroke` / `fill` / `color` ordinal scale | series `stroke` / `fill` | Resolve each series' colour; prefer `var(--chart-1…5)`. |
| `colorLegend(...)` | `Legend` (`@bklit/legend`) | Rendered outside the chart. |
| `scales.y.axis` | `YAxis` (`@bklit/y-axis`) | `axis.label` → heading text; tick format → `formatValue`. |
| `scales.y.grid: true` | `<Grid horizontal />` | |
| `scales.y` domain | — | No y-domain prop on full charts (see `rules/gaps.md`). |
| `tooltip` | `ChartTooltip` | `rows` / `content` for formatting. |
| `ruleY` at a value | `Grid highlightRowValues={[v]}` | Workaround; see `rules/gaps.md`. |
| `<Chart height>` | `className="h-[…px]"` or `aspectRatio` | |
| `svgAnimation` / `motion` renderer | built-in enter animation | Root `animationDuration`; `animate={false}` per series. |

## Clean up

Remove `@tanstack/charts` only when the detector reports no `@tanstack/charts` imports left and `rg "@tanstack/charts"` is empty.
