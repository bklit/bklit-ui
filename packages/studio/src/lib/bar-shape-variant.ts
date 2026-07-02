import type { StudioUrlState } from "@/lib/studio-parsers";

export function isBarShapeVariant(state: StudioUrlState): boolean {
  return state.barVariant === "shape" || state.barVariant === "squares";
}
