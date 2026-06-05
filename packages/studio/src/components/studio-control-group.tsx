"use client";

import { cn } from "@bklitui/ui/lib/utils";
import { ChevronDownIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { studioSectionLabelClass } from "@/components/controls/control-field-helpers";

/**
 * Sidebar section wrapper for a group of studio controls.
 */
export function StudioControlGroup({
  title,
  titleTrailing,
  children,
  className,
  fieldsClassName,
  collapsible = false,
  defaultOpen = true,
}: {
  title: string;
  titleTrailing?: ReactNode;
  children: ReactNode;
  className?: string;
  fieldsClassName?: string;
  collapsible?: boolean;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  useEffect(() => {
    setOpen(defaultOpen);
  }, [defaultOpen]);

  return (
    <section
      className={cn(
        "studio-control-group flex flex-col border-border border-b pb-3",
        className
      )}
      data-studio-control-group={title}
    >
      <header className="studio-control-group-header flex h-10 items-center justify-between gap-2">
        {collapsible ? (
          <button
            aria-expanded={open}
            className="flex min-w-0 flex-1 items-center gap-1.5 text-left"
            onClick={() => setOpen((value) => !value)}
            type="button"
          >
            <ChevronDownIcon
              className={cn(
                "size-3.5 shrink-0 text-muted-foreground transition-transform",
                !open && "-rotate-90"
              )}
            />
            <h3 className={studioSectionLabelClass}>{title}</h3>
          </button>
        ) : (
          <h3 className={studioSectionLabelClass}>{title}</h3>
        )}
        {titleTrailing ? <div className="shrink-0">{titleTrailing}</div> : null}
      </header>
      {open ? (
        <div
          className={cn(
            "studio-control-group-fields min-w-0 space-y-1.5",
            fieldsClassName
          )}
        >
          {children}
        </div>
      ) : null}
    </section>
  );
}
