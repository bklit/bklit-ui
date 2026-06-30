"use client";

import { memo } from "react";
import {
  geomCentroidAngle,
  geomCentroidRadius,
  localProgress,
  transitionGeometry,
} from "./sunburst";
import { sunburstCssVars, useSunburstStable } from "./sunburst-context";

export interface SunburstLabelsProps {
  fontSize?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  className?: string;
}

const LABEL_REVEAL_LAG = 0.18;

export const SunburstLabels = memo(function SunburstLabels({
  fontSize = 11,
  fill = sunburstCssVars.label,
  stroke = sunburstCssVars.background,
  strokeWidth = 2.5,
  className,
}: SunburstLabelsProps) {
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
    isRelated,
  } = useSunburstStable();

  return (
    <g className={className}>
      {arcs.map((arc) => {
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
        const g = gAmt > 0 ? { ...base, outerR: base.outerR + gAmt } : base;
        const angleSpan = g.a1 - g.a0;
        const r = geomCentroidRadius(g);
        if (angleSpan * r < 26 || g.outerR - g.innerR < 16) {
          return null;
        }
        if (!isRelated(arc)) {
          return null;
        }

        const mid = geomCentroidAngle(g);
        const x = Math.sin(mid) * r;
        const y = -Math.cos(mid) * r;
        let deg = (mid * 180) / Math.PI - 90;
        if (deg > 90) {
          deg -= 180;
        }
        if (deg < -90) {
          deg += 180;
        }

        const segmentDelay = delays.get(arc.id) ?? 0;
        const segmentReveal = localProgress(t, segmentDelay);
        const labelDelay = Math.min(0.98, segmentDelay + LABEL_REVEAL_LAG);
        const labelOpacity =
          segmentReveal > 0.05 ? localProgress(t, labelDelay) : 0;

        const labelStyle: React.CSSProperties = {
          fill,
          fontFamily: "inherit",
          fontSize,
          fontWeight: 600,
          opacity: labelOpacity,
        };
        if (strokeWidth > 0) {
          labelStyle.paintOrder = "stroke";
          labelStyle.stroke = stroke;
          labelStyle.strokeLinejoin = "round";
          labelStyle.strokeWidth = strokeWidth;
        }

        return (
          <text
            dominantBaseline="middle"
            key={`label-${arc.id}`}
            pointerEvents="none"
            style={labelStyle}
            textAnchor="middle"
            transform={`rotate(${deg} ${x} ${y})`}
            x={x}
            y={y}
          >
            {arc.name}
          </text>
        );
      })}
    </g>
  );
});

SunburstLabels.displayName = "SunburstLabels";
