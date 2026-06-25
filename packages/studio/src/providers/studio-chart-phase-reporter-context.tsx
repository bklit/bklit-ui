"use client";

import type { ChartPhase } from "@bklitui/ui/charts";
import { createContext, useContext } from "react";

const StudioChartPhaseReporterContext = createContext<
  ((phase: ChartPhase) => void) | undefined
>(undefined);

export function StudioChartPhaseReporterProvider({
  onPhaseChange,
  children,
}: {
  onPhaseChange: (phase: ChartPhase) => void;
  children: React.ReactNode;
}) {
  return (
    <StudioChartPhaseReporterContext.Provider value={onPhaseChange}>
      {children}
    </StudioChartPhaseReporterContext.Provider>
  );
}

export function useStudioChartPhaseReporter() {
  return useContext(StudioChartPhaseReporterContext);
}
