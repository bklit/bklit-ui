import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/api/og/"],
      // API routes are not pages; `/api/og/` stays crawlable so social and
      // search bots can fetch Open Graph images. Noindexed pages (Studio
      // embed/demo/og-preview) are left crawlable so bots can see `noindex`.
      disallow: ["/api/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
