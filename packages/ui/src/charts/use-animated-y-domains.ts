"use client";

import { animate, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { ChartPhase } from "./chart-phase";
import { LINE_LOADING_PULSE_EASE } from "./line-loading-timing";
import {
  domainsEqual,
  resolveAnimatedYDestinationDomains,
  shouldTweenYDomain,
  type YDomain,
} from "./y-domain-utils";

function lerpDomain(from: YDomain, to: YDomain, progress: number): YDomain {
  return [
    from[0] + (to[0] - from[0]) * progress,
    from[1] + (to[1] - from[1]) * progress,
  ];
}

export interface UseAnimatedYDomainsOptions {
  enabled: boolean;
  durationMs: number;
  chartPhase: ChartPhase;
  skeletonByAxis: Record<string, YDomain>;
  targetByAxis: Record<string, YDomain>;
  onSettled?: () => void;
}

export function useAnimatedYDomains({
  enabled,
  durationMs,
  chartPhase,
  skeletonByAxis,
  targetByAxis,
  onSettled,
}: UseAnimatedYDomainsOptions): Record<string, YDomain> {
  const reducedMotion = useReducedMotion();
  const destinationByAxis = resolveAnimatedYDestinationDomains(
    chartPhase,
    skeletonByAxis,
    targetByAxis
  );
  const destinationRef = useRef(destinationByAxis);
  destinationRef.current = destinationByAxis;

  const [animatedByAxis, setAnimatedByAxis] = useState(destinationByAxis);
  const animatedRef = useRef(animatedByAxis);
  const prevPhaseRef = useRef(chartPhase);
  const onSettledRef = useRef(onSettled);
  onSettledRef.current = onSettled;

  useEffect(() => {
    animatedRef.current = animatedByAxis;
  }, [animatedByAxis]);

  useEffect(() => {
    const destination = destinationRef.current;

    if (
      prevPhaseRef.current === chartPhase &&
      domainsEqual(animatedRef.current, destination)
    ) {
      return;
    }
    prevPhaseRef.current = chartPhase;

    const settle = () => {
      onSettledRef.current?.();
    };

    if (domainsEqual(animatedRef.current, destination)) {
      settle();
      return;
    }

    if (!enabled || reducedMotion) {
      setAnimatedByAxis(destination);
      animatedRef.current = destination;
      settle();
      return;
    }

    const axisIds = Object.keys(destination);
    const fromSnapshot = animatedRef.current;

    let needsTween = false;
    for (const axisId of axisIds) {
      const from =
        fromSnapshot[axisId] ?? destination[axisId] ?? ([0, 100] as YDomain);
      const to = destination[axisId] ?? from;
      if (shouldTweenYDomain(from, to)) {
        needsTween = true;
        break;
      }
    }

    if (!needsTween) {
      setAnimatedByAxis(destination);
      animatedRef.current = destination;
      settle();
      return;
    }

    const fromByAxis: Record<string, YDomain> = {};
    for (const axisId of axisIds) {
      fromByAxis[axisId] = fromSnapshot[axisId] ??
        destination[axisId] ?? [0, 100];
    }

    const control = animate(0, 1, {
      duration: durationMs / 1000,
      ease: [...LINE_LOADING_PULSE_EASE],
      onUpdate: (progress) => {
        const next: Record<string, YDomain> = {};
        for (const axisId of axisIds) {
          const from =
            fromByAxis[axisId] ?? destination[axisId] ?? ([0, 100] as YDomain);
          const to = destination[axisId] ?? from;
          next[axisId] = shouldTweenYDomain(from, to)
            ? lerpDomain(from, to, progress)
            : to;
        }
        animatedRef.current = next;
        setAnimatedByAxis(next);
      },
      onComplete: () => {
        setAnimatedByAxis(destination);
        animatedRef.current = destination;
        settle();
      },
    });

    return () => control.stop();
  }, [chartPhase, durationMs, enabled, reducedMotion]);

  return animatedByAxis;
}
