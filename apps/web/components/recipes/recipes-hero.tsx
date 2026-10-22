"use client";

import { GridPageHero } from "@/components/design/grid-page-hero";
import { Button } from "@/components/ui/button";

export function RecipesHero() {
  return (
    <GridPageHero
      action={
        <Button
          onClick={() => {
            document
              .getElementById("recipes")
              ?.scrollIntoView({ behavior: "smooth" });
          }}
          size="lg"
          variant="default"
        >
          Browse recipes
        </Button>
      }
      subtitle="Visual style treatments for your charts — preview them, grab the code, or copy a prompt that tells your agent to restyle the charts you already have"
      title="Recipes"
    />
  );
}
