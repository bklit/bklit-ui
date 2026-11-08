"use client";

import {
  domAnimation,
  LazyMotion,
  type MotionValue,
  m,
  type Transition,
  useReducedMotion,
} from "motion/react";
import { type ReactNode, useId, useMemo, useRef } from "react";
import { cn } from "@/lib/utils";
import { useChartDataOverride } from "./chart-data-override";
import { ParentSize } from "./chart-parent-size";
import {
  type ChartStatFlowFormat,
  defaultChartStatFlowFormat,
} from "./chart-stat-flow";
import {
  GaugeCenterDisc,
  type GaugeCenterDiscOptions,
  GaugeConicSector,
  GaugeDots,
  type GaugeDotsOptions,
  GaugeGlowFilter,
  type GaugeGlowOptions,
  GaugeProgressRing,
  type GaugeProgressRingOptions,
  GaugeSector,
  type GaugeSectorOptions,
  GaugeSolidArc,
  type GaugeZone,
  GaugeZoneBands,
  type GaugeZoneDisplay,
  progressRingExtent,
  resolveCenterDiscOptions,
  resolveDotsOptions,
  resolveGlowOptions,
  resolveProgressRingOptions,
  resolveSectorOptions,
  ZONE_BAND_WIDTH,
  zoneColorAt,
} from "./gauge-arc-layers";
import {
  clamp01,
  DEFAULT_GAUGE_SWEEP_TRANSITION,
  GAUGE_TRACK_ENTER_TRANSITION,
  GaugeNeedle,
  type GaugeNeedleOptions,
  type GaugeNeedleVariant,
  GaugeRuler,
  type GaugeRulerOptions,
  resolveNeedleOptions,
  resolveRulerOptions,
  rulerOutsideExtent,
  useGaugeSweep,
  useMotionValueApply,
} from "./gauge-dial";
import {
  type GaugeLabelAlign,
  GaugeLabelLayout,
  type GaugeLabelPlacement,
  GaugeLabelShell,
} from "./gauge-label-layout";
import {
  type ComputedNotch,
  collectGaugeDefsElements,
  createNotchPath,
  DEFAULT_ACTIVE_FILL_OPACITY,
  DEFAULT_ACTIVE_GRADIENT,
  DEFAULT_INACTIVE_FILL_OPACITY,
  DEFAULT_LINEAR_GAUGE_HEIGHT,
  interpolateGaugeHex,
  resolveGaugeActiveFill,
  resolveGaugeBgFill,
} from "./notch-gauge-shared";
import { PieCenterShell } from "./pie-center-shell";

export type {
  GaugeCenterDiscOptions,
  GaugeDotsOptions,
  GaugeGlowOptions,
  GaugeProgressRingOptions,
  GaugeSectorOptions,
  GaugeZone,
  GaugeZoneDisplay,
} from "./gauge-arc-layers";
export type {
  GaugeNeedleOptions,
  GaugeNeedleVariant,
  GaugeRulerLabelOptions,
  GaugeRulerOptions,
  GaugeRulerPosition,
} from "./gauge-dial";

/** Arc track drawing: discrete notches, one rounded stroke, or nothing. */
export type GaugeArcStyle = "notches" | "solid" | "none";

/** Track fades in, then the fill sweeps from zero. */
const FILL_ENTER_DELAY = 0.12;

export type GaugeOrientation = "arc" | "linear";

export interface GaugeProps {
  /** Arc (default) or horizontal linear notch track */
  orientation?: GaugeOrientation;
  /** Fill level 0–100 */
  value: number;
  /** Number of notches */
  totalNotches?: number;
  /** Percentage of the track reserved for gaps between notches */
  spacing?: number;
  notchCornerRadius?: number;
  /** `true` = rectangular notches; `false` = tapered toward center / midline */
  uniformWidth?: boolean;
  startAngle?: number;
  endAngle?: number;
  useGradient?: boolean;
  activeGradient?: readonly [string, string];
  inactiveGradient?: readonly [string, string];
  /** Center statistic — omit to hide the label block */
  centerValue?: number;
  defaultLabel?: string;
  prefix?: string;
  suffix?: string;
  formatOptions?: ChartStatFlowFormat;
  /** Label position for `orientation="linear"`. Arc gauges always overlay center. */
  labelPlacement?: GaugeLabelPlacement;
  /** Cross-axis alignment (start / center / end), same model as chart legend */
  labelAlign?: GaugeLabelAlign;
  inactiveFill?: string;
  activeFill?: string;
  inactiveFillOpacity?: number;
  activeFillOpacity?: number;
  children?: ReactNode;
  className?: string;
  width?: number;
  height?: number;
  minWidth?: number;
  notchLengthPercent?: number;
  /** Linear only — notch width as % of each slot (default 80) */
  notchWidthPercent?: number;
  /** Linear only — bar thickness in px when responsive (default 24) */
  linearHeight?: number;
  /**
   * Arc only — scale ticks inside the notches, brightening up to the value.
   * `true` for defaults or an options object.
   */
  ruler?: boolean | GaugeRulerOptions;
  /**
   * Arc only — pointer that sweeps to the value. `true` (gradient), a variant
   * name (`"line" | "gradient" | "triangle" | "polygon"`), or options.
   */
  needle?: boolean | GaugeNeedleVariant | GaugeNeedleOptions;
  /** Arc only — `notches` (default), `solid` rounded stroke, or `none`. */
  arcStyle?: GaugeArcStyle;
  /** Arc only — solid stroke thickness as a fraction of size (default 0.035). */
  arcThickness?: number;
  /** Arc only — coloured ranges (0–100), e.g. a red zone. */
  zones?: readonly GaugeZone[];
  /** How zones render. Default `band`. */
  zoneDisplay?: GaugeZoneDisplay;
  /** Arc only — filled wedge from start to value (conic, radial, flat or pattern). */
  sector?: boolean | GaugeSectorOptions;
  /** Arc only — thin value ring around the track. */
  progressRing?: boolean | GaugeProgressRingOptions;
  /** Arc only — concentric dot rings that light up to the value. */
  dots?: boolean | GaugeDotsOptions;
  /** Arc only — soft glow on the fill (notches, solid arc, progress ring). */
  glow?: boolean | GaugeGlowOptions;
  /** Arc only — ringed disc behind the center label. */
  centerDisc?: boolean | GaugeCenterDiscOptions;
  /**
   * Transition for the fill sweep (and needle). Default: zero-bounce spring.
   * Notches light up in order as the sweep passes them.
   */
  enterTransition?: Transition;
  /** Scales the delay before the fill sweep starts (0.25–2.5). */
  enterStaggerScale?: number;
  /** Studio-only: static paths while scrubbing geometry controls */
  geometryScrubbing?: boolean;
}

