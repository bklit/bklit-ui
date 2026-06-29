import { CURVE_IDS, type CurveId } from "@/lib/curves";
import { clampStudioSeriesCount } from "@/lib/demo-data";
import type { StudioUrlState } from "@/lib/studio-parsers";
import {
  getEffectiveSeriesColor,
  parsePipeField,
  serializePipeField,
} from "@/lib/studio-series-design";

const FADE_EDGES_VALUES = ["both", "none", "left", "right"] as const;
type FadeEdges = (typeof FADE_EDGES_VALUES)[number];

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

function parsePipeCurves(raw: string): (CurveId | undefined)[] {
  return parsePipeField(raw).map((part) =>
    (CURVE_IDS as readonly string[]).includes(part)
      ? (part as CurveId)
      : undefined
  );
}

function parsePipeFadeEdges(raw: string): (FadeEdges | undefined)[] {
  return parsePipeField(raw).map((part) =>
    FADE_EDGES_VALUES.includes(part as FadeEdges)
      ? (part as FadeEdges)
      : undefined
  );
}

function parsePipeStrings(raw: string): (string | undefined)[] {
  return parsePipeField(raw).map((part) => (part ? part : undefined));
}

function getPipeSlot<T>(
  index: number,
  parsed: (T | undefined)[],
  fallback: T
): T {
  const slot = parsed[index];
  return slot === undefined ? fallback : slot;
}

function buildPipeUpdate<T>(
  state: StudioUrlState,
  raw: string,
  seriesIndex: number,
  value: T,
  readSlot: (raw: string, index: number) => T,
  serializeValue: (value: T) => string
): string {
  const count = clampStudioSeriesCount(state.dataSeries);
  const next = Array.from({ length: count }, (_, index) => {
    const slotValue = index === seriesIndex ? value : readSlot(raw, index);
    return serializeValue(slotValue);
  });
  return serializePipeField(next);
}

function readCurve(raw: string, index: number, state: StudioUrlState) {
  return getPipeSlot(index, parsePipeCurves(raw), state.curve);
}

function readStrokeWidth(raw: string, index: number, state: StudioUrlState) {
  return getPipeSlot(index, parsePipeNumbers(raw), state.strokeWidth);
}

function readFadeEdges(raw: string, index: number, state: StudioUrlState) {
  return getPipeSlot(index, parsePipeFadeEdges(raw), state.fadeEdges);
}

function readShowHighlight(raw: string, index: number, state: StudioUrlState) {
  return getPipeSlot(index, parsePipeBooleans(raw), state.showHighlight);
}

function readShowLine(raw: string, index: number, state: StudioUrlState) {
  return getPipeSlot(index, parsePipeBooleans(raw), state.showLine);
}

function readShowMarkers(raw: string, index: number, state: StudioUrlState) {
  return getPipeSlot(index, parsePipeBooleans(raw), state.seriesShowMarkers);
}

function readMarkerRadius(raw: string, index: number, state: StudioUrlState) {
  return getPipeSlot(index, parsePipeNumbers(raw), state.seriesMarkerRadius);
}

function readMarkerRingGap(raw: string, index: number, state: StudioUrlState) {
  return getPipeSlot(index, parsePipeNumbers(raw), state.seriesMarkerRingGap);
}

function readMarkerRingWidth(
  raw: string,
  index: number,
  state: StudioUrlState
) {
  return getPipeSlot(index, parsePipeNumbers(raw), state.seriesMarkerRingWidth);
}

function readDashTail(raw: string, index: number, state: StudioUrlState) {
  return getPipeSlot(index, parsePipeBooleans(raw), state.seriesDashTail);
}

function readDashFromIndex(raw: string, index: number, state: StudioUrlState) {
  return getPipeSlot(index, parsePipeNumbers(raw), state.seriesDashFromIndex);
}

function readDashArray(raw: string, index: number, state: StudioUrlState) {
  const parsed = parsePipeField(raw);
  return parsed[index]?.trim() ? parsed[index] : state.seriesDashArray;
}

