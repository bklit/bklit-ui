import { arc } from "d3-shape";

interface ArcDatum {
  innerRadius: number;
  outerRadius: number;
  startAngle: number;
  endAngle: number;
  cornerRadius: number;
  padAngle: number;
}

// One shared generator whose accessors read from the datum, so per-frame
// calls (enter animations, hover grow) allocate a single small object instead
// of a generator plus seven constant closures. Output is identical to building
// a fresh `arc()` with constant values: d3 evaluates the same numbers either way.
const generator = arc<ArcDatum>()
  .innerRadius((d) => d.innerRadius)
  .outerRadius((d) => d.outerRadius)
  .startAngle((d) => d.startAngle)
  .endAngle((d) => d.endAngle)
  .cornerRadius((d) => d.cornerRadius)
  .padAngle((d) => d.padAngle);

/**
 * SVG path `d` for an annular sector centred on the origin (d3 `arc`
 * convention: radians, 0 at 12 o'clock, clockwise). `padRadius` keeps the d3
 * default, sqrt(inner² + outer²). Returns "" when d3 produces no path.
 */
export function arcPath(
  innerRadius: number,
  outerRadius: number,
  startAngle: number,
  endAngle: number,
  cornerRadius = 0,
  padAngle = 0
): string {
  return (
    generator({
      innerRadius,
      outerRadius,
      startAngle,
      endAngle,
      cornerRadius,
      padAngle,
    }) || ""
  );
}
