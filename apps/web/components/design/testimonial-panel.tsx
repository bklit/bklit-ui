import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
export function DesignTestimonialPanel({
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
      <div
        aria-hidden
        className="absolute inset-0 z-0 bg-white dark:bg-black"
      />
      <div className="relative z-2 flex min-w-0 flex-col p-5 sm:p-8">
        {children}
      </div>
    </div>
  );
}
