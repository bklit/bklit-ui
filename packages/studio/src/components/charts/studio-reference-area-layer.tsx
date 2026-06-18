"use client";

import { ReferenceArea } from "@bklitui/ui/charts";
import { StudioVisibleLayer } from "@/components/charts/studio-chart-shell";
import type { StudioUrlState } from "@/lib/studio-parsers";

export function StudioReferenceAreaLayer({
  state,
  componentId,
}: {
  state: StudioUrlState;
  componentId: string;
}) {
  return (
    <StudioVisibleLayer componentId={componentId} state={state}>
      <ReferenceArea
        axisLabelColor={state.referenceAreaAxisLabelColor}
        fadeEdges={state.referenceAreaFadeEdges}
        fadeEdgesLength={state.referenceAreaFadeEdgesLength}
        fill={state.referenceAreaFill}
        fillOpacity={state.referenceAreaFillOpacity}
        markerColor={state.referenceAreaMarkerColor}
        pattern={state.referenceAreaPattern}
        patternColor={state.referenceAreaPatternColor}
        patternComplement={state.referenceAreaPatternComplement}
        patternDotFill={state.referenceAreaPatternDotsFill}
        patternFill={state.referenceAreaPatternFill}
        patternRadius={state.referenceAreaPatternRadius}
        patternScale={state.referenceAreaPatternScale}
        patternStrokeWidth={state.referenceAreaPatternStrokeWidth}
        patternTileBackground={state.referenceAreaPatternTileBackground}
        showMarkers={state.referenceAreaShowMarkers}
        stroke={state.referenceAreaStroke}
        strokeDasharray={state.referenceAreaStrokeDasharray}
        strokeStyle={state.referenceAreaStrokeStyle}
        y1={state.referenceAreaY1}
        y2={state.referenceAreaY2}
        yAxisId={state.referenceAreaYAxis}
      />
    </StudioVisibleLayer>
  );
}
