# Animation

Defaults live in the installed `components/charts/animation.ts`.

## Defaults

- **Duration:** `1100ms` (`DEFAULT_ANIMATION_DURATION_MS`) for cartesian enter reveals.
- **Easing:** `cubic-bezier(0.85, 0, 0.15, 1)` (`DEFAULT_ANIMATION_EASING`) — the global default, not bar-specific.
- **Bars:** same duration and easing, plus an automatic stagger spread over ~40% of the duration (`Bar` `staggerDelay` overrides it; `animationType: "grow" | "fade"`).
- Root props: `animationDuration` (ms), `animationEasing` (CSS easing for the clip reveal), `enterTransition` (motion `Transition`). Series take `animate={false}` to skip their own enter.

Don't hand-tune these per chart unless asked — consistent timing across a dashboard reads better. Use Studio (`https://bklit.com/studio?chart=<item>`) to tune and copy values.

## Replay enter animations

Change `revealSignature` (supported by line, area, bar, candlestick, scatter, composed, heatmap, sankey, choropleth roots) or remount with a new `key`.

```tsx
const [replay, setReplay] = useState(0);

<LineChart data={data} revealSignature={String(replay)}>
  {/* … */}
</LineChart>

<button type="button" onClick={() => setReplay((n) => n + 1)}>Replay</button>
```

## Live charts

- `LiveLineChart` runs its own rAF loop: smooth `value` interpolation (`lerpSpeed`, default `0.08`) and a scrolling `window` (seconds).
- `paused` freezes scrolling without unmounting — use it for hidden tabs or debugging.
- Append points and trim (`prev.slice(-500)`); don't rebuild the array or create new objects for unchanged points every tick.

## Reduced motion

Handled **partially**. `useReducedMotion()` is checked by data-change path tweens, Y-domain tweens, the gauge, sunburst, heatmap enter, grid shimmer, and the line loading sweep. The cartesian clip-path reveal, bar grow/stagger, pie/ring/radar enters, tooltip springs, and live scrolling do **not** check it.

When the app must honor `prefers-reduced-motion`, gate it yourself:

```tsx
import { useReducedMotion } from "motion/react";

const reduce = useReducedMotion();

<BarChart data={data} xDataKey="month">
  <Bar dataKey="revenue" animate={!reduce} />
  …
</BarChart>
```

`Line`, `Area`, and `Bar` all take `animate`. (`animationDuration={0}` alone is not enough for bars — the stagger falls back to 1100ms.)

Don't tell the user the charts are fully reduced-motion safe.

## Performance

- Memoize `data` (and `rows` / `content` callbacks) so hover doesn't rebuild arrays.
- Prefer one chart with several series over many stacked charts.
- For dense series, keep the dataset reasonable (hundreds, not tens of thousands, of SVG points); `decimate-time-series.ts` (from `@bklit/chart-utils`) can downsample.
