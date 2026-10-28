"use client";

import {
  type CSSProperties,
  type ReactNode,
  useCallback,
  useRef,
  useState,
} from "react";
import { getChartPageExamples } from "@/components/charts/chart-examples";
import { SidebarChartPreviewLoader } from "@/components/docs/sidebar-chart-preview-loader";
import { freezeMotionCss } from "@/components/og/chart-og-fit";
import {
  TILE_CHROME,
  TILE_PADDING,
  TileChart,
  useWorldDataReady,
} from "@/components/og/chart-og-tile";
import { CHART_OG_CARD_ATTR } from "@/lib/chart-og";
import { cn } from "@/lib/utils";

/**
 * Lazy chunk for the docs sidebar preview card: the chart page's featured
 * example, laid out like a chart OG tile (420×265) and scaled down to the card.
 * Motion is frozen (`freezeMotionCss`) so it reads as a static snapshot.
 */
const TILE = { width: 420, height: 265 };
const BOX = {
  width: TILE.width - TILE_CHROME,
  height: TILE.height - TILE_CHROME,
};
const STRETCH_HEIGHT = BOX.height - TILE_PADDING * 2;

/**
 * Chart page example to preview, when not the featured one (index 0). The line
 * chart hero stacks a legend, chart and brush strip, which is unreadable at
 * card size, so it previews its first plain example instead.
 */
const previewExampleIndex: Record<string, number> = { "line-chart": 1 };

export default function SidebarChartPreviewChart({
  slug,
  width,
  fallback,
}: {
  slug: string;
  /** Rendered width in px; height follows the tile aspect. */
  width: number;
  /** Shown when the chart has no featured example. */
  fallback: ReactNode;
}) {
  const example = getChartPageExamples(slug)[previewExampleIndex[slug] ?? 0];
  const worldReady = useWorldDataReady(slug === "choropleth-chart");
  const [ready, setReady] = useState(false);
  const [contain, setContain] = useState(1);
  const contentRef = useRef<HTMLDivElement>(null);
  // Composite examples (a chart plus legends or strips) don't stretch to the
  // tile like a bare chart, so they can overflow it. Once the
  // tile settles (still unscaled), shrink the content around its centre until
  // it fits inside the padded box.
  const handleReady = useCallback(() => {
    const content = contentRef.current;
    // Compact charts are already scaled to their painted marks by TileChart.
    if (content && example?.previewLayout !== "compact") {
      const { width: contentWidth, height: contentHeight } =
        content.getBoundingClientRect();
      setContain(
        Math.min(
          1,
          (BOX.width - TILE_PADDING * 2) / contentWidth,
          (BOX.height - TILE_PADDING * 2) / contentHeight
        )
      );
    }
    setReady(true);
  }, [example?.previewLayout]);
  const scale = width / BOX.width;

  if (!example) {
    return fallback;
  }

  return (
    <div
      className="relative overflow-hidden"
      style={{ width, height: BOX.height * scale }}
    >
      <SidebarChartPreviewLoader
        className={cn(
          "absolute inset-0 transition-opacity duration-150 ease-out",
          ready && "opacity-0"
        )}
      />
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute top-0 left-0 origin-top-left transition-opacity duration-200 ease-out",
          ready && "delay-150",
          ready ? "opacity-100" : "opacity-0"
        )}
        style={
          {
            width: BOX.width,
            height: BOX.height,
            // Fit is measured unscaled; scale only once the tile has settled.
            transform: ready ? `scale(${scale})` : undefined,
            "--og-stretch-height": `${STRETCH_HEIGHT}px`,
          } as CSSProperties
        }
        {...{ [CHART_OG_CARD_ATTR]: "" }}
      >
        <style>{freezeMotionCss}</style>
        {worldReady ? (
          <TileChart layout={example.previewLayout} onReady={handleReady}>
            <div
              className="origin-center"
              ref={contentRef}
              style={
                contain < 1 ? { transform: `scale(${contain})` } : undefined
              }
            >
              {example.render()}
            </div>
          </TileChart>
        ) : null}
      </div>
    </div>
  );
}
