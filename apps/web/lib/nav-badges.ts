/**
 * Navigation badges — the single place to mark nav items as "New",
 * "Beta" (orange) or "Featured". Keyed by URL so the docs sidebar, the site header's mobile
 * menu, and the site nav links all pick up the same badge. Remove an entry
 * once the item is no longer new.
 */
export type NavBadgeKind = "beta" | "featured" | "new";

const navBadgesByUrl: Record<string, NavBadgeKind> = {
  "/docs/components/particle-line": "new",
  "/docs/react-native": "beta",
  "/recipes": "new",
};

export function getNavBadge(url: string | undefined): NavBadgeKind | undefined {
  return url ? navBadgesByUrl[url] : undefined;
}
