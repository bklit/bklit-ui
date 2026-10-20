"use client";

import { curveLinear, curveNatural } from "@visx/curve";
import type { CurveFactory } from "d3-shape";
import { type ReactNode, useId, useMemo } from "react";
import {
  type BandFadeEdges,
  type BandFadeStop,
  bandAreaPath,
  bandEdgePath,
  bandFadeStops,
  bandPixelExtent,
  resolveBandFadeSides,
} from "./band-geometry";
import { chartCssVars, useChartStable, useYScale } from "./chart-context";
import { type PatternPresetId, renderPatternPreset } from "./pattern-preset";
import { useAnimatedBand } from "./use-animated-band";

export type { BandFadeEdges } from "./band-geometry";

export type BandFillType = "solid" | "gradient" | "pattern";

export interface BandStrokeProps {
  /** Default: Band `stroke` ?? `fill`. */
  stroke?: string;
  /** Default: Band `strokeWidth`. */
  strokeWidth?: number;
  /** Default: Band `strokeDasharray`. */
  strokeDasharray?: string;
  /** Default: Band `strokeOpacity`. */
  strokeOpacity?: number;
}

export interface BandProps {
  /** Data key for the band's upper edge. */
  upperKey: string;
  /** Data key for the band's lower edge. */
  lowerKey: string;
  /** Y-scale group id. Default: `"left"`. */
  yAxisId?: string;
  /** Curve function. Default: curveNatural (same as Line). */
  curve?: CurveFactory;
  /** Band colour. Default: var(--chart-line-primary) */
  fill?: string;
  /** Default: `"solid"`. */
  fillType?: BandFillType;
  /** Solid opacity, or gradient opacity at the upper edge. Default: 0.15 */
  fillOpacity?: number;
  /** Gradient opacity at the lower edge. Default: 0 */
  gradientToOpacity?: number;
  /** Pattern preset when `fillType` is `"pattern"`. Default: `"diagonal"`. */
  pattern?: PatternPresetId;
  /** Default: `fill`. */
  patternColor?: string;
  patternScale?: number;
  patternStrokeWidth?: number;
  /** Opacity applied to the pattern fill. Default: 1 */
  patternOpacity?: number;
  /** Shared edge stroke colour. Default: `fill`. */
  stroke?: string;
  /** Default: 1 */
  strokeWidth?: number;
  /** Default: undefined (solid). */
  strokeDasharray?: string;
  /** Default: 1 */
  strokeOpacity?: number;
  /** `false` hides the top edge; an object overrides the shared stroke. */
  upperStroke?: BandStrokeProps | false;
  /** `false` hides the bottom edge; an object overrides the shared stroke. */
  lowerStroke?: BandStrokeProps | false;
  /**
   * Fade fill and strokes to transparent at the given sides. Horizontal fades
   * span the plot width; vertical fades span the band's own pixel extent.
   * Default: false
   */
  fadeEdges?: BandFadeEdges;
  /** Fraction (0–0.5) of the width / height each fade covers. Default: 0.15 */
  fadeSize?: number;
  className?: string;
}

interface ResolvedBandStroke {
  stroke: string;
  strokeWidth: number;
  strokeDasharray?: string;
  strokeOpacity: number;
}

function resolveEdgeStroke(
  override: BandStrokeProps | false | undefined,
  base: ResolvedBandStroke
): ResolvedBandStroke | null {
  if (override === false) {
    return null;
  }
  const resolved: ResolvedBandStroke = {
    stroke: override?.stroke ?? base.stroke,
    strokeWidth: override?.strokeWidth ?? base.strokeWidth,
    strokeDasharray: override?.strokeDasharray ?? base.strokeDasharray,
    strokeOpacity: override?.strokeOpacity ?? base.strokeOpacity,
  };
  return resolved.strokeWidth > 0 ? resolved : null;
}

function FadeMaskStops({ stops }: { stops: BandFadeStop[] }) {
  return stops.map((stop, index) => (
    <stop
      key={index}
      offset={stop.offset}
      style={{ stopColor: "white", stopOpacity: stop.opacity }}
    />
  ));
}

/** Phases where series strokes are drawn (matches `<Line>`). */
function isBandVisiblePhase(phase: string): boolean {
  return phase === "revealing" || phase === "ready" || phase === "exitingReady";
}

