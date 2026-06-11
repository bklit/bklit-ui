"use client";

import { CentralIcon } from "@central-icons-react/all";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function TrendBadge({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const positive = value >= 0;

  return (
    <Badge
      className={cn(
        positive &&
          "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        className
      )}
      variant={positive ? "outline" : "destructive"}
    >
      <CentralIcon
        className="size-3"
        data-icon="inline-start"
        fill="outlined"
        join="round"
        name={positive ? "IconArrowUp" : "IconArrowDown"}
        radius="0"
        stroke="1.5"
      />
      {positive ? "+" : ""}
      {value.toFixed(1)}%
    </Badge>
  );
}
