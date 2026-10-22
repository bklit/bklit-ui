import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createElement, type FunctionComponent, lazy } from "react";
import {
  isPostOverlayComponent,
  resolveChartChildElement,
} from "../chart-child-passthrough";

const Markers: FunctionComponent & { __isChartMarkers?: boolean } = () => null;
Markers.__isChartMarkers = true;

describe("resolveChartChildElement", () => {
  it("unwraps resolved lazy types (RSC client references) so markers stay post-overlay", async () => {
    const LazyMarkers = lazy(() => Promise.resolve({ default: Markers }));
    const element = createElement(LazyMarkers, { key: "m" });
    assert.equal(isPostOverlayComponent(element), false);

    // Kick off and settle the lazy load the way React would.
    const lazyType = LazyMarkers as unknown as {
      _init: (payload: unknown) => unknown;
      _payload: unknown;
    };
    try {
      lazyType._init(lazyType._payload);
    } catch (thenable) {
      await thenable;
    }

    const resolved = resolveChartChildElement(element);
    assert.equal(resolved.type, Markers);
    assert.equal(resolved.key, "m");
    assert.equal(isPostOverlayComponent(resolved), true);
  });

  it("keeps a still-loading lazy element as is", () => {
    const LazyMarkers = lazy(
      () => new Promise<{ default: typeof Markers }>(() => undefined)
    );
    const element = createElement(LazyMarkers);
    assert.equal(resolveChartChildElement(element), element);
  });
});
