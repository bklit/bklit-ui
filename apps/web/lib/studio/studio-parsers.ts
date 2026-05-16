import {
  parseAsBoolean,
  parseAsFloat,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
} from "nuqs";
import { validChartSlugs } from "@/components/charts/chart-slugs";
import type { ColorPresetId } from "./color-presets";
import { COLOR_PRESET_IDS } from "./color-presets";
import type { CurveId } from "./curves";
import { CURVE_IDS } from "./curves";
import type { PatternPresetId } from "./patterns";
import { PATTERN_PRESET_IDS } from "./patterns";
import type { ChartSlug } from "./types";

export const studioSearchParams = {
  chart: parseAsStringLiteral(validChartSlugs).withDefault("gauge-chart"),
  preset: parseAsStringLiteral(COLOR_PRESET_IDS).withDefault("default"),
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
  curve: parseAsStringLiteral(CURVE_IDS).withDefault("natural"),
  fillOpacity: parseAsFloat.withDefault(0.3),
  strokeWidth: parseAsFloat.withDefault(2),
  pattern: parseAsStringLiteral(PATTERN_PRESET_IDS).withDefault("none"),
  aspectRatio: parseAsString.withDefault("2 / 1"),
  animationDuration: parseAsInteger.withDefault(1100),
  showLine: parseAsBoolean.withDefault(true),
  showHighlight: parseAsBoolean.withDefault(true),
  fadeEdges: parseAsBoolean.withDefault(true),
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
  barSeriesMode: parseAsStringLiteral([
    "single",
    "grouped",
    "stacked",
  ]).withDefault("single"),
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
};

export interface StudioUrlState {
  chart: ChartSlug;
  preset: ColorPresetId;
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
  curve: CurveId;
  fillOpacity: number;
  strokeWidth: number;
  pattern: PatternPresetId;
  aspectRatio: string;
  animationDuration: number;
  showLine: boolean;
  showHighlight: boolean;
  fadeEdges: boolean;
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
  barSeriesMode: "single" | "grouped" | "stacked";
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
}

export function defaultsForChart(): Partial<
  Record<keyof typeof studioSearchParams, null>
> {
  return Object.fromEntries(
    Object.keys(studioSearchParams).map((key) => [key, null])
  ) as Partial<Record<keyof typeof studioSearchParams, null>>;
}
