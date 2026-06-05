"use client";

import {
  ChartLegend,
  ChartLegendHoverProvider,
  type LegendItem,
} from "@bklitui/ui/charts";
import { memo, type ReactNode, useState } from "react";
import { StudioChartContentViewport } from "@/lib/studio-chart-content-frame";
import {
  studioChartGridLayout,
  studioLegendGridCellClassName,
} from "@/lib/studio-chart-grid";
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

const StudioChartLegend = memo(function StudioChartLegend({
  state,
  legendItems,
  hoveredIndex,
  onHover,
}: {
  state: StudioUrlState;
  legendItems: LegendItem[];
  hoveredIndex: number | null;
  onHover: (index: number | null) => void;
}) {
  return (
    <div style={studioLegendWrapperStyle(state)}>
      <ChartLegend
        hoveredIndex={hoveredIndex}
        items={enrichLegendItemsForProgress(
          legendItems,
          state.legendShowProgress
        )}
        onHover={onHover}
        {...chartLegendPropsFromState(state)}
      />
    </div>
  );
});

export const StudioChartShell = memo(function StudioChartShell({
  state,
  legendComponentId,
  legendItems = [],
  renderLegend,
  children,
}: {
  state: StudioUrlState;
  legendComponentId: string;
  legendItems?: LegendItem[];
  /** Custom legend (e.g. ProfitLossLegend). When set, `legendItems` is optional. */
  renderLegend?: () => ReactNode;
  children: ReactNode;
}) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const hasLegendContent = renderLegend == null ? legendItems.length > 0 : true;
  const legendVisible =
    state.showLegend &&
    isStudioComponentVisible(state, legendComponentId) &&
    hasLegendContent;

  const grid = studioChartGridLayout(state, legendVisible);

  const legend = legendVisible ? (
    <div
      className={studioLegendGridCellClassName(state)}
      style={{ gridArea: grid.legendGridArea }}
    >
      {renderLegend ? (
        renderLegend()
      ) : (
        <StudioChartLegend
          hoveredIndex={hoveredIndex}
          legendItems={legendItems}
          onHover={setHoveredIndex}
          state={state}
        />
      )}
    </div>
  ) : null;

  return (
    <ChartLegendHoverProvider
      hoveredIndex={hoveredIndex}
      onHoverChange={setHoveredIndex}
    >
      <div
        className="grid size-full min-h-0 min-w-0"
        style={{
          gridTemplateColumns: grid.gridTemplateColumns,
          gridTemplateRows: grid.gridTemplateRows,
        }}
      >
        {legend}
        <div
          className="min-h-0 min-w-0"
          style={{ gridArea: grid.chartGridArea }}
        >
          <StudioChartContentViewport>{children}</StudioChartContentViewport>
        </div>
      </div>
    </ChartLegendHoverProvider>
  );
});
