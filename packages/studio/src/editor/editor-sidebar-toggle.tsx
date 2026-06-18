"use client";

import { Icon } from "@bklitui/icons";
import { cn } from "@/lib/utils";
import { Button } from "@/ui/button";

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
        <Icon className="size-4" name="IconColumns3" />
      ) : (
        <Icon
          className="size-4 rotate-90"
          name="IconChevronGrabberHorizontal"
        />
      )}
    </Button>
  );
}
