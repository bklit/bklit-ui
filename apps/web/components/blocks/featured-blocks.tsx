import { Children, type ReactNode } from "react";
import { BlockPanel } from "@/components/blocks/block-panel";
import { DesignSectionRulers } from "@/components/design/design-section-rulers";
import { GridCornerDots } from "@/components/design/line-grid";

export function FeaturedBlocks({ blocks }: { blocks: ReactNode[] }) {
  return (
    <section aria-label="Blocks" className="w-full">
      <div className="flex w-full flex-col space-y-24">
        {Children.toArray(blocks).map((block) => (
          <div
            className="relative w-full overflow-visible border-border border-t border-l"
            key={block.key}
          >
            <BlockPanel>{block}</BlockPanel>
            <GridCornerDots className="z-3" columns={1} rows={1} />
            <DesignSectionRulers />
          </div>
        ))}
      </div>
    </section>
  );
}
