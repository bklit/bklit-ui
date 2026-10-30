// visx -> d3 migration parity test. Delete together with @visx/event once the
// migration is finished.
import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { localPoint as visxLocalPoint } from "@visx/event";
import { localPoint } from "../local-point";

// Node has `Event` but no DOM: stub just enough of Element / SVGElement for
// both implementations' type guards.
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
function synthetic(target: unknown, extra: object) {
  return { nativeEvent: new Event("x"), target, ...extra };
}

function bothFor(...args: unknown[]) {
  const ours = (localPoint as (...a: unknown[]) => unknown)(...args);
  const theirs = (visxLocalPoint as (...a: unknown[]) => unknown)(...args) as {
    x: number;
    y: number;
  } | null;
  return { ours, theirs: theirs && { x: theirs.x, y: theirs.y } };
}

describe("localPoint matches @visx/event", () => {
  const cases: [string, unknown[]][] = [
    [
      "mouse on svg child (CTM)",
      [synthetic(child, { clientX: 70, clientY: 90 })],
    ],
    [
      "mouse on outermost svg (rect fallback)",
      [synthetic(svg, { clientX: 70, clientY: 90 })],
    ],
    [
      "mouse on html node (rect fallback)",
      [synthetic(html, { clientX: 130, clientY: 60 })],
    ],
    [
      "touch event on svg child",
      [synthetic(child, { changedTouches: [{ clientX: 30, clientY: 40 }] })],
    ],
    ["touch event with no touches", [synthetic(child, { changedTouches: [] })]],
    ["focus event (target rect centre)", [synthetic(child, {})]],
    ["explicit svg node + Touch", [svg, { clientX: 50, clientY: 60 }]],
    [
      "explicit child node + native event",
      [child, Object.assign(new Event("x"), { clientX: 12, clientY: 14 })],
    ],
  ];
  for (const [name, args] of cases) {
    it(name, () => {
      const { ours, theirs } = bothFor(...args);
      assert.ok(theirs);
      assert.deepEqual(ours, theirs);
    });
  }

  it("returns null for non-events and missing nodes", () => {
    assert.equal(localPoint(null, { clientX: 1, clientY: 1 }), null);
    assert.equal(localPoint({ clientX: 1, clientY: 1 }), null);
    assert.equal(visxLocalPoint({ clientX: 1, clientY: 1 } as never), null);
  });
});
