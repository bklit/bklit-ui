import type {
  ProjectionAutoMethod,
  ProjectionCurveKind,
  ProjectionMode,
  ProjectionPathDensity,
  ProjectionPoint,
} from "@bklitui/ui/charts";
import {
  buildProjectionPath,
  computeProjectionAnchorTangentSlope,
} from "@bklitui/ui/charts";
import { clampStudioSeriesCount, STUDIO_SERIES_KEYS } from "@/lib/demo-data";
import type { StudioUrlState } from "@/lib/studio-parsers";
import { parsePipeField, serializePipeField } from "@/lib/studio-series-design";
import { isStudioComponentVisible } from "./studio-component-visibility";

export const STUDIO_MAX_PROJECTIONS = 5;

export const PROJECTION_PRESET_LABELS = [
  "High",
  "Median",
  "Low",
  "Projection 4",
  "Projection 5",
] as const;

const PROJECTION_MODE_VALUES = ["auto", "target", "manual"] as const;
const PROJECTION_AUTO_METHOD_VALUES = [
  "linearRegression",
  "lastSegment",
] as const;
const PROJECTION_PATH_DENSITY_VALUES = ["stepped", "endpoints"] as const;

export const PER_PROJECTION_CONTROL_KEYS = new Set<keyof StudioUrlState>([
  "projectionMode",
  "projectionAutoMethod",
  "projectionHorizonPoints",
  "projectionEndValue",
  "projectionCurve",
  "projectionStroke",
  "projectionDashArray",
  "projectionStrokeWidth",
  "projectionShowEndpoints",
]);

function parsePipeNumbers(raw: string): (number | undefined)[] {
  return parsePipeField(raw).map((part) => {
    if (!part) {
      return undefined;
    }
    const value = Number(part);
    return Number.isFinite(value) ? value : undefined;
  });
}

function parsePipeBooleans(raw: string): (boolean | undefined)[] {
  return parsePipeField(raw).map((part) => {
    if (!part) {
      return undefined;
    }
    return part === "1" || part === "true";
  });
}

function parsePipeStrings(raw: string): (string | undefined)[] {
  return parsePipeField(raw).map((part) => (part ? part : undefined));
}

function parsePipeModes(raw: string): (ProjectionMode | undefined)[] {
  return parsePipeField(raw).map((part) =>
    (PROJECTION_MODE_VALUES as readonly string[]).includes(part)
      ? (part as ProjectionMode)
      : undefined
  );
}

function parsePipePathDensities(
  raw: string
): (ProjectionPathDensity | undefined)[] {
  return parsePipeField(raw).map((part) =>
    (PROJECTION_PATH_DENSITY_VALUES as readonly string[]).includes(part)
      ? (part as ProjectionPathDensity)
      : undefined
  );
}

function parsePipeAutoMethods(
  raw: string
): (ProjectionAutoMethod | undefined)[] {
  return parsePipeField(raw).map((part) =>
    (PROJECTION_AUTO_METHOD_VALUES as readonly string[]).includes(part)
      ? (part as ProjectionAutoMethod)
      : undefined
  );
}

function parsePipeCurveKinds(raw: string): (ProjectionCurveKind | undefined)[] {
  return parsePipeField(raw).map((part) => normalizeProjectionCurveKind(part));
}

function normalizeProjectionCurveKind(
  value: string | undefined
): ProjectionCurveKind | undefined {
  if (!value) {
    return undefined;
  }
  if (value === "linear") {
    return "linear";
  }
  if (value === "bezier") {
    return "bezier";
  }
  // Legacy full curve picker ids — treat smooth curves as bezier.
  return "bezier";
}

function getPipeSlot<T>(
  index: number,
  parsed: (T | undefined)[],
  fallback: T
): T {
  const slot = parsed[index];
  return slot === undefined ? fallback : slot;
}

export function clampProjectionCount(count: number): number {
  if (!Number.isFinite(count) || count < 0) {
    return 0;
  }
  return Math.min(STUDIO_MAX_PROJECTIONS, Math.floor(count));
}

export function getProjectionCount(state: StudioUrlState): number {
  return clampProjectionCount(state.projectionCount);
}

export function getProjectionSeriesIndex(
  state: StudioUrlState,
  projectionIndex: number
): number {
  const maxSeries = clampStudioSeriesCount(state.dataSeries);
  const raw = parsePipeNumbers(state.projectionSeriesIndices)[projectionIndex];
  if (raw == null) {
    return 0;
  }
  return Math.min(Math.max(0, Math.floor(raw)), maxSeries - 1);
}

