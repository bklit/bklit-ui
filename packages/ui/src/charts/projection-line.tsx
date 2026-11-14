"use client";

import { type CurveFactory, curveLinear } from "d3-shape";
import { m } from "motion/react";
import { type ReactNode, useCallback, useId, useMemo } from "react";
import { useChartStable, useYScale } from "./chart-context";
import { LinePath, linePathD } from "./line-path";
import { type PatternPresetId, renderPatternPreset } from "./pattern-preset";
import {
  buildHorizontalTangentBezierPath,
  type ProjectionCurveKind,
  type ProjectionPoint,
  projectionCrossingX,
} from "./projection-utils";

export type ProjectionStrokeStyle = "solid" | "gradient";

/** Fill under the projection segment, down to the plot baseline. */
export type ProjectionAreaFill = "none" | "solid" | "gradient" | "pattern";

export interface ProjectionLineProps {
  /** Projection path points — anchor (last data row) + horizon end. */
  data: ProjectionPoint[];
  /** Y-scale group id. Default: `"left"`. */
  yAxisId?: string | number;
  /** Solid stroke color. Default: var(--chart-3) */
  stroke?: string;
  /** Solid or path-aligned gradient stroke. Default: solid */
  strokeStyle?: ProjectionStrokeStyle;
  /** Gradient start color when `strokeStyle` is gradient. Default: `stroke` */
  gradientStart?: string;
  /** Gradient end color when `strokeStyle` is gradient. Default: var(--chart-5) */
  gradientEnd?: string;
  /** Stroke width. Default: 2 */
  strokeWidth?: number;
  /** Straight segment or horizontal-tangent S-curve. Default: linear */
  curveKind?: ProjectionCurveKind;
  /** Advanced curve override (used when `curveKind` is omitted). */
  curve?: CurveFactory;
  /** Dash pattern. Default: "6,4" */
  strokeDasharray?: string;
  /** Stroke opacity. Default: 1 */
  strokeOpacity?: number;
  /** Show horizon endpoint marker. Default: true */
  showEndMarker?: boolean;
  /** @deprecated Use `showEndMarker`. */
  showEndpoints?: boolean;
  /** Endpoint marker radius. Default: 5 */
  endpointRadius?: number;
  /**
   * Horizon marker fill. Default: the end colour (a solid dot). Pass
   * `var(--background)` for a hollow ring.
   */
  endMarkerFill?: string;
  /** Print the horizon value above the end marker. Default: false */
  showEndLabel?: boolean;
  /** Formats the end label. Default: `toLocaleString()` */
  formatEndLabel?: (value: number) => string;
  /** End label colour. Default: the end colour */
  endLabelColor?: string;
  /** Fill under the projection, down to the baseline. Default: `"none"` */
  areaFill?: ProjectionAreaFill;
  /** Area colour. Default: the end colour (`gradientEnd` or `stroke`) */
  areaColor?: string;
  /** Default: 0.12 for `solid`, 0.3 for `gradient`, 0.5 for `pattern`. */
  areaOpacity?: number;
  /**
   * Fade the area out over the bottom N% of its height (0–100). Default: 100
   * for `gradient`, 0 otherwise — set it on `pattern` for a fading hatch.
   */
  areaFadeBottom?: number;
  /** Pattern preset when `areaFill` is `"pattern"`. Default: `"diagonal-up"` */
  areaPattern?: PatternPresetId;
  /** Default: 1.5 */
  areaPatternScale?: number;
  /**
   * `pattern` only — opacity of a gradient wash painted under the pattern
   * (fades out over the full height). Default: 0
   */
  areaPatternTint?: number;
  /**
   * Goal value: draws a dashed horizontal line across the plot and a marker
   * where the projection crosses it.
   */
  target?: number;
  /** Target line colour. Default: `var(--muted-foreground)` */
  targetStroke?: string;
  /** Default: `"4,4"` */
  targetDasharray?: string;
  /** Default: 0.6 */
  targetStrokeOpacity?: number;
  /** Ring on the target crossing. Default: true (when `target` is set) */
  showTargetMarker?: boolean;
  /**
   * Dashed vertical guides at the hand-off (anchor) and the target crossing.
   * Default: false
   */
  showGuides?: boolean;
  /** Guide colour. Default: `var(--muted-foreground)` */
  guideStroke?: string;
  /** Default: 0.35 */
  guideStrokeOpacity?: number;
  className?: string;
}

