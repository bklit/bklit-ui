import type { ReactNode } from "react";
import type { StudioFrameSize } from "@/components/studio/studio-chart-viewport";

export interface StudioRenderContext {
  animationKey: number;
  patternDefs: ReactNode;
  patternFill: string | undefined;
  frame: StudioFrameSize;
}
