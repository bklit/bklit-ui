"use client";

import { memo } from "react";
import { TooltipBox } from "../tooltip/tooltip-box";
import { TooltipContent } from "../tooltip/tooltip-content";
import { useHeatmap, useHeatmapInteraction } from "./heatmap-context";
import { formatHeatmapContributionLabel } from "./heatmap-utils";

export interface HeatmapTooltipProps {
  /** Custom label for the hovered cell. */
  formatLabel?: (count: number, date: Date) => string;
  /** Custom class name */
  className?: string;
  /** Inline styles for the tooltip panel (background, blur, etc.). */
  panelStyle?: React.CSSProperties;
}

export const HeatmapTooltip = memo(function HeatmapTooltip({
  formatLabel = formatHeatmapContributionLabel,
  className = "",
  panelStyle,
}: HeatmapTooltipProps) {
  const { containerRef, width, height } = useHeatmap();
  const { tooltipData } = useHeatmapInteraction();

  if (!tooltipData) {
    return null;
  }

  return (
    <TooltipBox
      animate={false}
      className={className}
      containerHeight={height}
      containerRef={containerRef}
      containerWidth={width}
      panelStyle={panelStyle}
      visible
      x={tooltipData.x}
      y={tooltipData.y}
    >
      <TooltipContent
        rows={[]}
        title={formatLabel(tooltipData.count, tooltipData.date)}
      />
    </TooltipBox>
  );
});

HeatmapTooltip.displayName = "HeatmapTooltip";

export default HeatmapTooltip;
