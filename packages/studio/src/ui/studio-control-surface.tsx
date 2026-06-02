"use client";

import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cn } from "@bklitui/ui/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

/**
 * Class applied to sidebar triggers, segmented tabs, and toggle items (`variant="studio"`).
 * Visual tokens live in `styles/studio.css` (`.studio-control-surface`).
 */
export const studioControlSurfaceClass = "studio-control-surface";

/** Segmented tabs / placement grid — one outer surface, flat segments inside. */
export const studioControlSurfaceGroupClass = "studio-control-surface-group";

/** Selected segment (also matches `[data-pressed]` in CSS). */
export const studioControlSurfacePressedClass =
  "studio-control-surface-pressed";

/** @deprecated Use `studioControlSurfaceClass` or `studioControlSurfaceVariants`. */
export const studioSurfaceClasses = studioControlSurfaceClass;

const studioControlSurfaceVariants = cva(
  [
    "inline-flex shrink-0 items-center font-medium outline-none transition-[color,box-shadow]",
    "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
    "disabled:pointer-events-none disabled:opacity-50",
    studioControlSurfaceClass,
  ],
  {
    variants: {
      /** Layout for trigger content (chart selector vs centered actions). */
      align: {
        center: "justify-center text-center",
        start: "justify-start gap-2.5 text-left",
      },
      size: {
        /** Full-width sidebar triggers (chart type, scramble data, …). */
        trigger: "h-8 w-full px-2.5 text-xs",
      },
    },
    defaultVariants: {
      align: "center",
      size: "trigger",
    },
  }
);

function StudioControlSurface({
  className,
  size,
  align,
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof studioControlSurfaceVariants>) {
  return (
    <ButtonPrimitive
      className={cn(studioControlSurfaceVariants({ size, align, className }))}
      data-slot="studio-control-surface"
      {...props}
    />
  );
}

export { StudioControlSurface, studioControlSurfaceVariants };
