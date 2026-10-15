/** Full site navigation, shown in the docs sidebar. */
export const siteNavLinks = [
  { text: "Docs", url: "/docs/installation" },
  { text: "Components", url: "/docs/components" },
  { text: "Blocks", url: "/blocks" },
  { text: "Showcase", url: "/showcase" },
  { text: "Charts", url: "/charts/area-chart" },
  { text: "Benchmarks", url: "/benchmarks" },
  { text: "Studio", url: "/studio" },
] as const;

/** Sidebar-only destinations, left out of the top navigation. */
const SIDEBAR_ONLY_URLS = new Set<string>(["/showcase", "/benchmarks"]);

/** Top navigation (site header and its mobile menu). */
export const siteHeaderNavLinks = siteNavLinks.filter(
  (link) => !SIDEBAR_ONLY_URLS.has(link.url)
);
