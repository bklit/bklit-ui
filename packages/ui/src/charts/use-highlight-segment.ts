"use client";

import { useSpring } from "motion/react";
import { useLayoutEffect, useMemo, useRef } from "react";
import { useChartConfig } from "./chart-config-context";
import { useChartHover, useChartStable } from "./chart-context";
import {
  computeSegmentBounds,
  INACTIVE_SEGMENT,
} from "./highlight-segment-bounds";

// Hover-highlight band for `line.tsx` and `area.tsx`. Computes the segment
// bounds and springs its x/width; `<HighlightSegment>` renders the clipped
// re-stroke. Spring tuning comes from `ChartConfigProvider.highlightSpring`.
// Stable + hover slices are read separately so callers can see the exact
// subscription surface (anything calling this hook will re-render on hover).

export interface HighlightSegmentResult {
  xSpring: ReturnType<typeof useSpring>;
  widthSpring: ReturnType<typeof useSpring>;
  isActive: boolean;
}

/**
 * @param enabled set false when there is no stroke to highlight (e.g. an area
 *   with `showLine={false}`); defaults true.
 * @param span data points either side of the hovered point the band covers;
 *   defaults 1.
 */
export function useHighlightSegment({
  enabled = true,
  span = 1,
}: {
  enabled?: boolean;
  span?: number;
} = {}): HighlightSegmentResult {
  const { data, xScale, xAccessor } = useChartStable();
  const { tooltipData, selection } = useChartHover();
  const { highlightSpring } = useChartConfig();

  const bounds = useMemo(
    () =>
      enabled
        ? computeSegmentBounds(
            data,
            xScale,
            xAccessor,
            tooltipData,
            selection,
            span
          )
        : INACTIVE_SEGMENT,
    [enabled, data, xScale, xAccessor, tooltipData, selection, span]
  );

  const xSpring = useSpring(0, highlightSpring);
  const widthSpring = useSpring(0, highlightSpring);

  // Jump on inactive→active so the band appears at the hovered point instead
  // of sliding in from a stale position; ease on subsequent moves. Driven from
  // a layout effect (not render) so springs update before paint without
  // mutating MotionValues / refs during render.
  //
  // Interruptible on fast leave / re-enter: a spring `set()` defers its
  // animation start to the end of the frame and aims it at the last `set()`
  // target, which `jump()` neither cancels nor updates. So (1) don't drive the
  // springs while inactive — the band is hidden, and parking it at 0 left a
  // pending glide that re-targeted the next hover — and (2) follow each jump
  // with a `set()` to the same value so any pending start springs to the new
  // point (a no-op animation) instead of the old one.
  const wasActive = useRef(false);
  useLayoutEffect(() => {
    if (!bounds.isActive) {
      wasActive.current = false;
      return;
    }
    if (!wasActive.current) {
      xSpring.jump(bounds.x);
      widthSpring.jump(bounds.width);
    }
    xSpring.set(bounds.x);
    widthSpring.set(bounds.width);
    wasActive.current = true;
  }, [bounds, xSpring, widthSpring]);

  return { xSpring, widthSpring, isActive: bounds.isActive };
}