export function Band({
  upperKey,
  lowerKey,
  yAxisId,
  curve = curveNatural,
  fill = chartCssVars.linePrimary,
  fillType = "solid",
  fillOpacity = 0.15,
  gradientToOpacity = 0,
  pattern = "diagonal",
  patternColor,
  patternScale,
  patternStrokeWidth,
  patternOpacity = 1,
  stroke,
  strokeWidth = 1,
  strokeDasharray,
  strokeOpacity = 1,
  upperStroke,
  lowerStroke,
  fadeEdges = false,
  fadeSize = 0.15,
  className,
}: BandProps) {
  const {
    renderData,
    xScale,
    innerWidth,
    innerHeight,
    xAccessor,
    chartPhase,
    yDomainTweenDuration,
  } = useChartStable();
  const yScale = useYScale(yAxisId);

  // Same tween inputs as `<Line>` (animate + ready phase, yDomainTweenDuration)
  // so band edges morph in lockstep with lines on data changes.
  const displayed = useAnimatedBand({
    chartPhase,
    curve,
    durationMs: yDomainTweenDuration,
    enabled: chartPhase === "ready",
    innerWidth,
    lowerKey,
    renderData,
    upperKey,
    xAccessor,
    xScale,
    yScale,
  });
  const { segments, polyline } = displayed;

  const paths = useMemo(() => {
    const pathCurve = polyline ? curveLinear : curve;
    return {
      area: bandAreaPath(segments, pathCurve),
      upper: bandEdgePath(segments, "upper", pathCurve),
      lower: bandEdgePath(segments, "lower", pathCurve),
      extent: bandPixelExtent(segments),
    };
  }, [segments, polyline, curve]);

  const uniqueId = useId().replace(/:/g, "");
  const gradientId = `chart-band-gradient-${uniqueId}`;
  const patternId = `chart-band-fill-${uniqueId}`;
  const hMaskId = `chart-band-fade-x-${uniqueId}`;
  const vMaskId = `chart-band-fade-y-${uniqueId}`;

  const usesPattern = fillType === "pattern" && pattern !== "none";
  const patternNode = useMemo<ReactNode>(() => {
    if (!usesPattern) {
      return null;
    }
    return renderPatternPreset(pattern, patternId, {
      color: patternColor ?? fill,
      scale: patternScale,
      strokeWidth: patternStrokeWidth,
    });
  }, [
    usesPattern,
    pattern,
    patternId,
    patternColor,
    fill,
    patternScale,
    patternStrokeWidth,
  ]);

  if (!isBandVisiblePhase(chartPhase) || paths.area === "") {
    return null;
  }

  const { extent } = paths;
  const hasExtent = extent != null && extent.bottom - extent.top > 0;
  const fadeSides = resolveBandFadeSides(fadeEdges);
  const fadeX = fadeSides.horizontal && innerWidth > 0;
  const fadeY = fadeSides.vertical && hasExtent;
  const usesGradient = fillType === "gradient" && hasExtent;

  let areaFill = fill;
  let areaOpacity = fillOpacity;
  if (patternNode) {
    areaFill = `url(#${patternId})`;
    areaOpacity = patternOpacity;
  } else if (usesGradient) {
    areaFill = `url(#${gradientId})`;
    areaOpacity = 1;
  }

  const baseStroke: ResolvedBandStroke = {
    stroke: stroke ?? fill,
    strokeWidth,
    strokeDasharray,
    strokeOpacity,
  };
  const upperEdge = resolveEdgeStroke(upperStroke, baseStroke);
  const lowerEdge = resolveEdgeStroke(lowerStroke, baseStroke);

  // Generous user-space mask region: series extend past the plot while an
  // `xDomain` viewport pans; the gradients pad their end stops beyond it.
  const maskRegion = {
    height: innerHeight * 3,
    maskUnits: "userSpaceOnUse" as const,
    width: innerWidth * 3,
    x: -innerWidth,
    y: -innerHeight,
  };
  const maskRect = {
    height: maskRegion.height,
    width: maskRegion.width,
    x: maskRegion.x,
    y: maskRegion.y,
  };

  const content = (
    <>
      <path d={paths.area} fill={areaFill} fillOpacity={areaOpacity} />
      {lowerEdge ? (
        <path
          d={paths.lower}
          fill="none"
          stroke={lowerEdge.stroke}
          strokeDasharray={lowerEdge.strokeDasharray}
          strokeLinecap="round"
          strokeOpacity={lowerEdge.strokeOpacity}
          strokeWidth={lowerEdge.strokeWidth}
        />
      ) : null}
      {upperEdge ? (
        <path
          d={paths.upper}
          fill="none"
          stroke={upperEdge.stroke}
          strokeDasharray={upperEdge.strokeDasharray}
          strokeLinecap="round"
          strokeOpacity={upperEdge.strokeOpacity}
          strokeWidth={upperEdge.strokeWidth}
        />
      ) : null}
    </>
  );

  return (
    // biome-ignore lint/a11y/noAriaHiddenOnFocusable: decorative band
    <g
      aria-hidden="true"
      className={className ?? "chart-band"}
      pointerEvents="none"
    >
      <defs>
        {usesGradient && extent ? (
          <linearGradient
            gradientUnits="userSpaceOnUse"
            id={gradientId}
            x1={0}
            x2={0}
            y1={extent.top}
            y2={extent.bottom}
          >
            <stop
              offset={0}
              style={{ stopColor: fill, stopOpacity: fillOpacity }}
            />
            <stop
              offset={1}
              style={{ stopColor: fill, stopOpacity: gradientToOpacity }}
            />
          </linearGradient>
        ) : null}
        {patternNode}
        {fadeX ? (
          <>
            <linearGradient
              gradientUnits="userSpaceOnUse"
              id={`${hMaskId}-gradient`}
              x1={0}
              x2={innerWidth}
              y1={0}
              y2={0}
            >
              <FadeMaskStops
                stops={bandFadeStops(fadeSides.left, fadeSides.right, fadeSize)}
              />
            </linearGradient>
            <mask id={hMaskId} {...maskRegion}>
              <rect fill={`url(#${hMaskId}-gradient)`} {...maskRect} />
            </mask>
          </>
        ) : null}
        {fadeY && extent ? (
          <>
            <linearGradient
              gradientUnits="userSpaceOnUse"
              id={`${vMaskId}-gradient`}
              x1={0}
              x2={0}
              y1={extent.top}
              y2={extent.bottom}
            >
              <FadeMaskStops
                stops={bandFadeStops(fadeSides.top, fadeSides.bottom, fadeSize)}
              />
            </linearGradient>
            <mask id={vMaskId} {...maskRegion}>
              <rect fill={`url(#${vMaskId}-gradient)`} {...maskRect} />
            </mask>
          </>
        ) : null}
      </defs>
      <g mask={fadeX ? `url(#${hMaskId})` : undefined}>
        <g mask={fadeY ? `url(#${vMaskId})` : undefined}>{content}</g>
      </g>
    </g>
  );
}

Band.displayName = "Band";

export default Band;
