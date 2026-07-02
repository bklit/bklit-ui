"use client";

import { Icon } from "@bklitui/icons";
import { cn } from "@bklitui/ui/lib/utils";
import { useMemo, useState } from "react";
import { studioFieldLabelClass } from "@/components/controls/control-field-helpers";
import { StudioColorPicker } from "@/components/controls/studio-color-picker";
import { resolveCssColor } from "@/lib/chart-theme-color";
import { studioScrubSurfaceClass } from "@/lib/studio-chrome-classes";
import {
  pickerStatePreviewCss,
  studioColorToOklchField,
  studioColorToPickerState,
} from "@/lib/studio-color-picker-value";
import type { SeriesGradientStop } from "@/lib/studio-series-design";
import { Input } from "@/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/popover";
import {
  studioSidebarPopoverCollisionAvoidance,
  studioSidebarPopoverSideOffset,
} from "@/ui/studio-sidebar-popover";

const MAX_STOPS = 4;

export function gradientStopsToCss(
  stops: SeriesGradientStop[],
  direction: "to bottom" | "to right" = "to bottom"
): string {
  const sorted = [...stops].sort((a, b) => a.offset - b.offset);
  const parts = sorted.map((stop) => {
    const trimmed = stop.color.trim();
    const color = trimmed.startsWith("oklch(")
      ? pickerStatePreviewCss(studioColorToPickerState(trimmed))
      : resolveCssColor(trimmed);
    return `${color} ${stop.offset}%`;
  });
  return `linear-gradient(${direction}, ${parts.join(", ")})`;
}

function formatStopColorLabel(color: string): string {
  const body = studioColorToOklchField(color);
  if (body) {
    return `oklch(${body})`;
  }
  return color;
}

function StopColorSwatch({
  color,
  disabled,
  selected,
  onChange,
  onSelect,
}: {
  color: string;
  disabled?: boolean;
  selected?: boolean;
  onChange: (color: string) => void;
  onSelect?: () => void;
}) {
  const [open, setOpen] = useState(false);

  const previewColor = useMemo(() => {
    const trimmed = color.trim();
    if (trimmed.startsWith("oklch(")) {
      return pickerStatePreviewCss(studioColorToPickerState(trimmed));
    }
    return resolveCssColor(trimmed);
  }, [color]);

  return (
    <Popover
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          onSelect?.();
        }
      }}
      open={open}
    >
      <PopoverTrigger
        aria-expanded={open}
        disabled={disabled}
        render={
          <button
            aria-label="Edit stop color"
            className={cn(
              "flex size-6 shrink-0 items-center justify-center overflow-hidden rounded-[4px] outline-none ring-offset-background transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring/50",
              selected && "ring-2 ring-ring/50",
              disabled && "pointer-events-none opacity-50"
            )}
            type="button"
          />
        }
      >
        <span
          className="block size-full rounded-[3px]"
          style={{ background: previewColor }}
        />
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[min(calc(100vw-2rem),18rem)] gap-3 p-3"
        collisionAvoidance={studioSidebarPopoverCollisionAvoidance}
        positionMethod="fixed"
        side="left"
        sideOffset={studioSidebarPopoverSideOffset}
      >
        <StudioColorPicker
          color={color}
          disabled={disabled}
          onChange={(next) => {
            onChange(next);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

export function FillGradientEditor({
  stops,
  disabled = false,
  onStopsChange,
}: {
  stops: SeriesGradientStop[];
  disabled?: boolean;
  onStopsChange: (stops: SeriesGradientStop[]) => void;
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const previewCss = useMemo(() => gradientStopsToCss(stops), [stops]);

  const updateStop = (index: number, patch: Partial<SeriesGradientStop>) => {
    onStopsChange(
      stops.map((stop, i) => (i === index ? { ...stop, ...patch } : stop))
    );
  };

  const addStop = () => {
    if (stops.length >= MAX_STOPS) {
      return;
    }
    const last = stops.at(-1)?.offset ?? 100;
    const nextOffset = Math.min(100, last + 10);
    onStopsChange([
      ...stops,
      {
        offset: nextOffset,
        color: stops.at(-1)?.color ?? "var(--chart-1)",
      },
    ]);
  };

  const removeStop = (index: number) => {
    if (stops.length <= 2) {
      return;
    }
    onStopsChange(stops.filter((_, i) => i !== index));
    setSelectedIndex((current) =>
      current >= index ? Math.max(0, current - 1) : current
    );
  };

  return (
    <div className="flex flex-col gap-3">
      <div
        aria-hidden="true"
        className="h-6 w-full rounded-md border border-border/60"
        style={{ background: previewCss }}
      />

      <div className="flex items-center justify-between gap-2">
        <span className={studioFieldLabelClass}>Stops</span>
        {stops.length < MAX_STOPS ? (
          <button
            aria-label="Add stop"
            className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
            disabled={disabled}
            onClick={addStop}
            type="button"
          >
            <Icon className="size-4" name="IconPlusSmall" />
          </button>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        {stops.map((stop, index) => (
          <div
            className={cn(
              "flex min-w-0 items-center gap-1.5 rounded-md px-1 py-0.5",
              selectedIndex === index && "ring-1 ring-ring/40"
            )}
            key={`${index}-${stop.offset}`}
          >
            <Input
              className={cn(
                "h-8 w-12 shrink-0 px-1.5 text-xs tabular-nums",
                studioScrubSurfaceClass
              )}
              disabled={disabled}
              max={100}
              min={0}
              onChange={(event) =>
                updateStop(index, {
                  offset: Number.parseFloat(event.target.value) || 0,
                })
              }
              step={1}
              type="number"
              value={stop.offset}
            />
            <span className="shrink-0 text-muted-foreground text-xs">%</span>
            <StopColorSwatch
              color={stop.color}
              disabled={disabled}
              onChange={(color) => updateStop(index, { color })}
              onSelect={() => setSelectedIndex(index)}
              selected={selectedIndex === index}
            />
            <span className="min-w-0 flex-1 truncate font-mono text-[10px] text-foreground lowercase">
              {formatStopColorLabel(stop.color)}
            </span>
            {stops.length > 2 ? (
              <button
                aria-label="Remove stop"
                className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
                disabled={disabled}
                onClick={() => removeStop(index)}
                type="button"
              >
                <Icon className="size-4" name="IconMinusSmall" />
              </button>
            ) : (
              <span className="size-7 shrink-0" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
