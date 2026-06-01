"use client";

import { ChartLegend, type LegendItem } from "@bklitui/ui/charts";
import { cn } from "@bklitui/ui/lib/utils";
import type { ReactNode } from "react";
import {
  chartLegendPropsFromState,
  studioLegendWrapperStyle,
} from "@/lib/studio-chart-overlays";
import { isStudioComponentVisible } from "@/lib/studio-component-visibility";
import type { StudioUrlState } from "@/lib/studio-parsers";

export function StudioVisibleLayer({
  state,
  componentId,
  children,
}: {
  state: StudioUrlState;
  componentId: string;
  children: ReactNode;
}) {
  if (!isStudioComponentVisible(state, componentId)) {
    return null;
  }
  return children;
}

export function StudioChartShell({
  state,
  legendComponentId,
  legendItems,
  children,
}: {
  state: StudioUrlState;
  legendComponentId: string;
  legendItems: LegendItem[];
  children: ReactNode;
}) {
  const legendVisible =
    state.showLegend &&
    isStudioComponentVisible(state, legendComponentId) &&
    legendItems.length > 0;

  const legend = legendVisible ? (
    <div style={studioLegendWrapperStyle(state)}>
      <ChartLegend items={legendItems} {...chartLegendPropsFromState(state)} />
    </div>
  ) : null;

  return (
    <div
      className={cn(
        "flex size-full min-h-0 min-w-0 flex-col",
        state.legendAlign === "start" && "items-start",
        state.legendAlign === "center" && "items-center",
        state.legendAlign === "end" && "items-end"
      )}
    >
      {state.legendPlacement === "top" ? legend : null}
      <div className="relative min-h-0 w-full flex-1">{children}</div>
      {state.legendPlacement === "bottom" ? legend : null}
    </div>
  );
}
