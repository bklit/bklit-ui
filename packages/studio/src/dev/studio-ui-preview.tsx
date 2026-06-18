"use client";

import type { ReactNode } from "react";
import { studioPreviewCanvasClass } from "@/lib/studio-chrome-classes";
import { cn } from "@/lib/utils";
import { StudioThemeProvider } from "@/providers/studio-theme-provider";

/** Matches `EDITOR_PANE_DEFAULT_WIDTH` in editor-collapsible-pane.tsx */
const SIDEBAR_WIDTH = "w-[280px]";

export function StudioUiPreview({
  children,
  wide,
  className,
}: {
  children: ReactNode;
  wide?: boolean;
  className?: string;
}) {
  return (
    <StudioThemeProvider embedded>
      <div
        className={cn(
          studioPreviewCanvasClass,
          "not-prose grid min-h-[inherit] w-full place-items-center p-6"
        )}
      >
        <div
          className={cn(
            "overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm",
            wide ? "w-full max-w-xl" : SIDEBAR_WIDTH,
            className
          )}
        >
          <div className="flex flex-col gap-0 p-3 pb-4">{children}</div>
        </div>
      </div>
    </StudioThemeProvider>
  );
}
