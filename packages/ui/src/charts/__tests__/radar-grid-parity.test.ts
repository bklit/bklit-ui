// visx -> d3 migration parity test. Delete together with the @visx/* deps
// once the migration is finished.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { LineRadial } from "@visx/shape";
import { scaleLinear } from "d3-scale";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { RadarGridRing } from "../radar-grid";

/** Same angle data + scale RadarGrid builds. */
function ringData(metricCount: number) {
  const degrees = 360;
  const data = [...new Array(metricCount + 1)].map((_, i) => ({
    angle: i * (degrees / metricCount) + degrees / metricCount / 2,
  }));
  const radialScale = scaleLinear<number>()
    .domain([degrees, 0])
    .range([0, Math.PI * 2]);
  const angle = (d: { angle: number }) => radialScale(d.angle) ?? 0;
  return { data, angle };
}

function renderBoth(
  metricCount: number,
  radius: number,
  stroke: string,
  strokeOpacity: number
) {
  const { data, angle } = ringData(metricCount);
  // Previous RadarGrid markup, verbatim.
  const visx = renderToStaticMarkup(
    createElement(LineRadial<{ angle: number }>, {
      angle,
      data,
      fill: "none",
      radius,
      stroke,
      strokeLinecap: "round",
      strokeOpacity,
      strokeWidth: 1,
    })
  );
  const d3 = renderToStaticMarkup(
    createElement(RadarGridRing, { angle, data, radius, stroke, strokeOpacity })
  );
  return { visx, d3 };
}

describe("RadarGridRing matches visx LineRadial", () => {
  const cases: [number, number, string, number][] = [
    [3, 40, "var(--border)", 0.6],
    [5, 23.4, "var(--border)", 0.6],
    [6, 117.5, "#ccc", 1],
    [8, 64, "red", 0.25],
    [12, 200 / 3, "var(--border)", 0.6],
    // Degenerate: 0 radius (visx skipped the radius setter).
    [5, 0, "var(--border)", 0.6],
  ];
  for (const [metrics, radius, stroke, opacity] of cases) {
    it(`${metrics} metrics, radius ${radius}`, () => {
      const { visx, d3 } = renderBoth(metrics, radius, stroke, opacity);
      assert.equal(d3, visx.replace(' class="visx-line-radial"', ""));
      assert.ok(visx.includes(' class="visx-line-radial"'));
    });
  }
});
