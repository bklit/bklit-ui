"use client";

import { BlockPreviewFrame } from "@/blocks/_shared/preview-frame";
import { StatCardArea } from "./files/components/stat-card-area";

export function StatCardAreaPreview() {
  return (
    <BlockPreviewFrame>
      <StatCardArea />
    </BlockPreviewFrame>
  );
}
