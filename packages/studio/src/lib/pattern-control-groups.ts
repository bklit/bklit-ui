import type { PatternPresetId } from "@/lib/pattern-presets";
import type { StudioUrlState } from "@/lib/studio-parsers";
import type {
  StudioControl,
  StudioControlGroup,
  StudioControlVisibilityRule,
} from "@/lib/types";
import { controlGroup } from "./sidebar-control-templates";

export interface PatternControlKeys {
  pattern: keyof StudioUrlState;
  stroke: keyof StudioUrlState;
  scale: keyof StudioUrlState;
  strokeWidth: keyof StudioUrlState;
  opacity: keyof StudioUrlState;
  radius: keyof StudioUrlState;
  complement: keyof StudioUrlState;
  fill: keyof StudioUrlState;
  tileBackground: keyof StudioUrlState;
}

function activeWhen(
  patternKey: keyof StudioUrlState
): StudioControlVisibilityRule {
  return { key: patternKey, not: "none" };
}

function dotGridWhen(
  patternKey: keyof StudioUrlState
): StudioControlVisibilityRule {
  return { key: patternKey, equals: "dots" };
}

function circleTextureWhen(
  patternKey: keyof StudioUrlState
): StudioControlVisibilityRule {
  return { key: patternKey, equals: "circles" };
}

function circlePatternWhen(
  patternKey: keyof StudioUrlState
): StudioControlVisibilityRule {
  return { key: patternKey, equals: ["dots", "circles"] };
}

function linesWhen(
  patternKey: keyof StudioUrlState
): StudioControlVisibilityRule {
  return { key: patternKey, not: ["none", "dots", "circles"] };
}

/** Visx-relevant props shown when a pattern style is selected. */
export function patternDetailControls(
  patternKey: keyof StudioUrlState,
  keys: PatternControlKeys,
  options?: { opacityColor?: string; enabledWhen?: keyof StudioUrlState }
): StudioControl[] {
  const active = activeWhen(patternKey);
  const dotGrid = dotGridWhen(patternKey);
  const circleTexture = circleTextureWhen(patternKey);
  const circlePattern = circlePatternWhen(patternKey);
  const lines = linesWhen(patternKey);
  const enabledWhen = options?.enabledWhen;

  const withEnabled = <T extends StudioControl>(control: T): T =>
    enabledWhen ? { ...control, enabledWhen } : control;

  return [
    withEnabled({
      type: "color",
      key: keys.stroke,
      label: "Color",
      visibleWhen: dotGrid,
    }),
    withEnabled({
      type: "color",
      key: keys.stroke,
      label: "Stroke",
      visibleWhen: circleTexture,
    }),
    withEnabled({
      type: "color",
      key: keys.stroke,
      label: "Stroke",
      visibleWhen: lines,
    }),
    withEnabled({
      type: "number",
      key: keys.scale,
      label: "Spacing",
      min: 0.25,
      max: 4,
      step: 0.25,
      visibleWhen: circlePattern,
    }),
    withEnabled({
      type: "number",
      key: keys.scale,
      label: "Scale",
      min: 0.25,
      max: 4,
      step: 0.25,
      visibleWhen: lines,
    }),
    withEnabled({
      type: "number",
      key: keys.strokeWidth,
      label: "Stroke width",
      min: 0,
      max: 4,
      step: 0.5,
      visibleWhen: circleTexture,
    }),
    withEnabled({
      type: "number",
      key: keys.strokeWidth,
      label: "Stroke width",
      min: 0.5,
      max: 4,
      step: 0.5,
      visibleWhen: lines,
    }),
    withEnabled({
      type: "number",
      key: keys.radius,
      label: "Dot size",
      min: 0.25,
      max: 8,
      step: 0.25,
      visibleWhen: dotGrid,
    }),
    withEnabled({
      type: "number",
      key: keys.radius,
      label: "Radius",
      min: 0.5,
      max: 8,
      step: 0.5,
      visibleWhen: circleTexture,
    }),
    withEnabled({
      type: "boolean",
      key: keys.complement,
      label: "Complement",
      visibleWhen: circlePattern,
    }),
    withEnabled({
      type: "color",
      key: keys.fill,
      label: "Fill",
      visibleWhen: circleTexture,
    }),
    withEnabled({
      type: "color",
      key: keys.tileBackground,
      label: "Tile background",
      visibleWhen: active,
    }),
    withEnabled({
      type: "opacity",
      key: keys.opacity,
      label: "Opacity",
      min: 0.1,
      max: 1,
      step: 0.05,
      color: options?.opacityColor ?? "var(--chart-grid)",
      visibleWhen: active,
    }),
  ];
}

