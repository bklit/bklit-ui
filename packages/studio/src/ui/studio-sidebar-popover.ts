import type { Popover as PopoverPrimitive } from "@base-ui/react/popover";

/** Keep panel popovers on their canvas-facing side (shift, do not flip onto the pane). */
export const studioSidebarPopoverCollisionAvoidance = {
  side: "shift",
  align: "shift",
  fallbackAxisSide: "none",
} satisfies PopoverPrimitive.Positioner.Props["collisionAvoidance"];

export const studioSidebarPopoverSideOffset = 4;
