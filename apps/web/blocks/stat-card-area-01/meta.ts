import type { BlockFile } from "@/lib/blocks/types";

export const statCardArea01Meta = {
  name: "Stat Card — Area Chart",
  description:
    "Compact KPI card with animated average, trend badge, and axis-free area sparkline.",
  registryName: "stat-card-area-01",
  previewHeight: 720,
} as const;

export interface BlockDisplayProps {
  files: BlockFile[];
  embedded?: boolean;
}
