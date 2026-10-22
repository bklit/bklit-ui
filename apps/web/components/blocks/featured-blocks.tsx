import { Children, isValidElement, type ReactNode } from "react";

export function FeaturedBlocks({ blocks }: { blocks: ReactNode[] }) {
  return (
    <section aria-label="Blocks" className="w-full">
      <div className="flex w-full flex-col gap-8 md:gap-12">
        {Children.toArray(blocks).map((block, index) => {
          if (!isValidElement(block)) {
            return null;
          }

          return (
            <div className="w-full min-w-0" key={block.key ?? index}>
              {block}
            </div>
          );
        })}
      </div>
    </section>
  );
}
