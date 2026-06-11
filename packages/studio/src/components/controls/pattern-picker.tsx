"use client";

import { PatternLines, renderPatternPreset } from "@bklitui/ui/charts";
import { cn } from "@bklitui/ui/lib/utils";
import { useId } from "react";
import { PATTERN_PRESETS, type PatternPresetId } from "@/lib/patterns";

function patternStroke(preset: PatternPresetId): string {
  switch (preset) {
    case "accent":
      return "#e879f9";
    case "horizontal":
      return "var(--chart-2)";
    case "vertical":
      return "var(--chart-3)";
    case "dots":
      return "var(--chart-4)";
    case "circles":
      return "var(--chart-5)";
    default:
      return "var(--chart-1)";
  }
}

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
        className={cn(
          "block size-full rounded-[3px] bg-[var(--chart-1)]",
          className
        )}
      />
    );
  }

  const patternNode = renderPatternPreset(preset, patternId, {
    color: patternStroke(preset),
    scale: 1,
    radius: preset === "dots" ? 1.5 : 2,
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
            stroke={patternStroke(preset)}
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
    <div className="flex flex-wrap gap-1.5">
      {PATTERN_FILL_PRESETS.map((preset) => (
        <button
          className={cn(
            "size-6 shrink-0 overflow-hidden rounded-[4px] bg-muted/20 transition-colors",
            value === preset.id && "bg-muted/50"
          )}
          key={preset.id}
          onClick={() => onChange(preset.id)}
          title={preset.label}
          type="button"
        >
          <PatternSwatch preset={preset.id} />
        </button>
      ))}
    </div>
  );
}
