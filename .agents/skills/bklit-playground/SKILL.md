---
name: bklit-playground
description: >
  bklit-ui monorepo contributors only. Use automatically when building a new
  chart, editing an existing chart, prototyping chart props or animation, or
  working on apps/web/app/playground/. Scaffolds the editor playground with
  left motion pane, right controls pane, and center chart frame.
---

# Bklit Playground Skill

**Monorepo contributors only.** Use this skill **automatically** whenever the user is building a new chart, editing an existing chart, tuning chart props, or debugging animation — before shipping via **bklit-ship**.

## When to use (auto-trigger)

Apply this skill when the user:

- Asks to build, prototype, or edit a chart
- Adds or changes chart props, settings, data, styling, or animation
- Mentions the playground, local chart preview, or `/playground`
- Is iterating on a chart before it lives in `packages/ui`

Do **not** wait for the user to name this skill — scaffold or update the playground as part of the chart work.

## How agents discover this (route is gitignored)

The playground **page** is not in git — only the skill, template, and shared components are. Agents find the workflow via:

1. **`AGENTS.md`** (repo root) — chart work → read this skill, copy template → `page.tsx`
2. **`apps/web/app/playground/README.md`** — same copy command and pointers (committed)
3. **This skill** — `.agents/skills/bklit-playground/SKILL.md` (committed; auto-trigger description)
4. **Template** — `.agents/skills/bklit-playground/templates/page.tsx` (committed source of truth)
5. **Shared UI** — `apps/web/components/editor/`, `apps/web/components/playground/` (committed)

If `apps/web/app/playground/page.tsx` is missing, create it by copying the template. Do not invent a new layout.

## Default playground layout

The playground is a full-height **editor shell** (not a docs page with a header):

| Region | Purpose |
|--------|---------|
| **Left pane** | Animation / motion controls only |
| **Center** | Dot-grid canvas, rulers, resizable chart frame, bottom menu bar |
| **Right pane** | Chart props, data, styling, and settings controls |

**Mobile:** side panes collapse to sheet triggers (top-left = motion, top-right = controls). Fixed viewport, 4:3 chart frame, pinch-to-zoom enabled.

### Default empty state

When first scaffolded, the playground has:

- **Empty left pane** — placeholder until the chart uses motion
- **Empty right pane** — placeholder until controls are wired
- **Empty chart frame** — `PlaygroundEmptyState` alert:

> Use the playground skill to start building a new chart, or ask it to edit an existing chart. Your agent will automatically add the necessary controls.

Copy the template verbatim for new playgrounds:

```
.agents/skills/bklit-playground/templates/page.tsx
  → apps/web/app/playground/page.tsx
```

Visit `http://localhost:3000/playground` while `pnpm dev` is running.

## Control wiring rules

As you add chart functionality, **automatically** wire controls — do not leave panes empty once the chart uses those settings.

### Right pane — chart props & settings

Pass `controlGroups` to `EditorShell`. Each group maps `StudioUrlState` keys to sidebar controls.

1. **Prefer existing groups** from `apps/web/lib/studio/registry-control-groups.ts`:
   - `lineChartControlGroups`, `barChartControlGroups`, `gaugeControlGroups`, etc.
2. **Add new controls** when introducing props:
   - Extend the chart's group in `registry-control-groups.ts`, or
   - Define inline groups with helpers from `apps/web/lib/studio/sidebar-control-templates.ts` (`controlGroup`, `dataGroup`, `lineGroup`, `designGroup`, …)
3. **Wire state** with `usePlaygroundState({ chart: "your-chart", … })` or chart-specific hooks built on top of it.

```tsx
import { lineChartControlGroups } from "@/lib/studio/registry-control-groups";

<EditorShell
  controlGroups={lineChartControlGroups}
  showMotionControls={false} // see left pane rules
  chartState={chartState}
  …
/>
```

**Rule:** every new tunable prop the user adds → add a matching control to the right pane (same `key` as `StudioUrlState`).

### Left pane — animation only

Set `showMotionControls={true}` when the chart uses enter/reveal/motion (CSS reveal, Motion, spring/ease).

The left pane renders `MotionControl` (duration, ease/spring, curve editor, presets). Do **not** put data or styling controls here.

```tsx
<EditorShell
  showMotionControls
  controlGroups={lineChartControlGroups}
  chartState={chartState}
  …
/>
```

Wire motion into the chart with helpers from `apps/web/lib/studio/motion-config.ts` and pass `replayKey` from `useReplayKey()` to remount/replay.

**Rule:** animation-related settings → left pane only. Everything else → right pane.

## Scaffold checklist

When starting or resetting a playground:

- [ ] Copy template → `apps/web/app/playground/page.tsx` (gitignored)
- [ ] `EditorShell` + `EditorChartFrame` + `usePlaygroundState` + `useReplayKey`
- [ ] `controlGroups={[]}` and `showMotionControls={false}` until chart is wired
- [ ] `PlaygroundEmptyState` inside the chart frame until a chart component renders

