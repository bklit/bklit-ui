"use client";

import { BlockPreviewFrame } from "@/blocks/_shared/preview-frame";
import { StatCardLine } from "./files/components/stat-card-line";

export function StatCardLinePreview() {
  return (
    <BlockPreviewFrame>
      <StatCardLine />
    </BlockPreviewFrame>
  );
}
