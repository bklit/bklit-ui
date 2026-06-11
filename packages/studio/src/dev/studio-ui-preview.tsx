"use client";

import { type ReactNode, Suspense } from "react";
import { StudioStateProvider } from "@/components/studio-state-provider";
import { cn } from "@/lib/utils";
import { StudioNuqsAdapter } from "@/providers/studio-nuqs-adapter";
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
    <StudioNuqsAdapter>
      <Suspense
        fallback={
          <div className="studio-preview-canvas not-prose grid min-h-[inherit] w-full place-items-center p-6" />
        }
      >
        <StudioStateProvider embedded>
          <StudioThemeProvider embedded>
            <div className="studio-preview-canvas not-prose grid min-h-[inherit] w-full place-items-center p-6">
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
        </StudioStateProvider>
      </Suspense>
    </StudioNuqsAdapter>
  );
}
