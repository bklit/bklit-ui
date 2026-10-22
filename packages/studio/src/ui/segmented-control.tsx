"use client";

import {
  type CSSProperties,
  type ReactNode,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  studioControlRadiusClass,
  studioControlRadiusInnerClass,
} from "@/lib/studio-chrome-classes";
import { cn } from "@/lib/utils";

/**
 * Sliding segmented control modelled on coss ui `SegmentedControl`
 * (https://coss.com/ui/docs/components/segmented-control): the indicator
 * measures the active item and slides to it (200ms ease-in-out, width/height
 * + translate via CSS custom properties). Native radio inputs supply the
 * semantics + arrow-key behaviour; the active label carries `data-checked`
 * so it can paint a static pill until the indicator has measured.
 */

/** Indicator motion — coss `segmented-control-indicator`. */
const INDICATOR_TRANSITION_CLASS =
  "transition-[width,height,translate] duration-200 ease-in-out motion-reduce:transition-none";

const INDICATOR_POSITION_CLASS =
  "pointer-events-none absolute top-0 left-0 z-0 h-(--active-item-height) w-(--active-item-width) translate-x-(--active-item-left) translate-y-(--active-item-top)";

/** While the indicator is visible, the static checked pill on items is suppressed. */
const HIDE_STATIC_PILL_CLASS =
  "[:has(>[data-slot=sliding-toggle-control-indicator]:not([hidden]))>&]:bg-transparent! [:has(>[data-slot=sliding-toggle-control-indicator]:not([hidden]))>&]:shadow-none!";

type SlidingToggleVariant = "text" | "icon" | "card" | "legend";

/** Shared item chrome — coss item colours, focus outline, and disabled state. */
const ITEM_BASE_CLASS = cn(
  studioControlRadiusInnerClass,
  "relative z-10 flex min-w-0 cursor-pointer select-none items-center justify-center border border-transparent bg-transparent text-muted-foreground outline-2 outline-transparent -outline-offset-1 transition-[color,outline-color] duration-150 ease-out has-focus-visible:outline-ring motion-reduce:transition-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:text-current",
  HIDE_STATIC_PILL_CLASS
);

/** Raised pill on the muted track — coss `segmentedControlIndicatorSurfaceClassName`. */
const TRACK_PILL_SURFACE_CLASS = cn(
  studioControlRadiusInnerClass,
  "bg-background shadow-sm/5 dark:bg-input"
);

/** Ghost pill (no track) for icon / card / legend layouts. */
const GHOST_PILL_SURFACE_CLASS = cn(studioControlRadiusInnerClass, "bg-accent");

const SLIDING_VARIANTS: Record<
  SlidingToggleVariant,
  {
    surfaceClass: string;
    itemClass: string;
    indicatorSurfaceClass: string;
    defaultColumns: (count: number) => number;
    /** Single-row strips use flex so items never wrap. */
    useFlexRow?: boolean;
  }
