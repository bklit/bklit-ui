// Chart context and hooks

// Area chart components
export { Area, type AreaProps } from "./area";
export { AreaChart, type AreaChartProps } from "./area-chart";
export {
  type ChartContextValue,
  ChartProvider,
  chartCssVars,
  type LineConfig,
  type Margin,
  type TooltipData,
  useChart,
} from "./chart-context";
// Legacy legend component (backward compatibility)
export {
  ChartLegend,
  type ChartLegendProps,
  type LegendItem,
} from "./chart-legend";
// Shared chart elements
export { Grid, type GridProps } from "./grid";
// Composable legend components
export {
  Legend,
  type LegendContextValue,
  LegendItem as LegendItemComponent,
  type LegendItemContextValue,
  type LegendItemData,
  type LegendItemProps,
  LegendLabel,
  type LegendLabelProps,
  LegendMarker,
  type LegendMarkerProps,
  LegendProgress,
  type LegendProgressProps,
  type LegendProps,
  LegendValue,
  type LegendValueProps,
  legendCssVars,
  useLegend,
  useLegendItem,
} from "./legend";
// Line chart components
export { Line, type LineProps } from "./line";
export { LineChart, type LineChartProps } from "./line-chart";
// Marker components
export {
  type ChartMarker,
  ChartMarkers,
  type ChartMarkersProps,
  MarkerGroup,
  type MarkerGroupProps,
  MarkerTooltipContent,
  type MarkerTooltipContentProps,
  useActiveMarkers,
} from "./markers";
// Radar chart components
export { RadarArea, type RadarAreaProps } from "./radar-area";
export { RadarAxis, type RadarAxisProps } from "./radar-axis";
export { RadarChart, type RadarChartProps } from "./radar-chart";
export {
  defaultRadarColors,
  type RadarContextValue,
  type RadarData,
  type RadarMetric,
  RadarProvider,
  radarCssVars,
  useRadar,
} from "./radar-context";
export { RadarGrid, type RadarGridProps } from "./radar-grid";
export { RadarLabels, type RadarLabelsProps } from "./radar-labels";
// Ring chart components
export { Ring, type RingLineCap, type RingProps } from "./ring";
export { RingCenter, type RingCenterProps } from "./ring-center";
export { RingChart, type RingChartProps } from "./ring-chart";
export {
  defaultRingColors,
  type RingContextValue,
  type RingData,
  RingProvider,
  ringCssVars,
  useRing,
} from "./ring-context";

// Tooltip components
export {
  ChartTooltip,
  type ChartTooltipProps,
  DateTicker,
  type DateTickerProps,
  type IndicatorWidth,
  TooltipContent,
  type TooltipContentProps,
  TooltipDot,
  type TooltipDotProps,
  TooltipIndicator,
  type TooltipIndicatorProps,
  type TooltipRow,
} from "./tooltip";
export { XAxis, type XAxisProps } from "./x-axis";
