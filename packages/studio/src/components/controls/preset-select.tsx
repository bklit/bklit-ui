"use client";

import { cn } from "@bklitui/ui/lib/utils";
import { UnfoldMoreIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import {
  COLOR_PRESETS,
  type ColorPresetId,
  presetSwatchColor,
} from "@/lib/color-presets";
import { Button } from "@/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/popover";

export function PresetSwatch({
  id,
  className,
}: {
  id: ColorPresetId;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "size-3 shrink-0 rounded-full ring-1 ring-border",
        className
      )}
      style={{ background: presetSwatchColor(id) }}
    />
  );
}

export function PresetSelect({
  value,
  onChange,
  disabled = false,
}: {
  value: ColorPresetId;
  onChange: (id: ColorPresetId) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const active = COLOR_PRESETS.find((p) => p.id === value);

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger
        render={
          <Button
            aria-expanded={open}
            aria-label="Color preset"
            className="h-10 gap-2 px-3 text-sm"
            disabled={disabled}
            type="button"
            variant="outline"
          />
        }
      >
        <PresetSwatch id={value} />
        <span className="max-w-[7.5rem] truncate">
          {active?.label ?? "Theme"}
        </span>
        <HugeiconsIcon
          className="size-3.5 shrink-0 text-muted-foreground"
          icon={UnfoldMoreIcon}
          strokeWidth={2}
        />
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-52 p-1.5"
        side="bottom"
        sideOffset={8}
      >
        <p className="px-2 py-1.5 font-medium text-[11px] text-muted-foreground uppercase tracking-wide">
          Theme
        </p>
        <div className="flex flex-col gap-0.5">
          {COLOR_PRESETS.map((p) => {
            const selected = p.id === value;
            return (
              <button
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm transition-colors",
                  selected
                    ? "bg-accent/10 text-foreground ring-1 ring-accent/25"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                )}
                key={p.id}
                onClick={() => {
                  onChange(p.id);
                  setOpen(false);
                }}
                type="button"
              >
                <PresetSwatch id={p.id} />
                <span className="truncate">{p.label}</span>
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
