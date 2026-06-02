"use client";

import { Toggle as TogglePrimitive } from "@base-ui/react/toggle";
import { ToggleGroup as ToggleGroupPrimitive } from "@base-ui/react/toggle-group";
import { cn } from "@bklitui/ui/lib/utils";
import type { VariantProps } from "class-variance-authority";
import {
  type CSSProperties,
  createContext,
  type ReactNode,
  useContext,
} from "react";
import { studioControlSurfaceGroupClass } from "@/ui/studio-control-surface";
import { toggleVariants } from "@/ui/toggle";

/**
 * Low-level toggle group primitive for Studio.
 * Prefer `StudioTabs` / `StudioTab` from `studio-toggle-group.tsx` in sidebar controls —
 * that file owns layout presets; this file owns spacing, segmented join behavior, and item chrome.
 */

const ToggleGroupContext = createContext<
  VariantProps<typeof toggleVariants> & {
    spacing?: number;
    orientation?: "horizontal" | "vertical";
  }
>({
  size: "default",
  variant: "default",
  spacing: 2,
  orientation: "horizontal",
});

function ToggleGroup({
  className,
  variant,
  size,
  spacing = 2,
  orientation = "horizontal",
  children,
  ...props
}: ToggleGroupPrimitive.Props &
  VariantProps<typeof toggleVariants> & {
    spacing?: number;
    orientation?: "horizontal" | "vertical";
    children: ReactNode;
  }) {
  return (
    <ToggleGroupPrimitive
      className={cn(
        "group/toggle-group flex w-fit flex-row items-center gap-[--spacing(var(--gap))] rounded-sm data-[spacing=0]:data-[variant=outline]:shadow-xs data-vertical:flex-col data-vertical:items-stretch",
        variant === "studio" && spacing === 0 && studioControlSurfaceGroupClass,
        className
      )}
      data-orientation={orientation}
      data-size={size}
      data-slot="toggle-group"
      data-spacing={spacing}
      data-variant={variant}
      style={{ "--gap": spacing } as CSSProperties}
      {...props}
    >
      <ToggleGroupContext.Provider
        value={{ variant, size, spacing, orientation }}
      >
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive>
  );
}

function ToggleGroupItem({
  className,
  children,
  variant,
  size,
  ...props
}: TogglePrimitive.Props & VariantProps<typeof toggleVariants>) {
  const context = useContext(ToggleGroupContext);

  return (
    <TogglePrimitive
      className={cn(
        "shrink-0 focus:z-10 focus-visible:z-10 group-data-[spacing=0]/toggle-group:rounded-none group-data-vertical/toggle-group:data-[spacing=0]:data-[variant=outline]:border-t-0 group-data-horizontal/toggle-group:data-[spacing=0]:data-[variant=outline]:border-l-0 group-data-[spacing=0]/toggle-group:px-2 group-data-[spacing=0]/toggle-group:data-[variant=outline]:shadow-none group-data-[spacing=0]/toggle-group:has-data-[icon=inline-end]:pr-1.5 group-data-[spacing=0]/toggle-group:has-data-[icon=inline-start]:pl-1.5 group-data-horizontal/toggle-group:data-[spacing=0]:last:rounded-r-sm group-data-vertical/toggle-group:data-[spacing=0]:last:rounded-b-sm group-data-vertical/toggle-group:data-[spacing=0]:data-[variant=outline]:first:border-t group-data-horizontal/toggle-group:data-[spacing=0]:data-[variant=outline]:first:border-l group-data-vertical/toggle-group:data-[spacing=0]:first:rounded-t-sm group-data-horizontal/toggle-group:data-[spacing=0]:first:rounded-l-sm",
        toggleVariants({
          variant: variant ?? context.variant,
          size: size ?? context.size,
        }),
        className
      )}
      data-size={size ?? context.size}
      data-slot="toggle-group-item"
      data-spacing={context.spacing}
      data-variant={variant ?? context.variant}
      {...props}
    >
      {children}
    </TogglePrimitive>
  );
}

export { ToggleGroup, ToggleGroupItem };
