import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  domainsEqual,
  isReferenceAreaVisiblePhase,
  mergeYDomainRecords,
  niceYDomain,
  shouldTweenYDomain,
} from "../y-domain-utils";

describe("shouldTweenYDomain", () => {
  it("skips tween when both endpoints move less than 2% of span", () => {
    assert.equal(shouldTweenYDomain([0, 100], [1, 101]), false);
  });

  it("tweens when min endpoint shifts enough", () => {
    assert.equal(shouldTweenYDomain([0, 100], [5, 100]), true);
  });

  it("tweens when max endpoint shifts enough", () => {
    assert.equal(shouldTweenYDomain([0, 100], [0, 110]), true);
  });
});

describe("niceYDomain", () => {
  it("expands raw domain to nice tick boundaries", () => {
    const [min, max] = niceYDomain([13, 87]);
    assert.ok(min <= 13);
    assert.ok(max >= 87);
  });
});

describe("mergeYDomainRecords", () => {
  it("normalizes axis ids and merges maps", () => {
    const merged = mergeYDomainRecords({ left: [0, 100] }, { right: [10, 50] });
    assert.deepEqual(merged.left, [0, 100]);
    assert.deepEqual(merged.right, [10, 50]);
  });
});

describe("domainsEqual", () => {
  it("returns true when axis domains match", () => {
    assert.equal(domainsEqual({ left: [0, 100] }, { left: [0, 100] }), true);
  });

  it("returns false when any endpoint differs", () => {
    assert.equal(domainsEqual({ left: [0, 100] }, { left: [0, 110] }), false);
  });
});

describe("isReferenceAreaVisiblePhase", () => {
  it("shows reference areas during ready reveal phases", () => {
    assert.equal(isReferenceAreaVisiblePhase("ready"), true);
    assert.equal(isReferenceAreaVisiblePhase("revealing"), true);
    assert.equal(isReferenceAreaVisiblePhase("gridTweenReady"), true);
  });

  it("hides reference areas during loading and exit phases", () => {
    assert.equal(isReferenceAreaVisiblePhase("loading"), false);
    assert.equal(isReferenceAreaVisiblePhase("exiting"), false);
    assert.equal(isReferenceAreaVisiblePhase("exitingReady"), false);
    assert.equal(isReferenceAreaVisiblePhase("gridTweenLoading"), false);
    assert.equal(isReferenceAreaVisiblePhase("revealingLoading"), false);
  });
});
