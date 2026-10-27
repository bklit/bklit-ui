/**
 * Shared constants for the chart Open Graph images.
 *
 * `/api/og/charts/[chart]` and `/api/og/home` screenshot internal render
 * pages (`/og/charts/[chart]`, `/og/home`) in headless Chrome: a floor of
 * chart panels tilted away in perspective, centred on a featured chart.
 */

/**
 * Bump when the card design changes so social caches (X, LinkedIn, Slack,
 * Discord) fetch a fresh image: it is part of every og:image URL.
 */
export const CHART_OG_VERSION = "6";

/**
 * `wide` is the 1200×630 letterbox card (og:image / twitter:image). `square`
 * is a purpose-built 1200×1200 card, listed as a second og:image for
 * platforms that show 1:1 link previews.
 */
export type ChartOgFormat = "wide" | "square";

export const CHART_OG_SIZES = {
  wide: { width: 1200, height: 630 },
  square: { width: 1200, height: 1200 },
} as const satisfies Record<ChartOgFormat, { width: number; height: number }>;

export function isChartOgFormat(value: unknown): value is ChartOgFormat {
  return value === "wide" || value === "square";
}

/** Set to `"true"` on the card root once data, fonts and first paint are in. */
export const CHART_OG_READY_ATTR = "data-og-ready";

/** Card root element the capture screenshots. */
export const CHART_OG_CARD_ATTR = "data-og-card";

function withFormat(base: string, format: ChartOgFormat): string {
  return format === "square" ? `${base}&format=square` : base;
}

/** `/charts/[chart]` og:image URL. */
export function chartOgImagePath(
  slug: string,
  format: ChartOgFormat = "wide"
): string {
  return withFormat(`/api/og/charts/${slug}?v=${CHART_OG_VERSION}`, format);
}

/** Homepage og:image URL. */
export function homeOgImagePath(format: ChartOgFormat = "wide"): string {
  return withFormat(`/api/og/home?v=${CHART_OG_VERSION}`, format);
}

/**
 * Internal render page the capture screenshots: `/og/charts/[chart]` for a
 * chart page, `/og/home` for the homepage. Not linked, noindex, disallowed in
 * robots.txt (`/og/`).
 */
export function chartOgRenderPath(
  subject: string,
  format: ChartOgFormat = "wide"
): string {
  const base = subject === "home" ? "/og/home" : `/og/charts/${subject}`;
  return format === "square" ? `${base}/square` : base;
}
