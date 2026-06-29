"use client";

import { type ReactNode, useId } from "react";
import {
  studioControlRadiusClass,
  studioControlRadiusInnerClass,
} from "@/lib/studio-chrome-classes";
import { cn } from "@/lib/utils";

const SLIDING_THUMB_SPRING =
  "transition-[translate,scale] duration-[350ms] ease-[linear(0,0.3667,0.8271,1.0379,1.0652,1.0332,1.006,0.9961,0.996,0.9984,0.9999,1)] motion-reduce:transition-none";

const SLIDING_THUMB_PRESS =
  "group-has-[label:active]/sliding:scale-[0.92] group-has-[label:active]/sliding:duration-150";

/** 1-column layouts — segmented text, icon row */
const SLIDING_THUMB_TRANSLATES_X = [
  "group-has-[[data-segment-index='0']:checked]/sliding:translate-x-0",
  "group-has-[[data-segment-index='1']:checked]/sliding:translate-x-full",
  "group-has-[[data-segment-index='2']:checked]/sliding:translate-x-[200%]",
  "group-has-[[data-segment-index='3']:checked]/sliding:translate-x-[300%]",
  "group-has-[[data-segment-index='4']:checked]/sliding:translate-x-[400%]",
  "group-has-[[data-segment-index='5']:checked]/sliding:translate-x-[500%]",
  "group-has-[[data-segment-index='6']:checked]/sliding:translate-x-[600%]",
] as const;

/** 2-column grids — cards-2 */
const SLIDING_THUMB_TRANSLATES_2COL = [
  "group-has-[[data-segment-index='0']:checked]/sliding:translate-x-0 group-has-[[data-segment-index='0']:checked]/sliding:translate-y-0",
  "group-has-[[data-segment-index='1']:checked]/sliding:translate-x-full group-has-[[data-segment-index='1']:checked]/sliding:translate-y-0",
  "group-has-[[data-segment-index='2']:checked]/sliding:translate-x-0 group-has-[[data-segment-index='2']:checked]/sliding:translate-y-full",
  "group-has-[[data-segment-index='3']:checked]/sliding:translate-x-full group-has-[[data-segment-index='3']:checked]/sliding:translate-y-full",
  "group-has-[[data-segment-index='4']:checked]/sliding:translate-x-0 group-has-[[data-segment-index='4']:checked]/sliding:translate-y-[200%]",
  "group-has-[[data-segment-index='5']:checked]/sliding:translate-x-full group-has-[[data-segment-index='5']:checked]/sliding:translate-y-[200%]",
  "group-has-[[data-segment-index='6']:checked]/sliding:translate-x-0 group-has-[[data-segment-index='6']:checked]/sliding:translate-y-[300%]",
  "group-has-[[data-segment-index='7']:checked]/sliding:translate-x-full group-has-[[data-segment-index='7']:checked]/sliding:translate-y-[300%]",
] as const;

/** 3-column grids — legend placement */
const SLIDING_THUMB_TRANSLATES_3COL = [
  "group-has-[[data-segment-index='0']:checked]/sliding:translate-x-0 group-has-[[data-segment-index='0']:checked]/sliding:translate-y-0",
  "group-has-[[data-segment-index='1']:checked]/sliding:translate-x-full group-has-[[data-segment-index='1']:checked]/sliding:translate-y-0",
  "group-has-[[data-segment-index='2']:checked]/sliding:translate-x-[200%] group-has-[[data-segment-index='2']:checked]/sliding:translate-y-0",
  "group-has-[[data-segment-index='3']:checked]/sliding:translate-x-0 group-has-[[data-segment-index='3']:checked]/sliding:translate-y-full",
  "group-has-[[data-segment-index='4']:checked]/sliding:translate-x-full group-has-[[data-segment-index='4']:checked]/sliding:translate-y-full",
  "group-has-[[data-segment-index='5']:checked]/sliding:translate-x-[200%] group-has-[[data-segment-index='5']:checked]/sliding:translate-y-full",
  "group-has-[[data-segment-index='6']:checked]/sliding:translate-x-0 group-has-[[data-segment-index='6']:checked]/sliding:translate-y-[200%]",
  "group-has-[[data-segment-index='7']:checked]/sliding:translate-x-full group-has-[[data-segment-index='7']:checked]/sliding:translate-y-[200%]",
  "group-has-[[data-segment-index='8']:checked]/sliding:translate-x-[200%] group-has-[[data-segment-index='8']:checked]/sliding:translate-y-[200%]",
] as const;

type SlidingToggleVariant = "text" | "icon" | "card" | "legend";

const GHOST_FLEX_ROW_SURFACE =
  "relative flex w-full min-w-0 flex-nowrap items-stretch";

const TRACK_SURFACE_CLASS = cn(
  studioControlRadiusClass,
  "bg-input/40 p-0.5 dark:bg-background"
);

const TRACK_THUMB_CLASS = cn(
  studioControlRadiusInnerClass,
  "pointer-events-none absolute top-0.5 bottom-0.5 left-0.5 z-0 bg-accent"
);

const GHOST_THUMB_CLASS = cn(
  studioControlRadiusInnerClass,
  "pointer-events-none absolute top-0 bottom-0 left-0 z-0 bg-accent"
);

