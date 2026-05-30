"use client";

import { cn } from "@bklitui/ui/lib/utils";
import { IconToggleGroup } from "./icon-toggle-group";

function FunnelStraightIcon() {
  return (
    <svg aria-hidden={true} className="size-5" viewBox="0 0 20 20">
      <path className="fill-current opacity-30" d="M4 4h12L10 9H6L4 4Z" />
      <path className="fill-current opacity-50" d="M6 9h8L9 14H7L6 9Z" />
      <path className="fill-current" d="M7 14h6L8 17H7L7 14Z" />
    </svg>
  );
}

function FunnelCurvedIcon() {
  return (
    <svg aria-hidden={true} className="size-5" viewBox="0 0 20 20">
      <path className="fill-current opacity-30" d="M4 4h12q-1 2.5-2 5H6L4 4Z" />
      <path className="fill-current opacity-50" d="M6 9h8q-0.5 2-1 5H7L6 9Z" />
      <path className="fill-current" d="M7 14h6q-0.25 1.5-0.5 3H7.5L7 14Z" />
    </svg>
  );
}

export function FunnelEdgesPicker({
  value,
  onChange,
}: {
  value: "curved" | "straight";
  onChange: (v: "curved" | "straight") => void;
}) {
  return (
    <IconToggleGroup>
      <button
        aria-label="Curved edges"
        aria-pressed={value === "curved"}
        className={cn(
          "flex h-11 flex-1 items-center justify-center rounded-lg border transition-colors",
          value === "curved"
            ? "border-accent bg-accent/10 text-accent"
            : "border-border bg-muted/30 text-muted-foreground hover:bg-muted/50"
        )}
        onClick={() => onChange("curved")}
        title="Curved edges"
        type="button"
      >
        <FunnelCurvedIcon />
      </button>
      <button
        aria-label="Straight edges"
        aria-pressed={value === "straight"}
        className={cn(
          "flex h-11 flex-1 items-center justify-center rounded-lg border transition-colors",
          value === "straight"
            ? "border-accent bg-accent/10 text-accent"
            : "border-border bg-muted/30 text-muted-foreground hover:bg-muted/50"
        )}
        onClick={() => onChange("straight")}
        title="Straight edges"
        type="button"
      >
        <FunnelStraightIcon />
      </button>
    </IconToggleGroup>
  );
}
