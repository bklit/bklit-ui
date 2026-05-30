import { containsCssVar, resolveCssVar } from "./resolve-css-var";

const SVG_NS = "http://www.w3.org/2000/svg";
const FILL_STYLE_RE = /fill:\s*([^;]+)/;
const STOP_COLOR_STYLE_RE = /stop-color:\s*([^;]+)/i;
const STOP_OPACITY_STYLE_RE = /stop-opacity:\s*([^;]+)/i;

const PRESENTATION_ATTRIBUTES = [
  "fill",
  "stroke",
  "stroke-width",
  "stroke-opacity",
  "fill-opacity",
  "opacity",
  "stop-color",
  "stop-opacity",
] as const;

function isSvgElement(element: Element): boolean {
  return element.namespaceURI === SVG_NS;
}

function resolvePresentationAttribute(
  element: Element,
  styleSource: Element,
  attribute: string
): string | null {
  const value =
    element.getAttribute(attribute) ??
    element.getAttribute(
      attribute.replace(/-([a-z])/g, (_, char: string) => char.toUpperCase())
    );

  if (!value) {
    return null;
  }

  return containsCssVar(value) ? resolveCssVar(styleSource, value) : value;
}

function setResolvedAttribute(
  clone: Element,
  attribute: string,
  value: string | null
): void {
  if (value !== null && value !== "") {
    clone.setAttribute(attribute, value);
  }
}

function stripAnimatedPathStyles(clone: Element): void {
  clone.removeAttribute("stroke-dasharray");
  clone.removeAttribute("stroke-dashoffset");

  const style = clone.getAttribute("style");
  if (!style) {
    return;
  }

  const nextStyle = style
    .split(";")
    .filter((part) => {
      const trimmed = part.trim().toLowerCase();
      return (
        trimmed &&
        !trimmed.startsWith("stroke-dashoffset") &&
        !trimmed.startsWith("stroke-dasharray") &&
        !trimmed.startsWith("cursor")
      );
    })
    .join(";");

  if (nextStyle) {
    clone.setAttribute("style", nextStyle);
  } else {
    clone.removeAttribute("style");
  }
}

function resolveStopPresentation(
  source: Element,
  styleSource: Element,
  property: "stop-color" | "stop-opacity"
): string | null {
  const fromAttribute = resolvePresentationAttribute(
    source,
    styleSource,
    property
  );
  if (fromAttribute !== null && fromAttribute !== "") {
    return fromAttribute;
  }

  const computed = getComputedStyle(source);
  const computedValue =
    property === "stop-color" ? computed.stopColor : computed.stopOpacity;

  if (
    computedValue &&
    computedValue !== "" &&
    computedValue !== "initial" &&
    !containsCssVar(computedValue)
  ) {
    return computedValue;
  }

  const styleValue = source.getAttribute("style");
  if (!styleValue) {
    return null;
  }

  const match = (
    property === "stop-color" ? STOP_COLOR_STYLE_RE : STOP_OPACITY_STYLE_RE
  ).exec(styleValue);
  if (!match?.[1]) {
    return null;
  }

  const raw = match[1].trim();
  return containsCssVar(raw) ? resolveCssVar(styleSource, raw) : raw;
}

function applyStopPresentation(
  source: Element,
  clone: Element,
  styleSource: Element
): void {
  setResolvedAttribute(
    clone,
    "stop-color",
    resolveStopPresentation(source, styleSource, "stop-color")
  );
  setResolvedAttribute(
    clone,
    "stop-opacity",
    resolveStopPresentation(source, styleSource, "stop-opacity")
  );
  clone.removeAttribute("style");
}

