"use client";

import Link from "fumadocs-core/link";
import {
  HeroActions,
  HeroDescription,
  HeroShell,
  HeroTitle,
} from "@/components/hero";
import { Button } from "@/components/ui/button";
import { showcaseSubmitUrl } from "@/lib/showcase/constants";

export function ShowcaseHero() {
  return (
    <HeroShell>
      <HeroTitle>Showcase</HeroTitle>

      <HeroDescription>
        Real dashboards and data experiences built with Bklit UI — curated from
        the community.
      </HeroDescription>

      <HeroActions>
        <Button
          nativeButton={false}
          render={<Link external href={showcaseSubmitUrl} />}
          size="lg"
          variant="white"
        >
          Submit yours
        </Button>
      </HeroActions>
    </HeroShell>
  );
}
