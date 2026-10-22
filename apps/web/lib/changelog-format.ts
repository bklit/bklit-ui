/**
 * Changelog date labels. Entry dates are `YYYY-MM-DD` strings formatted in
 * UTC so server and client render the same text (no hydration drift).
 */
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

function parts(date: string) {
  const [year = 0, month = 1, day = 1] = date.split("-").map(Number);
  return { year, month: MONTHS[month - 1], day };
}

/** `October 22, 2026` */
export function formatChangelogDate(date: string): string {
  const { year, month, day } = parts(date);
  return `${month} ${day}, ${year}`;
}

/** `October ’26` — the scroll-spy rail label. */
export function formatChangelogMonth(date: string): string {
  const { year, month } = parts(date);
  return `${month} ’${String(year).slice(-2)}`;
}
