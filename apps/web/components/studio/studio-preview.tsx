"use client";

import { Refresh01Icon, ShuffleIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useReducedMotion } from "motion/react";
import { useCallback, useMemo, useRef, useState } from "react";
import { PresetSelect } from "@/components/studio/controls/preset-select";
import {
  STUDIO_CHART_FRAME_MAX_WIDTH,
  STUDIO_EXPORT_ROOT_ATTR,
  StudioChartFrame,
} from "@/components/studio/studio-chart-frame";
import { StudioChartViewport } from "@/components/studio/studio-chart-viewport";
import { StudioCodeSheet } from "@/components/studio/studio-code-sheet";
import { StudioExportSvgButton } from "@/components/studio/studio-export-svg-button";
import { StudioPanel } from "@/components/studio/studio-panel";
import { StudioRecordPopover } from "@/components/studio/studio-record-popover";
import { StudioRecordingMask } from "@/components/studio/studio-recording-mask";
import { StudioRecordingTimeline } from "@/components/studio/studio-recording-timeline";
import { useStudioMotionRemountKey } from "@/components/studio/use-studio-motion-remount";
import { useStudioRecording } from "@/components/studio/use-studio-recording";
import { useStudioState } from "@/components/studio/use-studio-state";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getAnalyticsUrl, trackEvent } from "@/lib/analytics/track-client";
import { presetStyle } from "@/lib/studio/color-presets";
import { StudioPatternDefs, studioPatternFill } from "@/lib/studio/patterns";
import type { StudioRenderContext } from "@/lib/studio/render-context";
import {
  getRecordingCaptureDimensions,
  STUDIO_RECORDING_CAPTURE_INSET_PX,
  type StudioRecordingAspect,
  type StudioRecordingFormat,
  type StudioRecordingInteractionMs,
} from "@/lib/studio/studio-recording";
import { exportStudioChartSvg } from "@/lib/studio/svg-export/export-studio-chart-svg";
import { cn } from "@/lib/utils";

