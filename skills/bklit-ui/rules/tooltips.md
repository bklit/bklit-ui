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
| `showDatePill` | `boolean` | `true` (set `false` for categorical/live charts) |
| `content` | `({ point, index }) => ReactNode` | built-in rows |
| `rows` | `(point) => { color, label, value }[]` | one row per series |
| `indicatorColor` | `string \| (point) => string` | `--chart-crosshair` |
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
| `backgroundColor` | `string` | `var(--chart-tooltip-background)` |
| `panelStyle`, `className` | `CSSProperties`, `string` | — |
| `children` | `ReactNode` | rendered below rows (e.g. marker content) |

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

Docs: https://bklit.com/docs/utility/tooltip · https://bklit.com/docs/utility/custom-indicator · https://bklit.com/docs/utility/use-chart
