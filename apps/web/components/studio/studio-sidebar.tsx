"use client";

import { DocsScrollArea } from "@/components/docs/docs-scroll-area";
import { ChartTypeSelector } from "@/components/studio/chart-type-selector";
import { StudioControlGroups } from "@/components/studio/studio-control-groups";
import { StudioPanel } from "@/components/studio/studio-panel";
import { getStudioControlGroups } from "@/lib/studio/control-groups";
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

      <DocsScrollArea className="studio-sidebar-scroll min-h-0 min-w-0 flex-1">
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
      </DocsScrollArea>
    </StudioPanel>
  );
}
