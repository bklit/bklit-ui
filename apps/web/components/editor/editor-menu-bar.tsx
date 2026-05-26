"use client";

import { Monitor, Smartphone, Tablet } from "lucide-react";
import { useEffect } from "react";
import { EditorReplayButton } from "@/components/editor/editor-replay-button";
import { EditorSidebarToggle } from "@/components/editor/editor-sidebar-toggle";
import { EditorThemeToggle } from "@/components/editor/editor-theme-toggle";
import type { ViewportPreset } from "@/components/editor/viewport-presets";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const VIEWPORT_ICONS = {
  mobile: Smartphone,
  tablet: Tablet,
  desktop: Monitor,
} as const;

const VIEWPORT_LABELS: Record<ViewportPreset, string> = {
  mobile: "Mobile",
  tablet: "Tablet",
  desktop: "Desktop",
};

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  const tag = target.tagName;
  return (
    target.isContentEditable ||
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT"
  );
}

function ViewportButton({
  preset,
  active,
  onSelect,
}: {
  preset: ViewportPreset;
  active: boolean;
  onSelect: (preset: ViewportPreset) => void;
}) {
  const Icon = VIEWPORT_ICONS[preset];

  return (
    <Tooltip>
      <TooltipTrigger render={<span className="inline-flex" />}>
        <Button
          aria-label={VIEWPORT_LABELS[preset]}
          aria-pressed={active}
          className={cn("size-8", active && "bg-muted text-foreground")}
          onClick={() => onSelect(preset)}
          size="icon-sm"
          type="button"
          variant="ghost"
        >
          <Icon />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{VIEWPORT_LABELS[preset]}</TooltipContent>
    </Tooltip>
  );
}

export function EditorMenuBar({
  className,
  viewport,
  width,
  height,
  sidebarsOpen,
  showSidebarToggle = true,
  showViewportToggles = true,
  onSidebarsOpenChange,
  onViewportChange,
  onReplay,
}: {
  className?: string;
  viewport: ViewportPreset | null;
  width: number;
  height: number;
  sidebarsOpen: boolean;
  showSidebarToggle?: boolean;
  showViewportToggles?: boolean;
  onSidebarsOpenChange: (open: boolean) => void;
  onViewportChange: (preset: ViewportPreset) => void;
  onReplay: () => void;
}) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "r" && event.key !== "R") {
        return;
      }
      if (event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }
      if (isTypingTarget(event.target)) {
        return;
      }
      event.preventDefault();
      onReplay();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onReplay]);

  return (
    <TooltipProvider>
      <div
        className={cn(
          "flex items-center gap-1 rounded-full border border-border/80 bg-background/95 p-1 shadow-lg backdrop-blur-sm",
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

        {showViewportToggles ? (
          <>
            {(Object.keys(VIEWPORT_ICONS) as ViewportPreset[]).map((preset) => (
              <ViewportButton
                active={viewport === preset}
                key={preset}
                onSelect={onViewportChange}
                preset={preset}
              />
            ))}

            <Separator className="mx-0.5 h-5" orientation="vertical" />
          </>
        ) : null}

        <EditorReplayButton onReplay={onReplay} />

        <Separator className="mx-0.5 h-5" orientation="vertical" />

        <EditorThemeToggle />

        <Separator className="mx-0.5 h-5" orientation="vertical" />

        <span className="px-2 font-mono text-[11px] text-muted-foreground tabular-nums">
          {width} × {height}
        </span>
      </div>
    </TooltipProvider>
  );
}
