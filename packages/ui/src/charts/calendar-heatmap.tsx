"use client";

import { scaleQuantize } from "@visx/scale";
import { AnimatePresence, motion } from "motion/react";
import {
  type CSSProperties,
  type ReactNode,
  useMemo,
  useRef,
  useState,
} from "react";
import { cn } from "../lib/utils";

// ─── Public types ────────────────────────────────────────────────────

export interface CalendarHeatmapDatum {
  /** Date string in "YYYY-MM-DD" format */
  day: string;
  /** Numeric value for this day */
  value: number;
}

export interface CalendarHeatmapProps {
  /** Array of daily data points */
  data: CalendarHeatmapDatum[];
  /**
   * Year to display. Defaults to the most common year found in data,
   * or the current year if data is empty.
   */
  year?: number;
  /**
   * First day of the week. 0 = Sunday, 1 = Monday.
   * Default: 1 (Monday)
   */
  weekStartsOn?: 0 | 1;

  // ─── Cell appearance ────────────────────────────────────────────

  /** Cell size in pixels (within SVG coordinate space). Default: 12 */
  cellSize?: number;
  /** Gap between adjacent cells in pixels. Default: 2 */
  cellGap?: number;
  /** Border radius of each cell in pixels. Default: 2 */
  cellRadius?: number;
  /** Fill color for days with no data. Default: "var(--chart-foreground-muted)" */
  emptyColor?: string;

  // ─── Color scale ────────────────────────────────────────────────

  /**
   * Sequential color array from lowest to highest value.
   * Default: chart-5 (lightest) through chart-1 (darkest).
   */
  colors?: string[];
  /**
   * Custom color resolver. When provided, overrides the built-in quantize scale.
   * Receives the datum (undefined for empty days) and the date string.
   */
  getColor?: (
    datum: CalendarHeatmapDatum | undefined,
    dateStr: string
  ) => string;
  /**
   * Color scale domain [min, max]. Defaults to [0, max(values)].
   */
  domain?: [number, number];

  // ─── Labels ─────────────────────────────────────────────────────

  /** Show abbreviated month names above the grid. Default: true */
  showMonthLabels?: boolean;
  /** Show abbreviated day-of-week labels on the left side. Default: true */
  showDayLabels?: boolean;
  /**
   * Which row indices (0–6, adjusted for weekStartsOn) to render a day label for.
   * Default: [1, 3, 5] — Mon/Wed/Fri (Monday start) or Tue/Thu/Sat (Sunday start).
   */
  dayLabelIndices?: number[];
  /** Custom month label formatter. Receives 0-based month index (0 = January). */
  formatMonth?: (monthIndex: number) => string;
  /** Custom day-of-week label formatter. Receives the adjusted row index (0–6). */
  formatDay?: (rowIndex: number) => string;

  // ─── Month boundaries ───────────────────────────────────────────

  /**
   * Add visual gaps between months. Cells belonging to different months are
   * offset horizontally so a staircase-shaped gap appears at each boundary.
   * Default: false
   */
  showMonthOutlines?: boolean;

  // ─── Tooltip ────────────────────────────────────────────────────

  /**
   * Custom tooltip renderer. Return null/undefined to suppress the tooltip.
   * Default renders the formatted date and value.
   */
  renderTooltip?: (
    datum: CalendarHeatmapDatum | undefined,
    dateStr: string
  ) => ReactNode;
  /** Date formatter used in the default tooltip. */
  formatDate?: (dateStr: string) => string;
  /** Value formatter used in the default tooltip. */
  formatValue?: (value: number) => string;

  // ─── Layout ─────────────────────────────────────────────────────

  className?: string;
  style?: CSSProperties;
}

// ─── Constants & defaults ────────────────────────────────────────────

