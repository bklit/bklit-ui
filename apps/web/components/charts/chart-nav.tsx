"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback } from "react";
import { HorizontalScrollArea } from "@/components/horizontal-scroll-area";
import { cn } from "@/lib/utils";

const chartTypes = [
  { label: "Area Chart", slug: "area-chart" },
  { label: "Bar Chart", slug: "bar-chart" },
  { label: "Candlestick Chart", slug: "candlestick-chart" },
  { label: "Choropleth Chart", slug: "choropleth-chart" },
  { label: "Composed Chart", slug: "composed-chart" },
  { label: "Funnel Chart", slug: "funnel-chart" },
  { label: "Gauge", slug: "gauge-chart" },
  { label: "Heatmap Chart", slug: "heatmap-chart" },
  { label: "Line Chart", slug: "line-chart" },
  { label: "Live Line Chart", slug: "live-line-chart" },
  { label: "Pie Chart", slug: "pie-chart" },
  { label: "Radar Chart", slug: "radar-chart" },
  { label: "Ring Chart", slug: "ring-chart" },
  { label: "Scatter Chart", slug: "scatter-chart" },
  { label: "Sankey Chart", slug: "sankey-chart" },
] as const;

export function ChartNav() {
  const pathname = usePathname();
  const scrollActiveIntoView = useCallback((node: HTMLAnchorElement | null) => {
    node?.scrollIntoView({
      behavior: "instant",
      block: "nearest",
      inline: "center",
    });
  }, []);

  return (
    <HorizontalScrollArea scrollClassName="snap-x snap-mandatory scroll-px-4">
      <nav className="flex w-max min-w-full gap-1">
        {chartTypes.map((chart) => {
          const href = `/charts/${chart.slug}`;
          const isActive = pathname === href;

          return (
            <Link
              className={cn(
                "shrink-0 snap-center rounded-md px-3 py-1.5 font-medium text-sm transition-colors",
                isActive
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
              href={href}
              key={chart.slug}
              ref={isActive ? scrollActiveIntoView : undefined}
            >
              {chart.label}
            </Link>
          );
        })}
      </nav>
    </HorizontalScrollArea>
  );
}
