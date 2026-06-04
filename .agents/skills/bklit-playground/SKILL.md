---
name: bklit-playground
description: >
  DEPRECATED — use bklit-studio instead. Local /playground is no longer the
  chart development workflow for bklit-ui contributors.
disable-model-invocation: true
---

# Deprecated: bklit-playground

**This skill is retired.** Chart prototyping and editing now happen in **Studio** only.

## Use instead

Read and follow **`.agents/skills/bklit-studio/SKILL.md`**.

- Dev URL: **http://localhost:3000/studio** (`pnpm dev` from repo root)
- Optional: `?chart=line-chart` (or any slug from `packages/studio/src/chart-slugs.ts`)

## Why

Studio already includes the editor shell, component tree, properties, motion controls, codegen, and registry-backed previews. The gitignored `/playground` route duplicated wiring and drifted from production Studio.

## `/playground` route

Redirects to `/studio`. Do not scaffold `apps/web/app/playground/page.tsx` or `apps/web/components/playground/` for new chart work.

## Shipping

Unchanged: **`.agents/skills/bklit-ship/SKILL.md`** — prototypes should live in `packages/ui` and `packages/studio`, not under `apps/web/components/playground/`.
