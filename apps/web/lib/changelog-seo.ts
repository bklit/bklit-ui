import type { Metadata } from "next";
import {
  type ChangelogEntry,
  changelogOgImagePath,
  changelogPageHref,
  getChangelogPage,
} from "@/lib/changelog";
import { absoluteUrl, pageMetadata, SITE_NAME } from "@/lib/seo";
import { SITE_URL } from "@/lib/site-url";

export const CHANGELOG_DESCRIPTION =
  "New charts, primitives, Studio features and fixes shipped to Bklit UI, newest first.";

const rssAlternate = {
  types: {
    "application/rss+xml": [
      { url: "/changelog/rss.xml", title: `${SITE_NAME} Changelog` },
    ],
  },
};

function ogImage(entry: ChangelogEntry | undefined, alt: string) {
  return {
    url: changelogOgImagePath(entry?.slug),
    width: 1200,
    height: 630,
    alt,
    type: "image/png",
  };
}

/** Index and paginated pages. Page 1 card uses the latest entry's artwork. */
export function changelogPageMetadata(page: number): Metadata {
  const path = changelogPageHref(page);
  const title = page > 1 ? `Changelog – Page ${page}` : "Changelog";
  const metadata = pageMetadata({
    title,
    description: CHANGELOG_DESCRIPTION,
    path,
    images: [ogImage(page > 1 ? getChangelogPage(page)[0] : undefined, title)],
  });
  return {
    ...metadata,
    alternates: { ...metadata.alternates, ...rssAlternate },
  };
}

export function changelogEntryMetadata(entry: ChangelogEntry): Metadata {
  const metadata = pageMetadata({
    title: `${entry.title} – Changelog`,
    description: entry.description ?? `${entry.title} — Bklit UI changelog.`,
    path: entry.url,
    ogType: "article",
    images: [ogImage(entry, entry.title)],
  });
  return {
    ...metadata,
    alternates: { ...metadata.alternates, ...rssAlternate },
    openGraph: {
      ...metadata.openGraph,
      type: "article",
      publishedTime: new Date(entry.timestamp).toISOString(),
      tags: entry.tags,
    },
  };
}

const publisher = {
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
};

function blogPosting(entry: ChangelogEntry) {
  const url = absoluteUrl(entry.url);
  return {
    "@type": "BlogPosting",
    headline: entry.title,
    description: entry.description,
    datePublished: new Date(entry.timestamp).toISOString(),
    url,
    mainEntityOfPage: url,
    image: absoluteUrl(changelogOgImagePath(entry.slug)),
    keywords: entry.tags.join(", ") || undefined,
    author: publisher,
    publisher,
    inLanguage: "en",
  };
}

export function changelogBlogJsonLd(page: number) {
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: `${SITE_NAME} Changelog`,
    description: CHANGELOG_DESCRIPTION,
    url: absoluteUrl(changelogPageHref(page)),
    publisher,
    blogPost: getChangelogPage(page).map(blogPosting),
  };
}

export function changelogEntryJsonLd(entry: ChangelogEntry) {
  return {
    "@context": "https://schema.org",
    ...blogPosting(entry),
    isPartOf: {
      "@type": "Blog",
      name: `${SITE_NAME} Changelog`,
      url: absoluteUrl("/changelog"),
    },
  };
}
