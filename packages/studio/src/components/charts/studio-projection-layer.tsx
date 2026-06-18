"use client";

import { ProjectionLine, ProjectionLineEndMarker } from "@bklitui/ui/charts";
import { StudioVisibleLayer } from "@/components/charts/studio-chart-shell";
import { getLineSeriesYAxisId } from "@/lib/line-series-y-axis";
import type { StudioUrlState } from "@/lib/studio-parsers";
import {
  buildStudioProjectionPath,
  getProjectionCurve,
  getProjectionDashArray,
  getProjectionSeriesIndex,
  getProjectionShowEndpoints,
  getProjectionStroke,
  getProjectionStrokeWidth,
} from "@/lib/studio-projection-props";

export function StudioProjectionLayer({
  state,
  componentId,
  projectionIndex,
  sourceData,
}: {
  state: StudioUrlState;
  componentId: string;
  projectionIndex: number;
  sourceData: Record<string, unknown>[];
}) {
  const path = buildStudioProjectionPath(state, projectionIndex, sourceData);
  if (path.length < 2) {
    return null;
  }

  const showEndMarker = getProjectionShowEndpoints(state, projectionIndex);
  const stroke = getProjectionStroke(state, projectionIndex);
  const seriesIndex = getProjectionSeriesIndex(state, projectionIndex);
  const yAxisId = getLineSeriesYAxisId(state, seriesIndex);

  return (
    <>
      <StudioVisibleLayer componentId={componentId} state={state}>
        <ProjectionLine
          curveKind={getProjectionCurve(state, projectionIndex)}
          data={path}
          showEndMarker={false}
          stroke={stroke}
          strokeDasharray={getProjectionDashArray(state, projectionIndex)}
          strokeWidth={getProjectionStrokeWidth(state, projectionIndex)}
          yAxisId={yAxisId}
        />
      </StudioVisibleLayer>
      {showEndMarker ? (
        <StudioVisibleLayer componentId={componentId} state={state}>
          <ProjectionLineEndMarker
            data={path}
            stroke={stroke}
            yAxisId={yAxisId}
          />
        </StudioVisibleLayer>
      ) : null}
    </>
  );
}
