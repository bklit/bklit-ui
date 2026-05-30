# Studio sidebar refactor plan

Reference implementation: **gauge-chart** (`registry.tsx` → `controlGroups` + `motionPanel: "gauge"`).

Shared UI primitives:

| Primitive | Location | Use |
|-----------|----------|-----|
| `studio-control-card` | `globals.css` | Dotted muted card (motion curve editor, curve picker) |
| `StudioControlGroup` | `studio-control-group.tsx` | Section title + spacing |
| `StudioControlGroups` | `studio-control-groups.tsx` | Motion block first, then grouped controls |
| `hideGroupLabel` + inline rows | `control-field.tsx`, `control-field-helpers.tsx` | Pattern/curve pickers: label in group header only; sliders/booleans use `StudioControlRow` |

---

## Phase 0 — Done

- [x] Gauge: `controlGroups` (Design, Center, Notches, Arc)
- [x] Motion panel at top of sidebar (Ease/Spring + curve editor)
- [x] `studio-control-card` on motion curve editor
- [x] `studio-control-card` on curve picker (area, line, composed, live-line)

---

## Phase 1 — Sidebar structure (all charts) — Done

**Goal:** Replace flat `controls: [...]` + implicit `"Settings"` group with explicit `controlGroups` per chart.

Definitions live in `registry-control-groups.ts`; `registry.tsx` imports them.

### 1.1 Registry migration checklist

| Chart | `controlGroups` | Motion panel | Notes |
|-------|-----------------|--------------|-------|
| gauge-chart | ✅ | `gauge` (full) | |
| area-chart | ✅ | `css-reveal` | |
| line-chart | ✅ | `css-reveal` | |
| bar-chart | ✅ | `css-reveal` | |
| composed-chart | ✅ | `css-reveal` | |
| pie-chart | ✅ | — | motion-enter later |
| ring-chart | ✅ | `css-reveal` | |
| radar-chart | ✅ | — | motion-stagger later |
| candlestick-chart | ✅ | `css-reveal` | |
| funnel-chart | ✅ | — | motion-enter later |
| live-line-chart | ✅ | — | no enter anim |
| choropleth-chart | ✅ | `css-reveal` | |
| sankey-chart | ✅ | `css-reveal` | |

**Mechanical steps per chart:**

1. Copy `controls` array into `controlGroups` with logical titles.
2. Set `controls: []` (or omit; `getStudioControlGroups` falls back).
3. Remove duplicate `animationDuration` from body when Motion group owns duration (Phase 2).
4. Verify `hideGroupLabel` types still used for `pattern`, `curve`, `pieFill`, etc.

### 1.2 Inline / density rules (match gauge)

- **Group-labeled pickers** (`pattern`, `curve`, …): no per-control label when group title is enough; wrap picker in `studio-control-card` where it’s a visual editor (curve ✅, pattern optional).
- **Sliders & number inputs:** keep `SliderInputGroup` / `StudioControlRow` (label left, control right).
- **Booleans:** `StudioControlRow` + `alignControl="end"`.
- **Section spacing:** `studio-control-groups` → `space-y-7`; avoid nested `"Settings"` mega-group.

### 1.3 Shared templates (optional helper)

Add `sidebar-control-templates.ts` with factories, e.g. `designGroup(controls)`, `motionGroupPlaceholder()`, to keep `registry.tsx` DRY. Not required for Phase 1 but reduces copy-paste.

---

## Phase 2 — Motion section rollout

**Goal:** One Motion group at top of every chart that supports enter/reveal animation; map studio URL motion state → chart props.

### 2.1 Animation profiles (`StudioChartConfig`)

```ts
animationProfile?: "css-reveal" | "motion-enter" | "motion-stagger" | "none";
motionPanel?: "full" | "duration-only" | false; // or keep motionPanel: "gauge" → generalize
```

| Profile | Charts | Studio Motion UI | Chart API |
|---------|--------|------------------|-----------|
| `css-reveal` | area, line, bar, composed, ring, candlestick, choropleth, sankey | Duration + ease presets (not full spring/bezier) | `animationDuration` + new `animationEasing?` on shell |
| `motion-enter` | gauge, pie, ring, funnel, sankey | Full panel (current `MotionControl`) | `enterTransition`, `enterStaggerScale` |
| `motion-stagger` | radar | Duration + stagger scale | Custom props on radar context |
| `none` | live-line | Hide Motion group | — |

### 2.2 URL state

- Today: `animationDuration` (ms) **and** `motionDuration` (s) coexist.
- **Consolidate UX:** Motion group is source of truth for duration; `animationDuration` derived in preview adapter (`motionDuration * 1000`) for css-reveal charts.
- Keep both keys in URL until codegen migrates; document mapping in `chart-animation.ts`.

### 2.3 `StudioControlGroups` changes

- Show Motion when `motionPanel` / `animationProfile !== "none"`.
- Pass `animationProfile` into `MotionControl` to hide spring/bezier for css-reveal (duration + ease presets only).

### 2.4 Preview adapters

Per chart, thin wrapper or inline in `render`:

```ts
getStudioAnimationProps(profile, state) // apps/web/lib/studio/chart-animation.ts
```

- Gauge: already uses `studioMotionToTransition` + `motionStaggerScale`.
- Cartesian: `{ animationDuration: ms, animationEasing }` once shell supports easing.

### 2.5 Codegen (later)

- css-reveal: emit `animationDuration` + `animationEasing`.
- motion-enter: emit `enterTransition={...}`; snippet fallback until prop exists on every chart.

---

## Phase 3 — Chart package APIs (incremental)

Do **not** block Phase 1–2 on full package refactors.

1. **High leverage:** `time-series-chart-shell` → `animationEasing` (unblocks area/line/bar/composed preview).
2. **Gauge:** codegen `enterTransition` (preview already wired).
3. **Pie / ring / sankey:** parent-level `enterTransition` (mirror gauge).
4. **Radar / funnel:** `enterDuration` + stagger or full transition.

---

## Phase 4 — Polish

- Pattern picker: optional `studio-control-card` wrapper (align with curve).
- ScrollArea: `overflow-visible` on Motion group if handles clip (gauge ease editor).
- Docs: motion props on chart doc pages.
- Tests: `chart-animation.test.ts`, registry snapshot for group titles.

---

## Suggested implementation order

1. **area-chart** + **line-chart** `controlGroups` (validate curve card + inline layout).
2. **bar-chart** + **composed-chart** (most complex cartesian).
3. Wire **Motion** for css-reveal (duration-only UI) + `animationEasing` on shell.
4. **pie / ring / sankey** groups + motion-enter APIs.
5. Remaining charts + codegen.

---

## Files touched (reference)

| Area | Files |
|------|--------|
| Registry | `apps/web/lib/studio/registry.tsx` |
| Groups UI | `studio-control-groups.tsx`, `studio-control-group.tsx` |
| Controls | `control-field.tsx`, `motion-control.tsx`, `curve-picker.tsx` |
| Motion | `motion-config.ts`, `chart-animation.ts` (new) |
| Types | `apps/web/lib/studio/types.ts` |
| Styles | `apps/web/app/globals.css` (`.studio-control-card`) |
| Package | `packages/ui/src/charts/time-series-chart-shell.tsx`, `gauge.tsx`, … |
