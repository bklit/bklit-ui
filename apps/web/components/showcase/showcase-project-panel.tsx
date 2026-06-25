import type { ReactNode } from "react";
import { GridCornerDots } from "@/components/design/line-grid";
import { cn } from "@/lib/utils";

export function ShowcaseProjectPanel({
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
        "relative min-h-[260px] overflow-visible border-border border-r border-b md:min-h-[320px]",
        className
      )}
    >
      <div
        aria-hidden
        className="absolute inset-0 z-0 bg-white dark:bg-black"
      />
      <div className="relative z-2 flex size-full min-h-[inherit] flex-col">
        {children}
      </div>
      {showMobileCornerDots ? (
        <GridCornerDots className="z-3 md:hidden" columns={1} rows={1} />
      ) : null}
    </div>
  );
}
