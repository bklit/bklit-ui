"use client";

import {
  type ChartMarker,
  MarkerTooltipContent,
  useActiveMarkers,
} from "@bklitui/ui/charts";

interface MarkerContentDemoProps {
  markers: ChartMarker[];
}

export function MarkerContentDemo({ markers }: MarkerContentDemoProps) {
  const activeMarkers = useActiveMarkers(markers);
  if (activeMarkers.length === 0) {
    return null;
  }
  return <MarkerTooltipContent markers={activeMarkers} />;
}
