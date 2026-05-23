"use client";

import type { Margin } from "@bklitui/ui/charts";
import { useEffect, useState } from "react";

/** Half of chart example card padding (`px-4 sm:px-6` → 8px / 12px). */
export const CHART_EXAMPLE_MARGIN_PX = {
  mobile: 8,
  desktop: 12,
  bottom: 40,
} as const;

export const chartExampleMarginSnippet =
  "margin={{ top: 8, right: 8, bottom: 40, left: 8 }}";

const DESKTOP_MEDIA_QUERY = "(min-width: 640px)";

function getChartExampleMargin(inset: number): Margin {
  return {
    top: inset,
    right: inset,
    bottom: CHART_EXAMPLE_MARGIN_PX.bottom,
    left: inset,
  };
}

export function useChartExampleMargin(): Margin {
  const [margin, setMargin] = useState(() =>
    getChartExampleMargin(CHART_EXAMPLE_MARGIN_PX.desktop)
  );

  useEffect(() => {
    const query = window.matchMedia(DESKTOP_MEDIA_QUERY);

    const sync = () => {
      setMargin(
        getChartExampleMargin(
          query.matches
            ? CHART_EXAMPLE_MARGIN_PX.desktop
            : CHART_EXAMPLE_MARGIN_PX.mobile
        )
      );
    };

    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  return margin;
}
