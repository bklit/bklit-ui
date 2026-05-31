"use client";

import { createContext, type ReactNode, useContext } from "react";
import { TooltipProvider } from "@/ui/tooltip";

type StudioToolbarTooltipSide = "top" | "bottom";

const StudioToolbarTooltipSideContext =
  createContext<StudioToolbarTooltipSide>("top");

export function useStudioToolbarTooltipSide() {
  return useContext(StudioToolbarTooltipSideContext);
}

/** Shared tooltip timing for studio toolbars — matches Base UI grouped hover behavior. */
export const STUDIO_TOOLBAR_TOOLTIP_PROVIDER_PROPS = {
  closeDelay: 0,
  delay: 0,
  timeout: 400,
} as const;

export function StudioToolbarTooltips({
  children,
  side = "top",
}: {
  children: ReactNode;
  side?: StudioToolbarTooltipSide;
}) {
  return (
    <StudioToolbarTooltipSideContext.Provider value={side}>
      <TooltipProvider {...STUDIO_TOOLBAR_TOOLTIP_PROVIDER_PROPS}>
        {children}
      </TooltipProvider>
    </StudioToolbarTooltipSideContext.Provider>
  );
}
