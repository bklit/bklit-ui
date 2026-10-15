import { HomeShowcaseGrid } from "@/components/design/home-showcase-grid";
import { siteContainerClassName } from "@/components/design/site-chrome";
import { cn } from "@/lib/utils";

export function HomeShowcaseSection({
  rows,
  className,
}: {
  /** Row slice `[start, end)` of the showcase; defaults to every row. */
  rows?: readonly [start: number, end: number];
  className?: string;
}) {
  return (
    <section className={cn("relative w-full", className)}>
      <div className={cn(siteContainerClassName, "pt-8 md:pt-12")}>
        <HomeShowcaseGrid rows={rows} />
      </div>
    </section>
  );
}
