import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { validChartSlugs } from "@/chart-slugs";
import { getStudioControlGroups } from "../control-groups";
import { getStudioConfig } from "../registry";
import {
  isStudioComponentVisible,
  studioChartRootComponentId,
  toggleStudioComponentVisibility,
} from "../studio-component-visibility";
import {
  getStudioComponents,
  getStudioDataControlGroups,
} from "../studio-components";
import { defaultStudioState } from "../studio-parsers";
import type { ChartSlug } from "../types";

function chartState(slug: ChartSlug) {
  return defaultStudioState({
    chart: slug === "profit-loss-line" ? "line-chart" : slug,
    dataSeries: 2,
    // Terminal marker controls only appear once a projection exists.
    ...(slug === "line-chart" ? { projectionCount: 1 } : {}),
    ...(slug === "profit-loss-line"
      ? { lineChartMode: "profitLoss" as const }
      : {}),
  });
}

describe("studio layer tree", () => {
  for (const slug of validChartSlugs) {
    const config = getStudioConfig(slug);
    const state = chartState(slug);
    const components = getStudioComponents(config, state);

    it(`${slug}: root layer id matches the root-visibility gate`, () => {
      const roots = components.filter((component) => !component.parentId);
      assert.deepEqual(
        roots.map((component) => component.id),
        [studioChartRootComponentId(state.chart)]
      );
    });

    it(`${slug}: every chart control is reachable from a layer`, () => {
      const reachable = new Set<string>();
      const groups = [
        ...components.flatMap((component) => component.controlGroups),
        ...getStudioDataControlGroups(config, state),
      ];
      for (const group of groups) {
        for (const control of group.controls) {
          reachable.add(String(control.key));
        }
      }
      const unreachable = getStudioControlGroups(config, state).flatMap(
        (group) =>
          group.controls
            .filter((control) => !reachable.has(String(control.key)))
            .map((control) => `${group.title} › ${String(control.key)}`)
      );
      assert.deepEqual(unreachable, []);
    });
  }

  it("background layer only counts as visible while the grid is hidden", () => {
    const state = defaultStudioState({ chart: "line-chart" });
    assert.equal(isStudioComponentVisible(state, "line.background"), false);

    const shown = {
      ...state,
      hiddenComponents: toggleStudioComponentVisibility(
        state,
        "line.background"
      ),
    };
    assert.equal(isStudioComponentVisible(shown, "line.background"), true);
    assert.equal(isStudioComponentVisible(shown, "line.grid"), false);
  });
});