export const BACKGROUND_PATTERN_KEYS: PatternControlKeys = {
  pattern: "backgroundPattern",
  stroke: "backgroundPatternColor",
  scale: "backgroundPatternScale",
  strokeWidth: "backgroundPatternStrokeWidth",
  radius: "backgroundPatternRadius",
  complement: "backgroundPatternComplement",
  fill: "backgroundPatternFill",
  tileBackground: "backgroundPatternTileBackground",
  opacity: "backgroundPatternOpacity",
};

export const BRUSH_PATTERN_KEYS: PatternControlKeys = {
  pattern: "brushSelectionPattern",
  stroke: "brushSelectionPatternColor",
  scale: "brushSelectionPatternScale",
  strokeWidth: "brushSelectionPatternStrokeWidth",
  radius: "brushSelectionPatternRadius",
  complement: "brushSelectionPatternComplement",
  fill: "brushSelectionPatternFill",
  tileBackground: "brushSelectionPatternTileBackground",
  opacity: "brushSelectionPatternOpacity",
};

export const REFERENCE_AREA_PATTERN_KEYS: PatternControlKeys = {
  pattern: "referenceAreaPattern",
  stroke: "referenceAreaPatternColor",
  scale: "referenceAreaPatternScale",
  strokeWidth: "referenceAreaPatternStrokeWidth",
  radius: "referenceAreaPatternRadius",
  complement: "referenceAreaPatternComplement",
  fill: "referenceAreaPatternFill",
  tileBackground: "referenceAreaPatternTileBackground",
  opacity: "referenceAreaFillOpacity",
};

/** Pattern detail fields for reference area fill (excludes pattern style picker). */
export function referenceAreaPatternDetailControls(): StudioControl[] {
  return [
    {
      type: "boolean",
      key: "referenceAreaPatternDotsFill",
      label: "Fill dots",
      visibleWhen: { key: "referenceAreaPattern", equals: "dots" },
    },
    ...patternDetailControls(
      "referenceAreaPattern",
      REFERENCE_AREA_PATTERN_KEYS,
      {
        opacityColor: "var(--chart-foreground-muted)",
      }
    ),
  ];
}

export const backgroundControlGroups: StudioControlGroup[] = [
  controlGroup("Pattern", [
    { type: "pattern", key: "backgroundPattern", label: "Style" },
    {
      type: "boolean",
      key: "backgroundPatternShowFill",
      label: "Pattern fill",
      visibleWhen: activeWhen("backgroundPattern"),
    },
    {
      type: "boolean",
      key: "backgroundPatternDotsFill",
      label: "Fill",
      visibleWhen: dotGridWhen("backgroundPattern"),
    },
    ...patternDetailControls("backgroundPattern", BACKGROUND_PATTERN_KEYS),
  ]),
  controlGroup("Edges", [
    {
      type: "boolean",
      key: "backgroundFadeHorizontal",
      label: "Fade horizontally",
      visibleWhen: activeWhen("backgroundPattern"),
    },
    {
      type: "number",
      key: "backgroundFadeHorizontalLength",
      label: "Horizontal fade",
      min: 0,
      max: 45,
      step: 1,
      unit: "%",
      visibleWhen: [
        activeWhen("backgroundPattern"),
        { key: "backgroundFadeHorizontal", truthy: true },
      ],
    },
    {
      type: "boolean",
      key: "backgroundFadeVertical",
      label: "Fade vertically",
      visibleWhen: activeWhen("backgroundPattern"),
    },
    {
      type: "number",
      key: "backgroundFadeVerticalLength",
      label: "Vertical fade",
      min: 0,
      max: 45,
      step: 1,
      unit: "%",
      visibleWhen: [
        activeWhen("backgroundPattern"),
        { key: "backgroundFadeVertical", truthy: true },
      ],
    },
  ]),
];

export function brushPatternDetailControls(): StudioControl[] {
  return patternDetailControls("brushSelectionPattern", BRUSH_PATTERN_KEYS, {
    enabledWhen: "brushSelectionPatternEnabled",
    opacityColor: "var(--chart-1)",
  });
}

/** Shared pattern options for render + codegen from URL state keys. */
export function patternOptionsFromState(
  state: StudioUrlState,
  keys: PatternControlKeys
) {
  return {
    color: String(state[keys.stroke]),
    scale: Number(state[keys.scale]),
    strokeWidth: Number(state[keys.strokeWidth]),
    radius: Number(state[keys.radius]),
    complement: Boolean(state[keys.complement]),
    fill: String(state[keys.fill]),
    tileBackground: String(state[keys.tileBackground]) || undefined,
    opacity: Number(state[keys.opacity]),
    preset: state[keys.pattern] as PatternPresetId,
  };
}
