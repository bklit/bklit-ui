"use client";

import { type CurveFactory, curveLinear, curveNatural } from "d3-shape";
import { type ReactNode, useId, useMemo } from "react";
import {
  type BandFadeEdges,
  type BandFadeStop,
  type BandSegment,
  bandAreaPath,
  bandEdgeClipPath,
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
  /**
   * Tooltip row label. Default: `"lowerKey – upperKey"` (or the key when both
   * edges share one key).
   */
  label?: string;
  /**
   * Add a `low – high` row (and dots on both edges) to `ChartTooltip`.
   * Default: true
   */
  showInTooltip?: boolean;
  /** Curve function. Default: curveNatural (same as Line). */
  curve?: CurveFactory;
  /** Band colour. Default: var(--chart-line-primary) */
  fill?: string;
  /** Default: `"solid"`. */
  fillType?: BandFillType;
  /** Solid opacity, or gradient opacity at the upper edge. Default: 0.15 */
  fillOpacity?: number;
  /**
   * Fill wherever the upper key drops below the lower key (the two series
   * cross) — e.g. actual below projection, this year behind last year. Uses
   * the same `fillType`, opacities and pattern as `fill`. The colour switches
   * exactly where the edges cross. Default: undefined (one fill throughout).
   */
  negativeFill?: string;
  /** Gradient opacity at the lower edge. Default: 0 */
  gradientToOpacity?: number;
  /** Pattern preset when `fillType` is `"pattern"`. Default: `"diagonal-up"`. */
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

interface BandAreaFillStyle {
  /** `"gradient"` only when the band has a vertical extent. */
  fillType: BandFillType;
  extent: { top: number; bottom: number } | null;
  fillOpacity: number;
  gradientToOpacity: number;
  pattern: PatternPresetId;
  /** Pattern colour override; falls back to the layer colour. */
  patternColor?: string;
  patternScale?: number;
  patternStrokeWidth?: number;
  patternOpacity: number;
}

/** The band area in one colour, with its own gradient / pattern defs. */
function BandAreaFill({
  d,
  color,
  clipPath,
  style,
}: {
  d: string;
  color: string;
  clipPath?: string;
  style: BandAreaFillStyle;
}) {
  const uniqueId = useId().replace(/:/g, "");
  const paintId = `chart-band-paint-${uniqueId}`;
  const { extent } = style;
  const usesPattern = style.fillType === "pattern" && style.pattern !== "none";
  const usesGradient = style.fillType === "gradient" && extent != null;

  let paint: ReactNode = null;
  let fill = color;
  let opacity = style.fillOpacity;
  if (usesPattern) {
    paint = renderPatternPreset(style.pattern, paintId, {
      color: style.patternColor ?? color,
      scale: style.patternScale,
      strokeWidth: style.patternStrokeWidth,
    });
    fill = `url(#${paintId})`;
    opacity = style.patternOpacity;
  } else if (usesGradient) {
    paint = (
      <linearGradient
        gradientUnits="userSpaceOnUse"
        id={paintId}
        x1={0}
        x2={0}
        y1={extent.top}
        y2={extent.bottom}
      >
        <stop
          offset={0}
          style={{ stopColor: color, stopOpacity: style.fillOpacity }}
        />
        <stop
          offset={1}
          style={{ stopColor: color, stopOpacity: style.gradientToOpacity }}
        />
      </linearGradient>
    );
    fill = `url(#${paintId})`;
    opacity = 1;
  }

  return (
    <>
      {paint ? <defs>{paint}</defs> : null}
      <path clipPath={clipPath} d={d} fill={fill} fillOpacity={opacity} />
    </>
  );
}

/**
 * `negativeFill`: the area drawn twice, clipped above the lower edge in `fill`
 * and below it in `negativeFill`, so the colour flips where the edges cross.
 */
function BandSplitFill({
  d,
  fill,
  negativeFill,
  segments,
  curve,
  innerHeight,
  style,
}: {
  d: string;
  fill: string;
  negativeFill: string;
  segments: BandSegment[];
  curve: CurveFactory;
  innerHeight: number;
  style: BandAreaFillStyle;
}) {
  const uniqueId = useId().replace(/:/g, "");
  const aboveId = `chart-band-above-${uniqueId}`;
  const belowId = `chart-band-below-${uniqueId}`;
  const clips = useMemo(() => {
    // Far enough past the plot that a panned / overshooting band stays inside.
    const far = Math.max(innerHeight, 1) * 3;
    return {
      above: bandEdgeClipPath(segments, "lower", "above", curve, far),
      below: bandEdgeClipPath(segments, "lower", "below", curve, far),
    };
  }, [segments, curve, innerHeight]);

  return (
    <>
      <defs>
        <clipPath id={aboveId}>
          <path d={clips.above} />
        </clipPath>
        <clipPath id={belowId}>
          <path d={clips.below} />
        </clipPath>
      </defs>
      <BandAreaFill
        clipPath={`url(#${aboveId})`}
        color={fill}
        d={d}
        style={style}
      />
      <BandAreaFill
        clipPath={`url(#${belowId})`}
        color={negativeFill}
        d={d}
        style={{ ...style, patternColor: undefined }}
      />
    </>
  );
}

/** Phases where series strokes are drawn (matches `<Line>`). */
function isBandVisiblePhase(phase: string): boolean {
  return phase === "revealing" || phase === "ready" || phase === "exitingReady";
}

export function Band({
  upperKey,
  lowerKey,
  yAxisId,
  // `label` / `showInTooltip` are read from props by the chart shell
  // (`extractBandConfigs`) for tooltip rows.
  curve = curveNatural,
  fill = chartCssVars.linePrimary,
  fillType = "solid",
  fillOpacity = 0.15,
  negativeFill,
  gradientToOpacity = 0,
  pattern = "diagonal-up",
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
  const hMaskId = `chart-band-fade-x-${uniqueId}`;
  const vMaskId = `chart-band-fade-y-${uniqueId}`;

  if (!isBandVisiblePhase(chartPhase) || paths.area === "") {
    return null;
  }

  const { extent } = paths;
  const hasExtent = extent != null && extent.bottom - extent.top > 0;
  const fadeSides = resolveBandFadeSides(fadeEdges);
  const fadeX = fadeSides.horizontal && innerWidth > 0;
  const fadeY = fadeSides.vertical && hasExtent;
  const fillStyle: BandAreaFillStyle = {
    extent: hasExtent ? extent : null,
    fillOpacity,
    fillType,
    gradientToOpacity,
    pattern,
    patternColor,
    patternOpacity,
    patternScale,
    patternStrokeWidth,
  };

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
      {negativeFill ? (
        <BandSplitFill
          curve={polyline ? curveLinear : curve}
          d={paths.area}
          fill={fill}
          innerHeight={innerHeight}
          negativeFill={negativeFill}
          segments={segments}
          style={fillStyle}
        />
      ) : (
        <BandAreaFill color={fill} d={paths.area} style={fillStyle} />
      )}
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
