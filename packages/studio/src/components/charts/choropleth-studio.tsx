"use client";

import type { ChoroplethFeature } from "@bklitui/ui/charts";
import {
  ChoroplethChart,
  ChoroplethFeatureComponent,
  ChoroplethGraticule,
  ChoroplethTooltip,
} from "@bklitui/ui/charts";
import type { Transition } from "motion/react";
import { useWorldDataStandalone } from "@/hooks/use-world-data";
import { visitorsByCountry } from "@/lib/demo-data";
import type { PatternPresetId } from "@/lib/patterns";
import {
  StudioChoroplethBgPattern,
  StudioChoroplethFgPatterns,
  studioChoroplethFgPatternId,
} from "@/lib/patterns";

function getVisitorColor(feat: ChoroplethFeature): string {
  const visitors = visitorsByCountry[feat.properties?.name as string];
  if (!visitors) {
    return "var(--muted)";
  }
  if (visitors >= 17) {
    return "var(--chart-1)";
  }
  if (visitors >= 13) {
    return "var(--chart-2)";
  }
  if (visitors >= 9) {
    return "var(--chart-3)";
  }
  if (visitors >= 5) {
    return "var(--chart-4)";
  }
  return "var(--chart-5)";
}

function getVisitorValue(feat: ChoroplethFeature): number | undefined {
  return visitorsByCountry[feat.properties?.name as string];
}

export function ChoroplethStudioPreview({
  showGraticule,
  analytics,
  bgPattern,
  fgPattern,
  animationDuration,
  animationEasing: _animationEasing,
  enterTransition,
  revealSignature: _revealSignature,
}: {
  showGraticule: boolean;
  analytics: boolean;
  bgPattern: PatternPresetId;
  fgPattern: PatternPresetId;
  animationDuration: number;
  animationEasing?: string;
  enterTransition?: Transition;
  revealSignature?: string;
}) {
  const { worldData, isLoading } = useWorldDataStandalone();

  if (isLoading || !worldData) {
    return (
      <div className="flex size-full items-center justify-center text-muted-foreground text-sm">
        Loading map…
      </div>
    );
  }

  const bgActive = bgPattern !== "none";
  const fgActive = fgPattern !== "none";
  const showSolidLayer = analytics || !(fgActive || bgActive);

  return (
    <ChoroplethChart
      animationDuration={animationDuration}
      className="size-full"
      data={worldData}
      enterTransition={enterTransition}
      revealSignature={_revealSignature}
    >
      {showGraticule ? <ChoroplethGraticule /> : null}

      {bgActive ? (
        <ChoroplethFeatureComponent
          getFeaturePattern={() => "studio-choro-bg"}
          patterns={<StudioChoroplethBgPattern preset={bgPattern} />}
        />
      ) : null}

      {showSolidLayer ? (
        <ChoroplethFeatureComponent
          fill={analytics ? undefined : "var(--chart-3)"}
          getFeatureColor={analytics ? getVisitorColor : undefined}
        />
      ) : null}

      {fgActive ? (
        <ChoroplethFeatureComponent
          getFeaturePattern={(feat) =>
            studioChoroplethFgPatternId(feat.properties?.name as string)
          }
          patterns={<StudioChoroplethFgPatterns preset={fgPattern} />}
        />
      ) : null}

      <ChoroplethTooltip
        getFeatureValue={analytics ? getVisitorValue : undefined}
        valueLabel={analytics ? "Visitors" : undefined}
      />
    </ChoroplethChart>
  );
}
