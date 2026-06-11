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
    <footer className="mt-12 flex items-center justify-between gap-4 border-border border-t pt-6">
      {previous ? (
        <Link
          className="group flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
          href={previous.url}
        >
          <Icon className="size-4" name="IconChevronLeft" />
          <div className="flex flex-col">
            <span className="text-xs">Previous</span>
            <span className="font-medium text-foreground text-sm group-hover:underline">
              {previous.name}
            </span>
          </div>
        </Link>
      ) : (
        <div />
      )}
      {next ? (
        <Link
          className="group flex items-center gap-2 text-right text-muted-foreground transition-colors hover:text-foreground"
          href={next.url}
        >
          <div className="flex flex-col">
            <span className="text-xs">Next</span>
            <span className="font-medium text-foreground text-sm group-hover:underline">
              {next.name}
            </span>
          </div>
          <Icon className="size-4" name="IconChevronRight" />
        </Link>
      ) : (
        <div />
      )}
    </footer>
  );
}
