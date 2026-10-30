// Parity guard for the visx -> d3 migration of pie/ring arcs. Delete this file
// together with the @visx/shape dependency once the migration is finished.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { arc as visxArc } from "@visx/shape";
import { arcPath } from "../arc-path";

/** The exact helper pie-chart / pie-slice / ring-chart / ring used before. */
function visxArcPath(
  innerRadius: number,
  outerRadius: number,
  startAngle: number,
  endAngle: number,
  cornerRadius: number,
  padAngle?: number
): string {
  const generator = visxArc<unknown>({
    innerRadius,
    outerRadius,
    cornerRadius,
    padAngle,
  });
  return generator({ startAngle, endAngle } as unknown as null) || "";
}

const TAU = Math.PI * 2;

// [inner, outer]: pie, donut, thin ring band, degenerate (inner == outer)
const radii: [number, number][] = [
  [0, 100],
  [60, 100],
  [78, 90],
  [50, 50],
];
// Corner radius: none, typical, larger than half the thickness, huge
const cornerRadii = [0, 4, 8, 200];
// undefined = ring callers (omit padAngle); 0 and >0 = pie callers
const padAngles = [undefined, 0, 0.02, 0.3];
// [start, end]: zero-width, sliver, mid-animation partial sweeps, reversed,
// just under / exactly / beyond a full turn, offset start
const angles: [number, number][] = [
  [0, 0],
  [1.2, 1.2],
  [0, 1e-6],
  [0, 0.01],
  [0, 0.37 * TAU],
  [0.5, 2.9],
  [2.9, 0.5],
  [0, TAU - 1e-9],
  [0, TAU],
  [0, TAU + 0.5],
  [-Math.PI / 2, Math.PI],
];

describe("arcPath", () => {
  it("produces byte-identical paths to @visx/shape arc", () => {
    let compared = 0;
    for (const [inner, outer] of radii) {
      for (const corner of cornerRadii) {
        for (const pad of padAngles) {
          for (const [start, end] of angles) {
            const args = [inner, outer, start, end, corner, pad] as const;
            assert.equal(
              arcPath(...args),
              visxArcPath(...args),
              `arcPath(${args.join(", ")})`
            );
            compared++;
          }
        }
      }
    }
    assert.equal(compared, 704);
  });
});
