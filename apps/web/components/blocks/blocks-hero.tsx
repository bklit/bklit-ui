"use client";

import {
  HeroActions,
  HeroBadgeRow,
  HeroDescription,
  HeroShell,
  HeroStudioPill,
  HeroTitle,
} from "@/components/hero";
import { Button } from "@/components/ui/button";

export function BlocksHero() {
  return (
    <HeroShell>
      <HeroBadgeRow>
        <HeroStudioPill />
      </HeroBadgeRow>

      <HeroTitle>Ready to go Blocks</HeroTitle>

      <HeroDescription>
        Beautiful open-source chart blocks for dashboards and analytics. Copy
        and paste into your apps. Works with any React framework.
      </HeroDescription>

      <HeroActions>
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
      </HeroActions>
    </HeroShell>
  );
}