> = {
  text: {
    surfaceClass: cn(
      studioControlRadiusClass,
      "relative z-0 flex h-10 w-full min-w-0 flex-nowrap items-stretch gap-0.5 bg-muted p-0.5"
    ),
    itemClass: cn(
      ITEM_BASE_CLASS,
      "h-full flex-1 basis-0 whitespace-nowrap px-2 font-medium text-muted-foreground/72 text-xs hover:text-muted-foreground data-checked:bg-background data-checked:text-foreground data-checked:shadow-sm/5 dark:data-checked:bg-input"
    ),
    indicatorSurfaceClass: TRACK_PILL_SURFACE_CLASS,
    defaultColumns: (count) => count,
    useFlexRow: true,
  },
  icon: {
    surfaceClass:
      "relative z-0 flex h-11 w-full min-w-0 flex-nowrap items-stretch",
    itemClass: cn(
      ITEM_BASE_CLASS,
      "h-full flex-1 basis-0 px-0 hover:text-accent-foreground/80 data-checked:bg-accent data-checked:text-accent-foreground"
    ),
    indicatorSurfaceClass: GHOST_PILL_SURFACE_CLASS,
    defaultColumns: (count) => count,
    useFlexRow: true,
  },
  card: {
    surfaceClass: "relative z-0 grid w-full min-w-0",
    itemClass: cn(
      ITEM_BASE_CLASS,
      "min-h-[4.25rem] w-full flex-col gap-1 px-1.5 py-2 font-normal text-[10px] leading-tight hover:text-accent-foreground/80 data-checked:bg-accent data-checked:text-accent-foreground"
    ),
    indicatorSurfaceClass: GHOST_PILL_SURFACE_CLASS,
    defaultColumns: () => 2,
  },
  legend: {
    surfaceClass: "relative z-0 grid w-full min-w-0",
    itemClass: cn(
      ITEM_BASE_CLASS,
      "group/legend-item h-11 w-full hover:text-accent-foreground/80 data-checked:bg-accent data-checked:text-accent-foreground"
    ),
    indicatorSurfaceClass: GHOST_PILL_SURFACE_CLASS,
    defaultColumns: () => 3,
  },
};

interface SlidingToggleOption<T extends string> {
  value: T;
  label: ReactNode;
  "aria-label"?: string;
  title?: string;
}

const ACTIVE_ITEM_SELECTOR = ":scope > [data-checked]";
const MAX_LAYOUT_ROUNDING_ERROR = 2;

interface ActiveItemRect {
  height: number;
  left: number;
  top: number;
  width: number;
}

function isSameRect(a: ActiveItemRect | null, b: ActiveItemRect | null) {
  return (
    a?.left === b?.left &&
    a?.top === b?.top &&
    a?.width === b?.width &&
    a?.height === b?.height
  );
}

/** Layout size, falling back to offset size when CSS size is unreliable. */
function getCssSize(element: HTMLElement) {
  const style = getComputedStyle(element);
  const width = Number.parseFloat(style.width) || 0;
  const height = Number.parseFloat(style.height) || 0;
  if (
    Math.round(width) !== element.offsetWidth ||
    Math.round(height) !== element.offsetHeight
  ) {
    return { height: element.offsetHeight, width: element.offsetWidth };
  }
  return { height, width };
}

/** Item rect relative to the root padding box, robust to ancestor transforms. */
function measureItem(item: HTMLElement, root: HTMLElement): ActiveItemRect {
  const { width, height } = getCssSize(item);
  const rootSize = getCssSize(root);
  const itemRect = item.getBoundingClientRect();
  const rootRect = root.getBoundingClientRect();
  const scaleX = rootSize.width > 0 ? rootRect.width / rootSize.width : 1;
  const scaleY = rootSize.height > 0 ? rootRect.height / rootSize.height : 1;

  const rectLeft =
    (itemRect.left - rootRect.left) / scaleX -
    root.clientLeft +
    root.scrollLeft;
  const rectTop =
    (itemRect.top - rootRect.top) / scaleY - root.clientTop + root.scrollTop;

  const isUndistorted =
    Math.abs(rectLeft - item.offsetLeft) <= MAX_LAYOUT_ROUNDING_ERROR &&
    Math.abs(rectTop - item.offsetTop) <= MAX_LAYOUT_ROUNDING_ERROR;

  return {
    height,
    left: isUndistorted ? rectLeft : item.offsetLeft,
    top: isUndistorted ? rectTop : item.offsetTop,
    width,
  };
}

/**
 * Measures the `[data-checked]` sibling and slides to it. Re-renders only when
 * the active rect changes (selection, resize) — never per frame; the motion
 * itself is a CSS transition.
 */
