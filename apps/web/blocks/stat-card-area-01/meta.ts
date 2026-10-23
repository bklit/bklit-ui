import type { BlockFile } from "@/lib/blocks/types";

export const statCardArea01Meta = {
  name: "Stat Card — Area Chart",
  description:
    "Compact KPI card with animated average, trend badge, and a gradient AreaSparkline that swaps in the hovered month.",
  registryName: "stat-card-area-01",
  previewHeight: 720,
} as const;

export interface BlockDisplayProps {
  files: BlockFile[];
  embedded?: boolean;
}
