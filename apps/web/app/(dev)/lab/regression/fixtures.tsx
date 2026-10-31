"use client";

import type { InteractionScript } from "./bench/interactions";
import { atCenters, type HoverTarget, type HoverTargets } from "./bench/parity";
import { LAB_CHART_SLUGS, type LabChartSlug } from "./lab-slugs";
import { AREA_VARIANTS } from "./variants/area";
import { BAR_VARIANTS } from "./variants/bar";
import { CANDLESTICK_VARIANTS } from "./variants/candlestick";
import { CHOROPLETH_VARIANTS } from "./variants/choropleth";
import { choroplethCountryTargets } from "./variants/choropleth-data";
import { COMPOSED_VARIANTS } from "./variants/composed";
import { HEATMAP_VARIANTS } from "./variants/heatmap";
import { LINE_VARIANTS } from "./variants/line";
import { LIVE_LINE_VARIANTS } from "./variants/live-line";
import { PIE_VARIANTS } from "./variants/pie";
import { PROFIT_LOSS_VARIANTS } from "./variants/profit-loss";
import { RADAR_VARIANTS } from "./variants/radar";
import { RING_VARIANTS } from "./variants/ring";
import { SANKEY_VARIANTS } from "./variants/sankey";
import { SCATTER_VARIANTS } from "./variants/scatter";
import { SPARKLINE_VARIANTS } from "./variants/sparkline";
import type { LabVariant } from "./variants/types";

/**
 * Every documented variation of each chart, ported from the gallery
 * (`chart-examples.tsx`), the docs demos and the recipes (see `variants/*`).
 * Each renders the live chart from `@bklitui/ui/charts` and is compared
 * against its golden baseline (`_baselines/<chart>/<variant>.json`).
 */

export type { LabChartSlug } from "./lab-slugs";
export type { LabVariant } from "./variants/types";

export interface LabChartFixture {
  label: string;
  /** Default frame every copy renders in, so every run lays out identically. */
  width: number;
  height: number;
  variants: readonly LabVariant[];
  /**
   * Where the hover steps point, in document order. Step k hovers target k
   * (first, middle and last are used).
   */
  hoverTargets: HoverTargets;
}

/** Pie slices and rings: the transparent hitbox path that owns the hover. */
function transparentHitboxes(root: Element): HoverTarget[] {
  return atCenters(root.querySelectorAll('svg path[fill="transparent"]'));
}

/** `RadarArea` groups (pointer cursor + a path child). */
function radarAreas(root: Element): HoverTarget[] {
  return atCenters(
    [...root.querySelectorAll('svg g[style*="cursor"]')]
      .map((g) => g.querySelector(":scope > path"))
      .filter((path): path is SVGPathElement => path !== null)
  );
}

/** Sankey links (pointer-cursor paths) then nodes (pointer-cursor groups). */
function sankeyLinksThenNodes(root: Element): HoverTarget[] {
  const links = [...root.querySelectorAll('svg path[style*="cursor"]')];
  const nodes = [...root.querySelectorAll('svg g[style*="cursor"]')]
    .map((g) => g.querySelector(":scope > rect"))
    .filter((rect): rect is SVGRectElement => rect !== null);
  return atCenters([...links, ...nodes]);
}

/** Positions (fraction of the hit rect) the cartesian hover steps visit. */
const PLOT_FRACTIONS = [0.15, 0.5, 0.85] as const;

/**
 * Cartesian charts (time-series shell, bar, scatter, candlestick, live line)
 * listen on the plot `<g transform="translate(margin)">`, whose first child
 * is a transparent hit rect the size of the plot. Hover moves along its
 * diagonal (x picks the point / band; y matters for horizontal bars and
 * nearest-point scatter). First chart only (brush charts render a second).
 */
export function plotHitRect(root: Element): HoverTarget[] {
  const rect = root.querySelector(
    'svg > g[transform] > rect[fill="transparent"]:first-child'
  );
  if (!rect) {
    return [];
  }
  return PLOT_FRACTIONS.map((f) => ({ element: rect, at: { fx: f, fy: f } }));
}

/** Sparkline: pointer handlers on the `<svg role="img">` itself. */
function sparklineSvg(root: Element): HoverTarget[] {
  const svg = root.querySelector('svg[role="img"]');
  if (!svg) {
    return [];
  }
  return PLOT_FRACTIONS.map((f) => ({
    element: svg,
    at: { fx: f, fy: 0.5 },
  }));
}

