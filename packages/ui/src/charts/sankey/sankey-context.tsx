"use client";

import type { SankeyGraph, SankeyLink, SankeyNode } from "d3-sankey";
import type { Transition } from "motion/react";
import {
  createContext,
  type Dispatch,
  type RefObject,
  type SetStateAction,
  useContext,
  useMemo,
} from "react";

export interface Margin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface SankeyNodeDatum {
  name: string;
  category?: "source" | "landing" | "outcome";
  [key: string]: unknown;
}

export interface SankeyLinkDatum {
  source: number;
  target: number;
  value: number;
  [key: string]: unknown;
}

export interface SankeyTooltipData {
  type: "node" | "link";
  nodeIndex?: number;
  linkIndex?: number;
  x: number;
  y: number;
  data: SankeyNodeDatum | SankeyLinkDatum;
}

export interface SankeyContextValue {
  // Layout data
  graph: SankeyGraph<SankeyNodeDatum, SankeyLinkDatum>;
  nodes: SankeyNode<SankeyNodeDatum, SankeyLinkDatum>[];
  links: SankeyLink<SankeyNodeDatum, SankeyLinkDatum>[];

  // Dimensions
  width: number;
  height: number;
  innerWidth: number;
  innerHeight: number;
  margin: Margin;

  // Hover state
  hoveredNodeIndex: number | null;
  hoveredLinkIndex: number | null;
  setHoveredNodeIndex: (index: number | null) => void;
  setHoveredLinkIndex: (index: number | null) => void;

  // Tooltip
  tooltipData: SankeyTooltipData | null;
  setTooltipData: Dispatch<SetStateAction<SankeyTooltipData | null>>;
  containerRef: RefObject<HTMLDivElement | null>;

  // Animation
  isLoaded: boolean;
  animationDuration: number;
  /** Motion enter transition (spring or cubic-bezier tween). */
  enterTransition?: Transition;
  /** Increments when enter animation should replay. */
  revealEpoch: number;

  // Mouse position for dynamic tooltips
  mousePos: { x: number; y: number } | null;

  // Link path generator
  createPath: (link: SankeyLink<SankeyNodeDatum, SankeyLinkDatum>) => string;
}

/** Everything except the pointer position. */
export type SankeyLayoutContextValue = Omit<SankeyContextValue, "mousePos">;

const SankeyContext = createContext<SankeyLayoutContextValue | null>(null);
const SankeyPointerContext =
  createContext<SankeyContextValue["mousePos"]>(null);

/**
 * Publishes `value` as two contexts: the pointer position (changes on every
 * mouse move) and everything else, memoized on its own fields. Links and
 * nodes read the second through {@link useSankeyLayout}, so moving the mouse
 * re-renders only the tooltip.
 */
export function SankeyProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value: SankeyContextValue;
}) {
  const layout = useMemo<SankeyLayoutContextValue>(
    () => ({
      graph: value.graph,
      nodes: value.nodes,
      links: value.links,
      width: value.width,
      height: value.height,
      innerWidth: value.innerWidth,
      innerHeight: value.innerHeight,
      margin: value.margin,
      hoveredNodeIndex: value.hoveredNodeIndex,
      hoveredLinkIndex: value.hoveredLinkIndex,
      setHoveredNodeIndex: value.setHoveredNodeIndex,
      setHoveredLinkIndex: value.setHoveredLinkIndex,
      tooltipData: value.tooltipData,
      setTooltipData: value.setTooltipData,
      containerRef: value.containerRef,
      isLoaded: value.isLoaded,
      animationDuration: value.animationDuration,
      enterTransition: value.enterTransition,
      revealEpoch: value.revealEpoch,
      createPath: value.createPath,
    }),
    [
      value.graph,
      value.nodes,
      value.links,
      value.width,
      value.height,
      value.innerWidth,
      value.innerHeight,
      value.margin,
      value.hoveredNodeIndex,
      value.hoveredLinkIndex,
      value.setHoveredNodeIndex,
      value.setHoveredLinkIndex,
      value.tooltipData,
      value.setTooltipData,
      value.containerRef,
      value.isLoaded,
      value.animationDuration,
      value.enterTransition,
      value.revealEpoch,
      value.createPath,
    ]
  );

  return (
    <SankeyContext.Provider value={layout}>
      <SankeyPointerContext.Provider value={value.mousePos}>
        {children}
      </SankeyPointerContext.Provider>
    </SankeyContext.Provider>
  );
}

/**
 * Layout, hover and tooltip state without the pointer position. Subscribers
 * skip re-renders on plain mouse moves; prefer it unless you need `mousePos`.
 */
export function useSankeyLayout(): SankeyLayoutContextValue {
  const context = useContext(SankeyContext);
  if (!context) {
    throw new Error("useSankeyLayout must be used within a SankeyProvider");
  }
  return context;
}

/** Full context including `mousePos`. Re-renders on every mouse move. */
export function useSankey(): SankeyContextValue {
  const context = useContext(SankeyContext);
  const mousePos = useContext(SankeyPointerContext);
  if (!context) {
    throw new Error("useSankey must be used within a SankeyProvider");
  }
  return { ...context, mousePos };
}

// CSS variables for sankey theming
export const sankeyCssVars = {
  background: "var(--chart-background)",
  foreground: "var(--chart-foreground)",
  nodePrimary: "var(--chart-line-primary)",
  nodeSecondary: "var(--chart-line-secondary)",
  linkColor: "var(--chart-foreground-muted, hsl(0, 0%, 50%))",
};
