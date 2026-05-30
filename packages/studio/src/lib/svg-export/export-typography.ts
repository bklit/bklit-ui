export const XHTML_NS = "http://www.w3.org/1999/xhtml";

export function createXhtmlElement<K extends keyof HTMLElementTagNameMap>(
  tag: K
): HTMLElementTagNameMap[K] {
  return document.createElementNS(XHTML_NS, tag) as HTMLElementTagNameMap[K];
}

/** Typography helpers for SVG export — fonts do not inherit into foreignObject. */

export function getStudioSansFontStack(_reference: Element): string {
  return getComputedStyle(document.documentElement).fontFamily;
}

interface FontFaceRuleRecord {
  cssText: string;
}

/** Collect @font-face rules from the active document. */
export function collectFontFaceRules(): FontFaceRuleRecord[] {
  const rules: FontFaceRuleRecord[] = [];

  for (const sheet of document.styleSheets) {
    try {
      for (const rule of sheet.cssRules) {
        if (rule instanceof CSSFontFaceRule) {
          rules.push({ cssText: rule.cssText });
        }
      }
    } catch {
      // Skip cross-origin stylesheets.
    }
  }

  return rules;
}

function resolveFontUrl(url: string): string {
  try {
    return new URL(url, document.baseURI).href;
  } catch {
    return url;
  }
}

/** Inline font files as data URIs so exported SVGs render offline. */
export async function embedFontFaceCss(): Promise<string> {
  const embedded: string[] = [];

  for (const { cssText } of collectFontFaceRules()) {
    const urls = [...cssText.matchAll(/url\(["']?([^"')]+)["']?\)/g)].map(
      (match) => match[1]
    );

    if (urls.length === 0) {
      embedded.push(cssText);
      continue;
    }

    let nextCss = cssText;
    for (const rawUrl of urls) {
      if (!rawUrl || rawUrl.startsWith("data:")) {
        continue;
      }

      try {
        const response = await fetch(resolveFontUrl(rawUrl));
        if (!response.ok) {
          continue;
        }
        const blob = await response.blob();
        const dataUri = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(blob);
        });
        nextCss = nextCss.split(rawUrl).join(dataUri);
      } catch {
        // Keep the original URL if embedding fails.
      }
    }

    embedded.push(nextCss);
  }

  return embedded.join("\n");
}

export function buildForeignObjectBaseCss(
  fontFamily: string,
  fontFaces = ""
): string {
  return [
    fontFaces,
    `:root,body,div,span{font-family:${fontFamily};-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility;}`,
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildSvgDocumentTypographyCss(
  fontFamily: string,
  fontFaces = ""
): string {
  return [
    fontFaces,
    `svg{font-family:${fontFamily};}`,
    `text,tspan{font-family:${fontFamily};font-synthesis:none;}`,
  ]
    .filter(Boolean)
    .join("\n");
}

const SVG_TEXT_TAGS = new Set(["text", "tspan"]);

/** Standalone SVG defaults `<text>` to serif — apply the app sans stack. */
export function applySvgTextTypography(
  svgRoot: Element,
  fontFamily: string
): void {
  const walker = document.createTreeWalker(svgRoot, NodeFilter.SHOW_ELEMENT);

  let node = walker.currentNode as Element | null;
  while (node) {
    const tag = node.tagName.toLowerCase();
    if (SVG_TEXT_TAGS.has(tag)) {
      node.setAttribute("font-family", fontFamily);

      const style = node.getAttribute("style");
      const withoutFontFamily = style
        ?.split(";")
        .filter((part) => !part.trim().startsWith("font-family"))
        .join(";");
      const nextStyle = withoutFontFamily
        ? `${withoutFontFamily};font-family:${fontFamily}`
        : `font-family:${fontFamily}`;
      node.setAttribute("style", nextStyle);
    }
    node = walker.nextNode() as Element | null;
  }
}
