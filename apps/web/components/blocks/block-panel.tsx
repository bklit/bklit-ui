import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function BlockPanel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-visible border-border border-r border-b",
        className
      )}
    >
      <div aria-hidden className="absolute inset-0 z-0 bg-card" />
      <div className="relative z-2 flex size-full min-h-[inherit] flex-col">
        {children}
      </div>
    </div>
  );
}
