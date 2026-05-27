import { clampStudioPointCount } from "@/lib/studio/demo-data";

export const PROFIT_LOSS_DATA_KEY = "pnl";

/** Deterministic profit/loss sample data that crosses zero several times. */
export function generateProfitLossData(pointCount: number) {
  const points = clampStudioPointCount(pointCount);
  const baseYear = 2024;

  return Array.from({ length: points }, (_, index) => {
    const pnl = Math.round(
      Math.sin(index / 2.5) * 800 +
        Math.cos(index / 6) * 400 +
        (index - points / 2) * 15
    );

    return {
      date: new Date(baseYear, 0, index + 1),
      [PROFIT_LOSS_DATA_KEY]: pnl,
    };
  });
}
