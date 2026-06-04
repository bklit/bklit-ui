"use client";

import {
  EditorShell,
  type StudioChartConfig,
  StudioComponentSelectionProvider,
  StudioScenesProvider,
} from "@bklitui/studio";
import type { ReactNode, RefObject } from "react";
import type { usePlaygroundState } from "@/components/playground/use-playground-state";

type PlaygroundChartState = ReturnType<typeof usePlaygroundState>;

export function PlaygroundEditorShell({
  config,
  chartState,
  frameHeight,
  frameWidth,
  onPrimaryFrameChange,
  frameTitle,
  showMotionControls = false,
  showFpsCounter = false,
  onScramble,
  children,
}: {
  config: StudioChartConfig;
  chartState: PlaygroundChartState;
  frameHeight: number;
  frameWidth: number;
  onPrimaryFrameChange: (width: number, height: number) => void;
  frameTitle: string;
  showMotionControls?: boolean;
  showFpsCounter?: boolean;
  onScramble: () => void;
  children: (ctx: {
    size: { width: number; height: number };
    boundsRef: RefObject<HTMLDivElement | null>;
    onResize: (width: number, height: number) => void;
    mobileViewport: boolean;
    canvasScaleRef: RefObject<number>;
  }) => ReactNode;
}) {
  return (
    <StudioScenesProvider
      frameHeight={frameHeight}
      frameWidth={frameWidth}
      onPrimaryFrameChange={onPrimaryFrameChange}
    >
      <StudioComponentSelectionProvider
        config={config}
        state={chartState.displayState}
      >
        <EditorShell
          chartState={chartState}
          config={config}
          frameTitle={frameTitle}
          onScramble={onScramble}
          showFpsCounter={showFpsCounter}
          showMotionControls={showMotionControls}
          size={{ width: frameWidth, height: frameHeight }}
        >
          {children}
        </EditorShell>
      </StudioComponentSelectionProvider>
    </StudioScenesProvider>
  );
}
