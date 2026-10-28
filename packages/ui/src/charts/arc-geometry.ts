/**
 * Dependency-free polar helpers shared by the ring and radial charts.
 * Angles are radians, 0 at 12 o'clock, increasing clockwise (the d3 / visx
 * `arc` convention).
 */

/** Full turn in radians. */
export const TAU = Math.PI * 2;

/** Point on a circle where angle 0 is 12 o'clock and angles run clockwise. */
export function polarToCartesian(angle: number, radius: number) {
  return { x: radius * Math.sin(angle), y: -radius * Math.cos(angle) };
}

/** True when the arc `start → end` (radians) covers the whole turn. */
export function isFullArc(startAngle: number, endAngle: number): boolean {
  return Math.abs(endAngle - startAngle) >= TAU - 1e-6;
}

/** SVG path of a circle (full arc) or an open arc of radius `r`. */
export function radialArcPath(
  radius: number,
  startAngle: number,
  endAngle: number
): string {
  if (isFullArc(startAngle, endAngle)) {
    return `M0,${-radius}A${radius},${radius},0,1,1,0,${radius}A${radius},${radius},0,1,1,0,${-radius}Z`;
  }
  const a = polarToCartesian(startAngle, radius);
  const b = polarToCartesian(endAngle, radius);
  const large = Math.abs(endAngle - startAngle) > Math.PI ? 1 : 0;
  const sweep = endAngle > startAngle ? 1 : 0;
  return `M${a.x},${a.y}A${radius},${radius},0,${large},${sweep},${b.x},${b.y}`;
}

export type ArcTextAnchor = "start" | "middle" | "end";

/**
 * Where a label sits just before an arc's start, so it lines up with its
 * ring (one label per concentric ring, stepped back along the start tangent).
 *
 * - Arcs starting near 12 / 6 o'clock: horizontal text beside the start
 *   (in the empty quadrant of a 270° arc).
 * - Arcs starting near 3 / 9 o'clock (semicircles): rings sit side by side,
 *   so the text is rotated upright and runs along the start edge, reading
 *   bottom to top.
 */
export function arcStartLabelLayout(
  startAngle: number,
  endAngle: number,
  offset: number
) {
  const direction = endAngle >= startAngle ? 1 : -1;
  // Tangent of the arc at its start, pointing along the sweep.
  const tx = Math.cos(startAngle) * direction;
  const ty = Math.sin(startAngle) * direction;
  const vertical = Math.abs(tx) <= 0.3;
  let anchor: ArcTextAnchor = "middle";
  if (vertical) {
    anchor = ty < 0 ? "end" : "start";
  } else if (tx > 0.3) {
    anchor = "end";
  } else if (tx < -0.3) {
    anchor = "start";
  }
  return {
    anchor,
    vertical,
    /** Label position for a ring whose band centre is at `radius`. */
    position(radius: number) {
      const p = polarToCartesian(startAngle, radius);
      const x = p.x - tx * offset;
      const y = p.y - ty * offset;
      return {
        x,
        y,
        transform: vertical ? `rotate(-90 ${x} ${y})` : undefined,
      };
    },
  };
}

/**
 * Centre point for upright text of `width` × `height` placed outside a
 * circle of `radius` at `angle`, `gap` px clear of the circle — the box is
 * pushed out along the radius by its own half-extent in that direction.
 */
export function outsideArcLabelPoint(
  angle: number,
  radius: number,
  gap: number,
  width: number,
  height: number
) {
  const extent =
    Math.abs(Math.sin(angle)) * (width / 2) +
    Math.abs(Math.cos(angle)) * (height / 2);
  return polarToCartesian(angle, radius + gap + extent);
}
