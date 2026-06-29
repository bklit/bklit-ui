import {
  parseHiddenStudioComponents,
  serializeHiddenStudioComponents,
} from "@/lib/studio-component-visibility";
import type { StudioUrlState } from "@/lib/studio-parsers";
import {
  getProjectionCount,
  getProjectionSeriesIndex,
  STUDIO_MAX_PROJECTIONS,
} from "@/lib/studio-projection-props";
import { parsePipeField, serializePipeField } from "@/lib/studio-series-design";

const LINE_SERIES_COMPONENT_ID = /^line\.series\.(\d+)$/;
const LINE_PROJECTION_COMPONENT_ID = /^line\.projection\.(\d+)$/;

const PROJECTION_PIPE_KEYS = [
  "projectionSeriesIndices",
  "projectionModes",
  "projectionAutoMethods",
  "projectionHorizons",
  "projectionEndValues",
  "projectionCurves",
  "projectionStrokes",
  "projectionStrokeStyles",
  "projectionStrokeGradientStarts",
  "projectionStrokeGradientEnds",
  "projectionDashArrays",
  "projectionStrokeWidths",
  "projectionShowEndpointsFlags",
  "projectionPathDensities",
] as const satisfies readonly (keyof StudioUrlState)[];

export function parseLineSeriesIndex(componentId: string): number | null {
  const match = LINE_SERIES_COMPONENT_ID.exec(componentId);
  if (!match) {
    return null;
  }
  const index = Number(match[1]);
  return Number.isFinite(index) ? index : null;
}

export function parseLineProjectionIndex(componentId: string): number | null {
  const match = LINE_PROJECTION_COMPONENT_ID.exec(componentId);
  if (!match) {
    return null;
  }
  const index = Number(match[1]);
  return Number.isFinite(index) ? index : null;
}

export function canAddProjectionLine(state: StudioUrlState): boolean {
  return (
    state.chart === "line-chart" &&
    state.lineChartMode === "standard" &&
    getProjectionCount(state) < STUDIO_MAX_PROJECTIONS
  );
}

export function buildAddProjectionLineUpdate(
  state: StudioUrlState,
  seriesIndex: number
): Partial<StudioUrlState> | null {
  if (!canAddProjectionLine(state)) {
    return null;
  }

  const count = getProjectionCount(state);
  const newCount = count + 1;
  const seriesIndices = Array.from({ length: newCount }, (_, index) => {
    if (index < count) {
      return String(getProjectionSeriesIndex(state, index));
    }
    return String(seriesIndex);
  });

  const dashFallback = state.projectionDashArray.trim() || "6,4";
  const existingDashParts = parsePipeField(
    String(state.projectionDashArrays ?? "")
  );
  const dashArrays = Array.from({ length: newCount }, (_, index) => {
    if (index < count) {
      const slot = existingDashParts[index]?.trim();
      return slot || dashFallback;
    }
    return dashFallback;
  });

  return {
    projectionCount: newCount,
    projectionSeriesIndices: serializePipeField(seriesIndices),
    projectionDashArrays: serializePipeField(dashArrays),
    showBrush: false,
  };
}

function reindexHiddenProjections(
  hidden: Set<string>,
  removeIndex: number
): Set<string> {
  const next = new Set<string>();
  for (const id of hidden) {
    const match = LINE_PROJECTION_COMPONENT_ID.exec(id);
    if (!match) {
      next.add(id);
      continue;
    }
    const index = Number(match[1]);
    if (index === removeIndex) {
      continue;
    }
    if (index > removeIndex) {
      next.add(`line.projection.${index - 1}`);
      continue;
    }
    next.add(id);
  }
  return next;
}

function spliceProjectionPipe(
  state: StudioUrlState,
  pipeKey: (typeof PROJECTION_PIPE_KEYS)[number],
  removeIndex: number,
  count: number
): string {
  const raw = String(state[pipeKey] ?? "");
  const parts = parsePipeField(raw);
  const values = Array.from(
    { length: count },
    (_, index) => parts[index] ?? ""
  );
  values.splice(removeIndex, 1);
  return serializePipeField(values);
}

export function buildRemoveProjectionUpdate(
  state: StudioUrlState,
  projectionIndex: number
): Partial<StudioUrlState> | null {
  const count = getProjectionCount(state);
  if (count <= 0 || projectionIndex < 0 || projectionIndex >= count) {
    return null;
  }

  const updates: Partial<StudioUrlState> = {
    projectionCount: count - 1,
    hiddenComponents: serializeHiddenStudioComponents(
      reindexHiddenProjections(
        parseHiddenStudioComponents(state.hiddenComponents),
        projectionIndex
      )
    ),
  };

  for (const pipeKey of PROJECTION_PIPE_KEYS) {
    updates[pipeKey] = spliceProjectionPipe(
      state,
      pipeKey,
      projectionIndex,
      count
    ) as StudioUrlState[typeof pipeKey];
  }

  return updates;
}

export function buildHideComponentUpdate(
  state: StudioUrlState,
  componentId: string
): Partial<StudioUrlState> {
  const hidden = parseHiddenStudioComponents(state.hiddenComponents);
  hidden.add(componentId);
  return {
    hiddenComponents: serializeHiddenStudioComponents(hidden),
  };
}
