"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  BarXAxis,
  ChartTooltip,
  Grid,
  Line,
  LineChart,
  Scatter,
  ScatterChart,
  XAxis,
} from "@bklitui/ui/charts";
import type { ReactNode } from "react";
import type { BenchChartProps, BenchLibraryAdapter } from "../types";

const SERIES_COLORS = [
  "var(--chart-line-primary)",
  "var(--chart-line-secondary)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

/** bklit default enter duration (`animationDuration = 1100` on every chart). */
const BKLIT_ENTER_MS = 1100;

function seriesKeys(seriesCount: number) {
  return Array.from({ length: seriesCount }, (_, index) => `s${index}`);
}

function seriesColor(index: number) {
  return SERIES_COLORS[index % SERIES_COLORS.length];
}

/** Fixed pixel box; charts fill it via a matching aspect ratio. */
function Frame({
  width,
  height,
  children,
}: {
  width: number;
  height: number;
  children: ReactNode;
}) {
  return <div style={{ width, height }}>{children}</div>;
}

function chartBoxProps({ animate, width, height }: BenchChartProps) {
  return {
    animationDuration: animate ? BKLIT_ENTER_MS : 0,
    aspectRatio: `${width} / ${height}`,
  };
}

function BklitLine(props: BenchChartProps) {
  const { data, seriesCount, animate, width, height } = props;
  return (
    <Frame height={height} width={width}>
      <LineChart
        data={data as unknown as Record<string, unknown>[]}
        yDomainTween={animate}
        {...chartBoxProps(props)}
      >
        <Grid horizontal />
        {seriesKeys(seriesCount).map((key, index) => (
          <Line
            animate={animate}
            dataKey={key}
            key={key}
            stroke={seriesColor(index)}
          />
        ))}
        <XAxis />
        <ChartTooltip />
      </LineChart>
    </Frame>
  );
}

function BklitArea(props: BenchChartProps) {
  const { data, seriesCount, animate, width, height } = props;
  return (
    <Frame height={height} width={width}>
      <AreaChart
        data={data as unknown as Record<string, unknown>[]}
        yDomainTween={animate}
        {...chartBoxProps(props)}
      >
        <Grid horizontal />
        {seriesKeys(seriesCount).map((key, index) => (
          <Area
            animate={animate}
            dataKey={key}
            fill={seriesColor(index)}
            key={key}
          />
        ))}
        <XAxis />
        <ChartTooltip />
      </AreaChart>
    </Frame>
  );
}

function BklitBar(props: BenchChartProps) {
  const { data, seriesCount, animate, width, height } = props;
  return (
    <Frame height={height} width={width}>
      <BarChart
        data={data as unknown as Record<string, unknown>[]}
        xDataKey="label"
        {...chartBoxProps(props)}
      >
        <Grid horizontal />
        {seriesKeys(seriesCount).map((key, index) => (
          <Bar
            animate={animate}
            dataKey={key}
            fill={seriesColor(index)}
            key={key}
            lineCap="round"
          />
        ))}
        <BarXAxis />
        <ChartTooltip />
      </BarChart>
    </Frame>
  );
}

function BklitScatter(props: BenchChartProps) {
  const { data, seriesCount, animate, width, height } = props;
  return (
    <Frame height={height} width={width}>
      <ScatterChart
        data={data as unknown as Record<string, unknown>[]}
        {...chartBoxProps(props)}
      >
        <Grid horizontal />
        {seriesKeys(seriesCount).map((key, index) => (
          <Scatter
            animate={animate}
            dataKey={key}
            fill={seriesColor(index)}
            key={key}
          />
        ))}
        <XAxis />
        <ChartTooltip />
      </ScatterChart>
    </Frame>
  );
}

export const bklitAdapter: BenchLibraryAdapter = {
  id: "bklit",
  name: "bklit",
  // packages/ui is a private workspace package (version 0.0.0): benchmarks
  // always run the chart source deployed with this site.
  version: "workspace",
  charts: {
    area: BklitArea,
    bar: BklitBar,
    line: BklitLine,
    scatter: BklitScatter,
  },
  initialAnimationMs: BKLIT_ENTER_MS,
  notes:
    "SVG + Motion. Line, area, bar and scatter all default to a 1100 ms enter reveal; on data updates line paths and bars morph and the y-domain tweens (500 ms). Charts size themselves from their parent (ResizeObserver), so the first chart frame lands a frame or two after mount; that wait is counted. Line and area downsample each series (LTTB) to 1.5 points per plot pixel, so at 1,000+ points their paths hold fewer points than the other libraries'. Hover renders are deferred to rAF; the frame that paints them is counted.",
};
