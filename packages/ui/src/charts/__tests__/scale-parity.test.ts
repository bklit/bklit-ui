// Parity guard for the visx -> d3 migration of linear / time / band scales.
// Delete this file together with the @visx/scale dependency once the
// migration is finished.
//
// @visx/scale 4.0.0 applies config keys in a fixed order (domain, nice, zero,
// interpolate, round, range, reverse, then align / clamp / padding) and skips
// any key that is undefined. Each case below builds the scale with the visx
// config used before and with the d3 chain now at the call site.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  scaleBand as visxScaleBand,
  scaleLinear as visxScaleLinear,
  scaleTime as visxScaleTime,
} from "@visx/scale";
import {
  type ScaleBand,
  type ScaleLinear,
  type ScaleTime,
  scaleBand,
  scaleLinear,
  scaleTime,
} from "d3-scale";
import {
  buildYScalesForLines,
  buildYScalesFromDomains,
} from "../y-axis-scales";
import { niceYDomain } from "../y-domain-utils";

const TICK_COUNTS = [undefined, 2, 5, 10];

function samples([a, b]: [number, number]): number[] {
  const span = b - a;
  return [
    a,
    b,
    a - span,
    b + span,
    a + span * 0.25,
    a + span * 0.5,
    a + span / 3,
    0,
  ];
}

const toNum = (v: number | Date) => +v;

/**
 * Everything a chart reads from a continuous scale. Compared with
 * `deepStrictEqual`, so NaN matches NaN and -0 differs from 0.
 */
function continuousSnapshot(
  scale: ScaleLinear<number, number> | ScaleTime<number, number>
) {
  const domain = scale.domain().map(toNum) as [number, number];
  const range = scale.range() as [number, number];
  const map = scale as unknown as (x: number) => number;
  return {
    domain,
    range,
    ticks: TICK_COUNTS.map((n) => scale.ticks(n).map(toNum)),
    mapped: samples(domain).map((x) => map(x)),
    inverted: samples(range).map((y) => toNum(scale.invert(y))),
  };
}

function bandSnapshot(scale: ScaleBand<string>) {
  return {
    domain: scale.domain(),
    range: scale.range(),
    bandwidth: scale.bandwidth(),
    step: scale.step(),
    paddingInner: scale.paddingInner(),
    paddingOuter: scale.paddingOuter(),
    align: scale.align(),
    round: scale.round(),
    mapped: [...scale.domain(), "missing"].map((key) => scale(key)),
  };
}

// Zero-crossing, negative, tiny, huge, single-value, reversed, fractional.
const LINEAR_DOMAINS: [number, number][] = [
  [0, 100],
  [0, 110.000_000_000_000_01],
  [-37.4, 82.9],
  [-500, -12],
  [0.0001, 0.000_42],
  [99.995, 100.004],
  [1e9, 3.7e9],
  [42, 42],
  [0, 0],
  [80, -20],
  [0.1, 0.7],
];
const RANGES: [number, number][] = [
  [300, 0],
  [0, 640],
  [0, 0],
  [1.5, 0],
];

