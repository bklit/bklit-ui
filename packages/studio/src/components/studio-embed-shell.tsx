"use client";

import { StudioEmbedLayout } from "@/components/studio-embed-layout";
import type { StudioAnalytics } from "@/providers/studio-analytics-context";
import { StudioAnalyticsProvider } from "@/providers/studio-analytics-context";
import { Toaster } from "@/ui/sonner";
import { StudioStateProvider } from "./studio-state-provider";

export function StudioEmbedShell({
  analytics,
}: {
  analytics?: StudioAnalytics;
}) {
  return (
    <StudioAnalyticsProvider value={analytics ?? {}}>
      <StudioStateProvider>
        <div className="relative flex h-full min-h-0 flex-1 flex-col overflow-hidden">
          <StudioEmbedLayout />
          <Toaster position="top-center" />
        </div>
      </StudioStateProvider>
    </StudioAnalyticsProvider>
  );
}
