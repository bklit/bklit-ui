"use client";

import { cn } from "@bklitui/ui/lib/utils";
import {
  Activity01Icon,
  BarChartIcon,
  ChartAreaIcon,
  ChartBarLineIcon,
  ChartCandlestickIcon,
  ChartLineData01Icon,
  ChartRadarIcon,
  ChartRingIcon,
  ChartScatterIcon,
  DashboardSpeed01Icon,
  Flowchart02Icon,
  GlobeIcon,
  PieChartIcon,
  PyramidStructure01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import type { ChartSlug } from "@/lib/types";

export const CHART_TYPE_ICONS: Record<ChartSlug, IconSvgElement> = {
  "area-chart": ChartAreaIcon,
  "bar-chart": BarChartIcon,
  "line-chart": ChartLineData01Icon,
  "profit-loss-line": ChartBarLineIcon,
  "scatter-chart": ChartScatterIcon,
  "composed-chart": ChartBarLineIcon,
  "pie-chart": PieChartIcon,
  "ring-chart": ChartRingIcon,
  "gauge-chart": DashboardSpeed01Icon,
  "radar-chart": ChartRadarIcon,
  "funnel-chart": PyramidStructure01Icon,
  "candlestick-chart": ChartCandlestickIcon,
  "live-line-chart": Activity01Icon,
  "choropleth-chart": GlobeIcon,
  "sankey-chart": Flowchart02Icon,
};

export function getChartTypeIcon(slug: ChartSlug): IconSvgElement {
  return CHART_TYPE_ICONS[slug];
}

export function ChartTypeIcon({
  slug,
  className,
  variant = "default",
}: {
  slug: ChartSlug;
  className?: string;
  variant?: "default" | "plain";
}) {
  return (
    <span
      className={cn(
        variant === "plain"
          ? "inline-flex size-5 shrink-0 items-center justify-center text-foreground"
          : "inline-flex size-8 shrink-0 items-center justify-center rounded-md bg-muted/50 text-foreground",
        className
      )}
    >
      <HugeiconsIcon
        className={variant === "plain" ? "size-4" : "size-[18px]"}
        icon={CHART_TYPE_ICONS[slug]}
        strokeWidth={1.75}
      />
    </span>
  );
}
