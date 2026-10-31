import type { ReactNode } from "react";
import type { InteractionScript } from "../bench/interactions";
import type { HoverTargets } from "../bench/parity";

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
   * Scripted interaction steps (drag, wheel, buttons, …; `bench/
   * interactions.ts`), run on a fresh mount after enter (and hover). Each
   * step is settled and snapshotted (geometry + HTML text + callbacks the
   * variant emits through `useLabProbe`).
   */
  interactions?: InteractionScript;
  /**
   * Shown in the lab but never recorded or compared (animates forever,
   * depends on the network, …). The string says why.
   */
  previewOnly?: string;
}

/**
 * Every variant renders the live chart from `@bklitui/ui/charts` and is
 * compared against its recorded baseline (`_baselines/<chart>/<id>.json`).
 */
export interface LabVariant extends LabVariantBase {
  kind: "single";
  render: () => ReactNode;
}
