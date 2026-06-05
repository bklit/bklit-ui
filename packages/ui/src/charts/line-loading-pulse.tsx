"use client";

import { curveNatural } from "@visx/curve";
import { LinePath } from "@visx/shape";
import { animate, motion, useMotionValue, useTransform } from "motion/react";
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { chartCssVars, useChartStable, useYScale } from "./chart-context";
import type { ChartPhase } from "./chart-phase";
import { fadeGradientStops, resolveFadeSides } from "./fade-edges";
import {
  LINE_LOADING_PULSE_CYCLE_S,
  LINE_LOADING_PULSE_EASE,
} from "./line-loading-timing";

const CLIP_PADDING = 10;

export type LineLoadingPulseMode = "loop" | "exit" | "enter";

export function resolveLineLoadingPulseMode(
  phase: ChartPhase
): LineLoadingPulseMode | null {
  switch (phase) {
    case "loading":
      return "loop";
    case "exiting":
      return "exit";
    case "revealingLoading":
      return "enter";
    default:
      return null;
  }
}

interface PathMetrics {
  pathD: string | null;
  pathLength: number;
}

export interface LineLoadingPulseStrokeProps {
  pathD: string;
  mode?: LineLoadingPulseMode;
  stroke?: string;
  /** Stroke opacity for the animated segment. Default: 0.5 */
  strokeOpacity?: number;
  strokeWidth?: number;
  onCycleComplete?: () => void;
}

function useGrowExitClip(
  innerWidth: number,
  mode: LineLoadingPulseMode,
  onComplete?: () => void
) {
  const progress = useMotionValue(mode === "exit" ? 0.5 : 0);
  const paddedFullWidth = innerWidth + CLIP_PADDING * 2;
  const rightEdge = innerWidth + CLIP_PADDING;

  const clipWidth = useTransform(progress, (p) => {
    if (p <= 0.5) {
      return (p / 0.5) * paddedFullWidth;
    }
    const shrink = (p - 0.5) / 0.5;
    return (1 - shrink) * paddedFullWidth;
  });

  const clipX = useTransform(progress, (p) => {
    if (p <= 0.5) {
      return -CLIP_PADDING;
    }
    const shrink = (p - 0.5) / 0.5;
    return rightEdge - (1 - shrink) * paddedFullWidth;
  });

  useEffect(() => {
    if (innerWidth <= 0) {
      return;
    }

    const halfCycleS = LINE_LOADING_PULSE_CYCLE_S / 2;
    let from = 0;
    let to = 1;
    let duration = LINE_LOADING_PULSE_CYCLE_S;

    if (mode === "exit") {
      from = 0.5;
      to = 1;
      duration = halfCycleS;
    } else if (mode === "enter") {
      from = 0;
      to = 0.5;
      duration = halfCycleS;
    }

    progress.set(from);
    const controls = animate(progress, to, {
      duration,
      ease: [...LINE_LOADING_PULSE_EASE],
      onComplete: () => onComplete?.(),
    });

    return () => controls.stop();
  }, [innerWidth, mode, onComplete, progress]);

  return { clipX, clipWidth };
}

export function LineLoadingPulseStroke({
  pathD,
  mode = "loop",
  stroke = chartCssVars.foreground,
  strokeOpacity = 0.5,
  strokeWidth = 2.5,
  onCycleComplete,
}: LineLoadingPulseStrokeProps) {
  const { innerWidth, innerHeight } = useChartStable();
  const reactId = useId();
  const clipPathId = `line-loading-clip-${reactId}`;
  const gradientId = `line-loading-gradient-${reactId}`;
  const fadeStops = fadeGradientStops(resolveFadeSides(true));
  const clipHeight = innerHeight + CLIP_PADDING * 2;
  const { clipX, clipWidth } = useGrowExitClip(
    innerWidth,
    mode,
    onCycleComplete
  );

  if (innerWidth <= 0) {
    return null;
  }

  return (
    <>
      <defs>
        <clipPath id={clipPathId}>
          <motion.rect
            height={clipHeight}
            style={{ width: clipWidth, x: clipX }}
            y={-CLIP_PADDING}
          />
        </clipPath>
        <linearGradient id={gradientId} x1="0%" x2="100%" y1="0%" y2="0%">
          {fadeStops.map((stop) => (
            <stop
              key={stop.offset}
              offset={stop.offset}
              stopColor={stroke}
              stopOpacity={stop.opacity}
            />
          ))}
        </linearGradient>
      </defs>
      <path
        clipPath={`url(#${clipPathId})`}
        d={pathD}
        fill="none"
        opacity={strokeOpacity}
        stroke={`url(#${gradientId})`}
        strokeLinecap="round"
        strokeWidth={strokeWidth}
      />
    </>
  );
}

export interface LineLoadingPulseProps {
  dataKey: string;
  mode?: LineLoadingPulseMode;
  stroke?: string;
  /** Stroke opacity for the animated segment. Default: 0.5 */
  strokeOpacity?: number;
  strokeWidth?: number;
  onCycleComplete?: () => void;
}

/** Standalone loading pulse — prefer `<Line loadingStroke={…} />` on unified charts. */
export function LineLoadingPulse({
  dataKey,
  mode = "loop",
  stroke = chartCssVars.foreground,
  strokeOpacity = 0.5,
  strokeWidth = 2.5,
  onCycleComplete,
}: LineLoadingPulseProps) {
  const { renderData, xScale, xAccessor, innerWidth, innerHeight } =
    useChartStable();
  const yScale = useYScale();
  const pathRef = useRef<SVGPathElement>(null);
  const [pathMetrics, setPathMetrics] = useState<PathMetrics>({
    pathD: null,
    pathLength: 0,
  });

  const getY = useCallback(
    (d: Record<string, unknown>) => {
      const value = d[dataKey];
      return typeof value === "number" ? (yScale(value) ?? 0) : 0;
    },
    [dataKey, yScale]
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: remeasure path when chart layout or data changes
  useLayoutEffect(() => {
    const path = pathRef.current;
    if (!path) {
      return;
    }

    const pathD = path.getAttribute("d");
    const pathLength = pathD ? path.getTotalLength() : 0;
    setPathMetrics((current) =>
      current.pathD === pathD && current.pathLength === pathLength
        ? current
        : { pathD, pathLength }
    );
  }, [innerHeight, innerWidth, renderData]);

  return (
    <>
      <LinePath
        curve={curveNatural}
        data={renderData}
        innerRef={pathRef}
        stroke="transparent"
        strokeLinecap="round"
        strokeWidth={strokeWidth}
        x={(d) => xScale(xAccessor(d)) ?? 0}
        y={getY}
      />
      {pathMetrics.pathD && pathMetrics.pathLength > 0 && innerWidth > 0 ? (
        <LineLoadingPulseStroke
          mode={mode}
          onCycleComplete={onCycleComplete}
          pathD={pathMetrics.pathD}
          stroke={stroke}
          strokeOpacity={strokeOpacity}
          strokeWidth={strokeWidth}
        />
      ) : null}
    </>
  );
}

LineLoadingPulse.displayName = "LineLoadingPulse";
LineLoadingPulseStroke.displayName = "LineLoadingPulseStroke";

export default LineLoadingPulse;
