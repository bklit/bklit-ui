import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { scaleBand } from "d3-scale";
import { gridTickValues } from "../grid-lines";

describe("gridTickValues", () => {
  it("thins long band domains to every nth band", () => {
    const band = scaleBand<string>()
      .domain(["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m"])
      .range([0, 500])
      .padding(0.2);
    assert.deepEqual(gridTickValues(band, 5), [
      "a",
      "c",
      "e",
      "g",
      "i",
      "k",
      "m",
    ]);
  });

  it("keeps every band of a short domain", () => {
    const fewBands = scaleBand<string>().domain(["x", "y", "z"]).range([0, 90]);
    assert.deepEqual(gridTickValues(fewBands), ["x", "y", "z"]);
  });
});
