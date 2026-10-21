# Theming: fit the charts to the host app

Goal: charts that look like they shipped with the app. Work from the
`detect-design.mjs` JSON, change as little global CSS as possible, and never
break the host's existing components.

## What `shadcn add @bklit/...` does to CSS

Verified against the shadcn CLI source (v4.x):

- `@bklit/chart-context` carries `cssVars.light` / `cssVars.dark` (`--chart-1..5`,
  `--chart-background`, `--chart-foreground(-muted)`, `--chart-line-primary/secondary`,
  `--chart-crosshair`, `--chart-grid`, `--chart-brush-border`, `--chart-tooltip-*`,
  `--chart-marker-*`, `--chart-label`, `--chart-scale-01..05`,
  `--chart-scale-pattern-color`). `@bklit/legend` carries `--legend`,
  `--legend-foreground`, `--legend-muted`, `--legend-muted-foreground`, `--legend-track`.
- Variables the host **already defines are left alone**; only missing ones are
  appended to `:root` / `.dark`. So a host with its own `--chart-1..5` keeps them.
- Tailwind v4 only: each colour-valued var also gets an `@theme inline` entry
  (`--color-chart-label: var(--chart-label)` etc.), which is what makes classes
  like `text-chart-label` and `bg-chart-tooltip-background` work.
- Tailwind v3: nothing is written to `tailwind.config` (bklit items have no
  `tailwind` key) — see "Tailwind v3" below.
- bklit's defaults are the **Primary** palette: indigo, yellow, fuchsia, mist and
  black (`--chart-1: oklch(0.585 0.233 277.117)` …; `--chart-5` is white in dark
  mode). If the host had no chart palette, the charts get these colours until you
  seed one that matches the brand.

## Tokens bklit actually reads

| Token | Used for |
|---|---|
| `--chart-1` … `--chart-5` | Series / slices / rings / gradients / pattern strokes |
| `--chart-line-primary`, `--chart-line-secondary` | Default `Line`/`Area`/`Bar` colour (`= var(--chart-1)` / `var(--chart-2)`) |
| `--chart-grid` | `Grid`, `Background`, `BarColumnTrack`, reference-area defaults |
| `--chart-label` | Axis tick labels (`text-chart-label`) |
| `--chart-foreground-muted` | Highlighted grid rows, reference-area stroke/pattern |
| `--chart-crosshair` | Tooltip crosshair |
| `--chart-tooltip-background/foreground/muted` | Tooltip panel (Tailwind classes) |
| `--chart-marker-*`, `--chart-marker-badge-*` | `ChartMarkers` |
| `--chart-scale-01..05`, `--chart-scale-pattern-color` | Heatmap / choropleth levels |
| `--legend*` | `Legend` components (Tailwind classes) |
| `--foreground` | Loading pulse, loading sweep, grid shimmer |
| `--border` | Ring tracks, gauge tracks, radar grid/axis, heatmap separators |
| `--popover`, `--popover-foreground` | Live-line value badge |
| `--muted-foreground` | Loading label |

`--chart-indicator-color`, `--chart-indicator-secondary-color`,
`--chart-segment-*` and `--chart-marker-badge-*` are referenced by
`chartCssVars` but not shipped in registry cssVars — define them only if you use
those features.

## Decision table

| Detected | Do |
|---|---|
| Host has `--chart-1..5` (any format except bare channels) | Keep them. Do not overwrite. Only fill gaps (`--chart-grid`, `--chart-label`, tooltip) if bklit's defaults clash. |
| `--chart-1..5` are the untouched shadcn defaults **and** the user asked to match the brand | Re-seed from `--primary` (below), in both light and dark. |
| No `--chart-*` at all | Seed from `--primary` **before** or right after install, otherwise charts use bklit's default Primary palette rather than the brand. |
| `chartVarsFormat: "hsl-channels"` (Tailwind v3 shadcn) | Scope a wrapper (below). Never rewrite the global vars — recharts/shadcn `ChartContainer` consumes `hsl(var(--chart-N))`. |
| `colorFormat` oklch / hsl / hex | Write new values in the same notation. |
| `colorFormat: "tailwind-var"` (e.g. `var(--color-neutral-800)`) | Write chart tokens as palette references too (`var(--color-violet-500)`), v4 only. |
| `darkMode.strategy: "class"` | Put dark overrides in the existing `.dark { }` block. |
| `"media"` | Use `@media (prefers-color-scheme: dark) { :root { … } }`. |
| `"data-attribute"` | Use the host's `[data-theme="dark"]` selector. |
| `radius` | Map to bar caps / square radius (rules/taste.md §4). |

## Seeding a palette from `--primary`

