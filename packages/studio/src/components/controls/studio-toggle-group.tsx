"use client";

import { Icon, type IconName } from "@bklitui/icons";
import { cn } from "@bklitui/ui/lib/utils";
import {
  Children,
  type ComponentProps,
  createContext,
  isValidElement,
  type ReactNode,
  useContext,
} from "react";
import {
  SlidingToggleControl,
  type SlidingToggleOption,
} from "@/ui/segmented-control";
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
  /** Item sizing for the coss `ToggleGroup` grid layouts (`cards-3`, `swatch`). */
  itemClassName?: string;
}

/** Card tile — icon over a short caption. `sm:` repeats override coss toggle responsive sizes. */
const studioToggleCardItemClass =
  "h-auto min-h-0 min-w-0 flex-col gap-1 px-1.5 py-2 font-normal text-[10px] leading-tight sm:h-auto sm:min-w-0 sm:text-[10px]";

/** Swatch row — colour chip + label, left aligned. */
const studioToggleSwatchItemClass =
  "h-9 min-h-9 w-full min-w-0 flex-row justify-start gap-2 px-2.5 font-normal text-xs sm:h-9 sm:min-w-0 sm:text-xs";

export const STUDIO_TOGGLE_LAYOUTS: Record<StudioToggleLayout, LayoutConfig> = {
  segmented: { groupClassName: "" },
  icons: { groupClassName: "" },
  "cards-2": { groupClassName: "" },
  "cards-3": {
    groupClassName: "grid w-full grid-cols-3 gap-1.5",
    itemClassName: studioToggleCardItemClass,
  },
  swatch: {
    groupClassName: "grid w-full grid-cols-2 gap-2",
    itemClassName: studioToggleSwatchItemClass,
  },
  legend: { groupClassName: "" },
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

  if (
    layout === "segmented" ||
    layout === "icons" ||
    layout === "cards-2" ||
    layout === "legend"
  ) {
    const options = collectToggleOptions(children);
    let variant: "text" | "icon" | "card" | "legend" = "card";
    let columns: number | undefined;
    if (layout === "segmented") {
      variant = "text";
    } else if (layout === "icons") {
      variant = "icon";
    } else if (layout === "legend") {
      variant = "legend";
      columns = 3;
    } else if (layout === "cards-2") {
      columns = 2;
    }

    return (
      <StudioToggleLayoutContext.Provider value={layout}>
        <SlidingToggleControl
          className={className}
          columns={columns}
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
        onValueChange={(values) => {
          const next = values.at(-1) ?? values[0];
          if (next != null) {
            onValueChange(next as T);
          }
        }}
        value={[value]}
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
