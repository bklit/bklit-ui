"use client";

import { animate, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { ChartPhase } from "./chart-phase";
import { LINE_LOADING_PULSE_EASE } from "./line-loading-timing";
import {
  domainsEqual,
  isYDomainTweenPhase,
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

function snapDomains(
  domains: Record<string, YDomain>,
  setAnimatedByAxis: (domains: Record<string, YDomain>) => void,
  animatedRef: { current: Record<string, YDomain> }
) {
  if (domainsEqual(animatedRef.current, domains)) {
    return;
  }
  setAnimatedByAxis(domains);
  animatedRef.current = domains;
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
  const skeletonRef = useRef(skeletonByAxis);
  skeletonRef.current = skeletonByAxis;
  const targetRef = useRef(targetByAxis);
  targetRef.current = targetByAxis;

  const [animatedByAxis, setAnimatedByAxis] = useState(destinationByAxis);
  const animatedRef = useRef(animatedByAxis);
  const prevPhaseRef = useRef(chartPhase);
  const onSettledRef = useRef(onSettled);
  onSettledRef.current = onSettled;

  useEffect(() => {
    animatedRef.current = animatedByAxis;
  }, [animatedByAxis]);

  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: phase-driven y-domain tween with frozen exit spacing
  useEffect(() => {
    if (prevPhaseRef.current === chartPhase) {
      return;
    }
    prevPhaseRef.current = chartPhase;

    const settle = () => {
      onSettledRef.current?.();
    };

    // Keep grid spacing frozen while the series exits the viewport.
    if (chartPhase === "exiting") {
      snapDomains(skeletonRef.current, setAnimatedByAxis, animatedRef);
      return;
    }
    if (chartPhase === "exitingReady") {
      snapDomains(targetRef.current, setAnimatedByAxis, animatedRef);
      return;
    }
    if (chartPhase === "loading") {
      snapDomains(skeletonRef.current, setAnimatedByAxis, animatedRef);
      return;
    }
    if (chartPhase === "revealing" || chartPhase === "ready") {
      snapDomains(targetRef.current, setAnimatedByAxis, animatedRef);
      return;
    }

    if (!isYDomainTweenPhase(chartPhase)) {
      return;
    }

    const destination = destinationRef.current;

    if (domainsEqual(animatedRef.current, destination)) {
      settle();
      return;
    }

    if (!enabled || reducedMotion) {
      snapDomains(destination, setAnimatedByAxis, animatedRef);
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
      snapDomains(destination, setAnimatedByAxis, animatedRef);
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
        snapDomains(destination, setAnimatedByAxis, animatedRef);
        settle();
      },
    });

    return () => control.stop();
  }, [chartPhase, durationMs, enabled, reducedMotion]);

  return animatedByAxis;
}
