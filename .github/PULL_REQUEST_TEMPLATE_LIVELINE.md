# Live Line Chart – Real-time streaming charts

## Summary

This PR adds a **Live Line Chart** component and docs: a real-time, composable chart for streaming time-series data (e.g. stock tickers, crypto micro-prices) with smooth scrolling, crosshair, animated axes, and optional momentum-based styling. It also fixes a “Maximum update depth exceeded” issue and improves performance.

---

## What’s new

### Live Line Chart (`@bklitui/ui/charts`)

- **`LiveLineChart`** – Root component that:
  - Takes streaming `data: LiveLinePoint[]` (`{ time, value }`) and current `value`
  - Drives a single `requestAnimationFrame` loop for smooth time and Y-domain interpolation
  - Supports `window` (visible seconds), `nowOffsetUnits` (leading gap), `paused`, `exaggerate`, `lerpSpeed`, `numXTicks`, `dataKey`, and margins

- **`LiveLine`** – Renders the line, optional area fill, live dot, and value badge:
  - Props: `dataKey`, `stroke`, `strokeWidth`, `fill`, `pulse`, `dotSize`, `badge`, `formatValue`, `momentumColors`
  - With `momentumColors`, line/area/dot color follow short-term trend (up / down / flat)
  - `fill={false}` for line-only (no area)

- **`LiveXAxis`** – Time labels and a time pill that follows the crosshair (spring-animated)

- **`LiveYAxis`** – Animated value labels with hysteresis-based tick spacing and edge fade

- **Exports**: `LiveLineChart`, `LiveLine`, `LiveXAxis`, `LiveYAxis`, `LiveLinePoint`, `MomentumColors`, `Momentum`, `detectMomentum`

### Docs and examples

- **Docs**
  - New doc page: **Live Line Chart** (`/docs/components/live-line-chart`) with preview, installation, usage, data shape, props tables, and theming
  - **Grid** doc updated with `rowTickValues` for aligning grid rows with `LiveYAxis` in live charts

- **Charts route**
  - **Live Line Chart** added to `/charts` with 2-column layout and variants:
    - Basic (streaming + crosshair)
    - Now offset (leading gap, line fade at right)
    - Momentum colors (green up / red down)
    - Line only (no area fill)
  - Hero example and copyable code for each variant

- **Playground**
  - Playground page focused on Live Line Chart with multiple card examples (e.g. stock, SAT/BTC, trend signal), pause/play, and custom tooltip content

### Theming and tooltip

- **Now badge and chart tooltip** use shadcn **popover** vars so text is never white-on-white:
  - Live value badge: `fill="var(--popover)"` / `fill="var(--popover-foreground)"`
  - `TooltipBox`: `bg-popover text-popover-foreground`
  - Playground and docs demo tooltip content use `text-popover-foreground` / `text-muted-foreground`

---

## What’s changed (existing components)

- **Grid** (`packages/ui`)
  - New optional prop **`rowTickValues?: number[]`** so horizontal grid lines can match explicit tick values (e.g. from `LiveYAxis`). When set, it overrides `numTicksRows`.

- **Chart Tooltip** (`TooltipBox`)
  - Replaced hardcoded dark tooltip styling with `bg-popover text-popover-foreground` for theme consistency and contrast.

---

## Performance and stability

- **“Maximum update depth exceeded”**
  - **Cause**: A `useEffect` in `LiveLineChart` depended on `frame.now`, `frame.displayValue`, and scales. Every rAF updated `frame`, so the effect ran every frame and called `setTooltipData`, causing repeated renders and risk of update loops.
  - **Fix**: Tooltip is now computed **inside the rAF tick** (with refs for latest `data` / `dataKey`). Only the rAF updates both `frame` and `tooltipData`; the previous tooltip `useEffect` was removed.

- **LiveXAxis**
  - **Cause**: `useEffect(() => animatedPillX.set(pillX), [pillX, animatedPillX])` could re-run when the spring reference changed and contribute to update depth.
  - **Fix**: Use a ref to hold the spring and depend only on `[pillX]`: `springRef.current.set(pillX)`.

- **Context**
  - **`contextValue`** in `LiveLineChartInner` is now **memoized** with `useMemo` so context consumers don’t re-render on every frame from a new object reference. The early return (`innerWidth <= 0 || innerHeight <= 0`) was moved **after** all hooks to satisfy rules of hooks.

---

## How to test

1. **Studio** – `apps/web` → `/studio?chart=live-line-chart`: pause/play, hover for crosshair and tooltip; confirm no “Maximum update depth” in console.
2. **Docs** – `/docs/components/live-line-chart`: preview and code samples.
3. **Charts** – `/charts/live-line-chart`: hero + variant examples in 2-column layout.
4. **Theming** – Toggle light/dark; confirm badge and tooltip text remain readable (popover vars).

---

## Dependencies

Live Line Chart uses existing chart stack: `@visx/scale`, `@visx/shape`, `@visx/curve`, `@visx/responsive`, `@visx/event`, `d3-array`, `motion`.
