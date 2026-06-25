"use client";

import Link from "fumadocs-core/link";
import { GridPageHero } from "@/components/design/grid-page-hero";
import { Button } from "@/components/ui/button";
import { showcaseSubmitUrl } from "@/lib/showcase/constants";

export function ShowcaseHero() {
  return (
    <GridPageHero
      action={
        <Button
          nativeButton={false}
          render={<Link external href={showcaseSubmitUrl} />}
          size="lg"
          variant="white"
        >
          Submit yours
        </Button>
      }
      subtitle="Real dashboards and data experiences built with Bklit UI"
      title="Showcase"
    />
  );
}
