# Taste rules

Opinionated defaults for making bklit charts look intentional inside someone
else's app. Apply them after the request is mapped to props. When a user
explicitly asks for something a rule discourages, do it — and mention the
trade-off once.

## 1. One decorative layer

Pick one of: `Background` pattern, `Grid`, a pattern fill on the series, a
gradient fill, 3D depth. Texture is seasoning.

Incorrect — grid, background and hatched bars all compete:

```tsx
<BarChart data={data}>
  <Background pattern="cross" />
  <Grid horizontal vertical />
  <PatternLines id="p" width={8} height={8} orientation={["diagonal"]} stroke="var(--chart-1)" />
  <Bar dataKey="v" fill="url(#p)" />
</BarChart>
```

Correct — the bars carry the texture, the plot stays quiet:

```tsx
<BarChart data={data}>
  <Grid horizontal />
  <PatternLines id="p" width={8} height={8} orientation={["diagonal"]} stroke="var(--chart-1)" strokeWidth={2} />
  <Bar dataKey="v" fill="url(#p)" stroke="var(--chart-1)" lineCap={4} />
</BarChart>
```

`Background` replaces `Grid`; it is not an addition to it.

## 2. Backgrounds whisper

Keep plot-area patterns on `--chart-grid` (the default) at full or reduced
opacity, and keep the fade on. Never colour a background pattern with a series
colour.

Incorrect:

```tsx
<Background color="var(--chart-1)" fadeHorizontal={false} fadeVertical={false} />
```

Correct:

```tsx
<Background />
<Background pattern="dots" opacity={0.85} />
```

Raise contrast with `color="var(--chart-foreground-muted)"` only when the host
background is busy (e.g. a tinted card) and the default disappears.

## 3. Don't stack effects on one mark

Gradient + pattern + glow + 3D on the same series reads as noise. One fill
treatment per series; the second series may contrast (e.g. recipe 4: one hatched
series, one gradient series — never both on one).

Incorrect:

```tsx
<BarDepthBack dataKey="v" color="url(#g)" />
<Bar dataKey="v" fill="url(#pattern)" perspective />
<BarDepthFront dataKey="v" />
```

Correct:

```tsx
<BarDepthBack dataKey="v" color="var(--chart-1)" />
<Bar dataKey="v" fill="var(--chart-1)" perspective />
<BarDepthFront dataKey="v" />
```

`BarDepthBack` paints solid side/top faces; give it the solid colour the bar uses.

## 4. Match bar corners to the app's `--radius`

Read `--radius` from the detection output and pick the cap that matches the
host's buttons and cards.

| Host `--radius` | `Bar lineCap` | `BarSquares squareRadius` | Tooltip ring `dotRadiusFraction` |
|---|---|---|---|
| `0` – `0.25rem` (sharp, brutalist, "default" v3) | `"butt"` or `2` | `0` – `0.1` | match `squareRadius` |
| `0.375rem` – `0.75rem` (shadcn default 0.625rem) | `4` – `6` | `0.25` (default) | omit or `0.25` |
| `≥ 1rem` (soft, playful) | `"round"` (default) | `0.5` (squircle) | `0.5` |

Incorrect — pill bars in an app whose buttons are square (`--radius: 0`):

```tsx
<Bar dataKey="v" />
```

Correct:

```tsx
<Bar dataKey="v" lineCap="butt" />
```

## 5. Ring tooltips belong with squares

Square/squircle columns get a ring indicator that matches their corner and no
crosshair; continuous series keep the default dot + crosshair.

Incorrect:

```tsx
<BarSquares dataKey="v" squareRadius={0.5} />
<ChartTooltip />
```

Correct:

```tsx
<BarChart data={data} squareSnap={{ squareGap: 3 }}>
  <BarSquares dataKey="v" squareGap={3} squareRadius={0.5} />
  <ChartTooltip dotVariant="ring" dotRadiusFraction={0.5} dotStrokeWidth={1} showCrosshair={false} />
</BarChart>
```

