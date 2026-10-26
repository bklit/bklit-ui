"use client";

import {
  AnimatePresence,
  type MotionValue,
  motion,
  useReducedMotion,
  useSpring,
} from "motion/react";
import type { RefObject } from "react";
import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { type SpringConfig, useChartConfig } from "../chart-config-context";
import { chartCssVars, useChartPortalContainer } from "../chart-context";

export interface TooltipBoxProps {
  /** X position in pixels (relative to container) */
  x: number;
  /** Y position in pixels (relative to container) */
  y: number;
  /** Whether the tooltip is visible */
  visible: boolean;
  /** Container ref for portal rendering */
  containerRef: RefObject<HTMLDivElement | null>;
  /** Container width for flip detection */
  containerWidth: number;
  /** Container height for bounds clamping */
  containerHeight: number;
  /** Offset from the target position */
  offset?: number;
  /** Custom class name */
  className?: string;
  /** Tooltip content */
  children: React.ReactNode;
  /** Override left position (bypasses internal calculation) */
  left?: number | ReturnType<typeof useSpring>;
  /** Override top position (bypasses internal calculation) */
  top?: number | ReturnType<typeof useSpring>;
  /** Force flip direction (for custom positioning) */
  flipped?: boolean;
  /**
   * X (container px) that decides which side the panel opens on. Default: `x`.
   * Nearest-point hover passes the column x so every point in a column opens
   * on the same side (no flip — and entrance replay — between nearby points).
   */
  flipX?: number;
  /** Per-chart override; falls back to `ChartConfigProvider.tooltipBoxSpring`. */
  springConfig?: SpringConfig;
  /** Animate panel position with a spring. Default: true */
  animate?: boolean;
  /** Fade/scale the panel on show. Default: true */
  entrance?: boolean;
  /**
   * Fade the panel out when `visible` turns false (via `AnimatePresence`).
   * Requires `entrance`. Keep the box mounted and toggle `visible` (rather
   * than unmounting it) so the exit can play. Default: true
   */
  exit?: boolean;
  /**
   * Replay the panel entrance when it flips sides. `false` springs the panel
   * across instead (used by nearest-point hover, where neighbouring points
   * can sit on either side of the flip line). Default: true
   */
  replayOnFlip?: boolean;
  /** Inline styles for the inner tooltip panel. */
  panelStyle?: React.CSSProperties;
  /**
   * Tooltip panel background color (CSS variable or color value).
   * Default: `var(--chart-tooltip-background)`.
   */
  backgroundColor?: string;
}

/**
 * Popover-style panel: rounded, 1px border, soft layered shadow and a 1px
 * edge highlight (`before:`) — matches shadcn / coss popovers using only theme
 * tokens (`border`, `--radius`) and Tailwind utilities.
 */
export const TOOLTIP_PANEL_CLASS_NAME =
  "relative min-w-[160px] rounded-xl border not-dark:bg-clip-padding text-chart-tooltip-foreground shadow-lg/5 before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-xl)-1px)] before:shadow-[0_1px_rgb(0_0_0/0.04)] dark:before:shadow-[0_-1px_rgb(255_255_255/0.06)]";

/** Clips content to the panel's inner radius without clipping the edge highlight. */
export const TOOLTIP_PANEL_INNER_CLASS_NAME =
  "overflow-hidden rounded-[calc(var(--radius-xl)-1px)]";

/** Spring to `value`, or jump there (no animation) when `snap`. */
function moveTo(
  spring: MotionValue<number>,
  value: number,
  snap: boolean
): void {
  if (snap) {
    spring.jump(value);
  } else {
    spring.set(value);
  }
}

const DEFAULT_TOOLTIP_WIDTH = 180;
const DEFAULT_TOOLTIP_HEIGHT = 80;

/** Panel position beside the cursor: flips left near the right edge and is
 * clamped vertically inside the container. */
function resolveTooltipTarget({
  x,
  flipX = x,
  y,
  width,
  height,
  offset,
  containerWidth,
  containerHeight,
}: {
  x: number;
  flipX?: number;
  y: number;
  width: number;
  height: number;
  offset: number;
  containerWidth: number;
  containerHeight: number;
}) {
  const flipped = flipX + width + offset > containerWidth;
  return {
    flipped,
    left: flipped ? x - offset - width : x + offset,
    top: Math.max(
      offset,
      Math.min(y - height / 2, containerHeight - height - offset)
    ),
  };
}

// Inner-only-on-visible so `useSpring` initializes at the cursor's actual x/y
// instead of (0, 0) on first hover.
export function TooltipBox(props: TooltipBoxProps) {
  const container = useChartPortalContainer(props.containerRef);
  if (!container) {
    return null;
  }
  const inner = props.visible ? (
    <TooltipBoxInner {...props} container={container} key="tooltip-box" />
  ) : null;
  if (props.exit !== false && props.entrance !== false) {
    return <AnimatePresence>{inner}</AnimatePresence>;
  }
  return inner;
}

