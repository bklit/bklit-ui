"use client";

import { Icon, type IconName } from "@bklitui/icons";
import { cn } from "@bklitui/ui/lib/utils";
import type { ChartSlug } from "@/lib/types";

export const CHART_TYPE_ICONS: Record<ChartSlug, IconName> = {
  "area-chart": "IconTrending5",
  "bar-chart": "IconChart5",
  "line-chart": "IconTrending5",
  "profit-loss-line": "IconTradingViewLine",
  "scatter-chart": "IconPointChart",
  "composed-chart": "IconComboChartAxis",
  "pie-chart": "IconPieChart1",
  "ring-chart": "IconLoadingCircle",
  "gauge-chart": "IconGauge",
  "progress-bar": "IconProgress75",
  "heatmap-chart": "IconDotGrid3x3",
  "radar-chart": "IconFormPentagon",
  "funnel-chart": "IconDeepDive",
  "candlestick-chart": "IconTradingViewCandles",
  "live-line-chart": "IconTrending4",
  "choropleth-chart": "IconGlobe",
  "sankey-chart": "IconSankeyChart",
};

export function getChartTypeIcon(slug: ChartSlug): IconName {
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
          : "inline-flex size-8 shrink-0 items-center justify-center rounded-sm bg-muted/50 text-foreground",
        className
      )}
    >
      <Icon
        className={variant === "plain" ? "size-4" : "size-[18px]"}
        name={CHART_TYPE_ICONS[slug]}
      />
    </span>
  );
}
