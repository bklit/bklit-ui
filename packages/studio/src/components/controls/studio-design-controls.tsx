"use client";

import { FillPicker } from "@/components/controls/fill-picker";
import type { PatternPresetId } from "@/lib/pattern-presets";
import type { StudioUrlState } from "@/lib/studio-parsers";
import {
  buildSeriesColorsUpdate,
  buildSeriesFillModeUpdate,
  buildSeriesPatternsUpdate,
  getEffectiveSeriesColor,
  getSeriesFillMode,
  getSeriesPattern,
  type SeriesFillMode,
} from "@/lib/studio-series-design";
import type { StudioComponentDesign } from "@/lib/types";

export function StudioDesignControls({
  state,
  onBatchChange,
  onBatchPreview,
  design,
  disabled = false,
  supportsPatterns = false,
}: {
  state: StudioUrlState;
  onBatchChange: (updates: Partial<StudioUrlState>) => void;
  onBatchPreview?: (updates: Partial<StudioUrlState>) => void;
  design: StudioComponentDesign;
  disabled?: boolean;
  supportsPatterns?: boolean;
}) {
  const seriesIndex = design.seriesIndex ?? 0;
  const accentKey = design.accentKey;
  const patternEnabled =
    !accentKey && (design.supportsPattern ?? supportsPatterns);
  const pickerColor = accentKey
    ? String(state[accentKey] ?? "")
    : getEffectiveSeriesColor(state, seriesIndex);

  const colorUpdates = (color: string): Partial<StudioUrlState> => {
    const updates: Partial<StudioUrlState> = {
      seriesColors: buildSeriesColorsUpdate(state, seriesIndex, color),
    };
    if (seriesIndex === 0) {
      updates.chartAccent = color;
    }
    return updates;
  };

  const handleColorPreview = (color: string) => {
    if (accentKey) {
      onBatchPreview?.({ [accentKey]: color } as Partial<StudioUrlState>);
      return;
    }
    onBatchPreview?.(colorUpdates(color));
  };

  const handleColorCommit = (color: string) => {
    if (accentKey) {
      onBatchChange({ [accentKey]: color } as Partial<StudioUrlState>);
      return;
    }
    onBatchChange(colorUpdates(color));
  };

  const handleFillModeChange = (mode: SeriesFillMode) => {
    const update = buildSeriesFillModeUpdate(state, seriesIndex, mode);
    const updates: Partial<StudioUrlState> = {
      seriesPatterns: update.seriesPatterns,
    };
    if (seriesIndex === 0) {
      updates.pattern =
        mode === "pattern"
          ? getSeriesPattern(
              {
                ...state,
                seriesPatterns: update.seriesPatterns,
              },
              0
            )
          : "none";
    }
    onBatchChange(updates);
  };

  const handlePatternChange = (pattern: PatternPresetId) => {
    if (pattern === "none") {
      handleFillModeChange("solid");
      return;
    }

    const updates: Partial<StudioUrlState> = {
      seriesPatterns: buildSeriesPatternsUpdate(state, seriesIndex, pattern),
    };
    if (seriesIndex === 0) {
      updates.pattern = pattern;
    }
    onBatchChange(updates);
  };

  return (
    <FillPicker
      color={pickerColor}
      disabled={disabled}
      fillMode={accentKey ? "solid" : getSeriesFillMode(state, seriesIndex)}
      label={design.colorLabel ?? "Fill"}
      onColorChange={handleColorCommit}
      onColorPreview={handleColorPreview}
      onFillModeChange={handleFillModeChange}
      onPatternChange={handlePatternChange}
      pattern={accentKey ? "none" : getSeriesPattern(state, seriesIndex)}
      supportsPattern={patternEnabled}
    />
  );
}