const GHOST_GRID_THUMB_CLASS = cn(
  studioControlRadiusInnerClass,
  "pointer-events-none absolute top-0 left-0 z-0 bg-accent"
);

const GHOST_LABEL_CLASS = cn(
  studioControlRadiusInnerClass,
  "relative z-10 flex h-full min-h-0 min-w-0 flex-1 basis-0 cursor-pointer select-none items-center justify-center border-0 bg-transparent text-muted-foreground transition-colors duration-150 ease-out has-[:checked]:text-accent-foreground motion-reduce:transition-none [&_svg]:text-current"
);

const SLIDING_VARIANTS: Record<
  SlidingToggleVariant,
  {
    surfaceClass: string;
    labelClass: string;
    thumbClass: string;
    defaultColumns: (count: number) => number;
    /** Inset padding (px) around the thumb inside the track. `0` = ghost. */
    trackInset: number;
    /** Single-row strips use flex so items never wrap. */
    useFlexRow?: boolean;
  }
> = {
  text: {
    surfaceClass: cn(GHOST_FLEX_ROW_SURFACE, TRACK_SURFACE_CLASS, "h-10"),
    labelClass: cn(GHOST_LABEL_CLASS, "px-2 font-medium text-xs"),
    thumbClass: TRACK_THUMB_CLASS,
    defaultColumns: (count) => count,
    trackInset: 2,
    useFlexRow: true,
  },
  icon: {
    surfaceClass: cn(GHOST_FLEX_ROW_SURFACE, "h-11"),
    labelClass: cn(GHOST_LABEL_CLASS, "px-0"),
    thumbClass: GHOST_THUMB_CLASS,
    defaultColumns: (count) => count,
    trackInset: 0,
    useFlexRow: true,
  },
  card: {
    surfaceClass: "relative grid w-full min-w-0",
    labelClass:
      "relative z-10 flex min-h-[4.25rem] w-full min-w-0 cursor-pointer select-none flex-col items-center justify-center gap-1 rounded-md border-0 bg-transparent px-1.5 py-2 font-normal text-[10px] text-muted-foreground leading-tight transition-colors duration-150 ease-out has-[:checked]:text-accent-foreground [&_svg]:text-current motion-reduce:transition-none",
    thumbClass: GHOST_GRID_THUMB_CLASS,
    defaultColumns: () => 2,
    trackInset: 0,
  },
  legend: {
    surfaceClass: "relative grid w-full min-w-0",
    labelClass:
      "group/legend-item relative z-10 flex h-11 w-full min-w-0 cursor-pointer select-none items-center justify-center rounded-md border-0 bg-transparent text-muted-foreground transition-colors duration-150 ease-out has-[:checked]:text-accent-foreground [&_svg]:text-current motion-reduce:transition-none",
    thumbClass: GHOST_GRID_THUMB_CLASS,
    defaultColumns: () => 3,
    trackInset: 0,
  },
};

interface SlidingToggleOption<T extends string> {
  value: T;
  label: ReactNode;
  "aria-label"?: string;
  title?: string;
}

function getThumbTranslateClasses(columnCount: number, segmentCount: number) {
  const rowCount = Math.ceil(segmentCount / columnCount);
  if (rowCount === 1) {
    return SLIDING_THUMB_TRANSLATES_X.slice(0, segmentCount);
  }
  if (columnCount === 3) {
    return SLIDING_THUMB_TRANSLATES_3COL.slice(0, segmentCount);
  }
  return SLIDING_THUMB_TRANSLATES_2COL.slice(0, segmentCount);
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
  const isGrid = rowCount > 1;
  const trackPadding = config.trackInset * 2;

  return (
    <div
      aria-label={ariaLabel}
      className={cn(
        "group/sliding",
        config.surfaceClass,
        disabled && "pointer-events-none opacity-50",
        className
      )}
      data-segment-count={segmentCount}
      data-slot="sliding-toggle-control"
      role="radiogroup"
      style={
        config.useFlexRow
          ? undefined
          : {
              gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
              ...(isGrid
                ? { gridTemplateRows: `repeat(${rowCount}, auto)` }
                : { gridTemplateRows: "1fr" }),
            }
      }
    >
      <span
        aria-hidden
        className={cn(
          config.thumbClass,
          SLIDING_THUMB_SPRING,
          SLIDING_THUMB_PRESS,
          getThumbTranslateClasses(columnCount, segmentCount)
        )}
        data-slot="sliding-toggle-control-thumb"
        style={{
          width: `calc((100% - ${trackPadding}px) / ${columnCount})`,
          ...(isGrid
            ? { height: `calc((100% - ${trackPadding}px) / ${rowCount})` }
            : null),
        }}
      />

      {options.map((option, index) => (
        <label
          aria-label={option["aria-label"]}
          className={config.labelClass}
          key={option.value}
          title={option.title}
        >
          <input
            checked={value === option.value}
            className="sr-only"
            data-segment-index={index}
            disabled={disabled}
            name={groupName}
            onChange={() => onValueChange(option.value)}
            type="radio"
            value={option.value}
          />
          {option.label}
        </label>
      ))}
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
  SLIDING_THUMB_PRESS,
  SLIDING_THUMB_SPRING,
  SlidingToggleControl,
  type SlidingToggleOption,
  type SlidingToggleVariant,
};
