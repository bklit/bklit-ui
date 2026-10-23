/**
 * Navigation badges — the single place to mark nav items as "New" (or
 * "Featured"). Keyed by URL so the docs sidebar, the site header's mobile
 * menu, and the site nav links all pick up the same badge. Remove an entry
 * once the item is no longer new.
 */
export type NavBadgeKind = "featured" | "new";

const navBadgesByUrl: Record<string, NavBadgeKind> = {
  "/benchmarks": "new",
  "/changelog": "new",
  "/charts/sparkline": "new",
  "/docs/components/sparkline": "new",
  "/docs/utility/band": "new",
  "/docs/utility/deadline": "new",
  "/docs/utility/trend-line": "new",
  "/docs/utility/weekends": "new",
  "/recipes": "new",
};

export function getNavBadge(url: string | undefined): NavBadgeKind | undefined {
  return url ? navBadgesByUrl[url] : undefined;
}
