"use client";

import { Columns3, PanelTopBottomDashed } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/ui/tooltip";

/** Lucide `columns-3` — three-column layout with side panes visible. */
const Layout3ColumnIcon = Columns3;
const PanelTopBottomDashedIcon = PanelTopBottomDashed;

export function EditorSidebarToggle({
  className,
  open,
  onToggle,
}: {
  className?: string;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <Tooltip>
      <TooltipTrigger render={<span className="inline-flex" />}>
        <Button
          aria-label={open ? "Hide sidebars" : "Show sidebars"}
          aria-pressed={open}
          className={cn("size-8", className)}
          onClick={onToggle}
          size="icon-sm"
          type="button"
          variant="ghost"
        >
          {open ? (
            <Layout3ColumnIcon />
          ) : (
            <PanelTopBottomDashedIcon className="rotate-90" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>Toggle sidebars</TooltipContent>
    </Tooltip>
  );
}
