"use client";

import {
  cloneElement,
  isValidElement,
  type ReactElement,
  useState,
} from "react";
import { cn } from "@/lib/utils";
import { useChartDataOverride } from "../chart-data-override";
import {
  type LegendItemData,
  LegendItemProvider,
  LegendProvider,
} from "./legend-context";

export interface LegendProps {
  /** Legend items data */
  items: LegendItemData[];
  /** Controlled hover state */
  hoveredIndex?: number | null;
  /** Hover state change callback */
  onHoverChange?: (index: number | null) => void;
  /** Title shown above the legend */
  title?: string;
  /** Title class name */
  titleClassName?: string;
  /** Container class name */
  className?: string;
  /** Children - should contain a single LegendItem that will be mapped for each item */
  children: ReactElement;
}

export function Legend({
  items: itemsProp,
  hoveredIndex: controlledHoveredIndex,
  onHoverChange,
  title,
  titleClassName = "text-sm font-semibold",
  className = "",
  children,
}: LegendProps) {
  // Edited alongside the chart in the present dialog (no-op elsewhere); the
  // same array as the chart's `data` is edited as one entry.
  const { items } = useChartDataOverride("Legend", { items: itemsProp });
  const [internalHoveredIndex, setInternalHoveredIndex] = useState<
    number | null
  >(null);

  // Controlled or uncontrolled hover state
  const isControlled = controlledHoveredIndex !== undefined;
  const hoveredIndex = isControlled
    ? controlledHoveredIndex
    : internalHoveredIndex;
  const setHoveredIndex = (index: number | null) => {
    if (isControlled) {
      onHoverChange?.(index);
    } else {
      setInternalHoveredIndex(index);
    }
  };

  const contextValue = {
    items,
    hoveredIndex,
    setHoveredIndex,
  };

  return (
    <LegendProvider value={contextValue}>
      <div
        className={cn("legend-container flex flex-col gap-2", className)}
        data-chart-legend=""
      >
        {title && (
          <h3 className={cn("mb-1 text-legend-foreground", titleClassName)}>
            {title}
          </h3>
        )}
        {items.map((item, index) => {
          const isHovered = hoveredIndex === index;
          const isFaded = hoveredIndex !== null && hoveredIndex !== index;
          const percentage = item.maxValue
            ? (item.value / item.maxValue) * 100
            : 0;

          const itemContext = {
            item,
            index,
            isHovered,
            isFaded,
            percentage,
          };

          // Clone the child element for each item
          if (isValidElement(children)) {
            return (
              <LegendItemProvider key={item.label} value={itemContext}>
                {cloneElement(children)}
              </LegendItemProvider>
            );
          }

          return null;
        })}
      </div>
    </LegendProvider>
  );
}

Legend.displayName = "Legend";
