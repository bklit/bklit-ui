import type { HeatmapColumn } from "@bklitui/ui/charts";

const HEATMAP_WEEKS = 53;
const HEATMAP_DAYS = 7;

function seededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 16_807 + 0) % 2_147_483_647;
    return (state - 1) / 2_147_483_646;
  };
}

function heatmapContributionCount(
  seed: number,
  week: number,
  day: number,
  dayOfWeek: number
): number {
  const random = seededRandom(seed + week * 1009 + day * 9176);
  const weekRandom = seededRandom(seed + week * 524_287);

  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const weekBusy = weekRandom();
  let burst = 0.85 + weekBusy * 0.3;
  if (weekBusy > 0.78) {
    burst = 1.75;
  } else if (weekBusy < 0.22) {
    burst = 0.28;
  }

  const activityChance = Math.min(
    0.9,
    (isWeekend ? 0.18 : 0.48) * burst + random() * 0.12
  );
  if (random() > activityChance) {
    return 0;
  }

  const level = random();
  if (level < 0.52) {
    return 1;
  }
  if (level < 0.76) {
    return 2;
  }
  if (level < 0.91) {
    return 3;
  }
  return 4;
}

/** GitHub-style contribution grid for docs and gallery demos. */
export function getHeatmapDemoData(
  seed = 0,
  weeks = HEATMAP_WEEKS
): HeatmapColumn[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - (weeks - 1) * 7);
  startDate.setDate(startDate.getDate() - startDate.getDay());

  const columns: HeatmapColumn[] = [];
  const cursor = new Date(startDate);

  for (let week = 0; week < weeks; week++) {
    const bins = Array.from({ length: HEATMAP_DAYS }, (_, day) => {
      const date = new Date(cursor);
      const dayOfWeek = date.getDay();
      cursor.setDate(cursor.getDate() + 1);

      const isFuture = date > today;
      return {
        bin: day,
        count: isFuture
          ? 0
          : heatmapContributionCount(seed, week, day, dayOfWeek),
        date,
      };
    });

    columns.push({ bin: week, bins });
  }

  return columns;
}