interface GaugeInnerProps extends Omit<GaugeProps, "className" | "minWidth"> {
  width: number;
  height: number;
}

function GaugeNotchSvg({
  notches,
  width,
  height,
  notchCornerRadius,
  cornerDepth,
  geometryScrubbing,
  fillProgress,
  trackEnter,
  defsChildren,
  useThemePaletteGradient,
  themeActiveGradientId,
  resolvedInactiveFillOpacity,
  resolvedActiveFillOpacity,
  resolveBgFill,
  resolveActiveFill,
  overlay,
  underlay,
  extraDefs,
  activeFilterId,
}: {
  notches: ComputedNotch[];
  width: number;
  height: number;
  notchCornerRadius: number;
  cornerDepth: number;
  geometryScrubbing: boolean;
  /** Lit notch count (fractional while sweeping) */
  fillProgress: MotionValue<number>;
  /** Fade the track in on mount */
  trackEnter: boolean;
  defsChildren: ReactNode[];
  useThemePaletteGradient: boolean;
  themeActiveGradientId: string;
  resolvedInactiveFillOpacity: number;
  resolvedActiveFillOpacity: number;
  resolveBgFill: (index: number) => string;
  resolveActiveFill: (notch: ComputedNotch) => string;
  /** Ruler / needle layers drawn above the notches */
  overlay?: ReactNode;
  /** Sector / dots layers drawn beneath the notches */
  underlay?: ReactNode;
  extraDefs?: ReactNode;
  /** Filter (e.g. glow) applied to the lit notches */
  activeFilterId?: string;
}) {
  const activeRefs = useRef<(SVGPathElement | null)[]>([]);
  const litAt = (progress: number, index: number) =>
    clamp01(progress - index) * resolvedActiveFillOpacity;

  // One subscription drives every notch — no per-frame React renders.
  useMotionValueApply(fillProgress, (progress) => {
    for (const notch of notches) {
      activeRefs.current[notch.index]?.setAttribute(
        "fill-opacity",
        String(litAt(progress, notch.index))
      );
    }
  });

  const paths = notches.map((notch) => ({
    notch,
    d: createNotchPath(notch.points, notchCornerRadius, cornerDepth),
  }));
  const initialProgress = fillProgress.get();
  const animateTrack = trackEnter && !geometryScrubbing;

  return (
    <svg
      aria-hidden="true"
      className="relative block w-full overflow-visible"
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      width={width}
    >
      {defsChildren.length > 0 || useThemePaletteGradient || extraDefs ? (
        <defs>
          {extraDefs}
          {useThemePaletteGradient ? (
            <linearGradient
              id={themeActiveGradientId}
              x1="0%"
              x2="100%"
              y1="0%"
              y2="0%"
            >
              <stop offset="0%" stopColor="var(--chart-1)" />
              <stop offset="100%" stopColor="var(--chart-5)" />
            </linearGradient>
          ) : null}
          {defsChildren}
        </defs>
      ) : null}
      {underlay}
      <m.g
        animate={{ opacity: 1 }}
        initial={animateTrack ? { opacity: 0 } : false}
        transition={GAUGE_TRACK_ENTER_TRANSITION}
      >
        {paths.map(({ notch, d }) => (
          <path
            d={d}
            fill={resolveBgFill(notch.index)}
            fillOpacity={resolvedInactiveFillOpacity}
            key={`bg-${notch.index}`}
          />
        ))}
      </m.g>
      <g filter={activeFilterId ? `url(#${activeFilterId})` : undefined}>
        {paths.map(({ notch, d }) => (
          <path
            d={d}
            fill={resolveActiveFill(notch)}
            fillOpacity={litAt(initialProgress, notch.index)}
            key={`active-${notch.index}`}
            ref={(el) => {
              activeRefs.current[notch.index] = el;
            }}
          />
        ))}
      </g>
      {overlay ? (
        <m.g
          animate={{ opacity: 1 }}
          initial={animateTrack ? { opacity: 0 } : false}
          transition={GAUGE_TRACK_ENTER_TRANSITION}
        >
          {overlay}
        </m.g>
      ) : null}
    </svg>
  );
}

