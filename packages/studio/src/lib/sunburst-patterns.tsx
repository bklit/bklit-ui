"use client";

import { renderPatternPreset } from "@bklitui/ui/charts";
import { Fragment, isValidElement } from "react";
import type { PatternPresetId } from "@/lib/pattern-presets";
import { studioPatternIdForSeries } from "@/lib/patterns";

function patternNodeForPreset(
  preset: PatternPresetId,
  id: string,
  strokeVar: string
) {
  const node = renderPatternPreset(preset, id, {
    color: preset === "accent" ? "#e879f9" : strokeVar,
    scale: preset === "cross" ? 1.33 : 1,
    strokeWidth: preset === "circles" ? 1 : undefined,
  });
  if (!(node && isValidElement(node))) {
    return null;
  }
  return node;
}

/** Per-segment pattern defs; stroke uses the segment's category chart var. */
export function studioSunburstPatternDefs(
  arcs: ReadonlyArray<{ arcIndex: number; categoryIndex: number }>,
  seriesPatterns: PatternPresetId[]
) {
  return arcs.map(({ arcIndex, categoryIndex }) => {
    const preset = seriesPatterns[arcIndex] ?? "none";
    if (preset === "none") {
      return null;
    }
    const strokeVar = `var(--chart-${(categoryIndex % 5) + 1})`;
    const id = studioPatternIdForSeries(arcIndex);
    const node = patternNodeForPreset(preset, id, strokeVar);
    if (!node) {
      return null;
    }
    return <Fragment key={id}>{node}</Fragment>;
  });
}
