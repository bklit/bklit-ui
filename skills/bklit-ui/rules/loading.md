# Loading states

Mechanics only — for how a loading state should *look* (pulse vs sweep, shimmer colors, label tone) see **bklit-ui-design**.

## One chart, driven by `status`

`LineChart`, `AreaChart`, `BarChart`, and `HeatmapChart` accept `status: "loading" | "ready"` (default `"ready"`). While loading, the chart plots generated skeleton data; when it flips to `"ready"` it choreographs the hand-off (pulse exits → label fades → y-domain tween → clip reveal).

### Incorrect

```tsx
// Swapping components loses the hand-off animation and causes layout jump
{isLoading ? <Skeleton className="h-64" /> : <LineChart data={data}>…</LineChart>}
```

### Correct

```tsx
<LineChart data={data ?? []} status={isLoading ? "loading" : "ready"} loadingLabel="Loading revenue">
  <Grid horizontal shimmer />
  <Line dataKey="revenue" loadingStyle="pulse" />
  <XAxis />
  <ChartTooltip />
</LineChart>
```

- `loadingLabel` (line, area, heatmap; `""` hides it) renders centered shimmer text via `@bklit/shimmering-text`, installed automatically with those charts. `BarChart` has no label prop.
- `Line` / `Area`: `loadingStyle: "pulse" | "sweep"`, `loadingStroke`, `loadingStrokeOpacity`, `loading={false}` to opt out.
- `Grid`: `shimmer`, `shimmerStroke`, `shimmerLength`, `shimmerSpeed`, `loadingStroke`.
- `BarChart status="loading"` needs no data or children — it renders a bar skeleton.

## Turnkey placeholders

When there is no chart yet (e.g. a route-level fallback), use the wrappers installed with each chart: `LineChartLoading` (`line-chart-loading`), `AreaChartLoading` (`area-chart-loading`), `BarChartLoading` (`bar-chart-loading`), `HeatmapChartLoading` (`heatmap`). Prefer the `status` prop when the real chart is already mounted.

## Other charts

Pie, ring, radar, gauge, funnel, sankey, sunburst, choropleth, scatter, candlestick, composed, and live line have no `status` prop — render your own placeholder of the same size, or delay mounting until data arrives (their enter animation then plays).
