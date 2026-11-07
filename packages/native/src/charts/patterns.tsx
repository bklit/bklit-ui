import { Group, Path, Skia, type SkPath } from "@shopify/react-native-skia";
import { useMemo } from "react";
import type { SharedValue } from "react-native-reanimated";

/**
 * Pattern presets ported from web `pattern-preset.tsx` (Nucleo-based tiles).
 * Each tile is `size` px square; `stroke` art is 1 tile-unit wide, `fill`
 * art is solid. Both scale with `scale`.
 */
interface PatternDef {
  size: number;
  stroke?: string;
  fill?: string;
}

const PATTERNS = {
  vertical: { size: 6, stroke: "M5.5 0V6M-0.5 0V6" },
  "vertical-dense": { size: 3, stroke: "M2.5 0V3M-0.5 0V3" },
  horizontal: { size: 6, stroke: "M0 5.5H6M0 -0.5H6" },
  "horizontal-dense": { size: 3, stroke: "M0 2.5H3M0 -0.5H3" },
  "diagonal-up": { size: 6, stroke: "M-2 1L1 -2M-1 6L6 -1M4 7L7 4" },
  "diagonal-up-sparse": {
    size: 12,
    stroke: "M-2 1L1 -2M-1 12L12 -1M10 13L13 10",
  },
  "diagonal-down": { size: 6, stroke: "M-1 -1L7 7M-2 4L2 8M4 -2L8 2" },
  "diagonal-down-sparse": {
    size: 12,
    stroke: "M-1 -1L13 13M-2 10L2 14M10 -2L14 2",
  },
  grid: { size: 6, stroke: "M5.5 0V6M-0.5 0V6M0 5.5H6M0 -0.5H6" },
  "vertical-dashed": { size: 6, fill: "M6 1V4H5V1H6Z" },
  "horizontal-dashed": { size: 6, fill: "M4 6L1 6L1 5L4 5L4 6Z" },
  "grid-dashed": { size: 6, fill: "M6 1V4H5V1H6ZM4 6L1 6L1 5L4 5L4 6Z" },
  dots: { size: 6, fill: "M6 5H5V6H6V5Z" },
  "dots-sparse": { size: 12, fill: "M12 11H11V12H12V11ZM6 5H5V6H6V5Z" },
  "diagonal-dots-up": {
    size: 6,
    fill: "M5 5h1v1h-1zM3 1h1v1h-1zM1 3h1v1h-1z",
  },
  "diagonal-dots-down": {
    size: 6,
    fill: "M5 5h1v1h-1zM3 3h1v1h-1zM1 1h1v1h-1z",
  },
  "circles-dense": {
    size: 6,
    fill: "M1 2.5a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0-3 0z",
  },
  circles: { size: 12, fill: "M4 5.5a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0-3 0z" },
  blocks: { size: 6, fill: "M1 1h3v3h-3z" },
  "checkerboard-xs": { size: 6, fill: "M0 0h3v3h-3zM3 3h3v3h-3z" },
} as const satisfies Record<string, PatternDef>;

export type PatternPreset = keyof typeof PATTERNS;

export interface PatternRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Tile a preset across `rect` into one path (one draw call). Tiles are
 * anchored to the rect origin so the pattern doesn't swim on resize.
 */
export function usePatternPath(
  preset: PatternPreset,
  scale: number,
  rect: PatternRect
): { path: SkPath; stroked: boolean } {
  const { x, y, width, height } = rect;
  return useMemo(() => {
    const def: PatternDef = PATTERNS[preset];
    const art = Skia.Path.MakeFromSVGString(def.stroke ?? def.fill ?? "");
    const builder = Skia.PathBuilder.Make();
    const tile = def.size * scale;
    if (art && tile > 0 && width > 0 && height > 0) {
      const cols = Math.ceil(width / tile) + 1;
      const rows = Math.ceil(height / tile) + 1;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const m = Skia.Matrix();
          m.translate(x + c * tile, y + r * tile);
          m.scale(scale, scale);
          builder.addPath(art, m);
        }
      }
    }
    return { path: builder.build(), stroked: Boolean(def.stroke) };
  }, [preset, scale, x, y, width, height]);
}

export interface PatternFillProps {
  preset: PatternPreset;
  rect: PatternRect;
  color: string;
  scale?: number;
  /** Line width for stroke presets, in tile units. Default: 1. */
  strokeWidth?: number;
  opacity?: number | SharedValue<number>;
  /** Clip the pattern to this shape (e.g. an area path). */
  clip?: SkPath | SharedValue<SkPath>;
}

export function PatternFill({
  preset,
  rect,
  color,
  scale = 1,
  strokeWidth = 1,
  opacity = 1,
  clip,
}: PatternFillProps) {
  const { path, stroked } = usePatternPath(preset, scale, rect);
  return (
    <Group clip={clip} opacity={opacity}>
      <Path
        color={color}
        path={path}
        strokeWidth={stroked ? strokeWidth * scale : 0}
        style={stroked ? "stroke" : "fill"}
      />
    </Group>
  );
}
