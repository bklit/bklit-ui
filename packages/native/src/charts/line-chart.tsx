import {
  TimeSeriesChart,
  type TimeSeriesChartProps,
} from "./time-series-chart";

export type LineChartProps = TimeSeriesChartProps;

/** Compose with `<Line>`, `<Grid>`, `<XAxis>`, `<ChartTooltip>`, segments. */
export function LineChart(props: LineChartProps) {
  return <TimeSeriesChart {...props} />;
}
