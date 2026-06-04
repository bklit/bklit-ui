# Deprecated: local playground

**Chart development moved to [Studio](/studio).**

The `/playground` route redirects to `/studio`. Contributors and agents should follow **`.agents/skills/bklit-studio/SKILL.md`** (not `bklit-playground`).

## Why

Studio includes the full editor (component tree, properties, motion, codegen, registry previews). Maintaining a separate gitignored playground duplicated providers and drifted from what ships.

## What to use instead

```bash
pnpm dev   # repo root
```

Open **http://localhost:3000/studio** — e.g. `?chart=line-chart`.

Implement previews in `packages/studio/src/lib/registry.tsx` and chart UI in `packages/ui/src/charts/`.

## Legacy files

`apps/web/components/playground/` is **deprecated** and may be removed. Do not add new prototypes there.
