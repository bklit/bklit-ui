"use client";

import { AnimatePresence, motion } from "motion/react";
import type React from "react";
import { useState } from "react";
import { createPortal } from "react-dom";

// CSS variable references
const cssVars = {
  markerBackground: "var(--chart-marker-background)",
  markerBorder: "var(--chart-marker-border)",
  markerForeground: "var(--chart-marker-foreground)",
};

// Fan configuration
const FAN_RADIUS = 50;
const FAN_ANGLE = 160; // degrees to spread across

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
  /** Click handler - called when marker is clicked */
  onClick?: () => void;
  /** URL to navigate to when clicked (alternative to onClick) */
  href?: string;
  /** Open href in new tab. Default: false */
  target?: "_blank" | "_self";
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
  /** Reference to chart container for portal positioning */
  containerRef?: React.RefObject<HTMLDivElement | null>;
  /** Margin left offset from chart container */
  marginLeft?: number;
  /** Margin top offset from chart container */
  marginTop?: number;
  /** Delay before entrance animation starts (for staggering) */
  animationDelay?: number;
  /** Whether the marker should animate in */
  animate?: boolean;
  /** Height of the vertical guide line below the marker */
  lineHeight?: number;
  /** Whether to show the vertical guide line. Default: true */
  showLine?: boolean;
}

// Entrance animation variants
const markerEntranceVariants = {
  hidden: {
    scale: 0.85,
    opacity: 0,
    filter: "blur(2px)",
  },
  visible: {
    scale: 1,
    opacity: 1,
    filter: "blur(0px)",
  },
};

