"use client";

import {
  Candlestick,
  CandlestickChart,
  ChartTooltip,
  type OHLCDataPoint,
  XAxis,
  YAxis,
} from "@bklitui/ui/charts";
import { CandlestickTooltipDemo } from "./candlestick-tooltip-demo";

const chartData: OHLCDataPoint[] = [
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

function formatUsd(v: number) {
  return `$${v.toFixed(2)}`;
}

export function CandlestickChartDemo() {
  return (
    <div className="w-full">
      <CandlestickChart
        data={chartData}
        margin={{ top: 16, right: 16, bottom: 40, left: 56 }}
        style={{ height: 320 }}
      >
        <Candlestick fadedOpacity={0.25} />
        <ChartTooltip content={CandlestickTooltipDemo} />
        <XAxis />
        <YAxis formatValue={formatUsd} />
      </CandlestickChart>
    </div>
  );
}
