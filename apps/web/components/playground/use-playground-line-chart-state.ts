"use client";

import { usePlaygroundState } from "@/components/playground/use-playground-state";

export function usePlaygroundLineChartState() {
  return usePlaygroundState({
    chart: "line-chart",
    dataSeries: 2,
    dataPoints: 12,
  });
}

export type PlaygroundLineChartState = ReturnType<
  typeof usePlaygroundLineChartState
>;
