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

/** Overlapping dots for the first palette colors (chart-1 on top). */
export function ChartThemeSwatchIcon({
  colors,
  className,
  size = "md",
  context = "menu",
}: {
  colors: readonly string[];
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
      {colors.map((color, index) => (
        <span
          className={cn(
            "relative rounded-full",
            circleClass,
            index > 0 && overlap,
            cutoutShadowClass[context]
          )}
          key={index}
          style={{ backgroundColor: color, zIndex: colors.length - index }}
        />
      ))}
    </span>
  );
}
