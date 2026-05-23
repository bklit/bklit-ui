"use client";

import { useState } from "react";
import type { ChoroplethFeature } from "@/components/charts";
import {
  ChartStatFlow,
  ChoroplethChart,
  ChoroplethFeatureComponent,
  ChoroplethTooltip,
} from "@/components/charts";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useWorldDataStandalone } from "@/lib/use-world-data";
import {
  getVisitorColor,
  getVisitorValue,
  visitorStats,
} from "../data/visitors";
import {
  StatCardChart,
  type StatCardHoverState,
  statCardLabelClassName,
  statCardValueClassName,
} from "./stat-card-chart";
import { StatCardChoroplethHoverBridge } from "./stat-card-choropleth-hover-bridge";
import { TrendBadge } from "./trend-badge";

export function StatCardChoropleth() {
  const { worldData, isLoading } = useWorldDataStandalone();
  const [hover, setHover] = useState<StatCardHoverState>({
    value: null,
    label: null,
    trend: null,
  });
  const displayValue = hover.value ?? visitorStats.total;
  const displayLabel = hover.label ?? "Total";
  const displayTrend = hover.trend ?? visitorStats.trend;

  return (
    <Card className="relative w-full gap-0 overflow-hidden py-0">
      <CardHeader className="pointer-events-none absolute inset-x-0 top-0 z-10 grid auto-rows-min grid-cols-[1fr_auto] items-start gap-1 border-0 bg-gradient-to-b from-45% from-card to-transparent px-4 py-3 pb-10 shadow-none ring-0">
        <div className="flex flex-col gap-0.5">
          <CardTitle>Unique Visitors</CardTitle>
          <ChartStatFlow
            label={displayLabel}
            labelClassName={statCardLabelClassName}
            value={displayValue}
            valueClassName={statCardValueClassName}
          />
        </div>
        <CardAction>
          <TrendBadge value={displayTrend} />
        </CardAction>
      </CardHeader>

      <CardContent className="p-0">
        {isLoading || !worldData ? (
          <StatCardChart className="mx-0 mb-0 min-h-[420px]" size="lg">
            <div className="flex h-full min-h-[420px] items-center justify-center text-muted-foreground text-xs">
              Loading map…
            </div>
          </StatCardChart>
        ) : (
          <StatCardChart className="mx-0 mb-0 min-h-[420px]" size="lg">
            <ChoroplethChart
              aspectRatio="2.5 / 1"
              className="min-h-[420px] w-full"
              data={worldData}
            >
              <StatCardChoroplethHoverBridge onHoverChange={setHover} />
              <ChoroplethFeatureComponent
                getFeatureColor={(feature: ChoroplethFeature) =>
                  getVisitorColor(feature)
                }
              />
              <ChoroplethTooltip
                getFeatureValue={getVisitorValue}
                valueLabel="Visitors"
              />
            </ChoroplethChart>
          </StatCardChart>
        )}
      </CardContent>
    </Card>
  );
}
