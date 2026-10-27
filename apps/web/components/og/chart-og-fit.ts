import type { ChartExamplePreviewLayout } from "@/components/charts/chart-example-preview";
import { CHART_OG_CARD_ATTR } from "@/lib/chart-og";

/**
 * Helpers for the OG cards (`chart-og-card.tsx`, `home-og-card.tsx`): motion
 * freezing and the logic that fits a chart into a tile.
 */

/**
 * CSS keyframe / transition reveals (clip-path wipes, fades) also settle on
 * their final frame. Interactive-only chrome is dropped: `data-og-hide`
 * controls (curve pickers) and live hint text ("Click a segment…").
 * Scroll-driven animations (`.scroll-fade-x` edge fades on wide heatmaps)
 * never finish, so they move to the document timeline and end at once too.
 * Scoped to the card so nothing else on the page changes.
 */
export const freezeMotionCss = `[${CHART_OG_CARD_ATTR}] *, [${CHART_OG_CARD_ATTR}] *::before, [${CHART_OG_CARD_ATTR}] *::after {
  animation-delay: 0s !important;
  animation-duration: 0s !important;
  animation-iteration-count: 1 !important;
  transition-delay: 0s !important;
  transition-duration: 0s !important;
}
[${CHART_OG_CARD_ATTR}] [data-og-hide] { display: none !important; }
[${CHART_OG_CARD_ATTR}] [aria-live] { visibility: hidden !important; }
[${CHART_OG_CARD_ATTR}] * { animation-timeline: auto !important; }`;

/**
 * How an example fills its chart box, per gallery layout. Responsive
 * time-series charts stretch to the box (height from `--og-stretch-height`).
 * The rest are laid out at their gallery width (`designWidth`), then CSS
 * `zoom`ed (vector-sharp) until they fill the box. Compact charts (pie, radar,
 * ring, gauge, sunburst) draw inside fixed-size squares with built-in
 * whitespace, so they are instead scaled until their painted SVG marks fill
 * the box.
 */
export const stretchClassName =
  "w-full [&_.relative.w-full]:!aspect-auto [&_.relative.w-full]:!h-[var(--og-stretch-height)]";

export const designWidth: Record<ChartExamplePreviewLayout, number | null> = {
  cartesian: null,
  "time-series": null,
  compact: 300,
  funnel: 640,
  wide: 760,
  heatmap: 860,
  inline: 600,
};

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

export interface ContentFit {
  zoom?: number;
  transform?: string;
  transformOrigin?: string;
}

export interface FitLimits {
  maxZoom: number;
  maxCompactScale: number;
}

/**
 * Zoom / scale that makes the laid-out example fill the chart box. Measures
 * with `getBoundingClientRect`, so call it before any 3D transform applies.
 */
export function measureFit(
  box: HTMLElement,
  content: HTMLElement,
  layout: ChartExamplePreviewLayout,
  width: number,
  limits: FitLimits,
  padding: number
): ContentFit {
  const boxRect = box.getBoundingClientRect();
  const boxWidth = boxRect.width - padding * 2;
  const boxHeight = boxRect.height - padding * 2;

  const painted = layout === "compact" ? paintedGraphicsRect(content) : null;
  if (painted) {
    const scale = Math.min(
      boxWidth / painted.width,
      boxHeight / painted.height,
      limits.maxCompactScale
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
    zoom: Math.min(boxWidth / width, boxHeight / height, limits.maxZoom),
  };
}

export function nextFrame() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => resolve());
  });
}
