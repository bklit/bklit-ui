"use client";

import { LineProfitLossStudioChart } from "@/components/studio/charts/line-profit-loss-studio";
import type { StudioRenderContext } from "@/lib/studio/render-context";
import type { StudioUrlState } from "@/lib/studio/studio-parsers";

export function PlaygroundProfitLossLineChart({
  state,
  committedState,
  motionCurveDragging,
  replayKey,
}: {
  state: StudioUrlState;
  committedState: StudioUrlState;
  motionCurveDragging: boolean;
  replayKey: number;
}) {
  const ctx: StudioRenderContext = {
    animationKey: replayKey,
    committedState,
    motionCurveDragging,
    motionRemountKey: "",
    patternDefs: null,
    patternFill: undefined,
    frame: { width: 0, height: 0 },
  };

  return <LineProfitLossStudioChart ctx={ctx} state={state} />;
}
