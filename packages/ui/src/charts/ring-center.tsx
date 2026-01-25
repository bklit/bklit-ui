"use client";

import NumberFlow from "@number-flow/react";
import { motion } from "motion/react";
import type { ReactNode } from "react";
import { cn } from "../lib/utils";
import { useRing } from "./ring-context";

// NumberFlow format - subset of Intl.NumberFormatOptions
interface NumberFlowFormat {
  notation?: "standard" | "compact";
  compactDisplay?: "short" | "long";
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  minimumIntegerDigits?: number;
  minimumSignificantDigits?: number;
  maximumSignificantDigits?: number;
  style?: "decimal" | "percent" | "currency";
  currency?: string;
  currencyDisplay?: "symbol" | "narrowSymbol" | "code" | "name";
  unit?: string;
  unitDisplay?: "short" | "long" | "narrow";
}

export interface RingCenterProps {
  /** Label shown below the value. Default: "Total" when not hovering */
  defaultLabel?: string;
  /** Format options for NumberFlow. Default: standard notation */
  formatOptions?: NumberFlowFormat;
  /** Custom render function for complete control over center content */
  children?: (props: {
    value: number;
    label: string;
    isHovered: boolean;
    data: { label: string; value: number; maxValue: number; color?: string };
  }) => ReactNode;
  /** Additional class name for the container */
  className?: string;
  /** Class name for the value text. Default: "text-2xl font-bold" */
  valueClassName?: string;
  /** Class name for the label text. Default: "text-xs" */
  labelClassName?: string;
  /** Prefix to show before the number (e.g., "$") */
  prefix?: string;
  /** Suffix to show after the number (e.g., "%") */
  suffix?: string;
}

// Default format options
const defaultFormatOptions: NumberFlowFormat = {
  notation: "standard",
  maximumFractionDigits: 0,
};

export function RingCenter({
  defaultLabel = "Total",
  formatOptions = defaultFormatOptions,
  children,
  className = "",
  valueClassName = "text-2xl font-bold",
  labelClassName = "text-xs",
  prefix,
  suffix,
}: RingCenterProps) {
  const { data, hoveredIndex, totalValue, animationKey, baseInnerRadius } =
    useRing();

  const hoveredData = hoveredIndex !== null ? data[hoveredIndex] : null;
  const displayValue = hoveredData ? hoveredData.value : totalValue;
  const displayLabel = hoveredData ? hoveredData.label : defaultLabel;
  const isHovered = hoveredIndex !== null;

  // Calculate center area size based on scaled baseInnerRadius
  // Leave some padding so text doesn't touch the inner ring
  const centerSize = baseInnerRadius * 2 - 16;

  // If custom render function is provided, use it
  if (children && hoveredData) {
    return (
      <foreignObject
        height={centerSize}
        style={{ pointerEvents: "none" }}
        width={centerSize}
        x={-centerSize / 2}
        y={-centerSize / 2}
      >
        <div
          className={cn(
            "flex h-full w-full items-center justify-center",
            className
          )}
        >
          {children({
            value: displayValue,
            label: displayLabel,
            isHovered,
            data: hoveredData,
          })}
        </div>
      </foreignObject>
    );
  }

  // Default center content with NumberFlow animations
  return (
    <foreignObject
      height={centerSize}
      style={{ pointerEvents: "none" }}
      width={centerSize}
      x={-centerSize / 2}
      y={-centerSize / 2}
    >
      <div
        className={cn(
          "flex h-full w-full flex-col items-center justify-center",
          className
        )}
      >
        <span className={cn("text-foreground tabular-nums", valueClassName)}>
          <NumberFlow
            format={formatOptions}
            prefix={prefix}
            suffix={suffix}
            value={displayValue}
            willChange
          />
        </span>
        <motion.span
          animate={{ opacity: 1 }}
          className={cn("mt-0.5 text-chart-label", labelClassName)}
          initial={{ opacity: 0 }}
          key={`label-${displayLabel}-${animationKey}`}
          transition={{ delay: 0.4 }}
        >
          {displayLabel}
        </motion.span>
      </div>
    </foreignObject>
  );
}

RingCenter.displayName = "RingCenter";

export default RingCenter;
