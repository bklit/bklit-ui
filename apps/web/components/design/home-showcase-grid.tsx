"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import type { ChartSlug } from "@/components/charts/chart-slugs";
import { ChartMountPlaceholder } from "@/components/design/chart-mount-placeholder";
import { showcaseRows } from "@/components/design/home-showcase-rows";
import { cn } from "@/lib/utils";
import { DesignShowcasePanel } from "./showcase-panel";

const loadAreaChart = () => import("@/components/home-area-chart");

/**
 * The showcase charts load as their own chunks instead of with the page's
 * JS. Panels only render a chart once it scrolls into view, so this keeps
 * every chart type (d3-geo for the map, heatmap, gauge…) out of the code the
 * page parses and hydrates on load. The first card (area chart) has its own
 * smaller chunk, fetched as soon as the grid hydrates so it is ready when the
 * card mounts.
 */
const HomeShowcaseAreaChart = dynamic(
  () => loadAreaChart().then((mod) => mod.HomeShowcaseAreaChart),
  { loading: () => <ChartMountPlaceholder />, ssr: false }
);

const HomeShowcaseChart = dynamic(
  () =>
    import("@/components/home-components").then((mod) => mod.HomeShowcaseChart),
  { loading: () => <ChartMountPlaceholder />, ssr: false }
);

export interface HomeShowcaseLinks {
  docs: string;
  studio: string;
}

/**
 * Showcase charts, two per row (7 + 5 columns). `rows` renders a slice
 * `[start, end)` so the homepage can split the grid around other sections.
 * `links` (built on the server) holds each chart's Docs / Studio hrefs.
 */
export function HomeShowcaseGrid({
  links,
  rows = [0, showcaseRows.length],
}: {
  links: Partial<Record<ChartSlug, HomeShowcaseLinks>>;
  rows?: readonly [start: number, end: number];
}) {
  const includesFirstRow = rows[0] === 0;

  useEffect(() => {
    if (includesFirstRow) {
      loadAreaChart();
    }
  }, [includesFirstRow]);

  return (
    <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-12 lg:gap-6">
      {showcaseRows
        .slice(rows[0], rows[1])
        .flat()
        .map(({ id, chart, span, panelClassName }) => (
          <DesignShowcasePanel
            className={cn(
              "col-span-full min-w-0",
              span === 7 ? "md:col-span-7" : "md:col-span-5",
              panelClassName
            )}
            docsHref={links[chart]?.docs ?? `/docs/components/${chart}`}
            key={id}
            mountKey={`showcase-${id}`}
            studioHref={links[chart]?.studio ?? "/studio"}
          >
            {id === "line" ? (
              <HomeShowcaseAreaChart />
            ) : (
              <HomeShowcaseChart id={id} />
            )}
          </DesignShowcasePanel>
        ))}
    </div>
  );
}
