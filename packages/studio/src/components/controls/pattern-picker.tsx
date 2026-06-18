"use client";

import { PatternLines, renderPatternPreset } from "@bklitui/ui/charts";
import { cn } from "@bklitui/ui/lib/utils";
import { useId } from "react";
import { IconToggleGroup } from "@/components/controls/icon-toggle-group";
import { StudioToggleGroupItem } from "@/components/controls/studio-toggle-group";
import { PATTERN_PRESETS, type PatternPresetId } from "@/lib/patterns";

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
    return (
      <span
        className={cn("block size-full rounded-[3px] bg-current", className)}
      />
    );
  }

  const patternNode = renderPatternPreset(preset, patternId, {
    color: "currentColor",
    scale: preset === "dots" ? 0.8 : 1,
    radius: preset === "dots" ? 1.2 : 2,
  });

  return (
    <svg
      aria-hidden
      className={cn(
        "block size-full shrink-0 overflow-hidden rounded-[3px]",
        className
      )}
      viewBox="0 0 24 24"
    >
      <title>{preset}</title>
      <defs>
        {patternNode ?? (
          <PatternLines
            height={6}
            id={patternId}
            orientation={["diagonal"]}
            stroke="currentColor"
            strokeWidth={1}
            width={6}
          />
        )}
      </defs>
      <rect fill={`url(#${patternId})`} height={24} width={24} />
    </svg>
  );
}

const PATTERN_FILL_PRESETS = PATTERN_PRESETS.filter(
  (preset) => preset.id !== "none"
);

export function PatternPicker({
  value,
  onChange,
}: {
  value: PatternPresetId;
  onChange: (v: PatternPresetId) => void;
}) {
  return (
    <IconToggleGroup onValueChange={onChange} value={value}>
      {PATTERN_FILL_PRESETS.map((preset) => (
        <StudioToggleGroupItem
          aria-label={preset.label}
          key={preset.id}
          title={preset.label}
          value={preset.id}
        >
          <PatternSwatch className="size-[18px]" preset={preset.id} />
        </StudioToggleGroupItem>
      ))}
    </IconToggleGroup>
  );
}
