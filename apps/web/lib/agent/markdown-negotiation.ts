/**
 * HTTP content negotiation for agents that send `Accept: text/markdown`
 * (https://acceptmarkdown.com). Pure helpers so the middleware stays tiny and
 * the rules are unit-tested.
 */

export const MARKDOWN_CONTENT_TYPE = "text/markdown; charset=utf-8";

interface MediaRange {
  type: string;
  subtype: string;
  q: number;
}

function parseAccept(accept: string): MediaRange[] {
  const ranges: MediaRange[] = [];
  for (const part of accept.split(",")) {
    const [mediaType = "", ...params] = part.trim().split(";");
    const [type, subtype] = mediaType.trim().toLowerCase().split("/");
    if (!(type && subtype)) {
      continue;
    }
    let q = 1;
    for (const param of params) {
      const [key, value] = param.trim().split("=");
      if (key?.trim().toLowerCase() === "q") {
        const parsed = Number.parseFloat(value ?? "");
        q = Number.isFinite(parsed) ? Math.min(Math.max(parsed, 0), 1) : 0;
      }
    }
    ranges.push({ type, subtype, q });
  }
  return ranges;
}

/** q-value the client gives `type/subtype`, using the most specific match. */
function qualityFor(ranges: MediaRange[], type: string, subtype: string) {
  let best: { specificity: number; q: number } | undefined;
  for (const range of ranges) {
    let specificity = -1;
    if (range.type === type && range.subtype === subtype) {
      specificity = 2;
    } else if (range.type === type && range.subtype === "*") {
      specificity = 1;
    } else if (range.type === "*" && range.subtype === "*") {
      specificity = 0;
    }
    if (specificity >= 0 && (!best || specificity > best.specificity)) {
      best = { specificity, q: range.q };
    }
  }
  return best;
}

/**
 * `true` when the client explicitly asks for `text/markdown` and ranks it at
 * least as high as `text/html`. Wildcards alone (`*\/*`, curl's default) and
 * browser Accept headers keep getting HTML.
 */
export function prefersMarkdown(accept: string | null | undefined): boolean {
  if (!accept) {
    return false;
  }
  const ranges = parseAccept(accept);
  const markdown = qualityFor(ranges, "text", "markdown");
  if (markdown?.specificity !== 2 || markdown.q === 0) {
    return false;
  }
  const html = qualityFor(ranges, "text", "html");
  return markdown.q >= (html?.q ?? 0);
}

/**
 * First path segments served by `app/` routes or `public/`. A path whose first
 * segment is not listed cannot match any page, so the middleware can answer a
 * Markdown 404 without rendering. Kept in sync with the filesystem by
 * `__tests__/markdown-negotiation.test.ts`.
 */
export const KNOWN_TOP_LEVEL_SEGMENTS: ReadonlySet<string> = new Set([
  // app/
  "api",
  "benchmarks",
  "blocks",
  "changelog",
  "charts",
  "docs",
  "docs-tree.json",
  "lab",
  "llms.txt",
  "og",
  "openapi.json",
  "playground",
  "recipes",
  "showcase",
  "studio",
  // app/ metadata files
  "apple-icon.png",
  "favicon.ico",
  "opengraph-image.png",
  "robots.txt",
  "sitemap.xml",
  "twitter-image.png",
  // public/
  "fonts",
  "img",
  "r",
  "readme",
]);

/** `true` when no route can serve `pathname` (unknown first segment). */
export function isUnknownTopLevelPath(pathname: string): boolean {
  const [segment] = pathname.split("/").filter(Boolean);
  if (!segment) {
    return false;
  }
  let decoded = segment;
  try {
    decoded = decodeURIComponent(segment);
  } catch {
    // Malformed escapes can't match a route either.
    return true;
  }
  return !KNOWN_TOP_LEVEL_SEGMENTS.has(decoded);
}
