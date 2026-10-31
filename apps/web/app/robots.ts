import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/api/og/"],
      // API routes are not pages; `/api/og/` stays crawlable so social and
      // search bots can fetch Open Graph images.
      //
      // Other noindexed pages (Studio embed/demo) stay
      // crawlable so bots can see their `noindex`. The OG render surfaces are
      // blocked outright instead: they are internal screenshot targets with
      // no content of their own (`/og/` chart + home cards, `/studio/og-preview`)
      // or a dev-only tool that 404s in production (`/charts/og-preview`),
      // and crawling them would only spend crawl budget. They also send
      // `X-Robots-Tag: noindex, nofollow` (next.config) and noindex metadata
      // in case a URL is discovered elsewhere. The headless Chrome that
      // screenshots them does not read robots.txt. `/lab/` holds hidden
      // contributor tools (e.g. the chart regression lab) that 404 in production.
      disallow: [
        "/api/",
        "/og/",
        "/studio/og-preview",
        "/charts/og-preview",
        "/lab/",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
