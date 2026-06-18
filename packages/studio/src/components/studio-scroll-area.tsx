"use client";

import { cn } from "@bklitui/ui/lib/utils";
import type { ReactNode } from "react";
import { studioSidebarScrollClass } from "@/lib/studio-chrome-classes";

export function StudioScrollArea({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn(studioSidebarScrollClass, "overflow-y-auto", className)}>
      {children}
    </div>
  );
}
