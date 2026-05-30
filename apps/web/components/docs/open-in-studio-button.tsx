"use client";

import { studioChartHref } from "@bklitui/studio";
import Link from "next/link";
import type { ChartSlug } from "@/components/charts/chart-slugs";
import { Button } from "@/components/ui/button";
import { getAnalyticsUrl, trackEvent } from "@/lib/analytics/track-client";

export function OpenInStudioButton({ slug }: { slug: ChartSlug }) {
  const handleClick = () => {
    trackEvent("docs_open_studio", {
      chart: slug,
      url: getAnalyticsUrl(),
      studio_url: studioChartHref(slug),
    });
  };

  return (
    <Button
      className="h-8 gap-1 px-3 text-xs"
      nativeButton={false}
      render={<Link href={studioChartHref(slug)} onClick={handleClick} />}
      variant="outline"
    >
      Open in Studio
    </Button>
  );
}
