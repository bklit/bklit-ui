"use client";

import { useSpring } from "motion/react";
import { useMemo, useRef } from "react";
import { useChart } from "./chart-context";
import {
  computeSegmentBounds,
  INACTIVE_SEGMENT,
} from "./highlight-segment-bounds";

// Shared hover-highlight for `line.tsx` and `area.tsx`: the bright stroke around
// the hovered point. This hook computes the highlight band (pure
// `computeSegmentBounds`, see `highlight-segment-bounds.ts`) and eases its
// x/width with springs; `<HighlightSegment>` renders the clipped re-stroke.

const SPRING_CONFIG = { stiffness: 180, damping: 28 };

export interface HighlightSegmentResult {
  /** Spring-eased left edge of the clip band (px). */
  xSpring: ReturnType<typeof useSpring>;
  /** Spring-eased width of the clip band (px). */
  widthSpring: ReturnType<typeof useSpring>;
  /** Whether a segment is currently highlighted (hover or selection). */
  isActive: boolean;
}

/**
 * Drives the hover-highlight clip band. The caller renders the band + clipped
 * re-stroke (see `<HighlightSegment>`); this hook computes the band from the
 * chart context and springs its x/width.
 *
 * @param enabled set false when there is no stroke to highlight (e.g. an area
 *   with `showLine={false}`); defaults true. When false the band stays inactive
 *   and the springs idle.
 */
export function useHighlightSegment({
  enabled = true,
}: {
  enabled?: boolean;
} = {}): HighlightSegmentResult {
  const { data, xScale, xAccessor, tooltipData, selection } = useChart();

  const bounds = useMemo(
    () =>
      enabled
        ? computeSegmentBounds(data, xScale, xAccessor, tooltipData, selection)
        : INACTIVE_SEGMENT,
    [enabled, data, xScale, xAccessor, tooltipData, selection]
  );

  const xSpring = useSpring(0, SPRING_CONFIG);
  const widthSpring = useSpring(0, SPRING_CONFIG);

  // Seed in place on the inactive→active transition (jump, not ease) so the band
  // appears at the hovered point rather than sliding in from x=0; ease on every
  // subsequent move.
  const wasActive = useRef(false);
  if (bounds.isActive && !wasActive.current) {
    xSpring.jump(bounds.x);
    widthSpring.jump(bounds.width);
  } else {
    xSpring.set(bounds.x);
    widthSpring.set(bounds.width);
  }
  wasActive.current = bounds.isActive;

  return { xSpring, widthSpring, isActive: bounds.isActive };
}
