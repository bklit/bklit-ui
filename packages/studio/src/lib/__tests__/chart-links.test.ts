import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  BKLIT_REGISTRY_NAMESPACE,
  REGISTRY_ORIGIN,
  registryJsonUrlForName,
  shadcnAddItem,
  studioChartDocsHref,
  studioOpenInV0Href,
  studioRegistryJsonUrl,
} from "../chart-links";

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
      "https://ui.bklit.com/r/area-chart-example.json"
    );
  });

  it("studioChartDocsHref maps slug to docs path", () => {
    assert.equal(
      studioChartDocsHref("line-chart"),
      "/docs/components/line-chart"
    );
  });
});
