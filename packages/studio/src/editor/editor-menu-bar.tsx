"use client";

import { ArrowsPointingInIcon } from "@heroicons/react/24/outline";
import { Maximize2, Minus, Plus } from "lucide-react";
import { StudioOpenInStudioButton } from "@/components/studio-open-in-studio-button";
import { StudioSharePopover } from "@/components/studio-share-popover";
import {
  EditorMenuBarTooltipItem,
  StudioToolbarTooltips,
} from "@/components/studio-toolbar-tooltips";
import { EditorReplayButton } from "@/editor/editor-replay-button";
import { EditorSidebarToggle } from "@/editor/editor-sidebar-toggle";
import { EditorThemeToggle } from "@/editor/editor-theme-toggle";
import { cn } from "@/lib/utils";
import { Button } from "@/ui/button";
import { Separator } from "@/ui/separator";

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
  onCenterOnContent,
  onReplay,
  controlsDisabled = false,
  showDimensions = true,
  showThemeToggle = true,
  showFitView = true,
  openInStudioHref,
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
  onCenterOnContent?: () => void;
  onReplay?: () => void;
  controlsDisabled?: boolean;
  showDimensions?: boolean;
  showThemeToggle?: boolean;
  showFitView?: boolean;
  openInStudioHref?: string;
}) {
  const hasLeadingControls =
    Boolean(openInStudioHref) || showSidebarToggle || showThemeToggle;

  return (
    <StudioToolbarTooltips>
      <div
        className={cn(
          "flex shrink-0 items-center gap-1 rounded-full border border-border/80 bg-background/95 p-1 shadow-lg backdrop-blur-sm",
          className
        )}
      >
        {openInStudioHref ? (
          <>
            <StudioOpenInStudioButton href={openInStudioHref} />
            {showSidebarToggle || showThemeToggle || showZoomControls ? (
              <Separator className="mx-0.5 h-5" orientation="vertical" />
            ) : null}
          </>
        ) : null}

        {showSidebarToggle ? (
          <>
            <EditorMenuBarTooltipItem label="Toggle sidebars">
              <EditorSidebarToggle
                onToggle={() => onSidebarsOpenChange(!sidebarsOpen)}
                open={sidebarsOpen}
              />
            </EditorMenuBarTooltipItem>

            <Separator className="mx-0.5 h-5" orientation="vertical" />
          </>
        ) : null}

        {showThemeToggle ? (
          <EditorMenuBarTooltipItem label="Toggle theme (D)">
            <EditorThemeToggle />
          </EditorMenuBarTooltipItem>
        ) : null}

        {showZoomControls ? (
          <>
            {hasLeadingControls ? (
              <Separator
                className="mx-0.5 h-5 shrink-0"
                orientation="vertical"
              />
            ) : null}

            <EditorMenuBarTooltipItem label="Zoom out">
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
            </EditorMenuBarTooltipItem>

            <button
              className="min-w-12 shrink-0 px-1 font-mono text-[11px] text-muted-foreground tabular-nums hover:text-foreground"
              onClick={onResetZoom}
              type="button"
            >
              {Math.round(canvasScale * 100)}%
            </button>

            <EditorMenuBarTooltipItem label="Zoom in">
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
            </EditorMenuBarTooltipItem>

            {showFitView ? (
              <EditorMenuBarTooltipItem label="Zoom to fit (double-click canvas)">
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
              </EditorMenuBarTooltipItem>
            ) : null}

            {onCenterOnContent ? (
              <EditorMenuBarTooltipItem label="Center chart on canvas">
                <Button
                  aria-label="Center chart on canvas"
                  className="size-8"
                  onClick={onCenterOnContent}
                  size="icon-sm"
                  type="button"
                  variant="ghost"
                >
                  <ArrowsPointingInIcon aria-hidden className="size-4" />
                </Button>
              </EditorMenuBarTooltipItem>
            ) : null}

            {onReplay ? (
              <EditorMenuBarTooltipItem label="Replay animation (R)">
                <EditorReplayButton
                  disabled={controlsDisabled}
                  onReplay={onReplay}
                  size="icon-sm"
                />
              </EditorMenuBarTooltipItem>
            ) : null}

            <StudioSharePopover />
          </>
        ) : null}

        {showDimensions ? (
          <>
            <Separator className="mx-0.5 h-5 shrink-0" orientation="vertical" />

            <span className="shrink-0 whitespace-nowrap px-2 font-mono text-[11px] text-muted-foreground tabular-nums">
              {width} × {height}
            </span>
          </>
        ) : null}
      </div>
    </StudioToolbarTooltips>
  );
}
