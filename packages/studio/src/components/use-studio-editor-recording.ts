"use client";

import { useReducedMotion } from "motion/react";
import { useCallback, useRef, useState } from "react";
import { useStudioRecording } from "@/components/use-studio-recording";
import type { StudioUrlState } from "@/lib/studio-parsers";
import {
  getRecordingCaptureDimensions,
  type StudioRecordingAspect,
  type StudioRecordingFormat,
  type StudioRecordingInteractionMs,
} from "@/lib/studio-recording";
import { useStudioAnalytics } from "@/providers/studio-analytics-context";

export function useStudioEditorRecording({
  state,
  getDisplayState,
  setFrameSize,
  onReplay,
}: {
  state: StudioUrlState;
  getDisplayState: () => StudioUrlState;
  setFrameSize: (width: number, height: number) => void;
  onReplay: () => void;
}) {
  const { track, getUrl } = useStudioAnalytics();
  const recordCaptureRef = useRef<HTMLDivElement>(null);
  const frameSizeBeforeRecording = useRef<{ w: number; h: number } | null>(
    null
  );
  const recordingPrepStartedRef = useRef(false);
  const [capturePrepared, setCapturePrepared] = useState(false);
  const [recordingChartHeld, setRecordingChartHeld] = useState(false);
  const reducedMotion = useReducedMotion();
  const {
    phase,
    isRecording,
    elapsedMs,
    timeline,
    error,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    isPaused,
    clearError,
  } = useStudioRecording();

  const replayForRecording = useCallback(() => {
    setRecordingChartHeld(false);
    onReplay();
  }, [onReplay]);

  const restorePreviewChart = useCallback(() => {
    setRecordingChartHeld(false);
    onReplay();
  }, [onReplay]);

  const handleRecordPopoverOpenChange = useCallback(
    (open: boolean) => {
      if (open) {
        setRecordingChartHeld(true);
        return;
      }
      if (recordingPrepStartedRef.current || isRecording || capturePrepared) {
        return;
      }
      restorePreviewChart();
    },
    [capturePrepared, isRecording, restorePreviewChart]
  );

  const handleStartRecording = useCallback(
    async (
      interactionMs: StudioRecordingInteractionMs,
      aspect: StudioRecordingAspect,
      format: StudioRecordingFormat
    ) => {
      const element = recordCaptureRef.current;
      if (!element) {
        return;
      }

      recordingPrepStartedRef.current = true;
      const saved = { w: state.frameW, h: state.frameH };
      const dimensions = getRecordingCaptureDimensions(
        state.frameW,
        state.frameH,
        aspect
      );

      setRecordingChartHeld(true);
      setCapturePrepared(true);

      if (aspect === "16:9") {
        frameSizeBeforeRecording.current = saved;
        setFrameSize(dimensions.frameWidth, dimensions.frameHeight);
        await new Promise<void>((resolve) => {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => resolve());
          });
        });
      } else {
        frameSizeBeforeRecording.current = null;
      }

      try {
        track?.("studio_recording_start", {
          chart: state.chart,
          format,
          aspect,
          interaction_ms: interactionMs,
          url: getUrl?.(),
        });

        await startRecording({
          element,
          width: dimensions.captureWidth,
          height: dimensions.captureHeight,
          state: getDisplayState(),
          chart: state.chart,
          replay: replayForRecording,
          interactionMs,
          format,
          onFinished: () => {
            const previous = frameSizeBeforeRecording.current;
            if (previous) {
              setFrameSize(previous.w, previous.h);
              frameSizeBeforeRecording.current = null;
            }
            setCapturePrepared(false);
            recordingPrepStartedRef.current = false;
            restorePreviewChart();
          },
        });
      } finally {
        setCapturePrepared(false);
        recordingPrepStartedRef.current = false;
      }
    },
    [
      getDisplayState,
      getUrl,
      replayForRecording,
      restorePreviewChart,
      setFrameSize,
      startRecording,
      state.chart,
      state.frameH,
      state.frameW,
      track,
    ]
  );

  const recordingBlocked = reducedMotion === true;
  const controlsDisabled = isRecording || capturePrepared || recordingChartHeld;
  const showCaptureLayout = isRecording || capturePrepared;
  const showRecordingChrome = Boolean(isRecording && timeline);

  return {
    recordCaptureRef,
    recordingBlocked,
    controlsDisabled,
    showCaptureLayout,
    showRecordingChrome,
    recordingChartHeld,
    isRecording,
    phase,
    elapsedMs,
    timeline,
    error,
    isPaused,
    clearError,
    handleRecordPopoverOpenChange,
    handleStartRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
  };
}
