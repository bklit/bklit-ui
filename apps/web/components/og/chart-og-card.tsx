"use client";

import { StaticChartPreviewProvider } from "@bklitui/ui/charts";
import { MotionGlobalConfig } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ChartExamplePreviewLayout } from "@/components/charts/chart-example-preview";
import { getFeaturedChartExample } from "@/components/charts/chart-examples";
import { DotGridBackground } from "@/components/design/dot-grid-background";
import { fetchWorldData } from "@/components/docs/use-world-data";
import { Frame, FramePanel } from "@/components/ui/frame";
import {
  CHART_OG_CARD_ATTR,
  CHART_OG_READY_ATTR,
  CHART_OG_SIZE,
} from "@/lib/chart-og";
import { cn } from "@/lib/utils";

// This page only exists to be screenshotted: Motion animations jump straight
// to their end state so pie / funnel / radar entries are never caught midway.
if (typeof window !== "undefined") {
  MotionGlobalConfig.skipAnimations = true;
}

/** Card geometry (px), a 1200×630 crop of the homepage: rails, divider, panel. */
const RAIL_INSET = 40;
const HEADER_HEIGHT = 150;
const PANEL_INSET_X = 72;
const PANEL_TOP = HEADER_HEIGHT + 32;
const PANEL_BOTTOM = 32;

/**
 * CSS keyframe / transition reveals (clip-path wipes, fades) also settle on
 * their final frame. Interactive-only chrome is dropped: `data-og-hide`
 * controls (curve pickers) and live hint text ("Click a segment…"). Scoped to
 * the card so nothing else on the page changes.
 */
const freezeMotionCss = `[${CHART_OG_CARD_ATTR}] *, [${CHART_OG_CARD_ATTR}] *::before, [${CHART_OG_CARD_ATTR}] *::after {
  animation-delay: 0s !important;
  animation-duration: 0s !important;
  animation-iteration-count: 1 !important;
  transition-delay: 0s !important;
  transition-duration: 0s !important;
}
[${CHART_OG_CARD_ATTR}] [data-og-hide] { display: none !important; }
[${CHART_OG_CARD_ATTR}] [aria-live] { visibility: hidden !important; }`;

/**
 * How the featured example fills the panel's chart box, per gallery layout.
 * Responsive time-series charts stretch to the box. The rest are laid out at
 * their gallery width (`designWidth`), then CSS `zoom`ed (vector-sharp) until
 * they fill the box. Compact charts (pie, radar, ring, gauge, sunburst) draw
 * inside fixed-size squares with built-in whitespace, so they are instead
 * scaled until their painted SVG marks fill the box.
 */
const stretchClassName =
  "w-full [&_.relative.w-full]:!aspect-auto [&_.relative.w-full]:!h-[330px]";

const designWidth: Record<ChartExamplePreviewLayout, number | null> = {
  cartesian: null,
  "time-series": null,
  compact: 300,
  funnel: 640,
  wide: 760,
  heatmap: 860,
  inline: 600,
};

const MAX_ZOOM = 2.25;
const MAX_COMPACT_SCALE = 3;
const CHART_BOX_PADDING = 32;
/** Stretched charts get wider gutters for labels drawn past the plot (live value badge). */
const STRETCH_PADDING_X = 56;

const GRAPHIC_SELECTOR =
  "svg :is(path, circle, ellipse, rect, line, polyline, polygon, text)";

function isPainted(paint: string) {
  return (
    paint !== "none" &&
    paint !== "transparent" &&
    !paint.startsWith("rgba(0, 0, 0, 0)")
  );
}

/** Union of the visible SVG marks under `root`, in viewport px. */
function paintedGraphicsRect(root: HTMLElement) {
  let left = Number.POSITIVE_INFINITY;
  let top = Number.POSITIVE_INFINITY;
  let right = Number.NEGATIVE_INFINITY;
  let bottom = Number.NEGATIVE_INFINITY;
  for (const element of root.querySelectorAll(GRAPHIC_SELECTOR)) {
    if (element.closest("defs, clipPath, mask, pattern, marker")) {
      continue;
    }
    const style = getComputedStyle(element);
    if (
      style.visibility === "hidden" ||
      Number(style.opacity) === 0 ||
      !(isPainted(style.fill) || isPainted(style.stroke))
    ) {
      continue;
    }
    const rect = element.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) {
      continue;
    }
    left = Math.min(left, rect.left);
    top = Math.min(top, rect.top);
    right = Math.max(right, rect.right);
    bottom = Math.max(bottom, rect.bottom);
  }
  if (!(Number.isFinite(left) && right > left && bottom > top)) {
    return null;
  }
  return { left, top, width: right - left, height: bottom - top };
}

interface ContentFit {
  zoom?: number;
  transform?: string;
  transformOrigin?: string;
}

