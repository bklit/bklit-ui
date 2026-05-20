import type { MetadataRoute } from "next";
import { validChartSlugs } from "@/components/charts/chart-slugs";
import { SITE_URL } from "@/lib/site-url";
import { source } from "@/lib/source";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/charts`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/studio`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];

  const chartRoutes: MetadataRoute.Sitemap = validChartSlugs.map((slug) => ({
    url: `${SITE_URL}/charts/${slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.85,
  }));

  const docRoutes: MetadataRoute.Sitemap = source.getPages().map((page) => ({
    url: `${SITE_URL}${page.url}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: page.url === "/docs" ? 0.95 : 0.8,
  }));

  return [...staticRoutes, ...chartRoutes, ...docRoutes];
}
