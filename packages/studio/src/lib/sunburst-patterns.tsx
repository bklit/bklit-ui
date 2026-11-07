"use client";

import { Fragment } from "react";
import type { PatternPresetId } from "@/lib/pattern-presets";
import { studioPatternIdForSeries, studioPatternNode } from "@/lib/patterns";

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
    const node = studioPatternNode(preset, id, strokeVar);
    if (!node) {
      return null;
    }
    return <Fragment key={id}>{node}</Fragment>;
  });
}
