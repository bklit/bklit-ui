"use client";

import { cn } from "@bklitui/ui/lib/utils";
import { useState } from "react";
import { StudioColorPicker } from "@/components/controls/studio-color-picker";
import {
  CHART_PALETTE_VAR_LABELS,
  CHART_PALETTE_VAR_NAMES,
  type ChartPaletteColors,
  type ChartPaletteVarName,
} from "@/lib/chart-palettes";

/** Row of chart-1 … chart-5 dots for palette menus and triggers. */
export function ChartPaletteStrip({
  colors,
  className,
  dotClassName,
}: {
  colors: readonly string[];
  className?: string;
  dotClassName?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn("inline-flex shrink-0 items-center", className)}
    >
      {colors.map((color, index) => (
        <span
          className={cn(
            "not-first:-ml-1 size-2.5 rounded-full shadow-[0_0_0_1.5px_var(--popover)]",
            dotClassName
          )}
          key={index}
          style={{ backgroundColor: color }}
        />
      ))}
    </span>
  );
}

/**
 * Swatches for `--chart-1` … `--chart-5`, `--chart-positive`, `--chart-negative`.
 * The selected swatch is edited with the Studio OKLCH picker below the row.
 */
export function ChartPaletteEditor({
  colors,
  onPreview,
  onChange,
  className,
}: {
  colors: ChartPaletteColors;
  /** Live preview while dragging (do not persist). */
  onPreview: (name: ChartPaletteVarName, value: string) => void;
  /** Commit (persist) a color. */
  onChange: (name: ChartPaletteVarName, value: string) => void;
  className?: string;
}) {
  const [selected, setSelected] = useState<ChartPaletteVarName>("chart-1");

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <fieldset className="grid grid-cols-7 gap-1.5">
        <legend className="sr-only">Palette color to edit</legend>
        {CHART_PALETTE_VAR_NAMES.map((name) => {
          const isSelected = name === selected;
          return (
            <button
              aria-label={`Edit ${CHART_PALETTE_VAR_LABELS[name]} (${colors[name]})`}
              aria-pressed={isSelected}
              className={cn(
                "aspect-square w-full rounded-md border border-border outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-ring",
                isSelected &&
                  "ring-2 ring-foreground ring-offset-2 ring-offset-popover"
              )}
              key={name}
              onClick={() => setSelected(name)}
              style={{ backgroundColor: colors[name] }}
              title={CHART_PALETTE_VAR_LABELS[name]}
              type="button"
            />
          );
        })}
      </fieldset>
      <p className="flex items-center justify-between font-mono text-[11px] text-muted-foreground">
        <span>--{selected}</span>
        <span>{CHART_PALETTE_VAR_LABELS[selected]}</span>
      </p>
      <StudioColorPicker
        color={colors[selected]}
        onChange={(value) => {
          if (value) {
            onChange(selected, value);
          }
        }}
        onPreview={(value) => onPreview(selected, value)}
      />
    </div>
  );
}
