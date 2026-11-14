"use client";

import { m } from "motion/react";
import { memo, useMemo } from "react";
import {
  chartCssVars,
  useChart,
  useChartStable,
  useYScale,
} from "./chart-context";
import { useChartLegendHover } from "./chart-legend-hover";
import { transitionWithDelay } from "./motion-utils";

export interface BarLollipopProps {
  /** Key of the numeric value in each datum. Negative values hang below zero. */
  dataKey: string;
  yAxisId?: string | number;
  /** Dot color. Default: var(--chart-line-primary) */
  fill?: string;
  /**
   * Datum key holding a per-row dot color (e.g. a status tier). When the datum
   * has a string there, it replaces `fill` for that row.
   */
  colorKey?: string;
  /** Tooltip dot color (BarChart reads it for the series). Default: `fill` */
  stroke?: string;
  /** Dot radius in px. Default: 6 */
  radius?: number;
  /** Extra radius on the hovered dot in px. Default: 1.5 */
  activeRadiusOffset?: number;
  /** Soft halo behind the hovered dot. Default: true */
  showHalo?: boolean;
  /** Stem color. Default: var(--chart-foreground-muted) */
  stemStroke?: string;
  /** Stem width in px. Default: 1.5 */
  stemWidth?: number;
  /** Stem dash pattern; `""` draws a solid stem. Default: "4,4" */
  stemDasharray?: string;
  /** Stem opacity at rest (hovered stems go to 0.9). Default: 0.45 */
  stemOpacity?: number;
  /** Space between the stem end and the dot edge in px. Default: 3 */
  stemGap?: number;
  /** Solid zero line across the plot. Default: true */
  showBaseline?: boolean;
  /** Rounded full-height pill behind the hovered column. Default: true */
  showHighlight?: boolean;
  /** Highlight pill width in px. Default: `radius * 4` */
  highlightWidth?: number;
  /** Highlight pill opacity. Default: 0.06 */
  highlightOpacity?: number;
  /** Opacity of the other columns while one is hovered. Default: 1 (no fade) */
  fadedOpacity?: number;
  /**
   * Fade rows to 0.2 when this returns true — e.g. rows outside the tier
   * hovered in a legend. Series-level legend hover dims the whole series.
   */
  dimRow?: (datum: Record<string, unknown>, index: number) => boolean;
  /** Grow the stems out of the baseline on enter. Default: true */
  animate?: boolean;
  /** Delay between columns in seconds. Default: spreads 40% of the reveal across rows */
  staggerDelay?: number;
  /** Gap between grouped series in px. Default: 4 */
  groupGap?: number;
}

const HOVER_TRANSITION = "150ms ease-out";
/** Opacity of rows dimmed by legend hover or `dimRow`. */
const DIMMED_OPACITY = 0.2;

interface LollipopShape {
  key: string;
  x: number;
  valueY: number;
  color: string;
  index: number;
}

/** Rows → dot centres for one series (skips non-numeric values). */
function useLollipopShapes({
  dataKey,
  colorKey,
  fill,
  groupGap,
  seriesIndex,
  seriesCount,
  valueScale,
}: {
  dataKey: string;
  colorKey?: string;
  fill: string;
  groupGap: number;
  seriesIndex: number;
  seriesCount: number;
  valueScale: (value: number) => number | undefined;
}): LollipopShape[] {
  const { data, barScale, bandWidth = 0, barXAccessor } = useChartStable();
  return useMemo(() => {
    if (!(barScale && barXAccessor)) {
      return [];
    }
    const effectiveGroupGap = seriesCount > 1 ? groupGap : 0;
    const slotWidth =
      seriesCount > 0
        ? (bandWidth - effectiveGroupGap * (seriesCount - 1)) / seriesCount
        : bandWidth;
    const shapes: LollipopShape[] = [];
    data.forEach((datum, index) => {
      const value = datum[dataKey];
      if (typeof value !== "number" || Number.isNaN(value)) {
        return;
      }
      const category = barXAccessor(datum);
      const bandPos = barScale(category) ?? 0;
      const rowColor = colorKey ? datum[colorKey] : undefined;
      shapes.push({
        key: `${dataKey}-${category}`,
        x:
          bandPos +
          seriesIndex * (slotWidth + effectiveGroupGap) +
          slotWidth / 2,
        valueY: valueScale(value) ?? 0,
        color: typeof rowColor === "string" ? rowColor : fill,
        index,
      });
    });
    return shapes;
  }, [
    data,
    barScale,
    bandWidth,
    barXAccessor,
    dataKey,
    colorKey,
    fill,
    groupGap,
    seriesIndex,
    seriesCount,
    valueScale,
  ]);
}

