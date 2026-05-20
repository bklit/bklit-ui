"use client";

import { StudioDesktopOnly } from "./studio-desktop-only";
import { StudioPreview } from "./studio-preview";
import { StudioSidebar } from "./studio-sidebar";
import { StudioStateProvider } from "./studio-state-provider";

export function StudioShell() {
  return (
    <StudioStateProvider>
      <div className="flex h-full min-h-0 flex-1 flex-col md:hidden">
        <StudioDesktopOnly />
      </div>
      <div className="hidden h-full min-h-0 flex-1 flex-col px-4 py-4 md:flex lg:px-20 lg:py-14">
        <div className="grid h-full min-h-0 flex-1 gap-8 md:grid-cols-[minmax(227px,267px)_minmax(0,1fr)] md:grid-rows-1 lg:grid-cols-[minmax(340px,400px)_minmax(0,1fr)] lg:gap-24 [&>*]:h-full [&>*]:min-h-0">
          <StudioSidebar />
          <StudioPreview />
        </div>
      </div>
    </StudioStateProvider>
  );
}
