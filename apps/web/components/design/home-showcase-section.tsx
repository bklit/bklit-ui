import { studioChartDocsHref, studioChartHref } from "@bklitui/studio";
import {
  HomeShowcaseGrid,
  type HomeShowcaseLinks,
} from "@/components/design/home-showcase-grid";
import { showcaseRows } from "@/components/design/home-showcase-rows";
import { siteContainerClassName } from "@/components/design/site-chrome";
import { cn } from "@/lib/utils";

export function HomeShowcaseSection({
  rows = [0, showcaseRows.length],
  className,
}: {
  /** Row slice `[start, end)` of the showcase; defaults to every row. */
  rows?: readonly [start: number, end: number];
  className?: string;
}) {
  // Built here so the Studio URL codec (lz-string, nuqs parsers) stays on the
  // server instead of shipping with the homepage JS.
  const links: Record<string, HomeShowcaseLinks> = {};
  for (const { chart } of showcaseRows.slice(rows[0], rows[1]).flat()) {
    links[chart] = {
      docs: studioChartDocsHref(chart),
      studio: studioChartHref(chart),
    };
  }

  return (
    <section className={cn("relative w-full", className)}>
      <div className={cn(siteContainerClassName, "pt-8 md:pt-12")}>
        <HomeShowcaseGrid links={links} rows={rows} />
      </div>
    </section>
  );
}
