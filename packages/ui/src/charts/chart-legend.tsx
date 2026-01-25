"use client";

import { Progress } from "@base-ui/react/progress";
import type { ReactNode } from "react";
import { cn } from "../lib/utils";

export interface LegendItem {
  /** Display label */
  label: string;
  /** Current value */
  value: number;
  /** Maximum value (for progress bar calculation) */
  maxValue?: number;
  /** Item color */
  color: string;
}

export interface ChartLegendProps {
  /** Legend items to display */
  items: LegendItem[];
  /** Currently hovered index (for highlight effect) */
  hoveredIndex?: number | null;
  /** Callback when an item is hovered */
  onHover?: (index: number | null) => void;
  /** Show progress bars. Default: false */
  showProgress?: boolean;
  /** Show color marker dot. Default: true */
  showMarker?: boolean;
  /** Show percentage value. Default: true when showProgress is true */
  showPercentage?: boolean;
  /** Format function for displaying values. Default: toLocaleString() */
  formatValue?: (value: number) => string;
  /** Title shown above the legend */
  title?: string;
  /** Additional class name for the container */
  className?: string;
  /** Class name for the title */
  titleClassName?: string;
  /** Class name for each legend item */
  itemClassName?: string;
  /** Class name for the label */
  labelClassName?: string;
  /** Class name for the value */
  valueClassName?: string;
  /** Custom render function for legend items */
  renderItem?: (props: {
    item: LegendItem;
    index: number;
    isHovered: boolean;
    isFaded: boolean;
    percentage: number;
  }) => ReactNode;
}

// Progress bar item using base-ui
interface ProgressItemProps {
  item: LegendItem;
  showMarker: boolean;
  showPercentage: boolean;
  formatValue: (value: number) => string;
  labelClassName: string;
  valueClassName: string;
}

function ProgressItem({
  item,
  showMarker,
  showPercentage,
  formatValue,
  labelClassName,
  valueClassName,
}: ProgressItemProps) {
  const percentage = item.maxValue ? (item.value / item.maxValue) * 100 : 0;

  // Note: item.color must remain inline style as it's dynamic data
  return (
    <Progress.Root
      className="grid w-full grid-cols-[auto_1fr_auto] items-center gap-x-3 gap-y-1"
      max={item.maxValue}
      value={item.value}
    >
      {/* Color marker */}
      {showMarker && (
        <div
          className="h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: item.color }}
        />
      )}

      {/* Label */}
      <Progress.Label className={cn("text-legend-foreground", labelClassName)}>
        {item.label}
      </Progress.Label>

      {/* Value */}
      <span className={cn("text-legend-muted-foreground", valueClassName)}>
        {formatValue(item.value)}
      </span>

      {/* Progress track and indicator */}
      <Progress.Track className="col-span-full h-1.5 overflow-hidden rounded-full bg-legend-track">
        <Progress.Indicator
          className="h-full rounded-full transition-all duration-500"
          style={{ backgroundColor: item.color }}
        />
      </Progress.Track>

      {/* Percentage */}
      {showPercentage && (
        <span className="col-start-3 text-legend-muted-foreground text-xs tabular-nums">
          {percentage.toFixed(0)}%
        </span>
      )}
    </Progress.Root>
  );
}

// Simple item without progress bar
interface SimpleItemProps {
  item: LegendItem;
  showMarker: boolean;
  formatValue: (value: number) => string;
  labelClassName: string;
  valueClassName: string;
}

function SimpleItem({
  item,
  showMarker,
  formatValue,
  labelClassName,
  valueClassName,
}: SimpleItemProps) {
  // Note: item.color must remain inline style as it's dynamic data
  return (
    <div className="flex items-center gap-3">
      {/* Color marker */}
      {showMarker && (
        <div
          className="h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: item.color }}
        />
      )}

      {/* Label */}
      <span className={cn("flex-1 text-legend-foreground", labelClassName)}>
        {item.label}
      </span>

      {/* Value */}
      <span className={cn("text-legend-muted-foreground", valueClassName)}>
        {formatValue(item.value)}
      </span>
    </div>
  );
}

export function ChartLegend({
  items,
  hoveredIndex = null,
  onHover,
  showProgress = false,
  showMarker = true,
  showPercentage,
  formatValue = (v) => v.toLocaleString(),
  title,
  className = "",
  titleClassName = "text-sm font-semibold",
  itemClassName = "",
  labelClassName = "text-sm font-medium",
  valueClassName = "text-sm tabular-nums",
  renderItem,
}: ChartLegendProps) {
  // Default showPercentage to true when showProgress is true
  const displayPercentage = showPercentage ?? showProgress;

  return (
    <div className={cn("legend-container flex flex-col gap-2", className)}>
      {title && (
        <h3 className={cn("mb-1 text-legend-foreground", titleClassName)}>
          {title}
        </h3>
      )}
      {items.map((item, i) => {
        const percentage = item.maxValue
          ? (item.value / item.maxValue) * 100
          : 0;
        const isHovered = hoveredIndex === i;
        const isFaded = hoveredIndex !== null && hoveredIndex !== i;

        // Allow custom rendering
        if (renderItem) {
          return (
            // biome-ignore lint/a11y/noNoninteractiveElementInteractions: Legend item hover interaction
            // biome-ignore lint/a11y/noStaticElementInteractions: Legend item hover interaction
            <div
              data-hovered={isHovered ? "" : undefined}
              key={`legend-${item.label}-${i}`}
              onMouseEnter={() => onHover?.(i)}
              onMouseLeave={() => onHover?.(null)}
            >
              {renderItem({ item, index: i, isHovered, isFaded, percentage })}
            </div>
          );
        }

        return (
          // biome-ignore lint/a11y/noNoninteractiveElementInteractions: Legend item hover interaction
          // biome-ignore lint/a11y/noStaticElementInteractions: Legend item hover interaction
          <div
            className={cn(
              "cursor-pointer rounded-lg px-2 py-1.5 transition-all duration-150 ease-out",
              isHovered && "bg-legend-muted",
              itemClassName
            )}
            data-hovered={isHovered ? "" : undefined}
            key={`legend-${item.label}-${i}`}
            onMouseEnter={() => onHover?.(i)}
            onMouseLeave={() => onHover?.(null)}
          >
            {showProgress && item.maxValue ? (
              <ProgressItem
                formatValue={formatValue}
                item={item}
                labelClassName={labelClassName}
                showMarker={showMarker}
                showPercentage={displayPercentage}
                valueClassName={valueClassName}
              />
            ) : (
              <SimpleItem
                formatValue={formatValue}
                item={item}
                labelClassName={labelClassName}
                showMarker={showMarker}
                valueClassName={valueClassName}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

ChartLegend.displayName = "ChartLegend";

export default ChartLegend;
