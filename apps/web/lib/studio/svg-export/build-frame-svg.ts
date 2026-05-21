import { CHART_CSS_VAR_NAMES } from "./chart-css-var-names";
import { CHART_PALETTE_DERIVED_VARS } from "./chart-var-aliases";
import {
  cloneFunnelLabelLayer,
  cloneHtmlOverlay,
  createForeignObjectContent,
  findHtmlOverlayRoots,
  isFunnelLabelLayer,
  parseOverlayRect,
} from "./clone-html-overlays";
import {
  applySvgTextTypography,
  buildSvgDocumentTypographyCss,
  getStudioSansFontStack,
} from "./export-typography";
import { inlineSvgStyles } from "./inline-svg-styles";

const SVG_NS = "http://www.w3.org/2000/svg";

export interface BuildFrameSvgOptions {
  root: HTMLElement;
  width: number;
  height: number;
  embeddedFontCss?: string;
}

function createSvgElement<K extends keyof SVGElementTagNameMap>(
  tag: K
): SVGElementTagNameMap[K] {
  return document.createElementNS(SVG_NS, tag);
}

function appendDocumentTypography(
  svg: SVGSVGElement,
  fontFamily: string,
  embeddedFontCss = ""
): void {
  const style = createSvgElement("style");
  style.textContent = buildSvgDocumentTypographyCss(
    fontFamily,
    embeddedFontCss
  );
  svg.insertBefore(style, svg.firstChild);
}

/** Embed palette + semantic chart vars from the Studio frame for self-contained SVGs. */
function appendChartThemeVars(svg: SVGSVGElement, root: HTMLElement): void {
  const rootStyle = getComputedStyle(root);
  const declarations = new Map<string, string>();

  for (let index = 1; index <= 5; index += 1) {
    const name = `--chart-${index}`;
    const value =
      root.style.getPropertyValue(name) || rootStyle.getPropertyValue(name);
    if (value) {
      declarations.set(name, value.trim());
    }
  }

  for (const [name, fallback] of Object.entries(CHART_PALETTE_DERIVED_VARS)) {
    const value =
      root.style.getPropertyValue(name) ||
      rootStyle.getPropertyValue(name) ||
      fallback;
    if (value) {
      declarations.set(name, value.trim());
    }
  }

  for (const name of CHART_CSS_VAR_NAMES) {
    if (declarations.has(name)) {
      continue;
    }
    const value =
      root.style.getPropertyValue(name) || rootStyle.getPropertyValue(name);
    if (value) {
      declarations.set(name, value.trim());
    }
  }

  if (declarations.size === 0) {
    return;
  }

  const style = createSvgElement("style");
  style.textContent = `:root,svg{${[...declarations.entries()]
    .map(([name, value]) => `${name}:${value}`)
    .join(";")}}`;
  svg.insertBefore(style, svg.firstChild);
}

/** Build a frame-composite SVG document string from the live Studio chart frame. */
export function buildFrameSvg({
  root,
  width,
  height,
  embeddedFontCss = "",
}: BuildFrameSvgOptions): string {
  const fontFamily = getStudioSansFontStack(root);
  const svg = createSvgElement("svg");
  appendDocumentTypography(svg, fontFamily, embeddedFontCss);
  appendChartThemeVars(svg, root);
  svg.setAttribute("width", String(width));
  svg.setAttribute("height", String(height));
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);

  const background = createSvgElement("rect");
  background.setAttribute("width", String(width));
  background.setAttribute("height", String(height));
  background.setAttribute("fill", getComputedStyle(root).backgroundColor);
  svg.appendChild(background);

  const rootRect = root.getBoundingClientRect();

  for (const sourceSvg of root.querySelectorAll("svg")) {
    if (sourceSvg.namespaceURI !== SVG_NS) {
      continue;
    }
    if (sourceSvg.closest('[class*="chart-tooltip"]')) {
      continue;
    }

    const sourceRect = sourceSvg.getBoundingClientRect();
    const group = createSvgElement("g");
    group.setAttribute(
      "transform",
      `translate(${sourceRect.left - rootRect.left},${sourceRect.top - rootRect.top})`
    );

    const clone = sourceSvg.cloneNode(true) as Element;
    inlineSvgStyles(sourceSvg, clone, root);
    applySvgTextTypography(clone, fontFamily);
    clone.setAttribute("width", String(sourceRect.width));
    clone.setAttribute("height", String(sourceRect.height));

    while (clone.firstChild) {
      group.appendChild(clone.firstChild);
    }

    svg.appendChild(group);
  }

  for (const overlay of findHtmlOverlayRoots(root)) {
    const rect = parseOverlayRect(overlay, root, width, height);
    if (!rect) {
      continue;
    }

    const foreignObject = createSvgElement("foreignObject");
    foreignObject.setAttribute("x", String(rect.x));
    foreignObject.setAttribute("y", String(rect.y));
    foreignObject.setAttribute("width", String(rect.width));
    foreignObject.setAttribute("height", String(rect.height));

    const wrapper = createForeignObjectContent(
      root,
      isFunnelLabelLayer(overlay)
        ? cloneFunnelLabelLayer(overlay)
        : cloneHtmlOverlay(overlay),
      embeddedFontCss
    );
    foreignObject.appendChild(wrapper);
    svg.appendChild(foreignObject);
  }

  return new XMLSerializer().serializeToString(svg);
}
