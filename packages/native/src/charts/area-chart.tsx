import {
  TimeSeriesChart,
  type TimeSeriesChartProps,
} from "./time-series-chart";

export type AreaChartProps = TimeSeriesChartProps;

/** Compose with `<Area>`, `<Grid>`, `<XAxis>`, `<ChartTooltip>`, segments. */
export function AreaChart(props: AreaChartProps) {
  return <TimeSeriesChart {...props} />;
}
