import { Icon, type IconProps } from "@bklitui/icons";
import type React from "react";
import { cn } from "@/lib/utils";

export function Spinner({
  className,
  ...props
}: Omit<IconProps, "name">): React.ReactElement {
  return (
    <Icon
      aria-label="Loading"
      className={cn("animate-spin", className)}
      name="IconLoadingCircle"
      role="status"
      {...props}
    />
  );
}
