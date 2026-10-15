import { BlockExamplesGrid } from "@/components/blocks/block-examples";
import { BlocksHero } from "@/components/blocks/blocks-hero";
import {
  SiteDivider,
  siteContainerClassName,
} from "@/components/design/site-chrome";
import { cn } from "@/lib/utils";

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
