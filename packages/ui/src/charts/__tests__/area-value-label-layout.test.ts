import assert from "node:assert/strict";
import { test } from "node:test";
import {
  layoutAreaValueLabels,
  resolveAreaValueLabelCount,
} from "../area-value-label-layout";

const box = (index: number, x: number, y = 50, width = 70) => ({
  index,
  x,
  y,
  width,
  height: 14,
});
test("keeps measured labels inside the plot, collision-free and within count limits", () => {
  for (const width of [30, 100, 300, 800]) {
    const input = Array.from({ length: 30 }, (_, i) => [
      box(i, (i * width) / 29),
      box(i, (i * width) / 29, 52),
    ]).flat();
    const result = layoutAreaValueLabels(input, width, 100);
    for (const a of result) {
      assert(a.x - a.width / 2 >= 4 && a.x + a.width / 2 <= width - 4);
      assert(a.y - a.height / 2 >= 4 && a.y + a.height / 2 <= 96);
      for (const b of result) {
        if (a !== b) {
          assert(
            Math.abs(a.x - b.x) >= (a.width + b.width) / 2 + 6 ||
              Math.abs(a.y - b.y) >= (a.height + b.height) / 2 + 6
          );
        }
      }
    }
    if (width === 30) {
      assert.equal(result.length, 0);
    } else {
      assert(result.length > 0 && result.length < input.length);
    }
  }
  assert.equal(
    layoutAreaValueLabels([box(0, 0), box(1, 300)], 300, 100).length,
    2
  );
  assert.equal(
    layoutAreaValueLabels([box(0, 150), box(0, 150, 52)], 300, 100).length,
    2
  );
  assert.equal(
    layoutAreaValueLabels(
      [box(0, -1), box(1, 301), box(2, Number.NaN)],
      300,
      100
    ).length,
    0
  );
  assert.equal(layoutAreaValueLabels([box(0, 150, 0)], 300, 100).length, 1);
  assert.equal(layoutAreaValueLabels([box(0, 150, 100)], 300, 100).length, 1);
  assert.equal(
    layoutAreaValueLabels([box(0, 150, 50, 400)], 300, 100).length,
    0
  );
  const measuredLabel = { ...box(0, 150), text: "۲۹٬۴۳۰", seriesIndex: 0 };
  assert.equal(layoutAreaValueLabels([measuredLabel], 300, 100).length, 1);

  assert.equal(resolveAreaValueLabelCount(20, 800, 2, 5), 5);
  assert.equal(resolveAreaValueLabelCount(20, 80, 3, 5), 3);
  assert.equal(resolveAreaValueLabelCount(20, 800, 5, 0), 0);
  assert.equal(resolveAreaValueLabelCount(20, 800, 5, 1), 1);
  assert.equal(resolveAreaValueLabelCount(2, 800, 5, 10), 2);
  assert.equal(resolveAreaValueLabelCount(20, 800, Number.NaN, -1), 0);
  assert.equal(resolveAreaValueLabelCount(0, 800, 2, 5), 0);
});
