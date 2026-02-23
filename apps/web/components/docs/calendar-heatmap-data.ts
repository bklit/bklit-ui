/**
 * Generates calendar heatmap sample data using a seeded LCG PRNG so that
 * the output is deterministic (no Math.random) but looks realistic.
 *
 * Distribution: ~65% of days are empty; active days have values 1–9
 * skewed toward low numbers (r² transform approximates a half-Gaussian).
 */
function generateSampleData(year: number): { day: string; value: number }[] {
  const result: { day: string; value: number }[] = [];
  let s = 42;
  const lcg = (): number => {
    s = (s * 16_807) % 2_147_483_647;
    return s / 2_147_483_647;
  };

  for (let i = 0; i < 365; i++) {
    if (lcg() < 0.65) {
      continue;
    }
    const d = new Date(year, 0, 1 + i);
    const r = lcg();
    const value = Math.max(1, Math.round(r * r * 9));
    result.push({
      day: `${year}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
      value,
    });
  }

  return result;
}

export const calendarHeatmapSampleData = generateSampleData(2026);

export const calendarHeatmapGithubColors = [
  "#ebedf0",
  "#9be9a8",
  "#40c463",
  "#30a14e",
  "#216e39",
];
