---
name: bklit-ui-migrate
description: >
  Migrate an app's charts from Recharts or TanStack Charts to Bklit UI.
  Detects Recharts usage — direct `recharts` imports or shadcn/ui's
  `components/ui/chart.tsx` wrapper (ChartContainer, ChartConfig,
  ChartTooltipContent, ChartLegendContent) — and `@tanstack/charts`
  definitions (defineChart with lineY / areaY / barY marks), inventories every
  chart, classifies each as clean / needs workaround / keep, installs the
  matching `@bklit/*` shadcn registry items, and rewrites each chart with the
  equivalent bklit components while preserving data, colours, and labels.
  Tiny axis-less charts (Recharts "Tiny" line/area/bar charts, TanStack KPI
  sparklines) become LineSparkline / AreaSparkline / BarSparkline. Use when the
  user asks to replace, migrate, convert, or port Recharts, shadcn charts, or
  TanStack Charts to bklit, to swap sparklines or tiny charts, to remove the
  recharts or @tanstack/charts dependency, or asks what it would take to
  switch chart libraries.
---

# Recharts / TanStack Charts → Bklit UI migration

Bklit charts are shadcn registry components: `npx shadcn@latest add @bklit/<slug>` copies source into the user's project and the code imports it from their own alias, e.g. `@/components/charts/line-chart`. **Never import from `@bklitui/ui/charts`** — that is bklit's private monorepo package.

Work through the steps in order. Do not start rewriting before the inventory (step 1) and classification (step 2) have been shown to the user.

## References

| File | Use it for |
|---|---|
| [references/component-map.md](./references/component-map.md) | Recharts component → bklit export, registry slug, import path |
| [references/prop-map.md](./references/prop-map.md) | Prop-by-prop mapping, units, defaults |
| [references/shadcn-chart.md](./references/shadcn-chart.md) | `ChartContainer` / `ChartConfig` / `ChartTooltipContent` / `ChartLegendContent`, `var(--color-*)`, full before/after |
| [references/examples.md](./references/examples.md) | Before/after: multi-line, stacked bar, horizontal bar, donut, radar, gradient area, tiny line/area/bar → sparklines, TanStack KPI sparkline |
| [references/tanstack-charts.md](./references/tanstack-charts.md) | TanStack Charts (`@tanstack/charts`): marks → sparklines (well covered) and full charts (high-level only) |
| [rules/gaps.md](./rules/gaps.md) | Features with no bklit prop — workaround or keep Recharts (Incorrect/Correct) |
| [scripts/detect-recharts.mjs](./scripts/detect-recharts.mjs) | Zero-dependency inventory + classification (Recharts, shadcn wrapper, TanStack Charts, tiny charts → sparkline) |

Docs for each chart: `https://bklit.com/docs/components/<slug>`.

## Ground rules

1. **Never invent props.** If a Recharts prop has no row in `prop-map.md`, it is a gap — read `rules/gaps.md`. bklit has no `tickFormatter` on `XAxis`, no `domain` on `YAxis`, no `stackId`, no `layout`, no `connectNulls`, no `syncId`.
2. **Line / Area / Composed / Scatter are time-series charts.** x values must be `Date`s (or ISO strings / epoch ms). Categorical x → `BarChart` or a workaround.
   **Tiny charts are sparklines.** One series, no axes / grid / legend, rendered small → `LineSparkline` / `AreaSparkline` / `BarSparkline` from `@bklit/sparkline` (x is row order, so no dates needed). Do not rebuild them with `LineChart` + hidden chrome.
3. **Preserve data, colours and labels.** Same series, same colours (resolved from `ChartConfig`), same human labels in tooltip and legend.
4. **One file at a time**, typecheck after each.
5. **Ask before any "needs workaround" conversion** — it changes how the chart looks or reads.
6. **Leave "keep Recharts" charts untouched.** A partial migration is a valid outcome.

## Step 1 — Detect and inventory

Run the detector from the project root (Node ≥ 18, no install):

