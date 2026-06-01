import assert from "node:assert/strict";
import test from "node:test";
import { studioChartGridLayout } from "../studio-chart-grid";

const ENDS_WITH_AUTO = /auto$/;
const STARTS_WITH_AUTO = /^auto /;
const STARTS_WITH_AUTO_COLUMNS = /^auto /;

test("studioChartGridLayout collapses outer rows when legend is hidden", () => {
  const layout = studioChartGridLayout(
    { legendPlacement: "bottom", legendAlign: "end" },
    false
  );
  assert.equal(layout.gridTemplateColumns, "0 minmax(0, 1fr) 0");
  assert.equal(layout.gridTemplateRows, "0 minmax(0, 1fr) 0");
  assert.equal(layout.chartGridArea, "2 / 1 / 3 / -1");
});

test("studioChartGridLayout places legend bottom-right and chart spans columns", () => {
  const layout = studioChartGridLayout(
    { legendPlacement: "bottom", legendAlign: "end" },
    true
  );
  assert.equal(layout.legendGridArea, "3 / 3");
  assert.equal(layout.chartGridArea, "2 / 1 / 3 / -1");
  assert.match(layout.gridTemplateColumns, ENDS_WITH_AUTO);
  assert.match(layout.gridTemplateRows, ENDS_WITH_AUTO);
});

test("studioChartGridLayout places legend top-center", () => {
  const layout = studioChartGridLayout(
    { legendPlacement: "top", legendAlign: "center" },
    true
  );
  assert.equal(layout.legendGridArea, "1 / 2");
  assert.equal(layout.chartGridArea, "2 / 1 / 3 / -1");
  assert.equal(
    layout.gridTemplateColumns,
    "minmax(0, 1fr) auto minmax(0, 1fr)"
  );
  assert.match(layout.gridTemplateRows, STARTS_WITH_AUTO);
});

test("studioChartGridLayout places legend top-left", () => {
  const layout = studioChartGridLayout(
    { legendPlacement: "top", legendAlign: "start" },
    true
  );
  assert.equal(layout.legendGridArea, "1 / 1");
  assert.match(layout.gridTemplateColumns, STARTS_WITH_AUTO_COLUMNS);
});
