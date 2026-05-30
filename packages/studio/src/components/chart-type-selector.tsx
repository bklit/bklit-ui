"use client";

import { cn } from "@bklitui/ui/lib/utils";
import { UnfoldMoreIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import { ChartTypeIcon } from "@/components/chart-type-icons";
import { studioChartList } from "@/lib/registry";
import type { ChartSlug } from "@/lib/types";
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/popover";

export function ChartTypeSelector({
  value,
  onChange,
}: {
  value: ChartSlug;
  onChange: (slug: ChartSlug) => void;
}) {
  const [open, setOpen] = useState(false);
  const active = studioChartList.find((item) => item.slug === value);

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger
        className={cn(
          "flex h-10 w-full items-center gap-2.5 rounded-lg border border-input bg-background px-2.5 text-left text-xs shadow-xs outline-none transition-colors",
          "hover:bg-muted/40 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        )}
        id="studio-chart"
        type="button"
      >
        <ChartTypeIcon slug={value} variant="plain" />
        <span className="min-w-0 flex-1 truncate font-medium">
          {active?.label ?? "Chart"}
        </span>
        <HugeiconsIcon
          className="size-3.5 shrink-0 text-muted-foreground"
          icon={UnfoldMoreIcon}
          strokeWidth={2}
        />
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-max min-w-[var(--radix-popover-trigger-width)] p-2"
        side="bottom"
        // sideOffset={5}
      >
        <p className="px-2 py-1.5 font-medium text-[11px] text-muted-foreground uppercase tracking-wide">
          Chart type
        </p>
        <div className="grid grid-cols-2 gap-1">
          {studioChartList.map((item) => {
            const selected = item.slug === value;
            return (
              <button
                className={cn(
                  "flex items-center gap-2 rounded-lg px-2 py-2 text-left transition-colors",
                  selected
                    ? "bg-accent/10 text-foreground ring-1 ring-accent/25"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                )}
                key={item.slug}
                onClick={() => {
                  onChange(item.slug);
                  setOpen(false);
                }}
                type="button"
              >
                <ChartTypeIcon slug={item.slug} />
                <span className="min-w-0 flex-1 truncate text-[11px] leading-tight">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
