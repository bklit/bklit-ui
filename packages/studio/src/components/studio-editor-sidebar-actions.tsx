"use client";

import type { ReactNode } from "react";
import { StudioCodeSheetTrigger } from "@/components/studio-code-sheet-trigger";
import type { StudioUrlState } from "@/lib/studio-parsers";

export function StudioEditorSidebarActions({
  state,
  renderCodeSheet,
}: {
  state: StudioUrlState;
  renderCodeSheet?: (state: StudioUrlState) => ReactNode;
}) {
  return renderCodeSheet ? (
    renderCodeSheet(state)
  ) : (
    <StudioCodeSheetTrigger
      state={state}
      triggerClassName="font-mono text-xs"
      triggerSize="sm"
    />
  );
}
