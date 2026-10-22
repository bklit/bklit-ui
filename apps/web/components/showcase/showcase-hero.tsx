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
          render={<Link external href={showcaseSubmitUrl} />}
          size="lg"
          variant="default"
        >
          Submit yours
        </Button>
      }
      subtitle="Real dashboards and data experiences built with Bklit UI"
      title="Showcase"
    />
  );
}
