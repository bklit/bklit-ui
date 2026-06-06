import {
  parseAsBoolean,
  parseAsFloat,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
} from "nuqs/server";
import { validChartSlugs } from "@/chart-slugs";
import type { ColorPresetId } from "./color-presets";
import { COLOR_PRESET_IDS } from "./color-presets";
import type { CurveId } from "./curves";
import { CURVE_IDS } from "./curves";
import type { PatternPresetId } from "./pattern-presets";
import { PATTERN_PRESET_IDS } from "./pattern-presets";
import type { ChartSlug } from "./types";

export const studioSearchParams = {
  chart: parseAsStringLiteral(validChartSlugs).withDefault("area-chart"),
  preset: parseAsStringLiteral(COLOR_PRESET_IDS).withDefault("default"),
  chartAccent: parseAsString.withDefault(""),
  seriesColors: parseAsString.withDefault(""),
  seriesPatterns: parseAsString.withDefault(""),
  frameW: parseAsInteger.withDefault(720),
  frameH: parseAsInteger.withDefault(400),
  value: parseAsInteger.withDefault(66),
  centerValue: parseAsInteger.withDefault(284_920),
  spacing: parseAsInteger.withDefault(25),
  totalNotches: parseAsInteger.withDefault(40),
  notchCornerRadius: parseAsInteger.withDefault(0),
  notchLengthPercent: parseAsInteger.withDefault(100),
  startAngle: parseAsInteger.withDefault(135),
  endAngle: parseAsInteger.withDefault(405),
  useGradient: parseAsBoolean.withDefault(false),
  uniformWidth: parseAsBoolean.withDefault(false),
  inactiveFillOpacity: parseAsFloat.withDefault(0.4),
  activeFillOpacity: parseAsFloat.withDefault(1),
  gaugeLabel: parseAsString.withDefault("Total Revenue"),
  gaugeCenterPrefix: parseAsString.withDefault(""),
  gaugeCenterSuffix: parseAsString.withDefault(""),
  pieCenterLabel: parseAsString.withDefault("Total"),
  pieCenterPrefix: parseAsString.withDefault(""),
  pieCenterSuffix: parseAsString.withDefault(""),
  ringCenterLabel: parseAsString.withDefault("Channels"),
  ringCenterPrefix: parseAsString.withDefault(""),
  ringCenterSuffix: parseAsString.withDefault(""),
  ringStrokeWidth: parseAsFloat.withDefault(12),
  curve: parseAsStringLiteral(CURVE_IDS).withDefault("natural"),
  fillOpacity: parseAsFloat.withDefault(0.3),
  strokeWidth: parseAsFloat.withDefault(2),
  pattern: parseAsStringLiteral(PATTERN_PRESET_IDS).withDefault("none"),
  aspectRatio: parseAsString.withDefault("2 / 1"),
  animationDuration: parseAsInteger.withDefault(1100),
  motionType: parseAsStringLiteral(["spring", "ease"]).withDefault("ease"),
  motionDuration: parseAsFloat.withDefault(1.1),
  motionBounce: parseAsFloat.withDefault(0.6),
  motionEase: parseAsStringLiteral([
    "easeOut",
    "easeInOut",
    "snappy",
    "smooth",
    "custom",
  ]).withDefault("snappy"),
  motionBezier: parseAsString.withDefault("0.85, 0, 0.15, 1"),
  motionStaggerScale: parseAsFloat.withDefault(1),
  showLine: parseAsBoolean.withDefault(true),
  showHighlight: parseAsBoolean.withDefault(true),
  fadeEdges: parseAsStringLiteral([
    "both",
    "none",
    "left",
    "right",
  ]).withDefault("both"),
  gradientToOpacity: parseAsFloat.withDefault(0),
  innerRadius: parseAsInteger.withDefault(0),
  padAngle: parseAsFloat.withDefault(0),
  pieSize: parseAsInteger.withDefault(100),
  pieShowGlow: parseAsBoolean.withDefault(true),
  pieHoverEffect: parseAsStringLiteral([
    "translate",
    "grow",
    "none",
  ]).withDefault("translate"),
  pieStartAngleDeg: parseAsInteger.withDefault(-90),
  pieEndAngleDeg: parseAsInteger.withDefault(270),
  pieCornerRadius: parseAsInteger.withDefault(0),
  pieHoverOffset: parseAsInteger.withDefault(10),
  pieFillMode: parseAsStringLiteral(["solid", "lines"]).withDefault("solid"),
  choroplethBgPattern:
    parseAsStringLiteral(PATTERN_PRESET_IDS).withDefault("none"),
  choroplethFgPattern:
    parseAsStringLiteral(PATTERN_PRESET_IDS).withDefault("none"),
  barGap: parseAsFloat.withDefault(0.2),
  barWidth: parseAsInteger.withDefault(0),
  groupGap: parseAsInteger.withDefault(4),
  barFadedOpacity: parseAsFloat.withDefault(0.3),
  barSeriesMode: parseAsStringLiteral(["grouped", "stacked"]).withDefault(
    "grouped"
  ),
  barLineCap: parseAsStringLiteral(["round", "butt"]).withDefault("round"),
  barOrientation: parseAsStringLiteral(["vertical", "horizontal"]).withDefault(
    "vertical"
  ),
  ringGap: parseAsInteger.withDefault(6),
  ringBaseInnerRadius: parseAsInteger.withDefault(60),
  radarSize: parseAsInteger.withDefault(100),
  radarMargin: parseAsInteger.withDefault(60),
  radarLevels: parseAsInteger.withDefault(5),
  showRadarGrid: parseAsBoolean.withDefault(true),
  radarShowPoints: parseAsBoolean.withDefault(true),
  radarShowStroke: parseAsBoolean.withDefault(true),
  radarShowGlow: parseAsBoolean.withDefault(true),
  funnelLayers: parseAsInteger.withDefault(3),
  funnelGap: parseAsInteger.withDefault(4),
  funnelOrientation: parseAsStringLiteral([
    "vertical",
    "horizontal",
  ]).withDefault("vertical"),
  funnelEdges: parseAsStringLiteral(["curved", "straight"]).withDefault(
    "curved"
  ),
  funnelShowValues: parseAsBoolean.withDefault(true),
  funnelShowLabels: parseAsBoolean.withDefault(true),
  funnelShowPercentage: parseAsBoolean.withDefault(true),
  candleFadedOpacity: parseAsFloat.withDefault(0.25),
  candleGap: parseAsFloat.withDefault(0.2),
  composedBarRadius: parseAsInteger.withDefault(0),
  liveInterval: parseAsInteger.withDefault(500),
  livePaused: parseAsBoolean.withDefault(false),
  liveWindow: parseAsInteger.withDefault(30),
  liveFill: parseAsBoolean.withDefault(true),
  livePulse: parseAsBoolean.withDefault(true),
  liveBadge: parseAsBoolean.withDefault(true),
  liveLerpSpeed: parseAsFloat.withDefault(0.08),
  liveExaggerate: parseAsBoolean.withDefault(false),
  showGraticule: parseAsBoolean.withDefault(true),
  choroplethAnalytics: parseAsBoolean.withDefault(true),
  candleUseGradient: parseAsBoolean.withDefault(false),
  candleShowDots: parseAsBoolean.withDefault(false),
  sankeyNodePadding: parseAsInteger.withDefault(12),
  sankeyNodeWidth: parseAsInteger.withDefault(16),
  linkOpacity: parseAsFloat.withDefault(0.4),
  scatterRadius: parseAsFloat.withDefault(6),
  scatterRingGap: parseAsFloat.withDefault(2),
  scatterRingWidth: parseAsFloat.withDefault(2),
  scatterFadeOnHover: parseAsBoolean.withDefault(true),
  scatterInactiveOpacity: parseAsFloat.withDefault(0.5),
  scatterSecondSeries: parseAsBoolean.withDefault(true),
  scatterShowActiveHighlight: parseAsBoolean.withDefault(true),
  seriesShowMarkers: parseAsBoolean.withDefault(false),
  seriesMarkerRadius: parseAsFloat.withDefault(5),
  seriesMarkerRingGap: parseAsFloat.withDefault(2),
  seriesMarkerRingWidth: parseAsFloat.withDefault(2),
  seriesDashTail: parseAsBoolean.withDefault(false),
  seriesDashFromIndex: parseAsInteger.withDefault(4),
  seriesDashArray: parseAsString.withDefault("6,4"),
  dataSeries: parseAsInteger.withDefault(2),
  dataPoints: parseAsInteger.withDefault(12),
  lineChartMode: parseAsStringLiteral(["standard", "profitLoss"]).withDefault(
    "standard"
  ),
  lineChartState: parseAsStringLiteral(["ready", "loading"]).withDefault(
    "ready"
  ),
  areaChartState: parseAsStringLiteral(["ready", "loading"]).withDefault(
    "ready"
  ),
  lineLoadingStroke: parseAsString.withDefault("var(--foreground)"),
  lineLoadingStrokeOpacity: parseAsFloat.withDefault(0.5),
  lineLoadingGridStroke: parseAsString.withDefault(
    "color-mix(in oklch, var(--chart-grid) 50%, transparent)"
  ),
  lineLoadingGridShimmerStroke: parseAsString.withDefault(
    "color-mix(in oklch, var(--foreground) 68%, transparent)"
  ),
  lineLoadingGridShimmer: parseAsBoolean.withDefault(true),
  lineLoadingGridShimmerLength: parseAsFloat.withDefault(140),
  lineLoadingGridShimmerSync: parseAsBoolean.withDefault(true),
  lineLoadingGridShimmerSpeed: parseAsFloat.withDefault(1),
  lineLoadingLabel: parseAsString.withDefault("Loading"),
  /** Pipe-encoded Y axis id per line series (`left` / `right`). */
  lineSeriesYAxes: parseAsString.withDefault("left|left"),
  /** Pipe-encoded tick count per Y axis (left | right). */
  lineYAxisNumTicks: parseAsString.withDefault("5|5"),
  /** Pipe-encoded `formatLargeNumbers` per Y axis (`1` / `0`). */
  lineYAxisFormatLarge: parseAsString.withDefault("1|1"),
  showZeroLine: parseAsBoolean.withDefault(true),
  zeroLineStroke: parseAsString.withDefault("var(--color-muted-foreground)"),
  zeroLineStrokeWidth: parseAsFloat.withDefault(1.5),
  zeroLineStyle: parseAsStringLiteral(["solid", "dashed"]).withDefault("solid"),
  tooltipLabel: parseAsString.withDefault("Profit/Loss"),
  showTooltipDots: parseAsBoolean.withDefault(true),
  showTooltipDatePill: parseAsBoolean.withDefault(true),
  showCrosshair: parseAsBoolean.withDefault(true),
  crosshairFollowsValue: parseAsBoolean.withDefault(true),
  crosshairColor: parseAsString.withDefault("var(--chart-crosshair)"),
  showBrush: parseAsBoolean.withDefault(false),
  brushHeight: parseAsInteger.withDefault(76),
  brushFadeEdges: parseAsBoolean.withDefault(true),
  brushAreaOpacity: parseAsFloat.withDefault(0.15),
  brushGradientToOpacity: parseAsFloat.withDefault(0),
  brushGradientSpan: parseAsFloat.withDefault(0.6),
  brushBlur: parseAsFloat.withDefault(1.5),
  brushSelectionPatternEnabled: parseAsBoolean.withDefault(false),
  brushSelectionPattern:
    parseAsStringLiteral(PATTERN_PRESET_IDS).withDefault("none"),
  brushSelectionPatternColor: parseAsString.withDefault("var(--chart-1)"),
  showLegend: parseAsBoolean.withDefault(false),
  legendPlacement: parseAsStringLiteral(["top", "bottom"]).withDefault(
    "bottom"
  ),
  legendAlign: parseAsStringLiteral(["start", "center", "end"]).withDefault(
    "end"
  ),
  legendLayout: parseAsStringLiteral(["vertical", "horizontal"]).withDefault(
    "vertical"
  ),
  legendFontSize: parseAsInteger.withDefault(13),
  legendShowProgress: parseAsBoolean.withDefault(false),
  legendShowMarker: parseAsBoolean.withDefault(true),
  legendShowValue: parseAsBoolean.withDefault(true),
  tooltipBackgroundOpacity: parseAsFloat.withDefault(0.8),
  tooltipBlur: parseAsInteger.withDefault(12),
  hiddenComponents: parseAsString.withDefault(""),
};

