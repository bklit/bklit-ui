"use client";

import type { ChartPhase } from "@bklitui/ui/charts";
import { StaticChartPreviewProvider } from "@bklitui/ui/charts";
import { useCallback, useMemo, useState } from "react";
import { STUDIO_EXPORT_ROOT_ATTR } from "@/components/studio-chart-frame";
import { StudioChartRender } from "@/components/studio-chart-render";
import { useStudioOgReady } from "@/hooks/use-studio-og-ready";
import { StudioPatternDefs, studioPatternFill } from "@/lib/patterns";
import { getStudioConfig } from "@/lib/registry";
import {
  STUDIO_OG_CAPTURE_ROOT_ATTR,
  STUDIO_OG_CHART_PERSPECTIVE_PX,
  STUDIO_OG_SURFACE_HEX,
  studioOgChartTransform,
} from "@/lib/studio-og-capture";
import { normalizeStudioStateForOg } from "@/lib/studio-og-state";
import type { StudioUrlState } from "@/lib/studio-parsers";
import {
  getDesignSeriesCount,
  getSeriesPattern,
  resolveChartThemeStyle,
} from "@/lib/studio-series-design";
import { loadStudioStateFromRequest } from "@/lib/studio-url-loader";

/** Max CSS px width for Puppeteer capture — higher = sharper chart in OG card */
const OG_PREVIEW_MAX_WIDTH = 1200;
/** Matches left panel in `apps/web/app/api/og/studio/route.tsx` (1200 − text − gap − right pad) */
const OG_CAPTURE_WIDTH = 772;
const OG_CAPTURE_HEIGHT = 630;

function parseStudioStateFromSearch(search: string): StudioUrlState {
  const url = new URL("https://studio.local/preview");
  const searchParams = new URLSearchParams(search);
  for (const [key, value] of searchParams.entries()) {
    url.searchParams.append(key, value);
  }
  return normalizeStudioStateForOg(loadStudioStateFromRequest(url));
}

export function StudioOgPreview({ search }: { search?: string }) {
  const state = useMemo(() => {
    const query =
      search ??
      (typeof window === "undefined" ? "" : window.location.search.slice(1));
    return parseStudioStateFromSearch(query);
  }, [search]);
  const [chartPhase, setChartPhase] = useState<ChartPhase | null>(null);
  const ogReady = useStudioOgReady(state.chart, chartPhase);
  const config = useMemo(() => getStudioConfig(state.chart), [state.chart]);

  const reportOgPhase = useCallback((phase: ChartPhase) => {
    setChartPhase(phase);
  }, []);

  const patternDefs = useMemo(() => {
    const seriesCount = getDesignSeriesCount(state.chart, state);
    const seriesPatterns = Array.from({ length: seriesCount }, (_, index) =>
      getSeriesPattern(state, index)
    );
    return <StudioPatternDefs seriesPatterns={seriesPatterns} />;
  }, [state]);

  const patternFillAt = useCallback(
    (seriesIndex: number) =>
      studioPatternFill(getSeriesPattern(state, seriesIndex), seriesIndex),
    [state]
  );

  const themeStyle = useMemo(() => resolveChartThemeStyle(state), [state]);

  const previewScale = Math.min(
    OG_PREVIEW_MAX_WIDTH / state.frameW,
    OG_CAPTURE_WIDTH / state.frameW,
    OG_CAPTURE_HEIGHT / state.frameH
  );
  const frameWidth = Math.round(state.frameW * previewScale);
  const frameHeight = Math.round(state.frameH * previewScale);

  return (
    <StaticChartPreviewProvider>
      <div
        className="flex min-h-dvh items-center justify-center"
        style={{ ...themeStyle, backgroundColor: STUDIO_OG_SURFACE_HEX }}
      >
        <div
          {...{ [STUDIO_OG_CAPTURE_ROOT_ATTR]: "" }}
          className="flex items-center justify-start overflow-hidden"
          style={{
            width: OG_CAPTURE_WIDTH,
            height: OG_CAPTURE_HEIGHT,
            padding: 0,
            perspective: STUDIO_OG_CHART_PERSPECTIVE_PX,
            backgroundColor: STUDIO_OG_SURFACE_HEX,
          }}
        >
          <div
            {...{ [STUDIO_EXPORT_ROOT_ATTR]: "" }}
            className="relative overflow-hidden rounded-lg"
            data-og-ready={ogReady ? "true" : undefined}
            style={{
              width: frameWidth,
              height: frameHeight,
              backgroundColor: STUDIO_OG_SURFACE_HEX,
              transform: studioOgChartTransform,
              transformStyle: "preserve-3d",
            }}
          >
            <div className="flex size-full min-h-0 min-w-0 items-center justify-center p-4">
              <StudioChartRender
                animationKey={0}
                committedState={state}
                config={config}
                dataSeed={0}
                displayState={state}
                frame={{ width: frameWidth - 32, height: frameHeight - 32 }}
                isRecording={false}
                motionCurveDragging={false}
                motionRemountKey="og"
                numberScrubbing={false}
                patternDefs={patternDefs}
                patternFillAt={patternFillAt}
                reportOgPhase={reportOgPhase}
              />
            </div>
          </div>
        </div>
      </div>
    </StaticChartPreviewProvider>
  );
}
