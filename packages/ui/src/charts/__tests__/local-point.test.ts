import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { type LocalPointEvent, localPoint } from "../local-point";

// Node has `Event` but no DOM: stub just enough of Element / SVGElement for
// the type guards.
class FakeElement {
  clientLeft = 2;
  clientTop = 3;
  rect = { x: 100, y: 50, left: 100, top: 50, width: 40, height: 20 };
  getBoundingClientRect() {
    return this.rect;
  }
}
class FakeSVGElement extends FakeElement {
  ownerSVGElement: FakeSVGElement | null = null;
}
/** Root <svg>: screen = local * 2 + (10, 20). */
class FakeSVGSVGElement extends FakeSVGElement {
  createSVGPoint() {
    return {
      x: 0,
      y: 0,
      matrixTransform(m: { apply: (x: number, y: number) => object }) {
        return m.apply(this.x, this.y);
      },
    };
  }
  getScreenCTM() {
    return {
      inverse: () => ({
        apply: (x: number, y: number) => ({ x: (x - 10) / 2, y: (y - 20) / 2 }),
      }),
    };
  }
}

const g = globalThis as Record<string, unknown>;
before(() => {
  g.Element = FakeElement;
  g.SVGElement = FakeSVGElement;
});
after(() => {
  g.Element = undefined;
  g.SVGElement = undefined;
});

const svg = new FakeSVGSVGElement();
const child = new FakeSVGElement();
child.ownerSVGElement = svg;
const html = new FakeElement();

/** React synthetic event shape. */
function synthetic(target: unknown, extra: object): LocalPointEvent {
  return { nativeEvent: new Event("x"), target, ...extra } as LocalPointEvent;
}

describe("localPoint", () => {
  it("maps an SVG child's event through the root CTM", () => {
    assert.deepEqual(
      localPoint(synthetic(child, { clientX: 70, clientY: 90 })),
      { x: 30, y: 35 }
    );
  });

  it("falls back to the bounding rect for HTML nodes", () => {
    assert.deepEqual(
      localPoint(synthetic(html, { clientX: 130, clientY: 60 })),
      { x: 28, y: 7 }
    );
  });

  it("reads the first changed touch", () => {
    assert.deepEqual(
      localPoint(
        synthetic(child, { changedTouches: [{ clientX: 30, clientY: 40 }] })
      ),
      { x: 10, y: 10 }
    );
  });

  it("returns null for non-events and missing nodes", () => {
    assert.equal(localPoint(null, { clientX: 1, clientY: 1 }), null);
    assert.equal(localPoint({ clientX: 1, clientY: 1 }), null);
  });
});
