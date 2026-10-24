"use client";

import type { scaleBand } from "@visx/scale";
import type { Transition } from "motion/react";
import { motion } from "motion/react";
import { memo, useId, useMemo } from "react";
import { barDepthAndRise, barDepthMaxDepth } from "./bar-depth-geometry";
import {
  type BarValueLabelOrientation,
  type BarValueLabelPosition,
  getBarValueLabelLayout,
} from "./bar-value-label-layout";
import {
  chartCssVars,
  useChartHover,
  useChartStable,
  useYScale,
} from "./chart-context";
import { valueLabelFmt } from "./chart-formatters";
import { useChartLegendHover } from "./chart-legend-hover";
import { transitionWithDelay } from "./motion-utils";

type ScaleBand<Domain extends { toString(): string }> = ReturnType<
  typeof scaleBand<Domain>
>;

export type BarLineCap = "round" | "butt" | number;
export type BarAnimationType = "grow" | "fade";

// ── Bar-depth perspective trim ───────────────────────────────────────────
// Uses the SHARED geometry (`bar-depth-geometry.ts`) so a
// `<Bar perspective>` front face lines up exactly with
// `<BarDepthBack>`'s lid — the formula lives in one place for both.

/** perspectiveRise for a positive bar whose visual top sits at `topY`.
 * Returns 0 for a dead-center bar or a dense chart (degenerate depth). */
function barDepthPerspectiveRise(
  barScale: ScaleBand<string>,
  bandWidth: number,
  barXAccessor: (d: Record<string, unknown>) => string,
  innerWidth: number,
  datum: Record<string, unknown>,
  topY: number,
  baselineY: number
): number {
  const centerX = innerWidth / 2;
  if (centerX <= 0) {
    return 0;
  }
  const step =
    (barScale as unknown as { step?: () => number }).step?.() ?? bandWidth;
  const maxDepth = barDepthMaxDepth(step, bandWidth);
  const bandX = barScale(barXAccessor(datum)) ?? 0;
  const cx = bandX + bandWidth / 2;
  const absOffset = Math.min(1, Math.abs((cx - centerX) / centerX));
  const naturalHeight = Math.abs(baselineY - topY);
  return barDepthAndRise(absOffset, naturalHeight, maxDepth).perspectiveRise;
}

export interface BarProps {
  /** Key in data to use for y values */
  dataKey: string;
  /** Y-scale group id for vertical bars (Recharts `yAxisId`). Default: `"left"`. */
  yAxisId?: string | number;
  /** Fill color for the bar. Can be a color, gradient url, or pattern url. Default: var(--chart-line-primary) */
  fill?: string;
  /** Color for tooltip dot. Use when fill is a gradient/pattern. Default: uses fill value */
  stroke?: string;
  /** Line cap style for bar ends: "round", "butt", or a number for custom radius. Default: "round" */
  lineCap?: BarLineCap;
  /** Whether to animate the bars. Default: true */
  animate?: boolean;
  /** Animation type: "grow" (height) or "fade" (opacity + blur). Default: "grow" */
  animationType?: BarAnimationType;
  /** Opacity when not hovered (when another bar is hovered). Default: 0.3 */
  fadedOpacity?: number;
  /** Stagger delay between bars in seconds. Auto-calculated if not provided. */
  staggerDelay?: number;
  /** Gap between stacked bars in pixels. Default: 0 */
  stackGap?: number;
  /** Gap between grouped bars in pixels. Default: 4 */
  groupGap?: number;
  /** Shrink each positive bar's top by its perspective rise so the front face
   * lines up with `<BarDepthBack>`'s lid (instead of the lid sitting above the
   * front face). Pass `true` whenever the chart also renders the bar-depth 3D
   * surfaces. Default: false */
  perspective?: boolean;
  /** Minimum rendered bar height in px (non-stacked, vertical). Floors short or
   * zero-value bars so they stay visible. Pair with the same value on
   * `<BarDepthProvider minBarHeight>` when using the 3D surfaces. Default: 0 */
  minBarHeight?: number;
  /** Show the formatted value inside each bar when it fits. Default: false. */
  showValue?: boolean;
  /** Format values displayed inside bars. Defaults to English integers. */
  valueLabelFormatter?: (value: number) => string;
  /** Text color for values displayed inside bars. Default: white. */
  valueLabelColor?: string;
  /** Label text direction. `auto` uses horizontal text, then rotates if needed. */
  valueLabelOrientation?: BarValueLabelOrientation;
  /** Position of the label inside the bar. On horizontal bars `"top"` is the
   * value end (right) and `"bottom"` the base (left). Default: center. */
  valueLabelPosition?: BarValueLabelPosition;
  /** Optional class for value labels. */
  valueLabelClassName?: string;
}

