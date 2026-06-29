import { getFeaturedBlockElements } from "@/blocks";
import { FeaturedBlocks } from "@/components/blocks/featured-blocks";

export function BlockExamplesGrid() {
  return <FeaturedBlocks blocks={getFeaturedBlockElements()} />;
}
