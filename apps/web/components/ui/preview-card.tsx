"use client";

import { PreviewCard as PreviewCardPrimitive } from "@base-ui/react/preview-card";
import type React from "react";
import { cn } from "@/lib/utils";

export const PreviewCardCreateHandle: typeof PreviewCardPrimitive.createHandle =
  PreviewCardPrimitive.createHandle;

export const PreviewCard: typeof PreviewCardPrimitive.Root =
  PreviewCardPrimitive.Root;

export const PreviewCardTrigger: typeof PreviewCardPrimitive.Trigger =
  PreviewCardPrimitive.Trigger;

/**
 * coss-style preview card popup. With a shared handle, the popup glides
 * between triggers and the viewport cross-fades the payload (like coss/Base UI
 * multi-trigger tooltips).
 */
export function PreviewCardPopup({
  className,
  align = "center",
  sideOffset = 8,
  side = "bottom",
  children,
  portalProps,
  ...props
}: PreviewCardPrimitive.Popup.Props & {
  align?: PreviewCardPrimitive.Positioner.Props["align"];
  side?: PreviewCardPrimitive.Positioner.Props["side"];
  sideOffset?: PreviewCardPrimitive.Positioner.Props["sideOffset"];
  portalProps?: PreviewCardPrimitive.Portal.Props;
}): React.ReactElement {
  return (
    <PreviewCardPrimitive.Portal {...portalProps}>
      <PreviewCardPrimitive.Positioner
        align={align}
        className="z-50 h-(--positioner-height) w-(--positioner-width) max-w-(--available-width) transition-[top,left,right,bottom,transform] duration-200 ease-out data-instant:transition-none"
        data-slot="preview-card-positioner"
        side={side}
        sideOffset={sideOffset}
      >
        <PreviewCardPrimitive.Popup
          className={cn(
            "relative flex h-(--popup-height,auto) w-(--popup-width,auto) origin-(--transform-origin) rounded-xl border bg-popover not-dark:bg-clip-padding text-popover-foreground shadow-lg/5 outline-none transition-[width,height,scale,opacity] duration-200 ease-out before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-xl)-1px)] before:shadow-[0_1px_--theme(--color-black/4%)] data-ending-style:scale-98 data-starting-style:scale-98 data-ending-style:opacity-0 data-starting-style:opacity-0 data-instant:duration-0 dark:before:shadow-[0_-1px_--theme(--color-white/6%)]",
            className
          )}
          data-slot="preview-card-popup"
          {...props}
        >
          <PreviewCardPrimitive.Viewport
            className="relative size-full overflow-clip data-instant:transition-none **:data-current:data-ending-style:opacity-0 **:data-current:data-starting-style:opacity-0 **:data-previous:data-ending-style:opacity-0 **:data-previous:data-starting-style:opacity-0 **:data-current:w-(--popup-width) **:data-previous:w-(--popup-width) **:data-current:opacity-100 **:data-previous:opacity-100 **:data-current:transition-opacity **:data-previous:transition-opacity **:data-current:duration-200 **:data-previous:duration-150"
            data-slot="preview-card-viewport"
          >
            {children}
          </PreviewCardPrimitive.Viewport>
        </PreviewCardPrimitive.Popup>
      </PreviewCardPrimitive.Positioner>
    </PreviewCardPrimitive.Portal>
  );
}

export { PreviewCardPrimitive };
