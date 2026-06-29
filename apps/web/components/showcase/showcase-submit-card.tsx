"use client";

import Link from "fumadocs-core/link";
import { Button } from "@/components/ui/button";
import { showcaseSubmitUrl } from "@/lib/showcase/constants";
import { cn } from "@/lib/utils";

export function ShowcaseSubmitCard({
  className,
  embedded = false,
}: {
  className?: string;
  embedded?: boolean;
}) {
  return (
    <Link
      aria-label="Submit your project to the showcase"
      className={cn(
        "group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        embedded ? "size-full min-h-[inherit]" : "rounded-xl",
        className
      )}
      external
      href={showcaseSubmitUrl}
    >
      <div
        className={cn(
          "flex flex-col items-center justify-center bg-card/40 p-4 transition-colors hover:bg-card/70",
          embedded
            ? "size-full min-h-[inherit] border border-border border-dashed"
            : "aspect-[4/3] rounded-xl border border-border border-dashed hover:border-foreground/20"
        )}
      >
        <Button
          className="opacity-50 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
          size="sm"
          tabIndex={-1}
          variant="outline"
        >
          Submit yours
        </Button>
      </div>
    </Link>
  );
}