function useGaugeFillState(props: GaugeInnerProps) {
  const {
    useGradient = false,
    activeGradient,
    inactiveGradient,
    inactiveFill,
    activeFill,
    inactiveFillOpacity,
    activeFillOpacity,
    children,
    totalNotches = 40,
  } = props;

  const themeActiveGradientId = `gauge-theme-active-${useId().replace(/:/g, "")}`;
  const defsChildren = useMemo(
    () => collectGaugeDefsElements(children),
    [children]
  );

  const hasCustomInactive =
    inactiveFill !== undefined && inactiveFill.length > 0;
  const hasCustomActive = activeFill !== undefined && activeFill.length > 0;

  const activeGrad0 = activeGradient?.[0] ?? DEFAULT_ACTIVE_GRADIENT[0];
  const activeGrad1 = activeGradient?.[1] ?? DEFAULT_ACTIVE_GRADIENT[1];
  const inactiveGrad0 = inactiveGradient?.[0] ?? activeGrad0;
  const inactiveGrad1 = inactiveGradient?.[1] ?? activeGrad1;
  const useThemePaletteGradient = useGradient && activeGradient === undefined;

  return {
    themeActiveGradientId,
    defsChildren,
    hasCustomInactive,
    hasCustomActive,
    activeGrad0,
    activeGrad1,
    inactiveGrad0,
    inactiveGrad1,
    useThemePaletteGradient,
    solidGradientStops: useThemePaletteGradient
      ? (["var(--chart-1)", "var(--chart-5)"] as const)
      : ([activeGrad0, activeGrad1] as const),
    resolvedActiveFillOpacity: activeFillOpacity ?? DEFAULT_ACTIVE_FILL_OPACITY,
    resolvedInactiveFillOpacity:
      inactiveFillOpacity ?? DEFAULT_INACTIVE_FILL_OPACITY,
    totalNotches,
  };
}

function useGaugeMotion({
  value,
  activeNotches,
  enterTransition,
  enterStaggerScale = 1,
  geometryScrubbing = false,
}: {
  value: number;
  activeNotches: number;
  enterTransition?: Transition;
  enterStaggerScale?: number;
  geometryScrubbing?: boolean;
}) {
  const prefersReducedMotion = useReducedMotion();
  const instant = Boolean(prefersReducedMotion) || geometryScrubbing;
  const transition = enterTransition ?? DEFAULT_GAUGE_SWEEP_TRANSITION;
  const stagger = Math.max(0.25, Math.min(2.5, enterStaggerScale));
  const enterDelay = FILL_ENTER_DELAY * stagger;
  // Notches snap to whole counts at rest; the needle / ruler track the exact value.
  const fillProgress = useGaugeSweep({
    target: activeNotches,
    transition,
    enterDelay,
    instant,
  });
  const valueProgress = useGaugeSweep({
    target: clamp01(value / 100),
    transition,
    enterDelay,
    instant,
  });
  return { fillProgress, valueProgress, trackEnter: !instant };
}

type ArcLayout = ReturnType<typeof computeArcLayout>;

/**
 * Radii for every arc layer. Layers ringing the track (progress ring → zone
 * band → outside ruler) claim space from the outside in and the track
 * shrinks to make room.
 */