```bash
node <skill-dir>/scripts/detect-recharts.mjs . --format=table   # human table
node <skill-dir>/scripts/detect-recharts.mjs .                  # full JSON
```

It walks source files (skipping `node_modules`, `.next`, `dist`, `build`, dot-dirs), finds `recharts` imports (named or `import * as RechartsPrimitive`), shadcn wrapper imports and `@tanstack/charts` imports (each `defineChart(...)` is one chart with `"library": "@tanstack/charts"`), and reports per file: components used, each chart root with line number, notable props (`stackId`, `layout="vertical"`, `syncId`, `XAxis type="number"`, `Treemap`, `LabelList`, `ErrorBar`, custom `shape`/`content`, `Brush`, …), the proposed bklit target, slugs to install, and a classification. Charts it reads as sparklines carry `"sparkline": true` and target `@bklit/sparkline`; axis-less charts of unknown size get a note suggesting it. `shadcnWrappers[].importedBy` lists who still imports `components/ui/chart.tsx`. It never throws; unreadable paths go in `errors`.

The script is a heuristic (it cannot see data values or axes built in helper functions). **Open every listed file** and confirm before presenting. Show the user a table:

| File | Recharts / shadcn components | Chart type | bklit target | Class |
|---|---|---|---|---|
| `components/chart-area-interactive.tsx:51` | AreaChart, Area, CartesianGrid, XAxis, ChartContainer, ChartTooltip(Content), ChartLegend(Content) | Area (stacked) | `AreaChart` | needs workaround |
| `components/storage-treemap.tsx:25` | Treemap, Tooltip, ResponsiveContainer | Treemap | — | keep Recharts |

Also check `components.json`: confirm the `@bklit` registry (`"registries": { "@bklit": "https://ui.bklit.com/r/{name}.json" }`) and note `aliases.components` — it decides the import prefix (default `@/components` → files land in `components/charts/`).

## Step 2 — Classify and confirm

For every chart, state one of:

