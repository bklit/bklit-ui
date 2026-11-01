"use client";

import type { ReactNode, RefObject } from "react";
import { memo, useCallback, useMemo, useRef, useState } from "react";
import { ChartTypeSelector } from "@/components/chart-type-selector";
import {
  STUDIO_EXPORT_ROOT_ATTR,
  StudioChartFrame,
} from "@/components/studio-chart-frame";
import { StudioChartRender } from "@/components/studio-chart-render";
import { StudioChartViewport } from "@/components/studio-chart-viewport";
import { StudioEditorSidebarActions } from "@/components/studio-editor-sidebar-actions";
import { StudioScenesProvider } from "@/components/studio-scenes-provider";
import { useStudioMotionRemountKey } from "@/components/use-studio-motion-remount";
import {
  useStudioDisplayState,
  useStudioShellState,
} from "@/components/use-studio-state";
import { useReplayKeyboardShortcut } from "@/editor/editor-replay-button";
import { EditorShell } from "@/editor/editor-shell";
import { StudioComponentSelectionProvider } from "@/editor/studio-component-selection";
import { StudioPatternDefs, studioPatternFill } from "@/lib/patterns";
import type { StudioUrlState } from "@/lib/studio-parsers";
import { studioPatternChromeState } from "@/lib/studio-pattern-chrome";
import {
  getDesignSeriesCount,
  getSeriesPattern,
  resolveChartThemeStyle,
} from "@/lib/studio-series-design";
import { exportStudioChartSvg } from "@/lib/svg-export/export-studio-chart-svg";
import type { StudioChartConfig } from "@/lib/types";
import { useStudioAnalytics } from "@/providers/studio-analytics-context";
import { useStudioChartPhaseReporter } from "@/providers/studio-chart-phase-reporter-context";
import { useOptionalStudioThemeMode } from "@/providers/studio-theme-provider";

const StudioEditorCanvas = memo(function StudioEditorCanvas({
  animationKey,
  dataSeed,
  displayState,
  themeState,
  state,
  config,
  motionCurveDragging,
  numberScrubbing,
  motionRemountKey,
  patternDefs,
  patternFillAt,
  chartAreaRef,
  frameRef,
  size,
  boundsRef,
  onResize,
  mobileViewport,
  canvasScaleRef,
}: {
  animationKey: number;
  dataSeed: number;
  displayState: StudioUrlState;
  themeState: StudioUrlState;
  state: StudioUrlState;
  config: StudioChartConfig;
  motionCurveDragging: boolean;
  numberScrubbing: boolean;
  motionRemountKey: string;
  patternDefs: ReactNode;
  patternFillAt: (seriesIndex: number) => string | undefined;
  chartAreaRef: RefObject<HTMLDivElement | null>;
  frameRef: RefObject<HTMLDivElement | null>;
  size: { width: number; height: number };
  boundsRef: RefObject<HTMLDivElement | null>;
  onResize: (width: number, height: number) => void;
  mobileViewport: boolean;
  canvasScaleRef: RefObject<number>;
}) {
  const reportOgPhaseFromContext = useStudioChartPhaseReporter();
  const paletteMode = useOptionalStudioThemeMode();

  return (
    <div className="relative min-h-0 overflow-visible" ref={chartAreaRef}>
      <div className="relative z-2 flex min-h-0 w-full flex-col overflow-visible">
        <div className="relative flex min-h-0 w-full overflow-visible">
          <div className="overflow-visible">
            <StudioChartFrame
              boundsRef={boundsRef}
              canvasScaleRef={canvasScaleRef}
              className="overflow-visible"
              height={size.height}
              onResize={onResize}
              ref={frameRef}
              resizable={!mobileViewport}
              style={resolveChartThemeStyle(themeState, paletteMode)}
              width={size.width}
            >
              <div className="flex size-full min-h-0 items-center justify-center">
                <StudioChartViewport>
                  {(frame) => (
                    <StudioChartRender
                      animationKey={animationKey}
                      committedState={state}
                      config={config}
                      dataSeed={dataSeed}
                      displayState={displayState}
                      frame={frame}
                      motionCurveDragging={motionCurveDragging}
                      motionRemountKey={motionRemountKey}
                      numberScrubbing={numberScrubbing}
                      patternDefs={patternDefs}
                      patternFillAt={patternFillAt}
                      reportOgPhase={reportOgPhaseFromContext}
                    />
                  )}
                </StudioChartViewport>
              </div>
            </StudioChartFrame>
          </div>
        </div>
      </div>
    </div>
  );
});

