"use client";

import { BackgroundPatternLayer, type BackgroundProps } from "../background";
import { useChoroplethCamera } from "./choropleth-camera";
import { useChoroplethStable } from "./choropleth-context";

export interface ChoroplethBackgroundProps extends BackgroundProps {
  /** Fade the pattern out while the camera is focused. Default: false */
  hideOnFocus?: boolean;
}

/**
 * Static pattern behind the map — same options as the cartesian
 * `Background` (pattern, colour, opacity, edge fades). It doesn't zoom,
 * pan or tilt with the camera.
 */
export function ChoroplethBackground({
  hideOnFocus = false,
  ...props
}: ChoroplethBackgroundProps) {
  const { width, height, isLoaded, enterTransition } = useChoroplethStable();
  const { focusedKey } = useChoroplethCamera();
  const hidden = hideOnFocus && focusedKey !== null;
  return (
    <g style={{ opacity: hidden ? 0 : 1, transition: "opacity 0.3s ease-out" }}>
      <BackgroundPatternLayer
        {...props}
        enterTransition={enterTransition}
        height={height}
        isLoaded={isLoaded}
        width={width}
      />
    </g>
  );
}

ChoroplethBackground.displayName = "ChoroplethBackground";

export default ChoroplethBackground;