const ENTER_FADE = { duration: 0.42, ease: "easeOut" as const };
const LABEL_GAP = 8;
const LABEL_FONT_SIZE = 12;

function defaultAreaOpacity(areaFill: ProjectionAreaFill): number {
  if (areaFill === "pattern") {
    return 0.5;
  }
  if (areaFill === "gradient") {
    return 0.3;
  }
  return 0.12;
}

function verticalFadeStops(fadeBottom: number) {
  const zone = Math.min(100, Math.max(0, fadeBottom)) / 100;
  return [
    { offset: 0, opacity: 1 },
    { offset: 1 - zone, opacity: 1 },
    { offset: 1, opacity: zone > 0 ? 0 : 1 },
  ];
}

interface ProjectionAreaProps {
  d: string;
  uid: string;
  top: number;
  bottom: number;
  areaFill: Exclude<ProjectionAreaFill, "none">;
  color: string;
  opacity?: number;
  fadeBottom?: number;
  pattern: PatternPresetId;
  patternScale: number;
  patternTint: number;
}

function ProjectionArea({
  d,
  uid,
  top,
  bottom,
  areaFill,
  color,
  opacity,
  fadeBottom,
  pattern,
  patternScale,
  patternTint,
}: ProjectionAreaProps) {
  const resolvedOpacity = opacity ?? defaultAreaOpacity(areaFill);
  const resolvedFade = fadeBottom ?? (areaFill === "gradient" ? 100 : 0);
  const tint = areaFill === "pattern" ? patternTint : 0;
  const fadeId = `chart-projection-area-fade-${uid}`;
  const maskId = `chart-projection-area-mask-${uid}`;
  const tintId = `chart-projection-area-tint-${uid}`;
  const patternId = `chart-projection-area-pattern-${uid}`;
  const span = { gradientUnits: "userSpaceOnUse" as const, x1: 0, x2: 0 };
  const useFade = resolvedFade > 0;
  const patternNode: ReactNode =
    areaFill === "pattern"
      ? renderPatternPreset(pattern, patternId, {
          color,
          scale: patternScale,
        })
      : null;

  let fill = color;
  if (areaFill === "pattern" && patternNode) {
    fill = `url(#${patternId})`;
  }

  return (
    <>
      <defs>
        {useFade ? (
          <>
            <linearGradient id={fadeId} {...span} y1={top} y2={bottom}>
              {verticalFadeStops(resolvedFade).map((stop) => (
                <stop
                  key={stop.offset}
                  offset={stop.offset}
                  stopColor="white"
                  stopOpacity={stop.opacity}
                />
              ))}
            </linearGradient>
            <mask id={maskId} maskUnits="userSpaceOnUse">
              <path d={d} fill={`url(#${fadeId})`} />
            </mask>
          </>
        ) : null}
        {tint > 0 ? (
          <linearGradient id={tintId} {...span} y1={top} y2={bottom}>
            <stop offset={0} stopColor={color} stopOpacity={tint} />
            <stop offset={1} stopColor={color} stopOpacity={0} />
          </linearGradient>
        ) : null}
      </defs>
      {patternNode}
      {tint > 0 ? <path d={d} fill={`url(#${tintId})`} /> : null}
      <path
        d={d}
        fill={fill}
        mask={useFade ? `url(#${maskId})` : undefined}
        opacity={resolvedOpacity}
      />
    </>
  );
}

function resolveVisibleEndX(
  endX: number,
  innerWidth: number,
  endpointRadius: number,
  strokeWidth: number
): number {
  const edgePadding = endpointRadius + strokeWidth * 0.5 + 1;
  return Math.min(endX, Math.max(0, innerWidth - edgePadding));
}

