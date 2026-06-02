"use client";

import { cn } from "@bklitui/ui/lib/utils";
import { useMemo, useState } from "react";
import {
  studioFieldLabelClass,
  studioInputSurfaceClass,
} from "@/components/controls/control-field-helpers";
import {
  PatternPicker,
  PatternSwatch,
} from "@/components/controls/pattern-picker";
import { PresetSwatch } from "@/components/controls/preset-select";
import { StudioColorPicker } from "@/components/controls/studio-color-picker";
import {
  StudioTab,
  StudioTabs,
} from "@/components/controls/studio-toggle-group";
import {
  parseColorMix,
  parseOpacityFromColor,
  resolveCssColor,
} from "@/lib/chart-theme-color";
import { COLOR_PRESETS, type ColorPresetId } from "@/lib/color-presets";
import type { PatternPresetId } from "@/lib/pattern-presets";
import {
  pickerStatePreviewCss,
  studioColorToOklchField,
  studioColorToPickerState,
} from "@/lib/studio-color-picker-value";
import type { SeriesFillMode } from "@/lib/studio-series-design";
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/popover";

function formatTriggerLabel(color: string): string {
  const body = studioColorToOklchField(color);
  return body ? `oklch(${body})` : color;
}

function FillSwatch({
  fillMode,
  pattern,
  previewColor,
}: {
  fillMode: SeriesFillMode;
  pattern: PatternPresetId;
  previewColor: string;
}) {
  if (fillMode === "pattern" && pattern !== "none") {
    return <PatternSwatch preset={pattern} />;
  }

  return (
    <span
      className="block size-full rounded-[3px] ring-1 ring-border ring-inset"
      style={{ background: previewColor }}
    />
  );
}

export function FillPicker({
  label,
  color,
  fillMode,
  pattern,
  supportsPattern = true,
  disabled = false,
  onColorChange,
  onColorPreview,
  onFillModeChange,
  onPatternChange,
}: {
  label?: string;
  color: string;
  fillMode: SeriesFillMode;
  pattern: PatternPresetId;
  supportsPattern?: boolean;
  disabled?: boolean;
  onColorChange: (value: string) => void;
  onColorPreview?: (value: string) => void;
  onFillModeChange: (mode: SeriesFillMode) => void;
  onPatternChange: (pattern: PatternPresetId) => void;
}) {
  const [colorOpen, setColorOpen] = useState(false);

  const previewColor = useMemo(() => {
    const trimmed = color.trim();
    if (trimmed.startsWith("oklch(")) {
      return pickerStatePreviewCss(studioColorToPickerState(trimmed));
    }
    return resolveCssColor(color);
  }, [color]);
  const opacity = useMemo(() => {
    const mix = parseColorMix(color);
    if (mix) {
      return mix.opacity;
    }
    return parseOpacityFromColor(color);
  }, [color]);

  const triggerLabel = formatTriggerLabel(color);

  return (
    <div className="flex flex-col gap-2">
      {label ? <p className={studioFieldLabelClass}>{label}</p> : null}

      {supportsPattern ? (
        <StudioTabs
          layout="segmented"
          onValueChange={onFillModeChange}
          value={fillMode}
        >
          <StudioTab value="solid">Solid</StudioTab>
          <StudioTab value="pattern">Pattern</StudioTab>
        </StudioTabs>
      ) : null}

      <div
        className={cn(
          "flex h-9 w-full min-w-0 items-center gap-2 rounded-lg px-2",
          studioInputSurfaceClass,
          disabled && "pointer-events-none opacity-50"
        )}
      >
        <Popover onOpenChange={setColorOpen} open={colorOpen}>
          <PopoverTrigger
            className="flex size-4 shrink-0 items-center justify-center overflow-hidden rounded-[4px] outline-none transition-opacity hover:opacity-80 focus-visible:ring-[3px] focus-visible:ring-ring/50"
            disabled={disabled}
            type="button"
          >
            <FillSwatch
              fillMode={fillMode}
              pattern={pattern}
              previewColor={previewColor}
            />
          </PopoverTrigger>

          <PopoverContent
            align="start"
            className="w-[min(calc(100vw-2rem),18rem)] gap-3 p-3"
            side="left"
            sideOffset={8}
          >
            <StudioColorPicker
              color={color}
              disabled={disabled}
              onChange={onColorChange}
              onPreview={onColorPreview}
            />
          </PopoverContent>
        </Popover>

        <span className="min-w-0 flex-1 truncate font-mono text-foreground text-xs lowercase">
          {triggerLabel}
        </span>
        <span className="shrink-0 border-border border-l pl-2 font-mono text-muted-foreground text-xs tabular-nums">
          {opacity}%
        </span>
      </div>

      {fillMode === "pattern" && supportsPattern ? (
        <PatternPicker onChange={onPatternChange} value={pattern} />
      ) : null}
    </div>
  );
}

export function ThemePresetList({
  preset,
  chartAccent,
  seriesColors,
  onPresetChange,
}: {
  preset: ColorPresetId;
  chartAccent: string;
  seriesColors: string;
  onPresetChange: (id: ColorPresetId) => void;
}) {
  const hasCustomColors =
    Boolean(chartAccent.trim()) ||
    seriesColors.split("|").some((part) => part.trim());

  return (
    <div className="flex flex-col gap-2">
      <p className={studioFieldLabelClass}>Palette</p>
      <div className="flex flex-wrap items-center gap-2">
        {COLOR_PRESETS.map((item) => {
          const selected = item.id === preset && !hasCustomColors;
          return (
            <button
              aria-label={item.label}
              aria-pressed={selected}
              className={cn(
                "flex size-3.5 shrink-0 items-center justify-center rounded-full ring-2 ring-transparent ring-offset-1 ring-offset-background transition-[box-shadow]",
                selected ? "ring-white" : "hover:ring-accent"
              )}
              key={item.id}
              onClick={() => onPresetChange(item.id)}
              title={item.label}
              type="button"
            >
              <PresetSwatch className="size-full ring-0" id={item.id} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