export interface StudioUrlState {
  chart: ChartSlug;
  preset: ColorPresetId;
  chartAccent: string;
  seriesColors: string;
  seriesPatterns: string;
  frameW: number;
  frameH: number;
  value: number;
  centerValue: number;
  spacing: number;
  totalNotches: number;
  notchCornerRadius: number;
  notchLengthPercent: number;
  startAngle: number;
  endAngle: number;
  useGradient: boolean;
  uniformWidth: boolean;
  inactiveFillOpacity: number;
  activeFillOpacity: number;
  gaugeLabel: string;
  gaugeCenterPrefix: string;
  gaugeCenterSuffix: string;
  pieCenterLabel: string;
  pieCenterPrefix: string;
  pieCenterSuffix: string;
  ringCenterLabel: string;
  ringCenterPrefix: string;
  ringCenterSuffix: string;
  ringStrokeWidth: number;
  curve: CurveId;
  fillOpacity: number;
  strokeWidth: number;
  pattern: PatternPresetId;
  aspectRatio: string;
  animationDuration: number;
  motionType: "spring" | "ease";
  motionDuration: number;
  motionBounce: number;
  motionEase: "easeOut" | "easeInOut" | "snappy" | "smooth" | "custom";
  motionBezier: string;
  motionStaggerScale: number;
  showLine: boolean;
  showHighlight: boolean;
  fadeEdges: "both" | "none" | "left" | "right";
  gradientToOpacity: number;
  innerRadius: number;
  padAngle: number;
  pieSize: number;
  pieShowGlow: boolean;
  pieHoverEffect: "translate" | "grow" | "none";
  pieStartAngleDeg: number;
  pieEndAngleDeg: number;
  pieCornerRadius: number;
  pieHoverOffset: number;
  pieFillMode: "solid" | "lines";
  choroplethBgPattern: PatternPresetId;
  choroplethFgPattern: PatternPresetId;
  barGap: number;
  barWidth: number;
  groupGap: number;
  barFadedOpacity: number;
  barSeriesMode: "grouped" | "stacked";
  barLineCap: "round" | "butt";
  barOrientation: "vertical" | "horizontal";
  ringGap: number;
  ringBaseInnerRadius: number;
  radarSize: number;
  radarMargin: number;
  radarLevels: number;
  showRadarGrid: boolean;
  radarShowPoints: boolean;
  radarShowStroke: boolean;
  radarShowGlow: boolean;
  funnelLayers: number;
  funnelGap: number;
  funnelOrientation: "vertical" | "horizontal";
  funnelEdges: "curved" | "straight";
  funnelShowValues: boolean;
  funnelShowLabels: boolean;
  funnelShowPercentage: boolean;
  candleFadedOpacity: number;
  candleGap: number;
  composedBarRadius: number;
  liveInterval: number;
  livePaused: boolean;
  liveWindow: number;
  liveFill: boolean;
  livePulse: boolean;
  liveBadge: boolean;
  liveLerpSpeed: number;
  liveExaggerate: boolean;
  showGraticule: boolean;
  choroplethAnalytics: boolean;
  candleUseGradient: boolean;
  candleShowDots: boolean;
  sankeyNodePadding: number;
  sankeyNodeWidth: number;
  linkOpacity: number;
  scatterRadius: number;
  scatterRingGap: number;
  scatterRingWidth: number;
  scatterFadeOnHover: boolean;
  scatterInactiveOpacity: number;
  scatterSecondSeries: boolean;
  scatterShowActiveHighlight: boolean;
  seriesShowMarkers: boolean;
  seriesMarkerRadius: number;
  seriesMarkerRingGap: number;
  seriesMarkerRingWidth: number;
  seriesDashTail: boolean;
  seriesDashFromIndex: number;
  seriesDashArray: string;
  dataSeries: number;
  dataPoints: number;
  lineChartMode: "standard" | "profitLoss";
  lineChartState: "ready" | "loading";
  areaChartState: "ready" | "loading";
  lineLoadingStroke: string;
  lineLoadingStrokeOpacity: number;
  lineLoadingGridStroke: string;
  lineLoadingGridShimmerStroke: string;
  lineLoadingGridShimmer: boolean;
  lineLoadingGridShimmerLength: number;
  lineLoadingGridShimmerSync: boolean;
  lineLoadingGridShimmerSpeed: number;
  lineLoadingLabel: string;
  lineSeriesYAxes: string;
  lineYAxisNumTicks: string;
  lineYAxisFormatLarge: string;
  showZeroLine: boolean;
  zeroLineStroke: string;
  zeroLineStrokeWidth: number;
  zeroLineStyle: "solid" | "dashed";
  tooltipLabel: string;
  showTooltipDots: boolean;
  showTooltipDatePill: boolean;
  showCrosshair: boolean;
  crosshairFollowsValue: boolean;
  crosshairColor: string;
  showBrush: boolean;
  brushHeight: number;
  brushFadeEdges: boolean;
  brushAreaOpacity: number;
  brushGradientToOpacity: number;
  brushGradientSpan: number;
  brushBlur: number;
  brushSelectionPatternEnabled: boolean;
  brushSelectionPattern: PatternPresetId;
  brushSelectionPatternColor: string;
  showLegend: boolean;
  legendPlacement: "top" | "bottom";
  legendAlign: "start" | "center" | "end";
  legendLayout: "vertical" | "horizontal";
  legendFontSize: number;
  legendShowProgress: boolean;
  legendShowMarker: boolean;
  legendShowValue: boolean;
  tooltipBackgroundOpacity: number;
  tooltipBlur: number;
  hiddenComponents: string;
}

