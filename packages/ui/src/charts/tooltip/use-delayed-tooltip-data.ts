"use client";

import { useEffect, useState } from "react";

/**
 * Default grace period (ms) before a tooltip hides after hover ends. Bridges
 * gaps between adjacent targets (heatmap cells, choropleth features) so the
 * panel springs to the next target instead of fading out and back in.
 */
export const TOOLTIP_HIDE_DELAY_MS = 120;

/**
 * Delays showing (`showDelay`) and hiding (`hideDelay`) hover tooltip data.
 * Once visible, changes to another target apply immediately.
 *
 * Immediate updates are applied during render ("adjust state when props
 * change") and delayed ones from timers, so no state is set synchronously in
 * an effect (React Compiler `react-hooks/set-state-in-effect`).
 */
export function useDelayedTooltipData<T>(
  tooltipData: T | null,
  showDelay = 0,
  hideDelay = TOOLTIP_HIDE_DELAY_MS
): T | null {
  const [displayData, setDisplayData] = useState<T | null>(null);
  const [prevTooltipData, setPrevTooltipData] = useState<T | null>(null);

  // The tooltip counts as showing while it has data on screen (including
  // while a hide is pending).
  const isShowing = displayData !== null;

  if (prevTooltipData !== tooltipData) {
    setPrevTooltipData(tooltipData);
    if (tooltipData) {
      if (isShowing || showDelay === 0) {
        setDisplayData(tooltipData);
      }
    } else if (hideDelay === 0) {
      setDisplayData(null);
    }
  }

  useEffect(() => {
    if (tooltipData) {
      if (displayData === tooltipData) {
        return;
      }
      const showTimer = setTimeout(() => {
        setDisplayData(tooltipData);
      }, showDelay);
      return () => clearTimeout(showTimer);
    }

    if (displayData === null) {
      return;
    }
    const hideTimer = setTimeout(() => {
      setDisplayData(null);
    }, hideDelay);
    return () => clearTimeout(hideTimer);
  }, [tooltipData, displayData, showDelay, hideDelay]);

  return displayData;
}
