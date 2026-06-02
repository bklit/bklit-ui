"use client";

import type { Transition } from "motion/react";
import { createContext, type ReactNode, useContext, useMemo } from "react";

// CSS variable references for radar chart theming
export const radarCssVars = {
  background: "var(--chart-background)",
  foreground: "var(--chart-foreground)",
  foregroundMuted: "var(--chart-foreground-muted)",
  label: "var(--chart-label, oklch(0.65 0.01 260))",
  grid: "var(--chart-grid)",
  border: "var(--border)",
  // Default radar colors from chart palette
  area1: "var(--chart-1)",
  area2: "var(--chart-2)",
  area3: "var(--chart-3)",
  area4: "var(--chart-4)",
  area5: "var(--chart-5)",
};

// Default radar color palette
export const defaultRadarColors = [
  radarCssVars.area1,
  radarCssVars.area2,
  radarCssVars.area3,
  radarCssVars.area4,
  radarCssVars.area5,
];

export interface RadarMetric {
  /** Unique key for the metric */
  key: string;
  /** Display label for the metric */
  label: string;
}

export interface RadarData {
  /** Display label for this data series */
  label: string;
  /** Color for this data series (defaults to chart-1 through chart-5) */
  color?: string;
  /** Metric values (key -> value, normalized 0-100) */
  values: Record<string, number>;
}

export interface RadarHoverContextValue {
  hoveredIndex: number | null;
  setHoveredIndex: (index: number | null) => void;
}

export interface RadarStableContextValue {
  // Data
  data: RadarData[];
  metrics: RadarMetric[];

  // Dimensions
  size: number;
  radius: number;
  levels: number;

  // Animation
  animate: boolean;
  /** Total enter animation budget in ms */
  enterDurationMs: number;
  /** Scales stagger delays between grid / campaigns / metrics */
  staggerScale: number;
  /** Motion enter transition (spring or cubic-bezier tween). */
  enterTransition?: Transition;
  /** Changes when motion settings change — replays enter animations. */
  motionReplayKey: string;

  // Computed helpers
  getColor: (index: number) => string;
  getAngle: (metricIndex: number) => number;
  getPointPosition: (
    metricIndex: number,
    value: number
  ) => { x: number; y: number };
  yScale: (value: number) => number;
}

export type RadarContextValue = RadarStableContextValue &
  RadarHoverContextValue;

const RadarStableContext = createContext<RadarStableContextValue | null>(null);
const RadarHoverContext = createContext<RadarHoverContextValue | null>(null);

export function RadarProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: RadarContextValue;
}) {
  const stable = useMemo<RadarStableContextValue>(
    () => ({
      data: value.data,
      metrics: value.metrics,
      size: value.size,
      radius: value.radius,
      levels: value.levels,
      animate: value.animate,
      enterDurationMs: value.enterDurationMs,
      staggerScale: value.staggerScale,
      enterTransition: value.enterTransition,
      motionReplayKey: value.motionReplayKey,
      getColor: value.getColor,
      getAngle: value.getAngle,
      getPointPosition: value.getPointPosition,
      yScale: value.yScale,
    }),
    [
      value.data,
      value.metrics,
      value.size,
      value.radius,
      value.levels,
      value.animate,
      value.enterDurationMs,
      value.staggerScale,
      value.enterTransition,
      value.motionReplayKey,
      value.getColor,
      value.getAngle,
      value.getPointPosition,
      value.yScale,
    ]
  );

  const hover = useMemo<RadarHoverContextValue>(
    () => ({
      hoveredIndex: value.hoveredIndex,
      setHoveredIndex: value.setHoveredIndex,
    }),
    [value.hoveredIndex, value.setHoveredIndex]
  );

  return (
    <RadarStableContext.Provider value={stable}>
      <RadarHoverContext.Provider value={hover}>
        {children}
      </RadarHoverContext.Provider>
    </RadarStableContext.Provider>
  );
}

export function useRadarStable(): RadarStableContextValue {
  const context = useContext(RadarStableContext);
  if (!context) {
    throw new Error(
      "useRadarStable must be used within a RadarProvider. " +
        "Make sure your component is wrapped in <RadarChart>."
    );
  }
  return context;
}

export function useRadarHover(): RadarHoverContextValue {
  const context = useContext(RadarHoverContext);
  if (!context) {
    throw new Error(
      "useRadarHover must be used within a RadarProvider. " +
        "Make sure your component is wrapped in <RadarChart>."
    );
  }
  return context;
}

export function useRadar(): RadarContextValue {
  return { ...useRadarStable(), ...useRadarHover() };
}

export default RadarStableContext;
