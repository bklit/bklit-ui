import { Icon } from "@bklitui/icons";
import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

function Spinner({
  className,
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <Icon
      aria-hidden={false}
      aria-label="Loading"
      className={cn("size-4 animate-spin", className)}
      name="IconLoadingCircle"
      role="status"
      style={style}
    />
  );
}

export { Spinner };
