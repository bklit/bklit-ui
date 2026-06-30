import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  type ArcDatum,
  buildSunburstEnterTiming,
  localProgress,
} from "../sunburst";

function arc(id: string, depth: number, a0: number, a1: number): ArcDatum {
  return {
    id,
    name: id,
    depth,
    value: 1,
    categoryIndex: 0,
    hasChildren: false,
    trail: [id],
    parentId: null,
    a0,
    a1,
    arcIndex: 0,
  };
}

describe("sunburst enter timing", () => {
  it("staggers rings outward with clockwise segment order", () => {
    const arcs = [
      arc("inner-a", 1, 0, 1),
      arc("inner-b", 1, 1, 2),
      arc("outer-a", 2, 0, 1.5),
      arc("outer-b", 2, 1.5, 3),
    ];

    const timing = buildSunburstEnterTiming(arcs);
    const innerA = timing.segmentDelays.get("inner-a")?.delay ?? -1;
    const innerB = timing.segmentDelays.get("inner-b")?.delay ?? -1;
    const outerA = timing.segmentDelays.get("outer-a")?.delay ?? -1;
    const outerB = timing.segmentDelays.get("outer-b")?.delay ?? -1;

    assert.ok(innerA >= 0);
    assert.ok(innerB > innerA, "inner ring fans clockwise");
    assert.ok(outerA > innerB, "outer ring starts after inner ring");
    assert.ok(outerB > outerA, "outer ring fans clockwise");
    assert.equal(timing.maxDelay, outerB);
  });

  it("scales stagger with enterStaggerScale", () => {
    const arcs = [arc("a", 1, 0, 1), arc("b", 2, 0, 1)];
    const base = buildSunburstEnterTiming(arcs, 1);
    const scaled = buildSunburstEnterTiming(arcs, 2);

    assert.ok(
      (scaled.segmentDelays.get("b")?.delay ?? 0) >
        (base.segmentDelays.get("b")?.delay ?? 0)
    );
  });

  it("uses fixed local duration", () => {
    assert.equal(localProgress(0.5, 0.1, 0.2), 1);
    assert.ok(Math.abs(localProgress(0.35, 0.3, 0.2) - 0.25) < 1e-9);
  });
});
