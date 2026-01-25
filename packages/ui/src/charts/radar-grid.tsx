"use client";

import { scaleLinear } from "@visx/scale";
import { LineRadial } from "@visx/shape";
import { motion } from "motion/react";
import { radarCssVars, useRadar } from "./radar-context";

export interface RadarGridProps {
  /** Show level value labels. Default: true */
  showLabels?: boolean;
  /** Additional class name */
  className?: string;
}

// Spring config for animations
const springConfig = {
  type: "spring" as const,
  stiffness: 100,
  damping: 15,
  mass: 1,
};

export function RadarGrid({
  showLabels = true,
  className = "",
}: RadarGridProps) {
  const { metrics, radius, levels, animate } = useRadar();

  // Generate angles for the radial lines (one per metric)
  const degrees = 360;
  const angles = [...new Array(metrics.length + 1)].map((_, i) => ({
    angle: i * (degrees / metrics.length) + degrees / metrics.length / 2,
  }));

  // Radial scale for converting degrees to radians
  const radialScale = scaleLinear<number>({
    range: [0, Math.PI * 2],
    domain: [degrees, 0],
  });

  // Grid animation delays (staggered from inside out)
  const gridBaseDelay = 0;
  const gridStagger = 0.08;

  // Label fade-in delay
  const labelDelay = gridBaseDelay + levels * gridStagger * 0.5;

  return (
    <g className={className}>
      {/* Concentric grid circles */}
      {[...new Array(levels)].map((_, i) => {
        const targetRadius = ((i + 1) * radius) / levels;
        return (
          <motion.g
            animate={{ scale: 1, opacity: 1 }}
            initial={
              animate ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }
            }
            // biome-ignore lint/suspicious/noArrayIndexKey: Static grid levels
            key={`grid-${i}`}
            style={{ transformOrigin: "0px 0px" }}
            transition={{
              ...springConfig,
              delay: animate ? gridBaseDelay + i * gridStagger : 0,
            }}
          >
            <LineRadial
              angle={(d) => radialScale(d.angle) ?? 0}
              data={angles}
              fill="none"
              radius={targetRadius}
              stroke={radarCssVars.border}
              strokeLinecap="round"
              strokeOpacity={0.6}
              strokeWidth={1}
            />
          </motion.g>
        );
      })}

      {/* Grid level labels */}
      {showLabels &&
        [...new Array(levels)].map((_, i) => (
          <motion.g
            animate={{ opacity: 1 }}
            initial={animate ? { opacity: 0 } : { opacity: 1 }}
            // biome-ignore lint/suspicious/noArrayIndexKey: Static grid levels
            key={`level-label-${i}`}
            transition={{
              duration: 0.4,
              delay: animate ? labelDelay + i * 0.06 : 0,
              ease: "easeOut",
            }}
          >
            <text
              dominantBaseline="middle"
              fill={radarCssVars.foregroundMuted}
              fontSize={9}
              textAnchor="start"
              x={4}
              y={-((i + 1) * radius) / levels}
            >
              {((i + 1) * 100) / levels}
            </text>
          </motion.g>
        ))}
    </g>
  );
}

RadarGrid.displayName = "RadarGrid";

export default RadarGrid;
