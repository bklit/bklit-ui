import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { validChartSlugs } from "@/chart-slugs";
import { getStudioConfig } from "../registry";
import { STUDIO_OG_PHASE_CHARTS } from "../studio-og-phase-charts";
import { normalizeStudioStateForOg } from "../studio-og-state";
import { defaultStudioState } from "../studio-parsers";
import {
  decodeStudioUrlState,
  encodeStudioUrlState,
} from "../studio-url-codec";
import {
  loadStudioStateFromRequest,
  studioSerializedParam,
} from "../studio-url-loader";

const MIN_CHART_PNG_BYTES = 8000;
const OG_INTEGRATION = process.env.STUDIO_OG_INTEGRATION === "1";
const OG_BASE_URL = process.env.STUDIO_OG_BASE_URL ?? "http://localhost:3000";

function ogStateForChart(slug: (typeof validChartSlugs)[number]) {
  return normalizeStudioStateForOg(defaultStudioState({ chart: slug }));
}

describe("studio OG state", () => {
  for (const slug of validChartSlugs) {
    it(`round-trips encoded OG state for ${slug}`, () => {
      const state = ogStateForChart(slug);
      const encoded = encodeStudioUrlState(state);
      assert.ok(encoded.startsWith("v1."));
      assert.deepEqual(decodeStudioUrlState(encoded), state);
    });

    it(`loads OG state from request for ${slug}`, () => {
      const state = ogStateForChart(slug);
      const serialized = studioSerializedParam(state);
      const url = new URL(
        `https://bklit.com/studio/og-preview?s=${encodeURIComponent(serialized)}`
      );
      const loaded = normalizeStudioStateForOg(loadStudioStateFromRequest(url));
      assert.equal(loaded.chart, slug);
      assert.equal(loaded.animationDuration, 0);
      assert.equal(loaded.livePaused, true);
    });

    it(`has studio registry config for ${slug}`, () => {
      const config = getStudioConfig(slug);
      assert.equal(typeof config.render, "function");
      if (slug === "profit-loss-line") {
        assert.equal(config.slug, "line-chart");
      } else {
        assert.equal(config.slug, slug);
      }
    });
  }

  it("phase-aware charts are a subset of valid slugs", () => {
    for (const slug of STUDIO_OG_PHASE_CHARTS) {
      assert.ok(
        (validChartSlugs as readonly string[]).includes(slug),
        `${slug} must be a valid chart slug`
      );
    }
  });
});

const integrationDescribe = OG_INTEGRATION ? describe : describe.skip;

integrationDescribe("studio OG chart screenshots (integration)", () => {
  for (const slug of validChartSlugs) {
    it(`returns a chart PNG for ${slug}`, async () => {
      const serialized = studioSerializedParam(ogStateForChart(slug));
      const url = `${OG_BASE_URL}/api/og/studio/chart?s=${encodeURIComponent(serialized)}`;
      const response = await fetch(url);
      assert.equal(
        response.status,
        200,
        `expected 200 for ${slug}, got ${response.status}`
      );
      assert.equal(
        response.headers.get("content-type"),
        "image/png",
        `expected image/png for ${slug}`
      );
      const body = Buffer.from(await response.arrayBuffer());
      assert.ok(
        body.byteLength >= MIN_CHART_PNG_BYTES,
        `${slug} PNG too small (${body.byteLength} bytes)`
      );
    });

    it(`returns a composited OG card for ${slug}`, async () => {
      const serialized = studioSerializedParam(ogStateForChart(slug));
      const url = `${OG_BASE_URL}/api/og/studio?s=${encodeURIComponent(serialized)}`;
      const response = await fetch(url);
      assert.equal(
        response.status,
        200,
        `expected 200 for ${slug}, got ${response.status}`
      );
      const contentType = response.headers.get("content-type") ?? "";
      assert.ok(
        contentType.includes("image"),
        `expected image response for ${slug}, got ${contentType}`
      );
      const body = Buffer.from(await response.arrayBuffer());
      assert.ok(
        body.byteLength >= MIN_CHART_PNG_BYTES,
        `${slug} OG card too small (${body.byteLength} bytes)`
      );
    });
  }
});
