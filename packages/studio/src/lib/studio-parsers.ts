import type { ProjectionCurveKind } from "@bklitui/ui/charts";
import { HEATMAP_DEFAULT_LEVEL_COLORS } from "@bklitui/ui/charts";
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
import {
  LEGACY_MOTION_EASE_IDS,
  MOTION_EASE_IDS,
  type MotionEaseUrlValue,
} from "./motion-config";
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
    ...MOTION_EASE_IDS,
    ...LEGACY_MOTION_EASE_IDS,
  ]).withDefault("ease"),
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
  heatmapBinSize: parseAsInteger.withDefault(0),
  heatmapGap: parseAsInteger.withDefault(2),
  heatmapCornerRadius: parseAsInteger.withDefault(2),
  heatmapLegendCellSize: parseAsInteger.withDefault(11),
  heatmapChartState: parseAsStringLiteral(["ready", "loading"]).withDefault(
    "ready"
  ),
  heatmapLoadingLabel: parseAsString.withDefault("Loading"),
  heatmapLoadingOpacity: parseAsFloat.withDefault(1),
  heatmapLoadingCellMaxOpacity: parseAsFloat.withDefault(0.85),
  heatmapLoadingCellRandomness: parseAsFloat.withDefault(1),
  heatmapLevel0Color: parseAsString.withDefault(
    HEATMAP_DEFAULT_LEVEL_COLORS[0]
  ),
  heatmapLevel1Color: parseAsString.withDefault(
    HEATMAP_DEFAULT_LEVEL_COLORS[1]
  ),
  heatmapLevel2Color: parseAsString.withDefault(
    HEATMAP_DEFAULT_LEVEL_COLORS[2]
  ),
  heatmapLevel3Color: parseAsString.withDefault(
    HEATMAP_DEFAULT_LEVEL_COLORS[3]
  ),
  heatmapLevel4Color: parseAsString.withDefault(
    HEATMAP_DEFAULT_LEVEL_COLORS[4]
  ),
  heatmapLevelFillModes: parseAsString.withDefault(""),
  heatmapLevelPatterns: parseAsString.withDefault(""),
  heatmapLevelPatternColors: parseAsString.withDefault(""),
  heatmapLevelPatternScales: parseAsString.withDefault(""),
  heatmapLevelPatternStrokeWidths: parseAsString.withDefault(""),
  heatmapLevelPatternRadii: parseAsString.withDefault(""),
  heatmapLevelPatternComplements: parseAsString.withDefault(""),
  heatmapLevelPatternFills: parseAsString.withDefault(""),
  heatmapLevelPatternTileBackgrounds: parseAsString.withDefault(""),
  heatmapLevelPatternOpacities: parseAsString.withDefault(""),
  heatmapLevelPatternDotsFills: parseAsString.withDefault(""),
  heatmapCellsFadedOpacity: parseAsFloat.withDefault(0.3),
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
  /** Pipe-encoded stroke width per cartesian series layer. */
  seriesStrokeWidths: parseAsString.withDefault(""),
  /** Pipe-encoded fade edges per cartesian series layer. */
  seriesFadeEdges: parseAsString.withDefault(""),
  /** Pipe-encoded highlight-on-hover per cartesian series layer (`1` / `0`). */
  seriesShowHighlights: parseAsString.withDefault(""),
  /** Pipe-encoded area line visibility per series (`1` / `0`). */
  seriesShowLines: parseAsString.withDefault(""),
  /** Pipe-encoded point markers per series (`1` / `0`). */
  seriesMarkersFlags: parseAsString.withDefault(""),
  seriesMarkerRadii: parseAsString.withDefault(""),
  seriesMarkerRingGaps: parseAsString.withDefault(""),
  seriesMarkerRingWidths: parseAsString.withDefault(""),
  seriesTerminalMarkerShow: parseAsBoolean.withDefault(false),
  seriesTerminalMarkerFill: parseAsString.withDefault("transparent"),
  seriesTerminalMarkerRingColor: parseAsString.withDefault(""),
  seriesTerminalMarkerRingGap: parseAsFloat.withDefault(2),
  seriesTerminalMarkerShowFlags: parseAsString.withDefault(""),
  seriesTerminalMarkerFills: parseAsString.withDefault(""),
  seriesTerminalMarkerRingColors: parseAsString.withDefault(""),
  seriesTerminalMarkerRingGaps: parseAsString.withDefault(""),
  seriesDashTailFlags: parseAsString.withDefault(""),
  seriesDashFromIndices: parseAsString.withDefault(""),
  seriesDashArrays: parseAsString.withDefault(""),
  /** Pipe-encoded curve id per cartesian series layer. */
  seriesCurves: parseAsString.withDefault(""),
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
  barChartState: parseAsStringLiteral(["ready", "loading"]).withDefault(
    "ready"
  ),
  loadingStyle: parseAsStringLiteral(["pulse", "sweep"]).withDefault("pulse"),
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
  gridHorizontal: parseAsBoolean.withDefault(true),
  gridVertical: parseAsBoolean.withDefault(false),
  gridNumTicksRows: parseAsInteger.withDefault(5),
  gridNumTicksColumns: parseAsInteger.withDefault(10),
  gridStroke: parseAsString.withDefault("var(--chart-grid)"),
  gridStrokeOpacity: parseAsFloat.withDefault(1),
  gridStrokeWidth: parseAsFloat.withDefault(1),
  gridStrokeDasharray: parseAsString.withDefault("4,4"),
  gridFadeHorizontal: parseAsBoolean.withDefault(true),
  gridFadeVertical: parseAsBoolean.withDefault(false),
  gridHideHorizontalEdgeLines: parseAsBoolean.withDefault(false),
  gridHideVerticalEdgeLines: parseAsBoolean.withDefault(false),
  backgroundPattern:
    parseAsStringLiteral(PATTERN_PRESET_IDS).withDefault("diagonal"),
  backgroundPatternColor: parseAsString.withDefault("var(--chart-grid)"),
  backgroundPatternScale: parseAsFloat.withDefault(1),
  backgroundPatternStrokeWidth: parseAsFloat.withDefault(1),
  backgroundPatternRadius: parseAsFloat.withDefault(2),
  backgroundPatternComplement: parseAsBoolean.withDefault(false),
  backgroundPatternFill: parseAsString.withDefault(""),
  backgroundPatternDotsFill: parseAsBoolean.withDefault(true),
  backgroundPatternTileBackground: parseAsString.withDefault(""),
  backgroundPatternOpacity: parseAsFloat.withDefault(1),
  backgroundPatternShowFill: parseAsBoolean.withDefault(true),
  backgroundFadeHorizontal: parseAsBoolean.withDefault(true),
  backgroundFadeVertical: parseAsBoolean.withDefault(true),
  backgroundFadeHorizontalLength: parseAsFloat.withDefault(10),
  backgroundFadeVerticalLength: parseAsFloat.withDefault(10),
  referenceAreaY1: parseAsFloat.withDefault(160),
  referenceAreaY2: parseAsFloat.withDefault(220),
  referenceAreaFill: parseAsString.withDefault(
    "color-mix(in oklch, var(--chart-foreground-muted) 15%, transparent)"
  ),
  referenceAreaFillOpacity: parseAsFloat.withDefault(1),
  referenceAreaPattern:
    parseAsStringLiteral(PATTERN_PRESET_IDS).withDefault("none"),
  referenceAreaPatternColor: parseAsString.withDefault(
    "var(--chart-foreground-muted)"
  ),
  referenceAreaPatternScale: parseAsFloat.withDefault(1),
  referenceAreaPatternStrokeWidth: parseAsFloat.withDefault(1),
  referenceAreaPatternRadius: parseAsFloat.withDefault(2),
  referenceAreaPatternComplement: parseAsBoolean.withDefault(false),
  referenceAreaPatternFill: parseAsString.withDefault(""),
  referenceAreaPatternDotsFill: parseAsBoolean.withDefault(true),
  referenceAreaPatternTileBackground: parseAsString.withDefault(""),
  referenceAreaStroke: parseAsString.withDefault(
    "var(--chart-foreground-muted)"
  ),
  referenceAreaStrokeStyle: parseAsStringLiteral([
    "solid",
    "dashed",
  ]).withDefault("dashed"),
  referenceAreaStrokeDasharray: parseAsString.withDefault("4,4"),
  referenceAreaFadeEdges: parseAsBoolean.withDefault(true),
  referenceAreaFadeEdgesLength: parseAsFloat.withDefault(10),
  referenceAreaAxisLabelColor: parseAsString.withDefault("var(--chart-1)"),
  referenceAreaShowMarkers: parseAsBoolean.withDefault(true),
  referenceAreaMarkerColor: parseAsString.withDefault("var(--chart-1)"),
  referenceAreaYAxis: parseAsStringLiteral(["left", "right"]).withDefault(
    "left"
  ),
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
  crosshairStyle: parseAsStringLiteral(["solid", "dashed"]).withDefault(
    "solid"
  ),
  crosshairDashArray: parseAsString.withDefault("4,4"),
  crosshairFadeEdges: parseAsStringLiteral([
    "both",
    "none",
    "top",
    "bottom",
  ]).withDefault("both"),
  crosshairFadeLength: parseAsFloat.withDefault(10),
  tooltipMatchCrosshair: parseAsBoolean.withDefault(false),
  tooltipDamping: parseAsInteger.withDefault(20),
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
  brushSelectionPatternScale: parseAsFloat.withDefault(1),
  brushSelectionPatternStrokeWidth: parseAsFloat.withDefault(1),
  brushSelectionPatternRadius: parseAsFloat.withDefault(2),
  brushSelectionPatternComplement: parseAsBoolean.withDefault(false),
  brushSelectionPatternFill: parseAsString.withDefault(""),
  brushSelectionPatternTileBackground: parseAsString.withDefault(""),
  brushSelectionPatternOpacity: parseAsFloat.withDefault(1),
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
  tooltipBackgroundColor: parseAsString.withDefault(
    "var(--chart-tooltip-background)"
  ),
  tooltipBackgroundOpacity: parseAsFloat.withDefault(0.8),
  tooltipBlur: parseAsInteger.withDefault(12),
  hiddenComponents: parseAsString.withDefault(""),
  lineDataTrend: parseAsStringLiteral(["up", "down"]).withDefault("up"),
  projectionCount: parseAsInteger.withDefault(0),
  projectionMode: parseAsStringLiteral([
    "auto",
    "target",
    "manual",
  ]).withDefault("auto"),
  projectionAutoMethod: parseAsStringLiteral([
    "linearRegression",
    "lastSegment",
  ]).withDefault("linearRegression"),
  projectionHorizonPoints: parseAsInteger.withDefault(6),
  projectionEndValue: parseAsFloat.withDefault(280),
  projectionCurve: parseAsStringLiteral([
    "linear",
    "bezier",
  ] as const).withDefault("linear"),
  projectionStroke: parseAsString.withDefault("var(--chart-3)"),
  projectionStrokeStyle: parseAsStringLiteral([
    "solid",
    "gradient",
  ] as const).withDefault("solid"),
  projectionStrokeGradientStart: parseAsString.withDefault(""),
  projectionStrokeGradientEnd: parseAsString.withDefault("var(--chart-5)"),
  projectionDashArray: parseAsString.withDefault("6,4"),
  projectionStrokeWidth: parseAsFloat.withDefault(2),
  projectionShowEndpoints: parseAsBoolean.withDefault(true),
  projectionSeriesIndices: parseAsString.withDefault(""),
  projectionModes: parseAsString.withDefault(""),
  projectionAutoMethods: parseAsString.withDefault(""),
  projectionHorizons: parseAsString.withDefault(""),
  projectionEndValues: parseAsString.withDefault(""),
  projectionCurves: parseAsString.withDefault(""),
  projectionStrokes: parseAsString.withDefault(""),
  projectionStrokeStyles: parseAsString.withDefault(""),
  projectionStrokeGradientStarts: parseAsString.withDefault(""),
  projectionStrokeGradientEnds: parseAsString.withDefault(""),
  projectionDashArrays: parseAsString.withDefault(""),
  projectionStrokeWidths: parseAsString.withDefault(""),
  projectionShowEndpointsFlags: parseAsString.withDefault(""),
  projectionPathDensity: parseAsStringLiteral([
    "stepped",
    "endpoints",
  ]).withDefault("stepped"),
  projectionPathDensities: parseAsString.withDefault(""),
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
  motionEase: MotionEaseUrlValue;
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
  heatmapBinSize: number;
  heatmapGap: number;
  heatmapCornerRadius: number;
  heatmapLegendCellSize: number;
  heatmapChartState: "ready" | "loading";
  heatmapLoadingLabel: string;
  heatmapLoadingOpacity: number;
  heatmapLoadingCellMaxOpacity: number;
  heatmapLoadingCellRandomness: number;
  heatmapLevel0Color: string;
  heatmapLevel1Color: string;
  heatmapLevel2Color: string;
  heatmapLevel3Color: string;
  heatmapLevel4Color: string;
  heatmapLevelFillModes: string;
  heatmapLevelPatterns: string;
  heatmapLevelPatternColors: string;
  heatmapLevelPatternScales: string;
  heatmapLevelPatternStrokeWidths: string;
  heatmapLevelPatternRadii: string;
  heatmapLevelPatternComplements: string;
  heatmapLevelPatternFills: string;
  heatmapLevelPatternTileBackgrounds: string;
  heatmapLevelPatternOpacities: string;
  heatmapLevelPatternDotsFills: string;
  heatmapCellsFadedOpacity: number;
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
  seriesStrokeWidths: string;
  seriesFadeEdges: string;
  seriesShowHighlights: string;
  seriesShowLines: string;
  seriesMarkersFlags: string;
  seriesMarkerRadii: string;
  seriesMarkerRingGaps: string;
  seriesMarkerRingWidths: string;
  seriesTerminalMarkerShow: boolean;
  seriesTerminalMarkerFill: string;
  seriesTerminalMarkerRingColor: string;
  seriesTerminalMarkerRingGap: number;
  seriesTerminalMarkerShowFlags: string;
  seriesTerminalMarkerFills: string;
  seriesTerminalMarkerRingColors: string;
  seriesTerminalMarkerRingGaps: string;
  seriesDashTailFlags: string;
  seriesDashFromIndices: string;
  seriesDashArrays: string;
  seriesCurves: string;
  dataSeries: number;
  dataPoints: number;
  lineChartMode: "standard" | "profitLoss";
  lineChartState: "ready" | "loading";
  areaChartState: "ready" | "loading";
  barChartState: "ready" | "loading";
  loadingStyle: "pulse" | "sweep";
  lineLoadingStroke: string;
  lineLoadingStrokeOpacity: number;
  lineLoadingGridStroke: string;
  lineLoadingGridShimmerStroke: string;
  lineLoadingGridShimmer: boolean;
  lineLoadingGridShimmerLength: number;
  lineLoadingGridShimmerSync: boolean;
  lineLoadingGridShimmerSpeed: number;
  gridHorizontal: boolean;
  gridVertical: boolean;
  gridNumTicksRows: number;
  gridNumTicksColumns: number;
  gridStroke: string;
  gridStrokeOpacity: number;
  gridStrokeWidth: number;
  gridStrokeDasharray: string;
  gridFadeHorizontal: boolean;
  gridFadeVertical: boolean;
  gridHideHorizontalEdgeLines: boolean;
  gridHideVerticalEdgeLines: boolean;
  backgroundPattern: PatternPresetId;
  backgroundPatternColor: string;
  backgroundPatternScale: number;
  backgroundPatternStrokeWidth: number;
  backgroundPatternRadius: number;
  backgroundPatternComplement: boolean;
  backgroundPatternFill: string;
  backgroundPatternDotsFill: boolean;
  backgroundPatternTileBackground: string;
  backgroundPatternOpacity: number;
  backgroundPatternShowFill: boolean;
  backgroundFadeHorizontal: boolean;
  backgroundFadeVertical: boolean;
  backgroundFadeHorizontalLength: number;
  backgroundFadeVerticalLength: number;
  referenceAreaY1: number;
  referenceAreaY2: number;
  referenceAreaFill: string;
  referenceAreaFillOpacity: number;
  referenceAreaPattern: PatternPresetId;
  referenceAreaPatternColor: string;
  referenceAreaPatternScale: number;
  referenceAreaPatternStrokeWidth: number;
  referenceAreaPatternRadius: number;
  referenceAreaPatternComplement: boolean;
  referenceAreaPatternFill: string;
  referenceAreaPatternDotsFill: boolean;
  referenceAreaPatternTileBackground: string;
  referenceAreaStroke: string;
  referenceAreaStrokeStyle: "solid" | "dashed";
  referenceAreaStrokeDasharray: string;
  referenceAreaFadeEdges: boolean;
  referenceAreaFadeEdgesLength: number;
  referenceAreaAxisLabelColor: string;
  referenceAreaShowMarkers: boolean;
  referenceAreaMarkerColor: string;
  referenceAreaYAxis: "left" | "right";
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
  crosshairStyle: "solid" | "dashed";
  crosshairDashArray: string;
  crosshairFadeEdges: "both" | "none" | "top" | "bottom";
  crosshairFadeLength: number;
  tooltipMatchCrosshair: boolean;
  tooltipDamping: number;
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
  brushSelectionPatternScale: number;
  brushSelectionPatternStrokeWidth: number;
  brushSelectionPatternRadius: number;
  brushSelectionPatternComplement: boolean;
  brushSelectionPatternFill: string;
  brushSelectionPatternTileBackground: string;
  brushSelectionPatternOpacity: number;
  showLegend: boolean;
  legendPlacement: "top" | "bottom";
  legendAlign: "start" | "center" | "end";
  legendLayout: "vertical" | "horizontal";
  legendFontSize: number;
  legendShowProgress: boolean;
  legendShowMarker: boolean;
  legendShowValue: boolean;
  tooltipBackgroundColor: string;
  tooltipBackgroundOpacity: number;
  tooltipBlur: number;
  hiddenComponents: string;
  lineDataTrend: "up" | "down";
  projectionCount: number;
  projectionMode: "auto" | "target" | "manual";
  projectionAutoMethod: "linearRegression" | "lastSegment";
  projectionHorizonPoints: number;
  projectionEndValue: number;
  projectionCurve: ProjectionCurveKind;
  projectionStroke: string;
  projectionStrokeStyle: "solid" | "gradient";
  projectionStrokeGradientStart: string;
  projectionStrokeGradientEnd: string;
  projectionDashArray: string;
  projectionStrokeWidth: number;
  projectionShowEndpoints: boolean;
  projectionSeriesIndices: string;
  projectionModes: string;
  projectionAutoMethods: string;
  projectionHorizons: string;
  projectionEndValues: string;
  projectionCurves: string;
  projectionStrokes: string;
  projectionStrokeStyles: string;
  projectionStrokeGradientStarts: string;
  projectionStrokeGradientEnds: string;
  projectionDashArrays: string;
  projectionStrokeWidths: string;
  projectionShowEndpointsFlags: string;
  projectionPathDensity: "stepped" | "endpoints";
  projectionPathDensities: string;
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
    motionEase: "ease",
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
    heatmapBinSize: 0,
    heatmapGap: 2,
    heatmapCornerRadius: 2,
    heatmapLegendCellSize: 11,
    heatmapChartState: "ready",
    heatmapLoadingLabel: "Loading",
    heatmapLoadingOpacity: 1,
    heatmapLoadingCellMaxOpacity: 0.85,
    heatmapLoadingCellRandomness: 1,
    heatmapLevel0Color: HEATMAP_DEFAULT_LEVEL_COLORS[0],
    heatmapLevel1Color: HEATMAP_DEFAULT_LEVEL_COLORS[1],
    heatmapLevel2Color: HEATMAP_DEFAULT_LEVEL_COLORS[2],
    heatmapLevel3Color: HEATMAP_DEFAULT_LEVEL_COLORS[3],
    heatmapLevel4Color: HEATMAP_DEFAULT_LEVEL_COLORS[4],
    heatmapLevelFillModes: "",
    heatmapLevelPatterns: "",
    heatmapLevelPatternColors: "",
    heatmapLevelPatternScales: "",
    heatmapLevelPatternStrokeWidths: "",
    heatmapLevelPatternRadii: "",
    heatmapLevelPatternComplements: "",
    heatmapLevelPatternFills: "",
    heatmapLevelPatternTileBackgrounds: "",
    heatmapLevelPatternOpacities: "",
    heatmapLevelPatternDotsFills: "",
    heatmapCellsFadedOpacity: 0.3,
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
    seriesStrokeWidths: "",
    seriesFadeEdges: "",
    seriesShowHighlights: "",
    seriesShowLines: "",
    seriesMarkersFlags: "",
    seriesMarkerRadii: "",
    seriesMarkerRingGaps: "",
    seriesMarkerRingWidths: "",
    seriesTerminalMarkerShow: false,
    seriesTerminalMarkerFill: "transparent",
    seriesTerminalMarkerRingColor: "",
    seriesTerminalMarkerRingGap: 2,
    seriesTerminalMarkerShowFlags: "",
    seriesTerminalMarkerFills: "",
    seriesTerminalMarkerRingColors: "",
    seriesTerminalMarkerRingGaps: "",
    seriesDashTailFlags: "",
    seriesDashFromIndices: "",
    seriesDashArrays: "",
    seriesCurves: "",
    dataSeries: 2,
    dataPoints: 12,
    lineChartMode: "standard",
    lineChartState: "ready",
    areaChartState: "ready",
    barChartState: "ready",
    loadingStyle: "pulse",
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
    gridHorizontal: true,
    gridVertical: false,
    gridNumTicksRows: 5,
    gridNumTicksColumns: 10,
    gridStroke: "var(--chart-grid)",
    gridStrokeOpacity: 1,
    gridStrokeWidth: 1,
    gridStrokeDasharray: "4,4",
    gridFadeHorizontal: true,
    gridFadeVertical: false,
    gridHideHorizontalEdgeLines: false,
    gridHideVerticalEdgeLines: false,
    backgroundPattern: "diagonal",
    backgroundPatternColor: "var(--chart-grid)",
    backgroundPatternScale: 1,
    backgroundPatternStrokeWidth: 1,
    backgroundPatternRadius: 2,
    backgroundPatternComplement: false,
    backgroundPatternFill: "",
    backgroundPatternDotsFill: true,
    backgroundPatternTileBackground: "",
    backgroundPatternOpacity: 1,
    backgroundPatternShowFill: true,
    backgroundFadeHorizontal: true,
    backgroundFadeVertical: true,
    backgroundFadeHorizontalLength: 10,
    backgroundFadeVerticalLength: 10,
    referenceAreaY1: 160,
    referenceAreaY2: 220,
    referenceAreaFill:
      "color-mix(in oklch, var(--chart-foreground-muted) 15%, transparent)",
    referenceAreaFillOpacity: 1,
    referenceAreaPattern: "none",
    referenceAreaPatternColor: "var(--chart-foreground-muted)",
    referenceAreaPatternScale: 1,
    referenceAreaPatternStrokeWidth: 1,
    referenceAreaPatternRadius: 2,
    referenceAreaPatternComplement: false,
    referenceAreaPatternFill: "",
    referenceAreaPatternDotsFill: true,
    referenceAreaPatternTileBackground: "",
    referenceAreaStroke: "var(--chart-foreground-muted)",
    referenceAreaStrokeStyle: "dashed",
    referenceAreaStrokeDasharray: "4,4",
    referenceAreaFadeEdges: true,
    referenceAreaFadeEdgesLength: 10,
    referenceAreaAxisLabelColor: "var(--chart-1)",
    referenceAreaShowMarkers: true,
    referenceAreaMarkerColor: "var(--chart-1)",
    referenceAreaYAxis: "left",
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
    crosshairStyle: "solid",
    crosshairDashArray: "4,4",
    crosshairFadeEdges: "both",
    crosshairFadeLength: 10,
    tooltipMatchCrosshair: false,
    tooltipDamping: 20,
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
    brushSelectionPatternScale: 1,
    brushSelectionPatternStrokeWidth: 1,
    brushSelectionPatternRadius: 2,
    brushSelectionPatternComplement: false,
    brushSelectionPatternFill: "",
    brushSelectionPatternTileBackground: "",
    brushSelectionPatternOpacity: 1,
    showLegend: false,
    legendPlacement: "bottom",
    legendAlign: "end",
    legendLayout: "vertical",
    legendFontSize: 13,
    legendShowProgress: false,
    legendShowMarker: true,
    legendShowValue: true,
    tooltipBackgroundColor: "var(--chart-tooltip-background)",
    tooltipBackgroundOpacity: 0.8,
    tooltipBlur: 12,
    hiddenComponents: "",
    lineDataTrend: "up",
    projectionCount: 0,
    projectionMode: "auto",
    projectionAutoMethod: "linearRegression",
    projectionHorizonPoints: 6,
    projectionEndValue: 280,
    projectionCurve: "linear",
    projectionStroke: "var(--chart-3)",
    projectionStrokeStyle: "solid",
    projectionStrokeGradientStart: "",
    projectionStrokeGradientEnd: "var(--chart-5)",
    projectionDashArray: "6,4",
    projectionStrokeWidth: 2,
    projectionShowEndpoints: true,
    projectionSeriesIndices: "",
    projectionModes: "",
    projectionAutoMethods: "",
    projectionHorizons: "",
    projectionEndValues: "",
    projectionCurves: "",
    projectionStrokes: "",
    projectionStrokeStyles: "",
    projectionStrokeGradientStarts: "",
    projectionStrokeGradientEnds: "",
    projectionDashArrays: "",
    projectionStrokeWidths: "",
    projectionShowEndpointsFlags: "",
    projectionPathDensity: "stepped",
    projectionPathDensities: "",
    ...overrides,
  };
}
