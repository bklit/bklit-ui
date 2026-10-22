/** Day-of-week numbers as returned by `Date#getDay()` (0 = Sunday … 6 = Saturday). */
export type WeekdayIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/** Saturday + Sunday. */
export const DEFAULT_WEEKEND_DAYS: readonly WeekdayIndex[] = [6, 0];

/**
 * How a highlighted day maps onto the x axis.
 * - `"calendar"` — midnight to midnight (points at 00:00 sit on the band's left edge)
 * - `"centered"` — shifted half a day earlier so each day's point / column sits in the middle
 */
export type DateRangeAlign = "calendar" | "centered";

export interface DateRange {
  start: Date;
  end: Date;
}

export interface ComputeWeekendRangesOptions {
  weekendDays?: readonly number[];
  /** Use UTC day boundaries instead of local time. Default: false */
  utc?: boolean;
  align?: DateRangeAlign;
  /** Bail out (return `[]`) when the domain spans more days than this. Default: 20_000 */
  maxDays?: number;
}

const HALF_DAY_MS = 12 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(date: Date, utc: boolean): Date {
  return utc
    ? new Date(
        Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
      )
    : new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Next midnight — calendar arithmetic so DST days stay aligned. */
function addDays(date: Date, days: number, utc: boolean): Date {
  return utc
    ? new Date(
        Date.UTC(
          date.getUTCFullYear(),
          date.getUTCMonth(),
          date.getUTCDate() + days
        )
      )
    : new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

export function isWeekendDate(
  date: Date,
  weekendDays: readonly number[] = DEFAULT_WEEKEND_DAYS,
  utc = false
): boolean {
  const day = utc ? date.getUTCDay() : date.getDay();
  return weekendDays.includes(day);
}

/**
 * Contiguous weekend spans that intersect `[domainStart, domainEnd]`, clipped
 * to the domain. Consecutive weekend days merge into one range (Sat + Sun →
 * one span; Fri + Sat locales work the same way).
 */
export function computeWeekendRanges(
  domainStart: Date,
  domainEnd: Date,
  options: ComputeWeekendRangesOptions = {}
): DateRange[] {
  const {
    weekendDays = DEFAULT_WEEKEND_DAYS,
    utc = false,
    align = "calendar",
    maxDays = 20_000,
  } = options;

  let lo = domainStart.getTime();
  let hi = domainEnd.getTime();
  if (!(Number.isFinite(lo) && Number.isFinite(hi))) {
    return [];
  }
  if (lo > hi) {
    [lo, hi] = [hi, lo];
  }
  if (weekendDays.length === 0 || (hi - lo) / DAY_MS > maxDays) {
    return [];
  }

  const shift = align === "centered" ? HALF_DAY_MS : 0;
  const ranges: DateRange[] = [];
  let runStart: number | null = null;

  // Start one day early so a centered span (or a span already in progress at
  // the domain start) is still picked up.
  let day = addDays(startOfDay(new Date(lo + shift), utc), -1, utc);
  while (day.getTime() - shift <= hi) {
    const next = addDays(day, 1, utc);
    if (isWeekendDate(day, weekendDays, utc)) {
      if (runStart === null) {
        runStart = day.getTime() - shift;
      }
    } else if (runStart !== null) {
      pushClipped(ranges, runStart, day.getTime() - shift, lo, hi);
      runStart = null;
    }
    day = next;
  }
  if (runStart !== null) {
    pushClipped(ranges, runStart, day.getTime() - shift, lo, hi);
  }
  return ranges;
}

function pushClipped(
  ranges: DateRange[],
  start: number,
  end: number,
  lo: number,
  hi: number
) {
  const s = Math.max(start, lo);
  const e = Math.min(end, hi);
  if (e > s) {
    ranges.push({ start: new Date(s), end: new Date(e) });
  }
}

/**
 * Inclusive `[first, last]` index runs of consecutive weekend rows — for band
 * (category) scales where each row is one column. Rows with no date break a run.
 */
export function computeWeekendIndexRuns(
  dates: ReadonlyArray<Date | null | undefined>,
  options: Pick<ComputeWeekendRangesOptions, "weekendDays" | "utc"> = {}
): [number, number][] {
  const { weekendDays = DEFAULT_WEEKEND_DAYS, utc = false } = options;
  const runs: [number, number][] = [];
  let runStart = -1;
  dates.forEach((date, index) => {
    const weekend =
      date != null &&
      !Number.isNaN(date.getTime()) &&
      isWeekendDate(date, weekendDays, utc);
    if (weekend) {
      if (runStart < 0) {
        runStart = index;
      }
    } else if (runStart >= 0) {
      runs.push([runStart, index - 1]);
      runStart = -1;
    }
  });
  if (runStart >= 0) {
    runs.push([runStart, dates.length - 1]);
  }
  return runs;
}

const ISO_DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * Coerce a user date-ish value to a valid `Date` (or `null`). Date-only ISO
 * strings (`"2024-01-06"`) parse as local midnight, not UTC, so the weekday
 * matches the calendar date.
 */
export function toValidDate(value: unknown): Date | null {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  if (typeof value === "string") {
    const match = ISO_DATE_ONLY.exec(value.trim());
    if (match) {
      return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    }
  }
  if (typeof value === "number" || typeof value === "string") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  return null;
}

/**
 * Key of the first field in `row` holding a `Date` (or a date-only ISO string).
 * Used to find dates on band-scale (bar) charts whose context only exposes
 * category labels.
 */
export function detectDateKey(
  row: Record<string, unknown> | undefined
): string | null {
  if (!row) {
    return null;
  }
  for (const [key, value] of Object.entries(row)) {
    if (value instanceof Date) {
      return key;
    }
    if (typeof value === "string" && ISO_DATE_ONLY.test(value.trim())) {
      return key;
    }
  }
  return null;
}

/** Index of the first row whose date is on or after `target`; `-1` when none. */
export function firstIndexOnOrAfter(
  dates: ReadonlyArray<Date | null | undefined>,
  target: Date
): number {
  const t = target.getTime();
  return dates.findIndex((date) => date != null && date.getTime() >= t);
}
