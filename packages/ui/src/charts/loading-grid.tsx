"use client";

import { GridRows } from "@visx/grid";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
import { useEffect, useId } from "react";
import { useChartStable, useYScale } from "./chart-context";
import {
  LINE_LOADING_LOOP_PAUSE_MS,
  LINE_LOADING_PULSE_CYCLE_S,
  LINE_LOADING_PULSE_EASE,
} from "./line-loading-timing";

const DEFAULT_SHIMMER_LENGTH_PX = 140;
const DEFAULT_SHIMMER_SPEED = 1;
const DEFAULT_GRID_STROKE =
  "color-mix(in oklch, var(--chart-grid) 50%, transparent)";
const DEFAULT_SHIMMER_STROKE =
  "color-mix(in oklch, var(--foreground) 68%, transparent)";

export interface LoadingGridProps {
  /** Number of horizontal grid lines. Default: 5 */
  numTicksRows?: number;
  /** Grid line stroke (color and opacity via color-mix or oklch alpha). */
  stroke?: string;
  /** Grid line stroke width. Default: 1 */
  strokeWidth?: number;
  /** Grid line dash array. Default: "4,4" */
  strokeDasharray?: string;
  /** Shimmer band stroke (color and opacity via color-mix or oklch alpha). */
  shimmerStroke?: string;
  /** Animate a shimmer band across grid lines. Default: true */
  shimmer?: boolean;
  /** Shimmer band width in pixels. Default: 140 */
  shimmerLength?: number;
  /** Shimmer speed multiplier (higher = faster). Default: 1 */
  shimmerSpeed?: number;
  /** Match loop timing to `LineLoadingPulse` (cycle + inter-loop pause). */
  shimmerSync?: boolean;
}

export function LoadingGrid({
  numTicksRows = 5,
  stroke = DEFAULT_GRID_STROKE,
  strokeWidth = 1,
  strokeDasharray = "4,4",
  shimmerStroke = DEFAULT_SHIMMER_STROKE,
  shimmer = true,
  shimmerLength = DEFAULT_SHIMMER_LENGTH_PX,
  shimmerSpeed = DEFAULT_SHIMMER_SPEED,
  shimmerSync = false,
}: LoadingGridProps) {
  const { innerWidth, innerHeight } = useChartStable();
  const yScale = useYScale();
  const uniqueId = useId();
  const hMaskId = `loading-grid-fade-${uniqueId}`;
  const hGradientId = `${hMaskId}-gradient`;
  const shimmerGradientId = `loading-grid-shimmer-${uniqueId}`;

  const progress = useMotionValue(0);
  const reducedMotion = useReducedMotion();
  const shimmerCycleS =
    LINE_LOADING_PULSE_CYCLE_S / Math.max(shimmerSpeed, 0.1);
  const shimmerEnabled = shimmer && reducedMotion !== true && innerWidth > 0;

  useEffect(() => {
    if (!shimmerEnabled) {
      return;
    }

    let cancelled = false;
    let timeoutId: number | undefined;
    let controls: ReturnType<typeof animate> | undefined;

    const runSyncedCycle = () => {
      if (cancelled) {
        return;
      }

      progress.set(0);
      controls = animate(progress, 1, {
        duration: shimmerCycleS,
        ease: [...LINE_LOADING_PULSE_EASE],
        onComplete: () => {
          if (cancelled) {
            return;
          }
          timeoutId = window.setTimeout(
            runSyncedCycle,
            LINE_LOADING_LOOP_PAUSE_MS
          );
        },
      });
    };

    if (shimmerSync) {
      runSyncedCycle();
      return () => {
        cancelled = true;
        controls?.stop();
        if (timeoutId !== undefined) {
          window.clearTimeout(timeoutId);
        }
      };
    }

    progress.set(0);
    controls = animate(progress, 1, {
      duration: shimmerCycleS,
      repeat: Number.POSITIVE_INFINITY,
      ease: [...LINE_LOADING_PULSE_EASE],
    });

    return () => controls?.stop();
  }, [progress, shimmerCycleS, shimmerEnabled, shimmerSync]);

  const shimmerX = useTransform(
    progress,
    (value) => -shimmerLength + value * (innerWidth + shimmerLength * 2)
  );
  const shimmerTransform = useTransform(shimmerX, (x) => `translate(${x}, 0)`);

  return (
    <g className="chart-grid chart-loading-grid">
      <defs>
        <linearGradient id={hGradientId} x1="0%" x2="100%" y1="0%" y2="0%">
          <stop offset="0%" style={{ stopColor: "white", stopOpacity: 0 }} />
          <stop offset="10%" style={{ stopColor: "white", stopOpacity: 1 }} />
          <stop offset="90%" style={{ stopColor: "white", stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: "white", stopOpacity: 0 }} />
        </linearGradient>
        <mask id={hMaskId}>
          <rect
            fill={`url(#${hGradientId})`}
            height={innerHeight}
            width={innerWidth}
            x="0"
            y="0"
          />
        </mask>
        {shimmerEnabled ? (
          <motion.linearGradient
            gradientTransform={shimmerTransform}
            gradientUnits="userSpaceOnUse"
            id={shimmerGradientId}
            x1={0}
            x2={shimmerLength}
            y1={0}
            y2={0}
          >
            <stop offset="0%" stopColor={shimmerStroke} stopOpacity={0} />
            <stop offset="35%" stopColor={shimmerStroke} stopOpacity={0.45} />
            <stop offset="50%" stopColor={shimmerStroke} stopOpacity={1} />
            <stop offset="65%" stopColor={shimmerStroke} stopOpacity={0.45} />
            <stop offset="100%" stopColor={shimmerStroke} stopOpacity={0} />
          </motion.linearGradient>
        ) : null}
      </defs>

      <g mask={`url(#${hMaskId})`}>
        <GridRows
          numTicks={numTicksRows}
          scale={yScale}
          stroke={stroke}
          strokeDasharray={strokeDasharray}
          strokeOpacity={1}
          strokeWidth={strokeWidth}
          width={innerWidth}
        />
        {shimmerEnabled ? (
          <GridRows
            numTicks={numTicksRows}
            scale={yScale}
            stroke={`url(#${shimmerGradientId})`}
            strokeDasharray={strokeDasharray}
            strokeOpacity={1}
            strokeWidth={strokeWidth}
            width={innerWidth}
          />
        ) : null}
      </g>
    </g>
  );
}

LoadingGrid.displayName = "LoadingGrid";

export default LoadingGrid;
