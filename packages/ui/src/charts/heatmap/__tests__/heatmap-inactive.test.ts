import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isHeatmapHoverEffectEnabled,
  isHeatmapInactiveEffectEnabled,
  resolveHeatmapHoverStyle,
  resolveHeatmapInactiveStyle,
} from "../heatmap-utils";

describe("heatmap inactive hover styling", () => {
  it("disables effect when both props are 1", () => {
    assert.equal(isHeatmapInactiveEffectEnabled(1, 1), false);
  });

  it("enables effect when opacity or scale differs from 1", () => {
    assert.equal(isHeatmapInactiveEffectEnabled(0.3, 1), true);
    assert.equal(isHeatmapInactiveEffectEnabled(1, 0.75), true);
    assert.equal(isHeatmapInactiveEffectEnabled(0.3, 0.75), true);
  });

  it("returns active style for non-inactive cells", () => {
    assert.deepEqual(resolveHeatmapInactiveStyle(false, 0.3, 0.75), {
      opacity: 1,
      scale: 1,
    });
  });

  it("returns inactive opacity and scale independently", () => {
    assert.deepEqual(resolveHeatmapInactiveStyle(true, 0.3, 1), {
      opacity: 0.3,
      scale: 1,
    });
    assert.deepEqual(resolveHeatmapInactiveStyle(true, 1, 0.75), {
      opacity: 1,
      scale: 0.75,
    });
    assert.deepEqual(resolveHeatmapInactiveStyle(true, 0.3, 0.75), {
      opacity: 0.3,
      scale: 0.75,
    });
  });
});

describe("heatmap hover styling with activeScale", () => {
  const params = {
    inactiveOpacity: 0.45,
    inactiveScale: 1,
    activeScale: 1.1,
  };

  it("enables effect when activeScale differs from 1", () => {
    assert.equal(isHeatmapHoverEffectEnabled(params), true);
    assert.equal(
      isHeatmapHoverEffectEnabled({
        inactiveOpacity: 1,
        inactiveScale: 1,
        activeScale: 1,
      }),
      false
    );
  });

  it("scales highlighted cells with activeScale", () => {
    assert.deepEqual(resolveHeatmapHoverStyle(true, false, params), {
      opacity: 1,
      scale: 1.1,
    });
  });

  it("dims inactive cells without scaling when inactiveScale is 1", () => {
    assert.deepEqual(resolveHeatmapHoverStyle(false, true, params), {
      opacity: 0.45,
      scale: 1,
    });
  });
});
