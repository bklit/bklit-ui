---
name: bklit-ui
description: >
  Install, compose, theme, and animate Bklit UI charts (the @bklit shadcn
  registry) in a React / Next.js app. Use when the user wants a chart, graph,
  or data visualization: line, area, bar, live/streaming line, composed,
  scatter, candlestick/OHLC, pie, ring/donut, radar, gauge, heatmap, funnel,
  sankey, sunburst, or choropleth/world map; a sparkline, dashboard, analytics
  page, KPI or stat card; chart tooltips, crosshairs, legends, markers,
  reference bands, projections, trend lines, axes, or grids; or when code imports from
  components/charts/* or mentions @bklit/* or bklit.com. For styling vocabulary
  (patterns, squircle/rounded/3D bars, fades, loading looks, matching the app
  theme) also use bklit-ui-design. For moving from Recharts or shadcn
  ChartContainer to Bklit, use bklit-ui-migrate.
allowed-tools: Bash(npx shadcn@latest *), Bash(pnpm dlx shadcn@latest *), Bash(bunx --bun shadcn@latest *), Bash(yarn dlx shadcn@latest *)
---

# Bklit UI

Composable React chart components (visx + motion) distributed through the `@bklit` shadcn registry. `shadcn add` copies the **source** into the user's project — the user owns that code, and it is the source of truth for props.

> Run the shadcn CLI with the project's package runner: `npx shadcn@latest`, `pnpm dlx shadcn@latest`, `bunx --bun shadcn@latest`, or `yarn dlx shadcn@latest`.

## Current Project Context

```json
!`npx shadcn@latest info --json`
```

If the block above is empty or still shows the command (agents that do not expand `!` injections), run `npx shadcn@latest info --json` yourself before writing code. Use it for framework, aliases (`@/…`), Tailwind version, and installed components.

- **No `components.json`?** Run `npx shadcn@latest init` first.
- **No `@bklit` in `registries`?** Add `"@bklit": "https://ui.bklit.com/r/{name}.json"` (see [installation.md](./rules/installation.md)), or install by URL: `npx shadcn@latest add https://ui.bklit.com/r/line-chart.json`.

## Principles

1. **Install before inventing.** `npx shadcn@latest add @bklit/<item>` — never hand-roll SVG charts or reimplement a registry piece.
2. **Import from the installed files, never from `@bklitui/ui/charts`.** That is a private monorepo package. Items install to `components/charts/<file>.tsx` (under `src/` when the project uses it); import with the user's alias, e.g. `@/components/charts/line-chart`. See [Imports](#imports).
3. **Read the installed source.** After `add`, open the files in `components/charts/` to confirm prop names and defaults before using them.
4. **Compose, don't flatten.** Root chart → `Grid`/`Background` → series → axes → overlays → `ChartTooltip`. See [composition.md](./rules/composition.md).
5. **Theme with tokens.** `--chart-*` variables and `chartCssVars`, not one-off hex values. See [theming.md](./rules/theming.md).

## Imports

There is no barrel for component items — import each export from the file that defines it (paths relative to the `components/charts/` alias):

| Import from | Exports |
|---|---|
| `line-chart` | `LineChart`, `Line` |
| `area-chart` | `AreaChart`, `Area` |
| `bar-chart` / `bar` / `bar-x-axis` / `bar-y-axis` | `BarChart` / `Bar` / `BarXAxis` / `BarYAxis` |
| `composed-chart` / `series-bar` | `ComposedChart` / `SeriesBar` (+ `Line`, `Area` from their charts) |
| `scatter-chart` | `ScatterChart`, `Scatter` |
| `candlestick-chart` / `candlestick` | `CandlestickChart` / `Candlestick` |
| `live-line-chart` / `live-line` / `live-x-axis` / `live-y-axis` | `LiveLineChart` / `LiveLine` / `LiveXAxis` / `LiveYAxis` |
| `pie-chart` / `pie-slice` / `pie-center` | `PieChart` / `PieSlice` / `PieCenter` |
| `ring-chart` / `ring` / `ring-center` | `RingChart` / `Ring` / `RingCenter` |
| `radar-chart`, `radar-grid`, `radar-axis`, `radar-labels`, `radar-area` | one component each |
| `gauge` | `Gauge` (installed by `@bklit/gauge-chart`) |
| `funnel-chart` | `FunnelChart` |
| `sunburst-chart`, `sunburst-segment`, `sunburst-center`, `sunburst` (`buildArcs`) … | sunburst parts |
| `heatmap` · `choropleth` · `sankey` | folder `index.ts` re-exports every part |
| `grid` · `x-axis` · `y-axis` · `background` · `reference-area` · `projection-line` · `trend-line` | `Grid` · `XAxis` · `YAxis` · `Background` · `ReferenceArea` · `ProjectionLine` · `TrendLine` |
| `band` · `bollinger` | `Band` · `withBollingerBands` (installed by `@bklit/line-chart`, also `@bklit/band`) |
| `weekends` · `deadline` | `Weekends` · `Deadline` (date-axis shading and due-date marker) |
| `tooltip` · `legend` · `markers` · `patterns` | folder `index.ts` (`ChartTooltip`, `Legend*`, `ChartMarkers`, `Pattern*`) |
| `chart-context` | `chartCssVars`, `useChart`, `TooltipData` |

```tsx
import { LineChart, Line } from "@/components/charts/line-chart";
import { Grid } from "@/components/charts/grid";
import { XAxis } from "@/components/charts/x-axis";
import { ChartTooltip } from "@/components/charts/tooltip";
import { chartCssVars } from "@/components/charts/chart-context";
```

## Critical Rules

### Composition → [composition.md](./rules/composition.md)
- Series, axes, overlays, and `ChartTooltip` are **children of the root chart** — they read chart context.
- **One root per chart.** Mixed bars + lines on dates → `ComposedChart` with `SeriesBar` (not `Bar`).
- **`Grid` (or `Background`) first** so series paint above it.
- Live charts use **`LiveLine`**, `LiveXAxis`, `LiveYAxis` — not `Line`/`XAxis`.
- `BarChart` uses **`BarXAxis`** / `BarYAxis` (band scale), not `XAxis`.

### Theming → [theming.md](./rules/theming.md)
- `--chart-1` … `--chart-5` for series; `chartCssVars.linePrimary` etc. for semantic roles.
- The registry **adds** missing `--chart-*` tokens without overwriting the app's existing ones.
- Override tokens in `:root` / `.dark`; no `dark:` classes on chart SVG.

### Tooltips → [tooltips.md](./rules/tooltips.md)
- `ChartTooltip` `content` receives `({ point, index })`; `rows` returns `{ color, label, value }[]`.
- `indicatorColor` is a string or `(point) => string`.
- Custom crosshairs/indicators use `useChart()` — never global mouse listeners.

### Overlays → [overlays.md](./rules/overlays.md)
- `ChartMarkers` is a **sibling** of `ChartTooltip`; marker hover content goes inside `ChartTooltip` children.
- `ChartBrush` has **no registry item** — don't promise `@bklit/brush`.
- `TrendLine` (`@bklit/trend-line`) fits an existing series' `dataKey`; place it after that series (line, area, bar incl. horizontal, composed).

### Animation and loading → [animation.md](./rules/animation.md), [loading.md](./rules/loading.md)
- Default enter: **1100ms**, ease `cubic-bezier(0.85, 0, 0.15, 1)`; bars stagger across ~40% of that.
- Replay with `revealSignature` or a new `key`.
- `status="loading"` on `LineChart` / `AreaChart` / `BarChart` / `HeatmapChart` — one instance, no component swap.
- Reduced motion is only **partially** handled internally — see animation.md.

### Installation → [installation.md](./rules/installation.md)
- Let `shadcn add` install npm deps and `@bklit/*` registry dependencies; don't pin `@visx/*` by hand.
- Don't install `*-example` items into an existing app — they write `app/page.tsx`.

## Catalog

All items install with `npx shadcn@latest add @bklit/<item>`. For any `<item>`:

- Docs: `https://bklit.com/docs/components/<item>` (add-ons live under `https://bklit.com/docs/utility/…`, e.g. `/tooltip`, `/legend`, `/axis/y-axis`)
- Gallery: `https://bklit.com/charts/<item>` · Studio (tune props, copy code): `https://bklit.com/studio?chart=<item>`
- Registry JSON: `https://ui.bklit.com/r/<item>.json`

### Charts

| Item | Use when |
|---|---|
| `line-chart` | Time series, multi-line trends, sparklines, markers, dashed tails |
| `area-chart` | Trends with filled regions, gradient/pattern fills, stat-card sparklines |
| `bar-chart` | Category comparisons; grouped, stacked, horizontal, square-column bars |
| `composed-chart` | Bars + lines/areas on one date axis, dual Y axes |
| `live-line-chart` | Streaming / real-time values (`{ time: unixSeconds, value }`) |
| `scatter-chart` | Point clouds over time, multiple series |
| `candlestick-chart` | OHLC financial data |
| `profit-loss-line` | One series crossing zero, colored by sign (studio slug too) |
| `pie-chart` | Part-to-whole slices, optional center stat |
| `ring-chart` | Concentric progress rings / donut KPIs |
| `radar-chart` | Multi-metric comparison across entities |
| `gauge-chart` | Single value 0–100, arc or linear notched track |
| `heatmap-chart` | Calendar / contribution grids, binned intensity |
| `funnel-chart` | Stage-to-stage conversion |
| `sankey-chart` | Flows between nodes |
| `sunburst-chart` | Hierarchical part-to-whole with drill-down |
| `choropleth-chart` | Geo regions colored by value (world/country maps) |

### Add-ons (most install automatically as dependencies)

`grid`, `x-axis`, `y-axis` (not pulled in by line/area — add it for a value axis), `chart-tooltip`, `legend`, `markers`, `background`, `patterns`, `reference-area`, `projection-line`, `trend-line` (least-squares trend overlay for line/area/bar/composed), `band` (range / Bollinger band on `LineChart`; already in `line-chart`), `bar-depth` (3D/extruded bars on `BarChart`), `chart-stat-flow` (animated stat number used by pie/ring/gauge centers and stat cards). Internal plumbing items (`chart-context`, `chart-animation`, `chart-series`, `chart-utils`, `chart-parent-size`, `utils`, `shimmering-text`) come in automatically.

**Brush:** `ChartBrush` / `ChartBrushLayout` (docs: `/docs/utility/brush`) are **not** in any registry item today. If the user needs brush zoom, say so and point to the docs/source rather than inventing an install command.

### Blocks (stat cards; browse at https://bklit.com/blocks)

| Item | What |
|---|---|
| `stat-card-area-01` | Revenue card: gradient area sparkline, NumberFlow value, trend badge |
| `stat-card-line-01` | Sessions card: line sparkline with overlaid value, trend badge |
| `stat-card-choropleth-01` | Visitors card: choropleth sparkline map, trend badge |

Blocks need shadcn `card` + `badge`, write sample data under `data/`, and import from a `@/components/charts` **barrel** (`components/charts/index.ts`) that they create. Installing a second block overwrites that barrel and shared files (`stat-card-chart.tsx`, `trend-badge.tsx`) — merge them by hand.

## Workflow

1. Get project context (injection above or `npx shadcn@latest info --json`); confirm `@bklit` is configured.
2. Pick the item from the catalog by the story the data tells; ask if unclear.
3. Install: `npx shadcn@latest add @bklit/<item>` (plus `@bklit/y-axis`, `@bklit/legend`, etc. if needed).
4. **Read the installed source** in `components/charts/` (the files the CLI just wrote) — confirm exports, prop names, defaults, and data shape. Prefer it over memory or docs if they disagree.
5. Compose root → grid → series → axes → overlays → tooltip; import from the installed paths with the project alias.
6. Theme with tokens; check light and dark.
7. Point the user to the gallery / Studio URL for variants.

## Quick Reference

```bash
npx shadcn@latest info --json
npx shadcn@latest add @bklit/line-chart @bklit/y-axis
npx shadcn@latest view @bklit/line-chart     # inspect files before installing
```

```tsx
"use client";

import { ChartTooltip } from "@/components/charts/tooltip";
import { Grid } from "@/components/charts/grid";
import { Line, LineChart } from "@/components/charts/line-chart";
import { XAxis } from "@/components/charts/x-axis";

const data = [
  { date: new Date("2025-01-01"), users: 1200, sessions: 1800 },
  { date: new Date("2025-02-01"), users: 1350, sessions: 1950 },
];

export function UsersChart() {
  return (
    <LineChart data={data}>
      <Grid horizontal />
      <Line dataKey="users" stroke="var(--chart-1)" />
      <Line dataKey="sessions" stroke="var(--chart-2)" />
      <XAxis />
      <ChartTooltip />
    </LineChart>
  );
}
```

## Related skills

- **[bklit-ui-design](../bklit-ui-design/SKILL.md)** — design vocabulary and recipes: patterns and textures, squircle / rounded / 3D bars, edge fades, gradients, loading looks, and matching charts to the app's theme. Use it when the request is about how a chart *looks*.
- **[bklit-ui-migrate](../bklit-ui-migrate/SKILL.md)** — move Recharts or shadcn `ChartContainer` / `ChartConfig` charts to Bklit equivalents.

Install all three with `npx skills add bklit/bklit-ui`.

## References

- [composition.md](./rules/composition.md) — structure, data shapes, multi-series
- [theming.md](./rules/theming.md) — tokens, `chartCssVars`, dark mode
- [tooltips.md](./rules/tooltips.md) — `ChartTooltip` props, custom content, `useChart`
- [overlays.md](./rules/overlays.md) — legend, markers, reference area, projection, trend line, background, brush
- [animation.md](./rules/animation.md) — enter timing, replay, live charts, reduced motion
- [loading.md](./rules/loading.md) — `status`, skeletons, loading labels
- [installation.md](./rules/installation.md) — registry setup, file layout, dependencies
