"use client";

import {
  EditorChartFrame,
  EditorShell,
  resolveViewportSize,
  StudioScenesProvider,
  type ViewportPreset,
} from "@bklitui/studio";
import { useCallback, useState } from "react";
import { PlaygroundEmptyState } from "@/components/playground/playground-empty-state";
import { usePlaygroundState } from "@/components/playground/use-playground-state";
import { useReplayKey } from "@/components/playground/use-replay-key";

export default function PlaygroundPage() {
  const chartState = usePlaygroundState();
  const [, replay] = useReplayKey();
  const [viewport, setViewport] = useState<ViewportPreset | null>("desktop");
  const [size, setSize] = useState(() =>
    resolveViewportSize("desktop", 960)
  );
  const handleSizeChange = useCallback((width: number, height: number) => {
    setSize((current) =>
      current.width === width && current.height === height
        ? current
        : { width, height }
    );
  }, []);

  return (
    <StudioScenesProvider
      frameHeight={size.height}
      frameWidth={size.width}
      onPrimaryFrameChange={handleSizeChange}
    >
      <EditorShell
        chartState={chartState}
        controlGroups={[]}
        frameTitle="Playground"
        onReplay={replay}
        onSizeChange={handleSizeChange}
        onViewportChange={setViewport}
        showFpsCounter
        showMotionControls={false}
        size={size}
        viewport={viewport}
      >
        {({
          size: frameSize,
          boundsRef,
          onResize,
          mobileViewport,
          canvasScaleRef,
        }) => (
          <EditorChartFrame
            boundsRef={boundsRef}
            canvasScaleRef={canvasScaleRef}
            height={frameSize.height}
            onResize={onResize}
            resizable={!mobileViewport}
            width={frameSize.width}
          >
            <PlaygroundEmptyState />
          </EditorChartFrame>
        )}
      </EditorShell>
    </StudioScenesProvider>
  );
}
