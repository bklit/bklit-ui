"use client";

import { ArrowDown, ArrowUp } from "lucide-react";
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
  const Icon = positive ? ArrowUp : ArrowDown;

  return (
    <Badge
      className={cn(
        positive &&
          "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        className
      )}
      variant={positive ? "outline" : "destructive"}
    >
      <Icon className="size-3" data-icon="inline-start" />
      {positive ? "+" : ""}
      {value.toFixed(1)}%
    </Badge>
  );
}