function applyTextPresentation(
  source: Element,
  clone: Element,
  styleSource: Element
): void {
  const computed = getComputedStyle(source);
  const fill = computed.fill;

  if (fill && fill !== "none" && !containsCssVar(fill)) {
    clone.setAttribute("fill", fill);
  } else {
    const styleValue = source.getAttribute("style");
    if (styleValue?.includes("fill")) {
      const fillMatch = FILL_STYLE_RE.exec(styleValue);
      if (fillMatch?.[1]) {
        clone.setAttribute(
          "fill",
          resolveCssVar(styleSource, fillMatch[1].trim())
        );
      }
    }
  }

  if (computed.fontSize) {
    clone.setAttribute("font-size", computed.fontSize);
  }
  if (computed.fontWeight) {
    clone.setAttribute("font-weight", computed.fontWeight);
  }
}

function applyPathPresentation(
  source: Element,
  clone: Element,
  styleSource: Element
): void {
  for (const attribute of PRESENTATION_ATTRIBUTES) {
    setResolvedAttribute(
      clone,
      attribute,
      resolvePresentationAttribute(source, styleSource, attribute)
    );
  }

  if (!source.getAttribute("opacity")) {
    const opacity = getComputedStyle(source).opacity;
    if (opacity && opacity !== "1") {
      clone.setAttribute("opacity", opacity);
    }
  }

  stripAnimatedPathStyles(clone);
}

function applyGroupPresentation(source: Element, clone: Element): void {
  const transform = getComputedStyle(source).transform;
  if (transform && transform !== "none") {
    clone.setAttribute("transform", transform);
  }
}

function applyDefaultPresentation(
  source: Element,
  clone: Element,
  styleSource: Element
): void {
  for (const attribute of ["fill", "stroke"] as const) {
    setResolvedAttribute(
      clone,
      attribute,
      resolvePresentationAttribute(source, styleSource, attribute)
    );
  }

  for (const attribute of [
    "stroke-width",
    "stroke-opacity",
    "fill-opacity",
    "opacity",
  ] as const) {
    const value = resolvePresentationAttribute(source, styleSource, attribute);
    if (value !== null && value !== "") {
      clone.setAttribute(attribute, value);
    }
  }
}

function applyComputedPresentation(
  source: Element,
  clone: Element,
  styleSource: Element
): void {
  if (!(isSvgElement(source) && isSvgElement(clone))) {
    return;
  }

  const tag = source.tagName.toLowerCase();

  if (tag === "stop") {
    applyStopPresentation(source, clone, styleSource);
    return;
  }

  if (tag === "text" || tag === "tspan") {
    applyTextPresentation(source, clone, styleSource);
    return;
  }

  if (tag === "path") {
    applyPathPresentation(source, clone, styleSource);
    return;
  }

  if (tag === "g") {
    applyGroupPresentation(source, clone);
  }

  applyDefaultPresentation(source, clone, styleSource);

  const styleValue = clone.getAttribute("style");
  if (styleValue && containsCssVar(styleValue)) {
    const resolved = styleValue.replace(
      /var\([^)]*(?:\([^)]*\)[^)]*)*\)/g,
      (match) => resolveCssVar(styleSource, match)
    );
    clone.setAttribute("style", resolved);
  }
}

function walkElementsInSync(
  source: Element,
  clone: Element,
  visit: (sourceElement: Element, cloneElement: Element) => void
): void {
  visit(source, clone);

  const sourceChildren = [...source.children];
  const cloneChildren = [...clone.children];
  for (let index = 0; index < sourceChildren.length; index += 1) {
    const sourceChild = sourceChildren[index];
    const cloneChild = cloneChildren[index];
    if (sourceChild && cloneChild) {
      walkElementsInSync(sourceChild, cloneChild, visit);
    }
  }
}

/**
 * Clone SVG geometry with resolved colors and motion presentation from the live DOM.
 * Computed styles must be read from `sourceSvg` (still connected), not the clone.
 */
export function inlineSvgStyles(
  sourceSvg: Element,
  cloneSvg: Element,
  _exportRoot: Element
): void {
  walkElementsInSync(sourceSvg, cloneSvg, (source, clone) => {
    applyComputedPresentation(source, clone, source);
  });
}
