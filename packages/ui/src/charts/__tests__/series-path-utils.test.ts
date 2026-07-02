import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  computeSeriesPathPoints,
  interpolateSeriesPathPoints,
  seriesPathTransitionSignature,
} from "../series-path-utils";

const WIDTH_PREFIX = /400\|/;
const TEN_VALUE = /:10/;
const TWENTY_VALUE = /:20/;

describe("series-path-utils", () => {
  const xAccessor = (datum: Record<string, unknown>) => datum.date as Date;

  it("builds stable transition signatures from data and x-domain", () => {
    const data = [
      { date: new Date("2025-01-01"), value: 10 },
      { date: new Date("2025-01-02"), value: 20 },
    ];
    const signature = seriesPathTransitionSignature({
      renderData: data,
      xAccessor,
      dataKey: "value",
      innerWidth: 400,
      xDomainMin: new Date("2025-01-01").getTime(),
      xDomainMax: new Date("2025-01-02").getTime(),
    });

    assert.match(signature, WIDTH_PREFIX);
    assert.match(signature, TEN_VALUE);
    assert.match(signature, TWENTY_VALUE);
  });

  it("interpolates matched points toward the next layout", () => {
    const from = [
      { key: "1", x: 0, y: 100 },
      { key: "2", x: 100, y: 80 },
    ];
    const to = [
      { key: "1", x: 0, y: 80 },
      { key: "2", x: 200, y: 40 },
    ];

    const mid = interpolateSeriesPathPoints(from, to, 0.5);
    assert.deepEqual(mid, [
      { key: "1", x: 0, y: 90 },
      { key: "2", x: 150, y: 60 },
    ]);
  });

  it("anchors new points to the previous series position", () => {
    const from = [{ key: "2", x: 100, y: 80 }];
    const to = [
      { key: "1", x: 0, y: 100 },
      { key: "2", x: 200, y: 40 },
    ];

    const mid = interpolateSeriesPathPoints(from, to, 0.5);
    assert.equal(mid[0]?.x, 50);
    assert.equal(mid[0]?.y, 90);
    assert.equal(mid[1]?.x, 150);
    assert.equal(mid[1]?.y, 60);
  });

  it("computes pixel positions from scales", () => {
    const data = [{ date: new Date("2025-01-01"), value: 10 }];
    const points = computeSeriesPathPoints(
      data,
      xAccessor,
      () => 24,
      () => 120,
      "value"
    );

    assert.deepEqual(points, [
      { key: String(data[0]?.date.getTime()), x: 24, y: 120 },
    ]);
  });
});
