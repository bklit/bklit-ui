import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  BKLIT_REGISTRY_NAMESPACE,
  REGISTRY_ORIGIN,
  registryJsonUrlForName,
  shadcnAddItem,
  studioChartDocsHref,
  studioChartHref,
  studioEmbedHref,
  studioEmbedIframeMarkup,
  studioOpenInV0Href,
  studioRegistryJsonUrl,
  studioShareStudioUrl,
} from "../chart-links";
import { defaultStudioState } from "../studio-parsers";

const FLAT_CHART_PARAM_RE = /chart=/;
const IFRAME_TAG_RE = /^<iframe /;
const EMBED_SRC_RE = /src="https:\/\/bklit\.com\/studio\/embed\?s=v1\./;
const IFRAME_HEIGHT_RE = /height="520"/;

describe("chart-links", () => {
  it("studioRegistryJsonUrl points at the public registry", () => {
    assert.equal(
      studioRegistryJsonUrl("area-chart"),
      `${REGISTRY_ORIGIN}/r/area-chart.json`
    );
  });

  it("registryJsonUrlForName matches PackageManagerTabs host", () => {
    assert.equal(
      registryJsonUrlForName("gauge-chart"),
      studioRegistryJsonUrl("gauge-chart")
    );
  });

  it("shadcnAddItem uses the @bklit namespace", () => {
    assert.equal(
      shadcnAddItem("line-chart"),
      `${BKLIT_REGISTRY_NAMESPACE}/line-chart`
    );
  });

  it("studioOpenInV0Href encodes the v0 example registry URL", () => {
    const href = studioOpenInV0Href("area-chart");
    assert.ok(href.startsWith("https://v0.dev/chat/api/open?url="));
    const encoded = href.split("url=")[1];
    assert.equal(
      decodeURIComponent(encoded ?? ""),
      "https://bklit.com/r/area-chart-example.json"
    );
  });

  it("studioChartDocsHref maps slug to docs path", () => {
    assert.equal(
      studioChartDocsHref("line-chart"),
      "/docs/components/line-chart"
    );
  });

  it("studioChartHref emits compressed s param", () => {
    const href = studioChartHref("line-chart");
    assert.ok(href.startsWith("/studio?s=v1."));
    assert.doesNotMatch(href, FLAT_CHART_PARAM_RE);
  });

  it("studioEmbedHref emits compressed s param under /studio/embed", () => {
    const state = defaultStudioState({ chart: "area-chart" });
    const href = studioEmbedHref(state);
    assert.ok(href.startsWith("/studio/embed?s=v1."));
    assert.doesNotMatch(href, FLAT_CHART_PARAM_RE);
  });

  it("studioShareStudioUrl builds an absolute studio link", () => {
    const state = defaultStudioState({ chart: "pie-chart" });
    const url = studioShareStudioUrl(state, "https://bklit.com");
    assert.ok(url.startsWith("https://bklit.com/studio?s=v1."));
  });

  it("studioEmbedIframeMarkup includes the embed src", () => {
    const state = defaultStudioState({ chart: "line-chart" });
    const markup = studioEmbedIframeMarkup(state, {
      origin: "https://bklit.com",
      height: 520,
    });
    assert.match(markup, IFRAME_TAG_RE);
    assert.match(markup, EMBED_SRC_RE);
    assert.match(markup, IFRAME_HEIGHT_RE);
  });
});
