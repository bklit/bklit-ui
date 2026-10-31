import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { LinearGradient } from "../gradients";

/** Rendered inside an `<svg>` (SVG element casing), like in a chart. */
const html = (props: object) =>
  renderToStaticMarkup(
    createElement("svg", null, createElement(LinearGradient, props as never))
  );

describe("LinearGradient", () => {
  it("defaults: vertical two-stop gradient", () => {
    assert.equal(
      html({ id: "v", from: "red", to: "blue" }),
      '<svg><defs><linearGradient id="v" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0%" stop-color="red" stop-opacity="1"></stop>' +
        '<stop offset="100%" stop-color="blue" stop-opacity="1"></stop>' +
        "</linearGradient></defs></svg>"
    );
  });
});
