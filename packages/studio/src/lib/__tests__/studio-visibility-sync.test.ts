import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { defaultStudioState } from "../studio-parsers";
import { expandStudioParamUpdate } from "../studio-visibility-sync";

describe("expandStudioParamUpdate", () => {
  it("syncs showLegend when legend eye toggle changes", () => {
    const prev = { ...defaultStudioState(), chart: "line-chart" as const };
    const expanded = expandStudioParamUpdate(prev, {
      hiddenComponents: "line.legend",
    });
    assert.equal(expanded.showLegend, false);
  });

  it("syncs hiddenComponents when showLegend switch changes", () => {
    const prev = { ...defaultStudioState(), chart: "line-chart" as const };
    const expanded = expandStudioParamUpdate(prev, { showLegend: false });
    assert.ok(expanded.hiddenComponents?.includes("line.legend"));
  });

  it("syncs showBrush when brush eye toggle changes", () => {
    const prev = { ...defaultStudioState(), chart: "line-chart" as const };
    const expanded = expandStudioParamUpdate(prev, {
      hiddenComponents: "line.brush",
    });
    assert.equal(expanded.showBrush, false);
  });
});