function renderProjectionStroke({
  bezierPath,
  curve,
  curveKind,
  data,
  getX,
  getY,
  linearPath,
  strokeProps,
}: {
  bezierPath: string | null;
  curve: CurveFactory | undefined;
  curveKind: ProjectionCurveKind;
  data: ProjectionPoint[];
  getX: (point: ProjectionPoint) => number;
  getY: (point: ProjectionPoint) => number;
  linearPath: string | null;
  strokeProps: {
    stroke: string;
    strokeDasharray: string;
    strokeLinecap: "round";
    strokeOpacity: number;
    strokeWidth: number;
  };
}) {
  if (curveKind === "bezier" && bezierPath) {
    return <path d={bezierPath} fill="none" {...strokeProps} />;
  }
  if (curveKind === "linear" && linearPath) {
    return <path d={linearPath} fill="none" {...strokeProps} />;
  }
  return (
    <LinePath
      d={linePathD(data, { curve: curve ?? curveLinear, x: getX, y: getY })}
      {...strokeProps}
    />
  );
}

interface ProjectionGeometry {
  startX: number;
  startY: number;
  visibleEndX: number;
  endY: number;
}

function useProjectionGeometry({
  data,
  yAxisId,
  showMarker,
  endpointRadius,
  strokeWidth,
}: {
  data: ProjectionPoint[];
  yAxisId: string | number | undefined;
  showMarker: boolean;
  endpointRadius: number;
  strokeWidth: number;
}) {
  const { xScale, innerWidth } = useChartStable();
  const yScale = useYScale(yAxisId);

  const getX = useCallback(
    (point: ProjectionPoint) => xScale(point.date) ?? 0,
    [xScale]
  );
  const getY = useCallback(
    (point: ProjectionPoint) => yScale(point.value) ?? 0,
    [yScale]
  );

  const startPoint = data[0];
  const endPoint = data.at(-1);

  const geometry = useMemo<ProjectionGeometry | null>(() => {
    if (!(startPoint && endPoint)) {
      return null;
    }
    return {
      startX: getX(startPoint),
      startY: getY(startPoint),
      visibleEndX: resolveVisibleEndX(
        getX(endPoint),
        innerWidth,
        showMarker ? endpointRadius : 0,
        strokeWidth
      ),
      endY: getY(endPoint),
    };
  }, [
    endPoint,
    endpointRadius,
    getX,
    getY,
    innerWidth,
    showMarker,
    startPoint,
    strokeWidth,
  ]);

  return { geometry, getX, getY, yScale };
}

function projectionSegmentPaths(
  geometry: ProjectionGeometry | null,
  curveKind: ProjectionCurveKind
) {
  if (!geometry) {
    return { bezierPath: null, linearPath: null, topPath: null };
  }
  const { startX, startY, visibleEndX, endY } = geometry;
  const linear = `M ${startX},${startY} L ${visibleEndX},${endY}`;
  const bezierPath =
    curveKind === "bezier"
      ? buildHorizontalTangentBezierPath(startX, startY, visibleEndX, endY)
      : null;
  return {
    bezierPath,
    linearPath: curveKind === "linear" ? linear : null,
    topPath: bezierPath ?? linear,
  };
}

