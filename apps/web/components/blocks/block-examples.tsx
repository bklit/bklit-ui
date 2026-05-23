import { getFeaturedBlockElements } from "@/blocks";
import { FeaturedBlocks } from "@/components/blocks/featured-blocks";

export function BlockExamplesGrid() {
  return (
    <div className="space-y-6">
      <FeaturedBlocks blocks={getFeaturedBlockElements()} />
    </div>
  );
}
