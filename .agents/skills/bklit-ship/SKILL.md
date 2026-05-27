---
name: bklit-ship
description: bklit-ui monorepo contributors only — ship a chart or component from playground prototype to production in packages/ui with docs and registry.
disable-model-invocation: true
---

# Bklit Ship Skill

This skill is for **bklit-ui monorepo contributors** taking an experimental chart or component from **prototype** (usually on an untracked route like the playground) into **production**: published in the UI package, documented, and ready for users.

## When to use this skill

- You cloned `bklit/bklit-ui` and have a working prototype on a temporary route (e.g. `apps/web/app/playground/page.tsx`) and want to ship it.
- You are ready to move from "scaffolding" to "permanent": the API and key props/variants are decided from the prototyping phase.

---

## Plan: Prototype → Production

Follow these steps in order. Treat this as a checklist; each step has concrete locations in the repo.

### 1. Move into the UI package and export

- **Move** the chart/component source files from the app (e.g. playground) into `packages/ui/` in the right place (e.g. `packages/ui/src/charts/` for charts).
- **Export** the new chart/component from the package’s public API:
  - For charts: add exports in `packages/ui/src/charts/index.ts`.
  - If the package uses `exports` in `package.json` for specific entry points, add or update the relevant entry so the new component is importable as `@bklitui/ui/charts` (or the appropriate path).
- **Remove** or trim the prototype code from the temporary route (e.g. `apps/web/app/playground/page.tsx`) so the app no longer depends on in-app-only copies of the component.

### 2. Documentation and examples (apps/web)

Documentation lives under `apps/web/`. Do all of the following.

- **Update existing component docs** when shipping extends an existing chart (new props, subcomponents, or behavior):
  - Add new props to the relevant tables in the **parent** doc (e.g. `line-chart.mdx` for `Grid highlightRowValues`, `ChartTooltip indicatorColor`).
  - Update related utility docs if needed (e.g. `content/docs/utility/grid.mdx`, `tooltip.mdx`).
  - Keep the **primary docs preview unchanged** — do not swap the standard preview on an existing page for the new variant.
  - Add a short section linking to a dedicated doc page when the feature warrants one (e.g. Profit/Loss → `profit-loss-line.mdx`).

- **Chart examples (live demos on `/charts/[slug]`)**
  - Add examples to the **corresponding gallery route** (e.g. profit/loss variants under `/charts/line-chart`, not only a new docs preview).
  - If the feature is a new chart kind, add its slug to `apps/web/components/charts/chart-slugs.ts` and register examples in `apps/web/components/charts/chart-examples.tsx` (`CHART_NAV_ITEMS` / factory registry as appropriate).
  - Reuse or mirror the prop variants you validated in the scaffolding phase.

- **Dedicated doc page** (when shipping a new composable or chart kind)
  - Add `apps/web/content/docs/components/<name>.mdx` with frontmatter, `<ComponentPreview>`, installation, usage, and props — consistent with existing component docs.
  - Add the slug to `apps/web/content/docs/components/meta.json` (desktop sidebar).
  - Add an entry to `apps/web/components/docs/site-header.tsx` (mobile nav).

### 3. Studio

- **Update the existing studio chart** when the feature is a variant of an existing type, **or add a new studio chart** when it is a distinct kind.
- Wire **all tunable props** into studio:
  - `apps/web/lib/studio/studio-parsers.ts` — URL state keys and defaults
  - `apps/web/lib/studio/registry-control-groups.ts` — control groups for the right pane
  - `apps/web/lib/studio/registry.tsx` — render preview + `generateCode`
  - Chart-type defaults in `apps/web/components/studio/studio-state-provider.tsx` when switching chart type (e.g. `setChart` overrides)

### 4. Rebuild the shadcn registry

- From the **repo root**: run `pnpm registry:build`.
- This updates `apps/web/public/r/` from `packages/ui`. Ensure new components are listed in `packages/ui/registry.json` when they should be installable via shadcn.

### 5. Lint, format, test, and build

Run from repo root until clean:

```bash
pnpm lint
pnpm format
pnpm --filter @bklitui/ui test   # when package logic changed
pnpm build
pnpm registry:build              # if not already run in step 4
```

Fix all errors; repeat until hooks pass on commit.

### 6. Commit, push, and open a PR

- **Commit** with a short, clear message (e.g. `feat(charts): add ProfitLossLine component`).
- **Push** the branch.
- **Open a PR** with the ship checklist filled in (see below).

---

## PR checklist

- [ ] Chart/component moved to `packages/ui` and exported
- [ ] **Existing docs updated** with new props/features (standard preview unchanged)
- [ ] Gallery examples on the correct `/charts/**` route
- [ ] Dedicated doc page + sidebar + mobile nav (if new composable/chart kind)
- [ ] **Studio** chart updated or added with all props in control groups
- [ ] Registry rebuilt (`pnpm registry:build`)
- [ ] `pnpm lint`, tests (if applicable), and `pnpm build` pass

---

## File reference (quick lookup)

| Step | Location |
|------|----------|
| Chart exports | `packages/ui/src/charts/index.ts` |
| Chart slugs | `apps/web/components/charts/chart-slugs.ts` |
| Chart examples (nav + registry) | `apps/web/components/charts/chart-examples.tsx` |
| Component docs | `apps/web/content/docs/components/<name>.mdx` |
| Utility docs (Grid, Tooltip, …) | `apps/web/content/docs/utility/*.mdx` |
| Sidebar (desktop) | `apps/web/content/docs/components/meta.json` → `pages` |
| Mobile nav | `apps/web/components/docs/site-header.tsx` → `components` array |
| Studio registry | `apps/web/lib/studio/registry.tsx` |
| Studio controls | `apps/web/lib/studio/registry-control-groups.ts` |
| Studio URL state | `apps/web/lib/studio/studio-parsers.ts` |
| Registry (source) | `packages/ui/registry.json`; build output: `apps/web/public/r/` |
| Registry build | From root: `pnpm registry:build` |
