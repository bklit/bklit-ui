"use client";

import { cn } from "@bklitui/ui/lib/utils";
import type { VariantProps } from "class-variance-authority";
import {
  type ComponentProps,
  createContext,
  type ReactNode,
  useContext,
} from "react";
import type { toggleVariants } from "@/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@/ui/toggle-group";

/** Studio sidebar tab layouts — single source of truth for all segmented controls. */
export type StudioTabsLayout =
  | "segmented"
  | "icons"
  | "cards-2"
  | "cards-3"
  | "swatch"
  | "legend";

interface LayoutConfig {
  groupClassName: string;
  itemClassName?: string;
  size: NonNullable<VariantProps<typeof toggleVariants>["size"]>;
  spacing: number;
  variant: NonNullable<VariantProps<typeof toggleVariants>["variant"]>;
}

export const STUDIO_TABS_LAYOUTS: Record<StudioTabsLayout, LayoutConfig> = {
  /** Small text tabs in a pill (Fill mode, motion type, etc.). */
  segmented: {
    groupClassName:
      "grid w-full grid-cols-[repeat(auto-fit,minmax(0,1fr))] gap-0",
    itemClassName: "flex-1",
    size: "segmented",
    spacing: 0,
    variant: "studio",
  },
  /** Equal-width icon row (orientation, fade edges, line cap, …). */
  icons: {
    groupClassName: "w-full",
    size: "icon",
    spacing: 2,
    variant: "studio",
  },
  /** Two-column preview cards (motion ease presets) — joined surface group like Ease/Spring. */
  "cards-2": {
    groupClassName:
      "studio-control-surface-group--2col grid w-full grid-cols-2 gap-0",
    itemClassName: "w-full",
    size: "card",
    spacing: 0,
    variant: "studio",
  },
  /** Three-column preview cards (curve type). */
  "cards-3": {
    groupClassName: "grid w-full grid-cols-3 gap-1.5",
    size: "card",
    spacing: 2,
    variant: "studio",
  },
  /** Swatch + label rows (pie fill). */
  swatch: {
    groupClassName: "grid w-full grid-cols-2 gap-2",
    size: "swatch",
    spacing: 2,
    variant: "studio",
  },
  /** 3×2 placement grid — pair with legend BEM classes on items. */
  legend: {
    groupClassName: "legend-position-picker__grid w-full",
    itemClassName: "legend-position-picker__toggle h-11 min-h-11 w-full",
    size: "icon",
    spacing: 0,
    variant: "studio",
  },
};

const StudioTabsLayoutContext = createContext<StudioTabsLayout>("segmented");

export function StudioTabs<T extends string>({
  layout = "segmented",
  value,
  onValueChange,
  className,
  children,
}: {
  layout?: StudioTabsLayout;
  value: T;
  onValueChange: (value: T) => void;
  className?: string;
  children: ReactNode;
}) {
  const config = STUDIO_TABS_LAYOUTS[layout];

  return (
    <StudioTabsLayoutContext.Provider value={layout}>
      <ToggleGroup
        className={cn(config.groupClassName, className)}
        onValueChange={(values) => {
          const next = values.at(-1) ?? values[0];
          if (next != null) {
            onValueChange(next as T);
          }
        }}
        size={config.size}
        spacing={config.spacing}
        value={[value]}
        variant={config.variant}
      >
        {children}
      </ToggleGroup>
    </StudioTabsLayoutContext.Provider>
  );
}

export function StudioTab({
  className,
  children,
  ...props
}: ComponentProps<typeof ToggleGroupItem>) {
  const layout = useContext(StudioTabsLayoutContext);
  const config = STUDIO_TABS_LAYOUTS[layout];

  return (
    <ToggleGroupItem className={cn(config.itemClassName, className)} {...props}>
      {children}
    </ToggleGroupItem>
  );
}

/** @deprecated Use `StudioTabs` with an explicit `layout`. */
export function StudioSingleToggleGroup<T extends string>({
  value,
  onValueChange,
  className,
  spacing = 2,
  variant = "studio",
  size,
  children,
}: {
  value: T;
  onValueChange: (value: T) => void;
  className?: string;
  spacing?: number;
  variant?: VariantProps<typeof toggleVariants>["variant"];
  size?: VariantProps<typeof toggleVariants>["size"];
  children: ReactNode;
}) {
  return (
    <ToggleGroup
      className={cn("w-full", className)}
      onValueChange={(values) => {
        const next = values.at(-1) ?? values[0];
        if (next != null) {
          onValueChange(next as T);
        }
      }}
      size={size}
      spacing={spacing}
      value={[value]}
      variant={variant}
    >
      {children}
    </ToggleGroup>
  );
}
