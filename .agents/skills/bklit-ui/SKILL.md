---
name: bklit-ui
description: This skill is for transitioning a chart or component from prototype to production.
disable-model-invocation: true
---

# Bklit UI Skill

This skill is for taking an experimental chart or component from **prototype** (usually on an untracked route like the playground) into **production**: published in the UI package, documented, and ready for users.

## When to use this skill

- You have a working prototype on a temporary route (e.g. `apps/web/app/playground/page.tsx`) and want to ship it.
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

- **Chart examples (live demos)**  
  - In `apps/web/components/charts/chart-slugs.ts`: add the new chart’s slug to the `validChartSlugs` array (e.g. `"my-chart"`).
  - In `apps/web/components/charts/chart-examples.tsx`:
    - Add a nav entry in the `CHART_NAV_ITEMS` array (or equivalent list used for the chart-type tabs).
    - Register the chart in the **chart examples registry**: add a `factory` (and optionally `hero`) for the new slug so the chart appears on `/charts/[chart]` with the same pattern as existing charts (e.g. area-chart, line-chart). Reuse or mirror the prop variants you validated in the scaffolding phase.

- **Docs page for the component**  
  - Add a new MDX file under `apps/web/content/docs/components/`, e.g. `my-chart.mdx`, with:
    - Frontmatter: `title`, `description`.
    - Preview (e.g. `<ComponentPreview>`), installation (e.g. `<InstallationTabs>`), and usage sections consistent with other component docs (see e.g. `line-chart.mdx`).

- **Components index**  
  - The Components page at `apps/web/content/docs/components/index.mdx` uses `<ComponentsList />`, which lists all pages under `content/docs/components/`. Adding the new `.mdx` file is enough for it to appear **if** the sidebar includes it (see next).

- **Sidebar (desktop and mobile)**  
  - **Desktop:** The docs sidebar is built from the Fumadocs source (file-based). Add the new doc to the components section by adding its slug to `apps/web/content/docs/components/meta.json` in the `pages` array (e.g. `"my-chart"`), so the new page appears in the Components folder in the sidebar.
  - **Mobile:** The mobile nav has a hardcoded `components` list in `apps/web/components/docs/site-header.tsx`. Add an entry there for the new chart (e.g. `{ text: "My Chart", url: "/docs/components/my-chart" }`) so it appears in the mobile menu under Components.

### 3. Rebuild the shadcn registry

- From the **repo root**: run `pnpm registry:build` (or the equivalent that runs the UI package’s `registry:build` script).
- This updates `apps/web/public/r/` from `packages/ui` (including `registry.json` and per-component JSON). If the new chart is a shadcn-registry component, ensure it’s listed in `packages/ui/registry.json` (or the structure your registry uses) so the build outputs the new component’s registry files.

### 4. Lint, format, and hooks

- Run **ultracite** (lint): e.g. `pnpm lint`; fix issues with `pnpm lint:fix` or the project’s lint:fix script.
- Run **format**: e.g. `pnpm format` (or the script that runs the formatter).
- Run **prepare** (husky): ensure pre-commit hooks run (e.g. `pnpm prepare` if needed, and then commit so hooks execute).
- Fix any reported warnings or errors and **repeat** until the tree is clean (no lint/format/type errors and no hook failures).

### 5. Commit, push, and open a PR

- **Commit** with a short, clear message (e.g. `feat(charts): add MyChart component`).
- **Push** the branch.
- **Open a PR** with:
  - A **summary** of what’s new (component name, purpose, main props/features).
  - A **checklist** that mirrors this plan so reviewers can confirm:
    - [ ] Chart/component moved to `packages/ui` and exported
    - [ ] Chart slug and examples added (`chart-slugs.ts`, `chart-examples.tsx`)
    - [ ] New doc page under `content/docs/components/*.mdx`
    - [ ] Component added to `content/docs/components/meta.json` (sidebar)
    - [ ] Component added to `site-header.tsx` components list (mobile nav)
    - [ ] Registry rebuilt (`pnpm registry:build`)
    - [ ] Lint/format and hooks pass with no errors or warnings

---

## File reference (quick lookup)

| Step | Location |
|------|----------|
| Chart exports | `packages/ui/src/charts/index.ts` |
| Chart slugs | `apps/web/components/charts/chart-slugs.ts` |
| Chart examples (nav + registry) | `apps/web/components/charts/chart-examples.tsx` |
| Component docs | `apps/web/content/docs/components/<name>.mdx` |
| Components index | `apps/web/content/docs/components/index.mdx` (list is auto from docs pages) |
| Sidebar (desktop) | `apps/web/content/docs/components/meta.json` → `pages` |
| Mobile nav | `apps/web/components/docs/site-header.tsx` → `components` array |
| Registry (source) | `packages/ui/registry.json`; build output: `apps/web/public/r/` |
| Registry build | From root: `pnpm registry:build` |