function readTerminalMarkerShow(
  raw: string,
  index: number,
  state: StudioUrlState
) {
  return getPipeSlot(
    index,
    parsePipeBooleans(raw),
    state.seriesTerminalMarkerShow
  );
}

function readTerminalMarkerFill(
  raw: string,
  index: number,
  state: StudioUrlState
) {
  return getPipeSlot(
    index,
    parsePipeStrings(raw),
    state.seriesTerminalMarkerFill
  );
}

function readTerminalMarkerRingColor(
  raw: string,
  index: number,
  state: StudioUrlState
) {
  return getPipeSlot(
    index,
    parsePipeStrings(raw),
    state.seriesTerminalMarkerRingColor
  );
}

function readTerminalMarkerRingGap(
  raw: string,
  index: number,
  state: StudioUrlState
) {
  return getPipeSlot(
    index,
    parsePipeNumbers(raw),
    state.seriesTerminalMarkerRingGap
  );
}

export function getSeriesCurve(
  state: StudioUrlState,
  seriesIndex: number
): CurveId {
  return readCurve(state.seriesCurves, seriesIndex, state);
}

export function getSeriesStrokeWidth(
  state: StudioUrlState,
  seriesIndex: number
): number {
  return readStrokeWidth(state.seriesStrokeWidths, seriesIndex, state);
}

export function getSeriesFadeEdges(
  state: StudioUrlState,
  seriesIndex: number
): FadeEdges {
  return readFadeEdges(state.seriesFadeEdges, seriesIndex, state);
}

export function getSeriesShowHighlight(
  state: StudioUrlState,
  seriesIndex: number
): boolean {
  return readShowHighlight(state.seriesShowHighlights, seriesIndex, state);
}

export function getSeriesShowLine(
  state: StudioUrlState,
  seriesIndex: number
): boolean {
  return readShowLine(state.seriesShowLines, seriesIndex, state);
}

export function getSeriesShowMarkers(
  state: StudioUrlState,
  seriesIndex: number
): boolean {
  return readShowMarkers(state.seriesMarkersFlags, seriesIndex, state);
}

export function getSeriesMarkerRadius(
  state: StudioUrlState,
  seriesIndex: number
): number {
  return readMarkerRadius(state.seriesMarkerRadii, seriesIndex, state);
}

export function getSeriesMarkerRingGap(
  state: StudioUrlState,
  seriesIndex: number
): number {
  return readMarkerRingGap(state.seriesMarkerRingGaps, seriesIndex, state);
}

export function getSeriesMarkerRingWidth(
  state: StudioUrlState,
  seriesIndex: number
): number {
  return readMarkerRingWidth(state.seriesMarkerRingWidths, seriesIndex, state);
}

export function getSeriesDashTail(
  state: StudioUrlState,
  seriesIndex: number
): boolean {
  return readDashTail(state.seriesDashTailFlags, seriesIndex, state);
}

export function getSeriesDashFromIndex(
  state: StudioUrlState,
  seriesIndex: number
): number {
  return readDashFromIndex(state.seriesDashFromIndices, seriesIndex, state);
}

export function getSeriesDashArray(
  state: StudioUrlState,
  seriesIndex: number
): string {
  return readDashArray(state.seriesDashArrays, seriesIndex, state);
}

export function getSeriesTerminalMarkerShow(
  state: StudioUrlState,
  seriesIndex: number
): boolean {
  return readTerminalMarkerShow(
    state.seriesTerminalMarkerShowFlags,
    seriesIndex,
    state
  );
}

export function getSeriesTerminalMarkerFill(
  state: StudioUrlState,
  seriesIndex: number
): string {
  return readTerminalMarkerFill(
    state.seriesTerminalMarkerFills,
    seriesIndex,
    state
  );
}

export function getSeriesTerminalMarkerRingColor(
  state: StudioUrlState,
  seriesIndex: number
): string {
  const color = readTerminalMarkerRingColor(
    state.seriesTerminalMarkerRingColors,
    seriesIndex,
    state
  );
  return color || getEffectiveSeriesColor(state, seriesIndex);
}