Make `--chart-1` the brand colour, then step lightness so series stay
distinguishable; keep hue within ~±40° of the brand so it reads as one family.
Light mode runs dark→light, dark mode light→dark.

Example — host `--primary: oklch(0.541 0.281 293.009)` (violet), oklch format:

```css
:root {
  --chart-1: oklch(0.541 0.281 293.009);
  --chart-2: oklch(0.62 0.21 283);
  --chart-3: oklch(0.7 0.16 273);
  --chart-4: oklch(0.79 0.11 263);
  --chart-5: oklch(0.88 0.06 253);
}

.dark {
  --chart-1: oklch(0.606 0.25 292.717);
  --chart-2: oklch(0.54 0.21 283);
  --chart-3: oklch(0.47 0.17 273);
  --chart-4: oklch(0.4 0.13 263);
  --chart-5: oklch(0.33 0.09 253);
}
```

Same idea in `hsl()`: keep `H`, step `L` by ~8–10 points, ease `S` down as `L`
moves away from the brand. For a categorical need (pie with unrelated
categories), rotate hue by ~60° per step at constant lightness instead.

Align chart chrome with the host (all of these exist in standard shadcn themes):

```css
:root {
  --chart-grid: var(--border);
  --chart-label: var(--muted-foreground);
  --chart-tooltip-background: var(--popover);
  --chart-tooltip-foreground: var(--popover-foreground);
  --chart-tooltip-muted: var(--muted-foreground);
}
```

bklit.com maps its tooltip tokens the same way. Put these in `:root` only —
they follow dark mode through the referenced vars. Only valid when the host's
vars are full colours (not bare HSL channels).

## Re-declare derived tokens when you scope

Custom properties that reference other properties resolve **where they are
declared**. `--chart-line-primary: var(--chart-1)` is computed on `:root`, so a
wrapper that only overrides `--chart-1` does not change `--chart-line-primary`.
Whenever you override `--chart-N` on a non-root selector, also re-declare:

```css
--chart-line-primary: var(--chart-1);
--chart-line-secondary: var(--chart-2);
--chart-brush-border: var(--chart-grid);
```

## Tailwind v4 checklist

1. After install, confirm `@theme inline` contains at least
   `--color-chart-label`, `--color-chart-tooltip-background`,
   `--color-chart-tooltip-foreground`, `--color-chart-tooltip-muted`
   (and `--color-legend*` when using `@bklit/legend`). The detect script warns
   when bklit is installed and they are missing. Add them by hand if the CSS file
   is not where `components.json` points:

   ```css
   @theme inline {
     --color-chart-label: var(--chart-label);
     --color-chart-tooltip-background: var(--chart-tooltip-background);
     --color-chart-tooltip-foreground: var(--chart-tooltip-foreground);
     --color-chart-tooltip-muted: var(--chart-tooltip-muted);
     --color-legend: var(--legend);
     --color-legend-foreground: var(--legend-foreground);
     --color-legend-muted: var(--legend-muted);
     --color-legend-muted-foreground: var(--legend-muted-foreground);
     --color-legend-track: var(--legend-track);
   }
   ```
2. Candlestick, profit/loss and scatter defaults read `--chart-positive` /
   `--chart-negative` (added by `chart-context` cssVars) and fall back to the
   Tailwind default palette (`--color-emerald-500`, `--color-red-500`), which
   exists automatically in v4. `--color-zinc-500` is likewise built in. `--color-muted` (funnel grid bands) exists only if the
   host maps `--muted` in `@theme inline` (shadcn v4 does).
3. Make sure Tailwind scans the charts folder (it does by default for files under
   the project; add `@source` only for out-of-tree paths).

## Tailwind v3 (shadcn "hsl channels" hosts)

Verified by grepping the bklit sources (`packages/ui/src/charts`):

**a. Utility classes that need config.** These classes are used and only
resolve if the colours exist in `theme.extend.colors`:

| Class | Files |
|---|---|
| `text-chart-label` | `x-axis`, `y-axis`, `bar-x-axis`, `live-x-axis`, `live-y-axis`, `chart-stat-flow`, `heatmap/*` |
| `bg-chart-tooltip-background`, `text-chart-tooltip-foreground` | `tooltip/tooltip-box`, `tooltip/tooltip-content` |
| `text-chart-tooltip-muted`, `border-chart-tooltip-muted` | `tooltip/tooltip-content`, `markers/chart-markers`, `heatmap/heatmap-tooltip` |
| `text-legend-foreground`, `text-legend-muted-foreground`, `bg-legend-muted`, `bg-legend-track` | `legend/*` |

Extend the existing `chart` colour group:

