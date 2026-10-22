export const shortDateFmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

export const weekdayDateFmt = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
});

export const hmsTimeFmt = new Intl.DateTimeFormat("en-US", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

// `Intl.NumberFormat.prototype.format` is a bound getter — safe to extract.
export const intFmt = new Intl.NumberFormat("en-US").format;
export const valueLabelFmt = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
}).format;

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

/**
 * Tooltip value for a `<Band>` row: `"low – high"` (ordered), the value itself
 * when both edges read the same key, or `null` when either edge is missing
 * (e.g. Bollinger warm-up rows).
 */
export function formatBandRange(
  point: Record<string, unknown>,
  upperKey: string,
  lowerKey: string,
  format: (value: number) => string = intFmt
): string | number | null {
  const upper = point[upperKey];
  const lower = point[lowerKey];
  if (!(isFiniteNumber(upper) && isFiniteNumber(lower))) {
    return null;
  }
  if (upperKey === lowerKey) {
    return upper;
  }
  return `${format(Math.min(lower, upper))} – ${format(Math.max(lower, upper))}`;
}
