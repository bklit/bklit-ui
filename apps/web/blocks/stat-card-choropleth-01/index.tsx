"use client";

import { BlockViewer } from "@/components/blocks/block-viewer";
import type { BlockDisplayProps } from "./meta";
import { statCardChoropleth01Meta } from "./meta";
import { StatCardChoroplethPreview } from "./preview";

export function StatCardChoroplethBlock(props: BlockDisplayProps) {
  return (
    <BlockViewer
      {...statCardChoropleth01Meta}
      {...props}
      preview={<StatCardChoroplethPreview />}
    />
  );
}