export function MarkerGroup({
  x,
  y,
  markers,
  isActive = false,
  size = 28,
  onHover,
  containerRef,
  marginLeft = 0,
  marginTop = 0,
  animationDelay = 0,
  animate = true,
  lineHeight = 0,
  showLine = true,
}: MarkerGroupProps) {
  const [isHovered, setIsHovered] = useState(false);
  const shouldFan = isHovered && markers.length > 1;
  const hasMultiple = markers.length > 1;

  // Calculate fan position for each marker
  const getCirclePosition = (index: number, total: number) => {
    const startAngle = -90 - FAN_ANGLE / 2; // Start from top-left
    const angleStep = total > 1 ? FAN_ANGLE / (total - 1) : 0;
    const angle = startAngle + index * angleStep;
    const radians = (angle * Math.PI) / 180;

    return {
      x: Math.cos(radians) * FAN_RADIUS,
      y: Math.sin(radians) * FAN_RADIUS,
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

  // Calculate absolute position for portal
  const portalX = x + marginLeft;
  const portalY = y + marginTop;

  return (
    <>
      {/* SVG anchor point - positioned group */}
      {/* biome-ignore lint/a11y/noStaticElementInteractions: Chart marker interaction */}
      <g
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ cursor: "pointer" }}
        transform={`translate(${x}, ${y})`}
      >
        {/* Animated wrapper for entrance effect */}
        <motion.g
          animate="visible"
          initial={animate ? "hidden" : "visible"}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 25,
            delay: animationDelay,
          }}
          variants={markerEntranceVariants}
        >
          {/* Invisible hit area for easier hovering */}
          <rect
            fill="transparent"
            height={size * 3}
            width={size * 2}
            x={-size}
            y={-size * 2.5}
          />

          {/* Vertical dashed guide line - responds to hover states */}
          {showLine && lineHeight > 0 && (
            <motion.line
              animate={{
                // Marker hover: 100%, Day hover (crosshair): 0%, Default: 60%
                strokeOpacity: (() => {
                  if (isHovered) {
                    return 1;
                  }
                  if (isActive) {
                    return 0;
                  }
                  return 0.6;
                })(),
              }}
              stroke={cssVars.markerBorder}
              strokeDasharray="4,4"
              strokeLinecap="round"
              strokeWidth={1}
              transition={{
                duration: 0.2,
                ease: "easeOut",
              }}
              x1={0}
              x2={0}
              y1={size / 2 + 4}
              y2={lineHeight + Math.abs(y)}
            />
          )}

          {/* Main stacked marker (always visible) */}
          <MarkerCircle
            color={markers[0]?.color}
            icon={markers[0]?.icon}
            size={size}
          />

          {/* Stack count badge when multiple */}
          <AnimatePresence>
            {hasMultiple && !shouldFan && (
              <motion.g
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                initial={{ scale: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                <circle
                  cx={size / 2 + 2}
                  cy={-size / 2 - 2}
                  fill="var(--chart-line-primary)"
                  r={9}
                />
                <text
                  dominantBaseline="central"
                  fill="white"
                  fontSize={11}
                  fontWeight={600}
                  textAnchor="middle"
                  x={size / 2 + 2}
                  y={-size / 2 - 2}
                >
                  {markers.length}
                </text>
              </motion.g>
            )}
          </AnimatePresence>
        </motion.g>
      </g>

      {/* Portal for fanned circles - escapes SVG clipping */}
      {containerRef?.current &&
        createPortal(
          // biome-ignore lint/a11y/noStaticElementInteractions: Marker hover portal
          // biome-ignore lint/a11y/noNoninteractiveElementInteractions: Marker hover portal
          <div
            className="absolute"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={{
              left: portalX,
              top: portalY,
              zIndex: 100,
              // Pointer events only when fanned to capture hover area
              pointerEvents: shouldFan ? "auto" : "none",
            }}
          >
            {/* Invisible hit area to prevent hover flickering between circles */}
            {shouldFan && (
              <div
                className="absolute rounded-full"
                style={{
                  width: FAN_RADIUS * 2 + size,
                  height: FAN_RADIUS * 2 + size,
                  left: -(FAN_RADIUS + size / 2),
                  top: -(FAN_RADIUS + size / 2),
                }}
              />
            )}

            {/* Fanned circles */}
            <AnimatePresence mode="sync">
              {shouldFan &&
                markers.map((marker, index) => {
                  const position = getCirclePosition(index, markers.length);
                  return (
                    <motion.div
                      animate={{
                        x: position.x,
                        y: position.y,
                        scale: 1,
                        opacity: 1,
                      }}
                      className="absolute"
                      exit={{ x: 0, y: 0, scale: 0, opacity: 0 }}
                      initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
                      key={`fan-${marker.date.getTime()}`}
                      style={{
                        width: size,
                        height: size,
                        left: -size / 2,
                        top: -size / 2,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 22,
                        delay: index * 0.04,
                      }}
                    >
                      <MarkerCircleHTML
                        color={marker.color}
                        href={marker.href}
                        icon={marker.icon}
                        isClickable={!!(marker.onClick || marker.href)}
                        onClick={marker.onClick}
                        size={size}
                        target={marker.target}
                      />
                    </motion.div>
                  );
                })}
            </AnimatePresence>

            {/* Center target circle (visible when fanned) */}
            <AnimatePresence>
              {shouldFan && (
                <motion.div
                  animate={{ scale: 1, opacity: 0.5 }}
                  className="absolute"
                  exit={{ scale: 0, opacity: 0 }}
                  initial={{ scale: 0, opacity: 0 }}
                  style={{
                    width: size * 0.5,
                    height: size * 0.5,
                    left: -size * 0.25,
                    top: -size * 0.25,
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                >
                  <div
                    className="h-full w-full rounded-full"
                    style={{
                      backgroundColor: cssVars.markerBorder,
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>,
          containerRef.current
        )}
    </>
  );
}

interface MarkerCircleProps {
  icon: React.ReactNode;
  size: number;
  color?: string;
  onClick?: () => void;
  href?: string;
  target?: "_blank" | "_self";
  isClickable?: boolean;
}

// SVG version for the main stacked marker
function MarkerCircle({ icon, size, color }: MarkerCircleProps) {
  return (
    <g>
      {/* Shadow */}
      <circle cx={0} cy={2} fill="black" opacity={0.15} r={size / 2} />
      {/* Background */}
      <circle
        cx={0}
        cy={0}
        fill={color || cssVars.markerBackground}
        r={size / 2}
        stroke={cssVars.markerBorder}
        strokeWidth={1.5}
      />
      {/* Icon container */}
      <foreignObject
        height={size - 8}
        width={size - 8}
        x={-size / 2 + 4}
        y={-size / 2 + 4}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: cssVars.markerForeground,
            fontSize: size * 0.5,
          }}
        >
          {icon}
        </div>
      </foreignObject>
    </g>
  );
}

// HTML version for the fanned markers (rendered via portal)
function MarkerCircleHTML({
  icon,
  size,
  color,
  onClick,
  href,
  target = "_self",
  isClickable = false,
}: MarkerCircleProps) {
  const hasAction = isClickable || onClick || href;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClick) {
      onClick();
    } else if (href) {
      if (target === "_blank") {
        window.open(href, "_blank", "noopener,noreferrer");
      } else {
        window.location.href = href;
      }
    }
  };

  return (
    <motion.div
      className={`relative flex h-full w-full items-center justify-center rounded-full shadow-lg ${
        hasAction ? "cursor-pointer" : ""
      }`}
      onClick={hasAction ? handleClick : undefined}
      style={{
        backgroundColor: color || cssVars.markerBackground,
        border: `1.5px solid ${cssVars.markerBorder}`,
        fontSize: size * 0.5,
        color: cssVars.markerForeground,
      }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      whileHover={
        hasAction
          ? {
              scale: 1.15,
              boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
            }
          : undefined
      }
      whileTap={hasAction ? { scale: 0.95 } : undefined}
    >
      {icon}
    </motion.div>
  );
}

// Tooltip content component for markers
export interface MarkerTooltipContentProps {
  markers: ChartMarker[];
}

const MAX_TOOLTIP_MARKERS = 2;

export function MarkerTooltipContent({ markers }: MarkerTooltipContentProps) {
  if (markers.length === 0) {
    return null;
  }

  const visibleMarkers = markers.slice(0, MAX_TOOLTIP_MARKERS);
  const hiddenCount = markers.length - MAX_TOOLTIP_MARKERS;

  return (
    <div className="mt-2 space-y-2 border-zinc-700/50 border-t pt-2">
      {visibleMarkers.map((marker) => {
        const isClickable = !!(marker.onClick || marker.href);
        return (
          <div className="flex items-start gap-2" key={marker.date.getTime()}>
            <div
              className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full"
              style={{
                backgroundColor: marker.color || cssVars.markerBackground,
                border: `1px solid ${cssVars.markerBorder}`,
              }}
            >
              <span
                className="text-xs"
                style={{ color: cssVars.markerForeground }}
              >
                {marker.icon}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              {marker.content ? (
                marker.content
              ) : (
                <>
                  <div className="flex items-center gap-1.5 truncate font-medium text-sm text-white">
                    {marker.title}
                    {isClickable && (
                      <span className="text-[10px] text-zinc-500">↗</span>
                    )}
                  </div>
                  {marker.description && (
                    <div className="truncate text-xs text-zinc-400">
                      {marker.description}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        );
      })}
      {/* Show overflow indicator */}
      {hiddenCount > 0 && (
        <div className="pl-7 text-xs text-zinc-500">+{hiddenCount} more...</div>
      )}
    </div>
  );
}

export default MarkerGroup;