/** Series that anchors the first visible projection (shared terminal marker). */
export function getProjectionAnchorSeriesIndex(
  state: StudioUrlState
): number | null {
  const count = getProjectionCount(state);
  for (let index = 0; index < count; index += 1) {
    if (!isStudioComponentVisible(state, `line.projection.${index}`)) {
      continue;
    }
    return getProjectionSeriesIndex(state, index);
  }
  return null;
}

const PROJECTION_MODE_PRESETS: ProjectionMode[] = ["target", "auto", "target"];

export function getProjectionMode(
  state: StudioUrlState,
  projectionIndex: number
): ProjectionMode {
  const preset =
    PROJECTION_MODE_PRESETS[projectionIndex] ?? state.projectionMode;
  return getPipeSlot(
    projectionIndex,
    parsePipeModes(state.projectionModes),
    preset
  );
}

export function getProjectionAutoMethod(
  state: StudioUrlState,
  projectionIndex: number
): ProjectionAutoMethod {
  return getPipeSlot(
    projectionIndex,
    parsePipeAutoMethods(state.projectionAutoMethods),
    state.projectionAutoMethod
  );
}

export function getProjectionHorizonPoints(
  state: StudioUrlState,
  projectionIndex: number
): number {
  const fallback = Math.max(
    1,
    Math.floor(state.projectionHorizonPoints || state.dataPoints / 2)
  );
  const value = getPipeSlot(
    projectionIndex,
    parsePipeNumbers(state.projectionHorizons),
    fallback
  );
  return Math.max(1, Math.floor(value));
}

function defaultEndValueForPreset(
  sourceData: Record<string, unknown>[],
  seriesKey: string,
  projectionIndex: number
): number {
  const values = sourceData
    .map((row) => row[seriesKey])
    .filter((value): value is number => typeof value === "number");
  if (values.length === 0) {
    return stateFallbackEndValue(projectionIndex);
  }
  const last = values.at(-1);
  if (last == null) {
    return stateFallbackEndValue(projectionIndex);
  }
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = Math.max(max - min, last * 0.1, 10);
  if (projectionIndex === 0) {
    return Math.round(last + span * 0.45);
  }
  if (projectionIndex === 2) {
    return Math.round(last - span * 0.35);
  }
  return Math.round(last + span * 0.12);
}

function stateFallbackEndValue(projectionIndex: number): number {
  if (projectionIndex === 0) {
    return 280;
  }
  if (projectionIndex === 2) {
    return 140;
  }
  return 220;
}

export function getProjectionEndValue(
  state: StudioUrlState,
  projectionIndex: number,
  sourceData: Record<string, unknown>[],
  seriesKey: string
): number {
  const pipeValue = parsePipeNumbers(state.projectionEndValues)[
    projectionIndex
  ];
  if (pipeValue != null) {
    return pipeValue;
  }
  if (state.projectionEndValue !== 280 || projectionIndex > 2) {
    return state.projectionEndValue;
  }
  return defaultEndValueForPreset(sourceData, seriesKey, projectionIndex);
}

export function getProjectionCurve(
  state: StudioUrlState,
  projectionIndex: number
): ProjectionCurveKind {
  return getPipeSlot(
    projectionIndex,
    parsePipeCurveKinds(state.projectionCurves),
    normalizeProjectionCurveKind(state.projectionCurve) ?? "linear"
  );
}

export function getProjectionTangentSlope(
  state: StudioUrlState,
  projectionIndex: number,
  sourceData: Record<string, unknown>[]
): number {
  const seriesIndex = getProjectionSeriesIndex(state, projectionIndex);
  const seriesKey = STUDIO_SERIES_KEYS[seriesIndex] ?? "desktop";
  return computeProjectionAnchorTangentSlope(sourceData, seriesKey, "date");
}