interface BarInnerProps extends BarProps {
  barScale: ScaleBand<string>;
  bandWidth: number;
  barXAccessor: (d: Record<string, unknown>) => string;
}

interface AnimatedBarProps {
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  rx: number;
  ry: number;
  index: number;
  isFaded: boolean;
  animationType: BarAnimationType;
  fadedOpacity: number;
  staggerDelay: number;
  enterTransition?: Transition;
  revealEpoch: number;
  isHorizontal: boolean;
  /** Value-axis position the grow animation starts from (the zero line for
   * non-stacked bars, the segment start for horizontal stacked bars). */
  growOrigin: number;
  valueLabel?: string;
  valueLabelColor: string;
  labelX: number;
  labelY: number;
  labelTransform?: string;
  valueLabelClassName?: string;
}

function AnimatedBar({
  x,
  y,
  width,
  height,
  fill,
  rx,
  ry,
  index,
  isFaded,
  animationType,
  fadedOpacity,
  staggerDelay,
  enterTransition,
  revealEpoch,
  isHorizontal,
  growOrigin,
  valueLabel,
  valueLabelColor,
  labelX,
  labelY,
  labelTransform,
  valueLabelClassName,
}: AnimatedBarProps) {
  const enterAnim = transitionWithDelay(enterTransition, index * staggerDelay);
  const label = valueLabel ? (
    <motion.text
      animate={{ opacity: isFaded ? fadedOpacity : 1 }}
      className={valueLabelClassName}
      dominantBaseline="middle"
      fill={valueLabelColor}
      fontSize={12}
      fontWeight={600}
      initial={{ opacity: 0 }}
      textAnchor="middle"
      transform={labelTransform}
      transition={enterAnim}
      x={labelX}
      y={labelY}
    >
      {valueLabel}
    </motion.text>
  ) : null;

  if (animationType === "fade") {
    return (
      <g>
        <motion.rect
          animate={{
            opacity: isFaded ? fadedOpacity : 1,
            filter: "blur(0px)",
          }}
          fill={fill}
          height={height}
          initial={{ opacity: 0, filter: "blur(2px)" }}
          key={`fade-${index}-${revealEpoch}`}
          rx={rx}
          ry={ry}
          transition={enterAnim}
          width={width}
          x={x}
          y={y}
        />
        {label}
      </g>
    );
  }

  const initial = isHorizontal
    ? { width: 0, height, x: growOrigin, y }
    : { width, height: 0, x, y: growOrigin };
  const target = isHorizontal
    ? { width, height, x, y }
    : { width, height, x, y };

  return (
    <g
      opacity={isFaded ? fadedOpacity : 1}
      style={{ transition: "opacity 0.15s ease-in-out" }}
    >
      <motion.rect
        animate={target}
        fill={fill}
        initial={initial}
        key={`grow-${index}-${revealEpoch}`}
        rx={rx}
        ry={ry}
        transition={enterAnim}
      />
      {label}
    </g>
  );
}

/** Geometry for one bar — independent of hover, so it is memoized once. */
interface BarGeometry {
  key: string;
  index: number;
  x: number;
  y: number;
  width: number;
  height: number;
  rx: number;
  growOrigin: number;
  valueLabel?: string;
  labelX: number;
  labelY: number;
  labelTransform?: string;
}

const STATIC_BAR_STYLE = {
  cursor: "default",
  transition: "opacity 0.15s ease-in-out",
} as const;
const STATIC_LABEL_STYLE = { transition: "opacity 0.15s ease-in-out" } as const;

interface StaticBarProps {
  geometry: BarGeometry;
  fill: string;
  opacity: number;
  valueLabelColor: string;
  valueLabelClassName?: string;
}

