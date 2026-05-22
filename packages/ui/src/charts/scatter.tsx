"use client";

import type { Variants } from "motion/react";
import { motion } from "motion/react";
import { useCallback, useMemo } from "react";
import {
  clipRevealTransition,
  DEFAULT_CHART_ENTER_TRANSITION,
} from "./animation";
import { defaultScatterColors, useChart } from "./chart-context";

export interface ScatterProps {
  /** Key in data to use for y values */
  dataKey: string;
  /** Fill color. Default: series color from chart palette (`--chart-1`, etc.) */
  fill?: string;
  /** Outer ring stroke color. Default: same as `fill` */
  stroke?: string;
  /** Outer ring stroke width in px. Default: 2. Set to 0 to disable. */
  strokeWidth?: number;
  /** Gap between the inner fill and outer ring in px. Default: 2 */
  ringGap?: number;
  /** Optional outer outline beyond the ring. Default: 0 */
  outlineWidth?: number;
  /** Outer outline color. Default: same as `stroke` */
  outlineColor?: string;
  /** Point radius in px. Default: 5 */
  radius?: number;
  /** Whether to animate points with clip reveal. Default: true */
  animate?: boolean;
  /** Dim non-active points while hovering. Default: true */
  fadeOnHover?: boolean;
  /** Opacity for non-hovered points when `fadeOnHover` is true. Default: 0.5 */
  inactiveOpacity?: number;
  /** Blur in px for non-hovered points when `fadeOnHover` is true. Default: 2 */
  inactiveBlur?: number;
  /** Initial blur in px during enter animation. Default: 2 */
  enterBlur?: number;
  /** Enlarge the active point while hovering. Default: true */
  showActiveHighlight?: boolean;
}

interface ScatterPointNodeProps {
  dataKey: string;
  index: number;
  cx: number;
  cy: number;
  isActive: boolean;
  isHovering: boolean;
  fadeOnHover: boolean;
  inactiveOpacity: number;
  inactiveBlur: number;
  enterBlur: number;
  revealDelay: number;
  revealEpoch: number;
  enterDuration: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  ringGap: number;
  outlineWidth: number;
  outlineColor: string;
  radius: number;
  showActiveHighlight: boolean;
  hoverEase: typeof DEFAULT_CHART_ENTER_TRANSITION.ease;
}

function ScatterPointNode({
  dataKey,
  index,
  cx,
  cy,
  isActive,
  isHovering,
  fadeOnHover,
  inactiveOpacity,
  inactiveBlur,
  enterBlur,
  revealDelay,
  revealEpoch,
  enterDuration,
  fill,
  stroke,
  strokeWidth,
  ringGap,
  outlineWidth,
  outlineColor,
  radius,
  showActiveHighlight,
  hoverEase,
}: ScatterPointNodeProps) {
  const animateState = (() => {
    if (isHovering && fadeOnHover) {
      return isActive ? "active" : "dimmed";
    }
    return "visible";
  })();

  const variants: Variants = {
    hidden: {
      opacity: 0,
      filter: `blur(${enterBlur}px)`,
      scale: 1,
    },
    visible: {
      opacity: 1,
      filter: "blur(0px)",
      scale: 1,
      transition: {
        delay: revealDelay,
        duration: enterDuration,
        ease: DEFAULT_CHART_ENTER_TRANSITION.ease,
      },
    },
    dimmed: {
      opacity: inactiveOpacity,
      filter: `blur(${inactiveBlur}px)`,
      scale: 1,
      transition: { duration: 0.4, ease: hoverEase },
    },
    active: {
      opacity: 1,
      filter: "blur(0px)",
      scale: showActiveHighlight ? 1.35 : 1,
      transition: { duration: 0.4, ease: hoverEase },
    },
  };

  const ringOuter = strokeWidth > 0 ? radius + ringGap + strokeWidth : radius;
  const outlineRadius = outlineWidth > 0 ? ringOuter + outlineWidth / 2 : 0;

  return (
    <g transform={`translate(${cx}, ${cy})`}>
      <motion.g
        animate={animateState}
        initial="hidden"
        key={`${dataKey}-${index}-${revealEpoch}`}
        variants={variants}
      >
        {outlineWidth > 0 ? (
          <circle
            cx={0}
            cy={0}
            fill="none"
            r={outlineRadius}
            stroke={outlineColor}
            strokeWidth={outlineWidth}
          />
        ) : null}
        <circle cx={0} cy={0} fill={fill} r={radius} />
        {strokeWidth > 0 ? (
          <circle
            cx={0}
            cy={0}
            fill="none"
            r={radius + ringGap + strokeWidth / 2}
            stroke={stroke}
            strokeWidth={strokeWidth}
          />
        ) : null}
      </motion.g>
    </g>
  );
}

