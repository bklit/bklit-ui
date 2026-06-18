"use client";

import type { ReactNode } from "react";
import type { StudioUrlState } from "@/lib/studio-parsers";
import type { StudioAnalytics } from "@/providers/studio-analytics-context";
import { StudioAnalyticsProvider } from "@/providers/studio-analytics-context";
import { StudioNuqsAdapter } from "@/providers/studio-nuqs-adapter";
import { StudioThemeProvider } from "@/providers/studio-theme-provider";
import { Toaster } from "@/ui/sonner";
import { StudioEditorLayout } from "./studio-editor-layout";
import { StudioOnboardingDialog } from "./studio-onboarding-dialog";
import { StudioStateProvider } from "./studio-state-provider";

export function StudioShell({
  analytics,
  renderCodeSheet,
}: {
  analytics?: StudioAnalytics;
  renderCodeSheet?: (state: StudioUrlState) => ReactNode;
}) {
  return (
    <StudioNuqsAdapter>
      <StudioAnalyticsProvider value={analytics ?? {}}>
        <StudioStateProvider>
          <StudioThemeProvider>
            <StudioOnboardingDialog />
            <StudioEditorLayout renderCodeSheet={renderCodeSheet} />
            <Toaster position="top-center" />
          </StudioThemeProvider>
        </StudioStateProvider>
      </StudioAnalyticsProvider>
    </StudioNuqsAdapter>
  );
}
