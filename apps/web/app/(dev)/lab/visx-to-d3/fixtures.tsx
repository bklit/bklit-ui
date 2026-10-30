"use client";

import { PIE_VARIANTS } from "./variants/pie";
import { RADAR_VARIANTS } from "./variants/radar";
import { RING_VARIANTS } from "./variants/ring";
import { SANKEY_VARIANTS } from "./variants/sankey";
import type { LabSide, LabVariant } from "./variants/types";

/**
 * Before (frozen visx snapshot) and After (d3 migration) for every documented
 * variation of each chart, ported from the gallery (`chart-examples.tsx`),
 * the docs demos and the recipes (see `variants/*`). Each variant has ONE
 * render function for both sides, so props, data and children are identical
 * and only the visx-touching components are swapped. The legacy roots reuse
 * the shared contexts, so children that are not part of the migration
 * (centers, axes, labels, legends, sankey nodes/links) are the normal exports
 * on both sides.
 */

export type { LabSide, LabVariant } from "./variants/types";

export type LabChartSlug = "pie" | "ring" | "radar" | "sankey";

export const LAB_CHART_SLUGS: readonly LabChartSlug[] = [
  "pie",
  "ring",
  "radar",
  "sankey",
];

export function isLabChartSlug(value: unknown): value is LabChartSlug {
  return (
    typeof value === "string" &&
    (LAB_CHART_SLUGS as readonly string[]).includes(value)
  );
}

export interface LabChartFixture {
  label: string;
  /** Default frame every copy renders in, so both sides lay out identically. */
  width: number;
  height: number;
  /** Which files are swapped on the Before side. */
  legacyParts: string;
  variants: readonly LabVariant[];
  /**
   * Elements the hover-parity step points at, in document order. Run on both
   * sides; step k hovers element k of each list.
   */
  hoverTargets: (root: Element) => Element[];
}

/** Pie slices and rings: the transparent hitbox path that owns the hover. */
function transparentHitboxes(root: Element): Element[] {
  return [...root.querySelectorAll('svg path[fill="transparent"]')];
}

/** `RadarArea` groups (pointer cursor + a path child). */
function radarAreas(root: Element): Element[] {
  return [...root.querySelectorAll('svg g[style*="cursor"]')]
    .map((g) => g.querySelector(":scope > path"))
    .filter((path): path is SVGPathElement => path !== null);
}

/** Sankey links (pointer-cursor paths) then nodes (pointer-cursor groups). */
function sankeyLinksThenNodes(root: Element): Element[] {
  const links = [...root.querySelectorAll('svg path[style*="cursor"]')];
  const nodes = [...root.querySelectorAll('svg g[style*="cursor"]')]
    .map((g) => g.querySelector(":scope > rect"))
    .filter((rect): rect is SVGRectElement => rect !== null);
  return [...links, ...nodes];
}

export const LAB_FIXTURES: Record<LabChartSlug, LabChartFixture> = {
  pie: {
    label: "Pie",
    width: 320,
    height: 320,
    legacyParts: "PieChart + PieSlice",
    variants: PIE_VARIANTS,
    hoverTargets: transparentHitboxes,
  },
  ring: {
    label: "Ring",
    width: 320,
    height: 320,
    legacyParts: "RingChart + Ring",
    variants: RING_VARIANTS,
    hoverTargets: transparentHitboxes,
  },
  radar: {
    label: "Radar",
    width: 360,
    height: 360,
    legacyParts: "RadarChart + RadarGrid",
    variants: RADAR_VARIANTS,
    hoverTargets: radarAreas,
  },
  sankey: {
    label: "Sankey",
    width: 640,
    height: 480,
    legacyParts: "SankeyChart",
    variants: SANKEY_VARIANTS,
    hoverTargets: sankeyLinksThenNodes,
  },
};

/** A chart + variant pair resolved to everything a stage needs to render it. */
export interface LabTarget {
  chart: LabChartSlug;
  chartLabel: string;
  variant: LabVariant;
  width: number;
  height: number;
  render: (side: LabSide) => React.ReactNode;
  hoverTargets: (root: Element) => Element[];
}

export function resolveTarget(
  chart: LabChartSlug,
  variantId: string | null | undefined
): LabTarget {
  const fixture = LAB_FIXTURES[chart];
  const variant =
    fixture.variants.find((v) => v.id === variantId) ?? fixture.variants[0];
  if (!variant) {
    throw new Error(`No variants for ${chart}`);
  }
  return {
    chart,
    chartLabel: fixture.label,
    variant,
    width: variant.width ?? fixture.width,
    height: variant.height ?? fixture.height,
    render: variant.render,
    hoverTargets: fixture.hoverTargets,
  };
}

/** Every chart × variant, in display order. */
export function allTargets(charts: readonly LabChartSlug[]): LabTarget[] {
  return charts.flatMap((chart) =>
    LAB_FIXTURES[chart].variants.map((variant) =>
      resolveTarget(chart, variant.id)
    )
  );
}
