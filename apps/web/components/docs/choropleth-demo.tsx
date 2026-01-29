"use client";

import type { ChoroplethFeature } from "@bklitui/ui/charts";
import {
  ChoroplethChart,
  ChoroplethFeatureComponent,
  ChoroplethTooltip,
} from "@bklitui/ui/charts";
import { useWorldDataStandalone } from "./use-world-data";

export function ChoroplethDemo() {
  const { worldData, isLoading } = useWorldDataStandalone();

  if (isLoading) {
    return (
      <div className="flex h-full min-h-[300px] items-center justify-center">
        <div className="animate-pulse text-muted-foreground">
          Loading map data...
        </div>
      </div>
    );
  }

  if (!worldData) {
    return (
      <div className="flex h-full min-h-[300px] items-center justify-center">
        <div className="text-destructive">Failed to load map data</div>
      </div>
    );
  }

  return (
    <ChoroplethChart aspectRatio="16 / 9" data={worldData}>
      <ChoroplethFeatureComponent fill="var(--chart-1)" />
      <ChoroplethTooltip />
    </ChoroplethChart>
  );
}

// Sample web analytics data - visitors by country
const visitorsByCountry: Record<string, number> = {
  "United States": 125_000,
  "United Kingdom": 45_000,
  Germany: 38_000,
  France: 32_000,
  Canada: 28_000,
  Australia: 22_000,
  Netherlands: 18_000,
  Brazil: 15_000,
  India: 14_000,
  Japan: 12_000,
  Spain: 11_000,
  Italy: 10_000,
  Mexico: 9000,
  Poland: 8000,
  Sweden: 7500,
  Belgium: 6500,
  Switzerland: 6000,
  Austria: 5500,
  Norway: 5000,
  Denmark: 4500,
  Ireland: 4000,
  Portugal: 3500,
  "New Zealand": 3000,
  Finland: 2500,
  "Czech Republic": 2000,
};

// Get the max visitors for scaling
const maxVisitors = Math.max(...Object.values(visitorsByCountry));

// Color scale: more visitors = brighter (chart-1), fewer = darker (chart-5)
function getVisitorColor(feature: ChoroplethFeature): string {
  const name = feature.properties?.name as string;
  const visitors = visitorsByCountry[name];

  if (!visitors) {
    return "var(--chart-5)"; // No data = darkest
  }

  // Normalize to 0-1 scale
  const normalized = visitors / maxVisitors;

  // Map to chart colors (1 = brightest, 5 = darkest)
  if (normalized > 0.7) {
    return "var(--chart-1)";
  }
  if (normalized > 0.4) {
    return "var(--chart-2)";
  }
  if (normalized > 0.2) {
    return "var(--chart-3)";
  }
  if (normalized > 0.05) {
    return "var(--chart-4)";
  }
  return "var(--chart-5)";
}

function getVisitorValue(feature: ChoroplethFeature): number | undefined {
  const name = feature.properties?.name as string;
  return visitorsByCountry[name];
}

export function ChoroplethAnalyticsDemo() {
  const { worldData, isLoading } = useWorldDataStandalone();

  if (isLoading) {
    return (
      <div className="flex h-full min-h-[300px] items-center justify-center">
        <div className="animate-pulse text-muted-foreground">
          Loading map data...
        </div>
      </div>
    );
  }

  if (!worldData) {
    return (
      <div className="flex h-full min-h-[300px] items-center justify-center">
        <div className="text-destructive">Failed to load map data</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <ChoroplethChart aspectRatio="16 / 9" data={worldData}>
        <ChoroplethFeatureComponent getFeatureColor={getVisitorColor} />
        <ChoroplethTooltip
          getFeatureValue={getVisitorValue}
          valueLabel="Visitors"
        />
      </ChoroplethChart>
      {/* Legend */}
      <div className="flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="size-3 rounded-sm bg-[var(--chart-1)]" />
          <span className="text-muted-foreground">High traffic</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="size-3 rounded-sm bg-[var(--chart-3)]" />
          <span className="text-muted-foreground">Medium</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="size-3 rounded-sm bg-[var(--chart-5)]" />
          <span className="text-muted-foreground">Low / No data</span>
        </div>
      </div>
    </div>
  );
}
