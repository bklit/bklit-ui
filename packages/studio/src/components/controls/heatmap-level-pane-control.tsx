"use client";

import { ColorControlField } from "@/components/controls/color-control-field";
import {
  StudioControlRow,
  studioFieldLabelClass,
} from "@/components/controls/control-field-helpers";
import { FillPicker } from "@/components/controls/fill-picker";
import { OpacityControl } from "@/components/controls/opacity-control";
import { PatternPicker } from "@/components/controls/pattern-picker";
import { SliderInputGroup } from "@/components/controls/slider-input-group";
import {
  setStudioHeatmapLevelPattern,
  setStudioHeatmapLevelPatternColor,
  setStudioHeatmapLevelPatternComplement,
  setStudioHeatmapLevelPatternDotsFill,
  setStudioHeatmapLevelPatternFill,
  setStudioHeatmapLevelPatternOpacity,
  setStudioHeatmapLevelPatternRadius,
  setStudioHeatmapLevelPatternScale,
  setStudioHeatmapLevelPatternStrokeWidth,
  setStudioHeatmapLevelPatternTileBackground,
  setStudioHeatmapLevelUsesPattern,
  studioHeatmapLevelColorKey,
  studioHeatmapLevelPattern,
  studioHeatmapLevelPatternColor,
  studioHeatmapLevelPatternComplement,
  studioHeatmapLevelPatternDotsFill,
  studioHeatmapLevelPatternFill,
  studioHeatmapLevelPatternOpacity,
  studioHeatmapLevelPatternRadius,
  studioHeatmapLevelPatternScale,
  studioHeatmapLevelPatternStrokeWidth,
  studioHeatmapLevelPatternTileBackground,
  studioHeatmapLevelUsesPattern,
} from "@/lib/heatmap-studio-colors";
import type { PatternPresetId } from "@/lib/pattern-presets";
import type { StudioUrlState } from "@/lib/studio-parsers";
import { parsePipeField } from "@/lib/studio-series-design";
import { Switch } from "@/ui/switch";

function isCirclePattern(preset: PatternPresetId): boolean {
  return preset === "circles" || preset === "dots";
}

