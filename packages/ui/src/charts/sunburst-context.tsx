"use client";

import type { Transition } from "motion/react";
import {
  createContext,
  type ReactNode,
  type RefObject,
  useContext,
  useMemo,
} from "react";
import type { ArcDatum, Focus, SunburstEnterTiming } from "./sunburst";
import type { SunburstNode } from "./sunburst-data";

export const sunburstCssVars = {
  background: "var(--chart-background)",
  foreground: "var(--chart-foreground)",
  foregroundMuted: "var(--chart-foreground-muted)",
  label: "var(--chart-label)",
  ring: "var(--chart-background)",
  slice1: "var(--chart-1)",
  slice2: "var(--chart-2)",
  slice3: "var(--chart-3)",
  slice4: "var(--chart-4)",
  slice5: "var(--chart-5)",
};

export const defaultSunburstColors = [
  sunburstCssVars.slice1,
  sunburstCssVars.slice2,
  sunburstCssVars.slice3,
  sunburstCssVars.slice4,
  sunburstCssVars.slice5,
];

const OPACITY_STEP = 0.15;
const OPACITY_FLOOR = 0.45;

/** Relative depth within the current focus view (1 = innermost visible ring). */
export function opacityForRelativeDepth(relativeDepth: number): number {
  if (relativeDepth <= 1) {
    return 1;
  }
  return Math.max(OPACITY_FLOOR, 1 - (relativeDepth - 1) * OPACITY_STEP);
}

export interface SunburstHoverContextValue {
  hoveredArcIndex: number | null;
  setHoveredArcIndex: (index: number | null) => void;
  hoveredArc: ArcDatum | null;
  setHoveredArc: (arc: ArcDatum | null) => void;
}

export interface SunburstStableContextValue {
  data: SunburstNode;
  arcs: ArcDatum[];
  focusById: Map<string, Focus>;
  rootId: string;
  maxDepth: number;
  radius: number;
  size: number;

  focus: Focus;
  prevFocus: Focus;
  focusId: string;
  zoomTo: (nextId: string) => void;

  zoomT: number;
  enterTiming: SunburstEnterTiming;
  skipEnterAnimation: boolean;
  growAmountForArc: (arcId: string) => number;

  getColor: (categoryIndex: number, nodeColor?: string) => string;
  getFill: (
    arcIndex: number,
    fillOverride?: string,
    colorOverride?: string
  ) => string;
  getFillOpacity: (relativeDepth: number, override?: number) => number;

  isRelated: (arc: ArcDatum) => boolean;
  isDescendant: (arc: ArcDatum, ancestorId: string) => boolean;

  enterTransition?: Transition;
  enterStaggerScale: number;
  playKey: number;
  hoverPop: number;
  maxExpandedThickness: number;

  containerRef: RefObject<HTMLDivElement | null>;
}

export type SunburstContextValue = SunburstStableContextValue &
  SunburstHoverContextValue;

const SunburstStableContext = createContext<SunburstStableContextValue | null>(
  null
);
const SunburstHoverContext = createContext<SunburstHoverContextValue | null>(
  null
);

export function SunburstProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: SunburstContextValue;
}) {
  const stable = useMemo<SunburstStableContextValue>(
    () => ({
      data: value.data,
      arcs: value.arcs,
      focusById: value.focusById,
      rootId: value.rootId,
      maxDepth: value.maxDepth,
      radius: value.radius,
      size: value.size,
      focus: value.focus,
      prevFocus: value.prevFocus,
      focusId: value.focusId,
      zoomTo: value.zoomTo,
      zoomT: value.zoomT,
      enterTiming: value.enterTiming,
      skipEnterAnimation: value.skipEnterAnimation,
      growAmountForArc: value.growAmountForArc,
      getColor: value.getColor,
      getFill: value.getFill,
      getFillOpacity: value.getFillOpacity,
      isRelated: value.isRelated,
      isDescendant: value.isDescendant,
      enterTransition: value.enterTransition,
      enterStaggerScale: value.enterStaggerScale,
      playKey: value.playKey,
      hoverPop: value.hoverPop,
      maxExpandedThickness: value.maxExpandedThickness,
      containerRef: value.containerRef,
    }),
    [
      value.data,
      value.arcs,
      value.focusById,
      value.rootId,
      value.maxDepth,
      value.radius,
      value.size,
      value.focus,
      value.prevFocus,
      value.focusId,
      value.zoomTo,
      value.zoomT,
      value.enterTiming,
      value.skipEnterAnimation,
      value.growAmountForArc,
      value.getColor,
      value.getFill,
      value.getFillOpacity,
      value.isRelated,
      value.isDescendant,
      value.enterTransition,
      value.enterStaggerScale,
      value.playKey,
      value.hoverPop,
      value.maxExpandedThickness,
      value.containerRef,
    ]
  );

  const hover = useMemo<SunburstHoverContextValue>(
    () => ({
      hoveredArcIndex: value.hoveredArcIndex,
      setHoveredArcIndex: value.setHoveredArcIndex,
      hoveredArc: value.hoveredArc,
      setHoveredArc: value.setHoveredArc,
    }),
    [
      value.hoveredArcIndex,
      value.setHoveredArcIndex,
      value.hoveredArc,
      value.setHoveredArc,
    ]
  );

  return (
    <SunburstStableContext.Provider value={stable}>
      <SunburstHoverContext.Provider value={hover}>
        {children}
      </SunburstHoverContext.Provider>
    </SunburstStableContext.Provider>
  );
}

export function useSunburstStable() {
  const ctx = useContext(SunburstStableContext);
  if (!ctx) {
    throw new Error("useSunburstStable must be used within SunburstChart");
  }
  return ctx;
}

export function useSunburstHover() {
  const ctx = useContext(SunburstHoverContext);
  if (!ctx) {
    throw new Error("useSunburstHover must be used within SunburstChart");
  }
  return ctx;
}
