"use client";

import { cn } from "@bklitui/ui/lib/utils";
import { ArrowRightLeft, ArrowUpDown } from "lucide-react";

export function OrientationPicker({
  value,
  onChange,
}: {
  value: "vertical" | "horizontal";
  onChange: (value: "vertical" | "horizontal") => void;
}) {
  return (
    <fieldset className="flex gap-2 border-0 p-0">
      <button
        aria-label="Vertical"
        aria-pressed={value === "vertical"}
        className={cn(
          "flex h-11 flex-1 items-center justify-center rounded-lg border transition-colors",
          value === "vertical"
            ? "border-accent bg-accent/10 text-accent"
            : "border-border bg-muted/30 text-muted-foreground hover:bg-muted/50"
        )}
        onClick={() => onChange("vertical")}
        type="button"
      >
        <ArrowUpDown className="size-5" strokeWidth={1.75} />
      </button>
      <button
        aria-label="Horizontal"
        aria-pressed={value === "horizontal"}
        className={cn(
          "flex h-11 flex-1 items-center justify-center rounded-lg border transition-colors",
          value === "horizontal"
            ? "border-accent bg-accent/10 text-accent"
            : "border-border bg-muted/30 text-muted-foreground hover:bg-muted/50"
        )}
        onClick={() => onChange("horizontal")}
        type="button"
      >
        <ArrowRightLeft className="size-5" strokeWidth={1.75} />
      </button>
    </fieldset>
  );
}
