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

`--chart-indicator-color`, `--chart-indicator-secondary-color`, `--chart-marker-badge-*` and `--chart-segment-*` are **not** declared by the registry — define them in your CSS before relying on them.

## Series palette

- Multi-series: `var(--chart-1)` … `var(--chart-5)`.
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

The default tooltip panel uses `--chart-tooltip-background` / `--chart-tooltip-foreground` (dark translucent in both modes). For custom `content`, either reuse those or use `bg-popover text-popover-foreground` so text stays readable.

For matching charts to a brand or app theme in depth, see the **bklit-ui-design** skill.

Docs: https://bklit.com/docs/theming
