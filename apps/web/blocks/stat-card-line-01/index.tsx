"use client";

import { BlockViewer } from "@/components/blocks/block-viewer";
import type { BlockDisplayProps } from "./meta";
import { statCardLine01Meta } from "./meta";
import { StatCardLinePreview } from "./preview";

export function StatCardLineBlock(props: BlockDisplayProps) {
  return (
    <BlockViewer
      {...statCardLine01Meta}
      {...props}
      preview={<StatCardLinePreview />}
    />
  );
}
