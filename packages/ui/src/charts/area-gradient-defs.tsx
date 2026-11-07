import { memo } from "react";
import {
  areaVerticalFadeStops,
  type FadeEdges,
  fadeGradientStops,
  resolveFadeSides,
  viewportFadeGradientAttrs,
} from "./fade-edges";

interface AreaGradientDefsProps {
  gradientId: string;
  strokeGradientId: string;
  edgeMaskId: string;
  edgeGradientId: string;
  fill: string;
  fillOpacity: number;
  gradientToOpacity: number;
  /** 0–1: where the bottom stop sits (1 = full-height gradient). */
  gradientSpan?: number;
  resolvedStroke: string;
  isPatternFill: boolean;
  fadeEdges: FadeEdges;
  /** Bottom fade zone, % of the area height (overrides gradientToOpacity/Span). */
  fadeBottom?: number;
  innerWidth: number;
  innerHeight: number;
}

// Memoised: props are primitives that rarely change, while the area
// re-renders on every data update and morph frame.
export const AreaGradientDefs = memo(function AreaGradientDefs({
  gradientId,
  strokeGradientId,
  edgeMaskId,
  edgeGradientId,
  fill,
  fillOpacity,
  gradientToOpacity,
  gradientSpan = 1,
  resolvedStroke,
  isPatternFill,
  fadeEdges,
  fadeBottom,
  innerWidth,
  innerHeight,
}: AreaGradientDefsProps) {
  const sides = resolveFadeSides(fadeEdges);
  // Stroke gradient mirrors the area's edge fade so the line doesn't pop in
  // past the faded fill. Skip emitting it when neither edge fades — the line
  // can then paint a solid stroke instead of an unnecessary url(#...) ref.
  const strokeStops = sides.any ? fadeGradientStops(sides) : null;
  const showEdgeMask = sides.any && !isPatternFill;
  const edgeStops = showEdgeMask ? fadeGradientStops(sides) : null;
  const verticalStops = areaVerticalFadeStops({
    topOpacity: fillOpacity,
    fadeBottom,
    gradientToOpacity,
    gradientSpan,
  });

  return (
    <defs>
      {isPatternFill ? null : (
        <linearGradient id={gradientId} x1="0%" x2="0%" y1="0%" y2="100%">
          {verticalStops.map((stop) => (
            <stop
              key={stop.offset}
              offset={stop.offset}
              style={{ stopColor: fill, stopOpacity: stop.opacity }}
            />
          ))}
        </linearGradient>
      )}

      {strokeStops ? (
        <linearGradient
          id={strokeGradientId}
          {...viewportFadeGradientAttrs(innerWidth)}
        >
          {strokeStops.map((stop) => (
            <stop
              key={stop.offset}
              offset={stop.offset}
              style={{ stopColor: resolvedStroke, stopOpacity: stop.opacity }}
            />
          ))}
        </linearGradient>
      ) : null}

      {edgeStops ? (
        <>
          <linearGradient
            id={edgeGradientId}
            {...viewportFadeGradientAttrs(innerWidth)}
          >
            {edgeStops.map((stop) => (
              <stop
                key={stop.offset}
                offset={stop.offset}
                style={{ stopColor: "white", stopOpacity: stop.opacity }}
              />
            ))}
          </linearGradient>
          <mask id={edgeMaskId}>
            <rect
              fill={`url(#${edgeGradientId})`}
              height={innerHeight}
              width={innerWidth}
              x="0"
              y="0"
            />
          </mask>
        </>
      ) : null}
    </defs>
  );
});
