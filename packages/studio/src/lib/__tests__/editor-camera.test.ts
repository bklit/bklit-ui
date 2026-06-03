import assert from "node:assert/strict";
import test from "node:test";
import { adjustCameraForContentBoundsChange } from "@/editor/editor-camera";

test("adjustCameraForContentBoundsChange shifts pan when artboard grows from origin", () => {
  const camera = { x: 100, y: 50, zoom: 2 };
  const prev = { x: 0, y: 0, width: 400, height: 300 };
  const next = { x: 0, y: 0, width: 600, height: 500 };

  assert.deepEqual(adjustCameraForContentBoundsChange(camera, prev, next), {
    x: 100 - 200,
    y: 50 - 200,
    zoom: 2,
  });
});

test("adjustCameraForContentBoundsChange is unchanged when artboard moves", () => {
  const camera = { x: 10, y: 20, zoom: 1 };
  const prev = { x: 0, y: 0, width: 400, height: 300 };
  const next = { x: 40, y: 0, width: 400, height: 300 };

  assert.deepEqual(
    adjustCameraForContentBoundsChange(camera, prev, next),
    camera
  );
});
