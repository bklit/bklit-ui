import type { BlockFile } from "@/lib/blocks/types";

export const statCardChoropleth01Meta = {
  name: "Stat Card — Choropleth",
  description:
    "Visitor map card with trend badge and axis-free choropleth sparkline.",
  registryName: "stat-card-choropleth-01",
  previewHeight: 480,
} as const;

export interface BlockDisplayProps {
  files: BlockFile[];
}