/** Full default state for chart switches (nuqs used `null` to clear keys; in-memory state needs real defaults). */
export function defaultsForChart(): StudioUrlState {
  return defaultStudioState();
}

/** Default studio state (matches `studioSearchParams` defaults) for tests and codegen. */
export function defaultStudioState(
  overrides: Partial<StudioUrlState> = {}
): StudioUrlState {
  return {
    chart: "area-chart",
    preset: "default",
    chartAccent: "",
    seriesColors: "",
    seriesPatterns: "",
    frameW: 720,
    frameH: 400,
    value: 66,
    centerValue: 284_920,
    spacing: 25,
    totalNotches: 40,
    notchCornerRadius: 0,
    notchLengthPercent: 100,
    startAngle: 135,
    endAngle: 405,
    useGradient: false,
    uniformWidth: false,
    inactiveFillOpacity: 0.4,
    activeFillOpacity: 1,
    gaugeLabel: "Total Revenue",
    gaugeCenterPrefix: "",
    gaugeCenterSuffix: "",
    pieCenterLabel: "Total",
    pieCenterPrefix: "",
    pieCenterSuffix: "",
    ringCenterLabel: "Channels",
    ringCenterPrefix: "",
    ringCenterSuffix: "",
    ringStrokeWidth: 12,
    curve: "natural",
    fillOpacity: 0.3,
    strokeWidth: 2,
    pattern: "none",
    aspectRatio: "2 / 1",
    animationDuration: 1100,
    motionType: "ease",
    motionDuration: 1.1,
    motionBounce: 0.6,
    motionEase: "snappy",
    motionBezier: "0.85, 0, 0.15, 1",
    motionStaggerScale: 1,
    showLine: true,
    showHighlight: true,
    fadeEdges: "both",
    gradientToOpacity: 0,
    innerRadius: 0,
    padAngle: 0,
    pieSize: 100,
    pieShowGlow: true,
    pieHoverEffect: "translate",
    pieStartAngleDeg: -90,
    pieEndAngleDeg: 270,
    pieCornerRadius: 0,
    pieHoverOffset: 10,
    pieFillMode: "solid",
    choroplethBgPattern: "none",
    choroplethFgPattern: "none",
    barGap: 0.2,
    barWidth: 0,
    groupGap: 4,
    barFadedOpacity: 0.3,
    barSeriesMode: "grouped",
    barLineCap: "round",
    barOrientation: "vertical",
    ringGap: 6,
    ringBaseInnerRadius: 60,
    radarSize: 100,
    radarMargin: 60,
    radarLevels: 5,
    showRadarGrid: true,
    radarShowPoints: true,
    radarShowStroke: true,
    radarShowGlow: true,
    funnelLayers: 3,
    funnelGap: 4,
    funnelOrientation: "vertical",
    funnelEdges: "curved",
    funnelShowValues: true,
    funnelShowLabels: true,
    funnelShowPercentage: true,
    candleFadedOpacity: 0.25,
    candleGap: 0.2,
    composedBarRadius: 0,
    liveInterval: 500,
    livePaused: false,
    liveWindow: 30,
    liveFill: true,
    livePulse: true,
    liveBadge: true,
    liveLerpSpeed: 0.08,
    liveExaggerate: false,
    showGraticule: true,
    choroplethAnalytics: true,
    candleUseGradient: false,
    candleShowDots: false,
    sankeyNodePadding: 12,
    sankeyNodeWidth: 16,
    linkOpacity: 0.4,
    scatterRadius: 6,
    scatterRingGap: 2,
    scatterRingWidth: 2,
    scatterFadeOnHover: true,
    scatterInactiveOpacity: 0.5,
    scatterSecondSeries: true,
    scatterShowActiveHighlight: true,
    seriesShowMarkers: false,
    seriesMarkerRadius: 5,
    seriesMarkerRingGap: 2,
    seriesMarkerRingWidth: 2,
    seriesDashTail: false,
    seriesDashFromIndex: 4,
    seriesDashArray: "6,4",
    dataSeries: 2,
    dataPoints: 12,
    lineChartMode: "standard",
    lineChartState: "ready",
    areaChartState: "ready",
    lineLoadingStroke: "var(--foreground)",
    lineLoadingStrokeOpacity: 0.5,
    lineLoadingGridStroke:
      "color-mix(in oklch, var(--chart-grid) 50%, transparent)",
    lineLoadingGridShimmerStroke:
      "color-mix(in oklch, var(--foreground) 68%, transparent)",
    lineLoadingGridShimmer: true,
    lineLoadingGridShimmerLength: 140,
    lineLoadingGridShimmerSync: true,
    lineLoadingGridShimmerSpeed: 1,
    lineLoadingLabel: "Loading",
    lineSeriesYAxes: "left|left",
    lineYAxisNumTicks: "5|5",
    lineYAxisFormatLarge: "1|1",
    showZeroLine: true,
    zeroLineStroke: "var(--color-muted-foreground)",
    zeroLineStrokeWidth: 1.5,
    zeroLineStyle: "solid",
    tooltipLabel: "Profit/Loss",
    showTooltipDots: true,
    showTooltipDatePill: true,
    showCrosshair: true,
    crosshairFollowsValue: true,
    crosshairColor: "var(--chart-crosshair)",
    showBrush: false,
    brushHeight: 76,
    brushFadeEdges: true,
    brushAreaOpacity: 0.15,
    brushGradientToOpacity: 0,
    brushGradientSpan: 0.6,
    brushBlur: 1.5,
    brushSelectionPatternEnabled: false,
    brushSelectionPattern: "none",
    brushSelectionPatternColor: "var(--chart-1)",
    showLegend: false,
    legendPlacement: "bottom",
    legendAlign: "end",
    legendLayout: "vertical",
    legendFontSize: 13,
    legendShowProgress: false,
    legendShowMarker: true,
    legendShowValue: true,
    tooltipBackgroundOpacity: 0.8,
    tooltipBlur: 12,
    hiddenComponents: "",
    ...overrides,
  };
}
