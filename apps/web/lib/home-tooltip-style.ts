import type { CSSProperties } from "react";

/** Shared tooltip panel appearance for homepage chart previews. */
export const homeTooltipPanelStyle: CSSProperties = {
  backgroundColor: "color-mix(in oklch, var(--popover) 80%, transparent)",
  backdropFilter: "blur(4px)",
  WebkitBackdropFilter: "blur(4px)",
};
