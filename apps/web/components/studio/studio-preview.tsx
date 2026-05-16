"use client";

import { Refresh01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback, useMemo, useState } from "react";
import { PresetSelect } from "@/components/studio/controls/preset-select";
import { StudioChartFrame } from "@/components/studio/studio-chart-frame";
import { StudioChartViewport } from "@/components/studio/studio-chart-viewport";
import { StudioCodeSheet } from "@/components/studio/studio-code-sheet";
import { StudioPanel } from "@/components/studio/studio-panel";
import { useStudioState } from "@/components/studio/use-studio-state";
import { Button } from "@/components/ui/button";
import { presetStyle } from "@/lib/studio/color-presets";
import { StudioPatternDefs, studioPatternFill } from "@/lib/studio/patterns";
import type { StudioRenderContext } from "@/lib/studio/render-context";

export function StudioPreview() {
  const { state, displayState, setParam, setFrameSize, config } =
    useStudioState();
  const [animationKey, setAnimationKey] = useState(0);

  const replay = useCallback(() => {
    setAnimationKey((k) => k + 1);
  }, []);

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

  return (
    <StudioPanel className="relative min-h-[min(70vh,720px)] min-w-0 flex-1">
      <div className="absolute top-6 right-6 z-10 flex items-center gap-2.5">
        <Button
          aria-label="Replay animation"
          className="size-10"
          onClick={replay}
          size="icon"
          title="Replay animation"
          type="button"
          variant="outline"
        >
          <HugeiconsIcon icon={Refresh01Icon} size={20} strokeWidth={1.5} />
        </Button>
        <PresetSelect
          onChange={(v) => setParam("preset", v)}
          value={displayState.preset}
        />
        <StudioCodeSheet state={state} />
      </div>

      <div className="studio-preview-canvas flex min-h-0 flex-1 flex-col items-center justify-center p-6 pt-16">
        <StudioChartFrame
          height={state.frameH}
          onResize={handleFrameResize}
          style={presetStyle(displayState.preset)}
          width={state.frameW}
        >
          <div className="flex size-full min-h-0 items-center justify-center">
            <StudioChartViewport>
              {(frame) => {
                const renderCtx: StudioRenderContext = {
                  animationKey,
                  patternDefs,
                  patternFill,
                  frame,
                };
                return config.render(displayState, renderCtx);
              }}
            </StudioChartViewport>
          </div>
        </StudioChartFrame>
      </div>
    </StudioPanel>
  );
}
