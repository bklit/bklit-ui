"use client";

import { StaticChartPreviewProvider } from "@bklitui/ui/charts";
import { useCallback, useMemo } from "react";
import { validChartSlugs } from "@/chart-slugs";
import { StudioChartRender } from "@/components/studio-chart-render";
import { StudioChartViewport } from "@/components/studio-chart-viewport";
import { HEATMAP_WEEKS_FOUR_MONTHS } from "@/lib/demo-data";
import { heatmapChartDefaults } from "@/lib/heatmap-chart-defaults";
import {
  candlestickChartDefaults,
  lineChartProfitLossDefaults,
  lineChartStandardDefaults,
} from "@/lib/line-chart-mode";
import { StudioPatternDefs, studioPatternFill } from "@/lib/patterns";
import { getStudioConfig } from "@/lib/registry";
import { chartDefaultHiddenComponents } from "@/lib/studio-component-visibility";
import { defaultStudioState, type StudioUrlState } from "@/lib/studio-parsers";
import {
  getDesignSeriesCount,
  getSeriesPattern,
  resolveChartThemeStyle,
} from "@/lib/studio-series-design";
import type { ChartSlug } from "@/lib/types";
import { chartLabels } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";

const STUDIO_Y_AXIS_CHART_PREFIX: Partial<Record<ChartSlug, string>> = {
  "line-chart": "line",
  "area-chart": "area",
  "scatter-chart": "scatter",
  "composed-chart": "composed",
  "bar-chart": "bar",
  "candlestick-chart": "candlestick",
  "live-line-chart": "live-line",
};

const CATALOG_CHART_WIDTH = 360;
const CATALOG_CHART_HEIGHT = 210;

/** Per-chart tile sizing for masonry — taller cells where the chart needs room. */
const CATALOG_CHART_LAYOUT: Partial<
  Record<
    ChartSlug,
    {
      tileHeight?: number;
      frameH?: number;
      overrides?: Partial<StudioUrlState>;
    }
  >
> = {
  "sankey-chart": {
    tileHeight: 320,
    frameH: 320,
    overrides: { sankeyNodePadding: 8 },
  },
  "radar-chart": {
    tileHeight: 340,
    frameH: 340,
    overrides: { radarMargin: 28, radarSize: 100 },
  },
  "choropleth-chart": { tileHeight: 280, frameH: 280 },
  "funnel-chart": { tileHeight: 320, frameH: 320 },
  "gauge-chart": { tileHeight: 280, frameH: 280 },
  "heatmap-chart": {
    tileHeight: 300,
    frameH: 300,
    overrides: { heatmapBinSize: HEATMAP_WEEKS_FOUR_MONTHS },
  },
  "pie-chart": { tileHeight: 280, frameH: 280 },
  "ring-chart": { tileHeight: 280, frameH: 280 },
  "scatter-chart": {
    overrides: { scatterRadius: 2.5, scatterRingWidth: 1, scatterRingGap: 1 },
  },
};

function catalogLayoutForChart(slug: ChartSlug) {
  return CATALOG_CHART_LAYOUT[slug];
}

function catalogStateForChart(slug: ChartSlug): StudioUrlState {
  const chart = slug === "profit-loss-line" ? "line-chart" : slug;
  const layout = catalogLayoutForChart(slug);
  const frameH = layout?.frameH ?? CATALOG_CHART_HEIGHT;

  return defaultStudioState({
    chart,
    frameW: CATALOG_CHART_WIDTH,
    frameH,
    ...(slug === "live-line-chart" ? { curve: "monotoneX" } : {}),
    ...(slug === "profit-loss-line"
      ? { ...lineChartProfitLossDefaults, curve: "natural" }
      : {}),
    ...(slug === "line-chart" ? lineChartStandardDefaults : {}),
    ...(slug === "candlestick-chart" ? candlestickChartDefaults : {}),
    ...(slug === "heatmap-chart" ? heatmapChartDefaults : {}),
    ...(slug === "area-chart" || slug === "composed-chart"
      ? { dataSeries: 2 }
      : {}),
    ...(layout?.overrides ?? {}),
    ...(() => {
      const prefix = STUDIO_Y_AXIS_CHART_PREFIX[slug];
      return prefix && slug !== "line-chart"
        ? {
            hiddenComponents: chartDefaultHiddenComponents(prefix, {
              showLegend: false,
              showBrush: false,
            }),
          }
        : {};
    })(),
  });
}

function CatalogChartPreview({ slug }: { slug: ChartSlug }) {
  const state = useMemo(() => catalogStateForChart(slug), [slug]);
  const config = useMemo(() => getStudioConfig(slug), [slug]);
  const themeStyle = useMemo(() => resolveChartThemeStyle(state), [state]);

  const patternDefs = useMemo(() => {
    const seriesCount = getDesignSeriesCount(state.chart, state);
    const seriesPatterns = Array.from({ length: seriesCount }, (_, index) =>
      getSeriesPattern(state, index)
    );
    return <StudioPatternDefs seriesPatterns={seriesPatterns} />;
  }, [state]);

  const patternFillAt = useCallback(
    (seriesIndex: number) =>
      studioPatternFill(getSeriesPattern(state, seriesIndex), seriesIndex),
    [state]
  );

  return (
    <StaticChartPreviewProvider>
      <div
        className="relative size-full min-h-0 overflow-hidden rounded-md border border-border/60 bg-card"
        style={themeStyle}
      >
        <StudioChartViewport>
          {(frame) => (
            <StudioChartRender
              animationKey={0}
              committedState={state}
              config={config}
              dataSeed={0}
              displayState={state}
              frame={frame}
              isRecording={false}
              motionCurveDragging={false}
              motionRemountKey={`catalog-${slug}`}
              numberScrubbing={false}
              patternDefs={patternDefs}
              patternFillAt={patternFillAt}
            />
          )}
        </StudioChartViewport>
      </div>
    </StaticChartPreviewProvider>
  );
}

function CatalogChartTile({ slug }: { slug: ChartSlug }) {
  const tileHeight =
    catalogLayoutForChart(slug)?.tileHeight ?? CATALOG_CHART_HEIGHT;

  return (
    <Card className="mb-5 inline-block w-full break-inside-avoid" size="sm">
      <CardHeader>
        <CardTitle className="text-sm">{chartLabels[slug]}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full min-w-0" style={{ height: tileHeight }}>
          <CatalogChartPreview slug={slug} />
        </div>
      </CardContent>
    </Card>
  );
}

export function CatalogChartPreviewGrid({ className }: { className?: string }) {
  return (
    <div className={cn("w-full columns-[360px] gap-5", className)}>
      {validChartSlugs.map((slug) => (
        <CatalogChartTile key={slug} slug={slug} />
      ))}
    </div>
  );
}
