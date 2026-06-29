import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { GridCornerDots } from "./line-grid";

export function DesignTestimonialPanel({
  children,
  className,
  showMobileCornerDots = false,
}: {
  children: ReactNode;
  className?: string;
  showMobileCornerDots?: boolean;
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
      {showMobileCornerDots ? (
        <GridCornerDots className="z-3 md:hidden" columns={1} rows={1} />
      ) : null}
    </div>
  );
}