export const StudioEditorChartRegion = memo(function StudioEditorChartRegion({
  animationKey,
  dataSeed,
  chartAreaRef,
  frameRef,
  config,
  size,
  boundsRef,
  onResize,
  mobileViewport,
  canvasScaleRef,
}: {
  animationKey: number;
  dataSeed: number;
  chartAreaRef: RefObject<HTMLDivElement | null>;
  frameRef: RefObject<HTMLDivElement | null>;
  config: StudioChartConfig;
  size: { width: number; height: number };
  boundsRef: RefObject<HTMLDivElement | null>;
  onResize: (width: number, height: number) => void;
  mobileViewport: boolean;
  canvasScaleRef: RefObject<number>;
}) {
  const { displayState } = useStudioDisplayState();
  const { state, motionCurveDragging, numberScrubbing } = useStudioShellState();
  const motionRemountKey = useStudioMotionRemountKey(displayState);

  const patternChromeState = studioPatternChromeState(
    state,
    displayState,
    numberScrubbing
  );
  const patternDefs = useMemo(() => {
    const count = getDesignSeriesCount(
      patternChromeState.chart,
      patternChromeState
    );
    const seriesPatterns = Array.from({ length: count }, (_, index) =>
      getSeriesPattern(patternChromeState, index)
    );
    return <StudioPatternDefs seriesPatterns={seriesPatterns} />;
  }, [patternChromeState]);

  const patternFillAt = useCallback(
    (seriesIndex: number) =>
      studioPatternFill(
        getSeriesPattern(patternChromeState, seriesIndex),
        seriesIndex
      ),
    [patternChromeState]
  );

  const themeState = patternChromeState;

  return (
    <StudioEditorCanvas
      animationKey={animationKey}
      boundsRef={boundsRef}
      canvasScaleRef={canvasScaleRef}
      chartAreaRef={chartAreaRef}
      config={config}
      dataSeed={dataSeed}
      displayState={displayState}
      frameRef={frameRef}
      mobileViewport={mobileViewport}
      motionCurveDragging={motionCurveDragging}
      motionRemountKey={motionRemountKey}
      numberScrubbing={numberScrubbing}
      onResize={onResize}
      patternDefs={patternDefs}
      patternFillAt={patternFillAt}
      size={size}
      state={state}
      themeState={themeState}
    />
  );
});

export function StudioEditorLayout({
  renderCodeSheet,
  readOnly = false,
}: {
  renderCodeSheet?: (state: StudioUrlState) => React.ReactNode;
  /** Static marketing/docs preview — disables controls and canvas shortcuts. */
  readOnly?: boolean;
}) {
  const {
    state,
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
  } = useStudioShellState();
  const { track, getUrl } = useStudioAnalytics();
  const [animationKey, setAnimationKey] = useState(0);
  const [dataSeed, setDataSeed] = useState(0);
  const chartAreaRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);

  const replay = useCallback(() => {
    setAnimationKey((k) => k + 1);
  }, []);

  const scrambleData = useCallback(() => {
    setDataSeed((s) => s + 1);
  }, []);

  useReplayKeyboardShortcut(replay, !readOnly);

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
      preset: state.preset,
    });
  }, [getUrl, state.chart, state.frameH, state.frameW, state.preset, track]);

  const chartState = useMemo(
    () => ({
      state,
      setParam,
      setStudioParams,
      setPreviewParam,
      setPreviewParams,
      commitParam,
      motionCurveDragging,
      setMotionCurveDragging,
    }),
    [
      commitParam,
      motionCurveDragging,
      setMotionCurveDragging,
      setParam,
      setPreviewParam,
      setPreviewParams,
      setStudioParams,
      state,
    ]
  );

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden">
      <StudioScenesProvider
        frameHeight={state.frameH}
        frameWidth={state.frameW}
        onPrimaryFrameChange={setFrameSize}
        persistSession={!readOnly}
      >
        <StudioComponentSelectionProvider config={config} state={state}>
          <EditorShell
            chartSelector={
              <ChartTypeSelector onChange={setChart} value={state.chart} />
            }
            chartState={chartState}
            className="h-full min-h-0 w-full overflow-hidden"
            config={config}
            controlsDisabled={readOnly}
            fillHeight={readOnly}
            frameTitle={config.label}
            onExportSvg={handleExportSvg}
            onReplay={replay}
            onScramble={scrambleData}
            propertiesFooterActions={
              <StudioEditorSidebarActions
                renderCodeSheet={renderCodeSheet}
                state={state}
              />
            }
            showMotionControls={Boolean(config.motionPanel)}
            size={{ width: state.frameW, height: state.frameH }}
            staticPreview={readOnly}
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
              <StudioEditorChartRegion
                animationKey={animationKey}
                boundsRef={boundsRef}
                canvasScaleRef={canvasScaleRef}
                chartAreaRef={chartAreaRef}
                config={config}
                dataSeed={dataSeed}
                frameRef={frameRef}
                mobileViewport={mobileViewport}
                onResize={onResize}
                size={size}
              />
            )}
          </EditorShell>
        </StudioComponentSelectionProvider>
      </StudioScenesProvider>
    </div>
  );
}
