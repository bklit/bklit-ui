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
      chart: "line-chart",
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
      chart: "sankey-chart",
      span: 5,
      panelClassName: "min-h-[340px] md:min-h-[400px]",
    },
    {
      id: "bar",
      chart: "funnel-chart",
      span: 7,
      panelClassName: "min-h-[260px] md:min-h-[360px]",
    },
  ],
  [
    {
      id: "choropleth",
      chart: "sankey-chart",
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
      chart: "bar-chart",
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

export function HomeShowcaseGrid() {
  return (
    <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-12 lg:gap-6">
      {showcaseRows.flat().map(({ id, chart, span, panelClassName }) => (
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
