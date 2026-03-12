# Candlestick Chart – Docs, examples, and tooltip indicator

## Summary

This PR ships the **Candlestick Chart** from prototype to production: OHLC chart component and docs, live examples on `/charts/candlestick-chart`, a new **ChartTooltip** `indicatorColor` prop so the crosshair can match the focused candle (e.g. green/red), and the **Bklit UI** skill (prototype-to-production checklist).

---

## What’s new

### Candlestick Chart (`@bklitui/ui/charts`)

- **`CandlestickChart`** – Root OHLC chart with margin, animation, `candleGap` / `candleWidth`, optional `xDomain` / `xDomainSlotCount` for brush alignment.
- **`Candlestick`** – Renders candles with `positiveFill` / `negativeFill` (color or gradient URL), optional `bodyPatternPositive` / `bodyPatternNegative`, `fadedOpacity` for hover.
- **`ChartBrush`** – Brush component for time-range selection (e.g. zoom strip).
- **Exports**: `CandlestickChart`, `Candlestick`, `ChartBrush`, `OHLCDataPoint`, `ChartBrushSelection`.

### ChartTooltip

- **`indicatorColor?: string | ((point: Record<string, unknown>) => string)`** – Color for the crosshair/indicator line. When a function, receives the hovered point (e.g. candlestick: green when `close >= open`, red otherwise). Default remains `--chart-crosshair`.

### Docs and examples

- **Doc page**: `/docs/components/candlestick-chart` – Preview (client demo wrapper), installation, usage, data shape, styling, tooltip. Sidebar and mobile nav updated.
- **Charts route**: `/charts/candlestick-chart` with:
  - **Hero + first card**: Lime–emerald and yellow–red gradients; tooltip line matches candle color (`indicatorColor` + `showDots={false}`).
  - **Chart 1 & 2**: Default palette (`--chart-1`, `--chart-2`).
  - **Chart 1 & 3**: Stronger contrast (`--chart-1`, `--chart-3`).
  - **Lime to emerald, yellow to red**: Custom gradient example.
  - **Solid colors**: Emerald/red.
  - **Pattern**: Diagonal pattern on bodies.
  - **Tooltip only**: No crosshair, no dots.

### Registry and skill

- **Shadcn registry**: `candlestick-chart` entry in `packages/ui/registry.json`; `pnpm registry:build` outputs to `apps/web/public/r/`.
- **Bklit UI skill** (`.agents/skills/bklit-ui/SKILL.md`): Step-by-step plan for moving a chart/component from playground to production (UI package, docs, chart slugs/examples, sidebar, mobile nav, registry, lint/format, commit, PR checklist).

---

## Checklist

- [x] Chart/component in `packages/ui` and exported
- [x] Chart slug and examples added (`chart-slugs.ts`, `chart-examples.tsx`)
- [x] New doc page `content/docs/components/candlestick-chart.mdx` + client demo wrapper
- [x] Component in `content/docs/components/meta.json` (sidebar)
- [x] Component in `site-header.tsx` components list (mobile nav)
- [x] Registry entry and `pnpm registry:build` run
- [x] Lint and type-check pass

---

## How to test

1. **Docs**: Open `/docs/components/candlestick-chart` – preview should render without runtime errors.
2. **Charts**: Open `/charts/candlestick-chart` – hero and cards should show; first example crosshair should turn green/red with the focused candle; no dot on tooltip.
3. **Lint/types**: `pnpm lint` and `pnpm check-types` pass.
