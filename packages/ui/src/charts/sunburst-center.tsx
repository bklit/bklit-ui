"use client";

import { memo } from "react";
import { ringOptions } from "./sunburst";
import { sunburstCssVars, useSunburstStable } from "./sunburst-context";

export interface SunburstCenterProps {
  className?: string;
}

export const SunburstCenter = memo(function SunburstCenter({
  className,
}: SunburstCenterProps) {
  const { focus, prevFocus, maxDepth, radius, zoomT, zoomTo, getColor } =
    useSunburstStable();

  const { centerR } = ringOptions(focus.depth, maxDepth, radius);
  const liveCenterR =
    centerR * zoomT +
    ringOptions(prevFocus.depth, maxDepth, radius).centerR * (1 - zoomT);

  if (liveCenterR <= 1) {
    return null;
  }

  const centerColor =
    focus.depth === 0
      ? sunburstCssVars.background
      : getColor(focus.categoryIndex);

  return (
    /* biome-ignore lint/a11y/noStaticElementInteractions: Center zoom-out control */
    <circle
      className={className}
      cx={0}
      cy={0}
      fill={centerColor}
      onClick={() => focus.parentId && zoomTo(focus.parentId)}
      r={Math.max(liveCenterR - 2, 0)}
      stroke={sunburstCssVars.ring}
      strokeWidth={1}
      style={{ cursor: focus.parentId ? "pointer" : "default" }}
    />
  );
});

SunburstCenter.displayName = "SunburstCenter";
