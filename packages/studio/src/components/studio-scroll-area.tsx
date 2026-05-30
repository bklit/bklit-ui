"use client";

import { cn } from "@bklitui/ui/lib/utils";
import type { ReactNode } from "react";

export function StudioScrollArea({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("studio-sidebar-scroll overflow-y-auto", className)}>
      {children}
    </div>
  );
}
