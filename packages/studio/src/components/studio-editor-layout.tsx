"use client";

import { cn } from "@bklitui/ui/lib/utils";
import type { ReactNode, RefObject } from "react";
import { useCallback, useMemo, useRef, useState } from "react";
import { ChartTypeSelector } from "@/components/chart-type-selector";
import {
  STUDIO_EXPORT_ROOT_ATTR,
  StudioChartFrame,
} from "@/components/studio-chart-frame";
import { StudioChartViewport } from "@/components/studio-chart-viewport";
import { StudioEditorMenuActions } from "@/components/studio-editor-menu-actions";
import { StudioRecordingMask } from "@/components/studio-recording-mask";
import { StudioRecordingTimeline } from "@/components/studio-recording-timeline";
import { useStudioEditorRecording } from "@/components/use-studio-editor-recording";
import { useStudioMotionRemountKey } from "@/components/use-studio-motion-remount";
import type { StudioRecordingPhase } from "@/components/use-studio-recording";
import { useStudioState } from "@/components/use-studio-state";
import { EditorShell } from "@/editor/editor-shell";
import type { ViewportPreset } from "@/editor/viewport-presets";
import { presetStyle } from "@/lib/color-presets";
import { getStudioControlGroups } from "@/lib/control-groups";
import { StudioPatternDefs, studioPatternFill } from "@/lib/patterns";
import type { StudioRenderContext } from "@/lib/render-context";
import type { StudioUrlState } from "@/lib/studio-parsers";
import {
  STUDIO_RECORDING_CAPTURE_INSET_PX,
  type StudioRecordingTimeline as StudioRecordingTimelineModel,
} from "@/lib/studio-recording";
import { exportStudioChartSvg } from "@/lib/svg-export/export-studio-chart-svg";
import type { StudioChartConfig } from "@/lib/types";
import { useStudioAnalytics } from "@/providers/studio-analytics-context";