/**
 * Heatmap cells: the hit rect of each cell group (the first `rect`, followed
 * by the `pointer-events="none"` shimmer rect). Structural on purpose: no
 * visx class names, and no `cursor` style (missing after loading → ready).
 */
function heatmapCells(root: Element): HoverTarget[] {
  return atCenters(
    root.querySelectorAll(
      'svg g > rect:first-child:has(+ rect[pointer-events="none"])'
    )
  );
}

const CARTESIAN = { width: 640, height: 360 } as const;

export const LAB_FIXTURES: Record<LabChartSlug, LabChartFixture> = {
  pie: {
    label: "Pie",
    width: 320,
    height: 320,
    variants: PIE_VARIANTS,
    hoverTargets: transparentHitboxes,
  },
  ring: {
    label: "Ring",
    width: 320,
    height: 320,
    variants: RING_VARIANTS,
    hoverTargets: transparentHitboxes,
  },
  radar: {
    label: "Radar",
    width: 360,
    height: 360,
    variants: RADAR_VARIANTS,
    hoverTargets: radarAreas,
  },
  sankey: {
    label: "Sankey",
    width: 640,
    height: 480,
    variants: SANKEY_VARIANTS,
    hoverTargets: sankeyLinksThenNodes,
  },
  line: {
    label: "Line",
    ...CARTESIAN,
    variants: LINE_VARIANTS,
    hoverTargets: plotHitRect,
  },
  area: {
    label: "Area",
    ...CARTESIAN,
    variants: AREA_VARIANTS,
    hoverTargets: plotHitRect,
  },
  bar: {
    label: "Bar",
    ...CARTESIAN,
    variants: BAR_VARIANTS,
    hoverTargets: plotHitRect,
  },
  composed: {
    label: "Composed",
    ...CARTESIAN,
    variants: COMPOSED_VARIANTS,
    hoverTargets: plotHitRect,
  },
  scatter: {
    label: "Scatter",
    ...CARTESIAN,
    variants: SCATTER_VARIANTS,
    hoverTargets: plotHitRect,
  },
  sparkline: {
    label: "Sparkline",
    width: 320,
    height: 160,
    variants: SPARKLINE_VARIANTS,
    hoverTargets: sparklineSvg,
  },
  candlestick: {
    label: "Candlestick",
    ...CARTESIAN,
    variants: CANDLESTICK_VARIANTS,
    hoverTargets: plotHitRect,
  },
  "profit-loss": {
    label: "Profit/Loss",
    ...CARTESIAN,
    variants: PROFIT_LOSS_VARIANTS,
    hoverTargets: plotHitRect,
  },
  "live-line": {
    label: "Live line",
    ...CARTESIAN,
    variants: LIVE_LINE_VARIANTS,
    hoverTargets: plotHitRect,
  },
  heatmap: {
    label: "Heatmap",
    width: 760,
    height: 260,
    variants: HEATMAP_VARIANTS,
    hoverTargets: heatmapCells,
  },
  choropleth: {
    label: "Choropleth",
    width: 720,
    height: 420,
    variants: CHOROPLETH_VARIANTS,
    hoverTargets: choroplethCountryTargets,
  },
};

/** A chart + variant pair resolved to everything a stage needs to render it. */
export interface LabTarget {
  chart: LabChartSlug;
  chartLabel: string;
  variant: LabVariant;
  width: number;
  height: number;
  hoverTargets: HoverTargets;
  /** Hover steps run for this variant (sweeps and baselines). */
  hover: boolean;
  /** Scripted interaction steps, `null` when the variant has none. */
  interactions: InteractionScript | null;
  /** Not recorded / compared, with the reason. */
  previewOnly: string | null;
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
    hoverTargets: variant.hoverTargets ?? fixture.hoverTargets,
    hover: variant.hover !== false,
    interactions:
      variant.interactions && variant.interactions.length > 0
        ? variant.interactions
        : null,
    previewOnly: variant.previewOnly ?? null,
  };
}

/** Charts that have at least one variant. */
export function populatedCharts(): LabChartSlug[] {
  return LAB_CHART_SLUGS.filter(
    (chart) => LAB_FIXTURES[chart].variants.length > 0
  );
}

/** Every chart × variant, in display order. */
export function allTargets(charts: readonly LabChartSlug[]): LabTarget[] {
  return charts.flatMap((chart) =>
    LAB_FIXTURES[chart].variants.map((variant) =>
      resolveTarget(chart, variant.id)
    )
  );
}
