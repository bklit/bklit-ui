import type { ChartSlug } from "@/components/charts/chart-slugs";
import type { HomeShowcaseId } from "@/components/home-components";

/**
 * Homepage showcase layout, shared by the server section (which builds the
 * card links) and the client grid. Kept out of the `"use client"` grid module
 * so server components can read it.
 */
export interface HomeShowcaseItem {
  id: HomeShowcaseId;
  chart: ChartSlug;
  span: 5 | 7;
  /** Mobile + desktop card sizing — edit these Tailwind classes to tune layout. */
  panelClassName?: string;
}

export const showcaseRows: HomeShowcaseItem[][] = [
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
