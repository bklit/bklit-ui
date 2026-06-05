"use client";

import type { ChoroplethFeature } from "@bklitui/ui/charts";
import {
  ChoroplethChart,
  ChoroplethFeatureComponent,
  ChoroplethGraticule,
  ChoroplethTooltip,
} from "@bklitui/ui/charts";
import type { Transition } from "motion/react";
import { memo, useCallback, useMemo } from "react";
import { useWorldDataStandalone } from "@/hooks/use-world-data";
import { getStudioCssRevealPropsForPreview } from "@/lib/chart-animation";
import { visitorsByCountry } from "@/lib/demo-data";
import type { PatternPresetId } from "@/lib/patterns";
import {
  StudioChoroplethBgPattern,
  StudioChoroplethFgPatterns,
  studioChoroplethFgPatternId,
} from "@/lib/patterns";
import type { StudioRenderContext } from "@/lib/render-context";
import type { StudioUrlState } from "@/lib/studio-parsers";

const ChoroplethChartBody = memo(function ChoroplethChartBody({
  worldData,
  showGraticule,
  analytics,
  bgPattern,
  fgPattern,
  animationDuration,
  enterTransition,
  revealSignature,
  visitorCounts,
}: {
  worldData: NonNullable<
    ReturnType<typeof useWorldDataStandalone>["worldData"]
  >;
  showGraticule: boolean;
  analytics: boolean;
  bgPattern: PatternPresetId;
  fgPattern: PatternPresetId;
  animationDuration: number;
  enterTransition?: Transition;
  revealSignature?: string;
  visitorCounts: Record<string, number>;
}) {
  const getVisitorColor = useCallback(
    (feat: ChoroplethFeature): string => {
      const visitors = visitorCounts[feat.properties?.name as string];
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
    },
    [visitorCounts]
  );

  const getVisitorValue = useCallback(
    (feat: ChoroplethFeature): number | undefined => {
      return visitorCounts[feat.properties?.name as string];
    },
    [visitorCounts]
  );

  const bgActive = bgPattern !== "none";
  const fgActive = fgPattern !== "none";
  const showSolidLayer = analytics || !(fgActive || bgActive);

  return (
    <ChoroplethChart
      animationDuration={animationDuration}
      className="size-full"
      data={worldData}
      enterTransition={enterTransition}
      revealSignature={revealSignature}
    >
      {showGraticule ? <ChoroplethGraticule key="graticule" /> : null}

      {bgActive ? (
        <ChoroplethFeatureComponent
          getFeaturePattern={() => "studio-choro-bg"}
          key="bg-pattern"
          patterns={<StudioChoroplethBgPattern preset={bgPattern} />}
        />
      ) : null}

      {showSolidLayer ? (
        <ChoroplethFeatureComponent
          fill={analytics ? undefined : "var(--chart-3)"}
          getFeatureColor={analytics ? getVisitorColor : undefined}
          key="solid"
        />
      ) : null}

      {fgActive ? (
        <ChoroplethFeatureComponent
          getFeaturePattern={(feat) =>
            studioChoroplethFgPatternId(feat.properties?.name as string)
          }
          key="fg-pattern"
          patterns={<StudioChoroplethFgPatterns preset={fgPattern} />}
        />
      ) : null}

      <ChoroplethTooltip
        getFeatureValue={analytics ? getVisitorValue : undefined}
        key="tooltip"
        valueLabel={analytics ? "Visitors" : undefined}
      />
    </ChoroplethChart>
  );
});

export function ChoroplethStudioPreview({
  state,
  ctx,
  showGraticule,
  analytics,
  bgPattern,
  fgPattern,
  visitorCounts = visitorsByCountry,
}: {
  state: StudioUrlState;
  ctx: Pick<
    StudioRenderContext,
    | "motionCurveDragging"
    | "numberScrubbing"
    | "committedState"
    | "isRecording"
    | "dataSeed"
  >;
  showGraticule: boolean;
  analytics: boolean;
  bgPattern: PatternPresetId;
  fgPattern: PatternPresetId;
  visitorCounts?: Record<string, number>;
}) {
  const { worldData, isLoading } = useWorldDataStandalone();

  const motionReveal = useMemo(
    () =>
      getStudioCssRevealPropsForPreview(state, {
        motionCurveDragging: ctx.motionCurveDragging,
        numberScrubbing: ctx.numberScrubbing,
        committedState: ctx.committedState,
        isRecording: ctx.isRecording,
      }),
    [
      state,
      ctx.committedState,
      ctx.isRecording,
      ctx.motionCurveDragging,
      ctx.numberScrubbing,
    ]
  );

  if (isLoading || !worldData) {
    return (
      <div className="flex size-full items-center justify-center text-muted-foreground text-sm">
        Loading map…
      </div>
    );
  }

  return (
    <ChoroplethChartBody
      analytics={analytics}
      animationDuration={motionReveal.animationDuration}
      bgPattern={bgPattern}
      enterTransition={motionReveal.enterTransition}
      fgPattern={fgPattern}
      revealSignature={motionReveal.revealSignature}
      showGraticule={showGraticule}
      visitorCounts={visitorCounts}
      worldData={worldData}
    />
  );
}
