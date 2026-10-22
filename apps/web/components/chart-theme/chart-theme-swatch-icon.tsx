import { cn } from "@/lib/utils";

const circleSizeClass = {
  sm: "size-2",
  md: "size-2.5",
} as const;

const overlapClass = {
  sm: "-ml-1",
  md: "-ml-1.5",
} as const;

/**
 * Punches a 2px gap out of each back circle where the circle in front of it
 * (to its left) overlaps. Masking keeps the gap transparent on any surface, so
 * the icon looks identical on the idle, hovered, and open trigger — a
 * `box-shadow` ring painted with a background token can't match the ghost
 * button's translucent hover fill.
 *
 * The gradient centre is the front circle's centre in the back circle's box
 * (circle size − overlap, minus half a size); the radius is half a size + gap.
 */
const cutoutMaskClass = {
  sm: "[mask-image:radial-gradient(circle_at_0px_50%,transparent_5.75px,#000_6.25px)]",
  md: "[mask-image:radial-gradient(circle_at_1px_50%,transparent_6.75px,#000_7.25px)]",
} as const;

/** Overlapping dots for the first palette colors (chart-1 on top). */
export function ChartThemeSwatchIcon({
  colors,
  className,
  size = "md",
}: {
  colors: readonly string[];
  className?: string;
  size?: "sm" | "md";
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
            index > 0 && [overlap, cutoutMaskClass[size]]
          )}
          key={index}
          style={{ backgroundColor: color, zIndex: colors.length - index }}
        />
      ))}
    </span>
  );
}
