import type { BandFadeEdges, BandProps } from "@bklitui/ui/charts";
import { withBollingerBands } from "@bklitui/ui/charts";
import { STUDIO_SERIES_KEYS } from "./demo-data";
import {
  isStudioComponentVisible,
  LINE_BAND_COMPONENT_ID,
} from "./studio-component-visibility";
import type { StudioUrlState } from "./studio-parsers";

/** Band is always derived from series 0 (`desktop`). */
export const STUDIO_BAND_SOURCE_KEY: string = STUDIO_SERIES_KEYS[0];

const DOTTED_DASHARRAY = "1,3";

export interface StudioBandKeys {
  upperKey: string;
  lowerKey: string;
  middleKey: string;
}

/** Same naming as `withBollingerBands` defaults so range + bollinger share keys. */
export function studioBandKeys(
  sourceKey: string = STUDIO_BAND_SOURCE_KEY
): StudioBandKeys {
  return {
    upperKey: `${sourceKey}Upper`,
    lowerKey: `${sourceKey}Lower`,
    middleKey: `${sourceKey}Sma`,
  };
}

export function clampBandPeriod(period: number): number {
  return Number.isFinite(period) ? Math.max(2, Math.round(period)) : 2;
}

function clampBandSpread(spread: number): number {
  return Number.isFinite(spread) ? Math.max(0, spread) : 0;
}

/**
 * Smoothly varying, slightly asymmetric spread so the range reads like a real
 * min/max band rather than a constant offset. Kept in sync with
 * {@link bandRangeCodegenSnippet}.
 */
export function withStudioBandRange<T extends Record<string, unknown>>(
  data: readonly T[],
  sourceKey: string,
  spread: number
): (T & Record<string, number>)[] {
  const s = clampBandSpread(spread);
  const { upperKey, lowerKey } = studioBandKeys(sourceKey);
  return data.map((row, i) => {
    const value = Number(row[sourceKey]) || 0;
    return {
      ...row,
      [upperKey]: Math.round(
        value + value * s * (0.75 + 0.25 * Math.sin(i / 1.9))
      ),
      [lowerKey]: Math.round(
        value - value * s * (0.75 + 0.25 * Math.cos(i / 2.6))
      ),
    };
  });
}

/**
 * `bandEnabled` is kept in sync with the `line.band` eye toggle; requiring both
 * keeps the band off for states that never went through visibility reconcile
 * (e.g. `hiddenComponents: ""` in static previews).
 */
export function isStudioBandVisible(state: StudioUrlState): boolean {
  return (
    state.bandEnabled && isStudioComponentVisible(state, LINE_BAND_COMPONENT_ID)
  );
}

export type StudioBandDataOptions = Pick<
  StudioUrlState,
  "bandMode" | "bandSpread" | "bandPeriod" | "bandMultiplier" | "bandWarmup"
>;

/** Adds band keys (series 0 upper / lower, plus SMA in bollinger mode). */
export function withStudioBandData<T extends Record<string, unknown>>(
  data: T[],
  options: StudioBandDataOptions
): T[] {
  if (options.bandMode === "bollinger") {
    return withBollingerBands(data, {
      dataKey: STUDIO_BAND_SOURCE_KEY,
      period: clampBandPeriod(options.bandPeriod),
      multiplier: options.bandMultiplier,
      ...(options.bandWarmup === "partial" ? { minPeriods: 1 } : {}),
    }) as T[];
  }
  return withStudioBandRange(
    data,
    STUDIO_BAND_SOURCE_KEY,
    options.bandSpread
  ) as T[];
}

export function bandFadeEdgesFromState(state: StudioUrlState): BandFadeEdges {
  const sides = {
    top: state.bandFadeTop,
    right: state.bandFadeRight,
    bottom: state.bandFadeBottom,
    left: state.bandFadeLeft,
  };
  const enabled = Object.values(sides).filter(Boolean).length;
  if (enabled === 0) {
    return false;
  }
  if (enabled === 4) {
    return true;
  }
  return Object.fromEntries(
    Object.entries(sides).filter(([, on]) => on)
  ) as BandFadeEdges;
}

function bandStrokeDasharray(state: StudioUrlState): string | undefined {
  if (state.bandStrokeStyle === "dashed") {
    return state.bandStrokeDasharray.trim() || undefined;
  }
  if (state.bandStrokeStyle === "dotted") {
    return DOTTED_DASHARRAY;
  }
  return undefined;
}

type StudioBandProps = Omit<BandProps, "curve" | "className">;

/**
 * `<Band>` props from Studio state. Only non-default / relevant props are
 * included so the same object drives the preview and generated code.
 */
