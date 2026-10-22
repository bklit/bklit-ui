"use client";

import type { ChartSlug } from "@/components/charts/chart-slugs";
import {
  HomeShowcaseChart,
  type HomeShowcaseId,
} from "@/components/home-components";
import { cn } from "@/lib/utils";
import { DesignShowcasePanel } from "./showcase-panel";

const showcaseRows: {
  id: HomeShowcaseId;
  chart: ChartSlug;
  span: 5 | 7;
  /** Mobile + desktop card sizing — edit these Tailwind classes to tune layout. */
  panelClassName?: string;
}[][] = [
  [
    {
      id: "line",
      chart: "area-chart",
      span: 7,
      panelClassName: "min-h-[260px] md:min-h-[340px]",
    },
    {
      id: "pie",
      chart: "pie-chart",
      span: 5,
      panelClassName: "min-h-[340px] md:min-h-[380px]",
    },
  ],
  [
    {
      id: "ring",
      chart: "ring-chart",
      span: 5,
      panelClassName: "min-h-[340px] md:min-h-[400px]",
    },
    {
      id: "bar",
      chart: "bar-chart",
      span: 7,
      panelClassName: "min-h-[260px] md:min-h-[360px]",
    },
  ],
  [
    {
      id: "choropleth",
      chart: "choropleth-chart",
      span: 7,
      panelClassName: "min-h-[380px] md:min-h-[380px]",
    },
    {
      id: "radar",
      chart: "radar-chart",
      span: 5,
      panelClassName: "min-h-[260px] md:min-h-[400px]",
    },
  ],
  [
    {
      id: "gauge",
      chart: "gauge-chart",
      span: 5,
      panelClassName: "min-h-[340px] md:min-h-[380px]",
    },
    {
      id: "heatmap",
      chart: "heatmap-chart",
      span: 7,
      panelClassName: "min-h-[380px] md:min-h-[400px]",
    },
  ],
];

/**
 * Showcase charts, two per row (7 + 5 columns). `rows` renders a slice
 * `[start, end)` so the homepage can split the grid around other sections.
 */
export function HomeShowcaseGrid({
  rows = [0, showcaseRows.length],
}: {
  rows?: readonly [start: number, end: number];
}) {
  return (
    <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-12 lg:gap-6">
      {showcaseRows
        .slice(rows[0], rows[1])
        .flat()
        .map(({ id, chart, span, panelClassName }) => (
          <DesignShowcasePanel
            chart={chart}
            className={cn(
              "col-span-full min-w-0",
              span === 7 ? "md:col-span-7" : "md:col-span-5",
              panelClassName
            )}
            key={id}
            mountKey={`showcase-${id}`}
          >
            <HomeShowcaseChart id={id} />
          </DesignShowcasePanel>
        ))}
    </div>
  );
}
