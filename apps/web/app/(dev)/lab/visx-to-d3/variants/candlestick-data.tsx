"use client";

import type { OHLCDataPoint } from "@bklitui/ui/charts";
import { seededRandom } from "./deterministic";

/**
 * `candlestickOhlcData` from chart-examples.tsx (~30 days random walk) with
 * every `Math.random()` replaced by one seeded generator, called in the same
 * order, so the walk is identical on every run.
 */
export const candlestickOhlcData: OHLCDataPoint[] = (() => {
  const random = seededRandom(20_240_101);
  const points: OHLCDataPoint[] = [];
  const days = 30;
  let open = 100;
  const base = new Date(2024, 0, 1).getTime();
  for (let i = 0; i < days; i++) {
    const date = new Date(base + i * 24 * 60 * 60 * 1000);
    const volatility = 1.5 + random() * 1.5;
    const drift = (random() - 0.48) * volatility;
    const high = open + Math.abs(drift) * (1.5 + random());
    const low = open - Math.abs(drift) * (1.5 + random());
    const close = low + random() * (high - low);
    points.push({ date, open, high, low, close });
    open = close;
  }
  return points;
})();

/** `chartData` from docs/candlestick-chart-demo.tsx (verbatim). */
export const docsOhlcData: OHLCDataPoint[] = [
  { date: new Date(2024, 0, 1), open: 100, high: 108, low: 96, close: 104 },
  { date: new Date(2024, 0, 2), open: 104, high: 112, low: 101, close: 109 },
  { date: new Date(2024, 0, 3), open: 109, high: 115, low: 105, close: 108 },
  { date: new Date(2024, 0, 4), open: 108, high: 114, low: 102, close: 110 },
  { date: new Date(2024, 0, 5), open: 110, high: 118, low: 108, close: 115 },
  { date: new Date(2024, 0, 6), open: 115, high: 120, low: 111, close: 113 },
  { date: new Date(2024, 0, 7), open: 113, high: 119, low: 110, close: 117 },
  { date: new Date(2024, 0, 8), open: 117, high: 124, low: 115, close: 121 },
  { date: new Date(2024, 0, 9), open: 121, high: 126, low: 118, close: 120 },
  { date: new Date(2024, 0, 10), open: 120, high: 128, low: 117, close: 125 },
];

/**
 * `CandlestickTooltipContent` (chart-examples.tsx) / `CandlestickTooltipDemo`
 * (docs/candlestick-tooltip-demo.tsx): identical markup.
 */
export function CandlestickTooltipContent({
  point,
}: {
  point: Record<string, unknown>;
  index: number;
}) {
  const date = point.date instanceof Date ? point.date : new Date(0);
  const open = (point.open as number) ?? 0;
  const high = (point.high as number) ?? 0;
  const low = (point.low as number) ?? 0;
  const close = (point.close as number) ?? 0;
  const fmt = (v: number) => `$${v.toFixed(2)}`;
  return (
    <div className="px-3 py-2.5">
      <div className="mb-1.5 font-medium text-chart-tooltip-foreground text-xs opacity-60">
        {date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
      </div>
      <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-sm">
        <span className="text-chart-tooltip-muted">Open</span>
        <span className="text-chart-tooltip-foreground tabular-nums">
          {fmt(open)}
        </span>
        <span className="text-chart-tooltip-muted">High</span>
        <span className="text-chart-positive tabular-nums">{fmt(high)}</span>
        <span className="text-chart-tooltip-muted">Low</span>
        <span className="text-chart-negative tabular-nums">{fmt(low)}</span>
        <span className="text-chart-tooltip-muted">Close</span>
        <span className="text-chart-tooltip-foreground tabular-nums">
          {fmt(close)}
        </span>
      </div>
    </div>
  );
}

export function candlestickIndicatorColor(
  point: Record<string, unknown>
): string {
  const close = (point.close as number) ?? 0;
  const open = (point.open as number) ?? 0;
  return close >= open ? "var(--chart-positive)" : "var(--chart-negative)";
}

export function candlestickChartPaletteIndicatorColor(
  point: Record<string, unknown>
): string {
  const close = (point.close as number) ?? 0;
  const open = (point.open as number) ?? 0;
  return close >= open ? "var(--chart-1)" : "var(--chart-5)";
}
