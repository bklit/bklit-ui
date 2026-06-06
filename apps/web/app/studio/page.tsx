import {
  chartLabels,
  loadStudioStateFromRequest,
  studioSerializedParam,
} from "@bklitui/studio";
import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site-url";
import { StudioPageClient } from "./studio-page-client";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const params = await searchParams;
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

  const state = loadStudioStateFromRequest(url);
  const chartLabel = chartLabels[state.chart];
  const serialized = studioSerializedParam(state);
  const ogImage = `/api/og/studio?s=${encodeURIComponent(serialized)}`;
  const title = `${chartLabel} — Studio`;

  return {
    title,
    description: `Explore and customize the ${chartLabel} in Bklit Studio.`,
    openGraph: {
      title,
      description: `Explore and customize the ${chartLabel} in Bklit Studio.`,
      type: "website",
      url: `${SITE_URL}/studio?s=${encodeURIComponent(serialized)}`,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: `Explore and customize the ${chartLabel} in Bklit Studio.`,
      images: [ogImage],
    },
  };
}

export default function StudioPage() {
  return <StudioPageClient />;
}
