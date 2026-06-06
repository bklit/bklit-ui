export function filterDataByXDomain(
  data: Record<string, unknown>[],
  xDomain: [Date, Date],
  xAccessor: (d: Record<string, unknown>) => Date
): Record<string, unknown>[] {
  const start = xDomain[0].getTime();
  const end = xDomain[1].getTime();
  const minTime = Math.min(start, end);
  const maxTime = Math.max(start, end);

  return data.filter((d) => {
    const time = xAccessor(d).getTime();
    return time >= minTime && time <= maxTime;
  });
}

export function resolveDataXExtent(
  data: Record<string, unknown>[],
  xAccessor: (d: Record<string, unknown>) => Date
): [Date, Date] | null {
  if (data.length === 0) {
    return null;
  }

  let minTime = Number.POSITIVE_INFINITY;
  let maxTime = Number.NEGATIVE_INFINITY;

  for (const point of data) {
    const time = xAccessor(point).getTime();
    if (time < minTime) {
      minTime = time;
    }
    if (time > maxTime) {
      maxTime = time;
    }
  }

  if (minTime === Number.POSITIVE_INFINITY) {
    return null;
  }

  return [new Date(minTime), new Date(maxTime)];
}
