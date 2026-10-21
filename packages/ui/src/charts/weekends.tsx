"use client";

import { motion } from "motion/react";
import { useId, useMemo } from "react";
import { chartCssVars, useChartStable } from "./chart-context";
import {
  computeWeekendIndexRuns,
  computeWeekendRanges,
  type DateRangeAlign,
  DEFAULT_WEEKEND_DAYS,
} from "./date-ranges";
import { type PatternPresetId, renderPatternPreset } from "./pattern-preset";
import { type CategorySlots, useCategorySlots } from "./use-category-slots";
import { isReferenceAreaVisiblePhase } from "./y-domain-utils";

export type WeekendsFillType = "pattern" | "solid";

export interface WeekendsProps {
  /**
   * Days that count as weekend, as `Date#getDay()` numbers (0 = Sunday).
   * Default: `[6, 0]` (Saturday + Sunday). Use `[5, 6]` for Fri–Sat locales.
   */
  weekendDays?: readonly number[];
  /** Default: `"pattern"` (diagonal stripes). */
  fillType?: WeekendsFillType;
  /** Band / stripe colour. Default: `var(--chart-foreground-muted)` */
  fill?: string;
  /** Default: 0.45 for `pattern`, 0.08 for `solid`. */
  fillOpacity?: number;
  /** Pattern preset when `fillType` is `"pattern"`. Default: `"diagonal"` */
  pattern?: PatternPresetId;
  /** Default: 1.5 */
  patternScale?: number;
  /** Default: 1 */
  patternStrokeWidth?: number;
  /**
   * `"calendar"` shades midnight → midnight; `"centered"` shifts half a day so
   * daily points / columns sit mid-band. `"auto"` picks `"centered"` when the
   * chart has `SeriesBar` columns anchored at midnight. Band (bar) scales
   * always shade whole columns.
   * Default: `"auto"`
   */
  align?: "auto" | DateRangeAlign;
  /** Use UTC day boundaries. Default: false (local time) */
  utc?: boolean;
  /** Skip rendering when one day is narrower than this many pixels. Default: 2 */
  minDayWidth?: number;
  /**
   * Band (bar chart) scales only — data key holding each row's date. Default:
   * first field holding a `Date` or `"YYYY-MM-DD"` string.
   */
  dateKey?: string;
  className?: string;
}

interface WeekendRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const ENTER_FADE_MS = 420;

/** Center bands on midnight-anchored columns; noon-anchored columns already sit mid-day. */
function resolveAutoAlign(
  hasColumns: boolean,
  firstX: Date | undefined,
  utc: boolean
): DateRangeAlign {
  if (!(hasColumns && firstX) || Number.isNaN(firstX.getTime())) {
    return "calendar";
  }
  const hours = utc ? firstX.getUTCHours() : firstX.getHours();
  const minutes = utc ? firstX.getUTCMinutes() : firstX.getMinutes();
  return hours === 0 && minutes === 0 ? "centered" : "calendar";
}

interface PlotSize {
  innerWidth: number;
  innerHeight: number;
}

function bandScaleWeekendRects(
  slots: CategorySlots,
  weekendDays: number[],
  utc: boolean,
  minDayWidth: number,
  { innerWidth, innerHeight }: PlotSize
): WeekendRect[] {
  if (slots.step < minDayWidth) {
    return [];
  }
  const extent = slots.axis === "x" ? innerWidth : innerHeight;
  return computeWeekendIndexRuns(slots.dates, { weekendDays, utc }).flatMap(
    ([first, last]) => {
      const start = Math.max(0, slots.slotStart(first));
      const end = Math.min(extent, slots.slotStart(last) + slots.step);
      if (end <= start) {
        return [];
      }
      return slots.axis === "x"
        ? [{ x: start, y: 0, width: end - start, height: innerHeight }]
        : [{ x: 0, y: start, width: innerWidth, height: end - start }];
    }
  );
}

