"use client";

import { StudioPreview } from "./studio-preview";
import { StudioSidebar } from "./studio-sidebar";
import { StudioStateProvider } from "./studio-state-provider";

export function StudioShell() {
  return (
    <StudioStateProvider>
      <div className="flex min-h-0 flex-1 flex-col px-4 py-4 md:px-6">
        <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(280px,320px)_minmax(0,1fr)] lg:gap-6">
          <StudioSidebar />
          <StudioPreview />
        </div>
      </div>
    </StudioStateProvider>
  );
}
