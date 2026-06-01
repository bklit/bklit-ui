"use client";

import { ChartLegend, type LegendItem } from "@bklitui/ui/charts";
import { cn } from "@bklitui/ui/lib/utils";
import { type ReactNode, useState } from "react";
import {
  chartLegendPropsFromState,
  studioLegendWrapperStyle,
} from "@/lib/studio-chart-overlays";
import { isStudioComponentVisible } from "@/lib/studio-component-visibility";
import {
  StudioLegendHoverProvider,
  useStudioLegendHover,
} from "@/lib/studio-legend-hover";
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

function enrichLegendItemsForProgress(
  items: LegendItem[],
  showProgress: boolean
): LegendItem[] {
  if (!showProgress || items.length === 0) {
    return items;
  }

  const maxValue = Math.max(
    ...items.map((item) => item.maxValue ?? item.value),
    1
  );

  return items.map((item) => ({
    ...item,
    maxValue: item.maxValue ?? maxValue,
  }));
}

function StudioChartLegend({
  state,
  legendItems,
}: {
  state: StudioUrlState;
  legendItems: LegendItem[];
}) {
  const { hoveredIndex, setHoveredIndex } = useStudioLegendHover();

  return (
    <div style={studioLegendWrapperStyle(state)}>
      <ChartLegend
        hoveredIndex={hoveredIndex}
        items={enrichLegendItemsForProgress(
          legendItems,
          state.legendShowProgress
        )}
        onHover={setHoveredIndex}
        {...chartLegendPropsFromState(state)}
      />
    </div>
  );
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
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const legendVisible =
    state.showLegend &&
    isStudioComponentVisible(state, legendComponentId) &&
    legendItems.length > 0;

  const legend = legendVisible ? (
    <StudioChartLegend legendItems={legendItems} state={state} />
  ) : null;

  return (
    <StudioLegendHoverProvider
      hoveredIndex={hoveredIndex}
      onHoverChange={setHoveredIndex}
    >
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
    </StudioLegendHoverProvider>
  );
}
