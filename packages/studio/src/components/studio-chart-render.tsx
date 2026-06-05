"use client";

import { memo, type ReactNode, useMemo } from "react";
import type { StudioFrameSize } from "@/components/studio-chart-viewport";
import type { StudioRenderContext } from "@/lib/render-context";
import type { StudioUrlState } from "@/lib/studio-parsers";
import { studioPatternChromeState } from "@/lib/studio-pattern-chrome";
import type { StudioChartConfig } from "@/lib/types";

/** Props that may change chart output — compared explicitly for pan isolation. */
interface StudioChartRenderProps {
  displayState: StudioUrlState;
  config: StudioChartConfig;
  animationKey: number;
  dataSeed: number;
  isRecording: boolean;
  motionRemountKey: string;
  committedState: StudioUrlState;
  motionCurveDragging: boolean;
  numberScrubbing: boolean;
  patternDefs: ReactNode;
  patternFillAt: (seriesIndex: number) => string | undefined;
  frame: StudioFrameSize;
}

function studioChartRenderPropsEqual(
  prev: StudioChartRenderProps,
  next: StudioChartRenderProps
): boolean {
  const frameEqual =
    prev.frame.width === next.frame.width &&
    prev.frame.height === next.frame.height;
  const sharedEqual =
    prev.config === next.config &&
    prev.animationKey === next.animationKey &&
    prev.dataSeed === next.dataSeed &&
    prev.isRecording === next.isRecording &&
    prev.motionRemountKey === next.motionRemountKey &&
    prev.committedState === next.committedState &&
    prev.motionCurveDragging === next.motionCurveDragging &&
    prev.numberScrubbing === next.numberScrubbing &&
    prev.patternDefs === next.patternDefs &&
    prev.patternFillAt === next.patternFillAt &&
    frameEqual;

  if (prev.motionCurveDragging && next.motionCurveDragging) {
    return sharedEqual;
  }

  return prev.displayState === next.displayState && sharedEqual;
}

/**
 * Memo boundary between the editor shell (camera pan, FPS counter, rulers) and
 * chart previews. Skips re-rendering when only unrelated parent state changes.
 */
export const StudioChartRender = memo(function StudioChartRender(
  props: StudioChartRenderProps
) {
  const {
    displayState,
    config,
    animationKey,
    dataSeed,
    isRecording,
    motionRemountKey,
    committedState,
    motionCurveDragging,
    numberScrubbing,
    patternDefs,
    patternFillAt,
    frame,
  } = props;

  const chromeState = useMemo(
    () =>
      studioPatternChromeState(committedState, displayState, numberScrubbing),
    [committedState, displayState, numberScrubbing]
  );

  const renderCtx = useMemo<StudioRenderContext>(
    () => ({
      animationKey,
      dataSeed,
      isRecording,
      motionRemountKey,
      committedState,
      motionCurveDragging,
      numberScrubbing,
      chromeState,
      patternDefs,
      patternFillAt,
      frame,
    }),
    [
      animationKey,
      dataSeed,
      isRecording,
      motionRemountKey,
      committedState,
      motionCurveDragging,
      numberScrubbing,
      chromeState,
      patternDefs,
      patternFillAt,
      frame,
    ]
  );

  const chartState = motionCurveDragging ? committedState : displayState;

  return config.render(chartState, renderCtx);
}, studioChartRenderPropsEqual);
