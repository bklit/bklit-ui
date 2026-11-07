"use client";

import type { ReactNode } from "react";

export interface PatternTileProps {
  /** Unique id — reference it as `fill="url(#id)"`. */
  id: string;
  /** Tile artwork. Paint with `currentColor` so `color` drives it. */
  children: ReactNode;
  /** Native tile size of the artwork's viewBox (square). Default: 48 */
  size?: number;
  /** Multiplier on the rendered tile size. Default: 1 */
  scale?: number;
  /** Colour applied as `currentColor`. Default: `var(--chart-1)` */
  color?: string;
  /** Opacity of the artwork (not the background). Default: 1 */
  opacity?: number;
  /** Optional solid fill painted under the artwork. */
  background?: string;
}

/**
 * Square SVG pattern built from tile artwork drawn in a `size × size` viewBox.
 * Hoisted into chart `<defs>` like the other `Pattern*` components.
 */
export function PatternTile({
  id,
  children,
  size = 48,
  scale = 1,
  color = "var(--chart-1)",
  opacity = 1,
  background,
}: PatternTileProps) {
  const tile = size * scale;
  return (
    <defs>
      <pattern
        height={tile}
        id={id}
        patternUnits="userSpaceOnUse"
        viewBox={`0 0 ${size} ${size}`}
        width={tile}
      >
        {background ? (
          <rect fill={background} height={size} width={size} />
        ) : null}
        <g opacity={opacity} style={{ color }}>
          {children}
        </g>
      </pattern>
    </defs>
  );
}

PatternTile.displayName = "PatternTile";