```ts
// tailwind.config.ts → theme.extend.colors
chart: {
  "1": "hsl(var(--chart-1))", // host's existing entries stay
  // …
  label: "var(--chart-label)",
  "tooltip-background": "var(--chart-tooltip-background)",
  "tooltip-foreground": "var(--chart-tooltip-foreground)",
  "tooltip-muted": "var(--chart-tooltip-muted)",
},
legend: {
  DEFAULT: "var(--legend)",
  foreground: "var(--legend-foreground)",
  muted: { DEFAULT: "var(--legend-muted)", foreground: "var(--legend-muted-foreground)" },
  track: "var(--legend-track)",
},
```

(bklit's own values are full `oklch()` colours, so no `hsl()` wrapper.)

**b. Tailwind v4 palette variables.** These do not exist in v3:

| Variable | Where | Effect if missing |
|---|---|---|
| `--color-red-500`, `--color-emerald-500` | Fallbacks after `--chart-negative` / `--chart-positive` in `candlestick.tsx`, `candlestick-chart.tsx`, `profit-loss-line.tsx`, `profit-loss-legend.tsx`, `scatter.tsx` (`yGradient` enabled without `from`/`to`) | Harmless when `--chart-positive` / `--chart-negative` are defined; otherwise candles / P&L segments / scatter gradient render with an invalid colour |
| `--color-zinc-500` | `bar-y-axis.tsx` | Only a fallback after `--chart-label`; harmless when `--chart-label` exists |
| `--color-muted` | `funnel-chart.tsx` (grid `bandColor` default) | Funnel bands invisible |

Fix once in `:root` (these are Tailwind's own v3 palette values; defining them
does not collide with anything in v3):

```css
@layer base {
  :root {
    --color-red-500: #ef4444;
    --color-emerald-500: #10b981;
    --color-zinc-500: #71717a;
    --color-muted: hsl(var(--muted));
  }
}
```

Or pass explicit colours (`positiveColor` / `negativeColor` on `ProfitLossLine`,
`positiveFill` / `negativeFill` on candlesticks, `yGradient={{ from, to }}` on
`Scatter`, `grid={{ bandColor }}` on `FunnelChart`).

**c. Bare-channel tokens.** shadcn v3 themes store `--chart-1: 12 76% 61%`,
`--foreground: 222.2 84% 4.9%`, etc. bklit reads `var(--chart-1)` /
`var(--foreground)` / `var(--border)` / `var(--popover)` as complete colours,
so on these hosts series, loading pulses, ring tracks and live-line badges come
out invalid (usually black or transparent). shadcn will not overwrite the
existing `--chart-1..5`. Do **not** rewrite the globals (recharts code uses
`hsl(var(--chart-1))`). Scope a wrapper around bklit charts only:

```css
@layer base {
  .bklit-chart {
    --chart-1: hsl(12 76% 61%);
    --chart-2: hsl(173 58% 39%);
    --chart-3: hsl(197 37% 24%);
    --chart-4: hsl(43 74% 66%);
    --chart-5: hsl(27 87% 67%);
    --chart-line-primary: var(--chart-1);
    --chart-line-secondary: var(--chart-2);
    --foreground: hsl(222.2 84% 4.9%);
    --border: hsl(214.3 31.8% 91.4%);
    --muted-foreground: hsl(215.4 16.3% 46.9%);
    --popover: hsl(0 0% 100%);
    --popover-foreground: hsl(222.2 84% 4.9%);
  }
  .dark .bklit-chart {
    --chart-1: hsl(220 70% 50%);
    --chart-2: hsl(160 60% 45%);
    --chart-3: hsl(30 80% 55%);
    --chart-4: hsl(280 65% 60%);
    --chart-5: hsl(340 75% 55%);
    --chart-line-primary: var(--chart-1);
    --chart-line-secondary: var(--chart-2);
    --foreground: hsl(210 40% 98%);
    --border: hsl(217.2 32.6% 17.5%);
    --muted-foreground: hsl(215 20.2% 65.1%);
    --popover: hsl(222.2 84% 4.9%);
    --popover-foreground: hsl(210 40% 98%);
  }
}
```

Copy the numbers from the host's own `:root` / `.dark` blocks (the values above
are the stock shadcn slate theme). Wrap only the chart element:
`<div className="bklit-chart"><LineChart …/></div>` — keep shadcn components out
of the wrapper, since they expect the channel form.

## Dark mode checks

- Every new token needs a dark value (or a `var()` that has one).
- `--chart-grid` in dark should be low-contrast (bklit default `oklch(0.25 0 0)`;
  bklit.com uses `oklch(0.6 0.0124 243.77 / 0.25)`); patterns on it then stay subtle.
- Gradient stops that go to `transparent` are safe in both modes; stops to
  `white`/`black` are not.
- If the host uses `next-themes` with `attribute="class"`, `.dark` on `<html>` is
  enough; with `attribute="data-theme"`, use that selector.
