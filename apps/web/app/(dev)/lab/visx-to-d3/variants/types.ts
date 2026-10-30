import type { ReactNode } from "react";

/** Which implementation a render call should use. */
export type LabSide = "before" | "after";

export interface LabVariant {
  /** Stable slug, used in `?variant=`. */
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
   * Renders the variant. Before and After go through this one function, so
   * data, props and children are identical; only the visx-touching
   * components are swapped based on `side`.
   */
  render: (side: LabSide) => ReactNode;
}
