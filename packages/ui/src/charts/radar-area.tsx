"use client";

import { motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { radarCssVars, useRadar } from "./radar-context";

export interface RadarAreaProps {
  /** Index of this area in the data array */
  index: number;
  /** Optional color override */
  color?: string;
  /** Show data point circles. Default: true */
  showPoints?: boolean;
  /** Show stroke outline on the polygon. Default: true */
  showStroke?: boolean;
  /** Show glow effect on hover. Default: true */
  showGlow?: boolean;
  /** Additional class name */
  className?: string;
}

function getStrokeWidth(isHovered: boolean): number {
  return isHovered ? 3 : 2;
}

export function RadarArea({
  index,
  color: colorProp,
  showPoints = true,
  showStroke = true,
  showGlow = true,
  className = "",
}: RadarAreaProps) {
  const {
    data,
    metrics,
    levels,
    hoveredIndex,
    setHoveredIndex,
    animate,
    getColor,
    getPointPosition,
  } = useRadar();

  const areaData = data[index];

  // Track if initial animation is complete (must be before early return)
  const hasAnimated = useRef(false);
  const [animatedPositions, setAnimatedPositions] = useState<
    { x: number; y: number }[]
  >(() => metrics.map(() => ({ x: 0, y: 0 })));

  // Calculate target positions for all metrics
  const targetPositions = useMemo(() => {
    if (!areaData) {
      return metrics.map(() => ({ x: 0, y: 0 }));
    }
    return metrics.map((metric, i) => {
      const value = areaData.values[metric.key] ?? 0;
      return getPointPosition(i, value);
    });
  }, [metrics, areaData, getPointPosition]);

  // Animation delays
  const gridStagger = 0.08;
  const campaignBaseDelay = levels * gridStagger + 0.2;
  const campaignStagger = 0.15;
  const animationDelay = campaignBaseDelay + index * campaignStagger;

  // Initial expand animation (runs once on mount)
  useEffect(() => {
    if (!animate || hasAnimated.current) {
      setAnimatedPositions(targetPositions);
      return;
    }

    const metricStagger = 0.06;
    const timeouts: NodeJS.Timeout[] = [];

    // Animate each metric from center to its position with stagger
    for (let i = 0; i < metrics.length; i++) {
      const target = targetPositions[i];
      if (!target) {
        continue;
      }
      const timeout = setTimeout(
        () => {
          setAnimatedPositions((prev) => {
            const newPositions = [...prev];
            newPositions[i] = { x: target.x, y: target.y };
            return newPositions;
          });
        },
        (animationDelay + i * metricStagger) * 1000
      );
      timeouts.push(timeout);
    }

    // Mark animation complete
    const completeTimeout = setTimeout(
      () => {
        hasAnimated.current = true;
      },
      (animationDelay + metrics.length * metricStagger) * 1000 + 500
    );
    timeouts.push(completeTimeout);

    return () => timeouts.forEach(clearTimeout);
  }, [animate, animationDelay, metrics.length, targetPositions]);

  // After initialization, update positions immediately when data changes
  useEffect(() => {
    if (hasAnimated.current) {
      setAnimatedPositions(targetPositions);
    }
  }, [targetPositions]);

  // Early return after all hooks
  if (!areaData) {
    return null;
  }

  const color = colorProp || getColor(index);
  const isHovered = hoveredIndex === index;
  const isOtherHovered = hoveredIndex !== null && hoveredIndex !== index;

  // Create path from positions
  const pathD = `M ${animatedPositions.map((p) => `${p.x},${p.y}`).join(" L ")} Z`;

  return (
    <motion.g
      animate={{
        opacity: isOtherHovered ? 0.3 : 1,
        scale: isHovered ? 1.05 : 1,
      }}
      className={className}
      initial={{ opacity: 0 }}
      onMouseEnter={() => setHoveredIndex(index)}
      onMouseLeave={() => setHoveredIndex(null)}
      style={{ transformOrigin: "0px 0px", cursor: "pointer" }}
      transition={{
        opacity: {
          duration: 0.15,
          delay: hasAnimated.current ? 0 : animationDelay * 0.5,
        },
        scale: { type: "spring", stiffness: 400, damping: 25 },
      }}
    >
      {/* Area polygon */}
      <motion.path
        animate={{
          d: pathD,
          fillOpacity: isHovered ? 0.35 : 0.15,
          strokeWidth: showStroke ? getStrokeWidth(isHovered) : 0,
        }}
        fill={color}
        stroke={showStroke ? color : "none"}
        strokeLinejoin="round"
        style={{
          filter:
            showGlow && isHovered ? `drop-shadow(0 0 12px ${color})` : "none",
        }}
        transition={{
          d: { type: "spring", stiffness: 80, damping: 15, mass: 1 },
          fillOpacity: { duration: 0.2 },
          strokeWidth: { duration: 0.2 },
        }}
      />

      {/* Data point circles */}
      {showPoints &&
        metrics.map((metric, i) => {
          const point = animatedPositions[i];
          if (!point) {
            return null;
          }
          return (
            <motion.circle
              animate={{
                cx: point.x,
                cy: point.y,
                r: isHovered ? 6 : 4,
              }}
              fill={color}
              key={metric.key}
              stroke={radarCssVars.background}
              strokeWidth={2}
              transition={{
                cx: { type: "spring", stiffness: 80, damping: 15, mass: 1 },
                cy: { type: "spring", stiffness: 80, damping: 15, mass: 1 },
                r: { type: "spring", stiffness: 300, damping: 20 },
              }}
            />
          );
        })}
    </motion.g>
  );
}

RadarArea.displayName = "RadarArea";

export default RadarArea;
