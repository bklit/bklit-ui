"use client";

import { cn } from "@bklitui/ui/lib/utils";
import { Grid3x3Icon, SquareIcon } from "lucide-react";
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
  StudioSingleToggleGroup,
  ToggleGroupItem,
} from "@/components/controls/studio-toggle-group";
import {
  isValidOklchColor,
  parseColorMix,
  parseOpacityFromColor,
  resolveCssColor,
  stripOklchWrapper,
} from "@/lib/chart-theme-color";
import { COLOR_PRESETS, type ColorPresetId } from "@/lib/color-presets";
import type { PatternPresetId } from "@/lib/pattern-presets";
import { studioColorHexField } from "@/lib/studio-color-picker-value";
import type { SeriesFillMode } from "@/lib/studio-series-design";
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/popover";

function formatTriggerLabel(color: string): string {
  if (isValidOklchColor(color)) {
    const body = stripOklchWrapper(color);
    return `oklch(${body})`;
  }
  return studioColorHexField(color);
}

export function FillPicker({
  label,
  color,
  fillMode,
  pattern,
  supportsPattern = true,
  disabled = false,
  onColorChange,
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
  onFillModeChange: (mode: SeriesFillMode) => void;
  onPatternChange: (pattern: PatternPresetId) => void;
}) {
  const [open, setOpen] = useState(false);

  const previewColor = useMemo(() => resolveCssColor(color), [color]);
  const opacity = useMemo(() => {
    const mix = parseColorMix(color);
    if (mix) {
      return mix.opacity;
    }
    return parseOpacityFromColor(color);
  }, [color]);

  const triggerPreview =
    fillMode === "pattern" && pattern !== "none" ? (
      <span className="size-4 shrink-0 overflow-hidden rounded-[4px] ring-1 ring-border">
        <PatternSwatch preset={pattern} />
      </span>
    ) : (
      <span
        className="size-4 shrink-0 rounded-[4px] ring-1 ring-border"
        style={{ background: previewColor }}
      />
    );

  const triggerLabel =
    fillMode === "pattern" ? pattern : formatTriggerLabel(color);

  return (
    <div className="flex flex-col gap-1.5">
      {label ? <p className={studioFieldLabelClass}>{label}</p> : null}
      <Popover onOpenChange={setOpen} open={open}>
        <PopoverTrigger
          className={cn(
            "flex h-9 w-full items-center gap-2 rounded-lg px-2 text-left outline-none transition-colors",
            studioInputSurfaceClass,
            "hover:bg-[var(--studio-input-background)] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
            disabled && "pointer-events-none opacity-50"
          )}
          disabled={disabled}
          type="button"
        >
          {triggerPreview}
          <span className="min-w-0 flex-1 truncate font-mono text-foreground text-xs capitalize">
            {triggerLabel}
          </span>
          {fillMode === "solid" ? (
            <span className="shrink-0 border-border border-l pl-2 font-mono text-muted-foreground text-xs tabular-nums">
              {opacity}%
            </span>
          ) : null}
        </PopoverTrigger>

        <PopoverContent
          align="center"
          className="w-[min(calc(100vw-2rem),18rem)] gap-3 p-3"
          side="bottom"
          sideOffset={8}
        >
          {supportsPattern ? (
            <StudioSingleToggleGroup
              className="rounded-md border border-input bg-muted/20 p-1"
              onValueChange={onFillModeChange}
              size="sm"
              spacing={2}
              value={fillMode}
              variant="studio"
            >
              <ToggleGroupItem
                aria-label="Solid fill"
                className="size-8 min-h-8 flex-1"
                value="solid"
              >
                <SquareIcon className="size-3.5 fill-current" strokeWidth={0} />
              </ToggleGroupItem>
              <ToggleGroupItem
                aria-label="Pattern fill"
                className="size-8 min-h-8 flex-1"
                value="pattern"
              >
                <Grid3x3Icon className="size-3.5" strokeWidth={1.75} />
              </ToggleGroupItem>
            </StudioSingleToggleGroup>
          ) : null}

          {fillMode === "pattern" && supportsPattern ? (
            <PatternPicker onChange={onPatternChange} value={pattern} />
          ) : (
            <StudioColorPicker
              color={color}
              disabled={disabled}
              onChange={onColorChange}
            />
          )}
        </PopoverContent>
      </Popover>
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
    <div className="flex flex-col gap-0.5">
      <p className="px-0.5 font-medium text-[10px] text-muted-foreground uppercase tracking-wide">
        Palette
      </p>
      <div className="grid grid-cols-1 gap-0.5">
        {COLOR_PRESETS.map((item) => {
          const selected = item.id === preset && !hasCustomColors;
          return (
            <button
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors",
                selected
                  ? "bg-accent/10 text-foreground ring-1 ring-accent/25"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              )}
              key={item.id}
              onClick={() => onPresetChange(item.id)}
              type="button"
            >
              <PresetSwatch className="size-3.5" id={item.id} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
