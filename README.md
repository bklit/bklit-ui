![hero](https://github.com/bklit/bklit-ui/blob/main/apps/web/app/opengraph-image.png?raw=true)

<p align="center">
	<h1 align="center"><b><a href="https://ui.bklit.com">Bklit UI</a></b></h1>
<p align="center">
    A collection of Open Source charts and utility components that you can customize and extend.
    <br />
    <br />
    <a href="https://ui.bklit.com">Docs</a>
    ·
    <a href="https://x.com/bklitai">X.com</a>
    ·
    <a href="https://discord.gg/9yyK8FwPcU">Discord</a>
    ·
    <a href="https://github.com/bklit/bklit-ui/issues">Issues</a>
  </p>
</p>

## Premium Sponsors

Bklit UI is supported by our premium sponsors.

**[OpenPanel](https://openpanel.dev)** — OpenPanel is an open source analytics platform that combines web analytics and product analytics in one privacy-first tool. Track pageviews, events, funnels, retention, and user journeys — all without cookies.

## Studio

Studio is Bklit's interactive chart playground. Pick a chart, tweak styling and animation controls in real time, then copy the generated React code or export a registry JSON for your project.

<p align="center">
  <video
    src="https://github.com/bklit/bklit-ui/raw/main/apps/web/public/video/bklit-studio-promo.mp4"
    poster="https://github.com/bklit/bklit-ui/raw/main/apps/web/public/img/bklit-studio-cover.png"
    controls
    width="720"
  ></video>
</p>

[Open Studio →](https://ui.bklit.com/studio)

## Charts

| Chart | Docs | Studio |
| --- | --- | --- |
| Area Chart | [Docs](https://ui.bklit.com/docs/components/area-chart) | [Open in Studio](https://ui.bklit.com/studio?chart=area-chart) |
| Bar Chart | [Docs](https://ui.bklit.com/docs/components/bar-chart) | [Open in Studio](https://ui.bklit.com/studio?chart=bar-chart) |
| Candlestick Chart | [Docs](https://ui.bklit.com/docs/components/candlestick-chart) | [Open in Studio](https://ui.bklit.com/studio?chart=candlestick-chart) |
| Choropleth Chart | [Docs](https://ui.bklit.com/docs/components/choropleth-chart) | [Open in Studio](https://ui.bklit.com/studio?chart=choropleth-chart) |
| Composed Chart | [Docs](https://ui.bklit.com/docs/components/composed-chart) | [Open in Studio](https://ui.bklit.com/studio?chart=composed-chart) |
| Funnel Chart | [Docs](https://ui.bklit.com/docs/components/funnel-chart) | [Open in Studio](https://ui.bklit.com/studio?chart=funnel-chart) |
| Gauge | [Docs](https://ui.bklit.com/docs/components/gauge-chart) | [Open in Studio](https://ui.bklit.com/studio?chart=gauge-chart) |
| Line Chart | [Docs](https://ui.bklit.com/docs/components/line-chart) | [Open in Studio](https://ui.bklit.com/studio?chart=line-chart) |
| Live Line Chart | [Docs](https://ui.bklit.com/docs/components/live-line-chart) | [Open in Studio](https://ui.bklit.com/studio?chart=live-line-chart) |
| Pie Chart | [Docs](https://ui.bklit.com/docs/components/pie-chart) | [Open in Studio](https://ui.bklit.com/studio?chart=pie-chart) |
| Radar Chart | [Docs](https://ui.bklit.com/docs/components/radar-chart) | [Open in Studio](https://ui.bklit.com/studio?chart=radar-chart) |
| Ring Chart | [Docs](https://ui.bklit.com/docs/components/ring-chart) | [Open in Studio](https://ui.bklit.com/studio?chart=ring-chart) |
| Scatter Chart | [Docs](https://ui.bklit.com/docs/components/scatter-chart) | [Open in Studio](https://ui.bklit.com/studio?chart=scatter-chart) |
| Sankey Chart | [Docs](https://ui.bklit.com/docs/components/sankey-chart) | [Open in Studio](https://ui.bklit.com/studio?chart=sankey-chart) |

## Getting Started

```bash
pnpm install

cd apps/web && pnpm dev
```

## Project Structure

```
bklit-ui/
├── apps/
│   └── web/          # Documentation site (Next.js + Fumadocs)
│       └── app/playground/   # Local chart playground (see README; page.tsx is gitignored)
└── packages/
    └── ui/           # Component library
```

**Contributors:** chart prototyping uses the local `/playground` route. Agents: see [`AGENTS.md`](./AGENTS.md) and `.agents/skills/bklit-playground/SKILL.md`. Copy `.agents/skills/bklit-playground/templates/page.tsx` → `apps/web/app/playground/page.tsx`.

## Tech Stack

- **Framework**: Next.js 15
- **Components**: React 19
- **Styling**: Tailwind CSS 4
- **Charts**: Visx
- **Animation**: Motion
- **Docs**: Fumadocs
- **Monorepo**: Turborepo + pnpm
- **Linter**: Biome/Ultracite

## Repo activity

![Alt](https://repobeats.axiom.co/api/embed/c591b93fd9e7bfa8f4dc8bddb716699615ee5fde.svg "Repobeats analytics image")

## License

MIT