const DEFAULT_CELL_SIZE = 12;
const DEFAULT_CELL_GAP = 2;
const DEFAULT_CELL_RADIUS = 2;
const DEFAULT_DAY_LABEL_INDICES = [1, 3, 5];
const DEFAULT_COLORS = [
  "var(--chart-5)",
  "var(--chart-4)",
  "var(--chart-3)",
  "var(--chart-2)",
  "var(--chart-1)",
];
const DEFAULT_EMPTY_COLOR = "var(--chart-empty)";

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// Row 0 = first day of the week. Index for weekStartsOn=1 (Mon start).
const DAY_NAMES_MON = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
// Row 0 = first day of the week. Index for weekStartsOn=0 (Sun start).
const DAY_NAMES_SUN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// ─── Date utilities ──────────────────────────────────────────────────

/** Returns the row index (0–6) for a date adjusted for weekStartsOn. */
function adjustedDayOfWeek(date: Date, weekStartsOn: 0 | 1): number {
  return (date.getDay() - weekStartsOn + 7) % 7;
}

/**
 * Returns the week column index for a date within its year.
 * Column 0 is the first partial (or full) week containing Jan 1.
 */
function getWeekIndex(
  date: Date,
  yearStart: Date,
  weekStartsOn: 0 | 1
): number {
  const dayOfYear = Math.round(
    (date.getTime() - yearStart.getTime()) / 86_400_000
  );
  const yearStartOffset = adjustedDayOfWeek(yearStart, weekStartsOn);
  return Math.floor((dayOfYear + yearStartOffset) / 7);
}

/** Formats a Date as "YYYY-MM-DD". */
function dateToKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Generates every day in a calendar year. */
function generateYearDays(year: number): Date[] {
  const days: Date[] = [];
  const date = new Date(year, 0, 1);
  while (date.getFullYear() === year) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
}

/** Default date formatter for the tooltip ("Jan 5, 2024" style). */
function defaultFormatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(
    y ?? new Date().getFullYear(),
    (m ?? 1) - 1,
    d ?? 1
  ).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ─── Internal cell record ────────────────────────────────────────────

interface DayCell {
  dateStr: string;
  weekCol: number;
  dayRow: number;
  /** 0-based month index used to compute the horizontal month-gap offset */
  monthIdx: number;
  datum: CalendarHeatmapDatum | undefined;
}

// ─── Component ───────────────────────────────────────────────────────

