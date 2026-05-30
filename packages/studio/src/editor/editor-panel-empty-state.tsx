"use client";

import type { ReactNode } from "react";

export function EditorPanelEmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-[120px] flex-1 flex-col items-center justify-center p-6 text-center">
      <p className="max-w-[220px] text-balance text-muted-foreground text-sm">
        {children}
      </p>
    </div>
  );
}
