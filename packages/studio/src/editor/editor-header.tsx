import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function EditorHeader({
  className,
  left,
  right,
}: {
  className?: string;
  left?: ReactNode;
  right?: ReactNode;
}) {
  return (
    <header
      className={cn(
        "flex h-11 shrink-0 items-center justify-between border-border border-b bg-background px-3",
        className
      )}
    >
      <div className="flex min-w-0 items-center gap-2">{left}</div>
      <div className="flex shrink-0 items-center gap-2">{right}</div>
    </header>
  );
}
