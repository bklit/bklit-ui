import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { scaleLinear, scaleTime } from "d3-scale";
import { curveNatural } from "d3-shape";
import { linePathD } from "../line-path";
import {
  computeSeriesPathPoints,
  interpolateSeriesPathPoints,
  morphSeriesPolylines,
  seriesDataSignature,
  seriesPathFromPoints,
  seriesPathTransitionSignature,
  seriesPathTransitionSignatureFromData,
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

  it("derives the transition signature from the data signature", () => {
    const data = [
      { date: new Date("2025-01-01"), value: 10 },
      { date: new Date("2025-01-02"), value: "n/a" },
      { date: new Date("2025-01-03"), value: 30 },
    ];
    const domain = { innerWidth: 320, xDomainMin: 1, xDomainMax: 2 };
    assert.equal(
      seriesPathTransitionSignatureFromData(
        seriesDataSignature(data, xAccessor, "value"),
        domain
      ),
      seriesPathTransitionSignature({
        ...domain,
        renderData: data,
        xAccessor,
        dataKey: "value",
      })
    );
  });

  // `<Line>` draws the hook's resting path instead of its own `linePathD`.
  it("matches the Line resting path d", () => {
    const data = [
      { date: new Date("2025-01-01"), value: 10 },
      { date: new Date("2025-01-02"), value: 42.5 },
      { date: new Date("2025-01-03"), value: null },
      { date: new Date("2025-01-04"), value: 7 },
    ];
    const xScale = scaleTime()
      .domain([new Date("2025-01-01"), new Date("2025-01-04")])
      .range([0, 300]);
    const yScale = scaleLinear().domain([0, 50]).range([200, 0]);
    const expected = linePathD(data as Record<string, unknown>[], {
      curve: curveNatural,
      x: (d) => xScale(xAccessor(d)) ?? 0,
      y: (d) => (typeof d.value === "number" ? (yScale(d.value) ?? 0) : 0),
    });
    const points = computeSeriesPathPoints(
      data,
      xAccessor,
      xScale,
      yScale,
      "value"
    );
    assert.equal(seriesPathFromPoints(points, curveNatural), expected);
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

  it("morphs vertically on a shared x grid between polylines", () => {
    const from = [
      { key: "", x: 0, y: 0 },
      { key: "", x: 100, y: 100 },
    ];
    const to = [
      { key: "", x: 0, y: 50 },
      { key: "", x: 50, y: 50 },
      { key: "", x: 100, y: 50 },
    ];

    const start = morphSeriesPolylines(from, to, 0, 25);
    const mid = morphSeriesPolylines(from, to, 0.5, 25);
    const end = morphSeriesPolylines(from, to, 1, 25);

    assert.deepEqual(
      start.map((point) => point.x),
      [0, 25, 50, 75, 100]
    );
    assert.deepEqual(
      start.map((point) => point.y),
      [0, 25, 50, 75, 100]
    );
    assert.deepEqual(
      mid.map((point) => point.x),
      start.map((point) => point.x)
    );
    assert.deepEqual(
      mid.map((point) => point.y),
      [25, 37.5, 50, 62.5, 75]
    );
    assert.ok(end.every((point) => point.y === 50));
  });
});
