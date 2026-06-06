import {
  chartLabels,
  loadStudioStateFromRequest,
  studioSerializedParam,
} from "@bklitui/studio";
import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site-url";

export function studioPageSearchParams(
  params: Record<string, string | string[] | undefined>
): URL {
  const url = new URL(`${SITE_URL}/studio`);
  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        url.searchParams.append(key, item);
      }
    } else if (value != null) {
      url.searchParams.set(key, value);
    }
  }
  return url;
}

export function studioOgImagePath(
  params: Record<string, string | string[] | undefined>
): string {
  const state = loadStudioStateFromRequest(studioPageSearchParams(params));
  const serialized = studioSerializedParam(state);
  return `/api/og/studio?s=${encodeURIComponent(serialized)}`;
}

export function studioPageMetadata(
  params: Record<string, string | string[] | undefined>
): Metadata {
  const state = loadStudioStateFromRequest(studioPageSearchParams(params));
  const chartLabel = chartLabels[state.chart];
  const serialized = studioSerializedParam(state);
  const ogImagePath = `/api/og/studio?s=${encodeURIComponent(serialized)}`;
  const ogImage = new URL(ogImagePath, SITE_URL).href;
  const title = `${chartLabel} — Studio`;
  const description = `Explore and customize the ${chartLabel} in Bklit Studio.`;
  const pageUrl = `${SITE_URL}/studio?s=${encodeURIComponent(serialized)}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: pageUrl,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
          type: "image/png",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [{ url: ogImage, alt: title }],
    },
  };
}
