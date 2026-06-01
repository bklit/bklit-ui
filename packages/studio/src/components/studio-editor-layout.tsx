"use client";

import { cn } from "@bklitui/ui/lib/utils";
import type { ReactNode, RefObject } from "react";
import { memo, useCallback, useMemo, useRef, useState } from "react";
import { ChartTypeSelector } from "@/components/chart-type-selector";
import {
  STUDIO_EXPORT_ROOT_ATTR,
  StudioChartFrame,
} from "@/components/studio-chart-frame";
import { StudioChartViewport } from "@/components/studio-chart-viewport";
import { StudioEditorSidebarActions } from "@/components/studio-editor-sidebar-actions";
import { StudioRecordingMask } from "@/components/studio-recording-mask";
import { StudioRecordingTimeline } from "@/components/studio-recording-timeline";
import { StudioScenesProvider } from "@/components/studio-scenes-provider";
import { useStudioEditorRecording } from "@/components/use-studio-editor-recording";
import { useStudioMotionRemountKey } from "@/components/use-studio-motion-remount";
import type { StudioRecordingPhase } from "@/components/use-studio-recording";
import { useStudioState } from "@/components/use-studio-state";
import { EditorShell } from "@/editor/editor-shell";
import { StudioComponentSelectionProvider } from "@/editor/studio-component-selection";
import { StudioPatternDefs, studioPatternFill } from "@/lib/patterns";
import type { StudioRenderContext } from "@/lib/render-context";
import type { StudioUrlState } from "@/lib/studio-parsers";
import {
  STUDIO_RECORDING_CAPTURE_INSET_PX,
  type StudioRecordingTimeline as StudioRecordingTimelineModel,
} from "@/lib/studio-recording";
import {
  getDesignSeriesCount,
  getSeriesPattern,
  resolveChartThemeStyle,
} from "@/lib/studio-series-design";
import { exportStudioChartSvg } from "@/lib/svg-export/export-studio-chart-svg";
import type { StudioChartConfig } from "@/lib/types";
import { useStudioAnalytics } from "@/providers/studio-analytics-context";

const StudioEditorCanvas = memo(function StudioEditorCanvas({
  animationKey,
  dataSeed,
  displayState,
  state,
  config,
  motionCurveDragging,
  motionRemountKey,
  patternDefs,
  patternFillAt,
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
  canvasScaleRef,
}: {
  animationKey: number;
  dataSeed: number;
  displayState: StudioUrlState;
  state: StudioUrlState;
  config: StudioChartConfig;
  motionCurveDragging: boolean;
  motionRemountKey: string;
  patternDefs: ReactNode;
  patternFillAt: (seriesIndex: number) => string | undefined;
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
  canvasScaleRef: RefObject<number>;
}) {
  return (
    <div
      className={cn(
        "relative min-h-0",
        showCaptureLayout
          ? "flex min-h-0 flex-1 flex-col gap-4 overflow-hidden"
          : "overflow-visible"
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
          showCaptureLayout ? "min-h-0 flex-1 gap-4" : "overflow-visible"
        )}
      >
        <div
          className={cn(
            "relative flex min-h-0 w-full overflow-visible",
            showCaptureLayout
              ? "min-h-0 flex-1 items-center justify-center"
              : undefined
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
                : "overflow-visible"
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
                canvasScaleRef={canvasScaleRef}
                className={showCaptureLayout ? undefined : "overflow-visible"}
                height={size.height}
                isRecording={isRecording}
                onResize={onResize}
                ref={frameRef}
                resizable={!(mobileViewport || showCaptureLayout)}
                style={resolveChartThemeStyle(displayState)}
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
                          patternFillAt,
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
});

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
    setStudioParams,
    setFrameSize,
    config,
    motionCurveDragging,
    setMotionCurveDragging,
    setPreviewParam,
    setPreviewParams,
    commitParam,
  } = useStudioState();
  const { track, getUrl } = useStudioAnalytics();
  const [animationKey, setAnimationKey] = useState(0);
  const [dataSeed, setDataSeed] = useState(0);
  const motionRemountKey = useStudioMotionRemountKey(displayState);
  const chartAreaRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);

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

  const patternDefs = useMemo(() => {
    const count = getDesignSeriesCount(displayState.chart, displayState);
    const seriesPatterns = Array.from({ length: count }, (_, index) =>
      getSeriesPattern(displayState, index)
    );
    return <StudioPatternDefs seriesPatterns={seriesPatterns} />;
  }, [displayState]);

  const patternFillAt = useCallback(
    (seriesIndex: number) =>
      studioPatternFill(
        getSeriesPattern(displayState, seriesIndex),
        seriesIndex
      ),
    [displayState]
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
    setStudioParams,
    setPreviewParam,
    setPreviewParams,
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

      <StudioScenesProvider
        frameHeight={state.frameH}
        frameWidth={state.frameW}
        onPrimaryFrameChange={setFrameSize}
      >
        <StudioComponentSelectionProvider config={config} state={displayState}>
          <EditorShell
            chartSelector={
              <ChartTypeSelector onChange={setChart} value={state.chart} />
            }
            chartState={chartState}
            className="h-full min-h-0"
            config={config}
            controlsDisabled={recording.controlsDisabled}
            frameTitle={config.label}
            onScramble={scrambleData}
            propertiesHeaderActions={
              <StudioEditorSidebarActions
                controlsDisabled={recording.controlsDisabled}
                isRecording={recording.isRecording}
                onExportSvg={handleExportSvg}
                onRecordPopoverOpenChange={
                  recording.handleRecordPopoverOpenChange
                }
                onReplay={replay}
                onStartRecording={recording.handleStartRecording}
                onStopRecording={recording.stopRecording}
                recordingBlocked={recording.recordingBlocked}
                renderCodeSheet={renderCodeSheet}
                state={state}
              />
            }
            showMotionControls={Boolean(config.motionPanel)}
            size={{ width: state.frameW, height: state.frameH }}
          >
            {({
              size,
              boundsRef,
              onResize,
              mobileViewport,
              canvasScaleRef,
            }: {
              size: { width: number; height: number };
              boundsRef: RefObject<HTMLDivElement | null>;
              onResize: (width: number, height: number) => void;
              mobileViewport: boolean;
              canvasScaleRef: RefObject<number>;
            }) => (
              <StudioEditorCanvas
                animationKey={animationKey}
                boundsRef={boundsRef}
                canvasScaleRef={canvasScaleRef}
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
                patternFillAt={patternFillAt}
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
        </StudioComponentSelectionProvider>
      </StudioScenesProvider>
    </>
  );
}
