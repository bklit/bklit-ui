"use client";

import { memo, useMemo } from "react";
import { useChoroplethCamera } from "./choropleth-camera";
import { useChoroplethStable } from "./choropleth-context";
import { graticulePath } from "./choropleth-projection";

export interface ChoroplethGraticuleProps {
  /** Stroke color for graticule lines. Default: rgba(255,255,255,0.1) */
  stroke?: string;
  /** Stroke width for graticule lines. Default: 0.5 */
  strokeWidth?: number;
  /** Step intervals for graticule lines [longitude, latitude] in degrees. Default: [10, 10] */
  step?: [number, number];
  /** Fade the lines out while the camera is focused on a region or marker. Default: true */
  hideOnFocus?: boolean;
}

export const ChoroplethGraticule = memo(function ChoroplethGraticule({
  stroke = "rgba(255,255,255,0.1)",
  strokeWidth = 0.5,
  step,
  hideOnFocus = true,
}: ChoroplethGraticuleProps) {
  const { rawPathGenerator } = useChoroplethStable();
  const { focusedKey } = useChoroplethCamera();
  const hidden = hideOnFocus && focusedKey !== null;
  const stepX = step?.[0];
  const stepY = step?.[1];

  const d = useMemo(
    () =>
      graticulePath(
        rawPathGenerator,
        stepX === undefined || stepY === undefined ? undefined : [stepX, stepY]
      ),
    [rawPathGenerator, stepX, stepY]
  );

  // Same markup as visx <Graticule>: a group wrapping one unfilled path.
  return (
    <g
      className="visx-group visx-geo-graticule"
      style={{ opacity: hidden ? 0 : 1, transition: "opacity 0.3s ease-out" }}
      transform="translate(0, 0)"
    >
      <path d={d} fill="none" stroke={stroke} strokeWidth={strokeWidth} />
    </g>
  );
});

ChoroplethGraticule.displayName = "ChoroplethGraticule";

export default ChoroplethGraticule;
