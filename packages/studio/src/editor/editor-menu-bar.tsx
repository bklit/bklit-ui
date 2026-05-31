"use client";

import { Maximize2, Minus, Plus } from "lucide-react";
import { StudioToolbarTooltips } from "@/components/studio-toolbar-tooltips";
import { EditorSidebarToggle } from "@/editor/editor-sidebar-toggle";
import { EditorThemeToggle } from "@/editor/editor-theme-toggle";
import { cn } from "@/lib/utils";
import { Button } from "@/ui/button";
import { Separator } from "@/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/ui/tooltip";

export function EditorMenuBar({
  className,
  width,
  height,
  sidebarsOpen,
  showSidebarToggle = true,
  onSidebarsOpenChange,
  showZoomControls = false,
  canvasScale = 1,
  onZoomIn,
  onZoomOut,
  onFitView,
  onResetZoom,
}: {
  className?: string;
  width: number;
  height: number;
  sidebarsOpen: boolean;
  showSidebarToggle?: boolean;
  showZoomControls?: boolean;
  canvasScale?: number;
  onSidebarsOpenChange: (open: boolean) => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onFitView?: () => void;
  onResetZoom?: () => void;
}) {
  return (
    <StudioToolbarTooltips>
      <div
        className={cn(
          "flex shrink-0 items-center gap-1 rounded-full border border-border/80 bg-background/95 p-1 shadow-lg backdrop-blur-sm",
          className
        )}
      >
        {showSidebarToggle ? (
          <>
            <EditorSidebarToggle
              onToggle={() => onSidebarsOpenChange(!sidebarsOpen)}
              open={sidebarsOpen}
            />

            <Separator className="mx-0.5 h-5" orientation="vertical" />
          </>
        ) : null}

        <EditorThemeToggle />

        {showZoomControls ? (
          <>
            <Separator className="mx-0.5 h-5 shrink-0" orientation="vertical" />

            <Tooltip>
              <TooltipTrigger render={<span className="inline-flex" />}>
                <Button
                  aria-label="Zoom out"
                  className="size-8"
                  onClick={onZoomOut}
                  size="icon-sm"
                  type="button"
                  variant="ghost"
                >
                  <Minus />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">Zoom out</TooltipContent>
            </Tooltip>

            <button
              className="min-w-12 shrink-0 px-1 font-mono text-[11px] text-muted-foreground tabular-nums hover:text-foreground"
              onClick={onResetZoom}
              type="button"
            >
              {Math.round(canvasScale * 100)}%
            </button>

            <Tooltip>
              <TooltipTrigger render={<span className="inline-flex" />}>
                <Button
                  aria-label="Zoom in"
                  className="size-8"
                  onClick={onZoomIn}
                  size="icon-sm"
                  type="button"
                  variant="ghost"
                >
                  <Plus />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Zoom in</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger render={<span className="inline-flex" />}>
                <Button
                  aria-label="Zoom to fit"
                  className="size-8"
                  onClick={onFitView}
                  size="icon-sm"
                  type="button"
                  variant="ghost"
                >
                  <Maximize2 />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Zoom to fit (double-click canvas)</TooltipContent>
            </Tooltip>
          </>
        ) : null}

        <Separator className="mx-0.5 h-5 shrink-0" orientation="vertical" />

        <span className="shrink-0 whitespace-nowrap px-2 font-mono text-[11px] text-muted-foreground tabular-nums">
          {width} × {height}
        </span>
      </div>
    </StudioToolbarTooltips>
  );
}
