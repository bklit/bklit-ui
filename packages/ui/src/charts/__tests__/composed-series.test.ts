import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createElement, Fragment } from "react";
import { Area } from "../area";
import { Candlestick } from "../candlestick";
import { extractComposedSeries } from "../composed-chart";
import { Line } from "../line";
import { Scatter } from "../scatter";
import { SeriesBar } from "../series-bar";
import { resolveFloatingYDomain } from "../y-domain-utils";

describe("extractComposedSeries", () => {
  it("registers every time-series primitive, including inside fragments", () => {
    const series = extractComposedSeries([
      createElement(SeriesBar, { dataKey: "volume", key: "bar" }),
      createElement(
        Fragment,
        { key: "group" },
        createElement(Area, { dataKey: "revenue" }),
        createElement(Line, { dataKey: "revenue", stroke: "red" })
      ),
      createElement(Scatter, { dataKey: "signups", key: "scatter" }),
      createElement(Candlestick, { yAxisId: "right", key: "candles" }),
    ]);

    assert.deepEqual(series.barDataKeys, ["volume"]);
    assert.deepEqual(
      series.lines.map((line) => line.dataKey),
      ["volume", "revenue", "signups", "close"]
    );
    // Line after Area on the same key wins.
    assert.equal(series.lines[1]?.stroke, "red");
    assert.deepEqual(series.extraDomainKeysByAxis, {
      right: ["high", "low", "open"],
    });
    assert.deepEqual(series.floatingYAxisIds, ["right"]);
  });
});

describe("resolveFloatingYDomain", () => {
  it("pads min..max without anchoring at zero", () => {
    const domain = resolveFloatingYDomain(
      [
        { high: 120, low: 100 },
        { high: 140, low: 110 },
      ],
      ["high", "low"]
    );
    assert.deepEqual(domain, [98, 142]);
  });
});
