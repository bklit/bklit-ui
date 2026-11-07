"use client";

import {
  PATTERN_PRESETS,
  type PatternPresetFamily,
  type PatternPresetMeta,
  renderPatternPreset,
} from "@bklitui/ui/charts";
import { cn } from "@bklitui/ui/lib/utils";
import { useId } from "react";
import type { PatternPresetId } from "@/lib/pattern-presets";
import { SlidingToggleControl } from "@/ui/segmented-control";

/** Swatch viewBox — fits at least one tile of the largest (24px) presets. */
const SWATCH_VIEWBOX = 24;

/** Live preview of a preset, painted in `currentColor`. */
export function PatternSwatch({
  preset,
  className,
}: {
  preset: PatternPresetId;
  className?: string;
}) {
  const uid = useId();
  const patternId = `${uid}-${preset}`;

  if (preset === "none") {
    return <span className={cn("block size-full bg-current", className)} />;
  }

  return (
    <svg
      aria-hidden
      className={cn("block size-full shrink-0 overflow-hidden", className)}
      viewBox={`0 0 ${SWATCH_VIEWBOX} ${SWATCH_VIEWBOX}`}
    >
      {renderPatternPreset(preset, patternId, { color: "currentColor" })}
      <rect
        fill={`url(#${patternId})`}
        height={SWATCH_VIEWBOX}
        width={SWATCH_VIEWBOX}
      />
    </svg>
  );
}

/** Picker sections, in display order. */
const PATTERN_PICKER_GROUPS: {
  label: string;
  presets: PatternPresetMeta[];
}[] = (
  [
    { label: "Lines", families: ["lines"] },
    { label: "Grids & dashes", families: ["grids", "dashed"] },
    { label: "Dots", families: ["dots"] },
    { label: "Circles", families: ["circles"] },
    { label: "Tiles", families: ["tiles"] },
  ] satisfies { label: string; families: PatternPresetFamily[] }[]
).map(({ label, families }) => ({
  label,
  presets: PATTERN_PRESETS.filter((preset) =>
    (families as PatternPresetFamily[]).includes(preset.family)
  ),
}));

const PATTERN_PICKER_COLUMNS = Math.max(
  ...PATTERN_PICKER_GROUPS.map((group) => group.presets.length)
);

/**
 * Pattern style picker — every preset as a live swatch, one row per family.
 * Each row is its own radio group; only the row holding the value shows the
 * selection pill.
 */
export function PatternPicker({
  value,
  onChange,
}: {
  value: PatternPresetId;
  onChange: (v: PatternPresetId) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {PATTERN_PICKER_GROUPS.map((group) => (
        <div className="flex flex-col gap-0.5" key={group.label}>
          <p className="text-[10px] text-muted-foreground leading-none">
            {group.label}
          </p>
          <SlidingToggleControl
            aria-label={`${group.label} patterns`}
            columns={PATTERN_PICKER_COLUMNS}
            onValueChange={onChange}
            options={group.presets.map((preset) => ({
              value: preset.id,
              label: (
                <PatternSwatch className="size-[18px]" preset={preset.id} />
              ),
              "aria-label": preset.label,
              title: preset.label,
            }))}
            value={value}
            variant="swatch"
          />
        </div>
      ))}
    </div>
  );
}