interface LollipopStemProps {
  shape: LollipopShape;
  baselineY: number;
  radius: number;
  activeRadiusOffset: number;
  showHalo: boolean;
  stemStroke: string;
  stemWidth: number;
  stemDasharray: string;
  stemOpacity: number;
  stemGap: number;
  isActive: boolean;
  isFaded: boolean;
  fadedOpacity: number;
  animate: boolean;
  delaySeconds: number;
}

const LollipopStem = memo(function LollipopStem({
  shape,
  baselineY,
  radius,
  activeRadiusOffset,
  showHalo,
  stemStroke,
  stemWidth,
  stemDasharray,
  stemOpacity,
  stemGap,
  isActive,
  isFaded,
  fadedOpacity,
  animate,
  delaySeconds,
}: LollipopStemProps) {
  const { enterTransition, revealEpoch = 0 } = useChartStable();
  const length = shape.valueY - baselineY;
  const direction = Math.sign(length) || 1;
  const reach = radius + stemGap;
  const stemEnd = shape.valueY - direction * reach;
  const hasStem = Math.abs(length) > reach;
  const transition = transitionWithDelay(enterTransition, delaySeconds);
  const enterKey = `${shape.key}-${revealEpoch}`;

  return (
    <g
      opacity={isFaded ? fadedOpacity : 1}
      style={{ transition: `opacity ${HOVER_TRANSITION}` }}
    >
      {hasStem ? (
        <m.line
          animate={{ y2: stemEnd }}
          initial={animate ? { y2: baselineY } : false}
          key={`stem-${enterKey}`}
          stroke={stemStroke}
          strokeDasharray={stemDasharray || undefined}
          strokeOpacity={isActive ? 0.9 : stemOpacity}
          strokeWidth={stemWidth}
          style={{ transition: `stroke-opacity ${HOVER_TRANSITION}` }}
          transition={transition}
          x1={shape.x}
          x2={shape.x}
          y1={baselineY}
        />
      ) : null}
      <m.g
        animate={{ y: shape.valueY }}
        initial={animate ? { y: baselineY } : false}
        key={`dot-${enterKey}`}
        transition={transition}
      >
        {showHalo ? (
          <circle
            cx={shape.x}
            cy={0}
            fill={shape.color}
            opacity={isActive ? 0.25 : 0}
            r={radius * 2}
            style={{ transition: `opacity ${HOVER_TRANSITION}` }}
          />
        ) : null}
        <circle
          cx={shape.x}
          cy={0}
          fill={shape.color}
          r={isActive ? radius + activeRadiusOffset : radius}
          stroke={isActive ? chartCssVars.background : "none"}
          strokeWidth={2}
          style={{ transition: `r ${HOVER_TRANSITION}` }}
        />
      </m.g>
    </g>
  );
});

/** Soft full-height pill behind the hovered column (series 0 draws it once). */
function LollipopHighlight({
  x,
  width,
  opacity,
}: {
  x: number | null;
  width: number;
  opacity: number;
}) {
  const { innerHeight, margin } = useChartStable();
  const overshoot = margin.top / 4;
  return (
    <rect
      fill={chartCssVars.foreground}
      height={innerHeight + overshoot * 2}
      opacity={x === null ? 0 : opacity}
      rx={width / 2}
      style={{
        transition: `opacity ${HOVER_TRANSITION}, x ${HOVER_TRANSITION}`,
      }}
      width={width}
      x={(x ?? 0) - width / 2}
      y={-overshoot}
    />
  );
}