export function getProjectionStroke(
  state: StudioUrlState,
  projectionIndex: number
): string {
  const strokes = ["var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];
  const preset = strokes[projectionIndex] ?? state.projectionStroke;
  return getPipeSlot(
    projectionIndex,
    parsePipeStrings(state.projectionStrokes),
    preset
  );
}

export function getProjectionDashArray(
  state: StudioUrlState,
  projectionIndex: number
): string {
  const parsed = parsePipeStrings(state.projectionDashArrays);
  const slot = parsed[projectionIndex];
  return slot?.trim() ? slot : state.projectionDashArray;
}

export function getProjectionStrokeWidth(
  state: StudioUrlState,
  projectionIndex: number
): number {
  return getPipeSlot(
    projectionIndex,
    parsePipeNumbers(state.projectionStrokeWidths),
    state.projectionStrokeWidth
  );
}

export function getProjectionPathDensity(
  state: StudioUrlState,
  projectionIndex: number
): ProjectionPathDensity {
  return getPipeSlot(
    projectionIndex,
    parsePipePathDensities(state.projectionPathDensities),
    state.projectionPathDensity
  );
}

export function getProjectionShowEndpoints(
  state: StudioUrlState,
  projectionIndex: number
): boolean {
  return getPipeSlot(
    projectionIndex,
    parsePipeBooleans(state.projectionShowEndpointsFlags),
    state.projectionShowEndpoints
  );
}

export function buildStudioProjectionPath(
  state: StudioUrlState,
  projectionIndex: number,
  sourceData: Record<string, unknown>[]
): ProjectionPoint[] {
  const seriesIndex = getProjectionSeriesIndex(state, projectionIndex);
  const seriesKey = STUDIO_SERIES_KEYS[seriesIndex] ?? "desktop";
  const mode = getProjectionMode(state, projectionIndex);
  const horizonPoints = getProjectionHorizonPoints(state, projectionIndex);

  return buildProjectionPath({
    sourceData,
    seriesKey,
    xDataKey: "date",
    mode,
    autoMethod: getProjectionAutoMethod(state, projectionIndex),
    pathDensity: "endpoints",
    horizonPoints,
    endValue:
      mode === "target"
        ? getProjectionEndValue(state, projectionIndex, sourceData, seriesKey)
        : undefined,
  });
}

function pipeFieldKeyForControl(
  key: keyof StudioUrlState
): keyof StudioUrlState | null {
  switch (key) {
    case "projectionMode":
      return "projectionModes";
    case "projectionAutoMethod":
      return "projectionAutoMethods";
    case "projectionHorizonPoints":
      return "projectionHorizons";
    case "projectionEndValue":
      return "projectionEndValues";
    case "projectionCurve":
      return "projectionCurves";
    case "projectionStroke":
      return "projectionStrokes";
    case "projectionDashArray":
      return "projectionDashArrays";
    case "projectionStrokeWidth":
      return "projectionStrokeWidths";
    case "projectionShowEndpoints":
      return "projectionShowEndpointsFlags";
    case "projectionPathDensity":
      return "projectionPathDensities";
    default:
      return null;
  }
}

export function isPerProjectionControlKey(
  key: keyof StudioUrlState
): key is keyof StudioUrlState {
  return PER_PROJECTION_CONTROL_KEYS.has(key);
}

export function getProjectionScopedControlValue(
  state: StudioUrlState,
  key: keyof StudioUrlState,
  projectionIndex: number
): StudioUrlState[keyof StudioUrlState] {
  switch (key) {
    case "projectionMode":
      return getProjectionMode(state, projectionIndex);
    case "projectionAutoMethod":
      return getProjectionAutoMethod(state, projectionIndex);
    case "projectionHorizonPoints":
      return getProjectionHorizonPoints(state, projectionIndex);
    case "projectionEndValue":
      return getProjectionEndValue(
        state,
        projectionIndex,
        [],
        STUDIO_SERIES_KEYS[getProjectionSeriesIndex(state, projectionIndex)] ??
          "desktop"
      );
    case "projectionCurve":
      return getProjectionCurve(state, projectionIndex);
    case "projectionStroke":
      return getProjectionStroke(state, projectionIndex);
    case "projectionDashArray":
      return getProjectionDashArray(state, projectionIndex);
    case "projectionStrokeWidth":
      return getProjectionStrokeWidth(state, projectionIndex);
    case "projectionShowEndpoints":
      return getProjectionShowEndpoints(state, projectionIndex);
    case "projectionPathDensity":
      return getProjectionPathDensity(state, projectionIndex);
    default:
      return state[key];
  }
}

export function buildProjectionScopedControlUpdate(
  state: StudioUrlState,
  key: keyof StudioUrlState,
  projectionIndex: number,
  value: StudioUrlState[keyof StudioUrlState]
): Partial<StudioUrlState> {
  const pipeKey = pipeFieldKeyForControl(key);
  if (!pipeKey) {
    return { [key]: value };
  }

  const count = getProjectionCount(state);
  const next = Array.from({ length: count }, (_, index) => {
    const slotValue =
      index === projectionIndex
        ? value
        : getProjectionScopedControlValue(state, key, index);
    if (typeof slotValue === "boolean") {
      return slotValue ? "1" : "0";
    }
    return String(slotValue ?? "");
  });

  return { [pipeKey]: serializePipeField(next) };
}
