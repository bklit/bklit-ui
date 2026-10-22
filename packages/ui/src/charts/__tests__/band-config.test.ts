import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createElement, Fragment } from "react";
import { extractBandConfigs } from "../band-config";
import { formatBandRange } from "../chart-formatters";

// Matched by component name, like the real `<Band>`.
function Band(_props: Record<string, unknown>) {
  return null;
}

describe("extractBandConfigs", () => {
  it("collects colour, label and tooltip opt-out per band", () => {
    const configs = extractBandConfigs(
      createElement(
        Fragment,
        null,
        createElement(Band, { upperKey: "aHi", lowerKey: "aLo" }),
        createElement(Band, {
          upperKey: "bHi",
          lowerKey: "bLo",
          fill: "var(--chart-2)",
          label: "Team B",
          showInTooltip: false,
          yAxisId: "right",
        })
      )
    );
    assert.deepEqual(configs, [
      {
        yAxisId: "left",
        upperKey: "aHi",
        lowerKey: "aLo",
        color: "var(--chart-line-primary)",
        label: "aLo – aHi",
        showInTooltip: true,
      },
      {
        yAxisId: "right",
        upperKey: "bHi",
        lowerKey: "bLo",
        color: "var(--chart-2)",
        label: "Team B",
        showInTooltip: false,
      },
    ]);
  });
});

describe("formatBandRange", () => {
  it("orders the range, collapses single-key bands, skips gaps", () => {
    assert.equal(
      formatBandRange({ hi: 1200, lo: 900 }, "hi", "lo"),
      "900 – 1,200"
    );
    assert.equal(formatBandRange({ hi: 5, lo: 9 }, "hi", "lo"), "5 – 9");
    assert.equal(formatBandRange({ sma: 7 }, "sma", "sma"), 7);
    assert.equal(formatBandRange({ hi: null, lo: 2 }, "hi", "lo"), null);
  });
});
