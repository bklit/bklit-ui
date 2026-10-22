import type { MetadataRoute } from "next";
import { validChartSlugs } from "@/components/charts/chart-slugs";
import {
  changelogPageHref,
  getChangelogEntries,
  getChangelogPageCount,
} from "@/lib/changelog";
import { gitLastModified, latestDate } from "@/lib/git-last-modified";
import { SITE_URL } from "@/lib/site-url";
import { source } from "@/lib/source";

/**
 * Generated from the docs source (fumadocs) and the chart slug registry, so
 * new docs pages and charts appear automatically. `lastModified` comes from
 * git history (omitted when unavailable) rather than the build time.
 *
 * Excluded on purpose: `/charts` (redirects to `/charts/area-chart`),
 * `/playground` (redirects to `/studio`), noindexed Studio surfaces
 * (`/studio/embed`, `/studio/demo`, `/studio/og-preview`), and `/api/*`.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const docRoutes: MetadataRoute.Sitemap = source.getPages().map((page) => {
    const lastModified = (page.data as { lastModified?: Date | string })
      .lastModified;
    return {
      url: `${SITE_URL}${page.url}`,
      lastModified: lastModified ? new Date(lastModified) : undefined,
      changeFrequency: "weekly" as const,
      priority: page.url === "/docs" ? 0.95 : 0.8,
    };
  });

  const chartExamplesModified = gitLastModified([
    "components/charts",
    "app/(site)/(home)/charts",
  ]);

  const chartRoutes: MetadataRoute.Sitemap = validChartSlugs.map((slug) => ({
    url: `${SITE_URL}/charts/${slug}`,
    lastModified: latestDate(
      chartExamplesModified,
      gitLastModified([`content/docs/components/${slug}.mdx`])
    ),
    changeFrequency: "weekly" as const,
    priority: 0.85,
  }));

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: gitLastModified([
        "app/(site)/(home)/page.tsx",
        "components/design",
      ]),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/blocks`,
      lastModified: gitLastModified([
        "app/(site)/(home)/blocks",
        "components/blocks",
        "blocks",
      ]),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/showcase`,
      lastModified: gitLastModified([
        "app/(site)/(home)/showcase",
        "components/showcase",
        "lib/showcase",
      ]),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/recipes`,
      lastModified: gitLastModified([
        "app/(site)/(home)/recipes",
        "components/recipes",
        "lib/recipes",
      ]),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/benchmarks`,
      lastModified: gitLastModified([
        "app/(site)/(home)/benchmarks",
        "components/benchmarks",
      ]),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/studio`,
      lastModified: gitLastModified(["app/studio", "../../packages/studio"]),
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  const changelogEntries = getChangelogEntries();
  const changelogRoutes: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/changelog`,
      lastModified: changelogEntries[0]
        ? new Date(changelogEntries[0].date)
        : undefined,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    ...Array.from({ length: getChangelogPageCount() - 1 }, (_, index) => ({
      url: `${SITE_URL}${changelogPageHref(index + 2)}`,
      changeFrequency: "weekly" as const,
      priority: 0.4,
    })),
    ...changelogEntries.map((entry) => ({
      url: `${SITE_URL}${entry.url}`,
      lastModified: new Date(entry.date),
      changeFrequency: "yearly" as const,
      priority: 0.5,
    })),
  ];

  return [...staticRoutes, ...chartRoutes, ...changelogRoutes, ...docRoutes];
}
