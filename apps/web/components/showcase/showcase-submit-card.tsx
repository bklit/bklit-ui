"use client";

import Link from "fumadocs-core/link";
import { Button } from "@/components/ui/button";
import { Frame } from "@/components/ui/frame";
import { showcaseSubmitUrl } from "@/lib/showcase/constants";
import { cn } from "@/lib/utils";

export function ShowcaseSubmitCard({ className }: { className?: string }) {
  return (
    <Link
      aria-label="Submit your project to the showcase"
      className={cn(
        "group block h-full rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className
      )}
      external
      href={showcaseSubmitUrl}
    >
      <Frame className="h-full">
        <div className="flex min-h-48 flex-1 flex-col items-center justify-center gap-3 rounded-xl border border-border border-dashed p-6 text-center transition-colors group-hover:border-foreground/20 group-hover:bg-background/60">
          <p className="text-muted-foreground text-sm">
            Built something with Bklit UI?
          </p>
          <Button size="sm" tabIndex={-1} variant="outline">
            Submit yours
          </Button>
        </div>
      </Frame>
    </Link>
  );
}
