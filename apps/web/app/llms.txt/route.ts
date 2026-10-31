import type * as PageTree from "fumadocs-core/page-tree";
import { siteNavLinks } from "@/lib/site-nav-links";
import { SITE_URL } from "@/lib/site-url";
import { source } from "@/lib/source";

/**
 * `/llms.txt` (https://llmstxt.org) — generated at build time from the docs
 * source and page tree, so every docs page is listed in sidebar order without
 * a hand-maintained file. The repo-root `llms.txt` (source-file links) is
 * generated separately by `scripts/generate-llms.mjs`.
 */
export const dynamic = "force-static";

const SUMMARY =
  "Bklit UI is an open-source React chart and data-viz component library (d3, Motion, Tailwind 4). Charts are composable primitives (line, area, bar, pie, heatmap, sankey, and more, plus tiny inline Line/Area/Bar sparklines for tables and KPI cards, and utilities like Band, Weekends, Deadline, Trend Line, markers, and tooltips) installed via the shadcn registry. Themes use CSS custom properties with multi-hue chart palettes. The interactive Studio tunes chart props and records animations.";

interface DocEntry {
  title: string;
  url: string;
  description?: string;
}

interface Section {
  title: string;
  entries: DocEntry[];
}

const pagesByUrl = new Map(
  source.getPages().map((page) => [page.url, page] as const)
);

function toEntry(url: string): DocEntry | undefined {
  const page = pagesByUrl.get(url);
  if (!page) {
    return;
  }
  return {
    title: page.data.title ?? page.url,
    url: page.url,
    description: page.data.description,
  };
}

function collectEntries(node: PageTree.Node, entries: DocEntry[]) {
  if (node.type === "page") {
    const entry = toEntry(node.url);
    if (entry) {
      entries.push(entry);
    }
    return;
  }
  if (node.type === "folder") {
    if (node.index) {
      collectEntries(node.index, entries);
    }
    for (const child of node.children) {
      if (child.type === "page" && child.url === node.index?.url) {
        continue;
      }
      collectEntries(child, entries);
    }
  }
}

function buildSections(): Section[] {
  const sections: Section[] = [];
  for (const node of source.pageTree.children) {
    if (node.type === "separator") {
      sections.push({ title: String(node.name ?? "Docs"), entries: [] });
      continue;
    }
    if (sections.length === 0) {
      sections.push({ title: "Docs", entries: [] });
    }
    const current = sections.at(-1);
    if (current) {
      collectEntries(node, current.entries);
    }
  }

  // Docs pages that aren't in the sidebar tree (introduction, installation,
  // components overview), ordered like the sidebar's "Getting Started" links.
  const listed = new Set(
    sections.flatMap((section) => section.entries.map((entry) => entry.url))
  );
  const navRank = (url: string) => {
    if (url === "/docs") {
      return -1;
    }
    const index = siteNavLinks.findIndex((link) => link.url === url);
    return index === -1 ? siteNavLinks.length : index;
  };
  const gettingStarted = [...pagesByUrl.keys()]
    .filter((url) => !listed.has(url))
    .sort((a, b) => navRank(a) - navRank(b) || a.localeCompare(b))
    .map(toEntry)
    .filter((entry): entry is DocEntry => Boolean(entry));

  return [
    { title: "Getting Started", entries: gettingStarted },
    ...sections,
  ].filter((section) => section.entries.length > 0);
}

function formatEntry({ title, url, description }: DocEntry) {
  const link = `- [${title}](${SITE_URL}${url})`;
  return description ? `${link}: ${description}` : link;
}

export function GET() {
  const lines = ["# Bklit UI", "", `> ${SUMMARY}`, ""];

  for (const section of buildSections()) {
    lines.push(`## ${section.title}`, "", ...section.entries.map(formatEntry));
    lines.push("");
  }

  lines.push(
    "## Optional",
    "",
    `- [Charts gallery](${SITE_URL}/charts): Copy-paste examples for every chart type and variation.`,
    `- [Blocks](${SITE_URL}/blocks): Dashboard blocks composed from Bklit charts.`,
    `- [Studio](${SITE_URL}/studio): Interactive editor to tune chart props, palettes, and motion, then copy the code.`,
    `- [Benchmarks](${SITE_URL}/benchmarks): Live in-browser performance benchmarks (mount, update, hover, DOM size) against Recharts and TanStack Charts.`,
    `- [Showcase](${SITE_URL}/showcase): Real dashboards and data experiences built with Bklit UI.`,
    ""
  );

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
