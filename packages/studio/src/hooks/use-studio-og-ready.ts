"use client";

import type { ChartPhase } from "@bklitui/ui/charts";
import { useEffect, useState } from "react";
import { chartNeedsOgPhaseSignal } from "@/lib/studio-og-phase-charts";
import type { ChartSlug } from "@/lib/types";

/** Wait for fonts + paint settle after the chart reports ready (or immediately for non-cartesian). */
export function useStudioOgReady(
  chart: ChartSlug,
  chartPhase: ChartPhase | null
): boolean {
  const [ogReady, setOgReady] = useState(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: reset capture when chart or phase changes
  useEffect(() => {
    setOgReady(false);
  }, [chart, chartPhase]);

  useEffect(() => {
    const needsPhase = chartNeedsOgPhaseSignal(chart);
    if (needsPhase && chartPhase !== "ready") {
      return;
    }

    let cancelled = false;

    async function markReady() {
      if (chart === "live-line-chart") {
        await new Promise((resolve) => setTimeout(resolve, 150));
      }
      await document.fonts.ready;
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => resolve());
      });
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => resolve());
      });
      if (!cancelled) {
        setOgReady(true);
      }
    }

    markReady();

    return () => {
      cancelled = true;
    };
  }, [chart, chartPhase]);

  return ogReady;
}