- **Clean** — every component and prop maps (see `component-map.md`, `prop-map.md`). Data may still need a reshape (pie, radar, radial, ring).
- **Needs workaround** — convertible with a compromise. Typical: categorical or numeric x on a time-series chart, `Area stackId`, multiple bar stack groups, fixed `YAxis domain`, negative bar values, x `tickFormatter`/angled ticks, `LabelList`, `syncId`, `Brush` (bklit's brush is **not** shipped in any registry item), `ReferenceLine`/`ReferenceDot`, null gaps, nested pies.
- **Keep on Recharts** — `Treemap`, `ErrorBar`, `Customized`, custom `shape`/node renderers, `ZAxis` bubbles, `layout="vertical"` on non-bar charts.
- **Keep on TanStack Charts** (`keep-tanstack`) — definitions using marks bklit has no mapping for (`dot`, `cell`, `rect`, `text`, `ruleY`, `hexagon`, `facet`, …). Full `lineY` / `areaY` / `barY` charts are needs-workaround (high-level mapping only); sparkline definitions are clean. See `tanstack-charts.md`.
- **Sparklines** — a `Tooltip` (or TanStack `tooltip`) on a tiny chart is needs-workaround: sparklines have none, so the value moves next to the chart via `useSparklineHover`.

Give the reason for each non-clean chart (quote the prop) and the proposed workaround from `rules/gaps.md`. **Ask the user** which workaround charts to convert and how (e.g. overlap vs cumulative areas). Convert clean charts without further questions unless the user asked to review each.

## Step 3 — Install the bklit items

Install only what the confirmed charts need, using the project's package runner:

```bash
npx shadcn@latest add @bklit/line-chart @bklit/bar-chart @bklit/y-axis @bklit/legend
# pnpm dlx shadcn@latest add …   |   bunx --bun shadcn@latest add …
```

| Needed for | Slug |
|---|---|
| tiny `LineChart` / `AreaChart` / `BarChart`, TanStack `lineY` / `areaY` / `barY` sparklines | `sparkline` (`LineSparkline`, `AreaSparkline`, `BarSparkline`, `useSparklineHover`; no grid/axes/tooltip pulled in) |
| `LineChart` / `AreaChart` / `BarChart` / `ComposedChart` / `ScatterChart` | `line-chart` / `area-chart` / `bar-chart` / `composed-chart` / `scatter-chart` (each brings `grid`, `chart-tooltip`; time charts bring `x-axis`; bar brings `BarXAxis`/`BarYAxis`) |
| `PieChart` / `RadarChart` / ring (`RadialBarChart`) / one-value gauge | `pie-chart` / `radar-chart` / `ring-chart` / `gauge-chart` |
| `FunnelChart` / `Sankey` / `SunburstChart` | `funnel-chart` / `sankey-chart` / `sunburst-chart` |
| any visible value `YAxis` | `y-axis` (not bundled with line/area/bar) |
| `Legend` | `legend` |
| `ReferenceArea` | `reference-area` |
| `ReferenceDot` / event markers | `markers` |

shadcn adds bklit's CSS variables (`--chart-line-primary`, `--chart-grid`, `--chart-crosshair`, tooltip colours, …) to the global stylesheet but **does not overwrite existing variables**, so the user's `--chart-1 … --chart-5` stay as they are. Confirm the files landed where `aliases.components` says before writing imports.

## Step 4 — Convert one file at a time

For each chart:

1. **Reshape data.**
   - Time charts: make `row[xDataKey]` a `Date`. Bare `"2024-04-01"` strings parse as UTC midnight (shows the previous day west of UTC) → `new Date(\`${d}T00:00:00\`)`. Sort by x. Set `xDataKey` when the key is not `"date"` (bar default `"name"`).
   - Series-level `data` (`<Scatter data>`, `<Line data>`) → merge into the root `data`.
   - Pie: `{ label, value, color? }[]`. Radar: `metrics {key,label}[]` + `data {label, color?, values}[]` normalised 0–100. Ring: `{ label, value, maxValue, color? }[]`. Funnel: `{ label, value, color? }[]`. Sankey: unchanged.
2. **Map components and props** with `component-map.md` and `prop-map.md`. Highlights that are easy to get wrong:
   - `ResponsiveContainer` → delete; size with `aspectRatio` (default `"2 / 1"`) or `className="h-[300px]"`.
   - `layout="vertical"` → `BarChart orientation="horizontal"` (inverted naming) + `BarYAxis`.
   - All bars share one `stackId` → root `stacked`.
   - `type="monotone"` → `curve={curveMonotoneX}` from `d3-shape`. Recharts' default curve is linear; bklit `Line` defaults to `curveNatural`, `Area` to `curveMonotoneX`.
   - `dot` → `showMarkers`/`markers`; `activeDot` → `ChartTooltip showDots`/`dotSize`.
   - `isAnimationActive={false}` → `animate={false}` on the series (root `animationDuration`, default 1100 ms).
   - `Bar radius` → `lineCap` (default `"round"`; `"butt"` for square Recharts bars; a number for px).
   - `paddingAngle` (deg) → `padAngle` (rad); pie angles: `rad = (90 − deg) · π / 180`.
   - `YAxis tickFormatter` → `formatValue`; `domain` → none.
   - `Tooltip` → `ChartTooltip` with `rows={(point) => [...]}` for labels/formatting (row order = series child order), `content={({ point, index }) => …}` for full control, `cursor={false}` → `showCrosshair={false}`.
   - `Legend` → `<Legend items>` from `@/components/charts/legend`, rendered **outside** the chart root.
   - `margin`: same shape, but bklit defaults to 40 on every side because axis labels live in the margin.
   - **Sparklines** (`prop-map.md` → "Tiny charts"): `stroke`/`fill` → `color`, `type="monotone"` → `curve="monotone"` (a string), `margin` → `padding`, `radius` → `barRadius`, `isAnimationActive={false}` → `animate={false}`, `ResponsiveContainer` → omit `width`, `Tooltip` → `useSparklineHover` + your own value. Import from `@/components/charts/sparkline`.
   - **TanStack Charts**: replace `defineChart(...)` **and** the `<Chart definition>` element; mark channels become props (`y` → `dataKey`, `stroke` → `color`, `curve` → `curve`, y-scale domain → `yDomain`, `margin` → `padding`, `ariaLabel` → `aria-label`, `svgAnimation` / `motion()` → `animate`). Details: `tanstack-charts.md`.
3. **Preserve colours and labels from `ChartConfig`** (shadcn). Every `var(--color-<key>)` must become the config's colour (e.g. `var(--chart-1)`) — those variables only exist inside `ChartContainer`. Labels go to `rows` and `Legend items`. Details: `shadcn-chart.md`.
4. **Keep the component's public API** (name, props, exports) so call sites do not change.
5. Add `"use client"` if the file passes functions (`rows`, `content`, `formatValue`) and is not already a client component.

## Step 5 — Rewrite imports (watch for collisions)

Import each piece from the file the registry installed:

```tsx
import { Line, LineChart } from "@/components/charts/line-chart";
import { Grid } from "@/components/charts/grid";
import { XAxis } from "@/components/charts/x-axis";
import { YAxis } from "@/components/charts/y-axis";
import { ChartTooltip } from "@/components/charts/tooltip";
import { Legend, LegendItem, LegendLabel, LegendMarker } from "@/components/charts/legend";
import { AreaSparkline, BarSparkline, LineSparkline, useSparklineHover } from "@/components/charts/sparkline";
```

Remove the file's `recharts` and `@/components/ui/chart` imports once nothing in it uses them. Names collide across libraries — `ChartTooltip`, `ChartLegend` (shadcn wrapper) and `LineChart`, `Line`, `Area`, `Bar`, `XAxis`, `YAxis`, `Legend`, `ReferenceArea`, `PieChart`, … (Recharts). In a file that still renders a kept Recharts chart, alias one side:

```tsx
import { Treemap, Tooltip as RechartsTooltip } from "recharts";
import { ChartTooltip as BklitChartTooltip } from "@/components/charts/tooltip";
```

The registry's legend item export is `LegendItem` (the docs' `LegendItemComponent` alias exists only in bklit's monorepo barrel).

## Step 6 — Remove the old code only when unused

- Delete `components/ui/chart.tsx` **only** when no file imports it: re-run the detector (`shadcnWrappers[].importedBy` empty) **and** search the repo (`rg "ui/chart"`), including stories, tests and docs.
- Remove the `recharts` dependency **only** when the detector reports no `recharts` imports left (no kept charts) and `rg "from ['\"]recharts"` is empty. Use the project's package manager (`npm uninstall recharts`, `pnpm remove recharts`, …).
- Remove `@tanstack/charts` **only** when the detector reports no `@tanstack/charts` imports left and `rg "@tanstack/charts"` is empty.
- If any chart is kept on Recharts or TanStack Charts, keep that dependency and say so in the summary.

## Step 7 — Verify

1. Typecheck and lint after each file, then build: `npx tsc --noEmit` (or the project's `typecheck` script), the project's lint script, then `build`.
2. Visual comparison: run the dev server and compare each converted chart with the original (screenshots before/after, light and dark mode). Check: series count and colours, labels in tooltip and legend, x labels/dates (UTC shift), y range, stacking, sizing, hover, empty state.
3. Expected, acceptable differences to call out: bklit's enter animation, dashed/edge-faded grid, crosshair + date pill tooltip, fixed `"MMM d"` x labels, rounded bars by default.
4. Re-run the detector and report what is left on Recharts and why.

## Finish

Summarise for the user: charts converted (file → bklit chart), workarounds applied, charts kept on Recharts with reasons, items installed, files/dependencies removed, and verification results.

For restyling the migrated charts (palette, tokens, typography, motion), hand off to the **bklit-ui-design** skill; for general bklit composition questions use the **bklit-ui** skill.
