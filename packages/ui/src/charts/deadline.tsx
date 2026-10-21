"use client";

import { motion } from "motion/react";
import { type ReactNode, useId, useMemo } from "react";
import { useChartStable } from "./chart-context";
import { firstIndexOnOrAfter, toValidDate } from "./date-ranges";
import { type PatternPresetId, renderPatternPreset } from "./pattern-preset";
import { type CategorySlots, useCategorySlots } from "./use-category-slots";
import { isReferenceAreaVisiblePhase } from "./y-domain-utils";

export type DeadlineFillType = "pattern" | "solid" | "gradient" | "none";

export type DeadlineDate = Date | number | string;

export interface DeadlineProps {
  /** Date of the marker line (left edge of the region). */
  date: DeadlineDate;
  /** Where the region ends. Default: the right edge of the plot. */
  endDate?: DeadlineDate;
  /** Line and fill colour. Default: `var(--chart-negative)` (red) */
  color?: string;
  /** Default: `"pattern"` (diagonal stripes). `"none"` draws only the line. */
  fillType?: DeadlineFillType;
  /** Default: 0.6 for `pattern`, 0.12 for `solid`, 0.25 for `gradient`. */
  fillOpacity?: number;
  /** `gradient` only — opacity at the region's right edge. Default: 0 */
  gradientToOpacity?: number;
  /** Pattern preset when `fillType` is `"pattern"`. Default: `"diagonal"` */
  pattern?: PatternPresetId;
  /** Default: 1.5 */
  patternScale?: number;
  /** Default: 1 */
  patternStrokeWidth?: number;
  /** Fade the region out towards its right edge. Default: true */
  fade?: boolean;
  /** Fraction (0–1) of the region, measured from the right, that fades. Default: 0.5 */
  fadeLength?: number;
  /** Draw the vertical marker line. Default: true */
  showLine?: boolean;
  /** Line colour. Default: `color` */
  stroke?: string;
  /** Default: 1 */
  strokeWidth?: number;
  /** Default: undefined (solid). */
  strokeDasharray?: string;
  /** Default: 1 */
  strokeOpacity?: number;
  /** Text drawn beside the marker line. */
  label?: string;
  /** Default: `"top"` */
  labelPosition?: "top" | "bottom";
  /** Default: `color` */
  labelColor?: string;
  /**
   * Band (bar chart) scales only — data key holding each row's date. Default:
   * first field holding a `Date` or `"YYYY-MM-DD"` string.
   */
  dateKey?: string;
  className?: string;
}

const DEFAULT_COLOR = "var(--chart-negative, var(--color-red-500))";
const ENTER_FADE_MS = 420;
const LABEL_INSET = 6;
const LABEL_FLIP_WIDTH = 96;

function defaultFillOpacity(fillType: DeadlineFillType): number {
  if (fillType === "pattern") {
    return 0.6;
  }
  if (fillType === "gradient") {
    return 0.25;
  }
  return 0.12;
}

interface DeadlineRegion {
  /** Unclipped pixel bounds — fade gradients stay pinned to data while panning. */
  x0: number;
  x1: number;
}

function resolveDeadlineRegion(
  startTime: number | undefined,
  endTime: number | undefined,
  {
    innerWidth,
    slots,
    isBandScale,
    xScale,
  }: {
    innerWidth: number;
    slots: CategorySlots | null;
    isBandScale: boolean;
    xScale: (value: Date) => number;
  }
): DeadlineRegion | null {
  if (startTime == null) {
    return null;
  }
  if (slots) {
    if (slots.axis !== "x") {
      return null;
    }
    const startIndex = firstIndexOnOrAfter(slots.dates, new Date(startTime));
    if (startIndex < 0) {
      return null;
    }
    const endIndex =
      endTime == null
        ? -1
        : firstIndexOnOrAfter(slots.dates, new Date(endTime));
    return {
      x0: slots.slotStart(startIndex),
      x1: endIndex < 0 ? innerWidth : slots.slotStart(endIndex),
    };
  }
  if (isBandScale) {
    return null;
  }
  return {
    x0: xScale(new Date(startTime)),
    x1: endTime == null ? innerWidth : xScale(new Date(endTime)),
  };
}

