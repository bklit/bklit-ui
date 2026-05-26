"use client";

import { useCallback, useState } from "react";
import { EditorChartFrame } from "@/components/editor/editor-chart-frame";
import { EditorShell } from "@/components/editor/editor-shell";
import type { ViewportPreset } from "@/components/editor/viewport-presets";
import { resolveViewportSize } from "@/components/editor/viewport-presets";
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
    <EditorShell
      chartState={chartState}
      controlGroups={[]}
      onReplay={replay}
      onSizeChange={handleSizeChange}
      onViewportChange={setViewport}
      showMotionControls={false}
      size={size}
      viewport={viewport}
    >
      {({ size: frameSize, boundsRef, onResize, mobileViewport }) => (
        <EditorChartFrame
          boundsRef={boundsRef}
          height={frameSize.height}
          onResize={onResize}
          resizable={!mobileViewport}
          width={frameSize.width}
        >
          <PlaygroundEmptyState />
        </EditorChartFrame>
      )}
    </EditorShell>
  );
}