export function StudioPreview() {
  const {
    state,
    displayState,
    setParam,
    setFrameSize,
    config,
    motionCurveDragging,
  } = useStudioState();
  const [animationKey, setAnimationKey] = useState(0);
  const [dataSeed, setDataSeed] = useState(0);
  const motionRemountKey = useStudioMotionRemountKey(displayState);
  const canvasRef = useRef<HTMLDivElement>(null);
  const chartAreaRef = useRef<HTMLDivElement>(null);
  const recordCaptureRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
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

  const replay = useCallback(() => {
    setAnimationKey((k) => k + 1);
  }, []);

  // Bumps only the data seed — the chart's `key` is unchanged so React
  // reconciles instead of remounting, exercising the same-length data-mutation
  // path (where stale stroke geometry can hide).
  const scrambleData = useCallback(() => {
    setDataSeed((s) => s + 1);
  }, []);

  const replayForRecording = useCallback(() => {
    setRecordingChartHeld(false);
    setAnimationKey((k) => k + 1);
  }, []);

  const restorePreviewChart = useCallback(() => {
    setRecordingChartHeld(false);
    replay();
  }, [replay]);

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

  const patternDefs = useMemo(
    () => <StudioPatternDefs preset={displayState.pattern} />,
    [displayState.pattern]
  );
  const patternFill = useMemo(
    () => studioPatternFill(displayState.pattern),
    [displayState.pattern]
  );

  const handleFrameResize = useCallback(
    (w: number, h: number) => {
      setFrameSize(w, h);
    },
    [setFrameSize]
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
        trackEvent("studio_recording_start", {
          chart: state.chart,
          format,
          aspect,
          interaction_ms: interactionMs,
          url: getAnalyticsUrl(),
        });

        await startRecording({
          element,
          width: dimensions.captureWidth,
          height: dimensions.captureHeight,
          state: displayState,
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
      displayState,
      replayForRecording,
      restorePreviewChart,
      setFrameSize,
      startRecording,
      state.chart,
      state.frameH,
      state.frameW,
    ]
  );

  const recordingBlocked = reducedMotion === true;
  const controlsDisabled = isRecording || capturePrepared || recordingChartHeld;
  const showCaptureLayout = isRecording || capturePrepared;
  const showRecordingChrome = isRecording && timeline;

  const handleExportSvg = useCallback(async () => {
    const root = chartAreaRef.current?.querySelector<HTMLElement>(
      `[${STUDIO_EXPORT_ROOT_ATTR}]`
    );
    if (!root) {
      return;
    }

    await exportStudioChartSvg({
      root,
      width: state.frameW,
      height: state.frameH,
      filename: `${state.chart}.svg`,
    });

    trackEvent("studio_export_svg", {
      chart: state.chart,
      url: getAnalyticsUrl(),
      frame_w: state.frameW,
      frame_h: state.frameH,
      preset: displayState.preset,
    });
  }, [displayState.preset, state.chart, state.frameH, state.frameW]);

  return (
    <TooltipProvider>
      <StudioPanel className="relative flex h-full min-h-0 min-w-0 flex-col overflow-hidden">
        <div className="absolute top-6 right-6 z-30 flex items-center gap-2.5">
          <Tooltip>
            <TooltipTrigger render={<span className="inline-flex" />}>
              <Button
                aria-label="Replay animation"
                className="size-10"
                disabled={controlsDisabled}
                onClick={replay}
                size="icon"
                type="button"
                variant="outline"
              >
                <HugeiconsIcon
                  icon={Refresh01Icon}
                  size={20}
                  strokeWidth={1.5}
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Replay animation</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger render={<span className="inline-flex" />}>
              <Button
                aria-label="Scramble data"
                className="size-10"
                disabled={controlsDisabled}
                onClick={scrambleData}
                size="icon"
                type="button"
                variant="outline"
              >
                <HugeiconsIcon icon={ShuffleIcon} size={20} strokeWidth={1.5} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Scramble data</TooltipContent>
          </Tooltip>
          <StudioExportSvgButton
            disabled={controlsDisabled}
            onExport={handleExportSvg}
          />
          <StudioRecordPopover
            disabled={recordingBlocked}
            isRecording={isRecording}
            onOpenChange={handleRecordPopoverOpenChange}
            onStart={handleStartRecording}
            onStop={stopRecording}
          />
          <PresetSelect
            disabled={controlsDisabled}
            onChange={(v) => setParam("preset", v)}
            value={displayState.preset}
          />
          <StudioCodeSheet state={state} />
        </div>

        {error ? (
          <div
            className="absolute top-20 right-6 z-20 max-w-xs rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-destructive text-sm"
            role="alert"
          >
            <p>{error}</p>
            <button
              className="mt-1 underline"
              onClick={clearError}
              type="button"
            >
              Dismiss
            </button>
          </div>
        ) : null}

        <div
          className={cn(
            "studio-preview-canvas relative flex min-h-0 flex-1 flex-col overflow-auto p-6 pt-16",
            showCaptureLayout ? "gap-4" : "items-center justify-center gap-5"
          )}
          ref={canvasRef}
        >
          {showCaptureLayout ? (
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 z-1 bg-zinc-950/88"
            />
          ) : null}

          <div
            className={cn(
              "relative z-2 flex min-h-0 w-full flex-1 flex-col",
              showCaptureLayout ? "gap-4" : "items-center justify-center gap-5"
            )}
            style={
              showCaptureLayout
                ? undefined
                : { maxWidth: STUDIO_CHART_FRAME_MAX_WIDTH }
            }
          >
            <div
              className="relative flex min-h-0 w-full flex-1 items-center justify-center"
              ref={chartAreaRef}
            >
              <StudioRecordingMask
                active={showCaptureLayout}
                containerRef={chartAreaRef}
                targetRef={recordCaptureRef}
              />

              <div
                className={cn(
                  showCaptureLayout
                    ? "studio-recording-capture relative shrink-0"
                    : "inline-flex"
                )}
                ref={recordCaptureRef}
                style={
                  showCaptureLayout
                    ? {
                        width:
                          state.frameW + STUDIO_RECORDING_CAPTURE_INSET_PX * 2,
                        height:
                          state.frameH + STUDIO_RECORDING_CAPTURE_INSET_PX * 2,
                      }
                    : undefined
                }
              >
                <div
                  style={
                    showCaptureLayout
                      ? {
                          position: "absolute",
                          top: STUDIO_RECORDING_CAPTURE_INSET_PX,
                          left: STUDIO_RECORDING_CAPTURE_INSET_PX,
                        }
                      : undefined
                  }
                >
                  <StudioChartFrame
                    boundsRef={chartAreaRef}
                    height={state.frameH}
                    isRecording={isRecording}
                    onResize={handleFrameResize}
                    ref={frameRef}
                    style={presetStyle(displayState.preset)}
                    width={state.frameW}
                  >
                    <div className="flex size-full min-h-0 items-center justify-center">
                      {recordingChartHeld ? null : (
                        <StudioChartViewport>
                          {(frame) => {
                            const renderCtx: StudioRenderContext = {
                              animationKey,
                              dataSeed,
                              isRecording,
                              motionRemountKey,
                              committedState: state,
                              motionCurveDragging,
                              patternDefs,
                              patternFill,
                              frame,
                            };
                            return config.render(displayState, renderCtx);
                          }}
                        </StudioChartViewport>
                      )}
                    </div>
                  </StudioChartFrame>
                </div>
              </div>
            </div>

            {showRecordingChrome ? (
              <StudioRecordingTimeline
                elapsedMs={elapsedMs}
                isPaused={isPaused}
                onPause={pauseRecording}
                onResume={resumeRecording}
                phase={phase === "encoding" ? "encoding" : "capturing"}
                timeline={timeline}
              />
            ) : null}
          </div>
        </div>
      </StudioPanel>
    </TooltipProvider>
  );
}
