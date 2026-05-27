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
    <>
      <section className="flex flex-col items-center px-4 py-18 text-center">
        <ShowcaseHero />
      </section>

      <div className="mx-auto w-full max-w-7xl scroll-mt-14 px-6 py-8">
        <ShowcaseGrid />
      </div>
    </>
  );
}
