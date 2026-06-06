"use client";

import {
  createContext,
  type ReactElement,
  type ReactNode,
  useContext,
} from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/ui/tooltip";

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

export function EditorMenuBarTooltipItem({
  label,
  children,
}: {
  label: ReactNode;
  children: ReactElement;
}) {
  const side = useStudioToolbarTooltipSide();

  return (
    <Tooltip>
      <TooltipTrigger render={<span className="inline-flex" />}>
        {children}
      </TooltipTrigger>
      <TooltipContent side={side}>{label}</TooltipContent>
    </Tooltip>
  );
}
