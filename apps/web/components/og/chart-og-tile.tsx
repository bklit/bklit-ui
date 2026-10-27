"use client";

import { StaticChartPreviewProvider } from "@bklitui/ui/charts";
import { MotionGlobalConfig } from "motion/react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import type { ChartExamplePreviewLayout } from "@/components/charts/chart-example-preview";
import { fetchWorldData } from "@/components/docs/use-world-data";
import { BklitLogo } from "@/components/icons/bklit";
import {
  type ContentFit,
  designWidth,
  type FitLimits,
  measureFit,
  nextFrame,
  stretchClassName,
} from "@/components/og/chart-og-fit";
import { CHART_OG_CARD_ATTR } from "@/lib/chart-og";
import { cn } from "@/lib/utils";

/**
 * Pieces shared by the OG cards (`chart-og-card.tsx`, `home-og-card.tsx`):
 * a fitted chart tile, the wordmark, world-data warmup and loop freezing.
 */

// Screenshot-only pages: Motion animations jump straight to their end state.
if (typeof window !== "undefined") {
  MotionGlobalConfig.skipAnimations = true;
}

/** Padding between a tile's panel edge and its chart. */
export const TILE_PADDING = 18;
/**
 * Compact charts (pie, radar, ring, gauge, sunburst) are scaled until their
 * painted marks, labels included, fill the box, so they get a wider margin to
 * keep axis labels clear of the tile edge.
 */
const TILE_COMPACT_PADDING = 40;
/** Stretched charts get wider gutters for labels past the plot (live value badge). */
const TILE_STRETCH_PADDING_X = 52;
/** Frame `p-1` + panel border on each side. */
export const TILE_CHROME = 10;
const TILE_FIT_LIMITS: FitLimits = { maxZoom: 1.25, maxCompactScale: 2.5 };

/**
 * A chart laid out (and zoomed / scaled) to fill its tile. Measures with
 * `getBoundingClientRect`, so it must sit on a flat (untransformed) plane
 * until `onReady` fires. Stretched layouts take their height from the
 * `--og-stretch-height` CSS variable.
 */
export function TileChart({
  layout,
  children,
  onReady,
}: {
  layout: ChartExamplePreviewLayout;
  children: ReactNode;
  onReady: () => void;
}) {
  const width = designWidth[layout];
  const padding = layout === "compact" ? TILE_COMPACT_PADDING : TILE_PADDING;
  const boxRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState<ContentFit>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await document.fonts.ready;
      await nextFrame();
      await nextFrame();
      const box = boxRef.current;
      const content = contentRef.current;
      if (width && box && content && !cancelled) {
        setFit(
          measureFit(box, content, layout, width, TILE_FIT_LIMITS, padding)
        );
        await nextFrame();
      }
      if (!cancelled) {
        onReady();
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [layout, width, padding, onReady]);

  return (
    <div
      className="absolute inset-0 flex items-center justify-center"
      ref={boxRef}
      style={{
        padding,
        paddingInline: width === null ? TILE_STRETCH_PADDING_X : undefined,
      }}
    >
      <div
        className={cn(
          "min-w-0 shrink-0 [&_svg]:overflow-visible",
          width === null && stretchClassName
        )}
        ref={contentRef}
        style={width === null ? undefined : { width, ...fit }}
      >
        <StaticChartPreviewProvider>{children}</StaticChartPreviewProvider>
      </div>
    </div>
  );
}

/**
 * `true` once the choropleth world data is cached (immediately when not
 * `needed`), so no map renders its "Loading map…" state. On failure it never
 * turns true, the card is never marked ready and the capture errors.
 */
export function useWorldDataReady(needed: boolean): boolean {
  const [ready, setReady] = useState(!needed);
  useEffect(() => {
    if (!needed) {
      return;
    }
    let cancelled = false;
    fetchWorldData().then((data) => {
      if (!cancelled && data) {
        setReady(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [needed]);
  return ready;
}

/**
 * Looping demos (live line data feeds on `setInterval`, rAF tickers) would
 * otherwise keep tiles changing, and the capture would wait out its
 * stable-frame cap. These pages exist only to be screenshotted, so every loop
 * stops once the frame is final.
 */
export function stopCardLoops() {
  window.requestAnimationFrame = () => 0;
  const lastTimer = window.setTimeout(() => undefined, 0);
  for (let id = 1; id <= lastTimer; id++) {
    window.clearInterval(id);
  }
  // SVG SMIL pulses (live line dot) are not Web Animations.
  for (const svg of document.querySelectorAll<SVGSVGElement>(
    `[${CHART_OG_CARD_ATTR}] svg`
  )) {
    svg.pauseAnimations();
    svg.setCurrentTime(0);
  }
}

/**
 * Bklit UI wordmark (the site header lockup), top-left over a soft fade so
 * tiles never show through it.
 */
export function OgWordmark({
  x,
  y,
  mark,
  text,
}: {
  x: number;
  y: number;
  mark: number;
  text: number;
}) {
  return (
    <>
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 34% 30% at 0% 0%, var(--color-sidebar) 45%, transparent 100%)",
        }}
      />
      <div
        aria-hidden
        className="absolute flex items-center gap-[0.25em] font-bold font-heading text-foreground leading-none tracking-tight"
        style={{ left: x, top: y, fontSize: text }}
      >
        <BklitLogo className="me-[0.1em]" size={mark} theme="dark" />
        <span>Bklit</span>
        <span className="text-muted-foreground/64">UI</span>
      </div>
    </>
  );
}