export function Scatter({
  dataKey,
  fill,
  stroke,
  strokeWidth = 2,
  ringGap = 2,
  outlineWidth = 0,
  outlineColor,
  radius = 5,
  animate = true,
  fadeOnHover = true,
  inactiveOpacity = 0.5,
  inactiveBlur = 2,
  enterBlur = 2,
  showActiveHighlight = true,
}: ScatterProps) {
  const {
    data,
    xScale,
    yScale,
    innerWidth,
    tooltipData,
    enterTransition,
    animationDuration,
    revealEpoch,
    isLoaded,
    xAccessor,
    lines,
  } = useChart();

  const seriesIndex = useMemo(() => {
    const index = lines.findIndex((line) => line.dataKey === dataKey);
    return index >= 0 ? index : 0;
  }, [lines, dataKey]);

  const seriesColor =
    defaultScatterColors[seriesIndex % defaultScatterColors.length] ??
    defaultScatterColors[0];
  const resolvedFill = fill ?? seriesColor;
  const resolvedStroke = stroke ?? resolvedFill;
  const resolvedOutlineColor = outlineColor ?? resolvedStroke;

  const visualExtent = useMemo(() => {
    const ring = strokeWidth > 0 ? ringGap + strokeWidth : 0;
    const outline = outlineWidth > 0 ? outlineWidth : 0;
    const highlightPad = showActiveHighlight ? radius * 0.35 : 0;
    return radius + ring + outline + highlightPad + 2;
  }, [radius, strokeWidth, ringGap, outlineWidth, showActiveHighlight]);

  const revealDurationSec =
    clipRevealTransition(enterTransition).duration ?? animationDuration / 1000;
  /** Per-dot fade duration once the clip sweep reaches it. */
  const enterDuration = 0.5;
  const hoverEase = DEFAULT_CHART_ENTER_TRANSITION.ease;
  const isRevealing = animate && !isLoaded;

  const getY = useCallback(
    (d: Record<string, unknown>) => {
      const value = d[dataKey];
      return typeof value === "number" ? (yScale(value) ?? 0) : null;
    },
    [dataKey, yScale]
  );

  const isHovering = tooltipData !== null;
  const activeIndex = tooltipData?.index ?? -1;

  const points = useMemo(
    () =>
      data.flatMap((d, index) => {
        const cy = getY(d);
        if (cy === null) {
          return [];
        }
        const cx = xScale(xAccessor(d)) ?? 0;
        const leadingEdge = Math.max(0, cx - visualExtent);
        const revealDelay =
          innerWidth > 0 && isRevealing
            ? (leadingEdge / innerWidth) * revealDurationSec
            : 0;

        return [{ index, cx, cy, revealDelay }];
      }),
    [
      data,
      getY,
      xScale,
      xAccessor,
      innerWidth,
      isRevealing,
      revealDurationSec,
      visualExtent,
    ]
  );

  return (
    <g>
      {points.map((point) => (
        <ScatterPointNode
          cx={point.cx}
          cy={point.cy}
          dataKey={dataKey}
          enterBlur={enterBlur}
          enterDuration={enterDuration}
          fadeOnHover={fadeOnHover}
          fill={resolvedFill}
          hoverEase={hoverEase}
          inactiveBlur={inactiveBlur}
          inactiveOpacity={inactiveOpacity}
          index={point.index}
          isActive={activeIndex === point.index}
          isHovering={isHovering}
          key={`${dataKey}-${point.index}`}
          outlineColor={resolvedOutlineColor}
          outlineWidth={outlineWidth}
          radius={radius}
          revealDelay={point.revealDelay}
          revealEpoch={revealEpoch ?? 0}
          ringGap={ringGap}
          showActiveHighlight={showActiveHighlight}
          stroke={resolvedStroke}
          strokeWidth={strokeWidth}
        />
      ))}
    </g>
  );
}

Scatter.displayName = "Scatter";

export default Scatter;
