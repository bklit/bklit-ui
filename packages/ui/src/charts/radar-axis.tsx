"use client";

import { motion } from "motion/react";
import { radarCssVars, useRadarStable } from "./radar-context";

export interface RadarAxisProps {
  /** Axis line stroke color. Default: var(--border) */
  stroke?: string;
  /** Axis line stroke opacity. Default: 0.6 */
  strokeOpacity?: number;
  /** Additional class name */
  className?: string;
}

export function RadarAxis({
  stroke = radarCssVars.border,
  strokeOpacity = 0.6,
  className = "",
}: RadarAxisProps) {
  const { metrics, radius, getAngle, animate } = useRadarStable();

  // Animation delay base
  const axisBaseDelay = 0;

  return (
    <g className={className}>
      {metrics.map((metric, i) => {
        const angle = getAngle(i);
        const targetX = radius * Math.cos(angle);
        const targetY = radius * Math.sin(angle);

        return (
          <motion.line
            animate={{ x2: targetX, y2: targetY }}
            initial={animate ? { x2: 0, y2: 0 } : { x2: targetX, y2: targetY }}
            key={`axis-${metric.key}`}
            stroke={stroke}
            strokeOpacity={strokeOpacity}
            strokeWidth={1}
            transition={{
              type: "spring",
              stiffness: 80,
              damping: 15,
              mass: 1,
              delay: animate ? axisBaseDelay + i * 0.05 : 0,
            }}
            x1={0}
            y1={0}
          />
        );
      })}
    </g>
  );
}

RadarAxis.displayName = "RadarAxis";

export default RadarAxis;