function computeArcLayout({
  size,
  rulerOptions,
  ringOptions,
  zones,
  zoneDisplay,
  notchLengthPercent,
  arcStyle,
  arcThickness,
  needleTip,
}: {
  size: number;
  rulerOptions: GaugeRulerOptions | null;
  ringOptions: GaugeProgressRingOptions | null;
  zones: readonly GaugeZone[] | undefined;
  zoneDisplay: GaugeZoneDisplay;
  notchLengthPercent: number;
  arcStyle: GaugeArcStyle;
  arcThickness: number;
  needleTip: GaugeNeedleOptions["tip"];
}) {
  const rulerOutside = rulerOptions?.position === "outside";
  const hasZones = zones != null && zones.length > 0;
  const showZoneBand = hasZones && zoneDisplay !== "fill";
  const zoneFill = hasZones && zoneDisplay !== "band" ? zones : undefined;

  const zoneBandExtent = showZoneBand ? size * (0.02 + ZONE_BAND_WIDTH) : 0;
  const ringExtent = ringOptions ? progressRingExtent(ringOptions, size) : 0;
  const rulerExtent =
    rulerOutside && rulerOptions ? rulerOutsideExtent(rulerOptions, size) : 0;
  const outsideReserve = ringExtent + zoneBandExtent + rulerExtent;
  const outerRadius =
    (outsideReserve > 0 ? size * 0.47 : size * 0.42) - outsideReserve;

  const depthFactor = Math.min(100, Math.max(5, notchLengthPercent)) / 100;
  const notchLength = (outerRadius / 3) * depthFactor;
  const solidThickness = size * arcThickness;
  const trackDepth: Record<GaugeArcStyle, number> = {
    notches: notchLength,
    solid: solidThickness,
    none: 0,
  };
  const innerRadius = outerRadius - trackDepth[arcStyle];

  const ringWidth = size * (ringOptions?.width ?? 0.01);
  const insideRulerDepth =
    rulerOptions && !rulerOutside
      ? size *
        ((rulerOptions.gap ?? 0.028) +
          (rulerOptions.majorLength ?? 0.05) +
          0.02)
      : 0;
  const needleReach: Record<NonNullable<GaugeNeedleOptions["tip"]>, number> = {
    inner: innerRadius - size * 0.014,
    outer: outerRadius,
    edge: outerRadius + outsideReserve,
  };

  return {
    outerRadius,
    innerRadius,
    notchLength,
    solidThickness,
    showZoneBand,
    zoneFill,
    rulerOutside,
    ringRadius:
      outerRadius + size * (ringOptions?.gap ?? 0.022) + ringWidth / 2,
    zoneBandRadius:
      outerRadius + ringExtent + size * (0.02 + ZONE_BAND_WIDTH / 2),
    outsideRulerAnchor: outerRadius + ringExtent + zoneBandExtent,
    dotsRadius: innerRadius - size * 0.03 - insideRulerDepth,
    needleReach: needleReach[needleTip ?? "inner"],
  };
}

interface ArcLayerProps {
  cx: number;
  cy: number;
  size: number;
  startAngle: number;
  endAngle: number;
  progress: MotionValue<number>;
  layout: ArcLayout;
  arcStyle: GaugeArcStyle;
  activeFilterId?: string;
  rulerOptions: GaugeRulerOptions | null;
  needleOptions: GaugeNeedleOptions | null;
  ringOptions: GaugeProgressRingOptions | null;
  /** SVG-rendered sector only (conic renders as an HTML layer) */
  sectorOptions: GaugeSectorOptions | null;
  dotsOptions: GaugeDotsOptions | null;
  discOptions: GaugeCenterDiscOptions | null;
  zones: readonly GaugeZone[] | undefined;
  solidFill: string;
  fillOpacity: number;
  trackColor: string;
  trackOpacity: number;
}

/** Layers beneath the notches: sector, dots, solid arc. */
function ArcUnderlay(props: ArcLayerProps) {
  const { cx, cy, size, startAngle, endAngle, progress, layout } = props;
  const shared = { cx, cy, startAngle, endAngle, progress };
  return (
    <>
      {props.sectorOptions ? (
        <GaugeSector
          {...shared}
          options={props.sectorOptions}
          radius={layout.outerRadius}
        />
      ) : null}
      {props.dotsOptions ? (
        <GaugeDots
          {...shared}
          options={props.dotsOptions}
          outerRadius={layout.dotsRadius}
          size={size}
        />
      ) : null}
      {props.arcStyle === "solid" ? (
        <GaugeSolidArc
          {...shared}
          fill={props.solidFill}
          fillOpacity={props.fillOpacity}
          glowFilterId={props.activeFilterId}
          radius={layout.outerRadius - layout.solidThickness / 2}
          thickness={layout.solidThickness}
          trackColor={props.trackColor}
          trackOpacity={props.trackOpacity}
          zones={layout.zoneFill}
        />
      ) : null}
    </>
  );
}

/** Layers above the notches: ring, zone band, ruler, needle, disc. */
function ArcOverlay(props: ArcLayerProps) {
  const { cx, cy, size, startAngle, endAngle, progress, layout } = props;
  const shared = { cx, cy, startAngle, endAngle, progress };
  return (
    <>
      {props.ringOptions ? (
        <GaugeProgressRing
          {...shared}
          glowFilterId={props.activeFilterId}
          options={props.ringOptions}
          radius={layout.ringRadius}
          size={size}
        />
      ) : null}
      {layout.showZoneBand && props.zones ? (
        <GaugeZoneBands
          cx={cx}
          cy={cy}
          endAngle={endAngle}
          radius={layout.zoneBandRadius}
          size={size}
          startAngle={startAngle}
          zones={props.zones}
        />
      ) : null}
      {props.rulerOptions ? (
        <GaugeRuler
          {...shared}
          anchorRadius={
            layout.rulerOutside ? layout.outsideRulerAnchor : layout.innerRadius
          }
          options={props.rulerOptions}
          size={size}
        />
      ) : null}
      {props.needleOptions ? (
        <GaugeNeedle
          {...shared}
          options={props.needleOptions}
          reach={layout.needleReach}
        />
      ) : null}
      {props.discOptions ? (
        <GaugeCenterDisc
          cx={cx}
          cy={cy}
          options={props.discOptions}
          size={size}
        />
      ) : null}
    </>
  );
}