/** Zoom / scale that makes the laid-out example fill the chart box. */
function measureFit(
  box: HTMLElement,
  content: HTMLElement,
  layout: ChartExamplePreviewLayout,
  width: number
): ContentFit {
  const boxRect = box.getBoundingClientRect();
  const boxWidth = boxRect.width - CHART_BOX_PADDING * 2;
  const boxHeight = boxRect.height - CHART_BOX_PADDING * 2;

  const painted = layout === "compact" ? paintedGraphicsRect(content) : null;
  if (painted) {
    const scale = Math.min(
      boxWidth / painted.width,
      boxHeight / painted.height,
      MAX_COMPACT_SCALE
    );
    const contentRect = content.getBoundingClientRect();
    const centerX = painted.left + painted.width / 2;
    const centerY = painted.top + painted.height / 2;
    const shiftX = boxRect.left + boxRect.width / 2 - centerX;
    const shiftY = boxRect.top + boxRect.height / 2 - centerY;
    return {
      transform: `translate(${shiftX}px, ${shiftY}px) scale(${scale})`,
      transformOrigin: `${centerX - contentRect.left}px ${centerY - contentRect.top}px`,
    };
  }

  const height = content.offsetHeight;
  if (height <= 0) {
    return {};
  }
  return {
    zoom: Math.min(boxWidth / width, boxHeight / height, MAX_ZOOM),
  };
}

function nextFrame() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => resolve());
  });
}

const rivetClassName =
  "absolute size-2 rounded-[2px] border border-border bg-popover bg-clip-padding shadow-xs/5";

export function ChartOgCard({ slug, label }: { slug: string; label: string }) {
  const featured = useMemo(() => getFeaturedChartExample(slug), [slug]);
  const needsWorldData = slug === "choropleth-chart";
  const [dataReady, setDataReady] = useState(!needsWorldData);
  const [mounted, setMounted] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!needsWorldData) {
      return;
    }
    let cancelled = false;
    // Warm the shared cache before the map mounts so it never renders its
    // "Loading map…" state. On failure the card is never marked ready and the
    // capture route answers with an uncached error.
    fetchWorldData().then((data) => {
      if (!cancelled && data) {
        setDataReady(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [needsWorldData]);

  const showChart = mounted && dataReady && featured !== null;

  const layout = featured?.previewLayout ?? "cartesian";
  const width = designWidth[layout];
  const boxRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState<ContentFit>({});

  useEffect(() => {
    if (!showChart) {
      return;
    }
    let cancelled = false;
    (async () => {
      await document.fonts.ready;
      await nextFrame();
      await nextFrame();
      const box = boxRef.current;
      const content = contentRef.current;
      if (width && box && content && !cancelled) {
        setFit(measureFit(box, content, layout, width));
        await nextFrame();
        await nextFrame();
      }
      if (!cancelled) {
        setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [showChart, layout, width]);

  return (
    <div
      className="relative isolate overflow-hidden bg-sidebar text-foreground"
      {...{
        [CHART_OG_CARD_ATTR]: "",
        [CHART_OG_READY_ATTR]: ready ? "true" : "false",
      }}
      style={{ width: CHART_OG_SIZE.width, height: CHART_OG_SIZE.height }}
    >
      <style>{freezeMotionCss}</style>

      {/* Homepage dot grid, fading in from both edges. */}
      <div aria-hidden className="absolute inset-y-0 left-0 w-[320px]">
        <DotGridBackground className="[mask-image:linear-gradient(to_right,black_0%,transparent_100%)]" />
      </div>
      <div aria-hidden className="absolute inset-y-0 right-0 w-[320px]">
        <DotGridBackground className="[mask-image:linear-gradient(to_left,black_0%,transparent_100%)]" />
      </div>

      {/* Container rails + full-bleed divider with rivets (site-chrome). */}
      <div
        aria-hidden
        className="absolute inset-y-0 w-px bg-border/64"
        style={{ left: RAIL_INSET }}
      />
      <div
        aria-hidden
        className="absolute inset-y-0 w-px bg-border/64"
        style={{ right: RAIL_INSET }}
      />
      <div
        aria-hidden
        className="absolute inset-x-0 h-px bg-border/64"
        style={{ top: HEADER_HEIGHT }}
      />
      <div
        aria-hidden
        className={rivetClassName}
        style={{ left: RAIL_INSET - 3.5, top: HEADER_HEIGHT - 3.5 }}
      />
      <div
        aria-hidden
        className={rivetClassName}
        style={{ right: RAIL_INSET - 3.5, top: HEADER_HEIGHT - 3.5 }}
      />

      <h1
        className="absolute inset-x-0 top-0 m-0 flex items-center justify-center whitespace-nowrap font-bold font-heading text-[68px] leading-none tracking-tight"
        style={{ height: HEADER_HEIGHT }}
      >
        {label}
      </h1>

      <Frame
        className="absolute"
        style={{
          left: PANEL_INSET_X,
          right: PANEL_INSET_X,
          top: PANEL_TOP,
          bottom: PANEL_BOTTOM,
        }}
      >
        <FramePanel className="flex-1 overflow-hidden p-0">
          <div
            className="absolute inset-0 flex items-center justify-center"
            ref={boxRef}
            style={{
              padding: CHART_BOX_PADDING,
              paddingInline: width === null ? STRETCH_PADDING_X : undefined,
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
              {showChart ? (
                <StaticChartPreviewProvider>
                  {featured.render()}
                </StaticChartPreviewProvider>
              ) : null}
            </div>
          </div>
        </FramePanel>
      </Frame>
    </div>
  );
}
