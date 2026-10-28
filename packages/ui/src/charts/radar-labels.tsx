"use client";

import { motion } from "motion/react";
import {
  GRID_ANGLE_LABEL_FADE_S,
  GRID_ANGLE_LABEL_STAGGER_S,
  GRID_SPOKE_SPRING,
  gridLabelDelay,
} from "./animation";
import { radarCssVars, useRadarStable } from "./radar-context";

export interface RadarLabelsProps {
  /** Distance from the chart edge. Default: 24 */
  offset?: number;
  /** Font size for labels. Default: 11 */
  fontSize?: number;
  /** Enable interactive hover on labels. Default: false */
  interactive?: boolean;
  /** Additional class name */
  className?: string;
}

export function RadarLabels({
  offset = 24,
  fontSize = 11,
  interactive = false,
  className = "",
}: RadarLabelsProps) {
  const { metrics, radius, levels, getAngle, animate } = useRadarStable();

  // Label animation delay (starts after grid begins)
  const labelDelay = gridLabelDelay(levels);

  const labelRadius = radius + offset;

  return (
    <g className={className}>
      {metrics.map((metric, i) => {
        const angle = getAngle(i);
        const x = labelRadius * Math.cos(angle);
        const y = labelRadius * Math.sin(angle);

        return (
          <motion.g
            animate={{ opacity: 1, x, y }}
            initial={
              animate ? { opacity: 0, x: 0, y: 0 } : { opacity: 1, x, y }
            }
            key={`label-${metric.key}`}
            transition={{
              opacity: {
                duration: GRID_ANGLE_LABEL_FADE_S,
                delay: animate
                  ? labelDelay + i * GRID_ANGLE_LABEL_STAGGER_S
                  : 0,
              },
              x: GRID_SPOKE_SPRING,
              y: GRID_SPOKE_SPRING,
            }}
          >
            <text
              className={
                interactive
                  ? "cursor-pointer transition-opacity duration-150 hover:opacity-100"
                  : ""
              }
              dominantBaseline="middle"
              fontSize={fontSize}
              fontWeight={500}
              opacity={interactive ? 0.8 : 1}
              style={{ fill: radarCssVars.label }}
              textAnchor="middle"
              x={0}
              y={0}
            >
              {metric.label}
            </text>
          </motion.g>
        );
      })}
    </g>
  );
}

RadarLabels.displayName = "RadarLabels";

export default RadarLabels;
