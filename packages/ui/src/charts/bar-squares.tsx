"use client";

import type { scaleBand } from "@visx/scale";
import type { Transition } from "motion/react";
import { motion } from "motion/react";
import { memo, useId, useMemo } from "react";
import { computeSquareColumn } from "./bar-squares-layout";
import {
  chartCssVars,
  useChart,
  useChartStable,
  useYScale,
} from "./chart-context";
import { useChartLegendHover } from "./chart-legend-hover";
import { transitionWithDelay } from "./motion-utils";
import { type PatternPresetId, renderPatternPreset } from "./pattern-preset";

type ScaleBand<Domain extends { toString(): string }> = ReturnType<
  typeof scaleBand<Domain>
>;

export interface GradientStop {
  offset: number;
  color: string;
}

export interface BarSquaresProps {
  dataKey: string;
  yAxisId?: string | number;
  /** Fill color, gradient url, or pattern url. Default: var(--chart-line-primary) */
  fill?: string;
  /** Tooltip dot / ring stroke color when fill is gradient/pattern */
  stroke?: string;
  /** Gap between stacked squares in pixels. Default: 3 */
  squareGap?: number;
  /** Corner radius as a fraction of square size (0 = flat, 0.5 = circle). Default: 0.25 */
  squareRadius?: number;
  /** Redistribute gap so columns fit bar height exactly */
  squareFit?: boolean;
  /** Apply bar-spanning gradient from gradientStops */
  useGradient?: boolean;
  gradientStops?: GradientStop[];
  /** Pattern preset when fill is a pattern (for gradient tinting) */
  patternPreset?: PatternPresetId;
  animate?: boolean;
  fadedOpacity?: number;
  staggerDelay?: number;
  groupGap?: number;
}

export interface BarColumnTrackProps {
  /** Fill color or pattern url. Default: var(--chart-grid) */
  fill?: string;
  opacity?: number;
  squareGap?: number;
  /** Corner radius fraction (matches squares). Default: 0.25 */
  squareRadius?: number;
  groupGap?: number;
  squareFit?: boolean;
}

interface BarSquaresInnerProps extends BarSquaresProps {
  barScale: ScaleBand<string>;
  bandWidth: number;
  barXAccessor: (d: Record<string, unknown>) => string;
}

interface SquareColumnProps {
  x: number;
  baselineY: number;
  barLengthPx: number;
  squareSize: number;
  squareGap: number;
  squareRadius: number;
  squareFit: boolean;
  fill: string;
  useGradient: boolean;
  gradientStops: GradientStop[];
  patternPreset?: PatternPresetId;
  index: number;
  isFaded: boolean;
  fadedOpacity: number;
  animate: boolean;
  isLoaded: boolean;
  staggerDelay: number;
  enterTransition?: Transition;
  revealEpoch: number;
}

function isPatternFill(fill: string): boolean {
  return fill.startsWith("url(");
}

function SquareColumn({
  x,
  baselineY,
  barLengthPx,
  squareSize,
  squareGap,
  squareRadius,
  squareFit,
  fill,
  useGradient,
  gradientStops,
  patternPreset,
  index,
  isFaded,
  fadedOpacity,
  animate,
  isLoaded,
  staggerDelay,
  enterTransition,
  revealEpoch,
}: SquareColumnProps) {
  const layout = useMemo(
    () =>
      computeSquareColumn({
        barLengthPx,
        squareSize,
        gap: squareGap,
        fit: squareFit,
      }),
    [barLengthPx, squareSize, squareGap, squareFit]
  );

  const rx = squareSize * squareRadius;
  const columnTop = baselineY - layout.columnHeight;
  const gradientId = `bar-squares-gradient-${index}-${revealEpoch}`;
  const patternFill = isPatternFill(fill);
  const patternId = `bar-squares-pattern-${index}-${revealEpoch}`;

  const effectiveFill = useMemo(() => {
    if (useGradient) {
      if (patternFill && patternPreset && patternPreset !== "none") {
        return `url(#${patternId})`;
      }
      return `url(#${gradientId})`;
    }
    return fill;
  }, [useGradient, patternFill, patternPreset, fill, gradientId, patternId]);

  const enterAnim = transitionWithDelay(enterTransition, index * staggerDelay);

  const squares = layout.positions.map((relY, squareIndex) => {
    const y = columnTop + relY;
    const key = `sq-${index}-${squareIndex}-${revealEpoch}`;

    if (animate && !isLoaded) {
      return (
        <motion.rect
          animate={{
            height: squareSize,
            opacity: isFaded ? fadedOpacity : 1,
            y,
          }}
          fill={effectiveFill}
          height={squareSize}
          initial={{ height: 0, opacity: 0, y: baselineY - squareSize }}
          key={key}
          rx={rx}
          ry={rx}
          transition={enterAnim}
          width={squareSize}
          x={x}
        />
      );
    }

    return (
      <rect
        fill={effectiveFill}
        height={squareSize}
        key={key}
        opacity={isFaded ? fadedOpacity : 1}
        rx={rx}
        ry={rx}
        style={{ transition: "opacity 0.15s ease-in-out" }}
        width={squareSize}
        x={x}
        y={y}
      />
    );
  });

  const gradientPatternNode =
    useGradient && patternFill && patternPreset && patternPreset !== "none"
      ? renderPatternPreset(patternPreset, patternId, {
          color: `url(#${gradientId})`,
        })
      : null;

  return (
    <>
      {useGradient ? (
        <defs>
          <linearGradient
            gradientUnits="userSpaceOnUse"
            id={gradientId}
            x1={0}
            x2={0}
            y1={baselineY}
            y2={columnTop}
          >
            {gradientStops.map((stop) => (
              <stop
                key={`${stop.offset}-${stop.color}`}
                offset={`${stop.offset}%`}
                stopColor={stop.color}
              />
            ))}
          </linearGradient>
          {gradientPatternNode}
        </defs>
      ) : null}
      {squares}
    </>
  );
}

