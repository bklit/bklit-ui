"use client";

import { ArrowRightIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

function StudioPill() {
  return (
    <Button
      className="h-auto rounded-full px-0.5 py-0.5"
      nativeButton={false}
      render={<Link href="/studio" title="Studio" />}
      size="lg"
      variant="outline"
    >
      <span className="flex items-center gap-1 rounded-full bg-muted px-2.5 py-1">
        Introducing
      </span>
      <span className="flex items-center gap-1 px-2.5 py-1">
        Studio
        <HugeiconsIcon icon={ArrowRightIcon} size={14} />
      </span>
    </Button>
  );
}

export function BlocksHero() {
  return (
    <div className="max-w-xl space-y-5">
      <div className="mx-auto flex w-fit">
        <StudioPill />
      </div>

      <h1 className="font-bold text-2xl sm:text-4xl">Ready to go Blocks</h1>

      <p className="text-lg sm:text-xl">
        Beautiful open-source chart blocks for dashboards and analytics. Copy
        and paste into your apps. Works with any React framework.
      </p>

      <div className="flex flex-col items-center justify-center">
        <Button
          onClick={() => {
            document
              .getElementById("blocks")
              ?.scrollIntoView({ behavior: "smooth" });
          }}
          size="lg"
          variant="white"
        >
          Browse Blocks
        </Button>
      </div>
    </div>
  );
}