export function studioBandProps(
  state: StudioUrlState,
  yAxisId?: string
): StudioBandProps {
  const { upperKey, lowerKey } = studioBandKeys();
  const props: StudioBandProps = { upperKey, lowerKey };
  if (yAxisId && yAxisId !== "left") {
    props.yAxisId = yAxisId;
  }

  props.fill = state.bandFill;
  if (state.bandFillType !== "solid") {
    props.fillType = state.bandFillType;
  }
  props.fillOpacity = state.bandFillOpacity;
  if (state.bandFillType === "gradient") {
    props.gradientToOpacity = state.bandGradientToOpacity;
  }
  if (state.bandFillType === "pattern") {
    props.pattern = state.bandPattern;
    props.patternColor = state.bandPatternColor;
    props.patternScale = state.bandPatternScale;
    props.patternStrokeWidth = state.bandPatternStrokeWidth;
    props.patternOpacity = state.bandPatternOpacity;
  }

  props.stroke = state.bandStroke;
  props.strokeWidth = state.bandStrokeWidth;
  const dash = bandStrokeDasharray(state);
  if (dash) {
    props.strokeDasharray = dash;
  }
  props.strokeOpacity = state.bandStrokeOpacity;
  if (!state.bandShowUpperStroke) {
    props.upperStroke = false;
  }
  if (!state.bandShowLowerStroke) {
    props.lowerStroke = false;
  }

  const fadeEdges = bandFadeEdgesFromState(state);
  if (fadeEdges !== false) {
    props.fadeEdges = fadeEdges;
    props.fadeSize = state.bandFadeSize;
  }
  return props;
}

/**
 * Bollinger middle (SMA) line, drawn as a zero-height `<Band>` so warm-up
 * `null`s are skipped (`<Line>` does not support gaps).
 */
export function studioBandMiddleProps(
  state: StudioUrlState,
  yAxisId?: string
): StudioBandProps | null {
  if (state.bandMode !== "bollinger" || !state.bandShowMiddle) {
    return null;
  }
  const { middleKey } = studioBandKeys();
  return {
    upperKey: middleKey,
    lowerKey: middleKey,
    ...(yAxisId && yAxisId !== "left" ? { yAxisId } : {}),
    fillOpacity: 0,
    stroke: state.bandStroke,
    strokeWidth: state.bandStrokeWidth,
    strokeDasharray: "4,4",
    strokeOpacity: Math.min(1, state.bandStrokeOpacity + 0.3),
    lowerStroke: false,
  };
}

function jsxValue(value: unknown): string {
  if (typeof value === "string") {
    return `"${value.replace(/"/g, '\\"')}"`;
  }
  if (value !== null && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).map(
      ([k, v]) => `${k}: ${typeof v === "string" ? `"${v}"` : String(v)}`
    );
    return `{{ ${entries.join(", ")} }}`;
  }
  return `{${String(value)}}`;
}

export function bandPropsCodegen(props: object): string {
  return Object.entries(props)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => (value === true ? key : `${key}=${jsxValue(value)}`))
    .join(" ");
}

/** `<Band>` JSX for `cartesianCodegen` (LineChart only, visible layer only). */
export function bandCodegenBlock(
  state: StudioUrlState,
  curveName: string
): string {
  if (!isStudioBandVisible(state)) {
    return "";
  }
  const curveAttr = ` curve={${curveName}}`;
  const main = `\n  <Band ${bandPropsCodegen(studioBandProps(state))}${curveAttr} />`;
  const middle = studioBandMiddleProps(state);
  return middle
    ? `${main}\n  <Band ${bandPropsCodegen(middle)}${curveAttr} />`
    : main;
}

/** Variable the generated `<LineChart data={…}>` reads from. */
export function bandCodegenDataVar(state: StudioUrlState): string {
  return isStudioBandVisible(state) ? "bandData" : "chartData";
}

export interface BandCodegenParts {
  block: string;
  dataVar: string;
  imports: string[];
}

export const EMPTY_BAND_CODEGEN_PARTS: BandCodegenParts = {
  block: "",
  dataVar: "chartData",
  imports: [],
};

/** Everything `cartesianCodegen` needs for the LineChart band layer. */
export function bandCodegenParts(
  state: StudioUrlState,
  curveName: string
): BandCodegenParts {
  if (!isStudioBandVisible(state)) {
    return EMPTY_BAND_CODEGEN_PARTS;
  }
  return {
    block: bandCodegenBlock(state, curveName),
    dataVar: bandCodegenDataVar(state),
    imports: ["Band"],
  };
}

/** Data transform appended to the chart data snippet when the band is visible. */
export function bandDataCodegenSnippet(state: StudioUrlState): string {
  if (!isStudioBandVisible(state)) {
    return "";
  }
  const key = STUDIO_BAND_SOURCE_KEY;
  const dataVar = bandCodegenDataVar(state);
  if (state.bandMode === "bollinger") {
    const partial = state.bandWarmup === "partial";
    return `

// Adds ${key}Upper / ${key}Lower / ${key}Sma (${partial ? "partial window during warm-up" : "null during the warm-up window"})
const ${dataVar} = withBollingerBands(chartData, {
  dataKey: "${key}",
  period: ${clampBandPeriod(state.bandPeriod)},
  multiplier: ${state.bandMultiplier},${partial ? "\n  minPeriods: 1," : ""}
});`;
  }
  const spread = clampBandSpread(state.bandSpread);
  return `

// Banded range: replace with your own min/max (or p10/p90) per point
const ${dataVar} = chartData.map((d, i) => ({
  ...d,
  ${key}Upper: Math.round(d.${key} + d.${key} * ${spread} * (0.75 + 0.25 * Math.sin(i / 1.9))),
  ${key}Lower: Math.round(d.${key} - d.${key} * ${spread} * (0.75 + 0.25 * Math.cos(i / 2.6))),
}));`;
}

/** Import line prepended to the data snippet in bollinger mode. */
export function bandDataCodegenImport(state: StudioUrlState): string {
  if (!isStudioBandVisible(state) || state.bandMode !== "bollinger") {
    return "";
  }
  return `import { withBollingerBands } from "@bklitui/ui/charts";

`;
}
