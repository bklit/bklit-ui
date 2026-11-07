"use client";

import { ColorControlField } from "@/components/controls/color-control-field";
import {
  StudioControlRow,
  studioFieldLabelClass,
} from "@/components/controls/control-field-helpers";
import {
  FillPicker,
  PatternScaleInput,
} from "@/components/controls/fill-picker";
import { OpacityControl } from "@/components/controls/opacity-control";
import { PatternPicker } from "@/components/controls/pattern-picker";
import { SliderInputGroup } from "@/components/controls/slider-input-group";
import {
  setStudioHeatmapLevelPattern,
  setStudioHeatmapLevelPatternColor,
  setStudioHeatmapLevelPatternOpacity,
  setStudioHeatmapLevelPatternScale,
  setStudioHeatmapLevelPatternStrokeWidth,
  setStudioHeatmapLevelPatternTileBackground,
  setStudioHeatmapLevelUsesPattern,
  studioHeatmapLevelColorKey,
  studioHeatmapLevelPattern,
  studioHeatmapLevelPatternColor,
  studioHeatmapLevelPatternOpacity,
  studioHeatmapLevelPatternScale,
  studioHeatmapLevelPatternStrokeWidth,
  studioHeatmapLevelPatternTileBackground,
  studioHeatmapLevelUsesPattern,
} from "@/lib/heatmap-studio-colors";
import {
  DEFAULT_PATTERN_PRESET,
  isStrokePatternPreset,
} from "@/lib/pattern-presets";
import type { StudioUrlState } from "@/lib/studio-parsers";
import { parsePipeField } from "@/lib/studio-series-design";
import { YesNoSwitch } from "@/ui/yes-no-switch";

function HeatmapPipeColorField({
  label,
  color,
  onColorChange,
  onColorPreview,
}: {
  label: string;
  color: string;
  onColorChange: (value: string) => void;
  onColorPreview?: (value: string) => void;
}) {
  return (
    <FillPicker
      color={color}
      fillMode="solid"
      label={label}
      onColorChange={onColorChange}
      onColorPreview={onColorPreview ?? onColorChange}
      onFillModeChange={() => undefined}
      onPatternChange={() => undefined}
      pattern="none"
      supportsPattern={false}
    />
  );
}

export function HeatmapLevelPaneControl({
  level,
  state,
  onChange,
  onPreview,
  onCommit,
}: {
  level: number;
  state: StudioUrlState;
  onChange: <K extends keyof StudioUrlState>(
    key: K,
    value: StudioUrlState[K]
  ) => void;
  onPreview?: <K extends keyof StudioUrlState>(
    key: K,
    value: StudioUrlState[K]
  ) => void;
  onCommit?: <K extends keyof StudioUrlState>(
    key: K,
    value: StudioUrlState[K]
  ) => void;
}) {
  const commit = onCommit ?? onChange;
  const preview = onPreview ?? onChange;
  const colorKey = studioHeatmapLevelColorKey(level);
  const baseColor = String(state[colorKey] ?? "");
  const patternEnabled = studioHeatmapLevelUsesPattern(state, level);
  const pattern = studioHeatmapLevelPattern(state, level);
  const patternColor = studioHeatmapLevelPatternColor(state, level);
  const patternScale = studioHeatmapLevelPatternScale(state, level);
  const patternStrokeWidth = studioHeatmapLevelPatternStrokeWidth(state, level);
  const patternTileBackground = studioHeatmapLevelPatternTileBackground(
    state,
    level
  );
  const patternOpacity = studioHeatmapLevelPatternOpacity(state, level);
  const strokePreviewColor = patternColor || baseColor;

  const commitPatternColor = (value: string, live = false) => {
    const writer = live ? preview : commit;
    writer(
      "heatmapLevelPatternColors",
      setStudioHeatmapLevelPatternColor(state, level, value)
    );
  };

  return (
    <div className="space-y-3">
      <ColorControlField
        color={baseColor}
        keyName={colorKey}
        label="Base color"
        onChange={onChange}
        onCommit={onCommit}
        onPreview={onPreview}
      />

      <StudioControlRow alignControl="end" label="Pattern">
        <YesNoSwitch
          aria-label="Pattern"
          onValueChange={(checked) => {
            commit(
              "heatmapLevelFillModes",
              setStudioHeatmapLevelUsesPattern(state, level, checked)
            );
            const storedPattern = parsePipeField(state.heatmapLevelPatterns)[
              level
            ];
            if (checked && (!storedPattern || storedPattern === "none")) {
              commit(
                "heatmapLevelPatterns",
                setStudioHeatmapLevelPattern(
                  state,
                  level,
                  DEFAULT_PATTERN_PRESET
                )
              );
            }
          }}
          value={patternEnabled}
        />
      </StudioControlRow>

      {patternEnabled ? (
        <div className="space-y-3 border-transparent border-t pt-3">
          <div className="space-y-2">
            <p className={studioFieldLabelClass}>Style</p>
            <PatternPicker
              onChange={(nextPattern) =>
                commit(
                  "heatmapLevelPatterns",
                  setStudioHeatmapLevelPattern(state, level, nextPattern)
                )
              }
              value={pattern}
            />
          </div>

          <HeatmapPipeColorField
            color={patternColor || strokePreviewColor}
            label="Color"
            onColorChange={(value) => commitPatternColor(value)}
            onColorPreview={(value) => commitPatternColor(value, true)}
          />
          <PatternScaleInput
            onChange={(value) =>
              commit(
                "heatmapLevelPatternScales",
                setStudioHeatmapLevelPatternScale(state, level, value)
              )
            }
            value={patternScale}
          />
          {isStrokePatternPreset(pattern) ? (
            <SliderInputGroup
              label="Stroke width"
              max={4}
              min={0.5}
              onCommit={(value) =>
                commit(
                  "heatmapLevelPatternStrokeWidths",
                  setStudioHeatmapLevelPatternStrokeWidth(state, level, value)
                )
              }
              onPreview={(value) =>
                preview(
                  "heatmapLevelPatternStrokeWidths",
                  setStudioHeatmapLevelPatternStrokeWidth(state, level, value)
                )
              }
              step={0.5}
              value={patternStrokeWidth}
            />
          ) : null}

          <HeatmapPipeColorField
            color={patternTileBackground || baseColor}
            label="Tile background"
            onColorChange={(value) =>
              commit(
                "heatmapLevelPatternTileBackgrounds",
                setStudioHeatmapLevelPatternTileBackground(state, level, value)
              )
            }
            onColorPreview={(value) =>
              preview(
                "heatmapLevelPatternTileBackgrounds",
                setStudioHeatmapLevelPatternTileBackground(state, level, value)
              )
            }
          />

          <OpacityControl
            color={strokePreviewColor}
            label="Opacity"
            max={1}
            min={0.1}
            onCommit={(value) =>
              commit(
                "heatmapLevelPatternOpacities",
                setStudioHeatmapLevelPatternOpacity(state, level, value)
              )
            }
            onPreview={(value) =>
              preview(
                "heatmapLevelPatternOpacities",
                setStudioHeatmapLevelPatternOpacity(state, level, value)
              )
            }
            secondaryColor={baseColor}
            step={0.05}
            value={patternOpacity}
          />
        </div>
      ) : null}
    </div>
  );
}
