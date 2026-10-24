"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { BenchChartProps, BenchLibraryAdapter } from "../types";

/** Same palette as the bklit and TanStack adapters. */
const SERIES_COLORS = [
  "var(--chart-line-primary)",
  "var(--chart-line-secondary)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

/**
 * Recharts defaults (recharts@3.10.1 es6/cartesian/*.js `defaultProps`):
 * Line and Area 1,500 ms, Bar and Scatter 400 ms, all `animationBegin: 0`.
 */
const RECHARTS_LINE_AREA_ENTER_MS = 1500;

const dateTick = new Intl.DateTimeFormat("en-US", {
  month: "short",
  year: "2-digit",
});

const MARGIN = { top: 8, right: 8, bottom: 0, left: 8 };
const TIME_DOMAIN = ["dataMin", "dataMax"] as const;

/** Module-level formatter keeps Recharts' memoized selectors stable. */
const formatTime = (value: number) => dateTick.format(value);

function seriesKeys(seriesCount: number) {
  return Array.from({ length: seriesCount }, (_, index) => `s${index}`);
}

function seriesColor(index: number) {
  return SERIES_COLORS[index % SERIES_COLORS.length] as string;
}

/**
 * `animate: true` keeps Recharts' own default (`"auto"`: on unless SSR or
 * prefers-reduced-motion); `false` disables it.
 */
function animationProp(animate: boolean) {
  return animate ? "auto" : false;
}

/** Shared chrome: horizontal grid, time x axis, hidden y axis (bklit parity). */
function TimeChrome() {
  return [
    <CartesianGrid key="grid" stroke="var(--chart-grid)" vertical={false} />,
    // String key on a precomputed epoch-ms field: the form Recharts'
    // performance guide recommends over accessor functions.
    <XAxis
      dataKey="t"
      domain={TIME_DOMAIN}
      key="x"
      scale="time"
      tickFormatter={formatTime}
      type="number"
    />,
    <YAxis hide key="y" type="number" />,
  ];
}

function RechartsLine({
  data,
  seriesCount,
  width,
  height,
  animate,
}: BenchChartProps) {
  return (
    <LineChart data={data} height={height} margin={MARGIN} width={width}>
      {TimeChrome()}
      {seriesKeys(seriesCount).map((key, index) => (
        <Line
          dataKey={key}
          // Recharts draws a dot per point by default; bklit lines don't.
          dot={false}
          isAnimationActive={animationProp(animate)}
          key={key}
          stroke={seriesColor(index)}
          strokeWidth={2}
          type="monotone"
        />
      ))}
      <Tooltip />
    </LineChart>
  );
}

function RechartsArea({
  data,
  seriesCount,
  width,
  height,
  animate,
}: BenchChartProps) {
  return (
    <AreaChart data={data} height={height} margin={MARGIN} width={width}>
      {TimeChrome()}
      {seriesKeys(seriesCount).map((key, index) => (
        <Area
          dataKey={key}
          fill={seriesColor(index)}
          fillOpacity={0.2}
          isAnimationActive={animationProp(animate)}
          key={key}
          stroke={seriesColor(index)}
          strokeWidth={2}
          type="monotone"
        />
      ))}
      <Tooltip />
    </AreaChart>
  );
}

function RechartsBar({
  data,
  seriesCount,
  width,
  height,
  animate,
}: BenchChartProps) {
  return (
    <BarChart data={data} height={height} margin={MARGIN} width={width}>
      <CartesianGrid stroke="var(--chart-grid)" vertical={false} />
      <XAxis dataKey="label" />
      <YAxis hide />
      {seriesKeys(seriesCount).map((key, index) => (
        <Bar
          dataKey={key}
          fill={seriesColor(index)}
          isAnimationActive={animationProp(animate)}
          key={key}
        />
      ))}
      <Tooltip />
    </BarChart>
  );
}

function RechartsScatter({
  data,
  seriesCount,
  width,
  height,
  animate,
}: BenchChartProps) {
  return (
    <ScatterChart data={data} height={height} margin={MARGIN} width={width}>
      {TimeChrome()}
      {seriesKeys(seriesCount).map((key, index) => (
        <Scatter
          dataKey={key}
          fill={seriesColor(index)}
          isAnimationActive={animationProp(animate)}
          key={key}
        />
      ))}
      <Tooltip />
    </ScatterChart>
  );
}

export const rechartsAdapter: BenchLibraryAdapter = {
  id: "recharts",
  name: "Recharts",
  version: "3.10.1",
  charts: {
    line: RechartsLine,
    area: RechartsArea,
    bar: RechartsBar,
    scatter: RechartsScatter,
  },
  initialAnimationMs: RECHARTS_LINE_AREA_ENTER_MS,
  initialAnimationMsByKind: { bar: 400, scatter: 400 },
  notes:
    "SVG. Default enter animation: 1,500 ms for Line/Area, 400 ms for Bar/Scatter. Fixed width/height (no ResponsiveContainer). Line dots disabled to match bklit; hover dot (activeDot) and Tooltip cursor are defaults. Time x reads a precomputed epoch-ms key. Hover is rAF-throttled by default (throttleDelay 'raf'). Scatter uses per-point (item) tooltips, so hover sweeps across rendered points.",
};
