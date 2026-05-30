import { downloadBlob } from "../download-blob";
import { buildFrameSvg } from "./build-frame-svg";
import { embedFontFaceCss } from "./export-typography";

export interface ExportStudioChartSvgOptions {
  /** Frame inner element (preset-scoped, `data-studio-export-root`). */
  root: HTMLElement;
  width: number;
  height: number;
  filename: string;
}

/**
 * Serialize the Studio chart frame to a self-contained SVG and trigger download.
 * Inlines CSS variables and embeds webfont data so exported typography matches Studio.
 *
 * Note: HTML overlays are embedded via `<foreignObject>`; some SVG viewers
 * (Figma, Illustrator) may not render them.
 */
export async function exportStudioChartSvg({
  root,
  width,
  height,
  filename,
}: ExportStudioChartSvgOptions): Promise<void> {
  const embeddedFontCss = await embedFontFaceCss();
  const svgString = buildFrameSvg({
    root,
    width,
    height,
    embeddedFontCss,
  });
  const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  downloadBlob(blob, filename);
}
