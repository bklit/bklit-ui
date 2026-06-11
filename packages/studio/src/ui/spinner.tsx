import { Icon } from "@bklitui/icons";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

function Spinner({ className }: ComponentProps<"svg">) {
  return (
    <Icon
      aria-hidden={false}
      aria-label="Loading"
      className={cn("size-4 animate-spin", className)}
      name="IconLoadingCircle"
      role="status"
    />
  );
}

export { Spinner };
