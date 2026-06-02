# Agent guide (bklit-ui contributors)

This repo uses **Agent Skills** in `.agents/skills/` for monorepo-specific workflows. Read the relevant skill before acting — do not guess at file layout.

## Building or editing a chart

**Always read and follow `.agents/skills/bklit-playground/SKILL.md` first.**

The local playground route is **not committed** (`apps/web/app/playground/page.tsx` is gitignored). Scaffold it from the committed template:

```
.agents/skills/bklit-playground/templates/page.tsx
  → apps/web/app/playground/page.tsx
```

See also `apps/web/app/playground/README.md`.

Committed building blocks the agent should reuse (do not reimplement):

| Area | Path |
|------|------|
| Editor shell (layout, panes, mobile) | `@bklitui/studio` (`EditorShell`, `EditorChartFrame`) |
| Playground helpers (state, empty state, charts) | `apps/web/components/playground/` |
| Control groups (right pane) | `@bklitui/studio` or `packages/studio/src/lib/registry-control-groups.ts` |
| Playground skill + template | `.agents/skills/bklit-playground/` |

**Pane rules:** animation → left pane (`showMotionControls`); props/settings → right pane (`controlGroups`).

## Shipping a chart to production

Read `.agents/skills/bklit-ship/SKILL.md` when moving a prototype from the playground into `packages/ui`.

## Other contributor skills

| Skill | When |
|-------|------|
| `bklit-playground` | New chart, edit chart, tune props/animation, `/playground` |
| `bklit-ship` | Ship chart to `packages/ui` + docs + registry |
| `bklit-studio-chart-performance` | Studio chart FPS audit, pan/zoom jank, Motion subscription cleanup |
| `pr-open` | Commit, push, open PR (bklit-ui checklist) |
| `unit-tests` | Adding tests — avoid over-testing |
| `turborepo` | Monorepo tasks, turbo.json, caching |
| `shadcn` | shadcn/ui components in this repo |
| `add-x-tweet` | Homepage testimonial from an X URL |
| `wiki-llms-text` | Generate llms.txt for docs |