const BarSquaresInner = memo(function BarSquaresInner({
  dataKey,
  yAxisId,
  fill = chartCssVars.linePrimary,
  squareGap = 3,
  squareRadius = 0.25,
  squareFit = false,
  useGradient = false,
  gradientStops = [],
  patternPreset,
  animate = true,
  fadedOpacity = 0.3,
  staggerDelay,
  groupGap = 4,
  barScale,
  bandWidth,
  barXAccessor,
}: BarSquaresInnerProps) {
  const {
    data,
    innerHeight,
    isLoaded,
    hoveredBarIndex,
    lines,
    orientation,
    stacked,
    animationDuration,
    enterTransition,
    revealEpoch = 0,
  } = useChart();

  const { hoveredIndex: legendHoveredIndex } = useChartLegendHover();
  const uniqueId = useId();

  const isHorizontal = orientation === "horizontal";
  const isUnsupported = isHorizontal || stacked;

  const seriesIndex = useMemo(() => {
    const idx = lines.findIndex((l) => l.dataKey === dataKey);
    return idx >= 0 ? idx : 0;
  }, [lines, dataKey]);

  const seriesConfig = lines[seriesIndex];
  const valueScale = useYScale(yAxisId ?? seriesConfig?.yAxisId);

  const isLegendDimmed =
    legendHoveredIndex !== null && legendHoveredIndex !== seriesIndex;

  const seriesCount = lines.length;
  const squareSize = useMemo(() => {
    if (!bandWidth || seriesCount === 0) {
      return 0;
    }
    const effectiveGroupGap = seriesCount > 1 ? groupGap : 0;
    return (bandWidth - effectiveGroupGap * (seriesCount - 1)) / seriesCount;
  }, [bandWidth, seriesCount, groupGap]);

  const totalAnimDuration = animationDuration || 1100;
  const staggerSpread = totalAnimDuration * 0.4;
  const calculatedStaggerDelay =
    staggerDelay ?? (data.length > 1 ? staggerSpread / 1000 / data.length : 0);

  const baselineY = valueScale(0) ?? innerHeight;
  const stops =
    gradientStops.length >= 2
      ? gradientStops
      : [
          { offset: 0, color: fill },
          { offset: 100, color: fill },
        ];

  if (isUnsupported) {
    return null;
  }

  return (
    <g className={`bar-squares-${uniqueId}`}>
      {data.map((d, i) => {
        const value = d[dataKey];
        if (typeof value !== "number" || value <= 0) {
          return null;
        }

        const categoryValue = barXAccessor(d);
        const bandPos = barScale(categoryValue) ?? 0;
        const effectiveGroupGap = seriesCount > 1 ? groupGap : 0;
        const x = bandPos + seriesIndex * (squareSize + effectiveGroupGap);

        const valuePos = valueScale(value) ?? 0;
        const barLengthPx = baselineY - valuePos;

        const isFaded =
          (hoveredBarIndex !== null && hoveredBarIndex !== i) || isLegendDimmed;

        return (
          <SquareColumn
            animate={animate}
            barLengthPx={barLengthPx}
            baselineY={baselineY}
            enterTransition={enterTransition}
            fadedOpacity={fadedOpacity}
            fill={fill}
            gradientStops={stops}
            index={i}
            isFaded={isFaded}
            isLoaded={isLoaded}
            key={`bar-squares-${dataKey}-${categoryValue}`}
            patternPreset={patternPreset}
            revealEpoch={revealEpoch}
            squareFit={squareFit}
            squareGap={squareGap}
            squareRadius={squareRadius}
            squareSize={squareSize}
            staggerDelay={calculatedStaggerDelay}
            useGradient={useGradient}
            x={x}
          />
        );
      })}
    </g>
  );
});

