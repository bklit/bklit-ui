# Tooltips

`ChartTooltip` (`@/components/charts/tooltip`, item `@bklit/chart-tooltip`) is a child of a cartesian root (`LineChart`, `AreaChart`, `BarChart`, `ComposedChart`, `ScatterChart`, `CandlestickChart`, `LiveLineChart`). It renders the crosshair, series dots, the date pill, and the floating panel. Pie/ring/heatmap/sankey/choropleth have their own tooltips or center stats.

## Default

```tsx
<LineChart data={data}>
  <Line dataKey="users" />
  <XAxis />
  <ChartTooltip />
</LineChart>
```

## Props (from `tooltip/chart-tooltip.tsx`)

| Prop | Type | Default |
|---|---|---|
| `showCrosshair` | `boolean` | `true` (`false` inside `BarChart`, any orientation, and inside `ScatterChart` with `jitter` — pass `showCrosshair` to opt in) |
| `showDots` | `boolean` | `true` |
| `showDatePill` | `boolean` | `true` (set `false` for categorical/live charts; `XAxis` then highlights instead of fading) |
| `datePillAnimation` | `"roll" \| "static"` | `"roll"` (always `"static"` above 60 labels) |
| `datePillVariant` | `"solid" \| "glass"` (liquid glass; refraction in Chromium, frosted fallback elsewhere) | `"solid"` |
| `datePillVelocity` | `boolean \| { scale?, stretch?, maxVelocity? }` (swells with speed) | `false` |
| `datePillClassName`, `datePillStyle` | `string` (tailwind-merged over the default surface), `CSSProperties` | — |
| `datePill` | `({ label, index, point }) => ReactNode` (replaces the pill, keeps positioning) | — |
| `dateLabels` | `string[]` (one per row, shown in the pill) | chart `dateLabels` |
| `content` | `({ point, index }) => ReactNode` | built-in rows |
| `rows` | `(point) => { color, label, value }[]` | one row per series |
| `indicatorColor` | `string \| (point) => string` | `--chart-crosshair` |
| `indicatorEndColor` | `string` (bottom of a top → bottom ramp) | — |
| `indicatorEnd` | `"plot" \| "point"` | `"plot"` |
| `indicatorDasharray` | `string` (e.g. `"4,4"`) | solid |
| `indicatorFadeEdges` | `"both" \| "top" \| "bottom" \| "none"` | `"both"` |
| `indicatorFadeLength` | `number` (% of height) | `10` |
| `dotVariant` | `"dot" \| "ring"` | `"dot"` |
| `dotSize` | `number` (px) | `5` |
| `dotScale`, `dotStrokeWidth`, `dotRadiusFraction` | `number` | ring tuning |
| `dotColor` | `string \| (point, line) => string` | series stroke (row color when `rows` set) |
| `matchCrosshair` | `boolean` | `false` |
| `damping` | `number` (`0` = instant) | `20` |
| `springConfig`, `boxSpringConfig` | `{ stiffness, damping }` | chart config |
| `exit` | `boolean` (fade out on leave) | `true` |
| `topOffset` | `number` (px gap below plot top) | `0` |
| `backgroundColor` | `string` | `var(--chart-tooltip-background)` |
| `panelStyle`, `className` | `CSSProperties`, `string` | — |
| `children` | `ReactNode` | rendered below rows (e.g. marker content) |

## Date pill and `XAxis` labels

The date pill is a built-in `motion` roll (`DateTicker`), **not** NumberFlow — NumberFlow is only `ChartCrosshair numberFlow` and pie/ring/radial/gauge centers.

```tsx
<ChartTooltip showDatePill={false} />                // off
<ChartTooltip datePillAnimation="static" />           // no roll, label swaps in place
<ChartTooltip datePillClassName="rounded-md bg-(--chart-1) dark:bg-(--chart-1) text-white dark:text-white" />
```

Glass-menu feel: `<ChartTooltip datePillVariant="glass" datePillVelocity />`. Glass needs texture behind it — put a subtle pattern/gradient background on the chart's wrapper (the pill sits in the x-axis band, below the plot, so `<Background>` doesn't reach it). `XAxis` keeps fading labels under the pill; `hoverEffect="none"` lets them pass under the glass instead.

The default surface sets light and dark colors (`bg-zinc-900 … dark:bg-zinc-100 dark:text-zinc-900`), so override both. The pill element has `data-slot="date-pill"`.

