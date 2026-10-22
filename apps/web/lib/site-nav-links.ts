export interface SiteNavLink {
  text: string;
  url: string;
  active?: "url" | "nested-url";
}

/**
 * Full site navigation — the docs sidebar's "Getting Started" group and the
 * site header's mobile menu. Badges ("New") come from `lib/nav-badges.ts`.
 */
export const siteNavLinks = [
  { text: "Docs", url: "/docs/installation" },
  { text: "Components", url: "/docs/components" },
  { text: "Recipes", url: "/recipes" },
  { text: "Showcase", url: "/showcase" },
  { text: "Charts", url: "/charts/area-chart" },
  { text: "Benchmarks", url: "/benchmarks" },
  { text: "Studio", url: "/studio" },
] as const satisfies readonly SiteNavLink[];

/** Sidebar-only destinations, left out of the desktop top navigation. */
const SIDEBAR_ONLY_URLS = new Set<string>(["/showcase", "/benchmarks"]);

/** Desktop top navigation (site header). */
export const siteHeaderNavLinks = siteNavLinks.filter(
  (link) => !SIDEBAR_ONLY_URLS.has(link.url)
);

const fileExtensionPattern = /\.[a-z0-9]+$/i;

/** Plain-file routes (e.g. `/llms.txt`) that must skip client-side routing. */
export function isFileUrl(url: string): boolean {
  return fileExtensionPattern.test(url);
}
