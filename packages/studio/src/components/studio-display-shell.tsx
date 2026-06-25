"use client";

import type { ChartPhase } from "@bklitui/ui/charts";
import { useCallback, useEffect, useState } from "react";
import { StudioEditorLayout } from "@/components/studio-editor-layout";
import { useStudioOgReady } from "@/hooks/use-studio-og-ready";
import type { StudioUrlState } from "@/lib/studio-parsers";
import { cn } from "@/lib/utils";
import { StudioAnalyticsProvider } from "@/providers/studio-analytics-context";
import { StudioChartPhaseReporterProvider } from "@/providers/studio-chart-phase-reporter-context";
import { StudioThemeProvider } from "@/providers/studio-theme-provider";
import {
  StudioMemoryStateProvider,
  useStudioShellState,
} from "./studio-state-provider";

function StudioDisplayReadyBridge({
  onReadyChange,
}: {
  onReadyChange?: (ready: boolean) => void;
}) {
  const { state } = useStudioShellState();
  const [chartPhase, setChartPhase] = useState<ChartPhase | null>(null);
  const ready = useStudioOgReady(state.chart, chartPhase);

  const reportPhase = useCallback((phase: ChartPhase) => {
    setChartPhase(phase);
  }, []);

  useEffect(() => {
    onReadyChange?.(ready);
  }, [onReadyChange, ready]);

  return (
    <StudioChartPhaseReporterProvider onPhaseChange={reportPhase}>
      <StudioEditorLayout readOnly />
    </StudioChartPhaseReporterProvider>
  );
}

export function StudioDisplayShell({
  className,
  initialState,
  onReadyChange,
}: {
  className?: string;
  initialState?: Partial<StudioUrlState>;
  /** Fires when chart paint/fonts have settled (same signal as OG capture). */
  onReadyChange?: (ready: boolean) => void;
}) {
  return (
    <StudioAnalyticsProvider value={{}}>
      <StudioMemoryStateProvider embedded initialState={initialState}>
        <StudioThemeProvider embedded>
          <div
            className={cn(
              "pointer-events-none flex h-full min-h-0 w-full select-none flex-col overflow-hidden",
              className
            )}
          >
            <StudioDisplayReadyBridge onReadyChange={onReadyChange} />
          </div>
        </StudioThemeProvider>
      </StudioMemoryStateProvider>
    </StudioAnalyticsProvider>
  );
}
