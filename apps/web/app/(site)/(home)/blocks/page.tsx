import { BlockExamplesGrid } from "@/components/blocks/block-examples";
import { BlocksHero } from "@/components/blocks/blocks-hero";

export default function BlocksPage() {
  return (
    <main className="flex flex-1 flex-col space-y-24">
      <section className="relative w-full">
        <div className="container mx-auto w-full overflow-visible">
          <BlocksHero />
        </div>
      </section>

      <section
        className="relative w-full pt-8 pb-16 md:pt-12 md:pb-24"
        id="blocks"
      >
        <div className="container mx-auto w-full overflow-visible">
          <BlockExamplesGrid />
        </div>
      </section>
    </main>
  );
}
