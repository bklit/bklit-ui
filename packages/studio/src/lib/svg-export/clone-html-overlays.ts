import {
  buildForeignObjectBaseCss,
  createXhtmlElement,
  getStudioSansFontStack,
} from "./export-typography";
import {
  getNumberFlowDisplayText,
  isNumberFlowElement,
} from "./number-flow-export";

const TOOLTIP_CLASS_PATTERN = /chart-tooltip/;

const OVERLAY_STYLE_PROPS = [
  "color",
  "background-color",
  "font-size",
  "font-family",
  "font-weight",
  "font-style",
  "font-variant-numeric",
  "font-feature-settings",
  "font-kerning",
  "text-rendering",
  "-webkit-font-smoothing",
  "opacity",
  "transform",
  "display",
  "justify-content",
  "align-items",
  "flex-direction",
  "white-space",
  "text-align",
  "position",
  "left",
  "top",
  "right",
  "bottom",
  "width",
  "height",
  "padding",
  "padding-top",
  "padding-right",
  "padding-bottom",
  "padding-left",
  "margin",
  "margin-top",
  "margin-right",
  "margin-bottom",
  "margin-left",
  "grid-area",
  "line-height",
  "letter-spacing",
  "z-index",
  "pointer-events",
  "tab-size",
] as const;

function isTooltipElement(element: Element): boolean {
  if (!(element instanceof HTMLElement)) {
    return false;
  }
  const className = element.className;
  if (typeof className === "string" && TOOLTIP_CLASS_PATTERN.test(className)) {
    return true;
  }
  return Boolean(element.closest('[class*="chart-tooltip"]'));
}

function isTooltipCrosshairWrapper(element: HTMLElement): boolean {
  return (
    element.classList.contains("pointer-events-none") &&
    element.classList.contains("inset-0") &&
    element.querySelector(":scope > svg") !== null
  );
}

function isPositionedOverlay(element: HTMLElement): boolean {
  const computed = getComputedStyle(element).position;
  if (computed === "absolute" || computed === "fixed") {
    return true;
  }
  const inline = element.style.position;
  return inline === "absolute" || inline === "fixed";
}

function isChartCenterOverlay(element: HTMLElement): boolean {
  return (
    element.classList.contains("pointer-events-none") &&
    element.classList.contains("flex") &&
    element.classList.contains("items-center")
  );
}

function isAbsoluteChartOverlay(element: HTMLElement): boolean {
  return (
    isPositionedOverlay(element) &&
    element.classList.contains("absolute") &&
    !element.classList.contains("inset-0")
  );
}

function isHtmlOverlayRoot(element: HTMLElement, root: HTMLElement): boolean {
  if (element === root || root.contains(element) === false) {
    return false;
  }
  if (element.closest("svg")) {
    return false;
  }
  if (isTooltipElement(element)) {
    return false;
  }
  if (isTooltipCrosshairWrapper(element)) {
    return false;
  }

  // Pie / ring / gauge center stacks use CSS grid — not position:absolute.
  if (isChartCenterOverlay(element)) {
    return true;
  }

  // Funnel segment labels and axis tick labels use absolute positioning.
  if (isAbsoluteChartOverlay(element)) {
    return true;
  }

  if (
    element.classList.contains("pointer-events-none") &&
    (element.classList.contains("inset-0") ||
      element.classList.contains("absolute"))
  ) {
    return isPositionedOverlay(element);
  }

  return (
    isPositionedOverlay(element) &&
    element.classList.contains("absolute") &&
    element.classList.contains("pointer-events-none")
  );
}

/** Collect top-level HTML overlay roots (axes, center stats) inside the export frame. */
export function findHtmlOverlayRoots(root: HTMLElement): HTMLElement[] {
  const candidates = root.querySelectorAll("div");
  const roots: HTMLElement[] = [];
  const funnelLayer = findFunnelLabelLayer(root);

  for (const candidate of candidates) {
    if (!(candidate instanceof HTMLElement)) {
      continue;
    }
    if (funnelLayer?.contains(candidate) && candidate !== funnelLayer) {
      continue;
    }
    if (!isHtmlOverlayRoot(candidate, root)) {
      continue;
    }

    const dominatedByExisting = roots.some(
      (existing) => existing !== candidate && existing.contains(candidate)
    );
    if (dominatedByExisting) {
      continue;
    }

    for (let index = roots.length - 1; index >= 0; index -= 1) {
      const existing = roots[index];
      if (existing && candidate.contains(existing) && candidate !== existing) {
        roots.splice(index, 1);
      }
    }

    roots.push(candidate);
  }

  if (funnelLayer) {
    roots.push(funnelLayer);
  }

  return roots;
}

