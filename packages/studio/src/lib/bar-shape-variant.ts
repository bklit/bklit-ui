import type { StudioUrlState } from "@/lib/studio-parsers";

/** Lollipop stems + dots (vertical, non-stacked bar charts only). */
export function isBarLollipopVariant(state: StudioUrlState): boolean {
  return state.barVariant === "lollipop";
}

export function isBarShapeVariant(state: StudioUrlState): boolean {
  return state.barVariant === "shape" || state.barVariant === "squares";
}
