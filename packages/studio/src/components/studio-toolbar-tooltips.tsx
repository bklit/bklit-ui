"use client";

import {
  createContext,
  type ReactElement,
  type ReactNode,
  useContext,
  useEffect,
  useState,
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

const StudioToolbarMountedContext = createContext(false);

export function useStudioToolbarTooltipSide() {
  return useContext(StudioToolbarTooltipSideContext);
}

export function useStudioToolbarMounted() {
  return useContext(StudioToolbarMountedContext);
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <StudioToolbarMountedContext.Provider value={mounted}>
      <StudioToolbarTooltipSideContext.Provider value={side}>
        {mounted ? (
          <TooltipProvider {...STUDIO_TOOLBAR_TOOLTIP_PROVIDER_PROPS}>
            {children}
          </TooltipProvider>
        ) : (
          children
        )}
      </StudioToolbarTooltipSideContext.Provider>
    </StudioToolbarMountedContext.Provider>
  );
}

export function EditorMenuBarTooltipItem({
  label,
  children,
}: {
  label: ReactNode;
  children: ReactElement;
}) {
  const mounted = useStudioToolbarMounted();
  const side = useStudioToolbarTooltipSide();

  if (!mounted) {
    return children;
  }

  return (
    <Tooltip>
      <TooltipTrigger render={<span className="inline-flex" />}>
        {children}
      </TooltipTrigger>
      <TooltipContent side={side}>{label}</TooltipContent>
    </Tooltip>
  );
}