export function BarSquares(props: BarSquaresProps) {
  const { barScale, bandWidth, barXAccessor } = useChartStable();

  if (!(barScale && bandWidth && barXAccessor)) {
    console.warn("BarSquares must be used within a BarChart");
    return null;
  }

  return (
    <BarSquaresInner
      {...props}
      bandWidth={bandWidth}
      barScale={barScale}
      barXAccessor={barXAccessor}
    />
  );
}

BarSquares.displayName = "BarSquares";

const BarColumnTrackInner = memo(function BarColumnTrackInner({
  fill = chartCssVars.grid,
  opacity = 0.3,
  squareGap = 3,
  squareRadius = 0.25,
  squareFit = false,
  groupGap = 4,
  barScale,
  bandWidth,
  barXAccessor,
}: BarColumnTrackProps & {
  barScale: ScaleBand<string>;
  bandWidth: number;
  barXAccessor: (d: Record<string, unknown>) => string;
}) {
  const { data, lines, orientation, stacked, hoveredBarIndex } = useChart();
  const uniqueId = useId();

  const isHorizontal = orientation === "horizontal";
  const isUnsupported = isHorizontal || stacked;
  const seriesCount = lines.length;

  const squareSize = useMemo(() => {
    if (!bandWidth || seriesCount === 0) {
      return 0;
    }
    const effectiveGroupGap = seriesCount > 1 ? groupGap : 0;
    return (bandWidth - effectiveGroupGap * (seriesCount - 1)) / seriesCount;
  }, [bandWidth, seriesCount, groupGap]);

  if (isUnsupported) {
    return null;
  }

  const rx = squareSize * squareRadius;
  const effectiveOpacity = hoveredBarIndex === null ? opacity : 0;

  return (
    <g
      className={`bar-column-track-${uniqueId}`}
      style={{ transition: "opacity 0.15s ease-in-out" }}
    >
      {data.map((d, i) => {
        const categoryValue = barXAccessor(d);
        const bandPos = barScale(categoryValue) ?? 0;
        const effectiveGroupGap = seriesCount > 1 ? groupGap : 0;

        return lines.map((line, seriesIndex) => (
          <TrackColumn
            bandPos={bandPos}
            d={d}
            dataKey={line.dataKey}
            effectiveGroupGap={effectiveGroupGap}
            effectiveOpacity={effectiveOpacity}
            fill={fill}
            key={`track-${i}-${line.dataKey}`}
            rx={rx}
            seriesIndex={seriesIndex}
            squareFit={squareFit}
            squareGap={squareGap}
            squareSize={squareSize}
            yAxisId={line.yAxisId}
          />
        ));
      })}
    </g>
  );
});

function TrackColumn({
  d,
  dataKey,
  yAxisId,
  bandPos,
  seriesIndex,
  effectiveGroupGap,
  squareSize,
  squareGap,
  squareFit,
  fill,
  rx,
  effectiveOpacity,
}: {
  d: Record<string, unknown>;
  dataKey: string;
  yAxisId?: string | number;
  bandPos: number;
  seriesIndex: number;
  effectiveGroupGap: number;
  squareSize: number;
  squareGap: number;
  squareFit: boolean;
  fill: string;
  rx: number;
  effectiveOpacity: number;
}) {
  const { innerHeight } = useChart();
  const valueScale = useYScale(yAxisId);
  const value = d[dataKey];

  if (typeof value !== "number" || value <= 0) {
    return null;
  }

  const baselineY = valueScale(0) ?? innerHeight;
  const valuePos = valueScale(value) ?? 0;
  const barLengthPx = baselineY - valuePos;
  const layout = computeSquareColumn({
    barLengthPx,
    squareSize,
    gap: squareGap,
    fit: squareFit,
  });
  const columnTop = baselineY - layout.columnHeight;
  const trackHeight = Math.max(0, columnTop);

  if (trackHeight <= 0) {
    return null;
  }

  const x = bandPos + seriesIndex * (squareSize + effectiveGroupGap);

  return (
    <rect
      fill={fill}
      height={trackHeight}
      opacity={effectiveOpacity}
      rx={rx}
      ry={rx}
      width={squareSize}
      x={x}
      y={0}
    />
  );
}

export function BarColumnTrack(props: BarColumnTrackProps) {
  const { barScale, bandWidth, barXAccessor } = useChartStable();

  if (!(barScale && bandWidth && barXAccessor)) {
    console.warn("BarColumnTrack must be used within a BarChart");
    return null;
  }

  return (
    <BarColumnTrackInner
      {...props}
      bandWidth={bandWidth}
      barScale={barScale}
      barXAccessor={barXAccessor}
    />
  );
}

BarColumnTrack.displayName = "BarColumnTrack";

export default BarSquares;
