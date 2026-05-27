"use client";

import { cn } from "@/lib/utils";
import { IconToggleGroup } from "./icon-toggle-group";

export type FadeEdgesOption = "both" | "none" | "left" | "right";

interface FadeIconProps {
  /** Stops as [leftOpacity, rightOpacity]. */
  stops: [number, number];
}

/** Pill-shaped preview of how the fade will paint horizontally. */
function FadeIcon({ stops }: FadeIconProps) {
  return (
    <svg aria-hidden={true} className="h-3 w-7" viewBox="0 0 28 12">
      <title>Fade preview</title>
      <defs>
        <linearGradient id={`fade-icon-${stops.join("-")}`} x1="0" x2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity={stops[0]} />
          <stop offset="15%" stopColor="currentColor" stopOpacity={1} />
          <stop offset="85%" stopColor="currentColor" stopOpacity={1} />
          <stop offset="100%" stopColor="currentColor" stopOpacity={stops[1]} />
        </linearGradient>
      </defs>
      <rect
        fill={`url(#fade-icon-${stops.join("-")})`}
        height="3"
        rx="1.5"
        width="28"
        y="4.5"
      />
    </svg>
  );
}

const OPTIONS: {
  value: FadeEdgesOption;
  label: string;
  stops: [number, number];
}[] = [
  { value: "none", label: "No fade", stops: [1, 1] },
  { value: "left", label: "Fade left", stops: [0, 1] },
  { value: "right", label: "Fade right", stops: [1, 0] },
  { value: "both", label: "Fade both", stops: [0, 0] },
];

export function FadeEdgesPicker({
  value,
  onChange,
}: {
  value: FadeEdgesOption;
  onChange: (v: FadeEdgesOption) => void;
}) {
  return (
    <IconToggleGroup>
      {OPTIONS.map((opt) => (
        <button
          aria-label={opt.label}
          aria-pressed={value === opt.value}
          className={cn(
            "flex h-11 flex-1 items-center justify-center rounded-lg border transition-colors",
            value === opt.value
              ? "border-accent bg-accent/10 text-accent"
              : "border-border bg-muted/30 text-muted-foreground hover:bg-muted/50"
          )}
          key={opt.value}
          onClick={() => onChange(opt.value)}
          title={opt.label}
          type="button"
        >
          <FadeIcon stops={opt.stops} />
        </button>
      ))}
    </IconToggleGroup>
  );
}

/** Map the URL-state option into the value the `<Area>` / `<Line>` prop accepts. */
export function fadeEdgesPropValue(
  opt: FadeEdgesOption
): boolean | "left" | "right" {
  if (opt === "both") {
    return true;
  }
  if (opt === "none") {
    return false;
  }
  return opt;
}

/** Inline JSX literal for `fadeEdges` — used in codegen. */
export function fadeEdgesCodegen(opt: FadeEdgesOption): string {
  if (opt === "both") {
    return "fadeEdges";
  }
  if (opt === "none") {
    return "fadeEdges={false}";
  }
  return `fadeEdges="${opt}"`;
}
