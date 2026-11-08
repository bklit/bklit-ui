"use client";

import type { ChoroplethFeature } from "@bklitui/ui/charts";
import {
  ChoroplethBackground,
  type ChoroplethBackgroundProps,
  ChoroplethChart,
  ChoroplethDotGrid,
  type ChoroplethDotGridProps,
  ChoroplethFeatureComponent,
  ChoroplethGraticule,
  ChoroplethMarker,
  type ChoroplethMarkerProps,
  type ChoroplethPerspective,
  ChoroplethTooltip,
  type ChoroplethZoomTransition,
} from "@bklitui/ui/charts";
import type { Transition } from "motion/react";
import { type CSSProperties, memo, useCallback, useMemo } from "react";
import { useWorldDataStandalone } from "@/hooks/use-world-data";
import { getStudioCssRevealPropsForPreview } from "@/lib/chart-animation";
import {
  CHOROPLETH_ZOOM_EASES,
  parseChoroplethMarkers,
} from "@/lib/choropleth-studio-options";
import { visitorsByCountry } from "@/lib/demo-data";
import type { PatternPresetId } from "@/lib/patterns";
import {
  StudioChoroplethBgPattern,
  StudioChoroplethFgPatterns,
  studioChoroplethFgPatternId,
} from "@/lib/patterns";
import type { StudioRenderContext } from "@/lib/render-context";
import { backgroundPropsFromState } from "@/lib/studio-cartesian-layers";
import { studioTooltipPanelStyle } from "@/lib/studio-chart-overlays";
import { isStudioComponentVisible } from "@/lib/studio-component-visibility";
import type { StudioUrlState } from "@/lib/studio-parsers";
import { getSeriesColorOverride } from "@/lib/studio-series-design";

