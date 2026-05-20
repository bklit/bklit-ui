import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const DOCS_DIR = path.join(ROOT, "apps/web/content/docs");
const WIKI_DIR = path.join(ROOT, "wiki");

const FRONTMATTER_RE = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
const TITLE_RE = /^title:\s*(.+)$/m;
const DESCRIPTION_RE = /^description:\s*(.+)$/m;

const SUMMARY =
  "> Bklit UI is an open-source React chart and data-viz component library (Visx, Motion, Tailwind 4) shipped from `packages/ui`, with a Next.js 15 + Fumadocs docs site at `apps/web`. Components install via the shadcn registry (`ui.bklit.com/r/*.json`). The interactive Studio (`/studio`) tunes chart props and records animations; it targets desktop browsers.";

const CONTEXT =
  "Documentation source files live under `apps/web/content/docs/` (MDX, Fumadocs). The monorepo uses pnpm and Turborepo. Chart demos are at `/charts/[slug]`; registry JSON is served from `apps/web/public/r/`.";

function walkMdx(dir, base = dir) {
  const entries = [];
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      entries.push(...walkMdx(full, base));
    } else if (name.endsWith(".mdx")) {
      entries.push(path.relative(base, full));
    }
  }
  return entries.sort();
}

function parseFrontmatter(raw) {
  const match = raw.match(FRONTMATTER_RE);
  if (!match) {
    return { title: "Untitled", description: "", body: raw };
  }
  const fm = match[1];
  const body = match[2];
  const title = fm.match(TITLE_RE)?.[1]?.trim() ?? "Untitled";
  const description = fm.match(DESCRIPTION_RE)?.[1]?.trim() ?? "";
  return { title, description, body };
}

function sectionFor(relPath) {
  if (relPath === "index.mdx") {
    return "Getting Started";
  }
  if (relPath.startsWith("components/")) {
    return "Chart Components";
  }
  if (relPath.startsWith("utility/")) {
    return "Utilities";
  }
  return "Documentation";
}

const files = walkMdx(DOCS_DIR);
const bySection = new Map();

for (const rel of files) {
  const section = sectionFor(rel);
  if (!bySection.has(section)) {
    bySection.set(section, []);
  }
  const { title, description } = parseFrontmatter(
    fs.readFileSync(path.join(DOCS_DIR, rel), "utf8")
  );
  bySection.get(section).push({ rel, title, description });
}

const sectionOrder = [
  "Getting Started",
  "Chart Components",
  "Utilities",
  "Documentation",
];

function buildIndex(linkPrefix) {
  const lines = ["# Bklit UI", "", SUMMARY, "", CONTEXT, ""];
  for (const section of sectionOrder) {
    const items = bySection.get(section);
    if (!items?.length) {
      continue;
    }
    lines.push(`## ${section}`, "");
    for (const { rel, title, description } of items) {
      const desc =
        description ||
        `Documentation for ${title} in the Bklit UI component library.`;
      lines.push(`- [${title}](${linkPrefix}${rel}): ${desc}`);
    }
    lines.push("");
  }
  lines.push("## Optional", "");
  lines.push(
    "- [Repository README](../README.md): Monorepo setup, scripts, and license."
  );
  lines.push("");
  return lines.join("\n");
}

function buildFull(linkPrefix) {
  const lines = ["# Bklit UI", "", SUMMARY, "", CONTEXT, ""];
  for (const section of sectionOrder) {
    const items = bySection.get(section);
    if (!items?.length) {
      continue;
    }
    lines.push(`## ${section}`, "");
    for (const { rel, title } of items) {
      const { body } = parseFrontmatter(
        fs.readFileSync(path.join(DOCS_DIR, rel), "utf8")
      );
      lines.push(
        `<doc title="${title}" path="${linkPrefix}${rel}">`,
        body.trim(),
        "</doc>",
        ""
      );
    }
  }
  return `${lines.join("\n")}\n`;
}

fs.mkdirSync(WIKI_DIR, { recursive: true });

const rootIndex = buildIndex("./apps/web/content/docs/");
const wikiIndex = buildIndex("../apps/web/content/docs/");
const wikiFull = buildFull("../apps/web/content/docs/");

fs.writeFileSync(path.join(ROOT, "llms.txt"), rootIndex);
fs.writeFileSync(path.join(WIKI_DIR, "llms.txt"), wikiIndex);
fs.writeFileSync(path.join(WIKI_DIR, "llms-full.txt"), wikiFull);

console.log(
  `Wrote llms.txt, wiki/llms.txt, wiki/llms-full.txt (${files.length} docs)`
);
