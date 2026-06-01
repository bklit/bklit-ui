import assert from "node:assert/strict";
import test from "node:test";
import { studioChartGridLayout } from "../studio-chart-grid";

const ENDS_WITH_AUTO = /auto$/;
const STARTS_WITH_AUTO = /^auto /;

test("studioChartGridLayout collapses outer tracks when legend is hidden", () => {
  const layout = studioChartGridLayout(
    { legendPlacement: "bottom", legendAlign: "end" },
    false
  );
  assert.equal(layout.gridTemplateColumns, "0 minmax(0, 1fr) 0");
  assert.equal(layout.gridTemplateRows, "0 minmax(0, 1fr) 0");
  assert.equal(layout.chartGridArea, "2 / 2");
});

test("studioChartGridLayout places legend in bottom-end cell", () => {
  const layout = studioChartGridLayout(
    { legendPlacement: "bottom", legendAlign: "end" },
    true
  );
  assert.equal(layout.legendGridArea, "3 / 3");
  assert.match(layout.gridTemplateColumns, ENDS_WITH_AUTO);
  assert.match(layout.gridTemplateRows, ENDS_WITH_AUTO);
});

test("studioChartGridLayout places legend in top-center cell", () => {
  const layout = studioChartGridLayout(
    { legendPlacement: "top", legendAlign: "center" },
    true
  );
  assert.equal(layout.legendGridArea, "1 / 2");
  assert.equal(layout.gridTemplateColumns, "0 minmax(0, 1fr) 0");
  assert.match(layout.gridTemplateRows, STARTS_WITH_AUTO);
});