Without `squareSnap` on `BarChart` the ring lands on the raw value, not on the
top square. Bar charts hide the crosshair line by default (`showCrosshair` opts in).
For plain `Bar`s and 3D bars, add `showDots={false}` — the bar's own hover dimming
is the indicator.

## 6. Never hardcode colours — use tokens

Series colours are `var(--chart-1)` … `var(--chart-5)` (or
`var(--chart-line-primary)` / `var(--chart-line-secondary)`). Chrome uses
`chartCssVars` / `--chart-grid`, `--chart-foreground-muted`, `--chart-label`.
Gallery snippets sometimes contain hex/hsl (`#e879f9`, `hsl(217, 91%, 60%)`,
`#0ea5e9`) — translate them to tokens.

Incorrect:

```tsx
<LinearGradient id="g" from="hsl(217, 91%, 60%)" to="hsl(280, 87%, 65%)" />
<Line dataKey="v" stroke="#6366f1" />
```

Correct:

```tsx
<LinearGradient id="g" from="var(--chart-1)" to="var(--chart-3)" />
<Line dataKey="v" stroke="var(--chart-1)" />
```

In TS, prefer `chartCssVars.grid` over the string `"var(--chart-grid)"` when
writing custom layers. Avoid `pattern="accent"` and the `@visx/gradient` named
presets (`GradientPinkBlue` …) in themed apps — their colours are fixed.

## 7. Respect dark mode

Every colour you introduce must exist in both the light and the dark block (or
be a `var()` of something that does). Patterns on `--chart-grid` and fills on
`--chart-N` flip automatically; literal `white`/`black`/hex do not.

Incorrect:

```tsx
<PatternLines id="p" width={6} height={6} stroke="rgba(0,0,0,0.15)" orientation={["diagonal"]} />
```

Correct:

```tsx
<PatternLines id="p" width={6} height={6} stroke="var(--chart-grid)" orientation={["diagonal"]} />
```

Check the result in both themes before calling it done.

## 8. Unique pattern and gradient ids

`PatternLines`/`LinearGradient` ids are document-global. Two charts using
`id="pattern"` on one page will both use whichever rendered first. Use `useId()`
(strip the colons) or a chart-specific prefix.

```tsx
const uid = useId().replace(/:/g, "");
<PatternLines id={`${uid}-hatch`} ... />
<Bar fill={`url(#${uid}-hatch)`} ... />
```

## 9. Give pattern/gradient fills a solid `stroke`

When `fill` is `url(#…)`, set `stroke` to the series colour on `Bar` /
`BarSquares` — the tooltip dot uses it. `PieSlice`: set `color` for the glow and
center hover colour.

## 10. Fades follow the content

- `Line` fades by default — turn it off (`fadeEdges={false}`) when markers sit on
  the first/last point, or when the stroke is a gradient `url(...)`.
- A tiny inline trend is not a small `LineChart` — use `LineSparkline` /
  `AreaSparkline` / `BarSparkline` (`@bklit/sparkline`). They have no edge fade,
  axes or tooltip; `endDot` keeps the latest value visible.
- `Area` does not fade by default — `fadeEdges` suits hero/marketing charts,
  not dashboards where the latest value matters (use `fadeEdges="left"` to keep
  the right edge crisp).

## 11. Restraint in dense dashboards

In a grid of small cards: no `Background`, `Grid` with `numTicksRows={3}` or none,
`strokeWidth={2}`, `showDatePill={false}` if the card already shows the date,
`animationDuration` ≤ 800. Save 3D, squircles and patterns for hero charts.
For trends in table rows or KPI tiles, use `@bklit/sparkline` instead of a
shrunken chart: one `color` token, `height` 24–40, the default `"dashed"`
crosshair, and the value shown beside it with `useSparklineHover`.

## 12. Loading should look like the chart

Use the same chart with `status="loading"` (keeps axes, size and grid identical)
rather than a generic skeleton div. One shimmer at a time: `loadingStyle="sweep"`
**or** grid `shimmer`, not both.

## 13. Two-tone, not rainbow

For 2–3 series, pick adjacent palette steps with clear lightness contrast
(`--chart-1` + `--chart-3`, as the gallery does) rather than five hues. Use all
five only for categorical pies/legends.
