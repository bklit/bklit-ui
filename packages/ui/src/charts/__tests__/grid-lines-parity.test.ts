// visx -> d3 migration parity test for `@visx/grid` GridRows / GridColumns.
// Delete together with the @visx/grid dependency once the migration is done.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  GridColumns as VisxGridColumns,
  GridRows as VisxGridRows,
} from "@visx/grid";
import { scaleBand, scaleLinear, scaleTime } from "d3-scale";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { GridColumns, GridRows, gridTickValues } from "../grid-lines";

const html = (type: unknown, props: Record<string, unknown>) =>
  renderToStaticMarkup(createElement(type as "g", props));

const VISX_GROUP_CLASS = / class="visx-group visx-(?:rows|columns)( [^"]*)?"/;

/** Our markup is visx's without its library classes. */
const stripVisxClasses = (markup: string) =>
  markup
    .replaceAll(' class="visx-line"', "")
    .replace(VISX_GROUP_CLASS, (_, rest) =>
      rest ? ` class="${rest.trim()}"` : ""
    );

const linear = scaleLinear().domain([0, 137]).nice().range([300, 0]);
const time = scaleTime()
  .domain([new Date(2024, 0, 1), new Date(2024, 11, 31)])
  .range([0, 640]);
const band = scaleBand<string>()
  .domain(["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m"])
  .range([0, 500])
  .padding(0.2);
const fewBands = scaleBand<string>().domain(["x", "y", "z"]).range([0, 90]);

const SCALES: [string, unknown][] = [
  ["linear", linear],
  ["time", time],
  ["band (thinned domain)", band],
  ["band (short domain)", fewBands],
];

/** Prop sets the bklit grids pass, plus visx options they could. */
const PROPS: Record<string, unknown>[] = [
  {},
  {
    numTicks: 5,
    stroke: "var(--chart-grid)",
    strokeDasharray: "4,4",
    strokeOpacity: 1,
    strokeWidth: 1,
  },
  { numTicks: undefined, stroke: "url(#shimmer)", strokeOpacity: 1 },
  { numTicks: 3, offset: 2.5, lineStyle: { opacity: 0.5 } },
  { className: "custom", left: 4, top: 8, fill: "red", strokeWidth: "2" },
];

describe("GridRows / GridColumns match visx", () => {
  for (const [name, scale] of SCALES) {
    it(`${name} scale`, () => {
      for (const props of PROPS) {
        const rows = { scale, width: 320, ...props };
        assert.equal(
          html(GridRows, rows),
          stripVisxClasses(html(VisxGridRows, rows))
        );
        const columns = { scale, height: 180, ...props };
        assert.equal(
          html(GridColumns, columns),
          stripVisxClasses(html(VisxGridColumns, columns))
        );
      }
    });
  }

  it("explicit tickValues (rows: numbers, columns: dates)", () => {
    const rows = {
      numTicks: undefined,
      scale: linear,
      tickValues: [20, 60, 100],
      width: 320,
    };
    assert.equal(
      html(GridRows, rows),
      stripVisxClasses(html(VisxGridRows, rows))
    );
    const columns = {
      height: 180,
      scale: time,
      tickValues: time.ticks(6).slice(1, -1),
    };
    assert.equal(
      html(GridColumns, columns),
      stripVisxClasses(html(VisxGridColumns, columns))
    );
  });

  it("thins band domains like visx getTicks", () => {
    assert.deepEqual(gridTickValues(band, 5), [
      "a",
      "c",
      "e",
      "g",
      "i",
      "k",
      "m",
    ]);
    assert.deepEqual(gridTickValues(fewBands), ["x", "y", "z"]);
  });

  it("strips only library classes", () => {
    const visx = html(VisxGridRows, { scale: linear, width: 10 });
    assert.ok(visx.startsWith('<g class="visx-group visx-rows" transform='));
    assert.ok(visx.includes('<line class="visx-line" x1="0"'));
  });
});