export function CalendarHeatmap({
  data,
  year: yearProp,
  weekStartsOn = 1,
  cellSize = DEFAULT_CELL_SIZE,
  cellGap = DEFAULT_CELL_GAP,
  cellRadius = DEFAULT_CELL_RADIUS,
  emptyColor = DEFAULT_EMPTY_COLOR,
  colors = DEFAULT_COLORS,
  getColor,
  domain,
  showMonthLabels = true,
  showDayLabels = true,
  dayLabelIndices = DEFAULT_DAY_LABEL_INDICES,
  formatMonth,
  formatDay,
  showMonthOutlines = false,
  renderTooltip,
  formatDate = defaultFormatDate,
  formatValue,
  className,
  style,
}: CalendarHeatmapProps) {
  // ── Infer display year ───────────────────────────────────────────
  const year = useMemo(() => {
    if (yearProp !== undefined) {
      return yearProp;
    }
    if (data.length === 0) {
      return new Date().getFullYear();
    }
    const counts = new Map<number, number>();
    for (const { day } of data) {
      const y = Number(day.slice(0, 4));
      counts.set(y, (counts.get(y) ?? 0) + 1);
    }
    return (
      [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ??
      new Date().getFullYear()
    );
  }, [yearProp, data]);

  // ── Data lookup map ──────────────────────────────────────────────
  const dataMap = useMemo(
    () =>
      new Map(
        data
          .filter((d) => d.day.startsWith(String(year)))
          .map((d) => [d.day, d])
      ),
    [data, year]
  );

  // ── Color scale ──────────────────────────────────────────────────
  const colorScale = useMemo(() => {
    const values = [...dataMap.values()].map((d) => d.value);
    const [min, max] = domain ?? [0, Math.max(...values, 1)];
    return scaleQuantize<string>({ domain: [min, max], range: colors });
  }, [dataMap, domain, colors]);

  // ── Layout step and month gap ────────────────────────────────────
  const step = cellSize + cellGap;
  /**
   * When showMonthOutlines is true, cells from different months are offset
   * by (monthIdx * monthGap) pixels, creating a staircase-shaped physical
   * gap at every month boundary without drawing any overlay lines.
   */
  const monthGap = showMonthOutlines ? cellGap * 2 : 0;

  // ── Generate all day cells ───────────────────────────────────────
  const { days, totalWeeks, yearStart } = useMemo(() => {
    const ys = new Date(year, 0, 1);
    const allDays = generateYearDays(year);
    const cells: DayCell[] = allDays.map((date) => {
      const dateStr = dateToKey(date);
      return {
        dateStr,
        weekCol: getWeekIndex(date, ys, weekStartsOn),
        dayRow: adjustedDayOfWeek(date, weekStartsOn),
        monthIdx: date.getMonth(),
        datum: dataMap.get(dateStr),
      };
    });
    const tw = getWeekIndex(new Date(year, 11, 31), ys, weekStartsOn) + 1;
    return { days: cells, totalWeeks: tw, yearStart: ys };
  }, [year, weekStartsOn, dataMap]);

  // ── Month label positions ────────────────────────────────────────
  const monthPositions = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        monthIdx: i,
        weekCol: getWeekIndex(new Date(year, i, 1), yearStart, weekStartsOn),
        label: formatMonth ? formatMonth(i) : (MONTH_NAMES[i] ?? ""),
      })),
    [year, yearStart, weekStartsOn, formatMonth]
  );

  // ── Day label data ───────────────────────────────────────────────
  const dayLabelItems = useMemo(() => {
    const names = weekStartsOn === 1 ? DAY_NAMES_MON : DAY_NAMES_SUN;
    return dayLabelIndices.map((rowIdx) => ({
      rowIdx,
      label: formatDay ? formatDay(rowIdx) : (names[rowIdx] ?? ""),
    }));
  }, [weekStartsOn, dayLabelIndices, formatDay]);

  // ── Layout dimensions ────────────────────────────────────────────
  const dayLabelWidth = showDayLabels ? 28 : 0;
  const monthLabelHeight = showMonthLabels ? cellSize + 6 : 0;
  // Extra width = 11 month gaps (months 1–11 each add monthGap to their offset)
  const svgWidth = dayLabelWidth + totalWeeks * step - cellGap + 11 * monthGap;
  const svgHeight = monthLabelHeight + 7 * step - cellGap;

  // ── Hover / tooltip state ────────────────────────────────────────
  const [hovered, setHovered] = useState<{
    datum: CalendarHeatmapDatum | undefined;
    dateStr: string;
    /** Cell center-x in SVG coordinate space (root, not group-local) */
    svgX: number;
    /** Cell top-y in SVG coordinate space (root, not group-local) */
    svgY: number;
  } | null>(null);

  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // ── Color resolver ───────────────────────────────────────────────
  function resolveColor(
    datum: CalendarHeatmapDatum | undefined,
    dateStr: string
  ): string {
    if (getColor) {
      return getColor(datum, dateStr);
    }
    if (!datum) {
      return emptyColor;
    }
    return colorScale(datum.value) ?? emptyColor;
  }

  // ── Default tooltip content ──────────────────────────────────────
  function getTooltipValueText(
    datum: CalendarHeatmapDatum | undefined
  ): string {
    if (datum === undefined) {
      return "No data";
    }
    if (formatValue) {
      return formatValue(datum.value);
    }
    return datum.value.toLocaleString();
  }

  function defaultTooltipContent(
    datum: CalendarHeatmapDatum | undefined,
    dateStr: string
  ): ReactNode {
    return (
      <div className="flex flex-col gap-0.5">
        <span
          className="font-medium text-xs"
          style={{ color: "var(--chart-foreground)" }}
        >
          {formatDate(dateStr)}
        </span>
        <span
          className="text-xs"
          style={{ color: "var(--chart-foreground-muted)" }}
        >
          {getTooltipValueText(datum)}
        </span>
      </div>
    );
  }

  // ── Tooltip positioning ──────────────────────────────────────────
  function computeTooltipStyle(): CSSProperties {
    if (!(hovered && svgRef.current)) {
      return { display: "none" };
    }
    const scale = svgRef.current.clientWidth / svgWidth;
    const pixelX = hovered.svgX * scale;
    const pixelY = hovered.svgY * scale;
    const containerWidth = containerRef.current?.clientWidth ?? 300;
    const tooltipWidth = 128;
    return {
      position: "absolute",
      pointerEvents: "none",
      zIndex: 50,
      left: Math.min(
        Math.max(0, pixelX - tooltipWidth / 2),
        containerWidth - tooltipWidth
      ),
      top:
        pixelY > monthLabelHeight * scale + 40
          ? pixelY - 56
          : pixelY + step * scale + 6,
    };
  }

  return (
    <div
      className={cn("relative select-none", className)}
      ref={containerRef}
      style={style}
    >
      <svg
        aria-label={`Calendar heatmap for ${year}`}
        ref={svgRef}
        style={{ width: "100%", height: "auto" }}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      >
        {/* ── Day-of-week labels ──────────────────────────────── */}
        {showDayLabels &&
          dayLabelItems.map(({ rowIdx, label }) => (
            <text
              dominantBaseline="middle"
              fill="var(--chart-label)"
              fontFamily="inherit"
              fontSize={cellSize - 2}
              key={rowIdx}
              textAnchor="end"
              x={dayLabelWidth - 4}
              y={monthLabelHeight + rowIdx * step + cellSize / 2}
            >
              {label}
            </text>
          ))}

        {/* ── Month labels ────────────────────────────────────── */}
        {showMonthLabels &&
          monthPositions.map(({ monthIdx, weekCol, label }) => (
            <text
              fill="var(--chart-label)"
              fontFamily="inherit"
              fontSize={cellSize - 1}
              key={monthIdx}
              textAnchor="start"
              x={dayLabelWidth + weekCol * step + monthIdx * monthGap}
              y={monthLabelHeight - 4}
            >
              {label}
            </text>
          ))}

        {/* ── Day cells ───────────────────────────────────────── */}
        <g transform={`translate(${dayLabelWidth}, ${monthLabelHeight})`}>
          {days.map(({ dateStr, weekCol, dayRow, datum, monthIdx }) => {
            const fill = resolveColor(datum, dateStr);
            const x = weekCol * step + monthIdx * monthGap;
            const y = dayRow * step;
            return (
              <motion.g
                animate={{ opacity: 1 }}
                initial={{ opacity: 0 }}
                key={dateStr}
                onMouseEnter={() =>
                  setHovered({
                    datum,
                    dateStr,
                    svgX: dayLabelWidth + x + cellSize / 2,
                    svgY: monthLabelHeight + y,
                  })
                }
                onMouseLeave={() => setHovered(null)}
                style={{
                  transformBox: "fill-box",
                  transformOrigin: "center center",
                }}
                transition={{
                  delay: weekCol * 0.008,
                  duration: 0.3,
                }}
                whileHover={{ scale: 1.4 }}
              >
                <rect
                  fill={fill}
                  height={cellSize}
                  rx={cellRadius}
                  ry={cellRadius}
                  width={cellSize}
                  x={x}
                  y={y}
                />
              </motion.g>
            );
          })}
        </g>
      </svg>

      {/* ── Tooltip ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="min-w-[100px] rounded-md px-2.5 py-1.5 shadow-md"
            exit={{ opacity: 0, y: 4 }}
            initial={{ opacity: 0, y: 4 }}
            key={hovered.dateStr}
            style={{
              ...computeTooltipStyle(),
              backgroundColor: "var(--chart-background)",
              border: "1px solid var(--chart-grid)",
            }}
            transition={{ duration: 0.12 }}
          >
            {renderTooltip
              ? renderTooltip(hovered.datum, hovered.dateStr)
              : defaultTooltipContent(hovered.datum, hovered.dateStr)}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
