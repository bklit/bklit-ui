// biome-ignore-all lint/performance/noBarrelFile: package public API for @bklitui/studio consumers
export { type ChartSlug, isChartSlug, validChartSlugs } from "./chart-slugs";
export { LineProfitLossStudioChart } from "./components/charts/line-profit-loss-studio";
export {
  StudioCartesianFill,
  studioFitAspectSize,
  studioRadialSize,
} from "./components/charts/studio-chart-layout";
export {
  fadeEdgesCodegen,
  fadeEdgesPropValue,
} from "./components/controls/fade-edges-picker";
export { MotionControl } from "./components/controls/motion-control";
export { MotionResetButton } from "./components/controls/motion-reset-button";
export { StudioCodeSheetTrigger } from "./components/studio-code-sheet-trigger";
export { StudioControlGroup } from "./components/studio-control-group";
export { StudioControlGroups } from "./components/studio-control-groups";
export { StudioShell } from "./components/studio-shell";
export {
  StudioStateProvider,
  useStudioState,
} from "./components/studio-state-provider";
export { useStudioMotionRemountKey } from "./components/use-studio-motion-remount";
export { getStudioCssRevealPropsForPreview } from "./lib/chart-animation";
export {
  BKLIT_REGISTRY_NAMESPACE,
  openInV0Href,
  REGISTRY_ORIGIN,
  registryJsonUrlForName,
  registryV0ExampleJsonUrl,
  shadcnAddItem,
  studioChartDocsHref,
  studioChartHref,
  studioOpenInV0Href,
} from "./lib/chart-links";
export { generateStudioCode } from "./lib/codegen";
export { resolveCurve } from "./lib/curves";
export {
  clampStudioSeriesCount,
  generateStudioCartesianData,
  generateStudioProfitLossData,
  STUDIO_PROFIT_LOSS_DATA_KEY,
  STUDIO_SERIES_COLORS,
  STUDIO_SERIES_KEYS,
} from "./lib/demo-data";
export { profitLossLineChartControlGroups } from "./lib/registry-control-groups";
export type { StudioRenderContext } from "./lib/render-context";
export { seriesStrokePropsFromState } from "./lib/series-stroke-props";
export type { StudioUrlState } from "./lib/studio-parsers";
export {
  defaultStudioState,
  defaultsForChart,
  studioSearchParams,
} from "./lib/studio-parsers";
export type {
  StudioChartConfig,
  StudioControl,
  StudioControlGroup as StudioControlGroupConfig,
} from "./lib/types";
export type { StudioAnalytics } from "./providers/studio-analytics-context";
export { StudioAnalyticsProvider } from "./providers/studio-analytics-context";
