---
name: bklit-studio-chart-performance
description: >
  Reusable Studio chart performance audit and fix workflow. Use when a chart
  feels sluggish in /studio (pan, slider ticks, legend hover) but siblings
  like pie-chart feel fine.
---

# Studio chart performance

Use when a chart feels sluggish in Studio but similar charts (e.g. pie-chart) are fine.

## One-line rule

Keep enter animation on paths if you need it, then **drop Motion path subscriptions** and **isolate hover** so Studio slider and legend updates don't replay expensive arc/path math across every series every frame.

---

## 1. Find what re-renders on every interaction

Studio updates `displayState` on every slider tick and on legend/slice hover. Trace:

- Does hover live in the **same context** as data, scales, and animation config?
- Does the preview **recreate children** (`data.map`, pattern defs, motion props) every render?
- Does the chart **remount unnecessarily** (`key` tied to motion signature vs manual replay)?

**Pattern:** Split context like cartesian / pie charts — **stable slice** (data, geometry, animation config) vs **hover slice** (`hoveredIndex`, tooltip). Consumers that don't need hover use only the stable hook (`usePieStable`, `useRingStable`, `useChartStable`, …).

**Studio pan:** Wrap chart render in `StudioChartRender` (`packages/studio/src/components/studio-chart-render.tsx`) so camera pan / FPS counter parent updates skip the chart tree when render props are unchanged.

---

## 2. Treat SVG path `d` animation as expensive

Animating `d` with Motion / `useTransform` + d3 arc (or similar) runs layout + paint every frame, per series.

| Prefer | Avoid |
|--------|--------|
| `transform` / `opacity` for hover (compositor-friendly) | Continuous `d` morphing after enter is done |
| Static `d` once enter finishes | Keeping Motion subscriptions on `d` for the chart's lifetime |
| Enter animation only, then static paths | Re-running enter path math on unrelated prop changes |

**Pattern:** `useMountProgress` for enter → when progress ≥ 1 (`useEnterComplete`), render **static paths** and only animate hover with `x`/`y`/`opacity`/`scale` on a **`motion.g`** wrapper (not per-path `scale` on `motion.path`).

Shared hook: `packages/ui/src/charts/use-enter-complete.ts`

---

## 3. Memoize chart shell context

Unmemoized provider values force all children to reconcile on every parent render.

- Memoize the **stable context object** with explicit deps (data, arcs/radii, dimensions, callbacks).
- Memoize **hover context** on `hoveredIndex` + stable `setHoveredIndex` (`useCallback` in chart shell).
- Match **`isLoaded`** to ring/cartesian: `useEffect` + timeout, not a lazy `useState` initializer.

Reference: `pie-context.tsx`, `ring-context.tsx`, `chart-context.tsx`, `PieChartCore` / `RingChartCore` `useMemo` on provider value.

---

## 4. Studio preview–specific wins

Chart-agnostic; apply in `packages/studio/src/components/charts/*-studio*.tsx`:

| Win | How |
|-----|-----|
| Conditional defs | Only pass `patternDefs` / gradients when a series uses patterns |
| Memo derived data | Colored/mapped data arrays; slice/series lists (`useMemo`, deps: `dataSeed` + design fields that affect color) |
| Memo motion enter | Don't call `getStudioMotionEnterProps` inline; `useMemo` with **motion-only** deps (not full `state`) |
| Memo legend hover | `{ hoveredIndex, setHoveredIndex }` in `useMemo` — already in `studio-legend-hover.tsx` |
| Memo chart body | `memo()` wrapper; pass **primitives** (`chartKey`, `chartSize`, `data`) not whole `ctx` so pan/shell re-renders skip rebuild |
| Disable glow in Studio | `showGlow={false}` on series components |

Reference: `pie-studio-preview.tsx`, `ring-studio-preview.tsx`

---

## 5. Compare against a “fast” sibling in Studio

Diff the slow chart against one that feels smooth in the same editor (usually **pie-chart**):

| Check | Slow chart often has | Fast chart often has |
|-------|----------------------|----------------------|
| Shell | Inline render, extra defs | `StudioChartShell` + conditional patterns |
| Series count | Many animated paths | Fewer paths or simpler geometry |
| Hover | Context + full tree re-render | Stable subscribers; hover on `motion.g` / translate |
| Enter | Path `d` wipe per series | Static `d` after enter; transform-only hover |
| Pan | Chart tree rebuilds every frame | `StudioChartRender` memo boundary |

---

## 6. Validation bar

Before opening a PR:

```bash
pnpm lint
pnpm --filter @bklitui/ui check-types
pnpm --filter @bklitui/studio check-types
# scoped production build when touching studio/web
```

Manual `/studio?chart=<slug>`:

- [ ] Enter animation
- [ ] Hover / legend sync
- [ ] Drag geometry sliders (no unnecessary remount)
- [ ] Canvas pan (space + drag) after enter — FPS near pie-chart baseline
- [ ] Pattern/gradient mode if supported

---

## Chart status (bklit-ui)

| Chart | Slug | Status |
|-------|------|--------|
| Pie | `pie-chart` | ✅ Reference (#120) |
| Ring | `ring-chart` | ✅ Aligned to checklist (context split, static paths, `StudioChartRender`, preview memo) |
| Radar / Funnel / Choropleth | various | Partial — run checklist |
| Cartesian / scatter / live-line | various | ✅ #91 decimation + hover batching |
| Sankey | `sankey-chart` | `useTransform` on link stroke — candidate for `useEnterComplete` |
| Gauge | `gauge-chart` | Low priority (single arc) |

---

## Key files

| Area | Path |
|------|------|
| Enter-complete hook | `packages/ui/src/charts/use-enter-complete.ts` |
| Pie reference | `packages/ui/src/charts/pie-slice.tsx`, `pie-context.tsx`, `pie-studio-preview.tsx` |
| Ring | `packages/ui/src/charts/ring.tsx`, `ring-chart.tsx`, `ring-studio-preview.tsx` |
| Pan isolation | `packages/studio/src/components/studio-chart-render.tsx` |
| Registry | `packages/studio/src/lib/registry.tsx` |
