"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Default grace period (ms) before a tooltip hides after hover ends. Bridges
 * gaps between adjacent targets (heatmap cells, choropleth features) so the
 * panel springs to the next target instead of fading out and back in.
 */
export const TOOLTIP_HIDE_DELAY_MS = 120;

/**
 * Delays showing (`showDelay`) and hiding (`hideDelay`) hover tooltip data.
 * Once visible, changes to another target apply immediately.
 */
export function useDelayedTooltipData<T>(
  tooltipData: T | null,
  showDelay = 0,
  hideDelay = TOOLTIP_HIDE_DELAY_MS
): T | null {
  const [displayData, setDisplayData] = useState<T | null>(null);
  const isShowingRef = useRef(false);
  const showTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );

  useEffect(() => {
    if (showTimerRef.current) {
      clearTimeout(showTimerRef.current);
      showTimerRef.current = undefined;
    }
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = undefined;
    }

    if (tooltipData) {
      if (isShowingRef.current) {
        setDisplayData(tooltipData);
        return;
      }

      if (showDelay === 0) {
        isShowingRef.current = true;
        setDisplayData(tooltipData);
        return;
      }

      showTimerRef.current = setTimeout(() => {
        isShowingRef.current = true;
        setDisplayData(tooltipData);
      }, showDelay);
      return;
    }

    if (hideDelay === 0) {
      isShowingRef.current = false;
      setDisplayData(null);
      return;
    }

    hideTimerRef.current = setTimeout(() => {
      isShowingRef.current = false;
      setDisplayData(null);
    }, hideDelay);
  }, [tooltipData, showDelay, hideDelay]);

  useEffect(
    () => () => {
      if (showTimerRef.current) {
        clearTimeout(showTimerRef.current);
      }
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
    },
    []
  );

  return displayData;
}