/** Glow filter + left→right gradient for the solid arc. */
function ArcDefs({
  cx,
  cy,
  radius,
  glowId,
  glowOptions,
  solidGradientId,
  stops,
}: {
  cx: number;
  cy: number;
  radius: number;
  glowId: string;
  glowOptions: GaugeGlowOptions | null;
  solidGradientId?: string;
  stops: readonly [string, string];
}) {
  return (
    <>
      {glowOptions ? (
        <GaugeGlowFilter id={glowId} options={glowOptions} />
      ) : null}
      {solidGradientId ? (
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id={solidGradientId}
          x1={cx - radius}
          x2={cx + radius}
          y1={cy}
          y2={cy}
        >
          <stop offset="0%" stopColor={stops[0]} />
          <stop offset="100%" stopColor={stops[1]} />
        </linearGradient>
      ) : null}
    </>
  );
}

/** With a center disc, the sector starts at the disc's outer edge. */
function fitSectorToDisc(
  sector: GaugeSectorOptions | null,
  disc: GaugeCenterDiscOptions | null,
  size: number,
  outerRadius: number
): GaugeSectorOptions | null {
  if (!(sector && disc) || outerRadius <= 0) {
    return sector;
  }
  const discEdge = size * (disc.radius ?? 0.19) + (disc.strokeWidth ?? 3) / 2;
  return {
    ...sector,
    innerRadius: Math.max(sector.innerRadius ?? 0, discEdge / outerRadius),
  };
}

