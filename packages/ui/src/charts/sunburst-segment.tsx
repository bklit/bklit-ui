"use client";

import { memo } from "react";
import { arcPath, localProgress, transitionGeometry } from "./sunburst";
import {
  sunburstCssVars,
  useSunburstHover,
  useSunburstStable,
} from "./sunburst-context";

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
    t,
    delays,
    growAmountForArc,
    getFill,
    getFillOpacity,
    isRelated,
    zoomTo,
  } = useSunburstStable();
  const { setHoveredArc, setHoveredArcIndex } = useSunburstHover();

  const arc = arcs[index];
  if (!arc) {
    return null;
  }

  const base = transitionGeometry(
    arc,
    prevFocus,
    focus,
    maxDepth,
    radius,
    zoomT
  );
  if (!base) {
    return null;
  }

  const gAmt = growAmountForArc(arc.id);
  const visualGeometry =
    gAmt > 0 ? { ...base, outerR: base.outerR + gAmt } : base;

  const lp = localProgress(t, delays.get(arc.id) ?? 0);
  const reveal = lp >= 1 ? 1 : lp;
  const hitPath = arcPath(base, reveal);
  const visualPath = arcPath(visualGeometry, reveal);
  if (!(hitPath && visualPath)) {
    return null;
  }

  const relativeDepth = arc.depth - focus.depth;
  const segmentFill = getFill(index, fillProp, colorProp);
  const fillOpacity = fillOpacityProp ?? getFillOpacity(relativeDepth);
  const related = isRelated(arc);
  const segmentOpacity = lp * (related ? 1 : 0.25);

  return (
    <g
      style={{
        cursor: arc.hasChildren ? "pointer" : "default",
        opacity: segmentOpacity,
        transition: "opacity 320ms cubic-bezier(0.22, 1, 0.36, 1)",
      }}
    >
      {/* Stable hit target — ring band without hover grow (matches PieSlice pattern) */}
      {/* biome-ignore lint/a11y/noStaticElementInteractions: Sunburst segment drill-down */}
      <path
        d={hitPath}
        fill="transparent"
        onClick={() => arc.hasChildren && zoomTo(arc.id)}
        onPointerEnter={() => {
          setHoveredArc(arc);
          setHoveredArcIndex(index);
        }}
        pointerEvents="auto"
      />
      {/* Visible segment — may grow on hover; no pointer events */}
      <path
        d={visualPath}
        fill={segmentFill}
        fillOpacity={fillOpacity}
        pointerEvents="none"
        stroke={sunburstCssVars.ring}
        strokeLinejoin="round"
        strokeWidth={1}
      />
    </g>
  );
});

SunburstSegment.displayName = "SunburstSegment";
