"use client";

import { GridPageHero } from "@/components/design/grid-page-hero";
import { Button } from "@/components/ui/button";

export function BlocksHero() {
  return (
    <GridPageHero
      action={
        <Button
          onClick={() => {
            document
              .getElementById("blocks")
              ?.scrollIntoView({ behavior: "smooth" });
          }}
          size="lg"
          variant="white"
        >
          Browse blocks
        </Button>
      }
      subtitle="Ready-to-go chart blocks for dashboards and analytics"
      title="Blocks"
    />
  );
}