function TooltipBoxInner({
  x,
  y,
  containerWidth,
  containerHeight,
  offset = 16,
  className = "",
  children,
  left: leftOverride,
  top: topOverride,
  flipped: flippedOverride,
  flipX,
  springConfig,
  animate = true,
  entrance = true,
  exit: _exit,
  replayOnFlip = true,
  panelStyle,
  backgroundColor = chartCssVars.tooltipBackground,
  container,
}: Omit<TooltipBoxProps, "visible" | "containerRef"> & {
  container: HTMLElement;
}) {
  const { tooltipBoxSpring } = useChartConfig();
  // Reduced motion: position jumps instead of springing and the panel skips
  // its scale/slide; opacity fades are kept.
  const reducedMotion = useReducedMotion() === true;
  const effectiveSpring = springConfig ?? tooltipBoxSpring;

  const tooltipRef = useRef<HTMLDivElement>(null);
  // Last measured panel size — only read in the layout effect below.
  const tooltipWidthRef = useRef(DEFAULT_TOOLTIP_WIDTH);
  const tooltipHeightRef = useRef(DEFAULT_TOOLTIP_HEIGHT);
  const [staticPosition, setStaticPosition] = useState({ left: x, top: y });
  // First measured position jumps (no spring from the estimated size).
  const hasPositionedRef = useRef(false);

  // Flip side + replay key for the panel entrance. Seeded from the default
  // size (the inner box mounts fresh on every show); refined from the measured
  // width in the layout effect, which only re-renders when the side changes.
  const [flip, setFlip] = useState(() => ({
    flipped: (flipX ?? x) + DEFAULT_TOOLTIP_WIDTH + offset > containerWidth,
    key: 0,
  }));
  const shouldFlipX = flip.flipped;

  const [initialTarget] = useState(() =>
    resolveTooltipTarget({
      x,
      flipX,
      y,
      width: DEFAULT_TOOLTIP_WIDTH,
      height: DEFAULT_TOOLTIP_HEIGHT,
      offset,
      containerWidth,
      containerHeight,
    })
  );
  const animatedLeft = useSpring(initialTarget.left, effectiveSpring);
  const animatedTop = useSpring(initialTarget.top, effectiveSpring);

  useLayoutEffect(() => {
    if (!tooltipRef.current) {
      return;
    }
    const el = tooltipRef.current;
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    if (w > 0) {
      tooltipWidthRef.current = w;
    }
    if (h > 0) {
      tooltipHeightRef.current = h;
    }
    const target = resolveTooltipTarget({
      x,
      flipX,
      y,
      width: tooltipWidthRef.current,
      height: tooltipHeightRef.current,
      offset,
      containerWidth,
      containerHeight,
    });
    setFlip((prev) =>
      prev.flipped === target.flipped
        ? prev
        : { flipped: target.flipped, key: prev.key + 1 }
    );
    const tx = target.left;
    const ty = target.top;
    if (!animate) {
      setStaticPosition({ left: tx, top: ty });
      return;
    }
    const snap = reducedMotion || !hasPositionedRef.current;
    hasPositionedRef.current = true;
    if (leftOverride === undefined) {
      moveTo(animatedLeft, tx, snap);
    }
    if (topOverride === undefined) {
      moveTo(animatedTop, ty, snap);
    }
  }, [
    x,
    flipX,
    y,
    containerWidth,
    containerHeight,
    offset,
    leftOverride,
    topOverride,
    animate,
    animatedLeft,
    animatedTop,
    reducedMotion,
  ]);

  const flipKey = replayOnFlip ? flip.key : 0;

  const finalLeft = animate
    ? (leftOverride ?? animatedLeft)
    : staticPosition.left;
  const finalTop = animate ? (topOverride ?? animatedTop) : staticPosition.top;
  const isFlipped = flippedOverride ?? shouldFlipX;
  const transformOrigin = isFlipped ? "right top" : "left top";

  const panelClassName = cn(
    TOOLTIP_PANEL_CLASS_NAME,
    panelStyle?.backgroundColor === undefined &&
      backgroundColor === chartCssVars.tooltipBackground &&
      "bg-chart-tooltip-background",
    panelStyle?.backdropFilter === undefined && "backdrop-blur-md"
  );
  const panelStyleResolved = {
    transformOrigin,
    ...(panelStyle?.backgroundColor === undefined && {
      backgroundColor,
    }),
    ...panelStyle,
  };

  if (!entrance) {
    return createPortal(
      <div
        className={cn("pointer-events-none absolute z-50", className)}
        ref={tooltipRef}
        style={{ left: staticPosition.left, top: staticPosition.top }}
      >
        <div className={panelClassName} style={panelStyleResolved}>
          <div className={TOOLTIP_PANEL_INNER_CLASS_NAME}>{children}</div>
        </div>
      </div>,
      container
    );
  }

  return createPortal(
    <motion.div
      animate={{ opacity: 1 }}
      className={cn("pointer-events-none absolute z-50", className)}
      exit={{ opacity: 0 }}
      initial={{ opacity: 0 }}
      ref={tooltipRef}
      style={{ left: finalLeft, top: finalTop }}
      transition={{ duration: 0.1 }}
    >
      <motion.div
        animate={{ scale: 1, opacity: 1, x: 0 }}
        className={panelClassName}
        initial={
          reducedMotion
            ? { opacity: 0 }
            : { scale: 0.85, opacity: 0, x: isFlipped ? 20 : -20 }
        }
        key={flipKey}
        style={panelStyleResolved}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        <div className={TOOLTIP_PANEL_INNER_CLASS_NAME}>{children}</div>
      </motion.div>
    </motion.div>,
    container
  );
}

TooltipBox.displayName = "TooltipBox";

export default TooltipBox;
