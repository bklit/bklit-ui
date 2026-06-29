"use client";

import { Icon } from "@bklitui/icons";
import { cn } from "@bklitui/ui/lib/utils";
import { useState } from "react";
import { ChartTypeIcon } from "@/components/chart-type-icons";
import { studioChartList } from "@/lib/registry";
import type { ChartSlug } from "@/lib/types";
import { Button } from "@/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/popover";
import {
  studioSidebarPopoverCollisionAvoidance,
  studioSidebarPopoverSideOffset,
} from "@/ui/studio-sidebar-popover";

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
        aria-expanded={open}
        id="studio-chart"
        render={
          <Button
            aria-expanded={open}
            className="h-10 w-full justify-start text-left text-xs"
            type="button"
            variant="secondary"
          />
        }
      >
        <ChartTypeIcon slug={value} variant="plain" />
        <span className="min-w-0 flex-1 truncate font-medium">
          {active?.label ?? "Chart"}
        </span>
        <Icon
          className="size-3.5 shrink-0 text-muted-foreground"
          name="IconChevronGrabberVertical"
        />
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-max min-w-[var(--radix-popover-trigger-width)] p-2"
        collisionAvoidance={studioSidebarPopoverCollisionAvoidance}
        positionMethod="fixed"
        side="right"
        sideOffset={studioSidebarPopoverSideOffset}
      >
        <p className="px-2 py-1.5 font-medium text-[11px] text-muted-foreground uppercase tracking-wide">
          Chart type
        </p>
        <div className="grid grid-cols-2 gap-1">
          {studioChartList.map((item) => {
            const selected = item.slug === value;
            return (
              <Button
                className={cn(
                  "h-auto w-full justify-start gap-2 rounded-lg px-2 py-2 text-left font-normal",
                  selected
                    ? "bg-accent/50 text-foreground"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                )}
                key={item.slug}
                onClick={() => {
                  onChange(item.slug);
                  setOpen(false);
                }}
                type="button"
                variant="ghost"
              >
                <ChartTypeIcon slug={item.slug} />
                <span className="min-w-0 flex-1 truncate text-[11px] leading-tight">
                  {item.label}
                </span>
              </Button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