/** Plain elements (not a wrapper component) so ChoroplethChart sees SVG children. */
function markerElements(
  markers: { label: string; coordinates: [number, number] }[],
  markerStyle: Omit<ChoroplethMarkerProps, "label" | "coordinates"> | null
) {
  if (!markerStyle) {
    return null;
  }
  return markers.map((marker) => (
    <ChoroplethMarker
      coordinates={marker.coordinates}
      key={`marker-${marker.label}`}
      label={marker.label}
      {...markerStyle}
    />
  ));
}

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
  showFeatures,
  showTooltip,
  solidFill,
  tooltipPanelStyle,
  featureStroke,
  featureStrokeWidth,
  featureFadedOpacity,
  graticuleStrokeWidth,
  renderDots,
  dotGrid,
  clickToZoom,
  focusMaxZoom,
  zoomTransition,
  perspective,
  markers,
  markerStyle,
  background,
}: {
  renderDots: boolean;
  dotGrid: Omit<ChoroplethDotGridProps, "getFeatureColor" | "fill">;
  clickToZoom: boolean;
  focusMaxZoom: number;
  zoomTransition: ChoroplethZoomTransition;
  perspective: ChoroplethPerspective;
  markers: { label: string; coordinates: [number, number] }[];
  markerStyle: Omit<ChoroplethMarkerProps, "label" | "coordinates"> | null;
  background: ChoroplethBackgroundProps | null;
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
  showFeatures: boolean;
  showTooltip: boolean;
  solidFill: string;
  tooltipPanelStyle?: CSSProperties;
  featureStroke: string;
  featureStrokeWidth: number;
  featureFadedOpacity: number;
  graticuleStrokeWidth: number;
}) {
  const featureProps = {
    fadedOpacity: featureFadedOpacity,
    stroke: featureStroke,
    strokeWidth: featureStrokeWidth,
  };

  const getVisitorColor = useCallback(
    (feat: ChoroplethFeature): string => {
      const visitors = visitorCounts[feat.properties?.name as string];
      if (!visitors) {
        return "var(--chart-scale-01)";
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

  const colorProps = analytics
    ? { getFeatureColor: getVisitorColor }
    : { fill: solidFill };
  const showFill = showFeatures && !renderDots;
  const bgActive = showFill && bgPattern !== "none";
  const fgActive = showFill && fgPattern !== "none";
  const showSolidLayer =
    showFill && (analytics || !(bgPattern !== "none" || fgPattern !== "none"));

  return (
    <ChoroplethChart
      animationDuration={animationDuration}
      className="size-full"
      clickToZoom={clickToZoom}
      data={worldData}
      enterTransition={enterTransition}
      focusMaxZoom={focusMaxZoom}
      perspective={perspective}
      revealSignature={revealSignature}
      zoomTransition={zoomTransition}
    >
      {background ? (
        <ChoroplethBackground key="background" {...background} />
      ) : null}

      {showGraticule ? (
        <ChoroplethGraticule
          hideOnFocus={dotGrid.hideOceanOnFocus}
          key="graticule"
          strokeWidth={graticuleStrokeWidth}
        />
      ) : null}

      {bgActive ? (
        <ChoroplethFeatureComponent
          {...featureProps}
          getFeaturePattern={() => "studio-choro-bg"}
          key="bg-pattern"
          patterns={<StudioChoroplethBgPattern preset={bgPattern} />}
        />
      ) : null}

      {showSolidLayer ? (
        <ChoroplethFeatureComponent
          {...featureProps}
          {...colorProps}
          key="solid"
        />
      ) : null}

      {showFeatures && renderDots ? (
        <ChoroplethDotGrid
          key="dots"
          {...dotGrid}
          {...colorProps}
          fadedOpacity={featureFadedOpacity}
        />
      ) : null}

      {fgActive ? (
        <ChoroplethFeatureComponent
          {...featureProps}
          getFeaturePattern={(feat) =>
            studioChoroplethFgPatternId(feat.properties?.name as string)
          }
          key="fg-pattern"
          patterns={<StudioChoroplethFgPatterns preset={fgPattern} />}
        />
      ) : null}

      {markerElements(markers, markerStyle)}

      {showTooltip ? (
        <ChoroplethTooltip
          getFeatureValue={analytics ? getVisitorValue : undefined}
          key="tooltip"
          panelStyle={tooltipPanelStyle}
          valueLabel={analytics ? "Visitors" : undefined}
        />
      ) : null}
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
    "motionCurveDragging" | "numberScrubbing" | "committedState" | "dataSeed"
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
      }),
    [state, ctx.committedState, ctx.motionCurveDragging, ctx.numberScrubbing]
  );

  const camera = useMemo(
    () => ({
      zoomTransition: {
        duration: state.choroplethZoomDuration,
        ease: CHOROPLETH_ZOOM_EASES[state.choroplethZoomEase],
      },
      perspective: {
        overview: {
          view: state.choroplethOverviewView,
          yaw: state.choroplethOverviewYaw,
          tilt: state.choroplethOverviewTilt,
        },
        focus: {
          view: state.choroplethFocusView,
          yaw: state.choroplethFocusYaw,
          tilt: state.choroplethFocusTilt,
        },
        depth: state.choroplethDepth,
        edgeFade: state.choroplethEdgeFade,
      } satisfies ChoroplethPerspective,
    }),
    [
      state.choroplethZoomDuration,
      state.choroplethZoomEase,
      state.choroplethOverviewView,
      state.choroplethOverviewYaw,
      state.choroplethOverviewTilt,
      state.choroplethFocusView,
      state.choroplethFocusYaw,
      state.choroplethFocusTilt,
      state.choroplethDepth,
      state.choroplethEdgeFade,
    ]
  );

  const dotGrid = useMemo(
    () => ({
      gap: state.choroplethDotGap,
      dotSize: state.choroplethDotSize,
      zoomDotSize: state.choroplethDotZoomSize,
      hideOceanOnFocus: state.choroplethHideContextOnFocus,
      lattice: state.choroplethDotLattice,
      showOcean: state.choroplethDotOcean,
      oceanOpacity: state.choroplethDotOceanOpacity,
      edgeFade: state.choroplethDotEdgeFade,
    }),
    [
      state.choroplethDotGap,
      state.choroplethDotSize,
      state.choroplethDotZoomSize,
      state.choroplethHideContextOnFocus,
      state.choroplethDotLattice,
      state.choroplethDotOcean,
      state.choroplethDotOceanOpacity,
      state.choroplethDotEdgeFade,
    ]
  );

  const markers = useMemo(
    () => parseChoroplethMarkers(state.choroplethMarkers),
    [state.choroplethMarkers]
  );

  const showMarkers =
    state.choroplethShowMarkers &&
    isStudioComponentVisible(state, "choropleth.markers");
  const markerStyle = useMemo(
    () =>
      showMarkers
        ? {
            shape: state.choroplethMarkerShape,
            size: state.choroplethMarkerSize,
            color: state.choroplethMarkerColor,
            pulse: state.choroplethMarkerPulse,
            glow: state.choroplethMarkerGlow,
            showLabel: state.choroplethMarkerLabels,
            stroke: state.choroplethMarkerStroke
              ? state.choroplethMarkerStrokeColor
              : undefined,
            strokeWidth: state.choroplethMarkerStrokeWidth,
          }
        : null,
    [
      showMarkers,
      state.choroplethMarkerShape,
      state.choroplethMarkerSize,
      state.choroplethMarkerColor,
      state.choroplethMarkerPulse,
      state.choroplethMarkerGlow,
      state.choroplethMarkerLabels,
      state.choroplethMarkerStroke,
      state.choroplethMarkerStrokeColor,
      state.choroplethMarkerStrokeWidth,
    ]
  );

  const showBackground =
    state.choroplethBackground &&
    state.backgroundPattern !== "none" &&
    isStudioComponentVisible(state, "choropleth.backdrop");
  const backgroundProps = showBackground
    ? {
        ...backgroundPropsFromState(state),
        hideOnFocus: state.choroplethHideContextOnFocus,
      }
    : null;
  const backgroundKey = backgroundProps ? JSON.stringify(backgroundProps) : "";
  const background = useMemo(() => backgroundProps, [backgroundKey]);

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
      background={background}
      bgPattern={bgPattern}
      clickToZoom={state.choroplethClickZoom}
      dotGrid={dotGrid}
      enterTransition={motionReveal.enterTransition}
      featureFadedOpacity={state.choroplethFeatureFadedOpacity}
      featureStroke={state.choroplethFeatureStroke}
      featureStrokeWidth={state.choroplethFeatureStrokeWidth}
      fgPattern={fgPattern}
      focusMaxZoom={state.choroplethFocusMaxZoom}
      graticuleStrokeWidth={state.choroplethGraticuleStrokeWidth}
      markerStyle={markerStyle}
      markers={markers}
      perspective={camera.perspective}
      renderDots={state.choroplethRender === "dots"}
      revealSignature={motionReveal.revealSignature}
      showFeatures={isStudioComponentVisible(
        state,
        state.choroplethRender === "dots"
          ? "choropleth.dots"
          : "choropleth.features"
      )}
      showGraticule={
        showGraticule && isStudioComponentVisible(state, "choropleth.graticule")
      }
      showTooltip={isStudioComponentVisible(state, "choropleth.tooltip")}
      solidFill={getSeriesColorOverride(state, 0) || "var(--chart-3)"}
      tooltipPanelStyle={studioTooltipPanelStyle(state)}
      visitorCounts={visitorCounts}
      worldData={worldData}
      zoomTransition={camera.zoomTransition}
    />
  );
}
