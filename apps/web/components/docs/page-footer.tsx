"use client";

import { Icon } from "@bklitui/icons";
import Link from "next/link";
import type { ReactNode } from "react";

interface PageFooterProps {
  previous?: {
    name: ReactNode;
    url: string;
  } | null;
  next?: {
    name: ReactNode;
    url: string;
  } | null;
}

export function PageFooter({ previous, next }: PageFooterProps) {
  if (!(previous || next)) {
    return null;
  }

  return (
    <footer className="grid grid-cols-2 gap-1 pt-1 max-lg:mt-4 max-lg:border-border max-lg:border-t max-lg:px-4 max-lg:pt-4">
      {previous ? (
        <Link className={linkClassName} href={previous.url}>
          <Icon
            className="size-4 shrink-0 text-muted-foreground transition-transform duration-150 ease-out group-hover:-translate-x-0.5"
            name="IconChevronLeft"
          />
          <span className="flex min-w-0 flex-col">
            <span className="text-muted-foreground text-xs">Previous</span>
            <span className="truncate font-medium text-foreground text-sm">
              {previous.name}
            </span>
          </span>
        </Link>
      ) : (
        <div />
      )}
      {next ? (
        <Link
          className={`${linkClassName} col-start-2 justify-end text-right`}
          href={next.url}
        >
          <span className="flex min-w-0 flex-col">
            <span className="text-muted-foreground text-xs">Next</span>
            <span className="truncate font-medium text-foreground text-sm">
              {next.name}
            </span>
          </span>
          <Icon
            className="size-4 shrink-0 text-muted-foreground transition-transform duration-150 ease-out group-hover:translate-x-0.5"
            name="IconChevronRight"
          />
        </Link>
      ) : null}
    </footer>
  );
}

/** Frame-foot prev/next tiles (coss frame footer rhythm). */
const linkClassName =
  "group flex min-w-0 items-center gap-3 rounded-xl px-4 py-3 outline-none transition-colors hover:bg-background/64 focus-visible:ring-2 focus-visible:ring-ring dark:hover:bg-background/40";
