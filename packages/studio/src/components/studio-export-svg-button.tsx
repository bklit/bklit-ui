"use client";

import { Download01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useStudioToolbarTooltipSide } from "@/components/studio-toolbar-tooltips";
import { Button } from "@/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/ui/tooltip";

export function StudioExportSvgButton({
  className,
  disabled,
  iconSize = 20,
  onExport,
  size = "icon-lg",
  variant = "outline",
}: {
  className?: string;
  disabled?: boolean;
  iconSize?: number;
  onExport: () => void;
  size?: "icon" | "icon-sm" | "icon-xs" | "icon-lg";
  variant?: "ghost" | "outline";
}) {
  const tooltipSide = useStudioToolbarTooltipSide();

  return (
    <Tooltip>
      <TooltipTrigger render={<span className="inline-flex" />}>
        <Button
          aria-label="Export as SVG"
          className={className}
          disabled={disabled}
          onClick={onExport}
          size={size}
          type="button"
          variant={variant}
        >
          <HugeiconsIcon
            icon={Download01Icon}
            size={iconSize}
            strokeWidth={1.5}
          />
        </Button>
      </TooltipTrigger>
      <TooltipContent side={tooltipSide}>Export as SVG</TooltipContent>
    </Tooltip>
  );
}
