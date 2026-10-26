/**
 * Shared constants for `/charts/[chart]` Open Graph images.
 *
 * `/api/og/charts/[chart]` screenshots the internal render page
 * `/og/charts/[chart]` (the chart page's featured example inside a crop of
 * the homepage design) in headless Chrome.
 */

/**
 * Bump when the card design changes so social caches (X, LinkedIn, Slack,
 * Discord) fetch a fresh image: it is part of every og:image URL.
 */
export const CHART_OG_VERSION = "3";

export const CHART_OG_SIZE = { width: 1200, height: 630 } as const;

/** Internal render page (not linked, noindex, disallowed in robots.txt). */
export const CHART_OG_RENDER_PATH = "/og/charts";

/** Set to `"true"` on the card root once data, fonts and first paint are in. */
export const CHART_OG_READY_ATTR = "data-og-ready";

/** Card root element the capture screenshots. */
export const CHART_OG_CARD_ATTR = "data-og-card";

export function chartOgImagePath(slug: string): string {
  return `/api/og/charts/${slug}?v=${CHART_OG_VERSION}`;
}
