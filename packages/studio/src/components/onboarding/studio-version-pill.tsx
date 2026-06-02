"use client";

import { ArrowRightIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@/ui/button";
import { ParticleBadge } from "./particle-badge";
import { ShimmeringText } from "./shimmering-text";

export function StudioVersionPill({
  showChevron = true,
  tabIndex,
}: {
  showChevron?: boolean;
  tabIndex?: number;
}) {
  return (
    <ParticleBadge>
      <Button
        aria-label="Studio Version 2"
        className="relative isolate inline-flex h-auto cursor-default items-center gap-0 rounded-full bg-background px-0.5 py-0.5 text-xs"
        tabIndex={tabIndex}
        type="button"
        variant="outline"
      >
        <span className="flex h-6 items-center rounded-full bg-muted px-2.5 text-xs leading-none">
          Studio
        </span>
        <span
          className={
            showChevron
              ? "flex h-6 items-center gap-1 px-2.5 text-xs leading-none"
              : "flex h-6 items-center px-2.5 text-xs leading-none"
          }
        >
          <ShimmeringText className="leading-none" text="Version 2" />
          {showChevron ? (
            <HugeiconsIcon className="size-3.5" icon={ArrowRightIcon} />
          ) : null}
        </span>
      </Button>
    </ParticleBadge>
  );
}
