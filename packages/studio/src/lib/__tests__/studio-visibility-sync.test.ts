import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { chartDefaultHiddenYAxes } from "../studio-component-visibility";
import { defaultStudioState } from "../studio-parsers";
import {
  expandStudioParamUpdate,
  reconcileOverlayVisibility,
} from "../studio-visibility-sync";

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

  it("reconciles legend hidden state when showLegend is false by default", () => {
    const state = {
      ...defaultStudioState(),
      chart: "line-chart" as const,
      showLegend: false,
      hiddenComponents: chartDefaultHiddenYAxes("line"),
    };
    const reconciled = reconcileOverlayVisibility(state);
    assert.ok(reconciled.hiddenComponents?.includes("line.legend"));
  });

  it("disables brush when line chart has projections", () => {
    const state = {
      ...defaultStudioState(),
      chart: "line-chart" as const,
      projectionCount: 1,
      showBrush: true,
    };
    const reconciled = reconcileOverlayVisibility(state);
    assert.equal(reconciled.showBrush, false);
    assert.ok(reconciled.hiddenComponents?.includes("line.brush"));
  });

  it("turns off showBrush when projectionCount increases", () => {
    const prev = { ...defaultStudioState(), chart: "line-chart" as const };
    const expanded = expandStudioParamUpdate(prev, { projectionCount: 1 });
    assert.equal(expanded.showBrush, false);
    assert.ok(expanded.hiddenComponents?.includes("line.brush"));
  });
});
