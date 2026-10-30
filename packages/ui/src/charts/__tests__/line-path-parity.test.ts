// visx -> d3 migration parity test for `@visx/shape` LinePath / AreaClosed.
// Delete together with the @visx/shape dependency once the migration is done.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { AreaClosed, LinePath as VisxLinePath } from "@visx/shape";
import { scaleLinear } from "d3-scale";
import {
  type CurveFactory,
  curveBasis,
  curveLinear,
  curveMonotoneX,
  curveNatural,
  curveStep,
} from "d3-shape";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { areaClosedD, LinePath, linePathD } from "../line-path";

interface Datum {
  t: number;
  v: number | null;
}

const DATA: Datum[] = [
  { t: 0, v: 3 },
  { t: 1, v: 7.25 },
  { t: 2, v: null },
  { t: 3, v: 5 },
  { t: 4, v: null },
  { t: 5, v: 1 / 3 },
  { t: 6, v: 9 },
];

const xScale = scaleLinear().domain([0, 6]).range([0, 317]);
const yScale = scaleLinear().domain([0, 10]).range([183.5, 0]);
const x = (d: Datum) => xScale(d.t);
const y = (d: Datum) => yScale(d.v ?? 0);
const defined = (d: Datum) => d.v !== null;

const CURVES: [string, CurveFactory | undefined][] = [
  ["default", undefined],
  ["linear", curveLinear],
  ["monotoneX", curveMonotoneX],
  ["natural", curveNatural],
  ["step", curveStep],
  ["basis", curveBasis],
];

const html = (type: unknown, props: Record<string, unknown>) =>
  renderToStaticMarkup(createElement(type as "path", props));

/** Rest props as the bklit callers pass them (line, live-line, sweep, …). */
const LINE_PROPS: Record<string, unknown>[] = [
  { stroke: "red", strokeLinecap: "round", strokeWidth: 2 },
  {
    filter: "url(#glow)",
    stroke: "url(#g)",
    strokeLinecap: "round",
    strokeOpacity: 0.4,
    strokeWidth: 6,
  },
  {
    fill: "none",
    stroke: "var(--foreground)",
    strokeLinecap: "round",
    strokeOpacity: 0.55,
    strokeWidth: 2,
  },
  {
    stroke: "blue",
    strokeDasharray: "6,4",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    strokeOpacity: 1,
    strokeWidth: 2.5,
  },
];

describe("LinePath matches visx LinePath", () => {
  for (const [name, curve] of CURVES) {
    for (const withGaps of [false, true]) {
      it(`${name} curve${withGaps ? ", defined gaps" : ""}`, () => {
        const data = withGaps ? DATA : DATA.filter(defined);
        const config = { curve, x, y, defined: withGaps ? defined : undefined };
        for (const props of LINE_PROPS) {
          const visx = html(VisxLinePath, { ...config, data, ...props });
          const ours = html(LinePath, { d: linePathD(data, config), ...props });
          assert.equal(ours, visx.replace(' class="visx-linepath"', ""));
        }
      });
    }
  }

  it("empty data renders an empty d", () => {
    const visx = html(VisxLinePath, { data: [], x, y });
    assert.equal(
      html(LinePath, { d: linePathD([], { x, y }) }),
      visx.replace(' class="visx-linepath"', "")
    );
    assert.ok(visx.includes('d=""'));
  });
});

describe("AreaClosed matches visx AreaClosed", () => {
  const baselines: [string, Record<string, unknown>][] = [
    ["yScale.range()[0] baseline", { yScale }],
    // range()[0] is the top here: visx takes the first value, not the max.
    [
      "reversed range baseline",
      { yScale: scaleLinear().domain([0, 10]).range([0, 183.5]) },
    ],
    ["explicit y0", { y0: 42.5, yScale }],
    ["accessor y0", { y0: (d: Datum) => yScale((d.v ?? 0) / 2), yScale }],
  ];
  for (const [name, curve] of CURVES) {
    for (const [baselineName, baseline] of baselines) {
      it(`${name} curve, ${baselineName}`, () => {
        for (const data of [DATA.filter(defined), DATA]) {
          const config = {
            curve,
            x,
            y,
            defined: data === DATA ? defined : undefined,
            ...baseline,
          };
          for (const props of [
            { fill: "url(#a)" },
            { fill: "url(#b)", strokeWidth: 0 },
          ]) {
            const visx = html(AreaClosed, { ...config, data, ...props });
            const ours = html("path", {
              d: areaClosedD(data, config),
              ...props,
            });
            assert.equal(ours, visx.replace(' class="visx-area-closed"', ""));
          }
        }
      });
    }
  }
});
