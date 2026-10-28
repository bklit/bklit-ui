"use client";

import { Icon } from "@bklitui/icons";
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

function MenuBarDivider() {
  return (
    <div
      aria-hidden
      className="mx-1 h-4 w-px shrink-0 bg-border"
      role="presentation"
    />
  );
}

function EditorMenuBarZoomControls({
  canvasScale,
  controlsDisabled,
  onCenterOnContent,
  onFitView,
  onReplay,
  onResetZoom,
  onZoomIn,
  onZoomOut,
  showFitView,
  showShare,
}: {
  canvasScale: number;
  controlsDisabled: boolean;
  onCenterOnContent?: () => void;
  onFitView?: () => void;
  onReplay?: () => void;
  onResetZoom?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  showFitView: boolean;
  showShare: boolean;
}) {
  return (
    <>
      <EditorMenuBarTooltipItem label="Zoom out">
        <Button
          aria-label="Zoom out"
          onClick={onZoomOut}
          size="icon"
          type="button"
          variant="ghost"
        >
          <Icon className="size-4" name="IconMinusSmall" />
        </Button>
      </EditorMenuBarTooltipItem>

      <button
        className="h-8 min-w-12 shrink-0 rounded-lg px-1.5 font-mono text-[11px] text-muted-foreground tabular-nums outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring sm:h-7"
        onClick={onResetZoom}
        type="button"
      >
        {Math.round(canvasScale * 100)}%
      </button>

      <EditorMenuBarTooltipItem label="Zoom in">
        <Button
          aria-label="Zoom in"
          onClick={onZoomIn}
          size="icon"
          type="button"
          variant="ghost"
        >
          <Icon className="size-4" name="IconPlusSmall" />
        </Button>
      </EditorMenuBarTooltipItem>

      {showFitView ? (
        <EditorMenuBarTooltipItem label="Zoom to fit (double-click canvas)">
          <Button
            aria-label="Zoom to fit"
            onClick={onFitView}
            size="icon"
            type="button"
            variant="ghost"
          >
            <Icon className="size-4" name="IconArrowsZoom" />
          </Button>
        </EditorMenuBarTooltipItem>
      ) : null}

      {onCenterOnContent ? (
        <EditorMenuBarTooltipItem label="Center chart on canvas">
          <Button
            aria-label="Center chart on canvas"
            onClick={onCenterOnContent}
            size="icon"
            type="button"
            variant="ghost"
          >
            <Icon aria-hidden className="size-4" name="IconFocusSquare" />
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

      {showShare ? <StudioSharePopover /> : null}
    </>
  );
}

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
  showShare = true,
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
  showShare?: boolean;
  openInStudioHref?: string;
}) {
  const hasLeadingControls =
    Boolean(openInStudioHref) || showSidebarToggle || showThemeToggle;

  return (
    <StudioToolbarTooltips>
      <div
        className={cn(
          "relative flex shrink-0 items-center justify-center gap-0.5 rounded-xl border bg-popover/90 not-dark:bg-clip-padding p-1 text-popover-foreground shadow-[0_8px_24px_-6px_rgb(0_0_0/0.08),0_2px_6px_-2px_rgb(0_0_0/0.05)] backdrop-blur-md [--radius:0.625rem] before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-xl)-1px)] before:shadow-[0_1px_--theme(--color-black/4%)] dark:shadow-[0_8px_24px_-6px_rgb(0_0_0/0.4),0_2px_6px_-2px_rgb(0_0_0/0.25)] dark:before:shadow-[0_-1px_--theme(--color-white/6%)]",
          className
        )}
      >
        {openInStudioHref ? (
          <>
            <StudioOpenInStudioButton href={openInStudioHref} />
            {showSidebarToggle || showThemeToggle || showZoomControls ? (
              <MenuBarDivider />
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

            {showThemeToggle ? <MenuBarDivider /> : null}
          </>
        ) : null}

        {showThemeToggle ? (
          <EditorMenuBarTooltipItem label="Toggle theme (D)">
            <EditorThemeToggle />
          </EditorMenuBarTooltipItem>
        ) : null}

        {showZoomControls ? (
          <>
            {hasLeadingControls ? <MenuBarDivider /> : null}
            <EditorMenuBarZoomControls
              canvasScale={canvasScale}
              controlsDisabled={controlsDisabled}
              onCenterOnContent={onCenterOnContent}
              onFitView={onFitView}
              onReplay={onReplay}
              onResetZoom={onResetZoom}
              onZoomIn={onZoomIn}
              onZoomOut={onZoomOut}
              showFitView={showFitView}
              showShare={showShare}
            />
          </>
        ) : null}

        {showDimensions ? (
          <>
            <MenuBarDivider />

            <span className="shrink-0 whitespace-nowrap px-2 font-mono text-[11px] text-muted-foreground tabular-nums">
              {width} × {height}
            </span>
          </>
        ) : null}
      </div>
    </StudioToolbarTooltips>
  );
}
