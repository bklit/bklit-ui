"use client";

import type { ComponentProps } from "react";
import {
  PatternCircles as VisxPatternCircles,
  PatternHexagons as VisxPatternHexagons,
  PatternLines as VisxPatternLines,
  PatternWaves as VisxPatternWaves,
} from "./patterns/index";

/** @deprecated Use `PatternPreset` (Nucleo-based presets) instead. */
export function PatternLines(props: ComponentProps<typeof VisxPatternLines>) {
  return <VisxPatternLines {...props} />;
}
PatternLines.displayName = "PatternLines";

/** @deprecated Use `PatternPreset` (Nucleo-based presets) instead. */
export function PatternCircles(
  props: ComponentProps<typeof VisxPatternCircles>
) {
  return <VisxPatternCircles {...props} />;
}
PatternCircles.displayName = "PatternCircles";

/** @deprecated Use `PatternPreset` (Nucleo-based presets) instead. */
export function PatternWaves(props: ComponentProps<typeof VisxPatternWaves>) {
  return <VisxPatternWaves {...props} />;
}
PatternWaves.displayName = "PatternWaves";

/** @deprecated Use `PatternPreset` (Nucleo-based presets) instead. */
export function PatternHexagons(
  props: ComponentProps<typeof VisxPatternHexagons>
) {
  return <VisxPatternHexagons {...props} />;
}
PatternHexagons.displayName = "PatternHexagons";
