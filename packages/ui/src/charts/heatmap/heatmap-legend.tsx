"use client";

import { motion } from "motion/react";
import { memo, useCallback } from "react";
import { cn } from "@/lib/utils";
import { defaultHeatmapColorScale } from "./heatmap-colors";
import { useHeatmapInteractionOptional } from "./heatmap-context";
import { getHeatmapContributionLevel } from "./heatmap-utils";

export const HEATMAP_LEGEND_LEVELS = [0, 1, 2, 3, 4] as const;

const HEATMAP_FADED_OPACITY = 0.3;
const HEATMAP_HOVER_TRANSITION = { duration: 0.15, ease: "easeOut" as const };

export interface HeatmapLegendProps {
  /** Side label before the swatches. Default: "Less" */
  lessLabel?: string;
  /** Side label after the swatches. Default: "More" */
  moreLabel?: string;
  /** Swatch size in pixels. Default: 11 */
  cellSize?: number;
  /** Gap between swatches. Default: 2 */
  gap?: number;
  /** Corner radius for swatches. Default: 2 */
  cornerRadius?: number;
  /** Horizontal alignment within the legend cell. Default: "end" */
  align?: "start" | "center" | "end";
  /** Override the default color scale. */
  colorScale?: (count: number | null | undefined) => string;
  /** Opacity for non-highlighted swatches while interacting. Default: 0.3 */
  fadedOpacity?: number;
  /** Sync dimming with chart hover. Default: true when inside HeatmapInteractionProvider */
  interactive?: boolean;
  className?: string;
}

export const HeatmapLegend = memo(function HeatmapLegend({
  lessLabel = "Less",
  moreLabel = "More",
  cellSize = 11,
  gap = 2,
  cornerRadius = 2,
  align = "end",
  colorScale = defaultHeatmapColorScale,
  fadedOpacity = HEATMAP_FADED_OPACITY,
  interactive,
  className,
}: HeatmapLegendProps) {
  const interaction = useHeatmapInteractionOptional();
  const isInteractive = interactive ?? interaction != null;

  const {
    hoveredLegendLevel,
    tooltipData,
    setHoveredCell,
    setHoveredLegendLevel,
    setTooltipData,
  } = interaction ?? {
    hoveredLegendLevel: null,
    tooltipData: null,
    setHoveredCell: () => undefined,
    setHoveredLegendLevel: () => undefined,
    setTooltipData: () => undefined,
  };

  const highlightedLevel =
    hoveredLegendLevel ??
    (tooltipData ? getHeatmapContributionLevel(tooltipData.count) : null);
  const isDimming = isInteractive && highlightedLevel !== null;

  const handleLegendEnter = useCallback(
    (level: number) => {
      if (!isInteractive) {
        return;
      }

      setHoveredLegendLevel(level);
      setHoveredCell(null);
      setTooltipData(null);
    },
    [isInteractive, setHoveredCell, setHoveredLegendLevel, setTooltipData]
  );

  const handleLegendLeave = useCallback(() => {
    if (!isInteractive) {
      return;
    }

    setHoveredLegendLevel(null);
  }, [isInteractive, setHoveredLegendLevel]);

  return (
    <div
      className={cn(
        "flex w-full items-center gap-1.5 text-chart-label text-xs",
        align === "start" && "justify-start",
        align === "center" && "justify-center",
        align === "end" && "justify-end",
        className
      )}
    >
      <span>{lessLabel}</span>
      <div className="flex items-center" style={{ gap }}>
        {HEATMAP_LEGEND_LEVELS.map((level) => {
          const isFaded = isDimming && highlightedLevel !== level;

          return (
            <motion.span
              animate={{ opacity: isFaded ? fadedOpacity : 1 }}
              aria-hidden="true"
              className="inline-block shrink-0"
              initial={{ opacity: 1 }}
              key={level}
              onPointerEnter={() => handleLegendEnter(level)}
              onPointerLeave={handleLegendLeave}
              style={{
                width: cellSize,
                height: cellSize,
                borderRadius: cornerRadius,
                backgroundColor: colorScale(level),
                border: level === 0 ? `1px solid ${colorScale(0)}` : undefined,
                cursor: isInteractive ? "pointer" : undefined,
              }}
              transition={HEATMAP_HOVER_TRANSITION}
            />
          );
        })}
      </div>
      <span>{moreLabel}</span>
    </div>
  );
});

HeatmapLegend.displayName = "HeatmapLegend";

export default HeatmapLegend;
