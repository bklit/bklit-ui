"use client";

import { cn } from "@bklitui/ui/lib/utils";
import type { IconSvgElement } from "@hugeicons/react";
import { HugeiconsIcon } from "@hugeicons/react";

export function IconToggleButton({
  pressed,
  onClick,
  label,
  icon,
  children,
  className,
}: {
  pressed: boolean;
  onClick: () => void;
  label: string;
  icon?: IconSvgElement;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      aria-label={label}
      aria-pressed={pressed}
      className={cn(
        "flex h-11 flex-1 items-center justify-center rounded-lg border transition-colors",
        pressed
          ? "border-accent bg-accent/10 text-accent"
          : "border-border bg-muted/30 text-muted-foreground hover:bg-muted/50",
        className
      )}
      onClick={onClick}
      title={label}
      type="button"
    >
      {children ??
        (icon ? (
          <HugeiconsIcon className="size-5" icon={icon} strokeWidth={1.75} />
        ) : null)}
    </button>
  );
}

export function IconToggleGroup({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <fieldset className={cn("flex gap-2 border-0 p-0", className)}>
      {children}
    </fieldset>
  );
}
