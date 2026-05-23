"use client";

import { BlockPreviewFrame } from "@/blocks/_shared/preview-frame";
import { StatCardChoropleth } from "./files/components/stat-card-choropleth";

export function StatCardChoroplethPreview() {
  return (
    <BlockPreviewFrame maxWidth={800}>
      <StatCardChoropleth />
    </BlockPreviewFrame>
  );
}
