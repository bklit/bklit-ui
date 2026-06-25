import { readBlockFiles } from "@/lib/blocks/read-block-files";
import {
  statCardArea01Files,
  statCardChoropleth01Files,
  statCardLine01Files,
} from "./manifest";
import { StatCardAreaBlock } from "./stat-card-area-01";
import { StatCardChoroplethBlock } from "./stat-card-choropleth-01";
import { StatCardLineBlock } from "./stat-card-line-01";

export function getFeaturedBlockElements() {
  const areaFiles = readBlockFiles("stat-card-area-01", statCardArea01Files);
  const lineFiles = readBlockFiles("stat-card-line-01", statCardLine01Files);
  const choroplethFiles = readBlockFiles(
    "stat-card-choropleth-01",
    statCardChoropleth01Files
  );

  return [
    <StatCardAreaBlock embedded files={areaFiles} key="stat-card-area-01" />,
    <StatCardLineBlock embedded files={lineFiles} key="stat-card-line-01" />,
    <StatCardChoroplethBlock
      embedded
      files={choroplethFiles}
      key="stat-card-choropleth-01"
    />,
  ];
}
