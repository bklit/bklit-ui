import type { Metadata } from "next";
import { BlockExamplesGrid } from "@/components/blocks/block-examples";
import { BlocksHero } from "@/components/blocks/blocks-hero";
import {
  SiteDivider,
  siteContainerClassName,
} from "@/components/design/site-chrome";
import { pageMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const metadata: Metadata = pageMetadata({
  title: "Chart Blocks",
  description:
    "Ready-to-go React chart blocks for dashboards and analytics — stat cards with area, line, and choropleth charts. Install with the shadcn CLI or open in v0.",
  path: "/blocks",
});

export default function BlocksPage() {
  return (
    <main className="flex flex-1 flex-col">
      <BlocksHero />
      <SiteDivider />
      <section
        className={cn(
          siteContainerClassName,
          "scroll-mt-(--site-header-height) pt-8 pb-8 md:pt-12"
        )}
        id="blocks"
      >
        <BlockExamplesGrid />
      </section>
    </main>
  );
}
