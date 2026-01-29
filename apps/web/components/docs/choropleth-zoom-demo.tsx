"use client";

import {
  ChoroplethChart,
  ChoroplethFeatureComponent,
  ChoroplethTooltip,
  useChoroplethZoom,
} from "@bklitui/ui/charts";
import { RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWorldDataStandalone } from "./use-world-data";

function ZoomControls() {
  const { zoom } = useChoroplethZoom();

  if (!zoom) {
    return null;
  }

  return (
    <div className="absolute top-3 right-3 flex flex-col gap-1">
      <Button
        onClick={() => zoom.scale({ scaleX: 1.2, scaleY: 1.2 })}
        size="icon-sm"
        variant="outline"
      >
        <ZoomIn className="size-4" />
      </Button>
      <Button
        onClick={() => zoom.scale({ scaleX: 0.8, scaleY: 0.8 })}
        size="icon-sm"
        variant="outline"
      >
        <ZoomOut className="size-4" />
      </Button>
      <Button onClick={() => zoom.reset()} size="icon-sm" variant="outline">
        <RotateCcw className="size-4" />
      </Button>
    </div>
  );
}

export function ChoroplethZoomDemo() {
  const { worldData, isLoading } = useWorldDataStandalone();

  if (isLoading) {
    return (
      <div className="flex h-full min-h-[300px] items-center justify-center">
        <div className="animate-pulse text-muted-foreground">
          Loading map data...
        </div>
      </div>
    );
  }

  if (!worldData) {
    return (
      <div className="flex h-full min-h-[300px] items-center justify-center">
        <div className="text-destructive">Failed to load map data</div>
      </div>
    );
  }

  return (
    <ChoroplethChart aspectRatio="16 / 9" data={worldData} zoomEnabled>
      <ChoroplethFeatureComponent fill="var(--chart-1)" />
      <ChoroplethTooltip />
      <ZoomControls />
    </ChoroplethChart>
  );
}
