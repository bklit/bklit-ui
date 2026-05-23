import Link from "next/link";
import type { ChartSlug } from "@/components/charts/chart-slugs";
import { Button } from "@/components/ui/button";
import { studioChartHref } from "@/lib/studio/chart-links";

export function OpenInStudioButton({ slug }: { slug: ChartSlug }) {
  return (
    <Button asChild className="h-8 gap-1 px-3 text-xs" variant="outline">
      <Link href={studioChartHref(slug)}>Open in Studio</Link>
    </Button>
  );
}
