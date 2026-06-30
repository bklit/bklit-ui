"use client";

import type { Transition } from "motion/react";
import { animate, motion } from "motion/react";
import {
  Children,
  isValidElement,
  memo,
  type ReactElement,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { type ArcDatum, buildArcs, buildRevealDelays } from "./sunburst";
import {
  defaultSunburstColors,
  opacityForRelativeDepth,
  type SunburstContextValue,
  SunburstProvider,
} from "./sunburst-context";
import type { SunburstNode } from "./sunburst-data";

export type { ArcDatum, Focus } from "./sunburst";
export type { SunburstNode } from "./sunburst-data";

const DEFAULT_HOVER_POP = 10;

function componentDisplayName(child: ReactElement): string {
  return (
    (child.type as { displayName?: string }).displayName ||
    (child.type as { name?: string }).name ||
    ""
  );
}

function isDefsComponent(child: ReactElement): boolean {
  const name = componentDisplayName(child);
  return (
    name.includes("Gradient") ||
    name.includes("Pattern") ||
    name === "LinearGradient" ||
    name === "RadialGradient"
  );
}

function isOutsideSvgComponent(name: string): boolean {
  return name === "SunburstBreadcrumb" || name === "SunburstHint";
}

function isSunburstSegment(
  child: ReactNode
): child is ReactElement<{ index: number }> {
  return (
    isValidElement(child) && componentDisplayName(child) === "SunburstSegment"
  );
}

/** Inner rings last so parent segments win hit testing at ring boundaries. */
function sortSunburstSegments(
  segments: ReactElement<{ index: number }>[],
  arcs: ArcDatum[]
): ReactElement<{ index: number }>[] {
  return [...segments].sort((a, b) => {
    const arcA = arcs[a.props.index];
    const arcB = arcs[b.props.index];
    const depthA = arcA?.depth ?? 0;
    const depthB = arcB?.depth ?? 0;
    if (depthA !== depthB) {
      return depthB - depthA;
    }
    return (b.props.index ?? 0) - (a.props.index ?? 0);
  });
}

export interface SunburstChartProps {
  data: SunburstNode;
  size?: number;
  /** Bump to replay the initialization animation. */
  playKey?: number;
  className?: string;
  /** Controlled focus node id for drill-down. */
  focusId?: string;
  /** Called when focus changes via segment click or breadcrumb. */
  onFocusChange?: (focusId: string) => void;
  /** Controlled hover — arc index in the arcs array. */
  hoveredIndex?: number | null;
  onHoverChange?: (index: number | null) => void;
  hoverPop?: number;
  enterTransition?: Transition;
  enterStaggerScale?: number;
  children: ReactNode;
}

const SunburstChartCore = memo(function SunburstChartCore({
  data,
  size = 520,
  playKey = 0,
  className,
  focusId: focusIdProp,
  onFocusChange,
  hoveredIndex: hoveredIndexProp,
  onHoverChange,
  hoverPop = DEFAULT_HOVER_POP,
  enterTransition,
  enterStaggerScale = 1,
  children,
}: SunburstChartProps) {
  const radius = size / 2;
  const containerRef = useRef<HTMLDivElement>(null);
  const { arcs, maxDepth, focusById, rootId } = useMemo(
    () => buildArcs(data),
    [data]
  );

  const [t, setT] = useState(0);
  const [internalHoveredArc, setInternalHoveredArc] = useState<ArcDatum | null>(
    null
  );
  const [internalHoveredIndex, setInternalHoveredIndex] = useState<
    number | null
  >(null);
  const growRef = useRef<Map<string, number>>(new Map());
  const [growTick, setGrowTick] = useState(0);

  const [internalFocusId, setInternalFocusId] = useState(rootId);
  const [prevFocusId, setPrevFocusId] = useState(rootId);
  const [zoomT, setZoomT] = useState(1);

  const isFocusControlled = focusIdProp !== undefined;
  const focusId = isFocusControlled ? focusIdProp : internalFocusId;

  const isHoverControlled = hoveredIndexProp !== undefined;
  const hoveredArcIndex = isHoverControlled
    ? hoveredIndexProp
    : internalHoveredIndex;
  const hoveredArc = useMemo(() => {
    if (hoveredArcIndex != null) {
      return arcs[hoveredArcIndex] ?? null;
    }
    return internalHoveredArc;
  }, [arcs, hoveredArcIndex, internalHoveredArc]);

  const setHoveredArcIndex = useCallback(
    (index: number | null) => {
      if (isHoverControlled) {
        onHoverChange?.(index);
      } else {
        setInternalHoveredIndex(index);
        setInternalHoveredArc(index == null ? null : (arcs[index] ?? null));
      }
    },
    [arcs, isHoverControlled, onHoverChange]
  );

  const setHoveredArc = useCallback(
    (arc: ArcDatum | null) => {
      setHoveredArcIndex(arc ? arc.arcIndex : null);
    },
    [setHoveredArcIndex]
  );

  const setFocusId = useCallback(
    (nextId: string) => {
      if (isFocusControlled) {
        onFocusChange?.(nextId);
      } else {
        setInternalFocusId(nextId);
      }
    },
    [isFocusControlled, onFocusChange]
  );

  const rootFocus = focusById.get(rootId);
  const focus = focusById.get(focusId) ?? rootFocus;
  const prevFocus = focusById.get(prevFocusId) ?? focus;

  useEffect(() => {
    if (!isFocusControlled) {
      setInternalFocusId(rootId);
    }
    setPrevFocusId(rootId);
    setZoomT(1);
  }, [rootId, isFocusControlled]);

  const delays = useMemo(() => buildRevealDelays(arcs), [arcs]);

  const prefersReduced = () =>
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  // biome-ignore lint/correctness/useExhaustiveDependencies: replay on data/playKey
  useEffect(() => {
    if (prefersReduced()) {
      setT(1);
      return;
    }
    setT(0);
    const controls = animate(0, 1, {
      duration: 1.85,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: setT,
      onComplete: () => setT(1),
    });
    return () => controls.stop();
  }, [arcs, playKey]);

  const growControls = useRef<ReturnType<typeof animate> | null>(null);
  const zoomControls = useRef<ReturnType<typeof animate> | null>(null);
  const zoomGen = useRef(0);

  // biome-ignore lint/correctness/useExhaustiveDependencies: prefersReduced reads matchMedia at call time
  const zoomTo = useCallback(
    (nextId: string) => {
      if (nextId === focusId) {
        return;
      }
      setHoveredArc(null);
      growControls.current?.stop();
      growRef.current = new Map();
      setGrowTick((n) => n + 1);
      setPrevFocusId(focusId);
      setFocusId(nextId);
      zoomControls.current?.stop();
      const gen = ++zoomGen.current;
      if (prefersReduced()) {
        setZoomT(1);
        return;
      }
      setZoomT(0);
      zoomControls.current = animate(0, 1, {
        duration: 0.75,
        ease: [0.22, 1, 0.36, 1],
        onUpdate: (value) => {
          if (zoomGen.current === gen) {
            setZoomT(value);
          }
        },
        onComplete: () => {
          if (zoomGen.current === gen) {
            setZoomT(1);
            setPrevFocusId(nextId);
          }
        },
      });
    },
    [focusId, setFocusId, setHoveredArc]
  );

  const isDescendant = useCallback(
    (d: ArcDatum, ancestorId: string) =>
      d.id === ancestorId || d.id.startsWith(`${ancestorId} / `),
    []
  );

  const isRelated = useCallback(
    (d: ArcDatum) => {
      if (!hoveredArc) {
        return true;
      }
      return (
        isDescendant(d, hoveredArc.id) || hoveredArc.id.startsWith(`${d.id} / `)
      );
    },
    [hoveredArc, isDescendant]
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: grow targets from hovered subtree
  useEffect(() => {
    const targets = new Map<string, number>();
    for (const d of arcs) {
      if (hoveredArc && isDescendant(d, hoveredArc.id) && !d.hasChildren) {
        targets.set(d.id, hoverPop);
      }
    }
    const starts = new Map(growRef.current);
    const ids = new Set<string>([...starts.keys(), ...targets.keys()]);

    growControls.current?.stop();

    if (prefersReduced()) {
      growRef.current = targets;
      setGrowTick((n) => n + 1);
      return;
    }

    growControls.current = animate(0, 1, {
      duration: 0.42,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (p) => {
        const next = new Map<string, number>();
        for (const id of ids) {
          const start = starts.get(id) ?? 0;
          const target = targets.get(id) ?? 0;
          const val = start + (target - start) * p;
          if (val > 0.01) {
            next.set(id, val);
          }
        }
        growRef.current = next;
        setGrowTick((n) => n + 1);
      },
    });
    return () => growControls.current?.stop();
  }, [hoveredArc, arcs, hoverPop, isDescendant]);

  const getColor = useCallback((categoryIndex: number, nodeColor?: string) => {
    if (nodeColor) {
      return nodeColor;
    }
    return defaultSunburstColors[
      categoryIndex % defaultSunburstColors.length
    ] as string;
  }, []);

  const getFill = useCallback(
    (arcIndex: number, fillOverride?: string, colorOverride?: string) => {
      if (fillOverride) {
        return fillOverride;
      }
      const arc = arcs[arcIndex];
      if (!arc) {
        return defaultSunburstColors[0] as string;
      }
      return (
        colorOverride ?? arc.fill ?? arc.color ?? getColor(arc.categoryIndex)
      );
    },
    [arcs, getColor]
  );

  const getFillOpacity = useCallback(
    (relativeDepth: number, override?: number) =>
      override ?? opacityForRelativeDepth(relativeDepth),
    []
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: growTick forces re-read from growRef
  const growAmountForArc = useCallback(
    (arcId: string) => growRef.current.get(arcId) ?? 0,
    [growTick]
  );

  if (!(focus && prevFocus)) {
    return null;
  }

  const childArray = Children.toArray(children);
  const defsChildren = childArray.filter(
    (child): child is ReactElement =>
      isValidElement(child) && isDefsComponent(child)
  );

  const outsideChildren: ReactNode[] = [];
  const svgChildren: ReactNode[] = [];

  for (const child of childArray) {
    if (!isValidElement(child)) {
      svgChildren.push(child);
      continue;
    }
    if (isDefsComponent(child)) {
      continue;
    }
    const name = componentDisplayName(child);
    if (isOutsideSvgComponent(name)) {
      outsideChildren.push(child);
    } else {
      svgChildren.push(child);
    }
  }

  const segmentChildren = svgChildren.filter(isSunburstSegment);
  const otherSvgChildren = svgChildren.filter(
    (child) => !isSunburstSegment(child)
  );
  const orderedSegments = sortSunburstSegments(segmentChildren, arcs);
  const orderedSvgChildren = [...orderedSegments, ...otherSvgChildren];

  const providerValue: SunburstContextValue = {
    data,
    arcs,
    focusById,
    rootId,
    maxDepth,
    radius,
    size,
    focus,
    prevFocus,
    focusId,
    zoomTo,
    t,
    zoomT,
    delays,
    growAmountForArc,
    getColor,
    getFill,
    getFillOpacity,
    isRelated,
    isDescendant,
    enterTransition,
    enterStaggerScale,
    playKey,
    hoverPop,
    containerRef,
    hoveredArcIndex,
    setHoveredArcIndex,
    hoveredArc,
    setHoveredArc,
  };

  return (
    <SunburstProvider value={providerValue}>
      <div
        className={className}
        ref={containerRef}
        style={{ maxWidth: "100%", width: size }}
      >
        {outsideChildren.filter(
          (child) =>
            isValidElement(child) &&
            componentDisplayName(child) === "SunburstBreadcrumb"
        )}
        <motion.svg
          animate={{ opacity: 1, scale: 1 }}
          aria-label={`Sunburst chart of ${data.name}`}
          initial={{ opacity: 0, scale: 0.96 }}
          onPointerLeave={() => setHoveredArc(null)}
          role="img"
          style={{ display: "block", overflow: "visible" }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          viewBox={`${-radius} ${-radius} ${size} ${size}`}
          width="100%"
        >
          {defsChildren.length > 0 ? <defs>{defsChildren}</defs> : null}
          {orderedSvgChildren}
        </motion.svg>
        {outsideChildren.filter(
          (child) =>
            isValidElement(child) &&
            componentDisplayName(child) === "SunburstHint"
        )}
      </div>
    </SunburstProvider>
  );
});

export function SunburstChart(props: SunburstChartProps) {
  return <SunburstChartCore {...props} />;
}

SunburstChart.displayName = "SunburstChart";
