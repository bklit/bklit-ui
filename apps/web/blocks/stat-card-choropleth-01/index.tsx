"use client";

import { BlockViewer } from "@/components/blocks/block-viewer";
import type { BlockDisplayProps } from "./meta";
import { statCardChoropleth01Meta } from "./meta";
import { StatCardChoroplethPreview } from "./preview";

export function StatCardChoroplethBlock({
  embedded,
  ...props
}: BlockDisplayProps) {
  return (
    <BlockViewer
      {...statCardChoropleth01Meta}
      {...props}
      embedded={embedded}
      preview={<StatCardChoroplethPreview />}
    />
  );
}
