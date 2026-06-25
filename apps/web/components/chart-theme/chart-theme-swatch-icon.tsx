import type { ChartThemeSwatch } from "@/lib/chart-themes/types";
import { cn } from "@/lib/utils";

const circleSizeClass = {
  sm: "size-2",
  md: "size-2.5",
} as const;

const overlapClass = {
  sm: "-ml-1",
  md: "-ml-1.5",
} as const;

const cutoutShadowClass = {
  trigger:
    "shadow-[0_0_0_2px_var(--background)] group-hover/chart-theme-trigger:shadow-[0_0_0_2px_var(--muted)] group-aria-expanded/chart-theme-trigger:shadow-[0_0_0_2px_var(--muted)]",
  menu: "shadow-[0_0_0_2px_var(--popover)]",
} as const;

export function ChartThemeSwatchIcon({
  swatch,
  className,
  size = "md",
  context = "menu",
}: {
  swatch: ChartThemeSwatch;
  className?: string;
  size?: "sm" | "md";
  context?: "trigger" | "menu";
}) {
  const circleClass = circleSizeClass[size];
  const overlap = overlapClass[size];

  return (
    <span
      aria-hidden
      className={cn("inline-flex shrink-0 items-center", className)}
    >
      <span
        className={cn("rounded-full", circleClass)}
        style={{ backgroundColor: swatch.background }}
      />
      <span
        className={cn(
          "relative z-10 rounded-full",
          cutoutShadowClass[context],
          overlap,
          circleClass
        )}
        style={{ backgroundColor: swatch.foreground }}
      />
    </span>
  );
}
