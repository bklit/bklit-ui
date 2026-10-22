import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getBarValueLabelLayout } from "../bar-value-label-layout";

describe("getBarValueLabelLayout", () => {
  it("keeps a fitting auto label horizontal and centered", () => {
    assert.deepEqual(
      getBarValueLabelLayout({
        x: 10,
        y: 20,
        width: 80,
        height: 40,
        labelWidth: 30,
        isHorizontal: false,
        orientation: "auto",
        position: "center",
      }),
      { fits: true, rotated: false, x: 50, y: 40 }
    );
  });

  it("rotates an auto label only when the bar can contain it", () => {
    const layout = getBarValueLabelLayout({
      x: 10,
      y: 20,
      width: 30,
      height: 90,
      labelWidth: 60,
      isHorizontal: false,
      orientation: "auto",
      position: "bottom",
    });

    assert.deepEqual(layout, { fits: true, rotated: true, x: 25, y: 74 });
  });

  it("does not rotate an explicitly horizontal label into a narrow bar", () => {
    const layout = getBarValueLabelLayout({
      x: 0,
      y: 0,
      width: 30,
      height: 90,
      labelWidth: 60,
      isHorizontal: false,
      orientation: "horizontal",
      position: "top",
    });

    assert.deepEqual(layout, { fits: false, rotated: false, x: 15, y: 12 });
  });

  it("honors an explicit vertical orientation when both layouts fit", () => {
    const layout = getBarValueLabelLayout({
      x: 0,
      y: 0,
      width: 80,
      height: 90,
      labelWidth: 30,
      isHorizontal: false,
      orientation: "vertical",
      position: "center",
    });

    assert.equal(layout.fits, true);
    assert.equal(layout.rotated, true);
  });

  it("keeps top/bottom labels fully inside the bar", () => {
    const top = getBarValueLabelLayout({
      x: 0,
      y: 0,
      width: 30,
      height: 100,
      labelWidth: 60,
      isHorizontal: false,
      orientation: "vertical",
      position: "top",
    });
    assert.ok(top.y - 30 >= 0);
    const end = getBarValueLabelLayout({
      x: 0,
      y: 0,
      width: 200,
      height: 30,
      labelWidth: 40,
      isHorizontal: true,
      orientation: "horizontal",
      position: "top",
    });
    assert.equal(end.y, 15);
    assert.ok(end.x + 20 <= 200 && end.x > 100);
  });
});
