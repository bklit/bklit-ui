# Theming

Charts read CSS custom properties. `@bklit/chart-context` (installed with every cartesian chart) declares the `--chart-*` tokens in the registry `cssVars`.

## How install affects the app's tokens

`shadcn add` **merges** registry `cssVars` into the app's stylesheet without overwriting variables that already exist (only `registry:theme` / `registry:style` items overwrite). So:

- If the app already defines `--chart-1` … `--chart-5` (standard shadcn themes do), those survive and the charts use them.
- `chart-context` only **adds** the tokens that are missing (`--chart-background`, `--chart-grid`, `--chart-crosshair`, `--chart-line-primary`, `--chart-tooltip-*`, `--chart-scale-*`, …).

Don't "fix" colors by reinstalling; edit the tokens.

## Use `chartCssVars`

`chartCssVars` (from `@/components/charts/chart-context`) gives typed `var(--chart-…)` strings.

### Incorrect

```tsx
<line stroke="var(--chart-crosshiar)" />  {/* typo, silently black */}
<Line dataKey="users" stroke="#3b82f6" />  {/* ignores theme + dark mode */}
```

### Correct

```tsx
import { chartCssVars } from "@/components/charts/chart-context";

<line stroke={chartCssVars.crosshair} />
<Line dataKey="users" stroke={chartCssVars.linePrimary} />
```

Keys: `background`, `foreground`, `foregroundMuted`, `label`, `linePrimary`, `lineSecondary`, `crosshair`, `grid`, `indicatorColor`, `indicatorSecondaryColor`, `markerBackground`, `markerBorder`, `markerForeground`, `badgeBackground`, `badgeForeground`, `segmentBackground`, `segmentLine`, `brushBorder`, `tooltipBackground`.

All of these, including `--chart-indicator-*`, `--chart-marker-badge-*` and `--chart-segment-*`, are declared by `chart-context`'s registry `cssVars` (light + dark).

## Series palette

- Multi-series: `var(--chart-1)` … `var(--chart-5)`. Default is the **Primary** palette (indigo, yellow, fuchsia, mist, black / white in dark). Other built-in palettes (Monochrome, Ocean, Sunset, Grove, Vivid) can be exported as CSS from the palette menu at https://bklit.com/docs/theming#palettes.
- Up / down (profit-loss, candlesticks, scatter y-gradient): `--chart-positive` / `--chart-negative` (registry `cssVars`; components fall back to Tailwind emerald-500 / red-500 when unset). Use `text-chart-positive` / `text-chart-negative` for matching tooltip text after mapping `--color-chart-positive` / `--color-chart-negative` in `@theme inline`.
- Single-line defaults: `--chart-line-primary` (→ `--chart-1`) and `--chart-line-secondary` (→ `--chart-2`).
- Heatmap / choropleth intensity: `--chart-scale-01` … `--chart-scale-05`, `--chart-scale-pattern-color` (`chartScaleCssVars` from `chart-scale`).
- Ring tracks, gauge notches, radar grid: shadcn `--border`.
- Legend: `--legend`, `--legend-foreground`, `--legend-muted`, `--legend-muted-foreground`, `--legend-track` (added by `@bklit/legend`).

Use hex/oklch literals only for explicit brand colors, and prefer adding them as tokens.

## Dark mode

Override tokens in `:root` and `.dark` — never sprinkle `dark:` classes on chart SVG elements.

```css
:root {
  --chart-grid: oklch(0.9 0 0);
  --chart-crosshair: oklch(0.4 0.18 274);
}
.dark {
  --chart-grid: oklch(0.25 0 0);
  --chart-crosshair: oklch(0.45 0 0);
}
```

## Tooltip surfaces

The default tooltip panel uses `--chart-tooltip-background` / `--chart-tooltip-foreground` / `--chart-tooltip-muted` (default `var(--popover)` / `var(--popover-foreground)` / `var(--muted-foreground)`, with a backdrop blur). For custom `content`, either reuse those or use `bg-popover text-popover-foreground` so text stays readable.

## Tailwind v4 `@theme` mapping

Axis labels, tooltips, and legends use classes (`text-chart-label`, `bg-chart-tooltip-background`, `text-chart-tooltip-foreground`, `text-chart-tooltip-muted`, `text-legend-foreground`, …). On Tailwind v4, `shadcn add` writes `@theme inline` entries for every token, each pointing at the **two-dash** variable:

```css
@theme inline {
  --color-chart-label: var(--chart-label);
  --color-chart-tooltip-background: var(--chart-tooltip-background);
  --color-chart-tooltip-foreground: var(--chart-tooltip-foreground);
  --color-chart-tooltip-muted: var(--chart-tooltip-muted);
  --color-legend-foreground: var(--legend-foreground);
  /* …and --color-legend, --color-legend-muted, --color-legend-muted-foreground, --color-legend-track */
}
```

Apps installed before bklit-ui#235 was fixed may have `var(----chart-…)` (four dashes) in `@theme`, so labels and tooltip text have no color. `shadcn add` won't rewrite existing lines: replace `var(----` with `var(--`, then re-add `@bklit/chart-context` to fill in missing tokens and `--color-chart-tooltip-*` lines.

For matching charts to a brand or app theme in depth, see the **bklit-ui-design** skill.

Docs: https://bklit.com/docs/theming
