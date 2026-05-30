"use client";

import { useCallback, useRef, useState } from "react";
import { captureChartFrames } from "@/lib/capture-chart-frames";
import { encodeStudioRecording } from "@/lib/encode-studio-recording";
import {
  canRecordChartStream,
  recordChartStream,
} from "@/lib/record-chart-stream";
import type { StudioUrlState } from "@/lib/studio-parsers";
import {
  getStudioRecordingOutputSize,
  getStudioRecordingTimeline,
  type StudioRecordingFormat,
  type StudioRecordingInteractionMs,
  type StudioRecordingTimeline,
} from "@/lib/studio-recording";
import type { ChartSlug } from "@/lib/types";
import { useStudioAnalytics } from "@/providers/studio-analytics-context";

export type StudioRecordingPhase = "idle" | "capturing" | "encoding";

export interface StartStudioRecordingParams {
  element: HTMLElement;
  width: number;
  height: number;
  state: StudioUrlState;
  chart: ChartSlug;
  replay: () => void;
  interactionMs?: StudioRecordingInteractionMs;
  format?: StudioRecordingFormat;
  onFinished?: () => void;
}

export function useStudioRecording() {
  const { track, getUrl } = useStudioAnalytics();
  const [phase, setPhase] = useState<StudioRecordingPhase>("idle");
  const [progress, setProgress] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [timeline, setTimeline] = useState<StudioRecordingTimeline | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const isPausedRef = useRef(false);

  const isRecording = phase !== "idle";

  const stopRecording = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
  }, []);

  const pauseRecording = useCallback(() => {
    if (phase !== "capturing") {
      return;
    }
    isPausedRef.current = true;
    setIsPaused(true);
  }, [phase]);

  const resumeRecording = useCallback(() => {
    if (phase !== "capturing") {
      return;
    }
    isPausedRef.current = false;
    setIsPaused(false);
  }, [phase]);

  const startRecording = useCallback(
    async (params: StartStudioRecordingParams) => {
      const {
        element,
        width,
        height,
        state,
        chart,
        replay,
        interactionMs = 0,
        format = "webm",
        onFinished,
      } = params;

      if (phase !== "idle") {
        return;
      }

      const controller = new AbortController();
      abortRef.current = controller;
      const recordingTimeline = getStudioRecordingTimeline(state, {
        interactionMs,
      });

      setTimeline(recordingTimeline);
      setError(null);
      setProgress(0);
      setElapsedMs(0);
      isPausedRef.current = false;
      setIsPaused(false);

      const useStream = canRecordChartStream();
      const onCaptureReady = () => setPhase("capturing");

      try {
        if (useStream) {
          await recordChartStream({
            element,
            timeline: recordingTimeline,
            format,
            chartSlug: chart,
            onReplay: replay,
            onTimelineTick: setElapsedMs,
            signal: controller.signal,
            onProgress: setProgress,
            isPaused: () => isPausedRef.current,
            onCaptureReady,
            onEncodingStart: () => setPhase("encoding"),
          });
        } else {
          const frames = await captureChartFrames({
            element,
            width,
            height,
            timeline: recordingTimeline,
            onReplay: replay,
            onTimelineTick: setElapsedMs,
            signal: controller.signal,
            isPaused: () => isPausedRef.current,
            onCaptureReady,
            onProgress: (captureProgress) => {
              setProgress(captureProgress * 0.7);
            },
          });

          if (controller.signal.aborted) {
            return;
          }

          setPhase("encoding");
          setProgress(0.7);

          const outputSize = getStudioRecordingOutputSize(width, height);

          await encodeStudioRecording({
            frames,
            timeline: recordingTimeline,
            format,
            width: outputSize.width,
            height: outputSize.height,
            chartSlug: chart,
            signal: controller.signal,
            onProgress: (encodeProgress) => {
              setProgress(0.7 + encodeProgress * 0.3);
            },
          });
        }

        if (!controller.signal.aborted) {
          track?.("studio_recording_complete", {
            chart,
            format,
            method: useStream ? "stream" : "frames",
            url: getUrl?.(),
          });
        }
      } catch (caught) {
        if (caught instanceof DOMException && caught.name === "AbortError") {
          return;
        }
        const message =
          caught instanceof Error ? caught.message : "Recording failed";
        setError(message);
      } finally {
        onFinished?.();
        abortRef.current = null;
        isPausedRef.current = false;
        setIsPaused(false);
        setTimeline(null);
        setPhase("idle");
        setProgress(0);
        setElapsedMs(0);
      }
    },
    [phase, getUrl, track]
  );

  return {
    phase,
    isRecording,
    progress,
    elapsedMs,
    timeline,
    error,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    isPaused,
    clearError: () => setError(null),
  };
}
