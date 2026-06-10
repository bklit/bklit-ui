"use client";

import { memo } from "react";
import { renderPatternPreset } from "../pattern-preset";
import {
  type HeatmapLevelStyle,
  heatmapLevelPatternId,
  heatmapLevelPatternRenderOptions,
  isHeatmapLevelPattern,
} from "./heatmap-colors";

export const HeatmapLegendSwatch = memo(function HeatmapLegendSwatch({
  level,
  style,
  cellSize,
  cornerRadius,
}: {
  level: number;
  style: HeatmapLevelStyle;
  cellSize: number;
  cornerRadius: number;
}) {
  if (isHeatmapLevelPattern(style) && style.pattern) {
    const patternId = heatmapLevelPatternId(level);
    const patternNode = renderPatternPreset(
      style.pattern,
      patternId,
      heatmapLevelPatternRenderOptions(style)
    );
    const opacity = style.patternOpacity ?? 1;

    return (
      <svg
        aria-hidden="true"
        className="inline-block shrink-0 overflow-hidden"
        height={cellSize}
        style={{ borderRadius: cornerRadius, opacity }}
        viewBox={`0 0 ${cellSize} ${cellSize}`}
        width={cellSize}
      >
        {patternNode ? <defs>{patternNode}</defs> : null}
        <rect
          fill={patternNode ? `url(#${patternId})` : style.color}
          height={cellSize}
          rx={cornerRadius}
          ry={cornerRadius}
          width={cellSize}
        />
      </svg>
    );
  }

  return (
    <span
      aria-hidden="true"
      className="inline-block shrink-0"
      style={{
        width: cellSize,
        height: cellSize,
        borderRadius: cornerRadius,
        backgroundColor: style.color,
        border: level === 0 ? `1px solid ${style.color}` : undefined,
      }}
    />
  );
});

HeatmapLegendSwatch.displayName = "HeatmapLegendSwatch";
