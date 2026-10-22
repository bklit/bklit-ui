"use client";

import { useChartStable } from "@bklitui/ui/charts";
import { type ReactNode, useId } from "react";

/**
 * Masks its children so they fade in over the top and bottom `edge`% of the
 * plot. Mirrors the `VerticalFade` helper shipped in the recipe snippets
 * (`lib/recipes/snippets.ts`) — keep the two in sync.
 */
export function VerticalFade({
  children,
  edge = 33,
}: {
  children: ReactNode;
  edge?: number;
}) {
  const { innerWidth, innerHeight } = useChartStable();
  const id = useId().replace(/:/g, "");

  if (innerWidth <= 0 || innerHeight <= 0) {
    return null;
  }

  return (
    <g>
      <defs>
        <linearGradient id={`${id}-fade`} x1="0" x2="0" y1="0" y2="1">
          <stop offset={0} stopColor="white" stopOpacity={0} />
          <stop offset={edge / 100} stopColor="white" />
          <stop offset={1 - edge / 100} stopColor="white" />
          <stop offset={1} stopColor="white" stopOpacity={0} />
        </linearGradient>
        <mask
          height={innerHeight}
          id={`${id}-mask`}
          maskUnits="userSpaceOnUse"
          width={innerWidth}
          x={0}
          y={0}
        >
          <rect
            fill={`url(#${id}-fade)`}
            height={innerHeight}
            width={innerWidth}
          />
        </mask>
      </defs>
      <g mask={`url(#${id}-mask)`}>{children}</g>
    </g>
  );
}
