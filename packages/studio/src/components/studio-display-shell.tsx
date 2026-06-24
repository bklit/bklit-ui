"use client";

import type { StudioUrlState } from "@/lib/studio-parsers";
import { cn } from "@/lib/utils";
import { StudioAnalyticsProvider } from "@/providers/studio-analytics-context";
import { StudioThemeProvider } from "@/providers/studio-theme-provider";
import { StudioEditorLayout } from "./studio-editor-layout";
import { StudioMemoryStateProvider } from "./studio-state-provider";

export function StudioDisplayShell({
  className,
  initialState,
}: {
  className?: string;
  initialState?: Partial<StudioUrlState>;
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
            <StudioEditorLayout readOnly />
          </div>
        </StudioThemeProvider>
      </StudioMemoryStateProvider>
    </StudioAnalyticsProvider>
  );
}
