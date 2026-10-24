import { type ChartSlug, studioChartHref } from "@bklitui/studio";
import type { Metadata } from "next";
import { SITE_NAME as BASE_SITE_NAME } from "@/lib/site-name";
import { SITE_URL } from "@/lib/site-url";

export const SITE_NAME = BASE_SITE_NAME;

export const SITE_TITLE = "Bklit UI - Charts & Data Visualization Components";

export const SITE_DESCRIPTION =
  "Bklit UI is a component library built on top of shadcn/ui to help you build charts and data visualizations more easily.";

const STUDIO_PATH_RE = /^\/studio/;

export const GITHUB_URL = "https://github.com/bklit/bklit-ui";

/** Root `app/opengraph-image.png` (1200×630), served by the file convention. */
export const DEFAULT_OG_IMAGE = {
  url: "/opengraph-image.png",
  width: 1200,
  height: 630,
  alt: SITE_TITLE,
  type: "image/png",
} as const;

export interface OgImage {
  url: string;
  width?: number;
  height?: number;
  alt?: string;
  type?: string;
}

interface PageMetadataOptions {
  /** Page title; the root `%s | Bklit UI` template is applied to `<title>`. */
  title: string;
  description: string;
  /** Path (starting with `/`) used for the canonical and `og:url`. */
  path: string;
  /** Defaults to the site-wide Open Graph image. */
  images?: OgImage[];
  ogType?: "website" | "article";
  /** Mark the page `noindex, follow`. */
  noIndex?: boolean;
  /** Use `title` verbatim (skip the `%s | Bklit UI` template). */
  absoluteTitle?: boolean;
}

export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).href;
}

/**
 * Per-route metadata with canonical, Open Graph, and Twitter card fields.
 * Open Graph / Twitter objects are replaced (not merged) by Next.js when a
 * child segment sets them, so every field is filled explicitly here.
 */
export function pageMetadata({
  title,
  description,
  path,
  images,
  ogType = "website",
  noIndex = false,
  absoluteTitle = false,
}: PageMetadataOptions): Metadata {
  const socialTitle = absoluteTitle ? title : `${title} | ${SITE_NAME}`;
  const resolvedImages = (images ?? [DEFAULT_OG_IMAGE]).map((image) => ({
    ...image,
    alt: image.alt ?? socialTitle,
  }));

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: socialTitle,
      description,
      url: path,
      siteName: SITE_NAME,
      locale: "en_US",
      type: ogType,
      images: resolvedImages,
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: resolvedImages.map(({ url, alt }) => ({ url, alt })),
    },
    ...(noIndex ? { robots: { index: false, follow: true } } : {}),
  };
}

/**
 * Dynamic Studio OG image (chart screenshot + label) for a chart's default
 * Studio state — the same `/api/og/studio` route Studio share links use.
 */
export function chartOgImage(slug: ChartSlug, alt: string): OgImage {
  const studioHref = studioChartHref(slug);
  return {
    url: studioHref.replace(STUDIO_PATH_RE, "/api/og/studio"),
    width: 1200,
    height: 630,
    alt,
    type: "image/png",
  };
}

export interface BreadcrumbItem {
  name: string;
  path: string;
}

export function breadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
