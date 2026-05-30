import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  getStudioCssRevealProps,
  motionDurationToAnimationMs,
  studioAnimationEasingCss,
  studioEnterStaggerScale,
} from "../chart-animation";
import { defaultStudioState } from "../studio-parsers";

const CUBIC_BEZIER_RE = /cubic-bezier/;

describe("chart-animation", () => {
  it("converts motion duration to ms", () => {
    assert.equal(motionDurationToAnimationMs(0.8), 800);
    assert.equal(motionDurationToAnimationMs(2), 2000);
  });

  it("builds css reveal props from motion state", () => {
    const state = defaultStudioState({
      motionDuration: 1,
      motionEase: "snappy",
    });
    const props = getStudioCssRevealProps(state);
    assert.equal(props.animationDuration, 1000);
    assert.match(props.animationEasing, CUBIC_BEZIER_RE);
  });

  it("formats easing css from bezier", () => {
    const easing = studioAnimationEasingCss(
      defaultStudioState({ motionEase: "easeOut" })
    );
    assert.equal(easing, "cubic-bezier(0.25, 0.1, 0.25, 1)");
  });

  it("scales enter stagger from motion duration and user scale", () => {
    const state = defaultStudioState({
      motionDuration: 1.6,
      motionStaggerScale: 0.5,
    });
    assert.equal(studioEnterStaggerScale(state), (1.6 / 1.1) * 0.5);
  });
});
