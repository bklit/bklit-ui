"use client";

import {
  LineProfitLossStudioChart,
  type StudioRenderContext,
  type StudioUrlState,
} from "@bklitui/studio";

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
    dataSeed: 0,
    committedState,
    motionCurveDragging,
    numberScrubbing: false,
    chromeState: state,
    motionRemountKey: "",
    patternDefs: null,
    patternFillAt: () => undefined,
    frame: { width: 0, height: 0 },
  };

  return <LineProfitLossStudioChart ctx={ctx} state={state} />;
}
