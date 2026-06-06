"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function EditorPropertiesSidebarHeader({
  actions,
  className,
}: {
  actions?: ReactNode;
  className?: string;
}) {
  if (!actions) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-end gap-1 border-border/60 border-b px-3 py-1.5",
        className
      )}
    >
      {actions}
    </div>
  );
}
