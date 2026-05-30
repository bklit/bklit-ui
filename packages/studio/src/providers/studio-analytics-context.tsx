"use client";

import { createContext, useContext } from "react";

export interface StudioAnalytics {
  track?: (event: string, props?: Record<string, unknown>) => void;
  getUrl?: () => string | undefined;
}

const StudioAnalyticsContext = createContext<StudioAnalytics>({});

export function StudioAnalyticsProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value: StudioAnalytics;
}) {
  return (
    <StudioAnalyticsContext.Provider value={value}>
      {children}
    </StudioAnalyticsContext.Provider>
  );
}

export function useStudioAnalytics() {
  return useContext(StudioAnalyticsContext);
}