export function getSeriesTerminalMarkerRingGap(
  state: StudioUrlState,
  seriesIndex: number
): number {
  return readTerminalMarkerRingGap(
    state.seriesTerminalMarkerRingGaps,
    seriesIndex,
    state
  );
}

const PER_SERIES_CONTROL_KEYS = new Set<keyof StudioUrlState>([
  "curve",
  "strokeWidth",
  "fadeEdges",
  "showHighlight",
  "showLine",
  "seriesShowMarkers",
  "seriesMarkerRadius",
  "seriesMarkerRingGap",
  "seriesMarkerRingWidth",
  "seriesTerminalMarkerShow",
  "seriesTerminalMarkerFill",
  "seriesTerminalMarkerRingColor",
  "seriesTerminalMarkerRingGap",
  "seriesDashTail",
  "seriesDashFromIndex",
  "seriesDashArray",
]);

export function isPerSeriesLineControlKey(
  key: keyof StudioUrlState
): key is keyof StudioUrlState {
  return PER_SERIES_CONTROL_KEYS.has(key);
}

export function getSeriesScopedControlValue(
  state: StudioUrlState,
  key: keyof StudioUrlState,
  seriesIndex: number
): StudioUrlState[keyof StudioUrlState] {
  switch (key) {
    case "curve":
      return getSeriesCurve(state, seriesIndex);
    case "strokeWidth":
      return getSeriesStrokeWidth(state, seriesIndex);
    case "fadeEdges":
      return getSeriesFadeEdges(state, seriesIndex);
    case "showHighlight":
      return getSeriesShowHighlight(state, seriesIndex);
    case "showLine":
      return getSeriesShowLine(state, seriesIndex);
    case "seriesShowMarkers":
      return getSeriesShowMarkers(state, seriesIndex);
    case "seriesMarkerRadius":
      return getSeriesMarkerRadius(state, seriesIndex);
    case "seriesMarkerRingGap":
      return getSeriesMarkerRingGap(state, seriesIndex);
    case "seriesMarkerRingWidth":
      return getSeriesMarkerRingWidth(state, seriesIndex);
    case "seriesTerminalMarkerShow":
      return getSeriesTerminalMarkerShow(state, seriesIndex);
    case "seriesTerminalMarkerFill":
      return getSeriesTerminalMarkerFill(state, seriesIndex);
    case "seriesTerminalMarkerRingColor":
      return getSeriesTerminalMarkerRingColor(state, seriesIndex);
    case "seriesTerminalMarkerRingGap":
      return getSeriesTerminalMarkerRingGap(state, seriesIndex);
    case "seriesDashTail":
      return getSeriesDashTail(state, seriesIndex);
    case "seriesDashFromIndex":
      return getSeriesDashFromIndex(state, seriesIndex);
    case "seriesDashArray":
      return getSeriesDashArray(state, seriesIndex);
    default:
      return state[key];
  }
}

