"use client";

import { Download01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function StudioExportSvgButton({
  disabled,
  onExport,
}: {
  disabled?: boolean;
  onExport: () => void;
}) {
  return (
    <Tooltip>
      <TooltipTrigger render={<span className="inline-flex" />}>
        <Button
          aria-label="Export as SVG"
          className="size-10"
          disabled={disabled}
          onClick={onExport}
          size="icon"
          type="button"
          variant="outline"
        >
          <HugeiconsIcon icon={Download01Icon} size={20} strokeWidth={1.5} />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Export as SVG</TooltipContent>
    </Tooltip>
  );
}