function SlidingToggleIndicator({ className }: { className: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [rect, setRect] = useState<ActiveItemRect | null>(null);

  useLayoutEffect(() => {
    const root = ref.current?.parentElement;
    if (!root) {
      return;
    }

    const update = () => {
      const item = root.querySelector<HTMLElement>(ACTIVE_ITEM_SELECTOR);
      const next = item ? measureItem(item, root) : null;
      setRect((previous) => (isSameRect(previous, next) ? previous : next));
    };

    const resizeObserver = new ResizeObserver(update);
    const observeItems = () => {
      resizeObserver.disconnect();
      resizeObserver.observe(root);
      for (const child of root.children) {
        resizeObserver.observe(child);
        mutationObserver.observe(child, {
          attributeFilter: ["data-checked"],
          attributes: true,
        });
      }
    };
    const mutationObserver = new MutationObserver((records) => {
      if (records.some((record) => record.type === "childList")) {
        observeItems();
      }
      update();
    });

    update();
    mutationObserver.observe(root, { childList: true });
    observeItems();

    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  return (
    <span
      aria-hidden="true"
      className={cn(
        INDICATOR_POSITION_CLASS,
        INDICATOR_TRANSITION_CLASS,
        className
      )}
      data-slot="sliding-toggle-control-indicator"
      hidden={!rect}
      ref={ref}
      style={
        {
          "--active-item-height": `${rect?.height ?? 0}px`,
          "--active-item-left": `${rect?.left ?? 0}px`,
          "--active-item-top": `${rect?.top ?? 0}px`,
          "--active-item-width": `${rect?.width ?? 0}px`,
        } as CSSProperties
      }
    />
  );
}

function SlidingToggleControl<T extends string>({
  value,
  onValueChange,
  options,
  variant = "text",
  columns,
  name,
  disabled = false,
  className,
  "aria-label": ariaLabel,
}: {
  value: T;
  onValueChange: (value: T) => void;
  options: SlidingToggleOption<T>[];
  variant?: SlidingToggleVariant;
  columns?: number;
  name?: string;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
}) {
  const autoId = useId();
  const groupName = name ?? `sliding-toggle-${autoId}`;
  const segmentCount = options.length;
  const config = SLIDING_VARIANTS[variant];
  const columnCount = columns ?? config.defaultColumns(segmentCount);
  const rowCount = Math.ceil(segmentCount / columnCount);

  return (
    <div
      aria-disabled={disabled || undefined}
      aria-label={ariaLabel}
      className={cn(
        config.surfaceClass,
        disabled && "pointer-events-none opacity-64",
        className
      )}
      data-segment-count={segmentCount}
      data-slot="sliding-toggle-control"
      data-variant={variant}
      role="radiogroup"
      style={
        config.useFlexRow
          ? undefined
          : {
              gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
              gridTemplateRows:
                rowCount > 1 ? `repeat(${rowCount}, auto)` : "1fr",
            }
      }
    >
      {options.map((option) => {
        const checked = value === option.value;
        return (
          <label
            aria-label={option["aria-label"]}
            className={config.itemClass}
            data-checked={checked ? "" : undefined}
            data-slot="sliding-toggle-control-item"
            key={option.value}
            title={option.title}
          >
            <input
              checked={checked}
              className="sr-only"
              disabled={disabled}
              name={groupName}
              onChange={() => onValueChange(option.value)}
              type="radio"
              value={option.value}
            />
            {option.label}
          </label>
        );
      })}
      <SlidingToggleIndicator className={config.indicatorSurfaceClass} />
    </div>
  );
}

/** @deprecated Use `SlidingToggleControl` with `variant="text"`. */
function SegmentedControl<T extends string>(
  props: Omit<
    Parameters<typeof SlidingToggleControl<T>>[0],
    "variant" | "columns"
  >
) {
  return <SlidingToggleControl {...props} variant="text" />;
}

export {
  SegmentedControl,
  SlidingToggleControl,
  type SlidingToggleOption,
  type SlidingToggleVariant,
};