function GaugeArcInner(props: GaugeInnerProps) {
  const {
    value,
    totalNotches = 40,
    spacing = 25,
    notchCornerRadius = 0,
    uniformWidth = false,
    width,
    height,
    startAngle = 135,
    endAngle = 405,
    useGradient = false,
    centerValue,
    defaultLabel = "Total",
    prefix,
    suffix,
    formatOptions = defaultChartStatFlowFormat,
    inactiveFill,
    activeFill,
    notchLengthPercent = 100,
    enterTransition,
    enterStaggerScale = 1,
    geometryScrubbing = false,
    ruler,
    needle,
    arcStyle = "notches",
    arcThickness = 0.035,
    zones,
    zoneDisplay = "band",
    sector,
    progressRing,
    dots,
    glow,
    centerDisc,
  } = props;

  const fillState = useGaugeFillState(props);

  const size = Math.min(width, height);
  const centerX = width / 2;
  const centerY = height / 2;

  const rulerOptions = resolveRulerOptions(ruler);
  const needleOptions = resolveNeedleOptions(needle);
  const ringOptions = resolveProgressRingOptions(progressRing);
  const dotsOptions = resolveDotsOptions(dots);
  const glowOptions = resolveGlowOptions(glow);
  const discOptions = resolveCenterDiscOptions(centerDisc);
  const layout = computeArcLayout({
    size,
    rulerOptions,
    ringOptions,
    zones,
    zoneDisplay,
    notchLengthPercent,
    arcStyle,
    arcThickness,
    needleTip: needleOptions?.tip,
  });
  const { outerRadius, innerRadius, notchLength } = layout;
  const sectorOptions = fitSectorToDisc(
    resolveSectorOptions(sector),
    discOptions,
    size,
    outerRadius
  );

  const glowId = `gauge-glow-${useId().replace(/:/g, "")}`;
  const solidGradientId = `${glowId}-solid`;
  const activeFilterId = glowOptions ? glowId : undefined;

  const activeNotches =
    arcStyle === "notches" ? Math.round((value / 100) * totalNotches) : 0;
  const motion = useGaugeMotion({
    value,
    activeNotches,
    enterTransition,
    enterStaggerScale,
    geometryScrubbing,
  });
  const totalAngle = endAngle - startAngle;
  const availableAngle = totalAngle * (1 - spacing / 100);
  const notchAngle = totalNotches > 0 ? availableAngle / totalNotches : 0;
  const gapDen = totalNotches - 1 > 0 ? totalNotches - 1 : 1;
  const gapAngle = (totalAngle * (spacing / 100)) / gapDen;

  const notchCount = arcStyle === "notches" ? totalNotches : 0;
  const notches = useMemo(() => {
    return Array.from({ length: notchCount }, (_, i) => {
      const angle = startAngle + i * (notchAngle + gapAngle) + notchAngle / 2;
      const radians = (angle * Math.PI) / 180;
      const arcNotchWidth = notchAngle * 0.8;
      const halfWidth = (arcNotchWidth * Math.PI) / 180 / 2;

      const x1 = centerX + Math.cos(radians - halfWidth) * outerRadius;
      const y1 = centerY + Math.sin(radians - halfWidth) * outerRadius;
      const x2 = centerX + Math.cos(radians + halfWidth) * outerRadius;
      const y2 = centerY + Math.sin(radians + halfWidth) * outerRadius;

      let x3: number;
      let y3: number;
      let x4: number;
      let y4: number;

      if (uniformWidth) {
        const perpX = Math.cos(radians);
        const perpY = Math.sin(radians);
        x3 = x2 - perpX * notchLength;
        y3 = y2 - perpY * notchLength;
        x4 = x1 - perpX * notchLength;
        y4 = y1 - perpY * notchLength;
      } else {
        x3 = centerX + Math.cos(radians + halfWidth) * innerRadius;
        y3 = centerY + Math.sin(radians + halfWidth) * innerRadius;
        x4 = centerX + Math.cos(radians - halfWidth) * innerRadius;
        y4 = centerY + Math.sin(radians - halfWidth) * innerRadius;
      }

      const denom = totalNotches > 1 ? totalNotches - 1 : 1;
      const gradientColor =
        useGradient && !fillState.useThemePaletteGradient
          ? interpolateGaugeHex(
              fillState.activeGrad0,
              fillState.activeGrad1,
              i / denom
            )
          : "var(--chart-1)";

      return {
        index: i,
        points: { x1, y1, x2, y2, x3, y3, x4, y4 },
        isActive: i < activeNotches,
        gradientColor,
        xCenter: centerX,
        yCenter: centerY,
      };
    });
  }, [
    notchCount,
    totalNotches,
    notchAngle,
    gapAngle,
    centerX,
    centerY,
    outerRadius,
    innerRadius,
    activeNotches,
    startAngle,
    uniformWidth,
    notchLength,
    useGradient,
    fillState.useThemePaletteGradient,
    fillState.activeGrad0,
    fillState.activeGrad1,
  ]);

  const resolveBgFill = (notchIndex: number) =>
    resolveGaugeBgFill({
      notchIndex,
      totalNotches,
      hasCustomInactive: fillState.hasCustomInactive,
      inactiveFill,
      useThemePaletteGradient: fillState.useThemePaletteGradient,
      useGradient,
      inactiveGrad0: fillState.inactiveGrad0,
      inactiveGrad1: fillState.inactiveGrad1,
      arcTrackFill: "var(--border)",
      linearTrackFill: "var(--chart-background)",
      linearMode: false,
    });

  const resolveActiveFill = (notch: ComputedNotch) =>
    zoneColorAt(
      layout.zoneFill,
      (notch.index + 0.5) / Math.max(1, totalNotches)
    ) ??
    resolveGaugeActiveFill({
      notch,
      hasCustomActive: fillState.hasCustomActive,
      activeFill,
      useThemePaletteGradient: fillState.useThemePaletteGradient,
      themeActiveGradientId: fillState.themeActiveGradientId,
      useGradient,
      activeFillSolid: "var(--chart-1)",
    });

  const solidUsesGradient = useGradient && !fillState.hasCustomActive;
  const solidGradientFill = solidUsesGradient
    ? `url(#${solidGradientId})`
    : "var(--chart-1)";
  const solidFill =
    (fillState.hasCustomActive && activeFill) || solidGradientFill;
  const showCenter = centerValue != null;
  const isConic = (sectorOptions?.gradient ?? "conic") === "conic";
  const conicSectorOptions = isConic ? sectorOptions : null;

  const layerProps: ArcLayerProps = {
    cx: centerX,
    cy: centerY,
    size,
    startAngle,
    endAngle,
    progress: motion.valueProgress,
    layout,
    arcStyle,
    activeFilterId,
    rulerOptions,
    needleOptions,
    ringOptions,
    sectorOptions: isConic ? null : sectorOptions,
    dotsOptions,
    discOptions,
    zones,
    solidFill,
    fillOpacity: fillState.resolvedActiveFillOpacity,
    trackColor:
      fillState.hasCustomInactive && inactiveFill
        ? inactiveFill
        : "var(--border)",
    trackOpacity: fillState.resolvedInactiveFillOpacity,
  };

  const extraDefs =
    glowOptions || solidUsesGradient ? (
      <ArcDefs
        cx={centerX}
        cy={centerY}
        glowId={glowId}
        glowOptions={glowOptions}
        radius={outerRadius}
        solidGradientId={solidUsesGradient ? solidGradientId : undefined}
        stops={fillState.solidGradientStops}
      />
    ) : null;

  return (
    <div className="relative w-full" style={{ height, width }}>
      {conicSectorOptions ? (
        <GaugeConicSector
          cx={centerX}
          cy={centerY}
          endAngle={endAngle}
          options={conicSectorOptions}
          progress={motion.valueProgress}
          radius={outerRadius}
          startAngle={startAngle}
        />
      ) : null}
      <GaugeNotchSvg
        activeFilterId={activeFilterId}
        cornerDepth={notchLength}
        defsChildren={fillState.defsChildren}
        extraDefs={extraDefs}
        fillProgress={motion.fillProgress}
        geometryScrubbing={geometryScrubbing}
        height={height}
        notchCornerRadius={notchCornerRadius}
        notches={notches}
        overlay={<ArcOverlay {...layerProps} />}
        resolveActiveFill={resolveActiveFill}
        resolveBgFill={resolveBgFill}
        resolvedActiveFillOpacity={fillState.resolvedActiveFillOpacity}
        resolvedInactiveFillOpacity={fillState.resolvedInactiveFillOpacity}
        themeActiveGradientId={fillState.themeActiveGradientId}
        trackEnter={motion.trackEnter}
        underlay={<ArcUnderlay {...layerProps} />}
        useThemePaletteGradient={fillState.useThemePaletteGradient}
        width={width}
      />
      {showCenter ? (
        <div
          className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"
          style={{ paddingTop: size * 0.08 }}
        >
          <PieCenterShell
            centerValue={centerValue}
            contextSize={size}
            defaultLabel={defaultLabel}
            formatOptions={formatOptions}
            innerRadiusPx={Math.max(size * 0.2, 52)}
            prefix={prefix}
            suffix={suffix}
          />
        </div>
      ) : null}
    </div>
  );
}