function isLinePattern(preset: PatternPresetId): boolean {
  return preset !== "none" && !isCirclePattern(preset);
}

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
  const patternRadius = studioHeatmapLevelPatternRadius(state, level);
  const patternComplement = studioHeatmapLevelPatternComplement(state, level);
  const patternFill = studioHeatmapLevelPatternFill(state, level);
  const patternTileBackground = studioHeatmapLevelPatternTileBackground(
    state,
    level
  );
  const patternOpacity = studioHeatmapLevelPatternOpacity(state, level);
  const patternDotsFill = studioHeatmapLevelPatternDotsFill(state, level);
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
        <Switch
          checked={patternEnabled}
          id={`heatmap-level-${level}-pattern`}
          onCheckedChange={(checked) => {
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
                setStudioHeatmapLevelPattern(state, level, "diagonal")
              );
            }
          }}
        />
      </StudioControlRow>

      {patternEnabled ? (
        <div className="space-y-3 border-border border-t pt-3">
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

          {pattern === "dots" ? (
            <>
              <HeatmapPipeColorField
                color={patternColor || strokePreviewColor}
                label="Color"
                onColorChange={(value) => commitPatternColor(value)}
                onColorPreview={(value) => commitPatternColor(value, true)}
              />
              <SliderInputGroup
                label="Spacing"
                max={4}
                min={0.25}
                onCommit={(value) =>
                  commit(
                    "heatmapLevelPatternScales",
                    setStudioHeatmapLevelPatternScale(state, level, value)
                  )
                }
                onPreview={(value) =>
                  preview(
                    "heatmapLevelPatternScales",
                    setStudioHeatmapLevelPatternScale(state, level, value)
                  )
                }
                step={0.25}
                value={patternScale}
              />
              <SliderInputGroup
                label="Dot size"
                max={8}
                min={0.25}
                onCommit={(value) =>
                  commit(
                    "heatmapLevelPatternRadii",
                    setStudioHeatmapLevelPatternRadius(state, level, value)
                  )
                }
                onPreview={(value) =>
                  preview(
                    "heatmapLevelPatternRadii",
                    setStudioHeatmapLevelPatternRadius(state, level, value)
                  )
                }
                step={0.25}
                value={patternRadius}
              />
              <StudioControlRow alignControl="end" label="Fill">
                <Switch
                  checked={patternDotsFill}
                  id={`heatmap-level-${level}-dots-fill`}
                  onCheckedChange={(checked) =>
                    commit(
                      "heatmapLevelPatternDotsFills",
                      setStudioHeatmapLevelPatternDotsFill(
                        state,
                        level,
                        checked
                      )
                    )
                  }
                />
              </StudioControlRow>
            </>
          ) : null}

          {pattern === "circles" ? (
            <>
              <HeatmapPipeColorField
                color={patternColor || strokePreviewColor}
                label="Stroke"
                onColorChange={(value) => commitPatternColor(value)}
                onColorPreview={(value) => commitPatternColor(value, true)}
              />
              <SliderInputGroup
                label="Spacing"
                max={4}
                min={0.25}
                onCommit={(value) =>
                  commit(
                    "heatmapLevelPatternScales",
                    setStudioHeatmapLevelPatternScale(state, level, value)
                  )
                }
                onPreview={(value) =>
                  preview(
                    "heatmapLevelPatternScales",
                    setStudioHeatmapLevelPatternScale(state, level, value)
                  )
                }
                step={0.25}
                value={patternScale}
              />
              <SliderInputGroup
                label="Stroke width"
                max={4}
                min={0}
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
              <SliderInputGroup
                label="Radius"
                max={8}
                min={0.5}
                onCommit={(value) =>
                  commit(
                    "heatmapLevelPatternRadii",
                    setStudioHeatmapLevelPatternRadius(state, level, value)
                  )
                }
                onPreview={(value) =>
                  preview(
                    "heatmapLevelPatternRadii",
                    setStudioHeatmapLevelPatternRadius(state, level, value)
                  )
                }
                step={0.5}
                value={patternRadius}
              />
              <StudioControlRow alignControl="end" label="Complement">
                <Switch
                  checked={patternComplement}
                  id={`heatmap-level-${level}-complement`}
                  onCheckedChange={(checked) =>
                    commit(
                      "heatmapLevelPatternComplements",
                      setStudioHeatmapLevelPatternComplement(
                        state,
                        level,
                        checked
                      )
                    )
                  }
                />
              </StudioControlRow>
              <HeatmapPipeColorField
                color={patternFill || baseColor}
                label="Fill"
                onColorChange={(value) =>
                  commit(
                    "heatmapLevelPatternFills",
                    setStudioHeatmapLevelPatternFill(state, level, value)
                  )
                }
                onColorPreview={(value) =>
                  preview(
                    "heatmapLevelPatternFills",
                    setStudioHeatmapLevelPatternFill(state, level, value)
                  )
                }
              />
            </>
          ) : null}

          {isLinePattern(pattern) ? (
            <>
              <HeatmapPipeColorField
                color={patternColor || strokePreviewColor}
                label="Stroke"
                onColorChange={(value) => commitPatternColor(value)}
                onColorPreview={(value) => commitPatternColor(value, true)}
              />
              <SliderInputGroup
                label="Scale"
                max={4}
                min={0.25}
                onCommit={(value) =>
                  commit(
                    "heatmapLevelPatternScales",
                    setStudioHeatmapLevelPatternScale(state, level, value)
                  )
                }
                onPreview={(value) =>
                  preview(
                    "heatmapLevelPatternScales",
                    setStudioHeatmapLevelPatternScale(state, level, value)
                  )
                }
                step={0.25}
                value={patternScale}
              />
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
            </>
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
