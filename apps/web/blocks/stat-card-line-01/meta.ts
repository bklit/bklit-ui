import type { BlockFile } from "@/lib/blocks/types";

export const statCardLine01Meta = {
  name: "Stat Card — Line Chart",
  description:
    "Session KPI card with NumberFlow average, trend badge, and minimal line sparkline.",
  registryName: "stat-card-line-01",
  previewHeight: 720,
} as const;

export interface BlockDisplayProps {
  files: BlockFile[];
  embedded?: boolean;
}
