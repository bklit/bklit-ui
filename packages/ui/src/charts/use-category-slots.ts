"use client";

import { useMemo } from "react";
import { useChartStable } from "./chart-context";
import { detectDateKey, toValidDate } from "./date-ranges";

export interface CategorySlots {
  /** Per-row date (null when the row has no parseable date). */
  dates: (Date | null)[];
  /** Leading pixel edge of each row's slot, including half the inner padding. */
  slotStart: (index: number) => number;
  /** Full slot size (`bandwidth + inner padding`). */
  step: number;
  /** `"x"` for vertical bars (columns), `"y"` for horizontal bars. */
  axis: "x" | "y";
}

/**
 * Date lookup for band (category) scales — bar charts expose only category
 * labels in context, so read dates from `dateKey` (auto-detected when omitted).
 * Returns `null` on time / linear scales.
 */
export function useCategorySlots(dateKey?: string): CategorySlots | null {
  const { barScale, barXAccessor, data, orientation } = useChartStable();

  return useMemo(() => {
    if (!(barScale && barXAccessor)) {
      return null;
    }
    const key = dateKey ?? detectDateKey(data[0]);
    const dates = data.map((row) => (key ? toValidDate(row[key]) : null));
    const step = barScale.step();
    const gap = step - barScale.bandwidth();
    return {
      dates,
      step,
      axis: orientation === "horizontal" ? "y" : "x",
      slotStart: (index: number) => {
        const row = data[index];
        const start = row ? barScale(barXAccessor(row)) : undefined;
        return (start ?? 0) - gap / 2;
      },
    };
  }, [barScale, barXAccessor, data, orientation, dateKey]);
}
