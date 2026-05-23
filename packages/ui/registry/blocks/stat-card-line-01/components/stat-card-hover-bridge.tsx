"use client";

import { useEffect } from "react";
import { useChart } from "@/components/charts";
import type { StatCardHoverState } from "./stat-card-stat-styles";

export type { StatCardHoverState } from "./stat-card-stat-styles";

export function formatStatCardMonth(date: Date) {
  return date.toLocaleDateString("en-US", { month: "short" });
}

export function formatStatCardWeekday(date: Date) {
  return date.toLocaleDateString("en-US", { weekday: "long" });
}

function parsePointDate(raw: unknown): Date | null {
  if (raw instanceof Date) {
    return raw;
  }
  if (typeof raw === "string") {
    return new Date(raw);
  }
  return null;
}

function computePeriodTrend(
  data: Record<string, unknown>[],
  index: number,
  dataKey: string
): number | null {
  if (index <= 0) {
    return null;
  }

  const current = data[index]?.[dataKey];
  const previous = data[index - 1]?.[dataKey];

  if (
    typeof current !== "number" ||
    typeof previous !== "number" ||
    previous === 0
  ) {
    return null;
  }

  return ((current - previous) / previous) * 100;
}

/** Syncs hovered chart values, labels, and trend into stat card UI. */
export function StatCardHoverBridge({
  dataKey,
  dateKey = "date",
  formatLabel,
  onHoverChange,
}: {
  dataKey: string;
  dateKey?: string;
  formatLabel: (date: Date) => string;
  onHoverChange: (state: StatCardHoverState) => void;
}) {
  const { data, tooltipData } = useChart();

  useEffect(() => {
    if (!tooltipData?.point) {
      onHoverChange({ value: null, label: null, trend: null });
      return;
    }

    const raw = tooltipData.point[dataKey];
    const value = typeof raw === "number" ? raw : null;
    const date = parsePointDate(tooltipData.point[dateKey]);
    const label = date ? formatLabel(date) : null;
    const trend = computePeriodTrend(data, tooltipData.index, dataKey);

    onHoverChange({ value, label, trend });
  }, [data, dataKey, dateKey, formatLabel, onHoverChange, tooltipData]);

  return null;
}
