import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  clampEaseBezierControl,
  clampMotionBounce,
  clampMotionDuration,
  cubicBezierEase,
  easeHandleSvgPosition,
  formatMotionBezier,
  getMotionBezier,
  motionSignature,
  parseMotionBezier,
  sampleMotionCurve,
  studioMotionToTransition,
} from "../motion-config";
import { defaultStudioState } from "../studio-parsers";

describe("studioMotionToTransition", () => {
  it("returns spring transition with duration and bounce", () => {
    const state = defaultStudioState({
      motionType: "spring",
      motionDuration: 0.8,
      motionBounce: 0.6,
    });
    const t = studioMotionToTransition(state);
    assert.equal(t.type, "spring");
    if (t.type === "spring") {
      assert.equal(t.duration, 0.8);
      assert.equal(t.bounce, 0.6);
    }
  });

  it("returns tween transition for ease mode", () => {
    const state = defaultStudioState({
      motionType: "ease",
      motionDuration: 1.2,
      motionEase: "snappy",
    });
    const t = studioMotionToTransition(state);
    assert.equal(t.type, "tween");
    if (t.type === "tween") {
      assert.equal(t.duration, 1.2);
      assert.deepEqual(t.ease, [0.85, 0, 0.15, 1]);
    }
  });

  it("uses custom cubic-bezier when ease is custom", () => {
    const state = defaultStudioState({
      motionType: "ease",
      motionEase: "custom",
      motionBezier: "0.2, 0.8, 0.4, 1",
    });
    const t = studioMotionToTransition(state);
    if (t.type === "tween") {
      assert.deepEqual(t.ease, [0.2, 0.8, 0.4, 1]);
    }
  });
});

describe("parseMotionBezier", () => {
  it("parses comma-separated values", () => {
    assert.deepEqual(parseMotionBezier("0.85, 0, 0.15, 1"), [0.85, 0, 0.15, 1]);
  });

  it("parses cubic-bezier() syntax", () => {
    assert.deepEqual(
      parseMotionBezier("cubic-bezier(0.25, 0.1, 0.25, 1)"),
      [0.25, 0.1, 0.25, 1]
    );
  });

  it("rejects invalid values", () => {
    assert.equal(parseMotionBezier("bad"), null);
    assert.equal(parseMotionBezier("0, 1, 2"), null);
  });

  it("allows control points outside 0–1", () => {
    assert.deepEqual(
      parseMotionBezier("0.2, 1.4, 0.8, -0.3"),
      [0.2, 1.4, 0.8, -0.3]
    );
  });
});

describe("sampleMotionCurve", () => {
  it("starts at 0 and ends near 1 for ease", () => {
    const state = defaultStudioState({ motionType: "ease" });
    const points = sampleMotionCurve(state, 32);
    assert.equal(points[0]?.y, 0);
    assert.ok((points.at(-1)?.y ?? 0) > 0.95);
  });

  it("ease snappy matches cubicBezierEase endpoints", () => {
    const bezier = [0.85, 0, 0.15, 1] as [number, number, number, number];
    assert.equal(cubicBezierEase(0, bezier), 0);
    assert.equal(cubicBezierEase(1, bezier), 1);
  });

  it("spring can overshoot with high bounce", () => {
    const state = defaultStudioState({
      motionType: "spring",
      motionBounce: 0.9,
      motionDuration: 0.6,
    });
    const points = sampleMotionCurve(state, 64);
    const maxY = Math.max(...points.map((p) => p.y));
    assert.ok(maxY > 1);
  });
});

describe("motionSignature", () => {
  it("changes when duration changes", () => {
    const a = motionSignature(
      defaultStudioState({ motionDuration: 0.5, motionType: "spring" })
    );
    const b = motionSignature(
      defaultStudioState({ motionDuration: 1.5, motionType: "spring" })
    );
    assert.notEqual(a, b);
  });
});

describe("clamp helpers", () => {
  it("clamps duration to 0.2–2", () => {
    assert.equal(clampMotionDuration(0.1), 0.2);
    assert.equal(clampMotionDuration(3), 2);
  });

  it("clamps bounce to 0–1", () => {
    assert.equal(clampMotionBounce(-1), 0);
    assert.equal(clampMotionBounce(1.5), 1);
  });
});

describe("ease editor handle bounds", () => {
  it("clamps extreme bezier controls", () => {
    assert.deepEqual(
      clampEaseBezierControl([0, -3, 1, 4]),
      [0, -1.25, 1, 2.25]
    );
  });

  it("pins off-canvas handles to the chart edge", () => {
    const pt = easeHandleSvgPosition(0.5, 2.5, 280, 180, 10);
    assert.equal(pt.y, 10 + 6);
    assert.equal(pt.clamped, true);
  });
});

describe("getMotionBezier", () => {
  it("formats custom bezier from string", () => {
    const state = defaultStudioState({
      motionEase: "custom",
      motionBezier: "0.1,0.2,0.3,0.9",
    });
    assert.deepEqual(getMotionBezier(state), [0.1, 0.2, 0.3, 0.9]);
    assert.equal(
      formatMotionBezier([0.1, 0.2, 0.3, 0.9]),
      "0.1, 0.2, 0.3, 0.9"
    );
  });
});
