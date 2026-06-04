---
name: bklit-studio
description: >
  bklit-ui monorepo contributors only. Use automatically when building or editing
  charts, tuning props/animation, or prototyping in Studio (/studio). Replaces
  the deprecated local /playground route.
---

# Bklit Studio Skill (chart development)

**Monorepo contributors only.** Use this skill **automatically** whenever you build, edit, or prototype a chart — before shipping via **bklit-ship**.

Studio at **`/studio`** is the single development surface: full editor shell, component tree, properties, motion, codegen, and registry previews. Do **not** scaffold `apps/web/app/playground/`.

## When to use (auto-trigger)

- Build, prototype, or edit a chart (new or existing)
- Tune props, layers, data, styling, or animation
- Mentions Studio, `/studio`, registry preview, or chart controls
- Work continues from a prior playground task → use Studio instead

## Quick start

```bash
pnpm dev   # repo root
```

Open **http://localhost:3000/studio** (optional query: `?chart=line-chart`).

| Task | URL |
|------|-----|
| Edit existing chart | `/studio?chart=<slug>` — slugs in `packages/studio/src/chart-slugs.ts` |
| Profit/loss line mode | `/studio?chart=line-chart&lineChartMode=profitLoss` |

## Editor layout

| Region | Purpose |
|--------|---------|
| **Left** | Chart type (in full Studio), layer list, data controls, animation |
| **Center** | Canvas, rulers, resizable frame, replay/scramble |
| **Right** | Properties for the **selected layer** |

**Pane rules:** animation → left (`motionPanel` on chart config); per-layer props → right; visibility → eye icon on layer (uses `hiddenComponents` in URL state).

## Where to implement (existing charts)

Edit the chart in **`packages/studio`** and **`packages/ui`** — not `apps/web/components/playground/`.

| Concern | Path |
|---------|------|
| Chart preview + codegen | `packages/studio/src/lib/registry.tsx` (`render`, `generateCode`) |
| Layer tree (components panel) | `packages/studio/src/lib/studio-components.ts` (`resolve*Components`) |
| Control groups (properties) | `packages/studio/src/lib/registry-control-groups.ts` |
| URL / default state | `packages/studio/src/lib/studio-parsers.ts` |
| Chart UI | `packages/ui/src/charts/` |
| Slugs | `packages/studio/src/chart-slugs.ts` + `studioRegistry` in `registry.tsx` |
| Studio-only previews | `packages/studio/src/components/charts/*-studio-preview.tsx` |

### Patterns in `registry.tsx` render

Reuse committed helpers (do not reimplement):

- `StudioChartShell` + `studioCartesianLegendItems` — legend grid + `showLegend`
- `StudioVisibleLayer` + `componentId` — ties render to layer visibility (`line.grid`, `line.series.0`, …)
- `getStudioCssRevealPropsForPreview` — motion / reveal
- `isStudioComponentVisible(state, componentId)` — conditional children
- `seriesStrokePropsFromState`, `fadeEdgesPropValue`, `chartTooltipPropsFromState`

Reference implementation: `lineConfig.render` in `registry.tsx`.

## New chart (not in registry yet)

1. Implement component(s) in `packages/ui/src/charts/` (minimal API first).
2. Add slug to `packages/studio/src/chart-slugs.ts`.
3. Add `StudioChartConfig` to `studioRegistry` in `registry.tsx`:
   - `render(state, ctx)` — preview inside `EditorChartFrame` via `StudioShell`
   - `resolveComponents` in `studio-components.ts`
   - `controlGroups` / `resolveControlGroups`
   - `generateCode` for the code sheet
4. Open `/studio?chart=<new-slug>` and iterate.
5. When stable, follow **bklit-ship** for docs, gallery, shadcn registry.

## Adding a prop or layer

1. Add key to `StudioUrlState` / `defaultStudioState` in `studio-parsers.ts` if missing.
2. Add control(s) on the right layer in `registry-control-groups.ts` or per-component `controlGroups` in `studio-components.ts`.
3. Wire prop in `registry.tsx` `render` (and in `packages/ui` chart code).
4. If the prop affects animation → ensure `motionPanel: true` on chart config.
5. Verify in Studio: layer list, visibility toggle, properties, replay.

## Shipping

When the API is stable, read `.agents/skills/bklit-ship/SKILL.md` — prototype code should already live in `packages/ui` + `packages/studio`; no playground route to migrate.

## Deprecated: `/playground`

The local **`/playground`** route and **`bklit-playground`** skill are deprecated. `/playground` redirects to `/studio`. Do not copy `playground-editor-shell` or `apps/web/components/playground/` for new work.

## File reference

| Item | Path |
|------|------|
| Studio app route | `apps/web/app/studio/page.tsx` (`StudioShell`) |
| Studio package | `packages/studio/` |
| Studio skill | `.agents/skills/bklit-studio/SKILL.md` |
| Ship checklist | `.agents/skills/bklit-ship/SKILL.md` |
| Performance audit | `.agents/skills/bklit-studio-chart-performance/SKILL.md` |
