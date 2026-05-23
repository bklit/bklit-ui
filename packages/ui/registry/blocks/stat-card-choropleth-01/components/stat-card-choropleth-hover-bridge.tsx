"use client";

import { useChoropleth } from "@/components/charts";
import { useEffect } from "react";
import { computeVisitorTrend, getVisitorValue } from "../data/visitors";
import type { StatCardHoverState } from "./stat-card-stat-styles";

/** Syncs hovered choropleth feature into stat card NumberFlow and trend badge. */
export function StatCardChoroplethHoverBridge({
  onHoverChange,
}: {
  onHoverChange: (state: StatCardHoverState) => void;
}) {
  const { tooltipData } = useChoropleth();

  useEffect(() => {
    if (!tooltipData?.feature) {
      onHoverChange({ value: null, label: null, trend: null });
      return;
    }

    const feature = tooltipData.feature;
    const label = (feature.properties?.name as string | undefined) ?? "Unknown";
    const visitors = getVisitorValue(feature);
    const value = visitors ?? 0;
    const trend = visitors === undefined ? null : computeVisitorTrend(visitors);

    onHoverChange({ value, label, trend });
  }, [onHoverChange, tooltipData]);

  return null;
}