When wiring a chart:

- [ ] Replace `PlaygroundEmptyState` with the chart component
- [ ] Set `controlGroups` to the matching registry groups (+ new groups for new props)
- [ ] Set `showMotionControls={true}` if the chart animates
- [ ] Pass `chartState.displayState` / `chartState.state` into the chart
- [ ] Pass `replayKey` and wire `onReplay` from `useReplayKey()`
- [ ] Colocate prototype components under `apps/web/components/playground/` until shipping

## Committed building blocks

Do **not** rebuild these — import from committed paths:

| Export | Path | Purpose |
|--------|------|---------|
| `EditorShell` | `@/components/editor/editor-shell` | Full editor layout |
| `EditorChartFrame` | `@/components/editor/editor-chart-frame` | Resizable chart container |
| `PlaygroundEmptyState` | `@/components/playground/playground-empty-state` | Default empty chart message |
| `usePlaygroundState` | `@/components/playground/use-playground-state` | Local studio-like state |
| `useReplayKey` | `@/components/playground/use-replay-key` | `[key, replay]` remount hook |
| `PlaygroundLineChart` | `@/components/playground/playground-line-chart` | Reference line chart wiring |
| `lineChartControlGroups` | `@/lib/studio/registry-control-groups` | Example right-pane groups |

Legacy components (`PlaygroundShell`, `PlaygroundToolbar`, `ResizablePreview`) are superseded by the editor shell — do not use them in new playgrounds.

## Example: line chart playground

```tsx
"use client";

import { useState } from "react";
import { EditorChartFrame } from "@/components/editor/editor-chart-frame";
import { EditorShell } from "@/components/editor/editor-shell";
import type { ViewportPreset } from "@/components/editor/viewport-presets";
import { resolveViewportSize } from "@/components/editor/viewport-presets";
import { PlaygroundLineChart } from "@/components/playground/playground-line-chart";
import { usePlaygroundLineChartState } from "@/components/playground/use-playground-line-chart-state";
import { useReplayKey } from "@/components/playground/use-replay-key";
import { lineChartControlGroups } from "@/lib/studio/registry-control-groups";

export default function PlaygroundPage() {
  const chartState = usePlaygroundLineChartState();
  const [replayKey, replay] = useReplayKey();
  const [viewport, setViewport] = useState<ViewportPreset | null>("desktop");
  const [size, setSize] = useState(() =>
    resolveViewportSize("desktop", 960)
  );

  return (
    <EditorShell
      chartState={chartState}
      controlGroups={lineChartControlGroups}
      onReplay={replay}
      onSizeChange={(width, height) => setSize({ width, height })}
      onViewportChange={setViewport}
      showMotionControls
      size={size}
      viewport={viewport}
    >
      {({ size: frameSize, boundsRef, onResize, mobileViewport }) => (
        <EditorChartFrame
          boundsRef={boundsRef}
          height={frameSize.height}
          onResize={onResize}
          resizable={!mobileViewport}
          width={frameSize.width}
        >
          <PlaygroundLineChart
            committedState={chartState.state}
            motionCurveDragging={chartState.motionCurveDragging}
            replayKey={replayKey}
            state={chartState.displayState}
          />
        </EditorChartFrame>
      )}
    </EditorShell>
  );
}
```

## Adding a new prop (agent workflow)

When the user adds a chart prop like `strokeWidth` or `showMarkers`:

1. Add the key to `StudioUrlState` / `defaultStudioState` if missing (`apps/web/lib/studio/studio-parsers.ts`)
2. Add a control to the chart's group in `registry-control-groups.ts` (right pane)
3. Wire the prop from `chartState.displayState` into the chart component
4. If the prop affects animation timing/easing/reveal → ensure `showMotionControls` is on and use motion helpers

When the user adds animation behavior:

1. Set `showMotionControls={true}` on `EditorShell`
2. Wire `getStudioCssRevealProps` / `studioMotionToTransition` / `motionSignature` as appropriate
3. Keep data/styling controls on the right pane

## Ship when ready

When the API is stable, follow `.agents/skills/bklit-ship/SKILL.md` to move the chart into `packages/ui`, add docs, gallery examples, and registry entries.

## File reference

| Item | Path |
|------|------|
| Playground route (gitignored) | `apps/web/app/playground/page.tsx` |
| Template | `.agents/skills/bklit-playground/templates/page.tsx` |
| Editor components | `apps/web/components/editor/` |
| Playground helpers | `apps/web/components/playground/` |
| Control group registry | `apps/web/lib/studio/registry-control-groups.ts` |
| Control templates | `apps/web/lib/studio/sidebar-control-templates.ts` |
| Ship checklist | `.agents/skills/bklit-ship/SKILL.md` |
| Gitignore entry | `.gitignore` → `apps/web/app/playground/` |
