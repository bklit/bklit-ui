// visx -> bklit migration parity test for the `@visx/gradient` re-exports.
// Delete together with the @visx/gradient dependency once the migration is done.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  GradientDarkgreenGreen as VisxGradientDarkgreenGreen,
  GradientLightgreenGreen as VisxGradientLightgreenGreen,
  GradientOrangeRed as VisxGradientOrangeRed,
  GradientPinkBlue as VisxGradientPinkBlue,
  GradientPinkRed as VisxGradientPinkRed,
  GradientPurpleOrange as VisxGradientPurpleOrange,
  GradientPurpleTeal as VisxGradientPurpleTeal,
  GradientSteelPurple as VisxGradientSteelPurple,
  GradientTealBlue as VisxGradientTealBlue,
  LinearGradient as VisxLinearGradient,
  RadialGradient as VisxRadialGradient,
} from "@visx/gradient";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  GradientDarkgreenGreen,
  GradientLightgreenGreen,
  GradientOrangeRed,
  GradientPinkBlue,
  GradientPinkRed,
  GradientPurpleOrange,
  GradientPurpleTeal,
  GradientSteelPurple,
  GradientTealBlue,
  LinearGradient,
  RadialGradient,
} from "../gradients";

/** [name, ours, visx] for every former `@visx/gradient` re-export. */
const EXPORTS: [string, unknown, unknown][] = [
  ["LinearGradient", LinearGradient, VisxLinearGradient],
  ["RadialGradient", RadialGradient, VisxRadialGradient],
  [
    "GradientDarkgreenGreen",
    GradientDarkgreenGreen,
    VisxGradientDarkgreenGreen,
  ],
  [
    "GradientLightgreenGreen",
    GradientLightgreenGreen,
    VisxGradientLightgreenGreen,
  ],
  ["GradientOrangeRed", GradientOrangeRed, VisxGradientOrangeRed],
  ["GradientPinkBlue", GradientPinkBlue, VisxGradientPinkBlue],
  ["GradientPinkRed", GradientPinkRed, VisxGradientPinkRed],
  ["GradientPurpleOrange", GradientPurpleOrange, VisxGradientPurpleOrange],
  ["GradientPurpleTeal", GradientPurpleTeal, VisxGradientPurpleTeal],
  ["GradientSteelPurple", GradientSteelPurple, VisxGradientSteelPurple],
  ["GradientTealBlue", GradientTealBlue, VisxGradientTealBlue],
];

const PROPS: Record<string, unknown>[] = [
  { id: "a" },
  { id: "b", from: "var(--chart-1)", to: "red", toOpacity: 0.12 },
  {
    id: "c",
    from: "#000",
    fromOffset: "10%",
    fromOpacity: "0.5",
    to: "#fff",
    toOffset: 0.9,
    toOpacity: 0,
  },
  { id: "d", vertical: false, rotate: 45, transform: "scale(2)" },
  { id: "e", transform: "rotate(90)", gradientUnits: "userSpaceOnUse" },
  // A falsy-but-set coordinate (0) still counts as "no coordinates".
  { id: "f", x1: 0, x2: "100%", y1: "0%", y2: 0 },
  { id: "g", x1: 0 },
  { id: "h", cx: "50%", cy: "40%", r: "60%", fx: "30%", fy: "30%" },
  { id: "i", spreadMethod: "reflect", className: "custom" },
];

const STOP_CHILDREN = [
  createElement("stop", { key: "1", offset: "0%", stopColor: "red" }),
  createElement("stop", { key: "2", offset: "50%", stopColor: "blue" }),
];

/** Rendered inside an `<svg>` (SVG element casing), like in a chart. */
const html = (type: unknown, props: object, children: unknown[] = []) =>
  renderToStaticMarkup(
    createElement(
      "svg",
      null,
      createElement(type as "g", props as never, ...(children as []))
    )
  );

describe("gradients match @visx/gradient", () => {
  for (const [name, ours, visx] of EXPORTS) {
    it(name, () => {
      for (const { vertical, ...radialProps } of PROPS) {
        // `vertical` is LinearGradient-only (visx forwards it to the DOM).
        const props =
          name === "RadialGradient"
            ? radialProps
            : { vertical, ...radialProps };
        assert.equal(
          html(ours, props),
          html(visx, props),
          `${name} ${JSON.stringify(props)}`
        );
      }
      const withChildren = { id: "kids", from: "red", to: "blue" };
      assert.equal(
        html(ours, withChildren, STOP_CHILDREN),
        html(visx, withChildren, STOP_CHILDREN)
      );
    });
  }

  it("defaults: vertical two-stop gradient", () => {
    assert.equal(
      html(LinearGradient, { id: "v", from: "red", to: "blue" }),
      '<svg><defs><linearGradient id="v" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0%" stop-color="red" stop-opacity="1"></stop>' +
        '<stop offset="100%" stop-color="blue" stop-opacity="1"></stop>' +
        "</linearGradient></defs></svg>"
    );
  });
});