interface DeadlineRegionFillProps {
  region: DeadlineRegion;
  clipX0: number;
  clipX1: number;
  innerHeight: number;
  uid: string;
  color: string;
  fillType: DeadlineFillType;
  opacity: number;
  gradientToOpacity: number;
  patternNode: ReactNode;
  patternId: string;
  fade: boolean;
  fadeLength: number;
}

function DeadlineRegionFill({
  region,
  clipX0,
  clipX1,
  innerHeight,
  uid,
  color,
  fillType,
  opacity,
  gradientToOpacity,
  patternNode,
  patternId,
  fade,
  fadeLength,
}: DeadlineRegionFillProps) {
  const fadeMaskId = `chart-deadline-fade-${uid}`;
  const fillGradientId = `chart-deadline-fill-${uid}`;
  const fadeStart = 1 - Math.min(1, Math.max(0, fadeLength));
  const useFade = fade && fadeLength > 0;
  let regionFill = color;
  if (fillType === "gradient") {
    regionFill = `url(#${fillGradientId})`;
  } else if (patternNode) {
    regionFill = `url(#${patternId})`;
  }
  const gradientAttrs = {
    gradientUnits: "userSpaceOnUse" as const,
    x1: region.x0,
    x2: region.x1,
    y1: 0,
    y2: 0,
  };

  return (
    <>
      <defs>
        {useFade ? (
          <>
            <linearGradient id={`${fadeMaskId}-gradient`} {...gradientAttrs}>
              <stop offset={0} stopColor="white" stopOpacity={1} />
              <stop offset={fadeStart} stopColor="white" stopOpacity={1} />
              <stop offset={1} stopColor="white" stopOpacity={0} />
            </linearGradient>
            <mask id={fadeMaskId}>
              <rect
                fill={`url(#${fadeMaskId}-gradient)`}
                height={innerHeight}
                width={clipX1 - clipX0}
                x={clipX0}
                y={0}
              />
            </mask>
          </>
        ) : null}
        {fillType === "gradient" ? (
          <linearGradient id={fillGradientId} {...gradientAttrs}>
            <stop offset={0} stopColor={color} stopOpacity={1} />
            <stop
              offset={1}
              stopColor={color}
              stopOpacity={opacity > 0 ? gradientToOpacity / opacity : 0}
            />
          </linearGradient>
        ) : null}
      </defs>
      {patternNode}
      <rect
        fill={regionFill}
        height={innerHeight}
        mask={useFade ? `url(#${fadeMaskId})` : undefined}
        opacity={opacity}
        width={clipX1 - clipX0}
        x={clipX0}
        y={0}
      />
    </>
  );
}

function DeadlineMarkerLine({
  x,
  innerHeight,
  color,
  stroke,
  strokeWidth,
  strokeDasharray,
  strokeOpacity,
  label,
  labelColor,
  labelPosition,
  labelFlipped,
}: {
  x: number;
  innerHeight: number;
  color: string;
  stroke?: string;
  strokeWidth: number;
  strokeDasharray?: string;
  strokeOpacity: number;
  label?: string;
  labelColor?: string;
  labelPosition: "top" | "bottom";
  labelFlipped: boolean;
}) {
  const bottom = labelPosition === "bottom";
  return (
    <>
      <line
        stroke={stroke ?? color}
        strokeDasharray={strokeDasharray}
        strokeOpacity={strokeOpacity}
        strokeWidth={strokeWidth}
        x1={x}
        x2={x}
        y1={0}
        y2={innerHeight}
      />
      {label ? (
        <text
          dominantBaseline={bottom ? "auto" : "hanging"}
          fill={labelColor ?? color}
          fontSize={11}
          fontWeight={500}
          textAnchor={labelFlipped ? "end" : "start"}
          x={labelFlipped ? x - LABEL_INSET : x + LABEL_INSET}
          y={bottom ? innerHeight - LABEL_INSET : LABEL_INSET}
        >
          {label}
        </text>
      ) : null}
    </>
  );
}

