// biome-ignore-all lint/performance/noBarrelFile: package public API for @bklitui/studio consumers
export { type ChartSlug, isChartSlug, validChartSlugs } from "./chart-slugs";
export { LineProfitLossStudioChart } from "./components/charts/line-profit-loss-studio";
export {
  StudioCartesianFill,
  studioFitAspectSize,
  studioRadialSize,
} from "./components/charts/studio-chart-layout";
export {
  StudioChartShell,
  StudioVisibleLayer,
} from "./components/charts/studio-chart-shell";
export {
  fadeEdgesCodegen,
  fadeEdgesPropValue,
} from "./components/controls/fade-edges-picker";
export { MotionControl } from "./components/controls/motion-control";
export { MotionResetButton } from "./components/controls/motion-reset-button";
export { EditorChartFrame } from "./components/studio-chart-frame";
export { StudioCodeSheetTrigger } from "./components/studio-code-sheet-trigger";
export { StudioControlGroup } from "./components/studio-control-group";
export { StudioControlGroups } from "./components/studio-control-groups";
export {
  StudioFrameProvider,
  StudioScenesProvider,
  useStudioFrame,
  useStudioScenes,
} from "./components/studio-scenes-provider";
export { StudioShell } from "./components/studio-shell";
export {
  StudioStateProvider,
  useStudioState,
} from "./components/studio-state-provider";
export { useStudioMotionRemountKey } from "./components/use-studio-motion-remount";
export {
  EDITOR_MOBILE_CHART_ASPECT_RATIO,
  fitSizeToAspectRatio,
} from "./editor/editor-aspect-ratio";
export type { EditorCamera } from "./editor/editor-camera";
export { EditorShell } from "./editor/editor-shell";
export { FpsCounter } from "./editor/fps-counter";
export { StudioComponentSelectionProvider } from "./editor/studio-component-selection";
export {
  resolveViewportSize,
  VIEWPORT_PRESETS,
  type ViewportPreset,
} from "./editor/viewport-presets";
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
export {
  downloadBlob,
  resetSaveBlobHandler,
  type SaveBlobHandler,
  setSaveBlobHandler,
} from "./lib/download-blob";
export { getStudioConfig } from "./lib/registry";
export {
  areaChartControlGroups,
  barChartControlGroups,
  candlestickChartControlGroups,
  choroplethChartControlGroups,
  composedChartControlGroups,
  funnelChartControlGroups,
  gaugeControlGroups,
  lineChartControlGroups,
  liveLineChartControlGroups,
  pieChartControlGroups,
  profitLossLineChartControlGroups,
  radarChartControlGroups,
  ringChartControlGroups,
  sankeyChartControlGroups,
  scatterChartControlGroups,
} from "./lib/registry-control-groups";
export type { StudioRenderContext } from "./lib/render-context";
export { seriesStrokePropsFromState } from "./lib/series-stroke-props";
export { chartTooltipPropsFromState } from "./lib/studio-chart-overlays";
export { studioCartesianLegendItems } from "./lib/studio-legend-items";
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
