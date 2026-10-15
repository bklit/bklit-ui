import { getChartIllustration } from "@/components/illustrations/chart-illustrations";
import { IllustrationCard } from "@/components/illustrations/illustration-card";
import { source } from "@/lib/source";

/**
 * Illustrated index grid for a docs section. Defaults to chart components;
 * `section="utility"` lists chart utilities (legend, grid, tooltip, …).
 */
export function ComponentsList({
  section = "components",
}: {
  section?: "components" | "utility";
}) {
  // Get pages directly from source
  const pages = source
    .getPages()
    .filter((page) => page.slugs[0] === section && page.slugs.length > 1)
    .sort((a, b) => (a.data.title ?? "").localeCompare(b.data.title ?? ""));

  return (
    <div className="not-prose grid gap-6 pt-2 sm:grid-cols-2 xl:grid-cols-3">
      {pages.map((page) => (
        <IllustrationCard
          description={page.data.description}
          href={page.url}
          illustration={getChartIllustration(page.slugs.at(-1) ?? "")}
          key={page.url}
          title={page.data.title ?? ""}
        />
      ))}
    </div>
  );
}
