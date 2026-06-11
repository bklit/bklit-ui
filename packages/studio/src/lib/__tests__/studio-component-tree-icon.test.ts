import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CHART_TYPE_ICONS } from "../../components/chart-type-icons";
import { resolveStudioComponentTreeIcon } from "../studio-component-tree-icon";
import type { StudioComponentDefinition } from "../types";

function component(
  overrides: Partial<StudioComponentDefinition> &
    Pick<StudioComponentDefinition, "id" | "label">
): StudioComponentDefinition {
  return {
    controlGroups: [],
    ...overrides,
  };
}

describe("resolveStudioComponentTreeIcon", () => {
  it("uses the chart-type icon for the root chart node", () => {
    assert.equal(
      resolveStudioComponentTreeIcon(
        component({ id: "area.chart", label: "AreaChart" }),
        "area-chart"
      ),
      CHART_TYPE_ICONS["area-chart"]
    );
  });

  it("maps structural chart layers to their dedicated icons", () => {
    assert.equal(
      resolveStudioComponentTreeIcon(
        component({
          id: "area.grid",
          label: "Grid",
          parentId: "area.chart",
        }),
        "area-chart"
      ),
      "IconCanvasGrid"
    );
    assert.equal(
      resolveStudioComponentTreeIcon(
        component({
          id: "area.xaxis",
          label: "XAxis",
          parentId: "area.chart",
        }),
        "area-chart"
      ),
      "IconLayoutAlignBottom"
    );
    assert.equal(
      resolveStudioComponentTreeIcon(
        component({
          id: "live-line.yaxis",
          label: "LiveYAxis",
          parentId: "live-line.chart",
        }),
        "live-line-chart"
      ),
      "IconLayoutAlignLeft"
    );
    assert.equal(
      resolveStudioComponentTreeIcon(
        component({
          id: "area.tooltip",
          label: "ChartTooltip",
          parentId: "area.chart",
        }),
        "area-chart"
      ),
      "IconCursorClick"
    );
    assert.equal(
      resolveStudioComponentTreeIcon(
        component({
          id: "area.legend",
          label: "ChartLegend",
          parentId: "area.chart",
        }),
        "area-chart"
      ),
      "IconListBullets"
    );
    assert.equal(
      resolveStudioComponentTreeIcon(
        component({
          id: "choropleth.graticule",
          label: "ChoroplethGraticule",
          parentId: "choropleth.chart",
        }),
        "choropleth-chart"
      ),
      "IconCanvasGrid"
    );
    assert.equal(
      resolveStudioComponentTreeIcon(
        component({
          id: "pie.center",
          label: "PieCenter",
          parentId: "pie.chart",
        }),
        "pie-chart"
      ),
      "IconNoteText"
    );
    assert.equal(
      resolveStudioComponentTreeIcon(
        component({
          id: "gauge.center",
          label: "PieCenterShell",
          parentId: "gauge.chart",
        }),
        "gauge-chart"
      ),
      "IconNoteText"
    );
  });

  it("falls back to LayerIcon for other components", () => {
    assert.equal(
      resolveStudioComponentTreeIcon(
        component({
          id: "area.series.0",
          label: "Area · desktop",
          parentId: "area.chart",
          listMarker: "icon",
        }),
        "area-chart"
      ),
      "IconLayersTwo"
    );
  });
});
