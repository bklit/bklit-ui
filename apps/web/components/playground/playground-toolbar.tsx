"use client";

import { Icon } from "@bklitui/icons";
import {
  VIEWPORT_PRESETS,
  type ViewportPreset,
} from "@/components/playground/resizable-preview";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PlaygroundToolbar({
  className,
  width,
  height,
  viewport,
  onViewportChange,
  onReplay,
}: {
  className?: string;
  width: number;
  height: number;
  viewport: ViewportPreset;
  onViewportChange: (preset: ViewportPreset) => void;
  onReplay: () => void;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 rounded-lg border border-border bg-muted/40 p-2",
        className
      )}
    >
      <div className="flex items-center gap-1">
        {(Object.keys(VIEWPORT_PRESETS) as ViewportPreset[]).map((preset) => (
          <Button
            key={preset}
            onClick={() => onViewportChange(preset)}
            size="sm"
            type="button"
            variant={viewport === preset ? "default" : "outline"}
          >
            {VIEWPORT_PRESETS[preset].label}
          </Button>
        ))}
      </div>

      <div className="ml-auto flex items-center gap-2">
        <span className="font-mono text-muted-foreground text-xs tabular-nums">
          {width} × {height}
        </span>
        <Button onClick={onReplay} size="sm" type="button" variant="outline">
          <Icon
            className="size-3.5"
            data-icon="inline-start"
            name="IconArrowRotateClockwise"
          />
          Replay
        </Button>
      </div>
    </div>
  );
}
