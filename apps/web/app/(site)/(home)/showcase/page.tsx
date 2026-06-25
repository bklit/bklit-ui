import type { Metadata } from "next";
import { ShowcaseGrid } from "@/components/showcase/showcase-grid";
import { ShowcaseHero } from "@/components/showcase/showcase-hero";

export const metadata: Metadata = {
  title: "Showcase",
  description:
    "Real dashboards and data experiences built with Bklit UI — curated from the community.",
};

export default function ShowcasePage() {
  return (
    <main className="flex flex-1 flex-col space-y-24">
      <section className="relative w-full">
        <div className="container mx-auto w-full overflow-visible">
          <ShowcaseHero />
        </div>
      </section>

      <section className="relative w-full pt-8 pb-16 md:pt-12 md:pb-24">
        <div className="container mx-auto w-full overflow-visible">
          <ShowcaseGrid />
        </div>
      </section>
    </main>
  );
}
