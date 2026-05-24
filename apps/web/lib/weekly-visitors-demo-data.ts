function startOfDay(date: Date): Date {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

const WEEKLY_VISITOR_COUNTS = [820, 940, 880, 1020, 960, 1100, 420] as const;

/** Seven daily rows (Mon–today) for dashed-tail / in-progress period demos. */
export function buildWeeklyVisitorsData(
  now: Date = new Date()
): { date: Date; visitors: number; projected?: boolean }[] {
  const today = startOfDay(now);

  return WEEKLY_VISITOR_COUNTS.map((visitors, index) => {
    const offset = index - (WEEKLY_VISITOR_COUNTS.length - 1);
    const date = new Date(today);
    date.setDate(today.getDate() + offset);

    return {
      date,
      visitors,
      projected: offset === 0,
    };
  });
}

export const weeklyVisitorsData = buildWeeklyVisitorsData();

/** Index where the dashed projection begins (yesterday → today). */
export const weeklyVisitorsDashFromIndex = weeklyVisitorsData.length - 2;
