import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { computeBandSegments, resolveBandFadeSides } from "../band-geometry";
import { computeYDomainsByAxis } from "../y-domain-utils";

describe("computeBandSegments", () => {
  it("splits on rows where either edge is missing or NaN", () => {
    const data = [
      { t: 0, hi: null, lo: null },
      { t: 1, hi: 4, lo: 2 },
      { t: 2, hi: 5, lo: 3 },
      { t: 3, hi: Number.NaN, lo: 1 },
      { t: 4, hi: 6, lo: 2 },
    ];
    const segments = computeBandSegments(
      data,
      (d) => new Date(d.t as number),
      (date) => date.getTime() * 10,
      (value) => 100 - value,
      "hi",
      "lo"
    );
    assert.deepEqual(
      segments.map((segment) => segment.map((point) => point.x)),
      [[10, 20], [40]]
    );
    assert.deepEqual(segments[0]?.[0], {
      x: 10,
      upper: 96,
      lower: 98,
      key: "1",
    });
  });
});

describe("resolveBandFadeSides", () => {
  it("expands shorthands and objects", () => {
    assert.equal(resolveBandFadeSides(true).vertical, true);
    assert.equal(resolveBandFadeSides("left").vertical, false);
    assert.equal(resolveBandFadeSides("right").right, true);
    const top = resolveBandFadeSides({ top: true });
    assert.equal(top.vertical && !top.horizontal, true);
    assert.equal(resolveBandFadeSides(false).horizontal, false);
  });
});

describe("computeYDomainsByAxis extraKeysByAxis", () => {
  it("adds extra keys to existing and new axes", () => {
    const seen: string[][] = [];
    const domains = computeYDomainsByAxis({
      lines: [{ dataKey: "mid", stroke: "", strokeWidth: 1 }],
      extraKeysByAxis: { left: ["hi", "lo", "mid"], right: ["r1"] },
      resolveDomain: (keys) => {
        seen.push(keys);
        return [0, 100];
      },
    });
    assert.deepEqual(seen, [["mid", "hi", "lo"], ["r1"]]);
    assert.deepEqual(Object.keys(domains).sort(), ["left", "right"]);
  });
});
