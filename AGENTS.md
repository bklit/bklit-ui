# Agent guide (bklit-ui contributors)

This repo uses **Agent Skills** in `.agents/skills/` for monorepo-specific workflows. Read the relevant skill before acting — do not guess at file layout.

## Building or editing a chart

**Always read and follow `.agents/skills/bklit-studio/SKILL.md` first.**

Develop and preview charts in **Studio** at **http://localhost:3000/studio** (`pnpm dev` from repo root). Use `?chart=<slug>` for a specific chart (slugs in `packages/studio/src/chart-slugs.ts`).

The local **`/playground`** route is **deprecated** (redirects to Studio). Do not scaffold `apps/web/app/playground/` or `apps/web/components/playground/` for new work.

Committed building blocks (do not reimplement):

| Area | Path |
|------|------|
| Studio app shell | `apps/web/app/studio/page.tsx` → `@bklitui/studio` `StudioShell` |
| Chart registry + preview render | `packages/studio/src/lib/registry.tsx` |
| Layer tree (components panel) | `packages/studio/src/lib/studio-components.ts` |
| Control groups | `packages/studio/src/lib/registry-control-groups.ts` |
| URL state | `packages/studio/src/lib/studio-parsers.ts` |
| Chart primitives | `packages/ui/src/charts/` |

**Pane rules:** left = layers + data + motion; right = selected layer properties; visibility = layer eye toggles.

## Shipping a chart to production

Read `.agents/skills/bklit-ship/SKILL.md` when the chart API is stable in `packages/ui` and Studio.

## Other contributor skills

| Skill | When |
|-------|------|
| `bklit-studio` | New or existing chart — prototype and edit in `/studio` |
| `bklit-ship` | Ship chart to docs, gallery, shadcn registry |
| `bklit-studio-chart-performance` | Studio chart FPS audit, pan/zoom jank, Motion subscription cleanup |
| `pr-open` | Commit, push, open PR (bklit-ui checklist) |
| `unit-tests` | Adding tests — avoid over-testing |
| `turborepo` | Monorepo tasks, turbo.json, caching |
| `shadcn` | shadcn/ui components in this repo |
| `add-x-tweet` | Homepage testimonial from an X URL |
| `wiki-llms-text` | Generate llms.txt for docs |

`bklit-playground` is **deprecated** — see `.agents/skills/bklit-playground/SKILL.md` for the redirect to `bklit-studio`.
