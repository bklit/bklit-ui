"use client";

import { Icon } from "@bklitui/icons";
import { cn } from "@bklitui/ui/lib/utils";
import { useCallback, useMemo, useRef, useState } from "react";
import { PresetSelect } from "@/components/controls/preset-select";
import {
  STUDIO_CHART_FRAME_MAX_WIDTH,
  STUDIO_EXPORT_ROOT_ATTR,
  StudioChartFrame,
} from "@/components/studio-chart-frame";
import { StudioChartViewport } from "@/components/studio-chart-viewport";
import { StudioCodeSheetTrigger } from "@/components/studio-code-sheet-trigger";
import { StudioExportSvgButton } from "@/components/studio-export-svg-button";
import { StudioPanel } from "@/components/studio-panel";
import { useStudioMotionRemountKey } from "@/components/use-studio-motion-remount";
import { useStudioState } from "@/components/use-studio-state";
import { StudioPatternDefs, studioPatternFill } from "@/lib/patterns";
import type { StudioRenderContext } from "@/lib/render-context";
import {
  studioPreviewCanvasClass,
  studioSidebarScrollClass,
} from "@/lib/studio-chrome-classes";
import { isStudioChartRootVisible } from "@/lib/studio-component-visibility";
import type { StudioUrlState } from "@/lib/studio-parsers";
import { supportsStudioExportFeatures } from "@/lib/studio-runtime";
import {
  getDesignSeriesCount,
  getSeriesPattern,
  resolveChartThemeStyle,
} from "@/lib/studio-series-design";
import { getSeriesPipeValue } from "@/lib/studio-series-line-props";
import { exportStudioChartSvg } from "@/lib/svg-export/export-studio-chart-svg";
import { useStudioAnalytics } from "@/providers/studio-analytics-context";
import { useOptionalStudioThemeMode } from "@/providers/studio-theme-provider";
import { Button } from "@/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/ui/tooltip";

export function StudioPreview({
  renderCodeSheet,
}: {
  renderCodeSheet?: (state: StudioUrlState) => React.ReactNode;
}) {
  const {
    state,
    displayState,
    setParam,
    setFrameSize,
    config,
    motionCurveDragging,
    numberScrubbing,
  } = useStudioState();
  const { track, getUrl } = useStudioAnalytics();
  const paletteMode = useOptionalStudioThemeMode();
  const [animationKey, setAnimationKey] = useState(0);
  const [dataSeed, setDataSeed] = useState(0);
  const motionRemountKey = useStudioMotionRemountKey(displayState);
  const canvasRef = useRef<HTMLDivElement>(null);
  const chartAreaRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const replay = useCallback(() => {
    setAnimationKey((k) => k + 1);
  }, []);

  // Bumps only the data seed — the chart's `key` is unchanged so React
  // reconciles instead of remounting, exercising the same-length data-mutation
  // path (where stale stroke geometry can hide).
  const scrambleData = useCallback(() => {
    setDataSeed((s) => s + 1);
  }, []);

  const patternDefs = useMemo(() => {
    const count = getDesignSeriesCount(displayState.chart, displayState);
    const seriesPatterns = Array.from({ length: count }, (_, index) =>
      getSeriesPattern(displayState, index)
    );
    const seriesScales = Array.from({ length: count }, (_, index) =>
      getSeriesPipeValue(displayState, "patternScale", index)
    );
    return (
      <StudioPatternDefs
        seriesPatterns={seriesPatterns}
        seriesScales={seriesScales}
      />
    );
  }, [displayState]);

  const patternFillAt = useCallback(
    (seriesIndex: number) =>
      studioPatternFill(
        getSeriesPattern(displayState, seriesIndex),
        seriesIndex
      ),
    [displayState]
  );

  const handleFrameResize = useCallback(
    (w: number, h: number) => {
      setFrameSize(w, h);
    },
    [setFrameSize]
  );

  const showExportFeatures = supportsStudioExportFeatures();

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

  return (
    <TooltipProvider delay={0}>
      <StudioPanel className="relative flex h-full min-h-0 min-w-0 flex-col overflow-hidden">
        <div className="absolute top-6 right-6 z-30 flex items-center gap-2.5">
          <Tooltip>
            <TooltipTrigger render={<span className="inline-flex" />}>
              <Button
                aria-label="Replay animation"
                onClick={replay}
                size="icon-xl"
                type="button"
                variant="outline"
              >
                <Icon className="size-5" name="IconArrowRotateClockwise" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Replay animation</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger render={<span className="inline-flex" />}>
              <Button
                aria-label="Scramble data"
                onClick={scrambleData}
                size="icon-xl"
                type="button"
                variant="outline"
              >
                <Icon className="size-5" name="IconShuffle" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Scramble data</TooltipContent>
          </Tooltip>
          {showExportFeatures ? (
            <StudioExportSvgButton onExport={handleExportSvg} />
          ) : null}
          <PresetSelect
            onChange={(v) => setParam("preset", v)}
            value={displayState.preset}
          />
          {renderCodeSheet ? (
            renderCodeSheet(state)
          ) : (
            <StudioCodeSheetTrigger state={state} />
          )}
        </div>

        <div
          className={cn(
            studioPreviewCanvasClass,
            studioSidebarScrollClass,
            "relative flex min-h-0 flex-1 flex-col items-center justify-center gap-5 overflow-auto p-6 pt-16"
          )}
          ref={canvasRef}
        >
          <div
            className="relative z-2 flex min-h-0 w-full flex-1 flex-col items-center justify-center gap-5"
            style={{ maxWidth: STUDIO_CHART_FRAME_MAX_WIDTH }}
          >
            <div
              className="relative flex min-h-0 w-full flex-1 items-center justify-center"
              ref={chartAreaRef}
            >
              <div className="inline-flex">
                <StudioChartFrame
                  boundsRef={chartAreaRef}
                  height={state.frameH}
                  onResize={handleFrameResize}
                  ref={frameRef}
                  style={resolveChartThemeStyle(displayState, paletteMode)}
                  width={state.frameW}
                >
                  <div className="flex size-full min-h-0 items-center justify-center">
                    <StudioChartViewport>
                      {(frame) => {
                        const renderCtx: StudioRenderContext = {
                          animationKey,
                          dataSeed,
                          motionRemountKey,
                          committedState: state,
                          motionCurveDragging,
                          numberScrubbing,
                          chromeState: numberScrubbing ? state : displayState,
                          patternDefs,
                          patternFillAt,
                          frame,
                        };
                        return isStudioChartRootVisible(displayState)
                          ? config.render(displayState, renderCtx)
                          : null;
                      }}
                    </StudioChartViewport>
                  </div>
                </StudioChartFrame>
              </div>
            </div>
          </div>
        </div>
      </StudioPanel>
    </TooltipProvider>
  );
}
