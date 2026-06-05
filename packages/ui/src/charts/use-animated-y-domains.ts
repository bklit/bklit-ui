"use client";

import { animate, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ChartStatus } from "./chart-phase";
import { LINE_LOADING_PULSE_EASE } from "./line-loading-timing";
import {
  mergeYDomainRecords,
  shouldTweenYDomain,
  type YDomain,
} from "./y-domain-utils";

function resolveDestinationDomains(
  chartStatus: ChartStatus,
  skeletonByAxis: Record<string, YDomain>,
  targetByAxis: Record<string, YDomain>
): Record<string, YDomain> {
  return mergeYDomainRecords(
    chartStatus === "loading" ? skeletonByAxis : targetByAxis
  );
}

function lerpDomain(from: YDomain, to: YDomain, progress: number): YDomain {
  return [
    from[0] + (to[0] - from[0]) * progress,
    from[1] + (to[1] - from[1]) * progress,
  ];
}

export interface UseAnimatedYDomainsOptions {
  enabled: boolean;
  durationMs: number;
  chartStatus: ChartStatus;
  skeletonByAxis: Record<string, YDomain>;
  targetByAxis: Record<string, YDomain>;
}

export function useAnimatedYDomains({
  enabled,
  durationMs,
  chartStatus,
  skeletonByAxis,
  targetByAxis,
}: UseAnimatedYDomainsOptions): Record<string, YDomain> {
  const reducedMotion = useReducedMotion();
  const destinationByAxis = useMemo(
    () => resolveDestinationDomains(chartStatus, skeletonByAxis, targetByAxis),
    [chartStatus, skeletonByAxis, targetByAxis]
  );

  const [animatedByAxis, setAnimatedByAxis] = useState(destinationByAxis);
  const animatedRef = useRef(animatedByAxis);
  const skipInitialTweenRef = useRef(true);

  useEffect(() => {
    animatedRef.current = animatedByAxis;
  }, [animatedByAxis]);

  useEffect(() => {
    if (skipInitialTweenRef.current) {
      skipInitialTweenRef.current = false;
      setAnimatedByAxis(destinationByAxis);
      animatedRef.current = destinationByAxis;
      return;
    }

    if (!enabled || reducedMotion) {
      setAnimatedByAxis(destinationByAxis);
      animatedRef.current = destinationByAxis;
      return;
    }

    const axisIds = Object.keys(destinationByAxis);
    const fromSnapshot = animatedRef.current;

    let needsTween = false;
    for (const axisId of axisIds) {
      const from =
        fromSnapshot[axisId] ??
        destinationByAxis[axisId] ??
        ([0, 100] as YDomain);
      const to = destinationByAxis[axisId] ?? from;
      if (shouldTweenYDomain(from, to)) {
        needsTween = true;
        break;
      }
    }

    if (!needsTween) {
      setAnimatedByAxis(destinationByAxis);
      animatedRef.current = destinationByAxis;
      return;
    }

    const fromByAxis: Record<string, YDomain> = {};
    for (const axisId of axisIds) {
      fromByAxis[axisId] = fromSnapshot[axisId] ??
        destinationByAxis[axisId] ?? [0, 100];
    }

    const control = animate(0, 1, {
      duration: durationMs / 1000,
      ease: [...LINE_LOADING_PULSE_EASE],
      onUpdate: (progress) => {
        const next: Record<string, YDomain> = {};
        for (const axisId of axisIds) {
          const from =
            fromByAxis[axisId] ??
            destinationByAxis[axisId] ??
            ([0, 100] as YDomain);
          const to = destinationByAxis[axisId] ?? from;
          next[axisId] = shouldTweenYDomain(from, to)
            ? lerpDomain(from, to, progress)
            : to;
        }
        animatedRef.current = next;
        setAnimatedByAxis(next);
      },
    });

    return () => control.stop();
  }, [destinationByAxis, durationMs, enabled, reducedMotion]);

  return animatedByAxis;
}
