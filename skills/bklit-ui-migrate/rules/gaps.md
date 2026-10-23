# Gaps: Recharts features bklit does not have

bklit charts are opinionated. When a Recharts feature has no bklit prop, **do not invent one** — TypeScript will reject it at best, and at worst an unknown prop is silently ignored and the chart looks wrong. Pick the documented workaround (after asking the user) or keep that chart on Recharts.

Classification used by `scripts/detect-recharts.mjs`:

- **clean** — direct mapping.
- **needs-workaround** — convertible with a data reshape or visual compromise. Ask first.
- **keep-recharts** — leave the chart on Recharts; the project keeps the `recharts` dependency.

---

## Categorical x on Line / Area / Composed / Scatter — needs-workaround

bklit time-series charts convert `row[xDataKey]` with `new Date(value)`. `"January"`, `"Q1"`, `"Chrome"` become `Invalid Date`.

Incorrect:

```tsx
<LineChart data={data} xDataKey="month" xType="category">  {/* no such prop */}
```

Correct — either map categories to real dates (labels then read `"Jan 1"`, tooltip `"Mon, Jan 1"`):

```tsx
const rows = data.map((d, i) => ({ ...d, date: new Date(2024, i, 1) }));
<LineChart data={rows}>…<XAxis /></LineChart>
```

…or, if the category labels matter, render the series as a `BarChart`, or keep Recharts for that chart.

## Numeric x (`XAxis type="number"`) — needs-workaround

The x scale is a time scale over `new Date(value)`. Numbers are treated as epoch ms, so **positions stay proportional** but `XAxis` labels, the date pill and the tooltip title render as dates.

Incorrect:

```tsx
<ScatterChart data={people} xDataKey="height" xScale="linear">
  <XAxis tickFormatter={(v) => `${v} cm`} />
```

Correct — keep the numbers, hide the date chrome, show x yourself:

```tsx
"use client";

import { Grid } from "@/components/charts/grid";
import { Scatter, ScatterChart } from "@/components/charts/scatter-chart";
import { ChartTooltip } from "@/components/charts/tooltip";
import { YAxis } from "@/components/charts/y-axis";

// Sorted by x: hover uses a bisector over the x values.
const people = [
  { height: 158, weight: 54 },
  { height: 165, weight: 61 },
  { height: 171, weight: 68 },
].sort((a, b) => a.height - b.height);

export function HeightWeight() {
  return (
    <div className="w-full">
      <ScatterChart className="h-[320px]" data={people} xDataKey="height">
        <Grid horizontal />
        <Scatter dataKey="weight" fill="#0ea5e9" />
        <YAxis formatValue={(v) => `${v} kg`} />
        <ChartTooltip
          content={({ point }) => (
            <div className="px-3 py-2 text-xs">
              {String(point.height)} cm · {String(point.weight)} kg
            </div>
          )}
          showDatePill={false}
        />
      </ScatterChart>
      <div className="flex justify-between px-12 text-muted-foreground text-xs">
        <span>{people[0]?.height} cm</span>
        <span>{people.at(-1)?.height} cm</span>
      </div>
    </div>
  );
}
```

Recharts `<Scatter data={…}>` per-series arrays must be merged into the root `data` (one row per x with one key per series). Bubble size (`ZAxis`) is not supported → keep Recharts. If the user needs a real numeric axis with ticks, keep Recharts.

## Area stacking (`stackId` on `Area`) and percent stacking (`stackOffset="expand"`) — needs-workaround

Incorrect:

```tsx
<AreaChart data={rows} stacked>              {/* AreaChart has no `stacked` */}
<Area dataKey="mobile" stackId="a" />          {/* no stackId on Area */}
```

Correct — ask the user which they prefer:

1. **Overlap** (simplest): drop `stackId`; each area sits on the baseline. Changes how the top series reads.
2. **Cumulative**: precompute running totals in stacking order and draw the topmost total first, so lower bands paint over it. Keep the raw values for the tooltip:

```tsx
const rows = data.map((d) => ({ ...d, stackTop: d.mobile + d.desktop }));
<AreaChart data={rows}>
  <Area dataKey="stackTop" fill="var(--chart-1)" />
  <Area dataKey="mobile" fill="var(--chart-2)" />
  <ChartTooltip rows={(p) => [
    { color: "var(--chart-1)", label: "Desktop", value: Number(p.desktop) },
    { color: "var(--chart-2)", label: "Mobile", value: Number(p.mobile) },
  ]} />
</AreaChart>
```

For `stackOffset="expand"` also divide each running total by the row total × 100 first. Bars stack natively (`BarChart stacked`).

## Multiple bar stack groups — needs-workaround

Incorrect: `<Bar stackId="a" />` + `<Bar stackId="b" />` mapped to `stacked` (it stacks **everything**), or inventing `stackGroup`.

Correct: one `BarChart stacked` per group side by side, a grouped (unstacked) chart, or keep Recharts.

## Fixed y domain / negative values — needs-workaround

There is no `yDomain`/`domain` prop. Line/Area/Composed use `[0, max × 1.1]` (niced) for non-negative data and `[min − 5 %, max + 5 %]` when any value is negative. `BarChart` and `ScatterChart` always start at 0, so **negative bars and points do not render correctly**.

Incorrect:

```tsx
<YAxis domain={[0, 100]} />           {/* ignored concept — no domain prop */}
<LineChart yDomain={[0, 100]}>        {/* no such prop */}
```

Correct: accept the auto domain (usually fine), or for a percentage chart accept that the top is `max × 1.1`. For negative bars (profit/loss), use a `LineChart`/`ComposedChart` with `Grid highlightRowValues={[0]}`, or keep Recharts.

## X tick formatting and angled ticks — needs-workaround