`XAxis hoverEffect` (default `"auto"`): `"fade"` hides labels under the pill; `"highlight"` recolors the hovered row's label (`activeLabelColor`, default `var(--chart-indicator-color)`) and blends labels within `highlightRadius` (80px) toward `nearbyLabelColor`; `"none"` leaves them alone. `"auto"` fades while a date pill is shown and highlights when it isn't. Set `tickerHalfWidth` to half a restyled pill's width so the fade zone matches.

## Horizontal crosshair (`ChartCrosshair`)

`ChartCrosshair` (`@/components/charts/chart-crosshair`, item `@bklit/chart-crosshair`) draws a horizontal line at the cursor's y with the axis value in a pill (styled like the date pill), plus a vertical line on the hovered column. Use it for finance-style charts (price + volume, scatter). Pair with `ChartTooltip showCrosshair={false}` so the vertical line isn't drawn twice. A `YAxis` with the same `yAxisId` fades the ticks under the pill automatically.

```tsx
<ComposedChart data={ohlcv} margin={{ right: 72 }}>
  <Candlestick yAxisId="right" />
  <YAxis orientation="right" yAxisId="right" />
  <ChartCrosshair yAxisId="right" numberFlow prefix="$" format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }} />
  <ChartTooltip showCrosshair={false} />
</ComposedChart>
```

| Prop | Type | Default |
|---|---|---|
| `yAxisId` | `string \| number` (axis the pill reads) | `"left"` |
| `side` | `"left" \| "right"` | `"right"` for the `right` axis, else `"left"` |
| `snap` | `boolean` (`false` = vertical line follows the cursor) | `true` |
| `horizontal`, `vertical`, `showValueLabel` | `boolean` | `true` |
| `numberFlow` | `boolean` (uses `format` / `prefix` / `suffix`) | `false` |
| `format` | `Intl.NumberFormatOptions` subset | `{ maximumFractionDigits: 2 }` |
| `formatValue` | `(value) => string` (static pill only) | — |
| `stroke`, `strokeDasharray`, `strokeWidth` | `string`, `string`, `number` | `--chart-crosshair`, `"3,3"`, `1` |
| `springConfig` | `{ stiffness, damping }` | chart tooltip spring |

Give the pill's side enough `margin` (56–72px for prices with cents). Leave `numberFlow` off on dense dashboards — it's the only part that re-renders on hover.

## Custom rows (keeps the built-in panel)

```tsx
<ChartTooltip
  rows={(point) => [
    { color: "var(--chart-1)", label: "Revenue", value: `$${point.revenue}` },
    { color: "var(--chart-2)", label: "Costs", value: `$${point.costs}` },
  ]}
/>
```

## Custom content

`content` receives **only** `{ point, index }` — format the date yourself.

### Incorrect

```tsx
<ChartTooltip content={({ point, formattedDate }) => <div>{formattedDate}</div>} />
```

### Correct

```tsx
<ChartTooltip
  content={({ point }) => (
    <div className="rounded-md bg-popover px-3 py-2 text-popover-foreground text-sm">
      <div className="font-medium">
        {(point.date as Date).toLocaleDateString()}
      </div>
      <div>{point.users as number} users</div>
    </div>
  )}
/>
```

## Dynamic crosshair color

```tsx
<ChartTooltip
  indicatorColor={(point) =>
    (point.close as number) >= (point.open as number) ? "var(--chart-1)" : "var(--chart-3)"
  }
  showDots={false}
/>
```

## Custom indicators

Read hover state from `useChart()` inside the root — don't track the mouse globally.

### Incorrect

```tsx
useEffect(() => {
  window.addEventListener("mousemove", onMove);
}, []);
```

### Correct

```tsx
import { useChart } from "@/components/charts/chart-context";

function CustomIndicator() {
  const { tooltipData, innerHeight } = useChart();
  if (!tooltipData) return null;
  return <rect x={tooltipData.x - 1} width={2} height={innerHeight} fill="var(--chart-crosshair)" />;
}
```

`tooltipData` is `{ point, index, x, yPositions, xPositions? } | null`. Check the installed `chart-context.tsx` for the full context value.

Docs: https://bklit.com/docs/utility/tooltip (incl. #horizontal-crosshair) · https://bklit.com/docs/utility/custom-indicator · https://bklit.com/docs/utility/use-chart
