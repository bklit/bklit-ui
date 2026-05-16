"use client";

import { PatternLines } from "@bklitui/ui/charts";
import { PATTERN_PRESETS, type PatternPresetId } from "@/lib/studio/patterns";
import { cn } from "@/lib/utils";

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
    default:
      return "var(--chart-1)";
  }
}

function patternOrientation(
  preset: PatternPresetId
): ("diagonal" | "horizontal" | "vertical" | "diagonalRightToLeft")[] {
  switch (preset) {
    case "horizontal":
      return ["horizontal"];
    case "vertical":
      return ["vertical"];
    case "cross":
      return ["diagonal", "diagonalRightToLeft"];
    default:
      return ["diagonal"];
  }
}

function PatternSwatch({ preset }: { preset: PatternPresetId }) {
  if (preset === "none") {
    return (
      <span className="block size-full rounded-sm bg-[var(--chart-1)] opacity-80" />
    );
  }

  const id = `swatch-${preset}`;
  const stroke = patternStroke(preset);
  const orientation = patternOrientation(preset);

  return (
    <svg aria-hidden className="size-full rounded-sm" viewBox="0 0 24 24">
      <title>{preset}</title>
      <defs>
        <PatternLines
          height={preset === "dots" ? 4 : 6}
          id={id}
          orientation={orientation}
          stroke={stroke}
          strokeWidth={preset === "dots" ? 2 : 1}
          width={preset === "dots" ? 4 : 6}
        />
      </defs>
      <rect fill={`url(#${id})`} height={24} width={24} />
    </svg>
  );
}

export function PatternPicker({
  value,
  onChange,
}: {
  value: PatternPresetId;
  onChange: (v: PatternPresetId) => void;
}) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {PATTERN_PRESETS.map((preset) => (
        <button
          className={cn(
            "size-10 rounded-md ring-1 ring-foreground/10 transition-[box-shadow,ring-color]",
            value === preset.id &&
              "ring-2 ring-foreground ring-offset-2 ring-offset-background"
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
