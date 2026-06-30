"use client";

import { motion, useTransform } from "motion/react";
import { memo, useMemo } from "react";
import { applyHoverGrow, arcPath, transitionGeometry } from "./sunburst";
import {
  sunburstCssVars,
  useSunburstHover,
  useSunburstStable,
} from "./sunburst-context";
import { useEnterComplete } from "./use-enter-complete";
import { useMountProgress } from "./use-mount-progress";

const HOVER_DIM_TRANSITION = { duration: 0.16, ease: "easeOut" as const };

export interface SunburstSegmentProps {
  index: number;
  /** Optional color override */
  color?: string;
  /** Optional fill override (patterns/gradients) */
  fill?: string;
  /** Optional fill opacity override */
  fillOpacity?: number;
}

export const SunburstSegment = memo(function SunburstSegment({
  index,
  color: colorProp,
  fill: fillProp,
  fillOpacity: fillOpacityProp,
}: SunburstSegmentProps) {
  const {
    arcs,
    focus,
    prevFocus,
    maxDepth,
    radius,
    zoomT,
    enterTiming,
    enterTransition,
    playKey,
    skipEnterAnimation,
    growAmountForArc,
    getFill,
    getFillOpacity,
    isRelated,
    maxExpandedThickness,
    zoomTo,
  } = useSunburstStable();
  const { setHoveredArc, setHoveredArcIndex } = useSunburstHover();

  const arc = arcs[index];
  const segmentDelay =
    (arc ? enterTiming.segmentDelays.get(arc.id)?.delay : undefined) ?? 0;
  const replayId = arc?.id ?? `missing-${index}`;

  const base = useMemo(() => {
    if (!arc) {
      return null;
    }
    return transitionGeometry(arc, prevFocus, focus, maxDepth, radius, zoomT);
  }, [arc, prevFocus, focus, maxDepth, radius, zoomT]);

  const visualGeometry = useMemo(() => {
    if (!(arc && base)) {
      return null;
    }
    return applyHoverGrow(base, arc.id, growAmountForArc, maxExpandedThickness);
  }, [arc, base, growAmountForArc, maxExpandedThickness]);

  const enterProgress = useMountProgress(
    enterTransition,
    segmentDelay,
    `${playKey}-enter-${replayId}`
  );
  const enterComplete = useEnterComplete(enterProgress);
  const enterScale = useTransform(enterProgress, [0, 1], [0, 1]);
  const animatedHitPath = useTransform(enterProgress, (value) =>
    base ? (arcPath(base, value, 1) ?? "") : ""
  );
  const animatedVisualPath = useTransform(enterProgress, (value) =>
    visualGeometry ? (arcPath(visualGeometry, value, 1) ?? "") : ""
  );

  if (!arc) {
    return null;
  }

  if (!base) {
    return null;
  }

  const showStatic = skipEnterAnimation || enterComplete;

  const fullHitPath = arcPath(base, 1, 1);
  const fullVisualPath = visualGeometry ? arcPath(visualGeometry, 1, 1) : null;
  if (!(fullHitPath && fullVisualPath)) {
    return null;
  }

  const relativeDepth = arc.depth - focus.depth;
  const segmentFill = getFill(index, fillProp, colorProp);
  const fillOpacity = fillOpacityProp ?? getFillOpacity(relativeDepth);
  const related = isRelated(arc);
  const layerOpacity = related ? 1 : 0.25;

  const groupStyle = {
    cursor: arc.hasChildren ? ("pointer" as const) : ("default" as const),
    transformOrigin: "0px 0px",
  };

  const hitHandlers = {
    onClick: () => arc.hasChildren && zoomTo(arc.id),
    onPointerEnter: () => {
      setHoveredArc(arc);
      setHoveredArcIndex(index);
    },
  };

  const visualPathProps = {
    fill: segmentFill,
    fillOpacity,
    pointerEvents: "none" as const,
    stroke: sunburstCssVars.ring,
    strokeLinejoin: "round" as const,
    strokeWidth: 1,
  };

  if (showStatic) {
    return (
      <motion.g
        animate={{ opacity: layerOpacity }}
        initial={false}
        onClick={hitHandlers.onClick}
        onPointerEnter={hitHandlers.onPointerEnter}
        style={groupStyle}
        transition={{ opacity: HOVER_DIM_TRANSITION }}
      >
        <path d={fullHitPath} fill="transparent" />
        <path d={fullVisualPath} {...visualPathProps} />
      </motion.g>
    );
  }

  return (
    <motion.g
      animate={{ opacity: layerOpacity }}
      initial={false}
      onClick={hitHandlers.onClick}
      onPointerEnter={hitHandlers.onPointerEnter}
      style={{
        ...groupStyle,
        scale: enterScale,
      }}
      transition={{ opacity: HOVER_DIM_TRANSITION }}
    >
      <motion.path d={animatedHitPath} fill="transparent" />
      <motion.path d={animatedVisualPath} {...visualPathProps} />
    </motion.g>
  );
});

SunburstSegment.displayName = "SunburstSegment";
