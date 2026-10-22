---
name: bklit-ui-design
description: >
  Turns plain-language chart design requests into exact Bklit UI (@bklit shadcn
  registry) components and props, styled to fit the host app. Use when someone
  describes how a chart should look rather than naming props, e.g. "diagonal
  pattern background that fades out", "squircle bars", "3D glass bars", "hatched
  area", "dot grid", "skeleton loading state", "dashed forecast", "half donut",
  "make the charts match my brand / dark mode / border radius". Detects the
  project's Tailwind version, colour format, dark-mode strategy, radius and
  existing chart tokens, then picks a proven recipe, installs the right
  @bklit/<item>, adapts colours to theme tokens and states honestly when Bklit
  has no prop for the request. Also use when theming or restyling Bklit charts.
---

# Bklit UI design

Map what people *say* ("a hatched backdrop that fades at the edges") to what
Bklit *has* (`<Background />`), then make it look native to the app it lands in.

Bklit charts are installed as source with `npx shadcn@latest add @bklit/<item>`
(use the project's runner: `pnpm dlx`, `bunx --bun`, …) and imported from the
project's alias, e.g. `@/components/charts/background`. Never import from
`@bklitui/ui/charts` — that is the private monorepo package.

## Workflow

### 1. Detect the host design

Run the bundled detector from the user's project root. `<skill-dir>` is the
folder containing this SKILL.md (commonly `.claude/skills/bklit-ui-design`,
`.agents/skills/bklit-ui-design` or `~/.claude/skills/bklit-ui-design`):

```bash
node <skill-dir>/scripts/detect-design.mjs
```

Zero dependencies, Node ≥ 18, never throws. It prints JSON: `tailwindVersion`,
`cssPath`, `colorFormat`, `darkMode`, `tokens` (`--primary`, `--radius`, …),
`chartVars` (light/dark `--chart-*`), `themeInline`, `components` (from
`components.json`), `primitives`, `chartLibs`, `bklit.installed` and
`warnings`. Agents without shell access: read `components.json`, the global CSS
file it names, and `package.json`, and collect the same facts by hand.

Read `warnings` first — they flag the problems that make charts look broken
(gray default palette, Tailwind v3 bare-HSL tokens, missing `@theme` mappings).

### 2. Parse the request into design intents

Split the sentence into intents (background, fade, shape, fill, line, markers,
tooltip, grid, legend, loading, motion, annotation) and look each up in
[references/vocabulary.md](./references/vocabulary.md). Example:

> "squircle bars with a ghost track and a ring on hover"
> → shape: `BarSquares squareRadius={0.5}` + `BarChart squareSnap` ·
> track: `BarColumnTrack` · tooltip: `ChartTooltip dotVariant="ring" dotRadiusFraction={0.5}`

> "diagonal pattern background that fades out on all sides"
> → `<Background />` (diagonal and 4-side fade are the defaults)

### 3. Pick a recipe and adapt it

Start from the closest composition in [references/recipes.md](./references/recipes.md)
rather than assembling from scratch — those are the gallery's proven looks.
Then adapt to the detection output:

- colours → `var(--chart-1..5)` / `chartCssVars`, never literals;
- corner style → host `--radius` (rules/taste.md §4);
- density → fewer grid rows / no background in small dashboard cards;
- palette, dark mode, Tailwind v3 quirks → [rules/theming.md](./rules/theming.md).

### 4. Install the registry items

Install every item the composition touches (the vocabulary's import table lists
which slug provides each export), e.g.:

```bash
npx shadcn@latest add @bklit/bar-chart @bklit/bar-depth @bklit/chart-tooltip
```

shadcn adds missing CSS variables without overwriting the host's existing ones.
If `@bklit` does not resolve, see the `bklit-ui` skill's installation notes.

### 5. Confirm props against the installed source

Open the installed files (`components/charts/<file>.tsx`) and check every prop
you plan to use exists with the expected type. The registry source is the
contract; this skill can lag behind it.

### 6. Apply the taste rules

Run through [rules/taste.md](./rules/taste.md): one decorative layer, subtle
backgrounds, no stacked effects, corners matching `--radius`, rings with
squares, tokens only, dark mode verified, unique pattern ids.

### 7. Be honest about gaps

If the request needs something Bklit lacks (see "Not supported" in the
vocabulary — e.g. hexagon `Background` preset, glow on lines, stacked areas,
labels on bars), say so plainly, then offer the nearest supported look or a
small custom composition (recipe 15 shows the pattern). Never invent props such
as `pattern="hexagons"` or `glow`.

## Output checklist

- Install command(s) with the exact `@bklit/<item>` slugs.
- Complete JSX with imports from the project alias.
- Any CSS token changes, in the host's colour format, for light **and** dark.
- One line per honest gap or trade-off.
- Links when useful: `https://bklit.com/docs/components/<slug>`,
  `https://bklit.com/charts/<slug>`, `https://bklit.com/studio?chart=<slug>`.

## Files

| File | Use |
|---|---|
| [references/vocabulary.md](./references/vocabulary.md) | Phrase → JSX/props → registry slug; import map; unsupported list |
| [references/recipes.md](./references/recipes.md) | 15 complete compositions for named looks |
| [rules/taste.md](./rules/taste.md) | Design rules with incorrect/correct pairs |
| [rules/theming.md](./rules/theming.md) | Host signals → chart token overrides (v4, v3, dark mode) |
| [scripts/detect-design.mjs](./scripts/detect-design.mjs) | Design detection (JSON) |
| [evals/evals.json](./evals/evals.json) | Behaviour checks for this skill |
