import type { ReactNode } from "react";
import type { HoverTargets } from "../bench/parity";

/** Which implementation a render call should use. */
export type LabSide = "before" | "after";

interface LabVariantBase {
  /** Stable slug, used in `?variant=` and as the baseline file name. */
  id: string;
  label: string;
  /** Where the JSX was ported from (file + example title / export). */
  source: string;
  /** What this variant covers that the others do not. */
  exercises: string;
  /** Frame size override; defaults to the chart's frame. */
  width?: number;
  height?: number;
  /**
   * Set to `false` to skip the hover steps (enter is still recorded), e.g.
   * when the chart has no pointer interaction.
   */
  hover?: boolean;
  /** Overrides the chart's hover targets for this variant. */
  hoverTargets?: HoverTargets;
  /**
   * Shown in the lab but never recorded or compared (animates forever,
   * depends on the network, …). The string says why.
   */
  previewOnly?: string;
}

/**
 * A legacy pair: Before (frozen visx snapshot) and After (live) go through
 * this one function, so data, props and children are identical; only the
 * visx-touching components are swapped based on `side`.
 */
export interface LabPairVariant extends LabVariantBase {
  kind?: "pair";
  render: (side: LabSide) => ReactNode;
}

/**
 * Single-sided: only the live chart exists (no legacy copy). Compared against
 * a recorded baseline (`baselines/<chart>/<id>.json`) instead of a Before.
 */
export interface LabSingleVariant extends LabVariantBase {
  kind: "single";
  render: () => ReactNode;
}

export type LabVariant = LabPairVariant | LabSingleVariant;

export function isPairVariant(variant: LabVariant): variant is LabPairVariant {
  return variant.kind !== "single";
}

/** The live (current code) render of any variant. */
export function renderLive(variant: LabVariant): ReactNode {
  return isPairVariant(variant) ? variant.render("after") : variant.render();
}
