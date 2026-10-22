---
name: bklit-changelog
description: bklit-ui monorepo contributors only — write a changelog entry for the website (markdown article + abstract geometric cover art) at apps/web/content/changelog.
metadata:
  internal: "true"
---

# Bklit Changelog Skill

Write a release note for **bklitui.com/changelog**: one markdown article plus one or more abstract, single-colour SVG covers. The finished entry should read like a short, confident product post (Linear's changelog is the bar), not a commit log.

## Where things live

| What | Path |
|------|------|
| Entries (one `.mdx` per entry) | `apps/web/content/changelog/YYYY-MM-DD-<slug>.mdx` |
| Cover art | `apps/web/public/changelog/YYYY-MM-DD-<slug>.svg` |
| Cover generator | `.agents/skills/bklit-changelog/scripts/cover.mjs` |
| Schema (frontmatter) | `apps/web/source.config.ts` → `changelog` |
| Loader / sorting / search text | `apps/web/lib/changelog.ts` |
| Feed, rail, article, image | `apps/web/components/changelog/` |
| Routes | `apps/web/app/(site)/(home)/changelog/` — `/changelog`, `/changelog/page/<n>`, `/changelog/<slug>`, `/changelog/rss.xml` |
| SEO (metadata, JSON-LD) | `apps/web/lib/changelog-seo.ts` |
| Open Graph cards | `apps/web/lib/changelog-og.tsx` → `/api/og/changelog/<slug>` |

The route slug is the file name without `.mdx`. Every entry gets its own permalink, sitemap entry, RSS item, `BlogPosting` JSON-LD and a dark Open Graph card (the cover recoloured light on the dark surface) automatically; nothing else needs registering. The feed shows 20 entries per page with Newer / Older links, and the address bar follows the entry being read.

## Workflow

1. **Gather facts.** For a weekly write-up, list everything merged: `git log --since=<date> --oneline`, then read each PR body. Give big features their own entry and collect the rest into one **Fixes and improvements** entry (grouped bullets: Charts / Installing / Docs and site). Read the merged PR(s) — `git log --grep="(#NNN)"`, `gh pr view NNN` — and the docs page for every API you mention. Never invent props: grep `apps/web/content/docs` for each prop name you put in a code block.
2. **Pick the slug and date.** `YYYY-MM-DD-short-kebab-name`, dated the day it merged. Several entries on one day? Add a UTC time to `date` (`2026-10-22T18:00:00Z`) — later times sort first.
3. **Make the cover** (see *Cover art* below).
4. **Write the article** (see *Writing*).
5. **Check it** in `pnpm dev` at `/changelog` and `/changelog/<slug>`, in **both light and dark** themes and at phone width. Search for a word from the body to confirm it's indexed.

## Frontmatter

```mdx
---
title: Jittered scatter plots
description: Spread overlapping points into a readable strip plot, with deterministic offsets.
date: 2026-10-22
image: /changelog/2026-10-22-scatter-jitter.svg
imageAlt: Columns of dots scattered around vertical guide lines
tags: [scatter-chart, breaking]
---
```

- `title` — the feature, not the verb: "Linear gauges", "Band and TrendLine". Sentence case, no trailing period, ≤ 6 words.
- `description` — one sentence, ≤ 100 characters. Used for SEO and search. Says what users can now do.
- `image` / `imageAlt` — cover path under `public/`; alt describes the shapes ("A semicircle of notches…"), not the feature.
- `tags` — lower-case kebab; chart slugs where relevant (`bar-chart`), plus `breaking` for breaking changes. Tags are searchable.

## Writing

Structure:

1. **Lead paragraph (1–3 sentences).** What's new and why it matters. No heading above it, no "We're excited to…".
2. **`##` sections**, one per idea, each 1–3 short paragraphs. Headings are nouns or short phrases ("Hover follows the point", "New defaults").
3. **A closing link** to the docs page(s): `See the [scatter chart docs](/docs/components/scatter-chart).`

Code: **prose first.** Explain what users can now do in words and mention props inline (`showValue`, `exit={false}`). Use at most one code block per entry, and only when the snippet *is* the news (an install command, a one-line API that replaces a lot of work). Most entries need none — the docs link carries the code.

Style:

- Second person, present tense: "Pass `jitter` to spread them out."
- Concrete over adjectives. Name the prop, the default, the number.
- Breaking changes get their own `## New defaults` / `## Breaking changes` section with the exact props to restore the old behaviour, and the `breaking` tag.
- Open with the problem or the user's moment ("When many rows share the same date…"), then the feature.
- 150–350 words (a fixes roundup can be a longer bullet list). Cut anything a reader can't act on (refactors, internal renames, test changes).
- Use `##` and `###` only — the entry title is already the `h2` on the page. Headings render without anchors (many entries share a page).
- Link internally with root-relative paths (`/docs/...`, `/charts`, `/studio`).

## Cover art

Covers are **abstract geometric drawings** that *suggest* the feature — the shape of the data or the motion — never a screenshot, logo, UI chrome or text. Think Linear's blog art: thin strokes, lots of air, one idea per image.

### Technical rules (required)

The site renders covers as a **CSS mask** over the foreground colour (`ChangelogImage`), so the same file works in light and dark mode:

- `viewBox="0 0 1600 900"` (16:9), transparent background — **no background rect**.
- Draw in **black only** (`#000`). Express depth with `stroke-opacity` / `fill-opacity` (≈ 0.15 → 0.9), never with other colours or gradients of colour.
- Keep a ~160px safe margin; centre the composition.
- Strokes 2–3px (they render at ~40% scale on the page), `stroke-linecap="round"`. Dashes: `stroke-dasharray="6 10"`.
- No `<text>`, no raster `<image>`, no filters or blur, no external refs. Aim for < 30 KB.

### Generate with the script

```sh
node .agents/skills/bklit-changelog/scripts/cover.mjs --list
node .agents/skills/bklit-changelog/scripts/cover.mjs <motif> apps/web/public/changelog/<slug>.svg [seed]
```

Output is deterministic per motif + seed — change the seed until the composition feels balanced.

| Motif | Suggests | Use for |
|-------|----------|---------|
| `bar-steps` | growth, bars | bar charts, labels on bars, stacking |
| `scatter-jitter` | distribution | scatter, strip plots, dots |
| `band` | range, envelope | Band, confidence intervals, area ranges |
| `step-trend` | signal in noise | trend lines, regressions, forecasts |
| `gauge` | progress | gauges, loading, completion |
| `dot-grid` | density | heatmaps, contribution grids |
| `radial-bars` | comparison, score | benchmarks, performance, metrics |
| `hue-discs` | mixing, overlap | palettes, theming, colour tokens |
| `halo` | hover, focus | tooltips, hover states, interaction |
| `swatches` | texture, style | recipes, patterns, visual styles |
| `rails` | structure | site and docs design, layout |
| `migrate` | order from chaos | migrations, agent skills, tooling |
| `waves` | jagged → smooth | fixes and polish roundups |

### Drawing a custom cover

When no motif fits, hand-write the SVG (or add a motif to `cover.mjs` so it's reusable). Start from:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" fill="#000" stroke="#000" stroke-linecap="round">
  <g>
    <!-- one idea, 2–3px strokes, opacity for depth -->
  </g>
</svg>
```

**Take the style, not the pictures.** Linear's blog is the reference for *tone* (thin strokes, air, monochrome), but never recreate a specific Linear illustration — no compressed vertical-line bars, loop-de-loop spirals, fans of lines from one corner, or tick tracks with a cursor. Draw from Bklit's own vocabulary instead: chart marks (bars, dots, bands, arcs), site chrome (rails, rivets, frames), and the feature's actual shape.

Good covers: one dominant form; repetition with a single change (density, length, opacity) that creates motion; a focal point slightly off-centre; plenty of negative space. Avoid: literal chart axes with labels, more than two ideas, dense noise, heavy filled areas (they read as a grey block in the mask).

### Inline images

Extra diagrams inside the body use plain markdown — any `.svg` is rendered with the same masked frame:

```md
![A stepped line with a straight line running through it](/changelog/2026-10-20-trend-line.svg)
```

Use at most one inline image per entry, under the section it illustrates.

## Checklist

- [ ] File named `YYYY-MM-DD-<slug>.mdx`; `date` matches (time added if same-day ordering matters)
- [ ] Every prop / component mentioned exists in `apps/web/content/docs`; at most one code block
- [ ] Cover is original (not a recreation of a reference illustration)
- [ ] Cover SVG follows the technical rules; looks right in light **and** dark, and on the OG card (`/api/og/changelog/<slug>`)
- [ ] Description ≤ 100 chars; title sentence case
- [ ] Breaking changes called out with the restore props + `breaking` tag
- [ ] Ends with a docs link
- [ ] `pnpm --filter web check-types` passes (frontmatter is schema-validated at build)
