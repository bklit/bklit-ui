"use client";

import type { ReactNode } from "react";
import type { StudioUrlState } from "@/lib/studio-parsers";
import type { StudioAnalytics } from "@/providers/studio-analytics-context";
import { StudioAnalyticsProvider } from "@/providers/studio-analytics-context";
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
    <StudioAnalyticsProvider value={analytics ?? {}}>
      <StudioStateProvider>
        <div className="relative flex h-full min-h-0 flex-1 flex-col overflow-hidden">
          <StudioOnboardingDialog />
          <StudioEditorLayout renderCodeSheet={renderCodeSheet} />
        </div>
      </StudioStateProvider>
    </StudioAnalyticsProvider>
  );
}
