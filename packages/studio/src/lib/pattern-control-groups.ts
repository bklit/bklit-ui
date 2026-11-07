import {
  type PatternPresetId,
  STROKE_PATTERN_PRESET_IDS,
} from "@/lib/pattern-presets";
import type { StudioUrlState } from "@/lib/studio-parsers";
import type {
  StudioControl,
  StudioControlGroup,
  StudioControlVisibilityRule,
} from "@/lib/types";
import { barCollapsibleGroup, controlGroup } from "./sidebar-control-templates";

export interface PatternControlKeys {
  pattern: keyof StudioUrlState;
  stroke: keyof StudioUrlState;
  scale: keyof StudioUrlState;
  strokeWidth: keyof StudioUrlState;
  opacity: keyof StudioUrlState;
  tileBackground: keyof StudioUrlState;
}

function activeWhen(
  patternKey: keyof StudioUrlState
): StudioControlVisibilityRule {
  return { key: patternKey, not: "none" };
}

/** Stroke width only affects the line / grid presets. */
function strokePresetWhen(
  patternKey: keyof StudioUrlState
): StudioControlVisibilityRule {
  return { key: patternKey, equals: STROKE_PATTERN_PRESET_IDS };
}

/** Pattern props shown when a pattern style is selected. */
export function patternDetailControls(
  patternKey: keyof StudioUrlState,
  keys: PatternControlKeys,
  options?: { opacityColor?: string; enabledWhen?: keyof StudioUrlState }
): StudioControl[] {
  const active = activeWhen(patternKey);
  const enabledWhen = options?.enabledWhen;

  const withEnabled = <T extends StudioControl>(control: T): T =>
    enabledWhen ? { ...control, enabledWhen } : control;

  return [
    withEnabled({
      type: "color",
      key: keys.stroke,
      label: "Color",
      visibleWhen: active,
    }),
    withEnabled({
      type: "number",
      key: keys.scale,
      label: "Scale",
      min: 0.1,
      max: 3,
      step: 0.1,
      input: "number",
      visibleWhen: active,
    }),
    withEnabled({
      type: "number",
      key: keys.strokeWidth,
      label: "Stroke width",
      min: 0.5,
      max: 4,
      step: 0.5,
      visibleWhen: strokePresetWhen(patternKey),
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
  tileBackground: "backgroundPatternTileBackground",
  opacity: "backgroundPatternOpacity",
};

export const BRUSH_PATTERN_KEYS: PatternControlKeys = {
  pattern: "brushSelectionPattern",
  stroke: "brushSelectionPatternColor",
  scale: "brushSelectionPatternScale",
  strokeWidth: "brushSelectionPatternStrokeWidth",
  tileBackground: "brushSelectionPatternTileBackground",
  opacity: "brushSelectionPatternOpacity",
};

export const BAR_TRACK_PATTERN_KEYS: PatternControlKeys = {
  pattern: "barTrackPattern",
  stroke: "barTrackPatternColor",
  scale: "barTrackPatternScale",
  strokeWidth: "barTrackPatternStrokeWidth",
  tileBackground: "barTrackPatternTileBackground",
  opacity: "barTrackOpacity",
};

export const barTrackControlGroups: StudioControlGroup[] = [
  barCollapsibleGroup("Track", [
    { type: "pattern", key: "barTrackPattern", label: "Style" },
    ...patternDetailControls("barTrackPattern", BAR_TRACK_PATTERN_KEYS),
    {
      type: "color",
      key: "barTrackColor",
      label: "Color",
      visibleWhen: { key: "barTrackPattern", equals: "none" },
    },
    {
      type: "opacity",
      key: "barTrackOpacity",
      label: "Opacity",
      min: 0,
      max: 1,
      step: 0.05,
      color: "var(--chart-grid)",
      visibleWhen: { key: "barTrackPattern", equals: "none" },
    },
  ]),
];

export const REFERENCE_AREA_PATTERN_KEYS: PatternControlKeys = {
  pattern: "referenceAreaPattern",
  stroke: "referenceAreaPatternColor",
  scale: "referenceAreaPatternScale",
  strokeWidth: "referenceAreaPatternStrokeWidth",
  tileBackground: "referenceAreaPatternTileBackground",
  opacity: "referenceAreaFillOpacity",
};

/** Pattern detail fields for reference area fill (excludes pattern style picker). */
export function referenceAreaPatternDetailControls(): StudioControl[] {
  return patternDetailControls(
    "referenceAreaPattern",
    REFERENCE_AREA_PATTERN_KEYS,
    { opacityColor: "var(--chart-foreground-muted)" }
  );
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
    tileBackground: String(state[keys.tileBackground]) || undefined,
    opacity: Number(state[keys.opacity]),
    preset: state[keys.pattern] as PatternPresetId,
  };
}