function findFunnelLabelLayer(root: HTMLElement): HTMLElement | null {
  for (const candidate of root.querySelectorAll("div.relative")) {
    if (!(candidate instanceof HTMLElement)) {
      continue;
    }

    const labels = candidate.querySelectorAll(
      ":scope > div.absolute.cursor-pointer"
    );
    if (labels.length >= 2) {
      return candidate;
    }
  }

  return null;
}

export function cloneFunnelLabelLayer(layer: HTMLElement): HTMLElement {
  const wrapper = createXhtmlElement("div");
  wrapper.setAttribute(
    "style",
    "position:relative;width:100%;height:100%;pointer-events:none"
  );

  for (const child of layer.children) {
    if (
      child instanceof HTMLElement &&
      child.classList.contains("absolute") &&
      child.classList.contains("cursor-pointer")
    ) {
      wrapper.appendChild(cloneHtmlOverlay(child));
    }
  }

  return wrapper;
}

export function isFunnelLabelLayer(element: HTMLElement): boolean {
  return element.querySelector(":scope > div.absolute.cursor-pointer") !== null;
}

function inlineComputedStyles(source: HTMLElement, target: HTMLElement): void {
  const computed = getComputedStyle(source);
  const parts: string[] = [];

  for (const prop of OVERLAY_STYLE_PROPS) {
    const value = computed.getPropertyValue(prop);
    if (value) {
      parts.push(`${prop}:${value}`);
    }
  }

  target.setAttribute("style", parts.join(";"));
}

function clonePlainElement(source: HTMLElement): HTMLElement {
  const clone = createXhtmlElement(
    source.tagName.toLowerCase() as keyof HTMLElementTagNameMap
  );
  inlineComputedStyles(source, clone);

  for (const child of source.childNodes) {
    if (child instanceof HTMLElement) {
      clone.appendChild(cloneHtmlOverlay(child));
    } else {
      clone.appendChild(child.cloneNode(true));
    }
  }

  return clone;
}

export function cloneHtmlOverlay(source: HTMLElement): HTMLElement {
  if (isNumberFlowElement(source)) {
    const span = createXhtmlElement("span");
    span.textContent = getNumberFlowDisplayText(source);
    const styleSource =
      source.parentElement instanceof HTMLElement
        ? source.parentElement
        : source;
    inlineComputedStyles(styleSource, span);
    return span;
  }

  return clonePlainElement(source);
}

export function createForeignObjectContent(
  root: HTMLElement,
  overlayClone: HTMLElement,
  embeddedFontCss = ""
): HTMLElement {
  const wrapper = createXhtmlElement("div");

  const style = createXhtmlElement("style");
  style.textContent = buildForeignObjectBaseCss(
    getStudioSansFontStack(root),
    embeddedFontCss
  );
  wrapper.appendChild(style);
  wrapper.appendChild(overlayClone);

  return wrapper;
}

export function getRelativeRect(
  element: HTMLElement,
  root: HTMLElement
): DOMRect {
  const elementRect = element.getBoundingClientRect();
  const rootRect = root.getBoundingClientRect();

  return new DOMRect(
    elementRect.left - rootRect.left,
    elementRect.top - rootRect.top,
    elementRect.width,
    elementRect.height
  );
}

function parseOverlayRect(
  overlay: HTMLElement,
  root: HTMLElement,
  frameWidth: number,
  frameHeight: number
): DOMRect | null {
  let rect = getRelativeRect(overlay, root);

  if (rect.width <= 0 || rect.height <= 0) {
    const inlineWidth = Number.parseFloat(overlay.style.width);
    const inlineHeight = Number.parseFloat(overlay.style.height);
    const inlineLeft = Number.parseFloat(overlay.style.left);
    const inlineTop = Number.parseFloat(overlay.style.top);

    if (inlineWidth > 0 && inlineHeight > 0) {
      rect = new DOMRect(
        Number.isFinite(inlineLeft) ? inlineLeft : rect.x,
        Number.isFinite(inlineTop) ? inlineTop : rect.y,
        inlineWidth,
        inlineHeight
      );
    }
  }

  if (
    (rect.width <= 0 || rect.height <= 0) &&
    (overlay.classList.contains("inset-0") ||
      (overlay.classList.contains("flex") &&
        overlay.classList.contains("items-center")))
  ) {
    return new DOMRect(0, 0, frameWidth, frameHeight);
  }

  if (rect.width <= 0 || rect.height <= 0) {
    return null;
  }

  return rect;
}

export { parseOverlayRect };
