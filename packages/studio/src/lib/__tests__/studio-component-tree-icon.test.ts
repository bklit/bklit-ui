import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  AlignBottomIcon,
  AlignLeftIcon,
  ChartAreaIcon,
  CursorPointer01Icon,
  GridIcon,
  LayerIcon,
  LeftToRightListDashIcon,
} from "@hugeicons/core-free-icons";
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
      ChartAreaIcon
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
      GridIcon
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
      AlignBottomIcon
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
      AlignLeftIcon
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
      CursorPointer01Icon
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
      LeftToRightListDashIcon
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
      GridIcon
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
      LayerIcon
    );
  });
});