export function buildSeriesScopedControlUpdate(
  state: StudioUrlState,
  key: keyof StudioUrlState,
  seriesIndex: number,
  value: StudioUrlState[keyof StudioUrlState]
): Partial<StudioUrlState> {
  switch (key) {
    case "curve":
      return {
        seriesCurves: buildPipeUpdate(
          state,
          state.seriesCurves,
          seriesIndex,
          value as CurveId,
          (raw, index) => readCurve(raw, index, state),
          String
        ),
      };
    case "strokeWidth":
      return {
        seriesStrokeWidths: buildPipeUpdate(
          state,
          state.seriesStrokeWidths,
          seriesIndex,
          value as number,
          (raw, index) => readStrokeWidth(raw, index, state),
          String
        ),
      };
    case "fadeEdges":
      return {
        seriesFadeEdges: buildPipeUpdate(
          state,
          state.seriesFadeEdges,
          seriesIndex,
          value as FadeEdges,
          (raw, index) => readFadeEdges(raw, index, state),
          String
        ),
      };
    case "showHighlight":
      return {
        seriesShowHighlights: buildPipeUpdate(
          state,
          state.seriesShowHighlights,
          seriesIndex,
          value as boolean,
          (raw, index) => readShowHighlight(raw, index, state),
          (next) => (next ? "1" : "0")
        ),
      };
    case "showLine":
      return {
        seriesShowLines: buildPipeUpdate(
          state,
          state.seriesShowLines,
          seriesIndex,
          value as boolean,
          (raw, index) => readShowLine(raw, index, state),
          (next) => (next ? "1" : "0")
        ),
      };
    case "seriesShowMarkers":
      return {
        seriesMarkersFlags: buildPipeUpdate(
          state,
          state.seriesMarkersFlags,
          seriesIndex,
          value as boolean,
          (raw, index) => readShowMarkers(raw, index, state),
          (next) => (next ? "1" : "0")
        ),
      };
    case "seriesMarkerRadius":
      return {
        seriesMarkerRadii: buildPipeUpdate(
          state,
          state.seriesMarkerRadii,
          seriesIndex,
          value as number,
          (raw, index) => readMarkerRadius(raw, index, state),
          String
        ),
      };
    case "seriesMarkerRingGap":
      return {
        seriesMarkerRingGaps: buildPipeUpdate(
          state,
          state.seriesMarkerRingGaps,
          seriesIndex,
          value as number,
          (raw, index) => readMarkerRingGap(raw, index, state),
          String
        ),
      };
    case "seriesMarkerRingWidth":
      return {
        seriesMarkerRingWidths: buildPipeUpdate(
          state,
          state.seriesMarkerRingWidths,
          seriesIndex,
          value as number,
          (raw, index) => readMarkerRingWidth(raw, index, state),
          String
        ),
      };
    case "seriesTerminalMarkerShow":
      return {
        seriesTerminalMarkerShowFlags: buildPipeUpdate(
          state,
          state.seriesTerminalMarkerShowFlags,
          seriesIndex,
          value as boolean,
          (raw, index) => readTerminalMarkerShow(raw, index, state),
          (next) => (next ? "1" : "0")
        ),
      };
    case "seriesTerminalMarkerFill":
      return {
        seriesTerminalMarkerFills: buildPipeUpdate(
          state,
          state.seriesTerminalMarkerFills,
          seriesIndex,
          value as string,
          (raw, index) => readTerminalMarkerFill(raw, index, state),
          String
        ),
      };
    case "seriesTerminalMarkerRingColor":
      return {
        seriesTerminalMarkerRingColors: buildPipeUpdate(
          state,
          state.seriesTerminalMarkerRingColors,
          seriesIndex,
          value as string,
          (raw, index) => readTerminalMarkerRingColor(raw, index, state),
          String
        ),
      };
    case "seriesTerminalMarkerRingGap":
      return {
        seriesTerminalMarkerRingGaps: buildPipeUpdate(
          state,
          state.seriesTerminalMarkerRingGaps,
          seriesIndex,
          value as number,
          (raw, index) => readTerminalMarkerRingGap(raw, index, state),
          String
        ),
      };
    case "seriesDashTail":
      return {
        seriesDashTailFlags: buildPipeUpdate(
          state,
          state.seriesDashTailFlags,
          seriesIndex,
          value as boolean,
          (raw, index) => readDashTail(raw, index, state),
          (next) => (next ? "1" : "0")
        ),
      };
    case "seriesDashFromIndex":
      return {
        seriesDashFromIndices: buildPipeUpdate(
          state,
          state.seriesDashFromIndices,
          seriesIndex,
          value as number,
          (raw, index) => readDashFromIndex(raw, index, state),
          String
        ),
      };
    case "seriesDashArray":
      return {
        seriesDashArrays: buildPipeUpdate(
          state,
          state.seriesDashArrays,
          seriesIndex,
          value as string,
          (raw, index) => readDashArray(raw, index, state),
          String
        ),
      };
    default:
      return { [key]: value };
  }
}