/**
 * Due-date / point-of-no-return marker: a vertical line at `date` with a
 * region extending right (to `endDate` or the plot edge) that fades out.
 * Works on time scales (line / area / composed) and vertical bar charts.
 */
export function Deadline({
  date,
  endDate,
  color = DEFAULT_COLOR,
  fillType = "pattern",
  fillOpacity,
  gradientToOpacity = 0,
  pattern = "diagonal",
  patternScale = 1.5,
  patternStrokeWidth = 1,
  fade = true,
  fadeLength = 0.5,
  showLine = true,
  stroke,
  strokeWidth = 1,
  strokeDasharray,
  strokeOpacity = 1,
  label,
  labelPosition = "top",
  labelColor,
  dateKey,
  className,
}: DeadlineProps) {
  const {
    innerWidth,
    innerHeight,
    xScale,
    barScale,
    chartPhase,
    enterTransition,
  } = useChartStable();
  const slots = useCategorySlots(dateKey);
  const uid = useId().replace(/:/g, "");
  const patternId = `chart-deadline-pattern-${uid}`;

  const startTime = toValidDate(date)?.getTime();
  const endTime = endDate == null ? undefined : toValidDate(endDate)?.getTime();
  const isBandScale = barScale != null;

  const region = useMemo(
    () =>
      innerWidth > 0 && innerHeight > 0
        ? resolveDeadlineRegion(startTime, endTime, {
            innerWidth,
            slots,
            isBandScale,
            xScale,
          })
        : null,
    [startTime, endTime, innerWidth, innerHeight, slots, isBandScale, xScale]
  );

  const usesPattern = fillType === "pattern" && pattern !== "none";
  const patternNode = useMemo(
    () =>
      usesPattern
        ? renderPatternPreset(pattern, patternId, {
            color,
            scale: patternScale,
            strokeWidth: patternStrokeWidth,
          })
        : null,
    [usesPattern, pattern, patternId, color, patternScale, patternStrokeWidth]
  );

  if (!region || region.x1 <= region.x0) {
    return null;
  }

  const { x0 } = region;
  const clipX0 = Math.max(0, x0);
  const clipX1 = Math.min(innerWidth, region.x1);
  const lineVisible = showLine && x0 >= 0 && x0 <= innerWidth;
  const hasFill = fillType !== "none" && clipX1 > clipX0;
  if (!(lineVisible || hasFill)) {
    return null;
  }

  const visible = isReferenceAreaVisiblePhase(chartPhase);
  const fadeTransition =
    enterTransition && typeof enterTransition === "object"
      ? enterTransition
      : { duration: ENTER_FADE_MS / 1000, ease: "easeOut" as const };

  return (
    <motion.g
      animate={{ opacity: visible ? 1 : 0 }}
      aria-hidden="true"
      className={className ?? "chart-deadline"}
      initial={{ opacity: 0 }}
      transition={fadeTransition}
    >
      {hasFill ? (
        <DeadlineRegionFill
          clipX0={clipX0}
          clipX1={clipX1}
          color={color}
          fade={fade}
          fadeLength={fadeLength}
          fillType={fillType}
          gradientToOpacity={gradientToOpacity}
          innerHeight={innerHeight}
          opacity={fillOpacity ?? defaultFillOpacity(fillType)}
          patternId={patternId}
          patternNode={patternNode}
          region={region}
          uid={uid}
        />
      ) : null}
      {lineVisible ? (
        <DeadlineMarkerLine
          color={color}
          innerHeight={innerHeight}
          label={label}
          labelColor={labelColor}
          labelFlipped={x0 > innerWidth - LABEL_FLIP_WIDTH}
          labelPosition={labelPosition}
          stroke={stroke}
          strokeDasharray={strokeDasharray}
          strokeOpacity={strokeOpacity}
          strokeWidth={strokeWidth}
          x={x0}
        />
      ) : null}
    </motion.g>
  );
}

Deadline.displayName = "Deadline";

export default Deadline;
