"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Pinned footer at the bottom of the properties sidebar (outside the scroll area). */
export function EditorPropertiesSidebarFooter({
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
        "flex shrink-0 flex-col gap-2 border-border/60 border-t p-3 *:w-full",
        className
      )}
    >
      {actions}
    </div>
  );
}
