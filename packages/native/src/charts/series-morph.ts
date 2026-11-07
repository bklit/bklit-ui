/**
 * Keyed series morph geometry (pure, no Skia), so a range change zooms
 * instead of popping.
 *
 * Points are keyed by time. The morph runs over the union of old and new
 * keys:
 * - kept keys move from their old pixel position to their new one;
 * - added keys start where the OLD scales would have put them (off the edge
 *   when zooming out) and slide in;
 * - removed keys slide to where the NEW scales put them (off the edge when
 *   zooming in) instead of vanishing.
 *
 * At rest the series is drawn from the new points only.
 */

export interface KeyedPoint {
  /** Time (ms). */
  key: number;
  x: number;
  y: number;
  /** Second y: area baseline or band upper edge. */
  y0?: number;
  /** Raw value(s), so a point can be re-projected with other scales. */
  v: number;
  v0?: number;
}

/** Re-project a point with one set of scales. */
export type Projector = (p: KeyedPoint) => KeyedPoint;

export interface SeriesPoints {
  points: KeyedPoint[];
  project: Projector;
}

export function unionMorph(
  prev: SeriesPoints,
  next: SeriesPoints
): { from: KeyedPoint[]; to: KeyedPoint[] } {
  const prevBy = new Map(prev.points.map((p) => [p.key, p]));
  const nextBy = new Map(next.points.map((p) => [p.key, p]));
  const keys = [...new Set([...prevBy.keys(), ...nextBy.keys()])].sort(
    (a, b) => a - b
  );
  const from: KeyedPoint[] = [];
  const to: KeyedPoint[] = [];
  for (const key of keys) {
    const old = prevBy.get(key);
    const now = nextBy.get(key);
    if (old && now) {
      from.push(old);
      to.push(now);
    } else if (now) {
      from.push(prev.project(now));
      to.push(now);
    } else if (old) {
      from.push(old);
      to.push(next.project(old));
    }
  }
  return { from, to };
}
