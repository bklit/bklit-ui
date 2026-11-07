"use client";

import type { ChoroplethFeature } from "@bklitui/ui/charts";
import {
  ChoroplethChart,
  ChoroplethFeatureComponent,
  ChoroplethTooltip,
  PatternPreset,
} from "@bklitui/ui/charts";
import { useWorldDataStandalone } from "./use-world-data";

// Categories based on first letter of country name (just for demo purposes)
function getRegionCategory(
  name: string
): "americas" | "europe" | "asia" | "africa" | "oceania" {
  const firstLetter = name.charAt(0).toUpperCase();
  if ("ABCD".includes(firstLetter)) {
    return "americas";
  }
  if ("EFGH".includes(firstLetter)) {
    return "europe";
  }
  if ("IJKLM".includes(firstLetter)) {
    return "asia";
  }
  if ("NOPQR".includes(firstLetter)) {
    return "africa";
  }
  return "oceania";
}

// Diagonal lines pattern demo
const linesPatterns = (
  <>
    <PatternPreset
      color="var(--chart-1)"
      id="pattern-americas"
      preset="diagonal-up"
      strokeWidth={1.5}
    />
    <PatternPreset
      color="var(--chart-2)"
      id="pattern-europe"
      preset="diagonal-up"
      strokeWidth={1.5}
    />
    <PatternPreset
      color="var(--chart-3)"
      id="pattern-asia"
      preset="diagonal-up"
      strokeWidth={1.5}
    />
    <PatternPreset
      color="var(--chart-4)"
      id="pattern-africa"
      preset="diagonal-up"
      strokeWidth={1.5}
    />
    <PatternPreset
      color="var(--chart-5)"
      id="pattern-oceania"
      preset="diagonal-up"
      strokeWidth={1.5}
    />
  </>
);

function getLinesPattern(feat: ChoroplethFeature): string | null {
  const name = feat.properties?.name;
  if (!name) {
    return null;
  }
  const category = getRegionCategory(name);
  return `pattern-${category}`;
}

export function ChoroplethLinesPatternDemo() {
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
      <ChoroplethFeatureComponent
        getFeaturePattern={getLinesPattern}
        patterns={linesPatterns}
      />
      <ChoroplethTooltip />
    </ChoroplethChart>
  );
}
