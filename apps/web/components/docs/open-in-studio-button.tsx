"use client";

import Link from "next/link";
import type { ChartSlug } from "@/components/charts/chart-slugs";
import { Button } from "@/components/ui/button";
import { studioChartHref } from "@/lib/studio/chart-links";

export function OpenInStudioButton({ slug }: { slug: ChartSlug }) {
  return (
    <Button
      className="h-8 gap-1 px-3 text-xs"
      nativeButton={false}
      render={<Link href={studioChartHref(slug)} />}
      variant="outline"
    >
      Open in Studio
    </Button>
  );
}
