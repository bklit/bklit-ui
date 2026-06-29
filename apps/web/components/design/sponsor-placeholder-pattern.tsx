"use client";

import { PatternLines } from "@bklitui/ui/charts";
import { useId } from "react";

export function SponsorPlaceholderPattern({
  reversed = false,
}: {
  reversed?: boolean;
}) {
  const uniqueId = useId();
  const patternId = `sponsor-placeholder-${uniqueId.replace(/:/g, "")}`;

  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 h-full w-full"
      preserveAspectRatio="none"
    >
      <title>Sponsor placeholder pattern</title>
      <defs>
        <PatternLines
          height={8}
          id={patternId}
          orientation={reversed ? ["diagonalRightToLeft"] : ["diagonal"]}
          stroke="var(--border)"
          strokeWidth={1}
          width={8}
        />
      </defs>
      <rect fill={`url(#${patternId})`} height="100%" width="100%" />
    </svg>
  );
}