/**
 * Bar after the enter animation (or with animation off). Memoized on its
 * geometry object + opacity, so a hover only re-renders the bars whose fade
 * state changed instead of every bar in the series.
 */
const StaticBar = memo(function StaticBar({
  geometry,
  fill,
  opacity,
  valueLabelColor,
  valueLabelClassName,
}: StaticBarProps) {
  return (
    <g>
      <rect
        fill={fill}
        height={geometry.height}
        opacity={opacity}
        rx={geometry.rx}
        ry={geometry.rx}
        style={STATIC_BAR_STYLE}
        width={geometry.width}
        x={geometry.x}
        y={geometry.y}
      />
      {geometry.valueLabel ? (
        <text
          className={valueLabelClassName}
          dominantBaseline="middle"
          fill={valueLabelColor}
          fontSize={12}
          fontWeight={600}
          opacity={opacity}
          style={STATIC_LABEL_STYLE}
          textAnchor="middle"
          transform={geometry.labelTransform}
          x={geometry.labelX}
          y={geometry.labelY}
        >
          {geometry.valueLabel}
        </text>
      ) : null}
    </g>
  );
});

const BarInner = memo(function BarInner({
  dataKey,
  yAxisId,
  fill = chartCssVars.linePrimary,
  lineCap = "round",
  animate = true,
  animationType = "grow",
  fadedOpacity = 0.3,
  staggerDelay,
  stackGap = 0,
  groupGap = 4,
  perspective = false,
  minBarHeight = 0,
  showValue = false,
  valueLabelFormatter = valueLabelFmt,
  valueLabelColor = "white",
  valueLabelOrientation = "auto",
  valueLabelPosition = "center",
  valueLabelClassName,
  barScale,
  bandWidth,
  barXAccessor,
}: BarInnerProps) {
  const {
    data,
    yScale: chartYScale,
    innerHeight,
    innerWidth,
    isLoaded,
    lines,
    orientation,
    stacked,
    stackOffsets,
    animationDuration,
    enterTransition,
    revealEpoch = 0,
  } = useChartStable();
  const { hoveredBarIndex = null } = useChartHover();

  // Calculate stagger delay automatically if not provided
  // Total animation duration is ~1200ms, with 40% for stagger spread and 60% for bar animation
  const totalAnimDuration = animationDuration || 1100;
  const staggerSpread = totalAnimDuration * 0.4; // 40% of time for stagger spread
  const calculatedStaggerDelay =
    staggerDelay ?? (data.length > 1 ? staggerSpread / 1000 / data.length : 0);
  const uniqueId = useId();

  const isHorizontal = orientation === "horizontal";

  // Find the index of this bar series among all bar series
  const { hoveredIndex: legendHoveredIndex } = useChartLegendHover();

  const seriesIndex = useMemo(() => {
    const idx = lines.findIndex((l) => l.dataKey === dataKey);
    return idx >= 0 ? idx : 0;
  }, [lines, dataKey]);

  const seriesConfig = lines[seriesIndex];
  const valueScale = useYScale(yAxisId ?? seriesConfig?.yAxisId);

  const isLegendDimmed =
    legendHoveredIndex !== null && legendHoveredIndex !== seriesIndex;

  const seriesCount = lines.length;
  const isLastSeries = seriesIndex === seriesCount - 1;

  // Calculate the width for each bar within a group (for non-stacked)
  const barWidth = useMemo(() => {
    if (!bandWidth || seriesCount === 0) {
      return 0;
    }
    if (stacked) {
      // Stacked bars use full band width
      return bandWidth;
    }
    // Leave a gap between grouped bars (controlled by groupGap prop)
    const effectiveGroupGap = seriesCount > 1 ? groupGap : 0;
    return (bandWidth - effectiveGroupGap * (seriesCount - 1)) / seriesCount;
  }, [bandWidth, seriesCount, stacked, groupGap]);

  // Calculate corner radius based on lineCap. Perspective bars force a flat
  // top (radius 0) so the 3D lid from `<BarDepthBack>` meets the bar with no
  // gap — rounded corners would leave a wedge, so `perspective` overrides it.
  const cornerRadius = useMemo(() => {
    if (perspective) {
      return 0;
    }
    if (typeof lineCap === "number") {
      return lineCap;
    }
    if (lineCap === "round" && barWidth) {
      return Math.min(barWidth / 2, 8);
    }
    return 0;
  }, [lineCap, barWidth, perspective]);

  // Hover-independent geometry: recomputed on data / layout changes only.
  const geometries = useMemo(() => {
    const result: BarGeometry[] = [];
    const scale = isHorizontal ? chartYScale : valueScale;
    const zeroX = isHorizontal ? (scale(0) ?? 0) : 0;
    const zeroY = isHorizontal ? 0 : (scale(0) ?? innerHeight);
    const effectiveGroupGap = seriesCount > 1 ? groupGap : 0;
    // Apply rounded corners:
    // - For non-stacked: always apply
    // - For stacked with gap: apply to all bars
    // - For stacked without gap: only apply to the last series
    const applyRounding = !stacked || stackGap > 0 || isLastSeries;
    const effectiveRx = applyRounding ? cornerRadius : 0;

    for (let i = 0; i < data.length; i++) {
      const d = data[i] as Record<string, unknown>;
      const value = d[dataKey];
      if (typeof value !== "number") {
        continue;
      }

      const categoryValue = barXAccessor(d);
      const bandPos = barScale(categoryValue) ?? 0;

      let x = 0;
      let y = 0;
      let barHeight: number;
      let barW: number;

      if (isHorizontal) {
        // Horizontal bars: category on y-axis, value on x-axis
        const valuePos = scale(value) ?? 0;
        barW = valuePos; // Width is the value position (grows from left)
        barHeight = barWidth;

        if (stacked && stackOffsets) {
          const offset = stackOffsets.get(i)?.get(dataKey) ?? 0;
          x = scale(offset) ?? 0;
          // Segment spans [offset, offset + value]; `valuePos` is the
          // position of `value` alone, so it is not this segment's end.
          barW = (scale(offset + value) ?? 0) - x;
          // Apply stack gap for horizontal: shift right and reduce width
          const gapOffset = seriesIndex * stackGap;
          x += gapOffset;
          if (!isLastSeries && stackGap > 0) {
            barW = Math.max(0, barW - stackGap);
          }
        } else {
          // Grow from the zero line in either direction (zeroX is 0 for
          // non-negative data).
          x = Math.min(valuePos, zeroX);
          barW = Math.abs(valuePos - zeroX);
        }
        y = stacked
          ? bandPos
          : bandPos + seriesIndex * (barWidth + effectiveGroupGap);
      } else {
        // Vertical bars: category on x-axis, value on y-axis
        // Measure from the zero line (not the plot floor) so negative
        // values grow downward. For non-negative data zeroY === innerHeight.
        const valuePos = scale(value) ?? 0;
        barHeight = Math.abs(zeroY - valuePos);
        barW = barWidth;

        if (stacked && stackOffsets) {
          const offset = stackOffsets.get(i)?.get(dataKey) ?? 0;
          const offsetY = scale(offset) ?? innerHeight;
          // Apply stack gap: shift up and reduce height
          const gapOffset = seriesIndex * stackGap;
          y = offsetY - barHeight - gapOffset;
          // Reduce height slightly for non-last bars to create visual gap
          if (!isLastSeries && stackGap > 0) {
            barHeight = Math.max(0, barHeight - stackGap);
          }
        } else {
          y = Math.min(valuePos, zeroY);
        }
        x = stacked
          ? bandPos
          : bandPos + seriesIndex * (barWidth + effectiveGroupGap);

        // Minimum visible height — floor short/zero non-stacked bars so a
        // zero-value data point still reads as a tiny bar instead of
        // vanishing. Grows up from the zero line. Non-negative only, to
        // match bar-depth's floor. Floored bars skip the perspective trim
        // (sub-pixel on a 3px bar; keeps the front aligned with bar-depth,
        // which also skips trim for floored bars).
        let isFloored = false;
        if (
          !stacked &&
          minBarHeight > 0 &&
          value >= 0 &&
          barHeight < minBarHeight
        ) {
          barHeight = minBarHeight;
          y = zeroY - minBarHeight;
          isFloored = true;
        }

        // Perspective trim — shrink the topmost positive bar's front-face
        // top down by its perspective rise so it meets `<BarDepthBack>`'s
        // lid back edge. Stacked: only the last (topmost) series; grouped or
        // single: every positive bar. Clamped to `barHeight - 1` so very
        // short bars keep a positive height (matches bar-depth's clamp).
        if (
          perspective &&
          value > 0 &&
          !isFloored &&
          (!stacked || isLastSeries)
        ) {
          const rise = barDepthPerspectiveRise(
            barScale,
            bandWidth,
            barXAccessor,
            innerWidth,
            d,
            y,
            zeroY
          );
          const trim = Math.min(rise, Math.max(0, barHeight - 1));
          y += trim;
          barHeight -= trim;
        }
      }

      let labelX = 0;
      let labelY = 0;
      let labelTransform: string | undefined;
      let valueLabel: string | undefined;
      if (showValue) {
        const text = valueLabelFormatter(value);
        const labelLayout = getBarValueLabelLayout({
          x,
          y,
          width: barW,
          height: barHeight,
          labelWidth: text.length * 7.2,
          isHorizontal,
          orientation: valueLabelOrientation,
          position: valueLabelPosition,
        });
        labelX = labelLayout.x;
        labelY = labelLayout.y;
        labelTransform = labelLayout.rotated
          ? `rotate(-90 ${labelLayout.x} ${labelLayout.y})`
          : undefined;
        valueLabel = labelLayout.fits ? text : undefined;
      }

      let growOrigin = zeroY;
      if (isHorizontal) {
        growOrigin = stacked ? x : zeroX;
      }

      result.push({
        // Use categoryValue as key since it's the unique identifier from data
        key: `bar-${dataKey}-${categoryValue}`,
        index: i,
        x,
        y,
        width: barW,
        height: barHeight,
        rx: effectiveRx,
        growOrigin,
        valueLabel,
        labelX,
        labelY,
        labelTransform,
      });
    }
    return result;
  }, [
    bandWidth,
    barScale,
    barWidth,
    barXAccessor,
    chartYScale,
    cornerRadius,
    data,
    dataKey,
    groupGap,
    innerHeight,
    innerWidth,
    isHorizontal,
    isLastSeries,
    minBarHeight,
    perspective,
    seriesCount,
    seriesIndex,
    showValue,
    stackGap,
    stackOffsets,
    stacked,
    valueLabelFormatter,
    valueLabelOrientation,
    valueLabelPosition,
    valueScale,
  ]);

  const animating = animate && !isLoaded;

  return (
    <g className={`bar-series-${uniqueId}`}>
      {geometries.map((bar) => {
        const isFaded =
          (hoveredBarIndex !== null && hoveredBarIndex !== bar.index) ||
          isLegendDimmed;

        if (animating) {
          return (
            <AnimatedBar
              animationType={animationType}
              enterTransition={enterTransition}
              fadedOpacity={fadedOpacity}
              fill={fill}
              growOrigin={bar.growOrigin}
              height={bar.height}
              index={bar.index}
              isFaded={isFaded}
              isHorizontal={isHorizontal}
              key={bar.key}
              labelTransform={bar.labelTransform}
              labelX={bar.labelX}
              labelY={bar.labelY}
              revealEpoch={revealEpoch}
              rx={bar.rx}
              ry={bar.rx}
              staggerDelay={calculatedStaggerDelay}
              valueLabel={bar.valueLabel}
              valueLabelClassName={valueLabelClassName}
              valueLabelColor={valueLabelColor}
              width={bar.width}
              x={bar.x}
              y={bar.y}
            />
          );
        }

        // Static bar after animation completes
        return (
          <StaticBar
            fill={fill}
            geometry={bar}
            key={bar.key}
            opacity={isFaded ? fadedOpacity : 1}
            valueLabelClassName={valueLabelClassName}
            valueLabelColor={valueLabelColor}
          />
        );
      })}
    </g>
  );
});

export function Bar(props: BarProps) {
  const { barScale, bandWidth, barXAccessor } = useChartStable();

  if (!(barScale && bandWidth && barXAccessor)) {
    console.warn("Bar component must be used within a BarChart");
    return null;
  }

  return (
    <BarInner
      {...props}
      bandWidth={bandWidth}
      barScale={barScale}
      barXAccessor={barXAccessor}
    />
  );
}

Bar.displayName = "Bar";

export default Bar;
