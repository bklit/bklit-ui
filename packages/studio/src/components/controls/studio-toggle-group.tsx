"use client";

import { Icon, type IconName } from "@bklitui/icons";
import { cn } from "@bklitui/ui/lib/utils";
import type { VariantProps } from "class-variance-authority";
import {
  Children,
  type ComponentProps,
  createContext,
  isValidElement,
  type ReactNode,
  useContext,
} from "react";
import {
  studioJoinedToggleGroupClass,
  studioJoinedToggleGroupItemClass,
} from "@/lib/studio-chrome-classes";
import {
  SlidingToggleControl,
  type SlidingToggleOption,
} from "@/ui/segmented-control";
import type { toggleVariants } from "@/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@/ui/toggle-group";

function collectToggleOptions(
  children: ReactNode
): SlidingToggleOption<string>[] {
  const options: SlidingToggleOption<string>[] = [];

  for (const child of Children.toArray(children)) {
    if (!isValidElement(child)) {
      continue;
    }

    const props = child.props as {
      value?: string;
      children?: ReactNode;
      icon?: IconName;
      label?: string;
      "aria-label"?: string;
      title?: string;
    };

    if (props.value == null) {
      continue;
    }

    options.push({
      value: props.value,
      label: props.icon ? (
        <Icon className="size-5" name={props.icon} />
      ) : (
        props.children
      ),
      "aria-label": props["aria-label"] ?? props.label,
      title: props.title ?? props.label,
    });
  }

  return options;
}

/** Layout presets for shadcn `ToggleGroup` in the Studio sidebar. */
export type StudioToggleLayout =
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
  joined?: boolean;
}

export const STUDIO_TOGGLE_LAYOUTS: Record<StudioToggleLayout, LayoutConfig> = {
  segmented: {
    groupClassName: "",
    size: "segmented",
    spacing: 0,
    variant: "default",
  },
  icons: {
    groupClassName: "",
    size: "icon",
    spacing: 0,
    variant: "default",
  },
  "cards-2": {
    groupClassName: "",
    size: "card",
    spacing: 0,
    variant: "default",
  },
  "cards-3": {
    groupClassName: "grid w-full grid-cols-3 gap-1.5",
    size: "card",
    spacing: 2,
    variant: "outline",
  },
  swatch: {
    groupClassName: "grid w-full grid-cols-2 gap-2",
    size: "swatch",
    spacing: 2,
    variant: "outline",
  },
  legend: {
    groupClassName: cn(
      studioJoinedToggleGroupClass,
      "!grid relative z-1 grid-cols-3 grid-rows-2"
    ),
    itemClassName: cn(studioJoinedToggleGroupItemClass, "h-11 min-h-11 w-full"),
    size: "icon",
    spacing: 0,
    variant: "default",
    joined: true,
  },
};

const StudioToggleLayoutContext =
  createContext<StudioToggleLayout>("segmented");

/**
 * Single-select option set — shadcn `ToggleGroup` with Studio layout presets.
 */
export function StudioToggleGroup<T extends string>({
  layout = "segmented",
  value,
  onValueChange,
  className,
  children,
}: {
  layout?: StudioToggleLayout;
  value: T;
  onValueChange: (value: T) => void;
  className?: string;
  children: ReactNode;
}) {
  const config = STUDIO_TOGGLE_LAYOUTS[layout];

  if (layout === "segmented" || layout === "icons" || layout === "cards-2") {
    const options = collectToggleOptions(children);
    let variant: "text" | "icon" | "card" = "card";
    if (layout === "segmented") {
      variant = "text";
    } else if (layout === "icons") {
      variant = "icon";
    }

    return (
      <StudioToggleLayoutContext.Provider value={layout}>
        <SlidingToggleControl
          className={className}
          columns={layout === "cards-2" ? 2 : undefined}
          onValueChange={onValueChange}
          options={options as SlidingToggleOption<T>[]}
          value={value}
          variant={variant}
        />
      </StudioToggleLayoutContext.Provider>
    );
  }

  return (
    <StudioToggleLayoutContext.Provider value={layout}>
      <ToggleGroup
        className={cn(config.groupClassName, className)}
        data-joined={config.joined ? "" : undefined}
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
    </StudioToggleLayoutContext.Provider>
  );
}

export function StudioToggleGroupItem({
  className,
  children,
  ...props
}: ComponentProps<typeof ToggleGroupItem>) {
  const layout = useContext(StudioToggleLayoutContext);
  const config = STUDIO_TOGGLE_LAYOUTS[layout];

  return (
    <ToggleGroupItem className={cn(config.itemClassName, className)} {...props}>
      {children}
    </ToggleGroupItem>
  );
}

/** @deprecated Use `StudioToggleGroup`. */
export const StudioTabs = StudioToggleGroup;

/** @deprecated Use `StudioToggleGroupItem`. */
export const StudioTab = StudioToggleGroupItem;

/** @deprecated Use `StudioToggleLayout`. */
export type StudioTabsLayout = StudioToggleLayout;

/** @deprecated Use `STUDIO_TOGGLE_LAYOUTS`. */
export const STUDIO_TABS_LAYOUTS = STUDIO_TOGGLE_LAYOUTS;
