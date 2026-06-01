import assert from "node:assert/strict";
import test from "node:test";
import { legendPositionId, parseLegendPositionId } from "../legend-position";

test("legendPositionId combines placement and align", () => {
  assert.equal(legendPositionId("bottom", "end"), "bottom-end");
});

test("parseLegendPositionId splits placement and align", () => {
  assert.deepEqual(parseLegendPositionId("top-center"), {
    placement: "top",
    align: "center",
  });
});
