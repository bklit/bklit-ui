import type { ReactNode } from "react";

export function FeaturedBlocks({ blocks }: { blocks: ReactNode[] }) {
  return <div className="flex flex-col gap-16">{blocks}</div>;
}
