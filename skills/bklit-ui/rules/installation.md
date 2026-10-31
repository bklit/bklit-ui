# Installation

Bklit UI is a shadcn registry. Components are copied into the project as source.

## Prerequisites

```bash
npx shadcn@latest init        # if there is no components.json
npx shadcn@latest info --json # framework, aliases, installed components
```

## Registry namespace

`@bklit` is listed in the shadcn registry index, and new projects usually resolve it automatically. If `info` shows it isn't configured, add it to `components.json`:

```json
{
  "registries": {
    "@bklit": "https://ui.bklit.com/r/{name}.json"
  }
}
```

(`https://bklit.com/r/{name}.json` serves the same files.) Without a namespace you can still install by URL: `npx shadcn@latest add https://ui.bklit.com/r/area-chart.json`.

## Install

```bash
npx shadcn@latest add @bklit/line-chart
npx shadcn@latest add @bklit/bar-chart @bklit/legend @bklit/y-axis   # several at once
npx shadcn@latest view @bklit/line-chart                              # inspect before installing
```

The CLI resolves `registryDependencies` (`@bklit/chart-context`, `@bklit/grid`, `@bklit/x-axis`, `@bklit/chart-tooltip`, …) and npm dependencies (`d3-*`, `motion`, `@number-flow/react`, …). Don't pre-install or pin these by hand unless resolving a real conflict.

## Where files land

Every component item targets `components/charts/…` (inside `src/` for `src`-dir projects): e.g. `components/charts/line-chart.tsx`, `components/charts/line.tsx`, `components/charts/tooltip/index.ts`, `components/charts/legend/index.ts`. Exceptions: `shimmering-text` → `components/shimmering-text.tsx`, `utils` → `lib/utils.ts`.

### Incorrect

```tsx
import { LineChart } from "@bklitui/ui/charts";          // private monorepo package — not installed
import { LineChart } from "@/components/ui/line-chart";  // charts don't go to components/ui
import { LineChart, XAxis } from "@/components/charts"; // no barrel for component items
```

### Correct

```tsx
import { Line, LineChart } from "@/components/charts/line-chart";
import { XAxis } from "@/components/charts/x-axis";
import { ChartTooltip } from "@/components/charts/tooltip";
```

Use the alias from `info --json` (it may not be `@/`). If the user wants a barrel, create `components/charts/index.ts` yourself and re-export only what's installed.

## Items to avoid in existing apps

- `*-example` items (`line-chart-example`, …) write `app/page.tsx` and a `components/charts/index.ts` barrel — they're for v0 / fresh sandboxes. Use the plain item instead.
- Blocks (`stat-card-*-01`) also write `components/charts/index.ts` plus shared `components/stat-card-chart.tsx` / `components/trend-badge.tsx` and sample `data/*.ts`. When the CLI asks to overwrite, merge by hand instead of accepting blindly.

## Updating

Re-running `add` prompts before overwriting changed files. The user owns the code — diff (`npx shadcn@latest add @bklit/<item> --dry-run --diff` on recent CLIs, or `view`) before overwriting local edits.

## After installing

Open the written files and read the `Props` interfaces before composing. They are the source of truth for this project's version.

Docs: https://bklit.com/docs/installation
