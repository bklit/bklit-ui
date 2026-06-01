import { cn } from "@bklitui/ui/lib/utils";
import { Loading03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { CSSProperties } from "react";

function Spinner({
  className,
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <HugeiconsIcon
      aria-label="Loading"
      className={cn("size-4 animate-spin", className)}
      icon={Loading03Icon}
      role="status"
      strokeWidth={2}
      style={style}
    />
  );
}

export { Spinner };
