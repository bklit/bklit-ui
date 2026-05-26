# Local chart playground

This folder holds a **local-only** Next.js route for chart prototyping. It is not deployed and the page file is not committed.

## First-time setup

Copy the committed template to create your playground page:

```bash
cp .agents/skills/bklit-playground/templates/page.tsx apps/web/app/playground/page.tsx
```

Then visit [http://localhost:3000/playground](http://localhost:3000/playground) (`pnpm dev` from repo root).

## For AI agents

**Read `.agents/skills/bklit-playground/SKILL.md`** before creating or editing `page.tsx`.

- **Template:** `.agents/skills/bklit-playground/templates/page.tsx`
- **Default:** empty editor shell + empty panes + `PlaygroundEmptyState` in the chart frame
- **Left pane:** motion/animation (`showMotionControls`)
- **Right pane:** chart props (`controlGroups` from `registry-control-groups.ts`)
- **Editor components:** `apps/web/components/editor/`
- **Playground helpers:** `apps/web/components/playground/`

Repo-wide agent notes: [`AGENTS.md`](../../../../AGENTS.md) at the monorepo root.
