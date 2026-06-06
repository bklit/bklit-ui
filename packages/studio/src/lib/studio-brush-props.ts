import type { ChartBrushProps } from "@bklitui/ui/charts";
import type { StudioUrlState } from "./studio-parsers";

type BrushSelectionState = Pick<
  StudioUrlState,
  | "brushBlur"
  | "brushFadeEdges"
  | "brushSelectionPatternEnabled"
  | "brushSelectionPattern"
  | "brushSelectionPatternColor"
>;

export function studioChartBrushProps(
  state: BrushSelectionState
): Pick<ChartBrushProps, "blurPx" | "fadeOuterEdges" | "selectionPattern"> {
  return {
    blurPx: state.brushBlur,
    fadeOuterEdges: state.brushFadeEdges,
    selectionPattern:
      state.brushSelectionPatternEnabled &&
      state.brushSelectionPattern !== "none"
        ? {
            preset: state.brushSelectionPattern,
            color: state.brushSelectionPatternColor,
          }
        : undefined,
  };
}