describe("scaleLinear chains match @visx/scale", () => {
  it("{ domain, range } -> .domain().range()", () => {
    // chart-context useSettledYScale, y-axis-scales buildYScalesFromDomains,
    // heatmap brushYScale, loading-sweep x/y.
    for (const domain of LINEAR_DOMAINS) {
      for (const range of RANGES) {
        assert.deepEqual(
          continuousSnapshot(scaleLinear().domain(domain).range(range)),
          continuousSnapshot(visxScaleLinear<number>({ range, domain })),
          `linear ${domain} ${range}`
        );
      }
    }
  });

  it("{ domain, range, nice: true } -> .domain().nice().range()", () => {
    // y-axis-scales buildYScalesForLines, time-series shell fallback,
    // bar valueScale, candlestick yScale, live-line yScale.
    for (const domain of LINEAR_DOMAINS) {
      for (const range of RANGES) {
        assert.deepEqual(
          continuousSnapshot(scaleLinear().domain(domain).nice().range(range)),
          continuousSnapshot(
            visxScaleLinear<number>({ range, domain, nice: true })
          ),
          `linear nice ${domain} ${range}`
        );
      }
    }
  });

  it("niceYDomain and the y-axis builders match visx", () => {
    for (const domain of LINEAR_DOMAINS) {
      assert.deepEqual(
        niceYDomain(domain),
        visxScaleLinear<number>({ domain, range: [0, 1], nice: true }).domain()
      );
    }
    const lines = [
      { dataKey: "a", stroke: "red", strokeWidth: 1 },
      { dataKey: "b", stroke: "red", strokeWidth: 1, yAxisId: "right" },
    ];
    for (const domain of LINEAR_DOMAINS) {
      const nice = buildYScalesForLines({
        lines,
        innerHeight: 240,
        resolveDomain: () => domain,
      });
      const plain = buildYScalesFromDomains({
        lines,
        innerHeight: 240,
        domainsByAxis: { left: domain },
      });
      for (const id of ["left", "right"]) {
        assert.deepEqual(
          continuousSnapshot(nice[id] as ScaleLinear<number, number>),
          continuousSnapshot(
            visxScaleLinear<number>({ range: [240, 0], domain, nice: true })
          ),
          `buildYScalesForLines ${id} ${domain}`
        );
        assert.deepEqual(
          continuousSnapshot(plain[id] as ScaleLinear<number, number>),
          continuousSnapshot(
            visxScaleLinear<number>({ range: [240, 0], domain })
          ),
          `buildYScalesFromDomains ${id} ${domain}`
        );
      }
    }
  });
});

describe("scaleTime chains match @visx/scale", () => {
  // Spans DST in each zone (US 2026-03-08, EU 2026-03-29, AU 2026-04-05,
  // US fall-back 2026-11-01), a 30 s live-line window, a heatmap year, a
  // single instant, and numeric (getTime) endpoints as the shell passes.
  // Built per zone so local-time endpoints land on that zone's transitions.
  const domains = (): [Date | number, Date | number][] => [
    [new Date(2026, 2, 7), new Date(2026, 2, 10)],
    [new Date(2026, 2, 28, 12), new Date(2026, 2, 29, 12)],
    [new Date(2026, 3, 4), new Date(2026, 3, 6)],
    [new Date(2026, 9, 31, 22), new Date(2026, 10, 1, 6)],
    [new Date(2026, 0, 1), new Date(2026, 11, 31)],
    [Date.UTC(2026, 2, 8, 6, 59, 45), Date.UTC(2026, 2, 8, 7, 0, 15)],
    [new Date(2026, 5, 1), new Date(2026, 5, 1)],
    [Date.UTC(2025, 9, 1), Date.UTC(2026, 3, 1)],
  ];
  const zones = [
    "UTC",
    "America/New_York",
    "Europe/London",
    "Australia/Lord_Howe",
  ];
  const original = process.env.TZ;

  it("{ domain, range } -> .domain().range() across time zones", () => {
    // time-series shell, candlestick, live-line (x + tooltip), heatmap.
    try {
      for (const tz of zones) {
        process.env.TZ = tz;
        for (const domain of domains()) {
          for (const range of RANGES) {
            assert.deepEqual(
              continuousSnapshot(scaleTime().domain(domain).range(range)),
              continuousSnapshot(visxScaleTime<number>({ range, domain })),
              `time ${tz} ${domain.map(Number)} ${range}`
            );
          }
        }
      }
    } finally {
      if (original === undefined) {
        // biome-ignore lint/performance/noDelete: assigning undefined sets "undefined"
        delete process.env.TZ;
      } else {
        process.env.TZ = original;
      }
    }
  });
});

describe("scaleBand chain matches @visx/scale", () => {
  it("{ domain, range, padding } -> .domain().range().padding()", () => {
    // bar-chart categoryScale (padding = barGap, default 0.2).
    const domains = [
      [],
      ["Jan"],
      ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      Array.from({ length: 37 }, (_, i) => `c${i}`),
    ];
    for (const domain of domains) {
      for (const range of [
        [0, 640],
        [0, 233.7],
        [0, 0],
      ] as [number, number][]) {
        for (const padding of [0, 0.2, 0.5, 1]) {
          assert.deepEqual(
            bandSnapshot(
              scaleBand<string>().domain(domain).range(range).padding(padding)
            ),
            bandSnapshot(visxScaleBand<string>({ range, domain, padding })),
            `band ${domain.length} ${range} ${padding}`
          );
        }
      }
    }
  });
});
