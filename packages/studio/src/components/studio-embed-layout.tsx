"use client";

import { useCallback, useRef, useState } from "react";
import { StudioEditorChartRegion } from "@/components/studio-editor-layout";
import { StudioScenesProvider } from "@/components/studio-scenes-provider";
import { useStudioEditorRecording } from "@/components/use-studio-editor-recording";
import { useStudioShellState } from "@/components/use-studio-state";
import { EditorMainPane } from "@/editor/editor-main-pane";
import { useReplayKeyboardShortcut } from "@/editor/editor-replay-button";
import { StudioComponentSelectionProvider } from "@/editor/studio-component-selection";
import { studioRelativeStateHref } from "@/lib/studio-url-codec";

export function StudioEmbedLayout() {
  const { state, setFrameSize, config, getDisplayState } =
    useStudioShellState();
  const [animationKey, setAnimationKey] = useState(0);
  const [dataSeed] = useState(0);
  const chartAreaRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);

  const openInStudioHref = studioRelativeStateHref(state);

  const replay = useCallback(() => {
    setAnimationKey((key) => key + 1);
  }, []);

  const recording = useStudioEditorRecording({
    state,
    getDisplayState,
    setFrameSize,
    onReplay: replay,
  });

  useReplayKeyboardShortcut(replay, !recording.controlsDisabled);

  return (
    <StudioScenesProvider
      frameHeight={state.frameH}
      frameWidth={state.frameW}
      onPrimaryFrameChange={setFrameSize}
    >
      <StudioComponentSelectionProvider config={config} state={state}>
        <div className="flex h-dvh min-h-0 flex-col overflow-hidden bg-background">
          <EditorMainPane
            className="min-h-0 min-w-0 flex-1"
            controlsDisabled={recording.controlsDisabled}
            embedMode
            frameTitle={config.label}
            mobileViewport={false}
            onReplay={replay}
            onSidebarsOpenChange={() => undefined}
            openInStudioHref={openInStudioHref}
            showDimensions={false}
            showSidebarToggle={false}
            sidebarsOpen={false}
            size={{ width: state.frameW, height: state.frameH }}
          >
            {({
              size,
              boundsRef,
              onResize,
              mobileViewport,
              canvasScaleRef,
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
                recording={recording}
                size={size}
              />
            )}
          </EditorMainPane>
        </div>
      </StudioComponentSelectionProvider>
    </StudioScenesProvider>
  );
}
