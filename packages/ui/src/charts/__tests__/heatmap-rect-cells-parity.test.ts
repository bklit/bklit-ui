// visx -> d3 migration parity test for `@visx/heatmap` HeatmapRect cells.
// Delete together with the @visx/heatmap dependency once the migration is done.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { HeatmapRect } from "@visx/heatmap";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { heatmapRectCells } from "../heatmap/heatmap-rect-cells";

interface Bin {
  count?: number;
}
interface Column {
  bins: Bin[];
}

const DATA: Column[] = Array.from({ length: 6 }, (_, column) => ({
  bins: Array.from({ length: 7 }, (_, row) =>
    (column + row) % 5 === 0 ? {} : { count: (column * 7 + row) % 4 }
  ),
}));

/** Cells visx passed to its render prop. */
function visxCells(props: Record<string, unknown>): unknown {
  let cells: unknown;
  renderToStaticMarkup(
    createElement(HeatmapRect<Column, Bin>, {
      ...props,
      children: (built: unknown) => {
        cells = built;
        return null;
      },
    } as never)
  );
  return cells;
}

const bins = (column: Column) => column.bins;
const count = (bin: Bin) => bin.count as number;

const CASES: [string, Record<string, unknown>][] = [
  [
    "visx defaults",
    { xScale: (c: number) => c * 6, yScale: (r: number) => r * 6 },
  ],
  [
    // HeatmapChart: square bins, a month-separator offset on some columns.
    "chart layout with gap and separators",
    {
      binHeight: 14.25,
      binWidth: 14.25,
      gap: 3,
      xScale: (c: number) => c * 14.25 + (c >= 3 ? 8 : 0),
      yScale: (r: number) => r * 14.25,
      colorScale: (n?: number) => (n ? `level-${n}` : "empty"),
    },
  ],
  [
    "zero gap, x0 and opacity scale",
    {
      binHeight: 10,
      binWidth: 12,
      gap: 0,
      x0: 5,
      xScale: (c: number) => c * 12,
      yScale: (r: number) => r * 10,
      opacityScale: (n?: number) => (n ?? 0) / 4,
    },
  ],
];

describe("heatmapRectCells matches visx HeatmapRect", () => {
  for (const [name, options] of CASES) {
    it(name, () => {
      const props = { data: DATA, bins, count, ...options };
      assert.deepStrictEqual(
        heatmapRectCells(props as never),
        visxCells(props)
      );
    });
  }

  it("empty data", () => {
    const props = {
      xScale: (c: number) => c,
      yScale: (r: number) => r,
      bins,
      count,
    };
    assert.deepStrictEqual(heatmapRectCells(props), visxCells(props));
  });
});
