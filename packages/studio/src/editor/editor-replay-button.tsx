"use client";

import { Refresh01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback, useState } from "react";
import { useStudioToolbarTooltipSide } from "@/components/studio-toolbar-tooltips";
import { cn } from "@/lib/utils";
import { Button } from "@/ui/button";
import { Spinner } from "@/ui/spinner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/ui/tooltip";

const REPLAY_BUSY_MS = 650;

const iconSwapStyle = {
  transition:
    "opacity 300ms ease-out, filter 300ms ease-out, transform 300ms ease-out",
} as const;

export function EditorReplayButton({
  className,
  disabled = false,
  iconSize = 16,
  onReplay,
  size = "icon-sm",
}: {
  className?: string;
  disabled?: boolean;
  iconSize?: number;
  onReplay: () => void;
  size?: "icon" | "icon-sm" | "icon-xs";
}) {
  const [busy, setBusy] = useState(false);

  const handleClick = useCallback(() => {
    if (busy || disabled) {
      return;
    }
    setBusy(true);
    onReplay();
    window.setTimeout(() => setBusy(false), REPLAY_BUSY_MS);
  }, [busy, disabled, onReplay]);

  const tooltipSide = useStudioToolbarTooltipSide();

  return (
    <Tooltip>
      <TooltipTrigger render={<span className="inline-flex" />}>
        <Button
          aria-keyshortcuts="R"
          aria-label="Replay animation"
          className={cn(className)}
          disabled={busy || disabled}
          onClick={handleClick}
          size={size}
          type="button"
          variant="ghost"
        >
          <span className="relative block size-4">
            <span
              className="absolute inset-0 flex items-center justify-center"
              style={{
                ...iconSwapStyle,
                opacity: busy ? 0 : 1,
                filter: busy ? "blur(4px)" : "blur(0px)",
                transform: busy ? "scale(0.85)" : "scale(1)",
              }}
            >
              <HugeiconsIcon
                icon={Refresh01Icon}
                size={iconSize}
                strokeWidth={1.75}
              />
            </span>
            <span
              className="absolute inset-0 flex items-center justify-center"
              style={{
                ...iconSwapStyle,
                opacity: busy ? 1 : 0,
                filter: busy ? "blur(0px)" : "blur(4px)",
                transform: busy ? "scale(1)" : "scale(0.85)",
              }}
            >
              <Spinner />
            </span>
          </span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side={tooltipSide}>Replay animation (R)</TooltipContent>
    </Tooltip>
  );
}
