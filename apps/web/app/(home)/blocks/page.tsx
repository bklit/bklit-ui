import { BlockExamplesGrid } from "@/components/blocks/block-examples";
import { BlocksHero } from "@/components/blocks/blocks-hero";

export default function BlocksPage() {
  return (
    <>
      <section className="flex flex-col items-center px-4 py-18 text-center">
        <BlocksHero />
      </section>

      <div
        className="mx-auto w-full max-w-7xl scroll-mt-14 px-6 py-8"
        id="blocks"
      >
        <BlockExamplesGrid />
      </div>
    </>
  );
}
