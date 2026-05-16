"use client";

import { ChartTypeSelector } from "@/components/studio/chart-type-selector";
import { ControlField } from "@/components/studio/controls/control-field";
import { StudioPanel } from "@/components/studio/studio-panel";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useStudioState } from "./use-studio-state";

export function StudioSidebar() {
  const { state, setChart, setParam, setPreviewParam, commitParam, config } =
    useStudioState();

  return (
    <StudioPanel className="flex max-h-[calc(100vh-5.5rem)] min-h-0 min-w-[280px] max-w-[320px] shrink-0 flex-col">
      <div className="px-4 py-3">
        <ChartTypeSelector onChange={setChart} value={state.chart} />
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <div className="space-y-5 px-4 pb-6">
          {config.controls.map((control) => (
            <ControlField
              control={control}
              key={control.key}
              onChange={setParam}
              onCommit={commitParam}
              onPreview={setPreviewParam}
              state={state}
            />
          ))}
        </div>
      </ScrollArea>
    </StudioPanel>
  );
}