/**
 * Lollipop series for `BarChart`: a thin (dashed by default) stem from the
 * zero baseline to a round dot at each value. Negative values hang below
 * zero, so it doubles as a diverging profit / loss ranking. Vertical,
 * non-stacked charts only.
 */
export function BarLollipop({
  dataKey,
  yAxisId,
  fill = chartCssVars.linePrimary,
  colorKey,
  radius = 6,
  activeRadiusOffset = 1.5,
  showHalo = true,
  stemStroke = chartCssVars.foregroundMuted,
  stemWidth = 1.5,
  stemDasharray = "4,4",
  stemOpacity = 0.45,
  stemGap = 3,
  showBaseline = true,
  showHighlight = true,
  highlightWidth,
  highlightOpacity = 0.06,
  fadedOpacity = 1,
  dimRow,
  animate = true,
  staggerDelay,
  groupGap = 4,
}: BarLollipopProps) {
  const {
    lines,
    orientation,
    stacked,
    innerWidth,
    innerHeight,
    animationDuration,
    data,
    hoveredBarIndex = null,
  } = useChart();
  const { hoveredIndex: legendHoveredIndex } = useChartLegendHover();

  const lineIndex = lines.findIndex((line) => line.dataKey === dataKey);
  const seriesIndex = Math.max(lineIndex, 0);
  const valueScale = useYScale(yAxisId ?? lines[seriesIndex]?.yAxisId);
  const shapes = useLollipopShapes({
    dataKey,
    colorKey,
    fill,
    groupGap,
    seriesIndex,
    seriesCount: lines.length,
    valueScale,
  });

  if (orientation === "horizontal" || stacked) {
    return null;
  }

  const baselineY = valueScale(0) ?? innerHeight;
  const isLegendDimmed =
    legendHoveredIndex !== null && legendHoveredIndex !== seriesIndex;
  const staggerSeconds =
    staggerDelay ??
    (data.length > 1
      ? ((animationDuration || 1100) * 0.4) / 1000 / data.length
      : 0);
  const isLeadSeries = seriesIndex === 0;
  const activeShape =
    hoveredBarIndex === null
      ? undefined
      : shapes.find((shape) => shape.index === hoveredBarIndex);

  return (
    <g data-bar-lollipop={dataKey} style={{ pointerEvents: "none" }}>
      {showHighlight && isLeadSeries ? (
        <LollipopHighlight
          opacity={highlightOpacity}
          width={highlightWidth ?? radius * 4}
          x={activeShape?.x ?? null}
        />
      ) : null}
      {showBaseline && isLeadSeries ? (
        <line
          stroke={chartCssVars.foregroundMuted}
          strokeOpacity={0.6}
          x1={0}
          x2={innerWidth}
          y1={baselineY}
          y2={baselineY}
        />
      ) : null}
      {shapes.map((shape) => {
        const datum = data[shape.index];
        const isRowDimmed =
          isLegendDimmed ||
          (dimRow !== undefined &&
            datum !== undefined &&
            dimRow(datum, shape.index));
        return (
          <LollipopStem
            activeRadiusOffset={activeRadiusOffset}
            animate={animate}
            baselineY={baselineY}
            delaySeconds={shape.index * staggerSeconds}
            fadedOpacity={isRowDimmed ? DIMMED_OPACITY : fadedOpacity}
            isActive={shape.index === hoveredBarIndex}
            isFaded={
              isRowDimmed ||
              (hoveredBarIndex !== null && shape.index !== hoveredBarIndex)
            }
            key={shape.key}
            radius={radius}
            shape={shape}
            showHalo={showHalo}
            stemDasharray={stemDasharray}
            stemGap={stemGap}
            stemOpacity={stemOpacity}
            stemStroke={stemStroke}
            stemWidth={stemWidth}
          />
        );
      })}
    </g>
  );
}

BarLollipop.displayName = "BarLollipop";

export default BarLollipop;
