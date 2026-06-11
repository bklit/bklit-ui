"use client";

import { IconToggleGroup } from "@/components/controls/icon-toggle-group";
import { StudioToggleGroupItem } from "@/components/controls/studio-toggle-group";

export type FadeEdgesOption = "both" | "none" | "left" | "right";

interface FadeIconProps {
  /** Stops as [leftOpacity, rightOpacity]. */
  stops: [number, number];
}

/** Diamond preview of how the fade will paint horizontally. */
function FadeIcon({ stops }: FadeIconProps) {
  const gradientId = `fade-icon-${stops.join("-")}`;
  const fadeBoth = stops[0] === 0 && stops[1] === 0;

  return (
    <svg aria-hidden className="size-5" viewBox="0 0 20 20">
      <title>Fade preview</title>
      <defs>
        <linearGradient
          gradientTransform="rotate(-45 10 10)"
          gradientUnits="userSpaceOnUse"
          id={gradientId}
          x1="5"
          x2="15"
          y1="10"
          y2="10"
        >
          {fadeBoth ? (
            <>
              <stop offset="0%" stopColor="currentColor" stopOpacity={0} />
              <stop offset="50%" stopColor="currentColor" stopOpacity={1} />
              <stop offset="100%" stopColor="currentColor" stopOpacity={0} />
            </>
          ) : (
            <>
              <stop
                offset="0%"
                stopColor="currentColor"
                stopOpacity={stops[0]}
              />
              <stop
                offset="100%"
                stopColor="currentColor"
                stopOpacity={stops[1]}
              />
            </>
          )}
        </linearGradient>
      </defs>
      <rect
        fill={`url(#${gradientId})`}
        height="12"
        transform="rotate(45 10 10)"
        width="12"
        x="4"
        y="4"
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
    <IconToggleGroup onValueChange={onChange} value={value}>
      {OPTIONS.map((opt) => (
        <StudioToggleGroupItem
          aria-label={opt.label}
          key={opt.value}
          title={opt.label}
          value={opt.value}
        >
          <FadeIcon stops={opt.stops} />
        </StudioToggleGroupItem>
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
