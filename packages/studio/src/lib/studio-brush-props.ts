import type { ChartBrushProps } from "@bklitui/ui/charts";
import {
  BRUSH_PATTERN_KEYS,
  patternOptionsFromState,
} from "./pattern-control-groups";
import type { StudioUrlState } from "./studio-parsers";

export function studioChartBrushProps(
  state: StudioUrlState
): Pick<ChartBrushProps, "blurPx" | "fadeOuterEdges" | "selectionPattern"> {
  const options = patternOptionsFromState(state, BRUSH_PATTERN_KEYS);

  return {
    blurPx: state.brushBlur,
    fadeOuterEdges: state.brushFadeEdges,
    selectionPattern:
      state.brushSelectionPatternEnabled && options.preset !== "none"
        ? {
            preset: options.preset,
            color: options.color,
            scale: options.scale,
            strokeWidth: options.strokeWidth,
            radius: options.radius,
            complement: options.complement,
            fill: options.fill || undefined,
            tileBackground: options.tileBackground,
            opacity: options.opacity,
          }
        : undefined,
  };
}
