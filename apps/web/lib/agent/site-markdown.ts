import { SITE_URL } from "../site-url";
import { MARKDOWN_CONTENT_TYPE } from "./markdown-negotiation";

/** One-paragraph product summary shared by `/llms.txt` and the Markdown homepage. */
export const SITE_SUMMARY =
  "Bklit UI is an open-source React chart and data-viz component library (d3, Motion, Tailwind 4). Charts are composable primitives (line, area, bar, pie, heatmap, sankey, and more, plus tiny inline Line/Area/Bar sparklines for tables and KPI cards, and utilities like Band, Weekends, Deadline, Trend Line, markers, and tooltips) installed via the shadcn registry. Themes use CSS custom properties with multi-hue chart palettes. The interactive Studio tunes chart props and records animations.";

const GITHUB_URL = "https://github.com/bklit/bklit-ui";

/** Markdown version of the homepage, served for `Accept: text/markdown`. */
export function homeMarkdown(): string {
  return `# Bklit UI - Charts & Data Visualization Components

> ${SITE_SUMMARY}

## Install

Bklit UI ships through the shadcn registry under the \`@bklit\` namespace:

\`\`\`bash
npx shadcn@latest add @bklit/area-chart
\`\`\`

Every component is a JSON registry item at \`${SITE_URL}/r/{name}.json\`; the full index is [registry.json](${SITE_URL}/r/registry.json).

## Explore

- [Documentation](${SITE_URL}/docs): Installation, theming, and the API of every chart primitive.
- [Installation](${SITE_URL}/docs/installation): Set up shadcn/ui and the \`@bklit\` registry.
- [Components](${SITE_URL}/docs/components): Every chart and utility component.
- [Charts gallery](${SITE_URL}/charts): Copy-paste examples for every chart type and variation.
- [Blocks](${SITE_URL}/blocks): Dashboard blocks composed from Bklit charts.
- [Recipes](${SITE_URL}/recipes): Ready-made chart recipes.
- [Studio](${SITE_URL}/studio): Interactive editor to tune chart props, palettes, and motion, then copy the code.
- [Benchmarks](${SITE_URL}/benchmarks): Live in-browser performance benchmarks against Recharts and TanStack Charts.
- [Showcase](${SITE_URL}/showcase): Real dashboards built with Bklit UI.
- [Changelog](${SITE_URL}/changelog): Release notes ([RSS](${SITE_URL}/changelog/rss.xml)).
- [GitHub](${GITHUB_URL}): Source code, issues, and MIT license.

## For agents

- [llms.txt](${SITE_URL}/llms.txt): Index of every docs page.
- [OpenAPI spec](${SITE_URL}/openapi.json): Docs search, registry, and Open Graph image endpoints.
- [Sitemap](${SITE_URL}/sitemap.xml)
`;
}

/** Markdown 404 body: what happened and where to go instead. */
export function notFoundMarkdown(pathname: string): string {
  // Percent-encode anything outside a conservative path alphabet so the
  // requested path can't inject Markdown.
  const safePath = pathname.replace(/[^A-Za-z0-9/._~-]/g, (char) =>
    encodeURIComponent(char)
  );
  return `# 404 - Page not found

There is no page at \`${safePath}\` on Bklit UI. It may have moved or never existed.

Try one of these instead:

- [Documentation](${SITE_URL}/docs)
- [llms.txt](${SITE_URL}/llms.txt): Index of every docs page.
- [Sitemap](${SITE_URL}/sitemap.xml)
- [Homepage](${SITE_URL}/)
`;
}

/** A Markdown response that tells caches it was chosen by the Accept header. */
export function markdownResponse(body: string, status = 200): Response {
  return new Response(body, {
    status,
    headers: {
      "Content-Type": MARKDOWN_CONTENT_TYPE,
      Vary: "Accept",
      ...(status === 404 ? { "X-Robots-Tag": "noindex" } : {}),
    },
  });
}
