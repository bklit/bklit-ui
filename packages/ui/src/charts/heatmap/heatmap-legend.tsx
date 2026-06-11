"use client";

import { motion } from "motion/react";
import { memo, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
  defaultHeatmapColorScale,
  type HeatmapLevelStyles,
} from "./heatmap-colors";
import { useHeatmapInteractionOptional } from "./heatmap-context";
import { HeatmapLegendSwatch } from "./heatmap-legend-swatch";
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
  /** Shared level styles for cells and legend swatches. */
  levelStyles?: HeatmapLevelStyles;
  /** Override the default color scale (used when `levelStyles` is omitted). */
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
  levelStyles: levelStylesProp,
  colorScale = defaultHeatmapColorScale,
  fadedOpacity = HEATMAP_FADED_OPACITY,
  interactive,
  className,
}: HeatmapLegendProps) {
  const interaction = useHeatmapInteractionOptional();
  const isInteractive = interactive ?? interaction != null;
  const levelStyles =
    levelStylesProp ??
    (HEATMAP_LEGEND_LEVELS.map((level) => ({
      color: colorScale(level),
      fillMode: "solid" as const,
      pattern: "none" as const,
    })) as unknown as HeatmapLevelStyles);

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
          const style = levelStyles[level];

          return (
            <motion.span
              animate={{ opacity: isFaded ? fadedOpacity : 1 }}
              aria-hidden="true"
              className="block shrink-0 leading-none"
              initial={{ opacity: 1 }}
              key={level}
              onPointerEnter={() => handleLegendEnter(level)}
              onPointerLeave={handleLegendLeave}
              style={{
                cursor: isInteractive ? "pointer" : undefined,
              }}
              transition={HEATMAP_HOVER_TRANSITION}
            >
              <HeatmapLegendSwatch
                cellSize={cellSize}
                cornerRadius={cornerRadius}
                level={level}
                style={style}
              />
            </motion.span>
          );
        })}
      </div>
      <span>{moreLabel}</span>
    </div>
  );
});

HeatmapLegend.displayName = "HeatmapLegend";

export default HeatmapLegend;