function GaugeLinearInner(props: GaugeInnerProps) {
  const {
    value,
    totalNotches = 40,
    spacing = 25,
    notchCornerRadius = 0,
    uniformWidth = true,
    width,
    height,
    useGradient = false,
    centerValue,
    defaultLabel = "Total",
    prefix,
    suffix,
    formatOptions = defaultChartStatFlowFormat,
    labelPlacement = "top",
    labelAlign = "start",
    inactiveFill,
    activeFill,
    notchLengthPercent = 100,
    notchWidthPercent = 80,
    enterTransition,
    enterStaggerScale = 1,
    geometryScrubbing = false,
  } = props;

  const fillState = useGaugeFillState(props);

  const centerY = height / 2;
  const depthFactor = Math.min(100, Math.max(5, notchLengthPercent)) / 100;
  const outerOffset = (height / 2) * depthFactor;
  const taperRatio = 28 / 42;
  const innerOffset = uniformWidth ? outerOffset : outerOffset * taperRatio;
  const notchDepth = uniformWidth ? outerOffset * 2 : outerOffset - innerOffset;
  const cornerVerticalDepth = uniformWidth ? notchDepth : outerOffset * 2;
  const widthFactor = Math.min(100, Math.max(10, notchWidthPercent)) / 100;

  const activeNotches = Math.round((value / 100) * totalNotches);
  const motion = useGaugeMotion({
    value,
    activeNotches,
    enterTransition,
    enterStaggerScale,
    geometryScrubbing,
  });
  const availableWidth = width * (1 - spacing / 100);
  const slotWidth = totalNotches > 0 ? availableWidth / totalNotches : 0;
  const gapDen = totalNotches - 1 > 0 ? totalNotches - 1 : 1;
  const gapWidth = (width * (spacing / 100)) / gapDen;

  const notches = useMemo(() => {
    return Array.from({ length: totalNotches }, (_, i) => {
      const xCenter = i * (slotWidth + gapWidth) + slotWidth / 2;
      const halfWidth = (slotWidth * widthFactor) / 2;

      let x1: number;
      let y1: number;
      let x2: number;
      let y2: number;
      let x3: number;
      let y3: number;
      let x4: number;
      let y4: number;

      if (uniformWidth) {
        const halfHeight = notchDepth / 2;
        x1 = xCenter - halfWidth;
        y1 = centerY - halfHeight;
        x2 = xCenter + halfWidth;
        y2 = centerY - halfHeight;
        x3 = xCenter + halfWidth;
        y3 = centerY + halfHeight;
        x4 = xCenter - halfWidth;
        y4 = centerY + halfHeight;
      } else {
        x1 = xCenter - halfWidth;
        y1 = centerY - outerOffset;
        x2 = xCenter + halfWidth;
        y2 = centerY - outerOffset;
        const innerHalfWidth = halfWidth * (innerOffset / outerOffset);
        x3 = xCenter + innerHalfWidth;
        y3 = centerY + outerOffset;
        x4 = xCenter - innerHalfWidth;
        y4 = centerY + outerOffset;
      }

      const denom = totalNotches > 1 ? totalNotches - 1 : 1;
      const gradientColor =
        useGradient && !fillState.useThemePaletteGradient
          ? interpolateGaugeHex(
              fillState.activeGrad0,
              fillState.activeGrad1,
              i / denom
            )
          : "var(--chart-1)";

      return {
        index: i,
        points: { x1, y1, x2, y2, x3, y3, x4, y4 },
        isActive: i < activeNotches,
        gradientColor,
        xCenter,
        yCenter: centerY,
      };
    });
  }, [
    totalNotches,
    slotWidth,
    gapWidth,
    centerY,
    outerOffset,
    innerOffset,
    activeNotches,
    uniformWidth,
    notchDepth,
    widthFactor,
    useGradient,
    fillState.useThemePaletteGradient,
    fillState.activeGrad0,
    fillState.activeGrad1,
  ]);

  const resolveBgFill = (notchIndex: number) =>
    resolveGaugeBgFill({
      notchIndex,
      totalNotches,
      hasCustomInactive: fillState.hasCustomInactive,
      inactiveFill,
      useThemePaletteGradient: fillState.useThemePaletteGradient,
      useGradient,
      inactiveGrad0: fillState.inactiveGrad0,
      inactiveGrad1: fillState.inactiveGrad1,
      arcTrackFill: "var(--border)",
      linearTrackFill: "var(--chart-background)",
      linearMode: true,
    });

  const resolveActiveFill = (notch: ComputedNotch) =>
    resolveGaugeActiveFill({
      notch,
      hasCustomActive: fillState.hasCustomActive,
      activeFill,
      useThemePaletteGradient: fillState.useThemePaletteGradient,
      themeActiveGradientId: fillState.themeActiveGradientId,
      useGradient,
      activeFillSolid: "var(--chart-1)",
    });

  const label =
    centerValue == null ? null : (
      <GaugeLabelShell
        align={labelAlign}
        centerValue={centerValue}
        defaultLabel={defaultLabel}
        formatOptions={formatOptions}
        prefix={prefix}
        suffix={suffix}
      />
    );

  const track = (
    <div className="relative w-full" style={{ height, width }}>
      <GaugeNotchSvg
        cornerDepth={cornerVerticalDepth}
        defsChildren={fillState.defsChildren}
        fillProgress={motion.fillProgress}
        geometryScrubbing={geometryScrubbing}
        height={height}
        notchCornerRadius={notchCornerRadius}
        notches={notches}
        resolveActiveFill={resolveActiveFill}
        resolveBgFill={resolveBgFill}
        resolvedActiveFillOpacity={fillState.resolvedActiveFillOpacity}
        resolvedInactiveFillOpacity={fillState.resolvedInactiveFillOpacity}
        themeActiveGradientId={fillState.themeActiveGradientId}
        trackEnter={motion.trackEnter}
        useThemePaletteGradient={fillState.useThemePaletteGradient}
        width={width}
      />
    </div>
  );

  return (
    <GaugeLabelLayout
      align={labelAlign}
      label={label}
      placement={labelPlacement}
    >
      {track}
    </GaugeLabelLayout>
  );
}

