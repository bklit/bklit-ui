"use client";

import { Icon } from "@bklitui/icons";
import { cn } from "@bklitui/ui/lib/utils";
import { useState } from "react";
import { ChartPaletteStrip } from "@/components/chart-palette/chart-palette-editor";
import {
  COLOR_PRESETS,
  type ColorPresetId,
  presetSwatchColors,
  presetSwatchGradient,
} from "@/lib/color-presets";
import { useOptionalStudioThemeMode } from "@/providers/studio-theme-provider";
import { Button } from "@/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/popover";

export function PresetSwatch({
  id,
  className,
}: {
  id: ColorPresetId;
  className?: string;
}) {
  const mode = useOptionalStudioThemeMode();
  return (
    <span
      className={cn("block shrink-0 rounded-full", className)}
      style={{ background: presetSwatchGradient(id, mode) }}
    />
  );
}

export function PresetSelect({
  value,
  onChange,
  disabled = false,
}: {
  value: ColorPresetId;
  onChange: (id: ColorPresetId) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const mode = useOptionalStudioThemeMode();
  const active = COLOR_PRESETS.find((p) => p.id === value);

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger
        render={
          <Button
            aria-expanded={open}
            aria-label="Chart palette"
            className="h-10 gap-2 px-3 text-sm sm:h-10"
            disabled={disabled}
            type="button"
            variant="outline"
          />
        }
      >
        <ChartPaletteStrip colors={presetSwatchColors(value, mode)} />
        <span className="max-w-[7.5rem] truncate">
          {active?.label ?? "Palette"}
        </span>
        <Icon
          className="size-3.5 shrink-0 text-muted-foreground"
          name="IconChevronGrabberVertical"
        />
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-52"
        side="bottom"
        sideOffset={8}
        viewportClassName="p-1.5"
      >
        <p className="px-2 py-1.5 font-medium text-[11px] text-muted-foreground uppercase tracking-wide">
          Palette
        </p>
        <div className="flex flex-col gap-0.5">
          {COLOR_PRESETS.map((p) => {
            const selected = p.id === value;
            return (
              <button
                aria-pressed={selected}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm transition-colors",
                  selected
                    ? "bg-accent/15 text-foreground"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                )}
                key={p.id}
                onClick={() => {
                  onChange(p.id);
                  setOpen(false);
                }}
                type="button"
              >
                <ChartPaletteStrip colors={presetSwatchColors(p.id, mode)} />
                <span className="truncate">{p.label}</span>
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
