"use client";

import { BlockViewer } from "@/components/blocks/block-viewer";
import type { BlockDisplayProps } from "./meta";
import { statCardArea01Meta } from "./meta";
import { StatCardAreaPreview } from "./preview";

export function StatCardAreaBlock({ embedded, ...props }: BlockDisplayProps) {
  return (
    <BlockViewer
      {...statCardArea01Meta}
      {...props}
      embedded={embedded}
      preview={<StatCardAreaPreview />}
    />
  );
}
