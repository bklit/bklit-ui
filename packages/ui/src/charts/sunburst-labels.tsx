"use client";

import { motion, useTransform } from "motion/react";
import { memo } from "react";
import { DEFAULT_CHART_ENTER_TRANSITION } from "./animation";
import {
  applyHoverGrow,
  geomCentroidAngle,
  geomCentroidRadius,
  transitionGeometry,
} from "./sunburst";
import { sunburstCssVars, useSunburstStable } from "./sunburst-context";
import { useEnterComplete } from "./use-enter-complete";
import { useMountProgress } from "./use-mount-progress";

export interface SunburstLabelsProps {
  fontSize?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  className?: string;
}

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
    enterTiming,
    enterTransition,
    playKey,
    skipEnterAnimation,
    growAmountForArc,
    isRelated,
    maxExpandedThickness,
  } = useSunburstStable();

  const enterDuration =
    typeof enterTransition?.duration === "number"
      ? enterTransition.duration
      : (DEFAULT_CHART_ENTER_TRANSITION.duration as number);
  const labelsDelay = enterTiming.maxDelay + enterDuration * 0.85;

  const labelsProgress = useMountProgress(
    enterTransition,
    labelsDelay,
    `${playKey}-labels`
  );
  const labelsComplete = useEnterComplete(labelsProgress);
  const labelOpacity = useTransform(labelsProgress, [0, 1], [0, 1]);
  const showLabels = skipEnterAnimation || labelsComplete;

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
        const g = applyHoverGrow(
          base,
          arc.id,
          growAmountForArc,
          maxExpandedThickness
        );
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

        const labelStyle: React.CSSProperties = {
          fill,
          fontFamily: "inherit",
          fontSize,
          fontWeight: 600,
        };
        if (strokeWidth > 0) {
          labelStyle.paintOrder = "stroke";
          labelStyle.stroke = stroke;
          labelStyle.strokeLinejoin = "round";
          labelStyle.strokeWidth = strokeWidth;
        }

        if (showLabels) {
          return (
            <text
              dominantBaseline="middle"
              key={`label-${arc.id}`}
              pointerEvents="none"
              style={{ ...labelStyle, opacity: 1 }}
              textAnchor="middle"
              transform={`rotate(${deg} ${x} ${y})`}
              x={x}
              y={y}
            >
              {arc.name}
            </text>
          );
        }

        return (
          <motion.text
            dominantBaseline="middle"
            key={`label-${arc.id}`}
            pointerEvents="none"
            style={{ ...labelStyle, opacity: labelOpacity }}
            textAnchor="middle"
            transform={`rotate(${deg} ${x} ${y})`}
            x={x}
            y={y}
          >
            {arc.name}
          </motion.text>
        );
      })}
    </g>
  );
});

SunburstLabels.displayName = "SunburstLabels";
