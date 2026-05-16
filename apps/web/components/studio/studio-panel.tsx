import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function StudioPanel({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex min-h-0 flex-col overflow-hidden rounded-lg bg-card text-card-foreground ring-1 ring-foreground/10",
        className
      )}
    >
      {children}
    </div>
  );
}