function ProjectionTargetOverlay({
  geometry,
  targetY,
  crossingX,
  color,
  markerRadius,
  endpointRadius,
  markerFill,
  showTargetMarker,
  showGuides,
  targetStroke,
  targetDasharray,
  targetStrokeOpacity,
  guideStroke,
  guideStrokeOpacity,
}: {
  geometry: ProjectionGeometry;
  targetY: number | null;
  crossingX: number | null;
  color: string;
  markerRadius: number;
  endpointRadius: number;
  markerFill: string;
  showTargetMarker: boolean;
  showGuides: boolean;
  targetStroke: string;
  targetDasharray: string;
  targetStrokeOpacity: number;
  guideStroke: string;
  guideStrokeOpacity: number;
}) {
  const { innerWidth, innerHeight } = useChartStable();
  const targetInPlot =
    targetY != null && targetY >= 0 && targetY <= innerHeight;
  const crossing =
    crossingX != null && targetY != null ? { x: crossingX, y: targetY } : null;
  const guideXs = [geometry.startX, ...(crossing ? [crossing.x] : [])];

  return (
    <>
      {showGuides
        ? guideXs.map((x) => (
            <line
              key={x}
              stroke={guideStroke}
              strokeDasharray="3,3"
              strokeOpacity={guideStrokeOpacity}
              x1={x}
              x2={x}
              y1={0}
              y2={innerHeight}
            />
          ))
        : null}
      {targetInPlot ? (
        <line
          stroke={targetStroke}
          strokeDasharray={targetDasharray}
          strokeOpacity={targetStrokeOpacity}
          x1={0}
          x2={innerWidth}
          y1={targetY}
          y2={targetY}
        />
      ) : null}
      {showTargetMarker && crossing ? (
        <g className="chart-projection-target-marker">
          <circle
            cx={crossing.x}
            cy={crossing.y}
            fill={color}
            opacity={0.18}
            r={endpointRadius * 2}
          />
          <circle
            cx={crossing.x}
            cy={crossing.y}
            fill={markerFill}
            r={markerRadius}
            stroke={color}
            strokeWidth={1.5}
          />
        </g>
      ) : null}
    </>
  );
}

function ProjectionHorizon({
  x,
  y,
  value,
  color,
  radius,
  fill,
  fillOpacity,
  showMarker,
  showLabel,
  formatLabel,
  labelColor,
}: {
  x: number;
  y: number;
  value: number;
  color: string;
  radius: number;
  fill: string | undefined;
  fillOpacity: number;
  showMarker: boolean;
  showLabel: boolean;
  formatLabel?: (value: number) => string;
  labelColor?: string;
}) {
  const hollow = fill != null;
  const labelBelow = y < radius + LABEL_GAP + LABEL_FONT_SIZE;
  return (
    <>
      {showMarker ? (
        <circle
          cx={x}
          cy={y}
          fill={fill ?? color}
          fillOpacity={fillOpacity}
          r={radius}
          stroke={hollow ? color : undefined}
          strokeWidth={hollow ? 1.5 : undefined}
        />
      ) : null}
      {showLabel ? (
        <text
          dominantBaseline={labelBelow ? "hanging" : "auto"}
          fill={labelColor ?? color}
          fontSize={LABEL_FONT_SIZE}
          fontWeight={600}
          style={{ fontVariantNumeric: "tabular-nums" }}
          textAnchor="end"
          x={x + radius}
          y={labelBelow ? y + radius + LABEL_GAP : y - radius - LABEL_GAP}
        >
          {formatLabel ? formatLabel(value) : value.toLocaleString()}
        </text>
      ) : null}
    </>
  );
}

