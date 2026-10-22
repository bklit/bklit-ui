import type { Metadata } from "next";
import {
  SiteDivider,
  siteContainerClassName,
} from "@/components/design/site-chrome";
import { RecipesGallery } from "@/components/recipes/recipes-gallery";
import { RecipesHero } from "@/components/recipes/recipes-hero";
import { pageMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const metadata: Metadata = pageMetadata({
  title: "Chart Recipes",
  description:
    "Visual style recipes for Bklit UI charts — faded pattern backgrounds, squircle bars, custom hover indicators, event markers, forecasts, range bands, heatmap and donut looks — with code and copy-ready AI prompts.",
  path: "/recipes",
});

export default function RecipesPage() {
  return (
    <main className="flex flex-1 flex-col">
      <RecipesHero />
      <SiteDivider />
      <section
        className={cn(
          siteContainerClassName,
          "scroll-mt-(--site-header-height) pt-8 pb-12 md:pt-12"
        )}
        id="recipes"
      >
        <RecipesGallery />
      </section>
    </main>
  );
}
