import {
  chartLabels,
  loadStudioStateFromRequest,
  studioSerializedParam,
} from "@bklitui/studio";
import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site-url";

export function studioEmbedPageSearchParams(
  params: Record<string, string | string[] | undefined>
): URL {
  const url = new URL(`${SITE_URL}/studio/embed`);
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

export function studioEmbedPageMetadata(
  params: Record<string, string | string[] | undefined>
): Metadata {
  const state = loadStudioStateFromRequest(studioEmbedPageSearchParams(params));
  const chartLabel = chartLabels[state.chart];
  const serialized = studioSerializedParam(state);
  const title = `${chartLabel} — Bklit Studio embed`;
  const description = `Interactive ${chartLabel} preview powered by Bklit Studio.`;
  const pageUrl = `${SITE_URL}/studio/embed?s=${encodeURIComponent(serialized)}`;

  return {
    title,
    description,
    robots: {
      index: false,
      follow: false,
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: pageUrl,
    },
  };
}
