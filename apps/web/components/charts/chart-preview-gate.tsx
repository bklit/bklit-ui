"use client";

import { createContext, type ReactNode, useCallback, useContext } from "react";
import {
  ChartExamplePreviewFrame,
  type ChartExamplePreviewLayout,
} from "@/components/charts/chart-example-preview";
import { useInViewOnce } from "@/lib/use-in-view-once";
import { usePauseWhenOffscreen } from "@/lib/use-pause-when-offscreen";

/** Mount just before the preview scrolls in so the entrance plays on screen. */
const CHART_PREVIEW_MOUNT_ROOT_MARGIN = "80px 0px";

const ChartPreviewOffscreenContext = createContext(false);

/**
 * True while a mounted gallery preview is scrolled out of view. Looping demos
 * (live data feeds, rAF tickers) should pause on it.
 */
export function useChartPreviewOffscreen() {
  return useContext(ChartPreviewOffscreenContext);
}

/**
 * Same-size stand-in rendered before the chart mounts. Uses the classes the
 * preview frame already targets (`.relative.w-full`, `.relative.aspect-square`)
 * so per-layout sizing and mobile aspect overrides apply to it too.
 */
function ChartPreviewPlaceholder({
  layout,
}: {
  layout: ChartExamplePreviewLayout;
}) {
  switch (layout) {
    case "compact":
    case "funnel":
      return <div aria-hidden className="relative aspect-square w-full" />;
    case "wide":
      return <div aria-hidden className="relative aspect-video w-full" />;
    case "heatmap":
      return <div aria-hidden className="relative h-40 w-full" />;
    default:
      return (
        <div
          aria-hidden
          className="relative w-full"
          style={{ aspectRatio: "2 / 1" }}
        />
      );
  }
}

/**
 * Chart gallery preview that only mounts its chart once it nears the viewport
 * (so entrance animations run when seen, not at page load), then stays mounted.
 */
export function ChartPreviewGate({
  layout = "cartesian",
  previewRole = "example",
  children,
}: {
  layout?: ChartExamplePreviewLayout;
  previewRole?: "hero" | "example";
  children: ReactNode;
}) {
  const { ref: inViewRef, inView } = useInViewOnce({
    rootMargin: CHART_PREVIEW_MOUNT_ROOT_MARGIN,
  });
  const { ref: offscreenRef, paused: offscreen } = usePauseWhenOffscreen();

  const setRefs = useCallback(
    (node: HTMLDivElement | null) => {
      inViewRef.current = node;
      offscreenRef.current = node;
    },
    [inViewRef, offscreenRef]
  );

  return (
    <ChartExamplePreviewFrame
      layout={layout}
      previewRole={previewRole}
      ref={setRefs}
    >
      {inView ? (
        <ChartPreviewOffscreenContext.Provider value={offscreen}>
          {children}
        </ChartPreviewOffscreenContext.Provider>
      ) : (
        <ChartPreviewPlaceholder layout={layout} />
      )}
    </ChartExamplePreviewFrame>
  );
}