function timeScaleWeekendRects(
  xScale: (value: Date) => number,
  weekendDays: number[],
  utc: boolean,
  align: DateRangeAlign,
  minDayWidth: number,
  { innerWidth, innerHeight }: PlotSize
): WeekendRect[] {
  const [d0, d1] = (xScale as unknown as { domain: () => Date[] }).domain();
  if (!(d0 && d1)) {
    return [];
  }
  const spanMs = Math.abs(d1.getTime() - d0.getTime());
  if (spanMs <= 0 || (innerWidth * DAY_MS) / spanMs < minDayWidth) {
    return [];
  }
  return computeWeekendRanges(d0, d1, { weekendDays, utc, align }).flatMap(
    ({ start, end }) => {
      const a = xScale(start);
      const b = xScale(end);
      const x0 = Math.max(0, Math.min(a, b));
      const x1 = Math.min(innerWidth, Math.max(a, b));
      return x1 > x0
        ? [{ x: x0, y: 0, width: x1 - x0, height: innerHeight }]
        : [];
    }
  );
}

/**
 * Shades weekend spans behind the series on date x axes — time scales
 * (line / area / composed) and band scales (bar columns). Only visible spans
 * render, so brush zoom and long ranges stay cheap.
 */
export function Weekends({
  weekendDays = DEFAULT_WEEKEND_DAYS,
  fillType = "pattern",
  fill = chartCssVars.foregroundMuted,
  fillOpacity,
  pattern = "diagonal",
  patternScale = 1.5,
  patternStrokeWidth = 1,
  align = "auto",
  utc = false,
  minDayWidth = 2,
  dateKey,
  className,
}: WeekendsProps) {
  const {
    innerWidth,
    innerHeight,
    xScale,
    barScale,
    composedBarDataKeys,
    data,
    xAccessor,
    chartPhase,
    enterTransition,
  } = useChartStable();
  const slots = useCategorySlots(dateKey);
  const patternId = `chart-weekends-pattern-${useId().replace(/:/g, "")}`;

  const firstRow = data[0];
  const resolvedAlign: DateRangeAlign =
    align === "auto"
      ? resolveAutoAlign(
          (composedBarDataKeys?.length ?? 0) > 0,
          firstRow && !barScale ? xAccessor(firstRow) : undefined,
          utc
        )
      : align;
  const weekendKey = weekendDays.join(",");

  const rects = useMemo<WeekendRect[]>(() => {
    const days = weekendKey ? weekendKey.split(",").map(Number) : [];
    if (innerWidth <= 0 || innerHeight <= 0) {
      return [];
    }
    if (slots) {
      return bandScaleWeekendRects(slots, days, utc, minDayWidth, {
        innerWidth,
        innerHeight,
      });
    }
    if (barScale) {
      // Band scale without parseable dates — nothing to shade.
      return [];
    }
    return timeScaleWeekendRects(
      xScale,
      days,
      utc,
      resolvedAlign,
      minDayWidth,
      {
        innerWidth,
        innerHeight,
      }
    );
  }, [
    weekendKey,
    innerWidth,
    innerHeight,
    slots,
    barScale,
    xScale,
    utc,
    resolvedAlign,
    minDayWidth,
  ]);

  const usesPattern = fillType === "pattern" && pattern !== "none";
  const patternNode = useMemo(
    () =>
      usesPattern
        ? renderPatternPreset(pattern, patternId, {
            color: fill,
            scale: patternScale,
            strokeWidth: patternStrokeWidth,
          })
        : null,
    [usesPattern, pattern, patternId, fill, patternScale, patternStrokeWidth]
  );

  if (rects.length === 0) {
    return null;
  }

  const opacity = fillOpacity ?? (usesPattern ? 0.45 : 0.08);
  const rectFill = patternNode ? `url(#${patternId})` : fill;
  const visible = isReferenceAreaVisiblePhase(chartPhase);
  const fadeTransition =
    enterTransition && typeof enterTransition === "object"
      ? enterTransition
      : { duration: ENTER_FADE_MS / 1000, ease: "easeOut" as const };

  return (
    <motion.g
      animate={{ opacity: visible ? 1 : 0 }}
      aria-hidden="true"
      className={className ?? "chart-weekends"}
      initial={{ opacity: 0 }}
      transition={fadeTransition}
    >
      {patternNode}
      <g fill={rectFill} opacity={opacity}>
        {rects.map((rect) => (
          <rect
            height={rect.height}
            key={`${rect.x}:${rect.y}`}
            width={rect.width}
            x={rect.x}
            y={rect.y}
          />
        ))}
      </g>
    </motion.g>
  );
}

Weekends.displayName = "Weekends";

export default Weekends;
