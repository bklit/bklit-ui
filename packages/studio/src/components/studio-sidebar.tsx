"use client";

import { ChartTypeSelector } from "@/components/chart-type-selector";
import { StudioControlGroups } from "@/components/studio-control-groups";
import { StudioPanel } from "@/components/studio-panel";
import { StudioScrollArea } from "@/components/studio-scroll-area";
import { getStudioControlGroups } from "@/lib/control-groups";
import { useStudioState } from "./use-studio-state";

export function StudioSidebar() {
  const {
    state,
    displayState,
    setChart,
    setParam,
    setPreviewParam,
    commitParam,
    setMotionCurveDragging,
    config,
  } = useStudioState();
  const groups = getStudioControlGroups(config, displayState);

  return (
    <StudioPanel
      className="studio-sidebar flex h-full min-h-0 min-w-[340px] max-w-[400px] shrink-0 flex-col gap-5 overflow-x-clip"
      variant="ghost"
    >
      <ChartTypeSelector onChange={setChart} value={state.chart} />

      <StudioScrollArea className="min-h-0 min-w-0 flex-1">
        <StudioControlGroups
          groups={groups}
          motionPanel={config.motionPanel}
          motionStagger={config.motionStagger}
          onChange={setParam}
          onCommit={commitParam}
          onMotionCurveDragActiveChange={setMotionCurveDragging}
          onPreview={setPreviewParam}
          state={displayState}
        />
      </StudioScrollArea>
    </StudioPanel>
  );
}
