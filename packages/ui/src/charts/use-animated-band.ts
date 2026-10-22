"use client";

import type { CurveFactory } from "d3-shape";
import { animate, useReducedMotion } from "motion/react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  type BandSegment,
  bandDataSignature,
  computeBandSegments,
  flattenBandEdges,
  interpolateBandSegments,
  morphBandSegments,
} from "./band-geometry";
import { LINE_LOADING_PULSE_EASE } from "./line-loading-timing";

export interface UseAnimatedBandOptions {
  renderData: Record<string, unknown>[];
  xAccessor: (datum: Record<string, unknown>) => Date;
  xScale: (value: Date) => number | undefined;
  yScale: (value: number) => number | undefined;
  upperKey: string;
  lowerKey: string;
  curve: CurveFactory;
  chartPhase: string;
  durationMs: number;
  innerWidth: number;
  enabled: boolean;
}

/** Band currently on screen. `polyline` frames render with `curveLinear`. */
export interface DisplayedBand {
  segments: BandSegment[];
  polyline: boolean;
}

type LatestBandInputs = Pick<
  UseAnimatedBandOptions,
  | "renderData"
  | "xAccessor"
  | "xScale"
  | "yScale"
  | "upperKey"
  | "lowerKey"
  | "curve"
>;

function segmentsFor(inputs: LatestBandInputs): BandSegment[] {
  return computeBandSegments(
    inputs.renderData,
    inputs.xAccessor,
    inputs.xScale,
    inputs.yScale,
    inputs.upperKey,
    inputs.lowerKey
  );
}

/**
 * Band counterpart of `useAnimatedSeriesPath`: same trigger signatures,
 * duration (`yDomainTweenDuration`), easing and morph-vs-slide rule, so a
 * band tweens frame-for-frame with the `<Line>`s it is composed with.
 */
export function useAnimatedBand({
  renderData,
  xAccessor,
  xScale,
  yScale,
  upperKey,
  lowerKey,
  curve,
  chartPhase,
  durationMs,
  innerWidth,
  enabled,
}: UseAnimatedBandOptions): DisplayedBand {
  const reducedMotion = useReducedMotion();
  const [animatedBand, setAnimatedBand] = useState<DisplayedBand | null>(null);
  const displayedRef = useRef<DisplayedBand | null>(null);
  const animatingRef = useRef(false);

  const xScaleDomain = useMemo(() => {
    const scaleWithDomain = xScale as { domain?: () => [Date, Date] };
    return scaleWithDomain.domain?.() ?? [new Date(0), new Date(0)];
  }, [xScale]);

  const dataSignature = useMemo(
    () => bandDataSignature(renderData, xAccessor, upperKey, lowerKey),
    [renderData, xAccessor, upperKey, lowerKey]
  );

  const transitionSignature = `${innerWidth}|${xScaleDomain[0]?.getTime?.() ?? 0}|${xScaleDomain[1]?.getTime?.() ?? 0}|${dataSignature}`;

  const targetSegments = useMemo(
    () =>
      segmentsFor({
        curve,
        lowerKey,
        renderData,
        upperKey,
        xAccessor,
        xScale,
        yScale,
      }),
    [renderData, xAccessor, xScale, yScale, upperKey, lowerKey, curve]
  );

  const prevTransitionSignatureRef = useRef(transitionSignature);
  const prevDataSignatureRef = useRef(dataSignature);

  // Live inputs for the running tween — the y-domain tween rebuilds `yScale`
  // every frame, so these must not be effect deps (see useAnimatedSeriesPath).
  const latestRef = useRef<LatestBandInputs>({
    renderData,
    xAccessor,
    xScale,
    yScale,
    upperKey,
    lowerKey,
    curve,
  });
  // Synced in a layout effect declared before the tween effect (not during
  // render) so `renderFrame(0)` and every animation frame see this commit's
  // inputs.
  useLayoutEffect(() => {
    latestRef.current = {
      renderData,
      xAccessor,
      xScale,
      yScale,
      upperKey,
      lowerKey,
      curve,
    };
  });

  const shouldAnimate =
    enabled &&
    !reducedMotion &&
    chartPhase === "ready" &&
    durationMs > 0 &&
    renderData.length > 0;

  // Drop a stale tween frame as soon as animation is no longer allowed —
  // adjusted during render rather than via setState in the effect below.
  if (!shouldAnimate && animatedBand !== null) {
    setAnimatedBand(null);
  }

  // Scales / targets are read live via latestRef: only a new signature should
  // restart the tween (a dep on per-frame `yScale` would stop it each frame).
  useLayoutEffect(() => {
    const computeLatestTarget = () => segmentsFor(latestRef.current);

    const dataChanged = prevDataSignatureRef.current !== dataSignature;
    prevDataSignatureRef.current = dataSignature;

    if (!shouldAnimate) {
      animatingRef.current = false;
      displayedRef.current = {
        segments: computeLatestTarget(),
        polyline: false,
      };
      prevTransitionSignatureRef.current = transitionSignature;
      return;
    }

    if (prevTransitionSignatureRef.current === transitionSignature) {
      return;
    }
    prevTransitionSignatureRef.current = transitionSignature;

    const from = displayedRef.current ?? {
      segments: computeLatestTarget(),
      polyline: false,
    };
    if (from.segments.length === 0) {
      displayedRef.current = {
        segments: computeLatestTarget(),
        polyline: false,
      };
      return;
    }

    animatingRef.current = true;
    const morph = dataChanged || from.polyline;
    const fromPolylines = morph
      ? flattenBandEdges(from.segments, latestRef.current.curve, from.polyline)
      : null;

    const renderFrame = (progress: number) => {
      const currentTarget = computeLatestTarget();
      const next: DisplayedBand = fromPolylines
        ? {
            segments: morphBandSegments(
              fromPolylines,
              currentTarget,
              latestRef.current.curve,
              progress
            ),
            polyline: true,
          }
        : {
            segments: interpolateBandSegments(
              from.segments,
              currentTarget,
              progress
            ),
            polyline: false,
          };
      displayedRef.current = next;
      setAnimatedBand(next);
    };
    renderFrame(0);

    const control = animate(0, 1, {
      duration: durationMs / 1000,
      ease: [...LINE_LOADING_PULSE_EASE],
      onUpdate: renderFrame,
      onComplete: () => {
        animatingRef.current = false;
        displayedRef.current = {
          segments: computeLatestTarget(),
          polyline: false,
        };
        setAnimatedBand(null);
      },
    });

    return () => {
      control.stop();
      animatingRef.current = false;
    };
  }, [
    transitionSignature,
    dataSignature,
    shouldAnimate,
    chartPhase,
    durationMs,
    enabled,
    reducedMotion,
    renderData.length,
  ]);

  // After the tween effect: a data change needs the previously displayed
  // segments as its `from`, not the new target.
  useEffect(() => {
    if (!animatingRef.current) {
      displayedRef.current = { segments: targetSegments, polyline: false };
    }
  }, [targetSegments]);

  return animatedBand ?? { segments: targetSegments, polyline: false };
}