function GaugeInner(props: GaugeInnerProps) {
  if (props.orientation === "linear") {
    return <GaugeLinearInner {...props} />;
  }
  return <GaugeArcInner {...props} />;
}

export function Gauge({
  width: widthProp,
  height: heightProp,
  className,
  minWidth,
  orientation = "arc",
  linearHeight,
  value: valueProp,
  centerValue: centerValueProp,
  zones: zonesProp,
  ...gaugeProps
}: GaugeProps) {
  const { value, centerValue, zones } = useChartDataOverride("Gauge", {
    value: valueProp,
    centerValue: centerValueProp,
    zones: zonesProp,
  });
  const props = { ...gaugeProps, value, centerValue, zones };
  const isLinear = orientation === "linear";
  const resolvedMinWidth = minWidth ?? (isLinear ? 200 : 300);
  const resolvedLinearHeight = linearHeight ?? DEFAULT_LINEAR_GAUGE_HEIGHT;

  if (isLinear) {
    if (widthProp != null) {
      return (
        <LazyMotion features={domAnimation}>
          <div
            className={cn("relative w-full max-w-full", className)}
            style={{ width: widthProp }}
          >
            <GaugeInner
              height={heightProp ?? resolvedLinearHeight}
              orientation="linear"
              width={widthProp}
              {...props}
            />
          </div>
        </LazyMotion>
      );
    }

    return (
      <LazyMotion features={domAnimation}>
        <div className={cn("relative w-full min-w-0 max-w-full", className)}>
          {/* Explicit height: visx 4's <ParentSize> renders children absolutely,
            so a content-sized wrapper would collapse to zero height. */}
          <div
            className="w-full min-w-0"
            style={{ height: resolvedLinearHeight, minWidth: resolvedMinWidth }}
          >
            <ParentSize debounceTime={10}>
              {({ width }) =>
                width > 0 ? (
                  <GaugeInner
                    height={resolvedLinearHeight}
                    orientation="linear"
                    width={width}
                    {...props}
                  />
                ) : null
              }
            </ParentSize>
          </div>
        </div>
      </LazyMotion>
    );
  }

  if (widthProp != null && heightProp != null) {
    return (
      <LazyMotion features={domAnimation}>
        <div className={cn("relative inline-flex max-w-full", className)}>
          <GaugeInner
            height={heightProp}
            orientation="arc"
            width={widthProp}
            {...props}
          />
        </div>
      </LazyMotion>
    );
  }

  return (
    <LazyMotion features={domAnimation}>
      <div
        className={cn("relative w-full max-w-full", className)}
        style={{ minWidth: resolvedMinWidth }}
      >
        <div className="mx-auto aspect-[21/16] w-full max-w-[560px]">
          <ParentSize debounceTime={10}>
            {({ width, height }) =>
              width > 0 && height > 0 ? (
                <GaugeInner
                  height={height}
                  orientation="arc"
                  width={width}
                  {...props}
                />
              ) : null
            }
          </ParentSize>
        </div>
      </div>
    </LazyMotion>
  );
}

Gauge.displayName = "Gauge";
