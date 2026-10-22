import type { Metadata } from "next";
import {
  SiteDivider,
  siteContainerClassName,
} from "@/components/design/site-chrome";
import { ShowcaseGrid } from "@/components/showcase/showcase-grid";
import { ShowcaseHero } from "@/components/showcase/showcase-hero";
import { pageMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const metadata: Metadata = pageMetadata({
  title: "Showcase",
  description:
    "Real dashboards and data experiences built with Bklit UI — curated from the community.",
  path: "/showcase",
});

export default function ShowcasePage() {
  return (
    <main className="flex flex-1 flex-col">
      <ShowcaseHero />
      <SiteDivider />
      <section className={cn(siteContainerClassName, "pt-8 pb-8 md:pt-12")}>
        <ShowcaseGrid />
      </section>
    </main>
  );
}
