"use client";

import type { ChartSlug } from "@/components/charts/chart-slugs";
import {
  HomeShowcaseChart,
  type HomeShowcaseId,
} from "@/components/home-components";
import { cn } from "@/lib/utils";
import { GridCornerDots } from "./line-grid";
import { DesignShowcasePanel } from "./showcase-panel";

const showcaseColumns = 2;

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
    <div className="relative flex w-full flex-col overflow-visible border-border border-t border-l">
      {showcaseRows.map((row) => (
        <div
          className="relative w-full overflow-visible"
          key={row.map((entry) => entry.id).join("-")}
        >
          <div className="grid w-full grid-cols-1 overflow-visible md:grid-cols-12">
            {row.map(({ id, chart, span, panelClassName }) => (
              <DesignShowcasePanel
                chart={chart}
                className={cn(
                  "col-span-full min-w-0",
                  span === 7 ? "md:col-span-7" : "md:col-span-5",
                  panelClassName
                )}
                key={id}
              >
                <HomeShowcaseChart id={id} />
              </DesignShowcasePanel>
            ))}
          </div>
          <GridCornerDots
            className="z-3 hidden md:block"
            columns={showcaseColumns}
            columnWeights={row.map((entry) => entry.span)}
            rows={1}
          />
        </div>
      ))}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        data-grid-rulers
      >
        <div className="absolute -top-8 left-0 block h-10 w-px bg-muted-foreground/40" />
        <div className="absolute top-0 -left-8 block h-px w-10 bg-muted-foreground/40" />
        <div className="absolute -top-8 right-0 block h-10 w-px bg-muted-foreground/40" />
        <div className="absolute top-0 -right-8 block h-px w-10 bg-muted-foreground/40" />

        <div className="absolute -bottom-8 left-0 block h-10 w-px bg-muted-foreground/40" />
        <div className="absolute bottom-0 -left-8 block h-px w-10 bg-muted-foreground/40" />
        <div className="absolute right-0 -bottom-8 block h-10 w-px bg-muted-foreground/40" />
        <div className="absolute -right-8 bottom-0 block h-px w-10 bg-muted-foreground/40" />

        <div className="absolute -top-8 -right-8 block h-6 w-6 bg-[repeating-linear-gradient(45deg,color-mix(in_oklch,var(--muted-foreground)_40%,transparent)_0,color-mix(in_oklch,var(--muted-foreground)_40%,transparent)_1px,transparent_0,transparent_50%)] bg-size-[5px_5px] bg-fixed opacity-80" />
        <div className="absolute -bottom-8 -left-8 block h-6 w-6 bg-[repeating-linear-gradient(45deg,color-mix(in_oklch,var(--muted-foreground)_40%,transparent)_0,color-mix(in_oklch,var(--muted-foreground)_40%,transparent)_1px,transparent_0,transparent_50%)] bg-size-[5px_5px] bg-fixed opacity-80" />
      </div>
    </div>
  );
}
