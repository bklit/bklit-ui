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
import { fadeGradientStops, resolveFadeSides } from "./fade-edges";
import {
  LINE_LOADING_PULSE_CYCLE_S,
  LINE_LOADING_PULSE_EASE,
} from "./line-loading-timing";

const CLIP_PADDING = 10;

interface PathMetrics {
  pathD: string | null;
  pathLength: number;
}

export interface LineLoadingPulseProps {
  dataKey: string;
  stroke?: string;
  /** Stroke opacity for the animated segment. Default: 0.5 */
  strokeOpacity?: number;
  strokeWidth?: number;
  onCycleComplete?: () => void;
}

function useGrowExitClip(innerWidth: number, onCycleComplete?: () => void) {
  const progress = useMotionValue(0);
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

    progress.set(0);
    const controls = animate(progress, 1, {
      duration: LINE_LOADING_PULSE_CYCLE_S,
      ease: [...LINE_LOADING_PULSE_EASE],
      onComplete: () => onCycleComplete?.(),
    });

    return () => controls.stop();
  }, [innerWidth, onCycleComplete, progress]);

  return { clipX, clipWidth };
}

function LoadingGrowStroke({
  pathD,
  clipPathId,
  gradientId,
  innerHeight,
  innerWidth,
  onCycleComplete,
  stroke,
  strokeOpacity,
  strokeWidth,
}: {
  pathD: string;
  clipPathId: string;
  gradientId: string;
  innerHeight: number;
  innerWidth: number;
  onCycleComplete?: () => void;
  stroke: string;
  strokeOpacity: number;
  strokeWidth: number;
}) {
  const fadeStops = fadeGradientStops(resolveFadeSides(true));
  const clipHeight = innerHeight + CLIP_PADDING * 2;
  const { clipX, clipWidth } = useGrowExitClip(innerWidth, onCycleComplete);

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

export function LineLoadingPulse({
  dataKey,
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
  const reactId = useId();
  const clipPathId = `line-loading-clip-${reactId}`;
  const gradientId = `line-loading-gradient-${reactId}`;

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
        <LoadingGrowStroke
          clipPathId={clipPathId}
          gradientId={gradientId}
          innerHeight={innerHeight}
          innerWidth={innerWidth}
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

export default LineLoadingPulse;
