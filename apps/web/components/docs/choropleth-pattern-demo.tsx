"use client";

import type { ChoroplethFeature } from "@bklitui/ui/charts";
import {
  ChoroplethChart,
  ChoroplethFeatureComponent,
  ChoroplethTooltip,
  PatternCircles,
  PatternLines,
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
    <PatternLines
      height={6}
      id="pattern-americas"
      orientation={["diagonal"]}
      stroke="var(--chart-1)"
      strokeWidth={2}
      width={6}
    />
    <PatternLines
      height={6}
      id="pattern-europe"
      orientation={["diagonal"]}
      stroke="var(--chart-2)"
      strokeWidth={2}
      width={6}
    />
    <PatternLines
      height={6}
      id="pattern-asia"
      orientation={["diagonal"]}
      stroke="var(--chart-3)"
      strokeWidth={2}
      width={6}
    />
    <PatternLines
      height={6}
      id="pattern-africa"
      orientation={["diagonal"]}
      stroke="var(--chart-4)"
      strokeWidth={2}
      width={6}
    />
    <PatternLines
      height={6}
      id="pattern-oceania"
      orientation={["diagonal"]}
      stroke="var(--chart-5)"
      strokeWidth={2}
      width={6}
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

// Dots pattern demo
const dotsPatterns = (
  <>
    <PatternCircles
      complement
      fill="var(--chart-1)"
      height={8}
      id="dots-americas"
      radius={2}
      width={8}
    />
    <PatternCircles
      complement
      fill="var(--chart-2)"
      height={8}
      id="dots-europe"
      radius={2}
      width={8}
    />
    <PatternCircles
      complement
      fill="var(--chart-3)"
      height={8}
      id="dots-asia"
      radius={2}
      width={8}
    />
    <PatternCircles
      complement
      fill="var(--chart-4)"
      height={8}
      id="dots-africa"
      radius={2}
      width={8}
    />
    <PatternCircles
      complement
      fill="var(--chart-5)"
      height={8}
      id="dots-oceania"
      radius={2}
      width={8}
    />
  </>
);

function getDotsPattern(feat: ChoroplethFeature): string | null {
  const name = feat.properties?.name;
  if (!name) {
    return null;
  }
  const category = getRegionCategory(name);
  return `dots-${category}`;
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

export function ChoroplethDotsPatternDemo() {
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
        getFeaturePattern={getDotsPattern}
        patterns={dotsPatterns}
      />
      <ChoroplethTooltip />
    </ChoroplethChart>
  );
}
