"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";

// CSS variable references
const cssVars = {
  markerBackground: "var(--chart-marker-background)",
  markerBorder: "var(--chart-marker-border)",
  markerForeground: "var(--chart-marker-foreground)",
};

export interface ChartMarker {
  /** Date for this marker (will be matched to nearest data point) */
  date: Date;
  /** Icon to display in the marker circle */
  icon: React.ReactNode;
  /** Title shown in tooltip */
  title: string;
  /** Optional description */
  description?: string;
  /** Optional custom content for tooltip (overrides title/description) */
  content?: React.ReactNode;
  /** Optional color override for the marker circle */
  color?: string;
}

export interface MarkerGroupProps {
  /** X position in pixels */
  x: number;
  /** Y position (top of chart area) */
  y: number;
  /** Markers at this position */
  markers: ChartMarker[];
  /** Whether this marker group is currently hovered (via chart hover) */
  isActive?: boolean;
  /** Size of each marker circle */
  size?: number;
  /** Callback when marker group is hovered */
  onHover?: (markers: ChartMarker[] | null) => void;
}

// Spring config for smooth animations
const springConfig = {
  damping: 25,
  stiffness: 300,
};

export function MarkerGroup({
  x,
  y,
  markers,
  isActive = false,
  size = 24,
  onHover,
}: MarkerGroupProps) {
  const [isHovered, setIsHovered] = useState(false);
  const shouldFan = isHovered || isActive;
  const hasMultiple = markers.length > 1;

  // Calculate fan positions - spread markers in an arc when hovered
  const getFanPosition = (index: number, total: number) => {
    if (!shouldFan || total === 1) {
      // Stacked position - offset vertically
      return { x: 0, y: index * -4, rotation: 0, scale: 1 };
    }

    // Fan out in an arc above the base position
    const spreadAngle = 120; // Total arc spread in degrees
    const startAngle = -spreadAngle / 2;
    const angleStep = total > 1 ? spreadAngle / (total - 1) : 0;
    const angle = startAngle + index * angleStep;
    const radians = (angle * Math.PI) / 180;

    // Fan radius - how far markers spread from center
    const radius = size * 1.5;

    return {
      x: Math.sin(radians) * radius,
      y: -Math.cos(radians) * radius - size / 2,
      rotation: angle * 0.3, // Slight rotation for visual interest
      scale: 1.1,
    };
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    onHover?.(markers);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    onHover?.(null);
  };

  return (
    <g
      transform={`translate(${x}, ${y})`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ cursor: "pointer" }}
    >
      {/* Invisible hit area for easier hovering */}
      <rect
        x={-size}
        y={-size * 2}
        width={size * 2}
        height={size * 2.5}
        fill="transparent"
      />

      {/* Render markers - reverse order so first marker is on top when stacked */}
      {[...markers].reverse().map((marker, reverseIndex) => {
        const index = markers.length - 1 - reverseIndex;
        const pos = getFanPosition(index, markers.length);

        return (
          <motion.g
            key={`${marker.date.toISOString()}-${index}`}
            initial={false}
            animate={{
              x: pos.x,
              y: pos.y,
              rotate: pos.rotation,
              scale: pos.scale,
            }}
            transition={{
              type: "spring",
              ...springConfig,
              delay: shouldFan ? index * 0.03 : (markers.length - 1 - index) * 0.02,
            }}
          >
            <MarkerCircle
              icon={marker.icon}
              size={size}
              color={marker.color}
              isStacked={hasMultiple && !shouldFan}
              stackIndex={index}
            />
          </motion.g>
        );
      })}

      {/* Stack count badge when multiple and not fanned */}
      <AnimatePresence>
        {hasMultiple && !shouldFan && (
          <motion.g
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", ...springConfig }}
          >
            <circle
              cx={size / 2 + 2}
              cy={-size / 2 - 2}
              r={8}
              fill="var(--chart-line-primary)"
            />
            <text
              x={size / 2 + 2}
              y={-size / 2 - 2}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={10}
              fontWeight={600}
              fill="white"
            >
              {markers.length}
            </text>
          </motion.g>
        )}
      </AnimatePresence>
    </g>
  );
}

interface MarkerCircleProps {
  icon: React.ReactNode;
  size: number;
  color?: string;
  isStacked?: boolean;
  stackIndex?: number;
}

function MarkerCircle({
  icon,
  size,
  color,
  isStacked = false,
  stackIndex = 0,
}: MarkerCircleProps) {
  // Slightly different opacity for stacked markers to show depth
  const opacity = isStacked ? 1 - stackIndex * 0.15 : 1;

  return (
    <g style={{ opacity }}>
      {/* Shadow */}
      <circle
        cx={0}
        cy={2}
        r={size / 2}
        fill="black"
        opacity={0.1}
      />
      {/* Background */}
      <circle
        cx={0}
        cy={0}
        r={size / 2}
        fill={color || cssVars.markerBackground}
        stroke={cssVars.markerBorder}
        strokeWidth={1.5}
      />
      {/* Icon container - using foreignObject for HTML icons */}
      <foreignObject
        x={-size / 2 + 4}
        y={-size / 2 + 4}
        width={size - 8}
        height={size - 8}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: cssVars.markerForeground,
          }}
        >
          {icon}
        </div>
      </foreignObject>
    </g>
  );
}

// Tooltip content component for markers
export interface MarkerTooltipContentProps {
  markers: ChartMarker[];
}

export function MarkerTooltipContent({ markers }: MarkerTooltipContentProps) {
  if (markers.length === 0) return null;

  return (
    <div className="border-t border-zinc-700/50 pt-2 mt-2 space-y-2">
      {markers.map((marker, index) => (
        <div key={index} className="flex items-start gap-2">
          <div
            className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
            style={{
              backgroundColor: marker.color || cssVars.markerBackground,
              border: `1px solid ${cssVars.markerBorder}`,
            }}
          >
            <span className="text-xs" style={{ color: cssVars.markerForeground }}>
              {marker.icon}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            {marker.content ? (
              marker.content
            ) : (
              <>
                <div className="text-sm font-medium text-white truncate">
                  {marker.title}
                </div>
                {marker.description && (
                  <div className="text-xs text-zinc-400 truncate">
                    {marker.description}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default MarkerGroup;

