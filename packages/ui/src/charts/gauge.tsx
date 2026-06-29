"use client";

import { ParentSize } from "@visx/responsive";
import { motion, type Transition, useReducedMotion } from "motion/react";
import { type ReactNode, useId, useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  type ChartStatFlowFormat,
  defaultChartStatFlowFormat,
} from "./chart-stat-flow";
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

const DEFAULT_NOTCH_ENTER_TRANSITION: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 20,
};

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
  enterTransition?: Transition;
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
  notchTransition,
  stagger,
  defsChildren,
  useThemePaletteGradient,
  themeActiveGradientId,
  resolvedInactiveFillOpacity,
  resolvedActiveFillOpacity,
  resolveBgFill,
  resolveActiveFill,
}: {
  notches: ComputedNotch[];
  width: number;
  height: number;
  notchCornerRadius: number;
  cornerDepth: number;
  geometryScrubbing: boolean;
  notchTransition: Transition;
  stagger: number;
  defsChildren: ReactNode[];
  useThemePaletteGradient: boolean;
  themeActiveGradientId: string;
  resolvedInactiveFillOpacity: number;
  resolvedActiveFillOpacity: number;
  resolveBgFill: (index: number) => string;
  resolveActiveFill: (notch: ComputedNotch) => string;
}) {
  return (
    <svg
      aria-hidden="true"
      className="block w-full overflow-visible"
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      width={width}
    >
      {defsChildren.length > 0 || useThemePaletteGradient ? (
        <defs>
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
      {notches.map((notch) => {
        const pathD = createNotchPath(
          notch.points,
          notchCornerRadius,
          cornerDepth
        );
        if (geometryScrubbing) {
          return (
            <path
              d={pathD}
              fill={resolveBgFill(notch.index)}
              fillOpacity={resolvedInactiveFillOpacity}
              key={`bg-${notch.index}`}
            />
          );
        }
        return (
          <motion.path
            animate={{ opacity: 1, scale: 1 }}
            d={pathD}
            fill={resolveBgFill(notch.index)}
            fillOpacity={resolvedInactiveFillOpacity}
            initial={{ opacity: 0, scale: 0 }}
            key={`bg-${notch.index}`}
            style={{
              transformOrigin: `${notch.xCenter}px ${notch.yCenter}px`,
            }}
            transition={{
              ...notchTransition,
              delay: notch.index * 0.015 * stagger,
            }}
          />
        );
      })}
      {notches
        .filter((n) => n.isActive)
        .map((notch) => {
          const pathD = createNotchPath(
            notch.points,
            notchCornerRadius,
            cornerDepth
          );
          if (geometryScrubbing) {
            return (
              <path
                d={pathD}
                fill={resolveActiveFill(notch)}
                fillOpacity={resolvedActiveFillOpacity}
                key={`active-${notch.index}`}
              />
            );
          }
          return (
            <motion.path
              animate={{ opacity: 1, scale: 1 }}
              d={pathD}
              fill={resolveActiveFill(notch)}
              fillOpacity={resolvedActiveFillOpacity}
              initial={{ opacity: 0, scale: 0 }}
              key={`active-${notch.index}`}
              style={{
                transformOrigin: `${notch.xCenter}px ${notch.yCenter}px`,
              }}
              transition={{
                ...notchTransition,
                delay: (0.3 + notch.index * 0.02) * stagger,
              }}
            />
          );
        })}
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
    resolvedActiveFillOpacity: activeFillOpacity ?? DEFAULT_ACTIVE_FILL_OPACITY,
    resolvedInactiveFillOpacity:
      inactiveFillOpacity ?? DEFAULT_INACTIVE_FILL_OPACITY,
    totalNotches,
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
  } = props;

  const prefersReducedMotion = useReducedMotion();
  const fillState = useGaugeFillState(props);

  const notchTransition: Transition = prefersReducedMotion
    ? { duration: 0 }
    : (enterTransition ?? DEFAULT_NOTCH_ENTER_TRANSITION);
  const stagger = Math.max(0.25, Math.min(2.5, enterStaggerScale));

  const size = Math.min(width, height);
  const centerX = width / 2;
  const centerY = height / 2;
  const outerRadius = size * 0.42;
  const innerRadiusBase = size * 0.28;
  const defaultRadialDepth = outerRadius - innerRadiusBase;
  const depthFactor = Math.min(100, Math.max(5, notchLengthPercent)) / 100;
  const notchLength = defaultRadialDepth * depthFactor;
  const innerRadius = outerRadius - notchLength;

  const activeNotches = Math.round((value / 100) * totalNotches);
  const totalAngle = endAngle - startAngle;
  const availableAngle = totalAngle * (1 - spacing / 100);
  const notchAngle = totalNotches > 0 ? availableAngle / totalNotches : 0;
  const gapDen = totalNotches - 1 > 0 ? totalNotches - 1 : 1;
  const gapAngle = (totalAngle * (spacing / 100)) / gapDen;

  const notches = useMemo(() => {
    return Array.from({ length: totalNotches }, (_, i) => {
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
    resolveGaugeActiveFill({
      notch,
      hasCustomActive: fillState.hasCustomActive,
      activeFill,
      useThemePaletteGradient: fillState.useThemePaletteGradient,
      themeActiveGradientId: fillState.themeActiveGradientId,
      useGradient,
      activeFillSolid: "var(--chart-1)",
    });

  const showCenter = centerValue != null;

  return (
    <div className="relative w-full" style={{ height, width }}>
      <GaugeNotchSvg
        cornerDepth={notchLength}
        defsChildren={fillState.defsChildren}
        geometryScrubbing={false}
        height={height}
        notchCornerRadius={notchCornerRadius}
        notches={notches}
        notchTransition={notchTransition}
        resolveActiveFill={resolveActiveFill}
        resolveBgFill={resolveBgFill}
        resolvedActiveFillOpacity={fillState.resolvedActiveFillOpacity}
        resolvedInactiveFillOpacity={fillState.resolvedInactiveFillOpacity}
        stagger={stagger}
        themeActiveGradientId={fillState.themeActiveGradientId}
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

  const prefersReducedMotion = useReducedMotion();
  const fillState = useGaugeFillState(props);

  const notchTransition: Transition = prefersReducedMotion
    ? { duration: 0 }
    : (enterTransition ?? DEFAULT_NOTCH_ENTER_TRANSITION);
  const stagger = Math.max(0.25, Math.min(2.5, enterStaggerScale));

  const centerY = height / 2;
  const depthFactor = Math.min(100, Math.max(5, notchLengthPercent)) / 100;
  const outerOffset = (height / 2) * depthFactor;
  const taperRatio = 28 / 42;
  const innerOffset = uniformWidth ? outerOffset : outerOffset * taperRatio;
  const notchDepth = uniformWidth ? outerOffset * 2 : outerOffset - innerOffset;
  const cornerVerticalDepth = uniformWidth ? notchDepth : outerOffset * 2;
  const widthFactor = Math.min(100, Math.max(10, notchWidthPercent)) / 100;

  const activeNotches = Math.round((value / 100) * totalNotches);
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
        geometryScrubbing={geometryScrubbing}
        height={height}
        notchCornerRadius={notchCornerRadius}
        notches={notches}
        notchTransition={notchTransition}
        resolveActiveFill={resolveActiveFill}
        resolveBgFill={resolveBgFill}
        resolvedActiveFillOpacity={fillState.resolvedActiveFillOpacity}
        resolvedInactiveFillOpacity={fillState.resolvedInactiveFillOpacity}
        stagger={stagger}
        themeActiveGradientId={fillState.themeActiveGradientId}
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
  ...props
}: GaugeProps) {
  const isLinear = orientation === "linear";
  const resolvedMinWidth = minWidth ?? (isLinear ? 200 : 300);
  const resolvedLinearHeight = linearHeight ?? DEFAULT_LINEAR_GAUGE_HEIGHT;

  if (isLinear) {
    if (widthProp != null) {
      return (
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
      );
    }

    return (
      <div className={cn("relative w-full min-w-0 max-w-full", className)}>
        <div className="w-full min-w-0" style={{ minWidth: resolvedMinWidth }}>
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
    );
  }

  if (widthProp != null && heightProp != null) {
    return (
      <div className={cn("relative inline-flex max-w-full", className)}>
        <GaugeInner
          height={heightProp}
          orientation="arc"
          width={widthProp}
          {...props}
        />
      </div>
    );
  }

  return (
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
  );
}

Gauge.displayName = "Gauge";