function StudioEditorCanvas({
  animationKey,
  dataSeed,
  displayState,
  state,
  config,
  motionCurveDragging,
  motionRemountKey,
  patternDefs,
  patternFill,
  chartAreaRef,
  recordCaptureRef,
  frameRef,
  showCaptureLayout,
  showRecordingChrome,
  recordingChartHeld,
  isRecording,
  phase,
  elapsedMs,
  timeline,
  isPaused,
  pauseRecording,
  resumeRecording,
  size,
  boundsRef,
  onResize,
  mobileViewport,
  canvasScale,
}: {
  animationKey: number;
  dataSeed: number;
  displayState: StudioUrlState;
  state: StudioUrlState;
  config: StudioChartConfig;
  motionCurveDragging: boolean;
  motionRemountKey: string;
  patternDefs: ReactNode;
  patternFill: string | undefined;
  chartAreaRef: RefObject<HTMLDivElement | null>;
  recordCaptureRef: RefObject<HTMLDivElement | null>;
  frameRef: RefObject<HTMLDivElement | null>;
  showCaptureLayout: boolean;
  showRecordingChrome: boolean;
  recordingChartHeld: boolean;
  isRecording: boolean;
  phase: StudioRecordingPhase;
  elapsedMs: number;
  timeline: StudioRecordingTimelineModel | null;
  isPaused: boolean;
  pauseRecording: () => void;
  resumeRecording: () => void;
  size: { width: number; height: number };
  boundsRef: RefObject<HTMLDivElement | null>;
  onResize: (width: number, height: number) => void;
  mobileViewport: boolean;
  canvasScale: number;
}) {
  return (
    <div
      className={cn(
        "relative size-full min-h-0",
        showCaptureLayout
          ? "flex min-h-0 flex-1 flex-col gap-4"
          : "overflow-hidden"
      )}
      ref={chartAreaRef}
    >
      {showCaptureLayout ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-1 bg-zinc-950/88"
        />
      ) : null}

      <div
        className={cn(
          "relative z-2 flex min-h-0 w-full flex-col",
          showCaptureLayout ? "min-h-0 flex-1 gap-4" : "size-full"
        )}
      >
        <div
          className={cn(
            "relative flex min-h-0 w-full",
            showCaptureLayout
              ? "min-h-0 flex-1 items-center justify-center"
              : "size-full"
          )}
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
                : "size-full"
            )}
            ref={recordCaptureRef}
            style={
              showCaptureLayout
                ? {
                    width: state.frameW + STUDIO_RECORDING_CAPTURE_INSET_PX * 2,
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
                boundsRef={boundsRef}
                canvasScale={canvasScale}
                className={showCaptureLayout ? undefined : "size-full"}
                height={size.height}
                isRecording={isRecording}
                onResize={onResize}
                ref={frameRef}
                resizable={!(mobileViewport || showCaptureLayout)}
                style={presetStyle(displayState.preset)}
                width={size.width}
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

        {showRecordingChrome && timeline ? (
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
  );
}

export function StudioEditorLayout({
  renderCodeSheet,
}: {
  renderCodeSheet?: (state: StudioUrlState) => React.ReactNode;
}) {
  const {
    state,
    displayState,
    setChart,
    setParam,
    setFrameSize,
    config,
    motionCurveDragging,
    setMotionCurveDragging,
    setPreviewParam,
    commitParam,
  } = useStudioState();
  const { track, getUrl } = useStudioAnalytics();
  const [animationKey, setAnimationKey] = useState(0);
  const [dataSeed, setDataSeed] = useState(0);
  const [viewport, setViewport] = useState<ViewportPreset | null>(null);
  const motionRemountKey = useStudioMotionRemountKey(displayState);
  const chartAreaRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const controlGroups = getStudioControlGroups(config, displayState);

  const replay = useCallback(() => {
    setAnimationKey((k) => k + 1);
  }, []);

  const scrambleData = useCallback(() => {
    setDataSeed((s) => s + 1);
  }, []);

  const recording = useStudioEditorRecording({
    state,
    displayState,
    setFrameSize,
    onReplay: replay,
  });

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

    track?.("studio_export_svg", {
      chart: state.chart,
      url: getUrl?.(),
      frame_w: state.frameW,
      frame_h: state.frameH,
      preset: displayState.preset,
    });
  }, [
    displayState.preset,
    getUrl,
    state.chart,
    state.frameH,
    state.frameW,
    track,
  ]);

  const chartState = {
    displayState,
    state,
    setParam,
    setPreviewParam,
    commitParam,
    motionCurveDragging,
    setMotionCurveDragging,
  };

  return (
    <>
      {recording.error ? (
        <div
          className="absolute top-3 right-3 z-50 max-w-xs rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-destructive text-sm"
          role="alert"
        >
          <p>{recording.error}</p>
          <button
            className="mt-1 underline"
            onClick={recording.clearError}
            type="button"
          >
            Dismiss
          </button>
        </div>
      ) : null}

      <EditorShell
        chartState={chartState}
        className="h-full min-h-0"
        controlGroups={controlGroups}
        menuBarActions={
          <StudioEditorMenuActions
            controlsDisabled={recording.controlsDisabled}
            displayState={displayState}
            isRecording={recording.isRecording}
            onExportSvg={handleExportSvg}
            onPresetChange={(value) => setParam("preset", value)}
            onRecordPopoverOpenChange={recording.handleRecordPopoverOpenChange}
            onScramble={scrambleData}
            onStartRecording={recording.handleStartRecording}
            onStopRecording={recording.stopRecording}
            recordingBlocked={recording.recordingBlocked}
            renderCodeSheet={renderCodeSheet}
            state={state}
          />
        }
        onReplay={replay}
        onSizeChange={handleFrameResize}
        onViewportChange={setViewport}
        rightPanelHeader={
          <ChartTypeSelector onChange={setChart} value={state.chart} />
        }
        showMotionControls={Boolean(config.motionPanel)}
        size={{ width: state.frameW, height: state.frameH }}
        viewport={viewport}
      >
        {({ size, boundsRef, onResize, mobileViewport, canvasScale }) => (
          <StudioEditorCanvas
            animationKey={animationKey}
            boundsRef={boundsRef}
            canvasScale={canvasScale}
            chartAreaRef={chartAreaRef}
            config={config}
            dataSeed={dataSeed}
            displayState={displayState}
            elapsedMs={recording.elapsedMs}
            frameRef={frameRef}
            isPaused={recording.isPaused}
            isRecording={recording.isRecording}
            mobileViewport={mobileViewport}
            motionCurveDragging={motionCurveDragging}
            motionRemountKey={motionRemountKey}
            onResize={onResize}
            patternDefs={patternDefs}
            patternFill={patternFill}
            pauseRecording={recording.pauseRecording}
            phase={recording.phase}
            recordCaptureRef={recording.recordCaptureRef}
            recordingChartHeld={recording.recordingChartHeld}
            resumeRecording={recording.resumeRecording}
            showCaptureLayout={recording.showCaptureLayout}
            showRecordingChrome={recording.showRecordingChrome}
            size={size}
            state={state}
            timeline={recording.timeline}
          />
        )}
      </EditorShell>
    </>
  );
}
