"use client";

import { FillPicker } from "@/components/controls/fill-picker";
import { StudioControlGroup } from "@/components/studio-control-group";
import type { PatternPresetId } from "@/lib/pattern-presets";
import type { StudioUrlState } from "@/lib/studio-parsers";
import {
  buildSeriesColorsUpdate,
  buildSeriesFillModeUpdate,
  buildSeriesPatternsUpdate,
  getDesignSeriesCount,
  getDesignSeriesLabel,
  getEffectiveSeriesColor,
  getSeriesFillMode,
  getSeriesPattern,
  type SeriesFillMode,
} from "@/lib/studio-series-design";

export function StudioDesignSection({
  state,
  onChange,
  disabled = false,
  supportsPatterns = false,
}: {
  state: StudioUrlState;
  onChange: <K extends keyof StudioUrlState>(
    key: K,
    value: StudioUrlState[K]
  ) => void;
  disabled?: boolean;
  supportsPatterns?: boolean;
}) {
  const seriesCount = getDesignSeriesCount(state.chart, state);

  const handleColorChange = (seriesIndex: number, color: string) => {
    onChange(
      "seriesColors",
      buildSeriesColorsUpdate(state, seriesIndex, color)
    );
    if (seriesIndex === 0) {
      onChange("chartAccent", color);
    }
  };

  const handleFillModeChange = (seriesIndex: number, mode: SeriesFillMode) => {
    const update = buildSeriesFillModeUpdate(state, seriesIndex, mode);
    onChange("seriesPatterns", update.seriesPatterns);
    if (seriesIndex === 0) {
      const pattern =
        mode === "pattern"
          ? getSeriesPattern(
              {
                ...state,
                seriesPatterns: update.seriesPatterns,
              },
              0
            )
          : "none";
      onChange("pattern", pattern);
    }
  };

  const handlePatternChange = (
    seriesIndex: number,
    pattern: PatternPresetId
  ) => {
    onChange(
      "seriesPatterns",
      buildSeriesPatternsUpdate(state, seriesIndex, pattern)
    );
    if (seriesIndex === 0) {
      onChange("pattern", pattern);
    }
  };

  return (
    <StudioControlGroup collapsible defaultOpen title="Design">
      <div className="space-y-3">
        {Array.from({ length: seriesCount }, (_, seriesIndex) => (
          <FillPicker
            color={getEffectiveSeriesColor(state, seriesIndex)}
            disabled={disabled}
            fillMode={getSeriesFillMode(state, seriesIndex)}
            key={getDesignSeriesLabel(seriesIndex)}
            label={seriesCount > 1 ? getDesignSeriesLabel(seriesIndex) : "Fill"}
            onColorChange={(color) => handleColorChange(seriesIndex, color)}
            onFillModeChange={(mode) => handleFillModeChange(seriesIndex, mode)}
            onPatternChange={(pattern) =>
              handlePatternChange(seriesIndex, pattern)
            }
            pattern={getSeriesPattern(state, seriesIndex)}
            supportsPattern={supportsPatterns}
          />
        ))}
      </div>
    </StudioControlGroup>
  );
}
