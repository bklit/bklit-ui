"use client";

import type { ReactNode } from "react";
import type { StudioUrlState } from "@/lib/studio-parsers";
import type { StudioAnalytics } from "@/providers/studio-analytics-context";
import { StudioAnalyticsProvider } from "@/providers/studio-analytics-context";
import { StudioNuqsAdapter } from "@/providers/studio-nuqs-adapter";
import { StudioThemeProvider } from "@/providers/studio-theme-provider";
import { ToastProvider } from "@/ui/toast";
import { StudioEditorLayout } from "./studio-editor-layout";
import { StudioStateProvider } from "./studio-state-provider";

export function StudioShell({
  analytics,
  renderCodeSheet,
  onThemeChange,
}: {
  analytics?: StudioAnalytics;
  renderCodeSheet?: (state: StudioUrlState) => ReactNode;
  onThemeChange?: (theme: "light" | "dark") => void;
}) {
  return (
    <StudioNuqsAdapter>
      <StudioAnalyticsProvider value={analytics ?? {}}>
        <StudioStateProvider>
          <StudioThemeProvider onThemeChange={onThemeChange}>
            <StudioEditorLayout renderCodeSheet={renderCodeSheet} />
            <ToastProvider position="top-center" />
          </StudioThemeProvider>
        </StudioStateProvider>
      </StudioAnalyticsProvider>
    </StudioNuqsAdapter>
  );
}
