"use client";

import type { SVGProps } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/** Central arrow icon (round join, outlined, radius 0, stroke 1.5), inlined. */
function TrendArrow({
  direction,
  ...props
}: SVGProps<SVGSVGElement> & { direction: "up" | "down" }) {
  return (
    <svg
      {...props}
      aria-hidden
      fill="none"
      height="24px"
      viewBox="0 0 24 24"
      width="24px"
      xmlns="http://www.w3.org/2000/svg"
    >
      {direction === "up" ? (
        <>
          <path
            d="M12 20.25V4.5"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
          <path
            d="M5.75 10L12 3.75L18.25 10"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
        </>
      ) : (
        <>
          <path
            d="M18.25 14L12 20.25L5.75 14"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
          <path
            d="M12 19.5V3.75"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
        </>
      )}
    </svg>
  );
}

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
      <TrendArrow
        className="size-3"
        data-icon="inline-start"
        direction={positive ? "up" : "down"}
      />
      {positive ? "+" : ""}
      {value.toFixed(1)}%
    </Badge>
  );
}