export function ProjectionLine({
  data,
  yAxisId,
  stroke = "var(--chart-3)",
  strokeStyle = "solid",
  gradientStart,
  gradientEnd = "var(--chart-5)",
  strokeWidth = 2,
  curveKind = "linear",
  curve,
  strokeDasharray = "6,4",
  strokeOpacity = 1,
  showEndMarker,
  showEndpoints,
  endpointRadius = 5,
  endMarkerFill,
  showEndLabel = false,
  formatEndLabel,
  endLabelColor,
  areaFill = "none",
  areaColor,
  areaOpacity,
  areaFadeBottom,
  areaPattern = "diagonal-up",
  areaPatternScale = 1.5,
  areaPatternTint = 0,
  target,
  targetStroke = "var(--muted-foreground)",
  targetDasharray = "4,4",
  targetStrokeOpacity = 0.6,
  showTargetMarker = true,
  showGuides = false,
  guideStroke = "var(--muted-foreground)",
  guideStrokeOpacity = 0.35,
  className,
}: ProjectionLineProps) {
  const { chartPhase, innerHeight } = useChartStable();
  const gradientId = useId().replace(/:/g, "");
  const showMarker = showEndMarker ?? showEndpoints ?? true;
  const isGradient = strokeStyle === "gradient";

  const { geometry, getX, getY, yScale } = useProjectionGeometry({
    data,
    yAxisId,
    showMarker,
    endpointRadius,
    strokeWidth,
  });

  const { bezierPath, linearPath, topPath } = useMemo(
    () => projectionSegmentPaths(geometry, curveKind),
    [curveKind, geometry]
  );

  const targetY =
    target != null && Number.isFinite(target) ? (yScale(target) ?? null) : null;

  const crossingX = useMemo(
    () =>
      geometry && targetY != null
        ? projectionCrossingX(
            geometry.startX,
            geometry.startY,
            geometry.visibleEndX,
            geometry.endY,
            targetY,
            curveKind
          )
        : null,
    [curveKind, geometry, targetY]
  );

  const showStroke =
    chartPhase === "revealing" ||
    chartPhase === "ready" ||
    chartPhase === "exitingReady";

  if (data.length < 2 || !geometry) {
    return null;
  }

  const endColor = isGradient ? gradientEnd : stroke;
  const markerRadius = endpointRadius * 0.85;
  const strokeProps = {
    stroke: isGradient ? `url(#${gradientId})` : stroke,
    strokeDasharray,
    strokeLinecap: "round" as const,
    strokeOpacity,
    strokeWidth,
  };

  return (
    <m.g
      animate={{ opacity: showStroke ? 1 : 0 }}
      className={className ?? "chart-projection-line"}
      initial={{ opacity: 0 }}
      transition={ENTER_FADE}
    >
      {isGradient ? (
        <defs>
          <linearGradient
            gradientUnits="userSpaceOnUse"
            id={gradientId}
            x1={geometry.startX}
            x2={geometry.visibleEndX}
            y1={geometry.startY}
            y2={geometry.endY}
          >
            <stop offset="0%" stopColor={gradientStart ?? stroke} />
            <stop offset="100%" stopColor={gradientEnd} />
          </linearGradient>
        </defs>
      ) : null}
      {areaFill !== "none" && topPath ? (
        <ProjectionArea
          areaFill={areaFill}
          bottom={innerHeight}
          color={areaColor ?? endColor}
          d={`${topPath} L ${geometry.visibleEndX},${innerHeight} L ${geometry.startX},${innerHeight} Z`}
          fadeBottom={areaFadeBottom}
          opacity={areaOpacity}
          pattern={areaPattern}
          patternScale={areaPatternScale}
          patternTint={areaPatternTint}
          top={Math.min(geometry.startY, geometry.endY)}
          uid={gradientId}
        />
      ) : null}
      <ProjectionTargetOverlay
        color={endColor}
        crossingX={crossingX}
        endpointRadius={endpointRadius}
        geometry={geometry}
        guideStroke={guideStroke}
        guideStrokeOpacity={guideStrokeOpacity}
        markerFill={endMarkerFill ?? "var(--background)"}
        markerRadius={markerRadius}
        showGuides={showGuides}
        showTargetMarker={showTargetMarker}
        targetDasharray={targetDasharray}
        targetStroke={targetStroke}
        targetStrokeOpacity={targetStrokeOpacity}
        targetY={targetY}
      />
      {renderProjectionStroke({
        bezierPath,
        curve,
        curveKind,
        data,
        getX,
        getY,
        linearPath,
        strokeProps,
      })}
      <ProjectionHorizon
        color={endColor}
        fill={endMarkerFill}
        fillOpacity={strokeOpacity}
        formatLabel={formatEndLabel}
        labelColor={endLabelColor}
        radius={markerRadius}
        showLabel={showEndLabel}
        showMarker={showMarker}
        value={data.at(-1)?.value ?? 0}
        x={geometry.visibleEndX}
        y={geometry.endY}
      />
    </m.g>
  );
}

ProjectionLine.displayName = "ProjectionLine";

export default ProjectionLine;
