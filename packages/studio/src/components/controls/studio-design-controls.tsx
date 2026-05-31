"use client";

import { FillPicker, ThemePresetList } from "@/components/controls/fill-picker";
import type { ColorPresetId } from "@/lib/color-presets";
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
  design,
  disabled = false,
  supportsPatterns = false,
}: {
  state: StudioUrlState;
  onBatchChange: (updates: Partial<StudioUrlState>) => void;
  design: StudioComponentDesign;
  disabled?: boolean;
  supportsPatterns?: boolean;
}) {
  const seriesIndex = design.seriesIndex ?? 0;
  const showPalette = design.showPalette ?? seriesIndex === 0;
  const patternEnabled = design.supportsPattern ?? supportsPatterns;

  const handlePresetChange = (id: ColorPresetId) => {
    onBatchChange({
      chartAccent: "",
      seriesColors: "",
      preset: id,
    });
  };

  const handleColorChange = (color: string) => {
    const updates: Partial<StudioUrlState> = {
      seriesColors: buildSeriesColorsUpdate(state, seriesIndex, color),
    };
    if (seriesIndex === 0) {
      updates.chartAccent = color;
    }
    onBatchChange(updates);
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
    <div className="space-y-3">
      {showPalette ? (
        <ThemePresetList
          chartAccent={state.chartAccent}
          onPresetChange={handlePresetChange}
          preset={state.preset}
          seriesColors={state.seriesColors}
        />
      ) : null}

      <FillPicker
        color={getEffectiveSeriesColor(state, seriesIndex)}
        disabled={disabled}
        fillMode={getSeriesFillMode(state, seriesIndex)}
        label="Fill"
        onColorChange={handleColorChange}
        onFillModeChange={handleFillModeChange}
        onPatternChange={handlePatternChange}
        pattern={getSeriesPattern(state, seriesIndex)}
        supportsPattern={patternEnabled}
      />
    </div>
  );
}
