"use client";

import { cn } from "@bklitui/ui/lib/utils";
import type { ReactNode } from "react";

/**
 * Sidebar section wrapper for a group of studio controls.
 * Customize layout and styling here as the design evolves.
 */
export function StudioControlGroup({
  title,
  titleTrailing,
  children,
  className,
  fieldsClassName,
}: {
  title: string;
  /** Optional control aligned to the end of the group title row (e.g. reset). */
  titleTrailing?: ReactNode;
  children: ReactNode;
  className?: string;
  fieldsClassName?: string;
}) {
  return (
    <section
      className={cn("studio-control-group flex flex-col gap-5", className)}
      data-studio-control-group={title}
    >
      <header className="studio-control-group-header flex items-center justify-between gap-2">
        <h3 className="font-medium text-[11px] text-muted-foreground uppercase tracking-wider">
          {title}
        </h3>
        {titleTrailing ? <div className="shrink-0">{titleTrailing}</div> : null}
      </header>
      <div
        className={cn(
          "studio-control-group-fields min-w-0 space-y-3.5",
          fieldsClassName
        )}
      >
        {children}
      </div>
    </section>
  );
}
