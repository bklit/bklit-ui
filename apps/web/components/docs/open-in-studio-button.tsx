"use client";

import { studioChartHref } from "@bklitui/studio";
import Link from "next/link";
import type { ChartSlug } from "@/components/charts/chart-slugs";
import { Button } from "@/components/ui/button";
import { getAnalyticsUrl, trackEvent } from "@/lib/analytics/track-client";

export function OpenInStudioButton({
  slug,
  href,
}: {
  slug: ChartSlug;
  /** Overrides the default Studio URL for this chart slug. */
  href?: string;
}) {
  const studioUrl = href ?? studioChartHref(slug);

  const handleClick = () => {
    trackEvent("docs_open_studio", {
      chart: slug,
      url: getAnalyticsUrl(),
      studio_url: studioUrl,
    });
  };

  return (
    <Button
      className="h-8 gap-1 px-3 text-xs"
      nativeButton={false}
      render={<Link href={studioUrl} onClick={handleClick} />}
      variant="outline"
    >
      Open in Studio
    </Button>
  );
}
