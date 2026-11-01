import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  area,
  curveBasis,
  curveCardinal,
  curveCatmullRom,
  curveLinear,
  curveLinearClosed,
  curveMonotoneX,
  curveNatural,
  curveStep,
  line,
} from "d3-shape";
import { fastShapePath } from "../fast-path";

const CURVES = {
  curveBasis,
  curveCardinal,
  curveCatmullRom,
  curveLinear,
  curveLinearClosed,
  curveMonotoneX,
  curveNatural,
  curveStep,
};

/** Deterministic values across magnitudes, signs and rounding edges. */
function points(count: number, seed: number): [number, number][] {
  let state = seed;
  const next = () => {
    state = (state * 1_664_525 + 1_013_904_223) % 2 ** 32;
    return state / 2 ** 32;
  };
  const scales = [0.0004, 0.0015, 1, 37.5, 1000, -250, 123_456.789];
  return Array.from({ length: count }, (_, index) => {
    const scale = scales[index % scales.length] ?? 1;
    return [index * 1.7 + next() * scale, (next() - 0.5) * scale];
  });
}

describe("fastShapePath", () => {
  it("matches d3-path output for line and area generators", () => {
    for (const [name, curve] of Object.entries(CURVES)) {
      for (const seed of [1, 7, 42]) {
        const data = points(120, seed);
        const lineGen = line().curve(curve);
        assert.equal(fastShapePath(lineGen, data), lineGen(data) ?? "", name);
        const areaGen = area().curve(curve).y0(0.0005);
        assert.equal(fastShapePath(areaGen, data), areaGen(data) ?? "", name);
      }
    }
  });

  it("keeps gaps, single points and empty data identical", () => {
    const data: [number, number][] = [
      [0, 1],
      [1, Number.NaN],
      [2, 3.0005],
      [3, -0.0004],
    ];
    const gen = line().defined((d) => !Number.isNaN(d[1]));
    assert.equal(fastShapePath(gen, data), gen(data) ?? "");
    const single: [number, number][] = [[5, 5]];
    assert.equal(fastShapePath(gen, single), gen(single) ?? "");
    assert.equal(fastShapePath(gen, [] as [number, number][]), "");
  });
});
