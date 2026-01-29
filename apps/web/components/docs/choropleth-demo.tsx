"use client";

import type { ChoroplethFeature } from "@bklitui/ui/charts";
import {
  ChoroplethChart,
  ChoroplethFeatureComponent,
  ChoroplethTooltip,
  useChoroplethZoom,
} from "@bklitui/ui/charts";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWorldDataStandalone } from "./use-world-data";

function PreviewZoomControls() {
  const { zoom } = useChoroplethZoom();

  if (!zoom) {
    return null;
  }

  return (
    <div className="absolute right-4 bottom-4 flex flex-col gap-1">
      <Button
        className="size-10 rounded-lg shadow-md"
        onClick={() => zoom.scale({ scaleX: 1.2, scaleY: 1.2 })}
        size="icon"
        variant="secondary"
      >
        <Plus className="size-5" />
      </Button>
      <Button
        className="size-10 rounded-lg shadow-md"
        onClick={() => zoom.scale({ scaleX: 0.8, scaleY: 0.8 })}
        size="icon"
        variant="secondary"
      >
        <Minus className="size-5" />
      </Button>
    </div>
  );
}

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
    <ChoroplethChart aspectRatio="16 / 9" data={worldData} zoomEnabled>
      <ChoroplethFeatureComponent fill="var(--chart-3)" />
      <ChoroplethTooltip />
      <PreviewZoomControls />
    </ChoroplethChart>
  );
}

// Sample web analytics data - unique visitors by country (smaller numbers for realistic demo)
const visitorsByCountry: Record<string, number> = {
  "United States": 18,
  "United Kingdom": 12,
  Germany: 17,
  France: 9,
  Canada: 8,
  Australia: 6,
  Netherlands: 5,
  Brazil: 7,
  India: 11,
  Japan: 4,
  Spain: 3,
  Italy: 6,
  Mexico: 5,
  Poland: 4,
  Sweden: 3,
  Belgium: 2,
  Switzerland: 2,
  Austria: 1,
  Norway: 2,
  Denmark: 1,
  Ireland: 3,
  Portugal: 2,
  "New Zealand": 1,
  Finland: 1,
  "South Africa": 4,
  Argentina: 3,
  Indonesia: 2,
  Philippines: 3,
  Thailand: 2,
  Vietnam: 1,
};

// Color scale based on visitor count ranges
function getVisitorColor(feature: ChoroplethFeature): string {
  const name = feature.properties?.name as string;
  const visitors = visitorsByCountry[name];

  if (!visitors) {
    return "var(--muted)"; // No data = muted gray
  }

  // Map to chart colors based on ranges (brighter = more visitors)
  if (visitors >= 17) {
    return "var(--chart-1)"; // 17+
  }
  if (visitors >= 13) {
    return "var(--chart-2)"; // 13-16
  }
  if (visitors >= 9) {
    return "var(--chart-3)"; // 9-12
  }
  if (visitors >= 5) {
    return "var(--chart-4)"; // 5-8
  }
  return "var(--chart-5)"; // 1-4
}

function getVisitorValue(feature: ChoroplethFeature): number | undefined {
  const name = feature.properties?.name as string;
  return visitorsByCountry[name];
}

// Legend items matching the color scale
const legendItems = [
  { color: "var(--muted)", label: "No data" },
  { color: "var(--chart-5)", label: "1-4" },
  { color: "var(--chart-4)", label: "5-8" },
  { color: "var(--chart-3)", label: "9-12" },
  { color: "var(--chart-2)", label: "13-16" },
  { color: "var(--chart-1)", label: "17+" },
];

function AnalyticsZoomControls() {
  const { zoom } = useChoroplethZoom();

  if (!zoom) {
    return null;
  }

  return (
    <div className="absolute right-4 bottom-4 flex flex-col gap-1">
      <Button
        className="size-10 rounded-lg shadow-md"
        onClick={() => zoom.scale({ scaleX: 1.2, scaleY: 1.2 })}
        size="icon"
        variant="secondary"
      >
        <Plus className="size-5" />
      </Button>
      <Button
        className="size-10 rounded-lg shadow-md"
        onClick={() => zoom.scale({ scaleX: 0.8, scaleY: 0.8 })}
        size="icon"
        variant="secondary"
      >
        <Minus className="size-5" />
      </Button>
    </div>
  );
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
    <ChoroplethChart aspectRatio="16 / 9" data={worldData} zoomEnabled>
      <ChoroplethFeatureComponent getFeatureColor={getVisitorColor} />
      <ChoroplethTooltip
        getFeatureValue={getVisitorValue}
        valueLabel="Unique Visitors"
      />
      <AnalyticsZoomControls />
      {/* Legend */}
      <div className="absolute bottom-4 left-4 flex flex-col gap-1.5 rounded-lg bg-card/90 p-3 text-xs backdrop-blur-sm">
        <span className="font-medium text-muted-foreground">
          Unique Visitors
        </span>
        {legendItems.map((item) => (
          <div className="flex items-center gap-2" key={item.label}>
            <div
              className="size-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-foreground">{item.label}</span>
          </div>
        ))}
      </div>
    </ChoroplethChart>
  );
}
