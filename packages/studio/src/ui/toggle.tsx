"use client";

import { Toggle as TogglePrimitive } from "@base-ui/react/toggle";
import { cn } from "@bklitui/ui/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { studioControlSurfaceClass } from "@/ui/studio-control-surface";

const toggleVariants = cva(
  "group/toggle inline-flex shrink-0 items-center justify-center gap-1 whitespace-nowrap rounded-sm font-medium text-sm outline-none transition-[color,box-shadow] hover:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-transparent hover:bg-muted",
        outline:
          "border border-input bg-[var(--studio-input-background)] shadow-xs hover:bg-muted",
        studio: studioControlSurfaceClass,
      },
      size: {
        default:
          "h-9 min-w-9 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        sm: "h-8 min-w-8 px-2.5 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5",
        segmented: "h-8 min-h-8 min-w-0 px-2.5 font-medium text-xs",
        swatch:
          "h-9 min-h-9 w-full min-w-0 flex-row justify-start gap-2 px-2.5 font-normal text-xs",
        lg: "h-10 min-w-10 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        icon: "h-11 min-h-11 min-w-0 flex-1 px-0",
        card: "h-auto min-h-0 flex-col gap-1 px-1.5 py-2 font-normal text-[10px] leading-tight",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Toggle({
  className,
  variant = "default",
  size = "default",
  ...props
}: TogglePrimitive.Props & VariantProps<typeof toggleVariants>) {
  return (
    <TogglePrimitive
      className={cn(toggleVariants({ variant, size, className }))}
      data-slot="toggle"
      {...props}
    />
  );
}

export { Toggle, toggleVariants };