`XAxis` labels are fixed `"MMM d"` (`en-US`). `BarXAxis`/`BarYAxis` print the category string. No `tickFormatter`, `angle`, `interval="preserveStartEnd"`.

Incorrect: `<XAxis tickFormatter={(d) => format(d, "MMM yyyy")} />`

Correct: for bar charts, reformat the category in the data (`month.slice(0, 3)`); for time charts accept `"MMM d"` or keep Recharts if month/year labels are a requirement. `numTicks` (time) and `maxLabels` (bars) control density.

## Data labels (`LabelList`, `<Label>` on cartesian series, series `label` prop) — needs-workaround

Incorrect: `<Bar dataKey="value" showLabels />`

Correct: drop the labels and rely on `ChartTooltip`, put values in a `Legend` with `LegendValue`, or keep Recharts. On pies/rings, a centre `<Label>` maps to `PieCenter`/`RingCenter` (clean). `FunnelChart` has built-in labels.

## `syncId` — needs-workaround

No cross-chart hover sync. Drop `syncId` (each chart hovers independently) or keep Recharts if synced crosshairs are a requirement.

## `Brush` — needs-workaround

`ChartBrush`/`ChartBrushLayout` exist in bklit's source, but **no `@bklit/*` registry item ships them**, so `npx shadcn add` cannot install them. Do not import `@/components/charts/chart-brush`. Drop the brush (offer a date-range select that slices `data`), or keep Recharts.

## `ReferenceLine` / `ReferenceDot` — needs-workaround

Incorrect: `<ReferenceLine y={0} />` imported from bklit (no such export).

Correct:

- Horizontal line at `y = v` → `<Grid horizontal highlightRowValues={[v]} />` — a solid full-width line at any `v` (style with `highlightRowStroke`, `highlightRowStrokeDasharray`, …; requires `horizontal`, so add `strokeOpacity={0}` if the chart had no grid). No label: put the label in the heading or legend. For a band, `<ReferenceArea y1={a} y2={b} />` (`@bklit/reference-area`).
- Vertical line at a date → `ChartMarkers` (`@bklit/markers`) with `{ date, icon, title }`.
- `ReferenceDot` → `ChartMarkers` at that date (an icon marker with a guide line, not a dot at `(x, y)`).

`ReferenceArea` itself maps cleanly (`x1`, `x2`, `y1`, `y2`).

## Null values / `connectNulls` — needs-workaround

Non-numeric values plot at 0 (a spike to the baseline). Filter those rows, interpolate, or keep Recharts if gaps must be visible.

## `layout="vertical"` on Line / Area / Composed — keep-recharts

Only `BarChart` has `orientation`. Remember the inversion: Recharts `layout="vertical"` = bklit `orientation="horizontal"`.

## Custom renderers: `shape`, `Customized`, `ErrorBar`, `ZAxis`, Sankey `node`/`link`, `activeShape` functions — keep-recharts

Incorrect: passing `shape={<CustomBar />}` or `renderShape` to a bklit series.

Correct: keep that chart on Recharts (or redesign with bklit's built-ins: `Bar lineCap`, `fill="url(#pattern)"`, `PieSlice hoverEffect`).

## Pie: nested rings / slice labels — needs-workaround

One `PieChart` renders one ring. Two `<Pie>`s (inner/outer) → `SunburstChart` (hierarchical data) or keep Recharts. `label`/`labelLine` on `Pie` → `PieCenter` + `Legend`.

## Treemap — keep-recharts

No treemap in bklit. `SunburstChart` shows the same hierarchy radially; only switch if the user agrees to a different chart type.

Incorrect: `import { Treemap } from "@/components/charts/treemap"` (does not exist).

Correct: leave the file untouched, keep `recharts` in `package.json`, and alias imports if the same file also renders bklit charts (`import { Treemap, Tooltip as RechartsTooltip } from "recharts"`).

## Click handlers — needs-workaround

No `onClick` on `Bar`/`Line`/`Area`/`Scatter`. Use `onHoverChange` + `hoveredIndex` on `PieChart`/`RingChart`/`RadarChart`/`FunnelChart`, `ChartMarkers` items (`onClick`, `href`), or keep Recharts for drill-down charts.

## Sparklines: tooltip, axes, multiple series — needs-workaround

`LineSparkline` / `AreaSparkline` / `BarSparkline` (`@bklit/sparkline`) are single-element charts with **no tooltip, axes, grid, legend, reference lines, data labels or second series** — by design. They take no children.

Incorrect:

```tsx
<LineSparkline data={rows} dataKey="value">
  <ChartTooltip />                                  {/* no children */}
</LineSparkline>
<AreaSparkline data={rows} dataKey={["a", "b"]} />  {/* one series only */}
<BarSparkline data={rows} dataKey="v" showAxis />   {/* no axes */}
```

Correct — a Recharts / TanStack tooltip becomes a value you render yourself (ask the user first; it changes where the value appears):

```tsx
"use client";

import { LineSparkline, useSparklineHover } from "@/components/charts/sparkline";

const hover = useSparklineHover<Row>();
const shown = hover.datum ?? rows.at(-1);

<span className="tabular-nums">{shown?.value}</span>
<LineSparkline data={rows} dataKey="value" {...hover.sparklineProps} />
```

- **Axes / grid / labels needed** → it is not a sparkline: use `LineChart` / `AreaChart` / `BarChart`.
- **Two series** → two sparklines sharing one `useSparklineHover()` (synced crosshairs), or a full chart.
- **Dots on every point** → no equivalent; `endDot` marks the last point, `dot` the hovered one.
- **Per-bar colours (`Cell`) / custom `shape`** → no equivalent; keep Recharts or accept one `color`.
- **Real x positions** (uneven dates, numeric x) → sparklines space rows evenly; use a full chart if spacing matters.
