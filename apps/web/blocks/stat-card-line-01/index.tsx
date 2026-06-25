"use client";

import { BlockViewer } from "@/components/blocks/block-viewer";
import type { BlockDisplayProps } from "./meta";
import { statCardLine01Meta } from "./meta";
import { StatCardLinePreview } from "./preview";

export function StatCardLineBlock({ embedded, ...props }: BlockDisplayProps) {
  return (
    <BlockViewer
      {...statCardLine01Meta}
      {...props}
      embedded={embedded}
      preview={<StatCardLinePreview />}
    />
  );
}
