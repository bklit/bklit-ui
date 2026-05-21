import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { JSDOM } from "jsdom";
import { buildFrameSvg } from "../svg-export/build-frame-svg";

const SVG_ROOT_RE = /^<svg[^>]*xmlns="http:\/\/www\.w3\.org\/2000\/svg"/;
const CHART_FILL_RE = /fill="oklch\(0\.5 0\.1 200\)"/;
const GEIST_FONT_FAMILY_RE = /font-family="Geist/;
const FOREIGN_OBJECT_RE = /<foreignObject/;
const FONT_FACE_RE = /@font-face/;
const JAN_LABEL_RE = /Jan/;
const NUMBER_FLOW_VALUE_RE = /11,050/;
const CHANNELS_LABEL_RE = /Channels/;
const NUMBER_FLOW_TAG_RE = /number-flow-react/;
const ROOT_TYPOGRAPHY_RE =
  /<style>[^<]*@font-face[^<]*text,tspan\{font-family:Geist/;
const FUNNEL_VISITORS_RE = /12,500/;
const FUNNEL_VISITORS_LABEL_RE = /Visitors/;
const FUNNEL_LEADS_RE = /8,200/;
const FUNNEL_LEADS_LABEL_RE = /Leads/;
const SANKEY_GRADIENT_STROKE_RE = /stroke="url\(#link-gradient-0\)"/;
const SANKEY_STOP_ONE_RE = /stop-color="oklch\(0\.72 0\.15 200\)"/;
const SANKEY_STOP_TWO_RE = /stop-color="oklch\(0\.62 0\.12 220\)"/;
const STROKE_DASHOFFSET_RE = /stroke-dashoffset/;
const STROKE_DASHARRAY_RE = /stroke-dasharray/;
const SANKEY_TEXT_FILL_RE = /fill="rgb\(240, 240, 240\)"/;
const DIRECT_LABEL_RE = /Direct/;
const RADAR_SPEED_LABEL_RE = /Speed/;
const RADAR_LABEL_FILL_RE = /fill="oklch\(0\.65 0\.01 260\)"/;
const RADAR_LABEL_TRANSFORM_RE = /transform="translate\(120px, 40px\)"/;
const AREA_GRADIENT_STOP_COLOR_RE = /stop-color="oklch\(0\.65 0\.15 200\)"/;
const AREA_GRADIENT_STOP_OPACITY_RE = /stop-opacity="0\.4"/;
const AREA_GRADIENT_INLINE_STYLE_RE = /style="stop-color:/;
const EXPORTED_CHART_THEME_VARS_RE = /--chart-1:oklch\(0\.84 0\.18 128\)/;
const EXPORTED_CHART_FILL_RE = /fill="oklch\(0\.84 0\.18 128\)"/;

function mountDom(html: string) {
  const dom = new JSDOM(html, { pretendToBeVisual: true });
  const { window } = dom;
  globalThis.document = window.document;
  globalThis.window = window as unknown as Window & typeof globalThis;
  globalThis.HTMLElement = window.HTMLElement;
  globalThis.Element = window.Element;
  globalThis.XMLSerializer = window.XMLSerializer;
  globalThis.NodeFilter = window.NodeFilter;
  globalThis.getComputedStyle = window.getComputedStyle.bind(window);
  globalThis.DOMRect = window.DOMRect;
  globalThis.CSSFontFaceRule = window.CSSFontFaceRule;

  const style = window.document.createElement("style");
  style.textContent =
    '@font-face{font-family:"Geist";src:local("Geist")} html{font-family:Geist,sans-serif}';
  window.document.head.appendChild(style);

  return window;
}

function unmountDom() {
  (globalThis as { HTMLElement?: typeof HTMLElement }).HTMLElement = undefined;
  (globalThis as { Element?: typeof Element }).Element = undefined;
  (globalThis as { document?: Document }).document = undefined;
  (globalThis as { window?: Window }).window = undefined;
  (globalThis as { XMLSerializer?: typeof XMLSerializer }).XMLSerializer =
    undefined;
  (globalThis as { NodeFilter?: typeof NodeFilter }).NodeFilter = undefined;
  (
    globalThis as { getComputedStyle?: typeof getComputedStyle }
  ).getComputedStyle = undefined;
  (globalThis as { DOMRect?: typeof DOMRect }).DOMRect = undefined;
  (globalThis as { CSSFontFaceRule?: typeof CSSFontFaceRule }).CSSFontFaceRule =
    undefined;
}

describe("build-frame-svg", () => {
  it("builds a frame composite with inlined fills and foreignObject overlays", () => {
    const window = mountDom(
      `<div id="root" style="width:720px;height:400px;background-color:rgb(255,255,255);--chart-1:oklch(0.5 0.1 200);position:relative">
        <svg width="200" height="100" style="position:absolute;left:40px;top:30px">
          <rect width="200" height="100" fill="var(--chart-1)" />
          <text x="10" y="20">Revenue</text>
        </svg>
        <div class="pointer-events-none absolute inset-0" style="position:absolute;inset:0">
          <span class="text-chart-label" style="position:absolute;left:10px;top:10px;color:rgb(30,30,30);font-size:12px">Jan</span>
        </div>
      </div>`
    );

    const root = window.document.getElementById("root") as HTMLElement;
    const svg = buildFrameSvg({
      root,
      width: 720,
      height: 400,
      embeddedFontCss: '@font-face{font-family:"Geist";src:local("Geist")}',
    });

    assert.match(svg, SVG_ROOT_RE);
    assert.match(svg, CHART_FILL_RE);
    assert.match(svg, GEIST_FONT_FAMILY_RE);
    assert.match(svg, FOREIGN_OBJECT_RE);
    assert.match(svg, FONT_FACE_RE);
    assert.match(svg, JAN_LABEL_RE);

    unmountDom();
  });

  it("replaces NumberFlow custom elements with formatted text", () => {
    const window =
      mountDom(`<div id="root" style="width:400px;height:400px;position:relative">
      <div class="pointer-events-none flex items-center justify-center" style="display:flex;grid-area:1 / 1;width:400px;height:400px">
        <div class="flex flex-col items-center justify-center text-center">
          <span class="text-2xl font-bold" style="font-size:24px;font-weight:700">
            <number-flow-react></number-flow-react>
          </span>
          <span class="text-chart-label text-xs" style="font-size:12px">Channels</span>
        </div>
      </div>
    </div>`);

    const nf = window.document.querySelector(
      "number-flow-react"
    ) as HTMLElement & {
      _data?: { valueAsString: string };
    };
    nf._data = { valueAsString: "11,050" };

    const root = window.document.getElementById("root") as HTMLElement;
    const svg = buildFrameSvg({ root, width: 400, height: 400 });

    assert.match(svg, NUMBER_FLOW_VALUE_RE);
    assert.match(svg, CHANNELS_LABEL_RE);
    assert.doesNotMatch(svg, NUMBER_FLOW_TAG_RE);

    unmountDom();
  });

  it("embeds document typography at the svg root for native text nodes", () => {
    const window = mountDom(
      `<div id="root" style="width:400px;height:400px;background-color:rgb(0,0,0)">
        <svg width="400" height="400">
          <text x="10" y="20">Speed</text>
        </svg>
      </div>`
    );

    const root = window.document.getElementById("root") as HTMLElement;
    const svg = buildFrameSvg({
      root,
      width: 400,
      height: 400,
      embeddedFontCss: '@font-face{font-family:"Geist";src:local("Geist")}',
    });

    assert.match(svg, ROOT_TYPOGRAPHY_RE);
    assert.match(svg, GEIST_FONT_FAMILY_RE);

    unmountDom();
  });

  it("exports funnel segment labels from absolute positioned overlays", () => {
    const window = mountDom(
      `<div id="root" style="width:720px;height:400px;position:relative">
        <div class="relative" style="position:relative;width:720px;height:400px">
          <div class="absolute cursor-pointer" style="position:absolute;left:0;top:0;width:240px;height:400px">
            <div class="absolute inset-0 flex flex-col items-center" style="position:absolute;inset:0;display:flex">
              <span style="font-size:14px;font-weight:600;color:rgb(255,255,255)">12,500</span>
              <span style="font-size:12px;color:rgb(180,180,180)">Visitors</span>
            </div>
          </div>
          <div class="absolute cursor-pointer" style="position:absolute;left:244px;top:0;width:240px;height:400px">
            <div class="absolute inset-0 flex flex-col items-center" style="position:absolute;inset:0;display:flex">
              <span style="font-size:14px;font-weight:600;color:rgb(255,255,255)">8,200</span>
              <span style="font-size:12px;color:rgb(180,180,180)">Leads</span>
            </div>
          </div>
        </div>
      </div>`
    );

    const root = window.document.getElementById("root") as HTMLElement;
    const svg = buildFrameSvg({ root, width: 720, height: 400 });

    assert.match(svg, FUNNEL_VISITORS_RE);
    assert.match(svg, FUNNEL_VISITORS_LABEL_RE);
    assert.match(svg, FUNNEL_LEADS_RE);
    assert.match(svg, FUNNEL_LEADS_LABEL_RE);

    unmountDom();
  });

  it("preserves gradient-linked sankey paths without animated dash offsets", () => {
    const window = mountDom(
      `<div id="root" style="width:720px;height:400px;--chart-1:oklch(0.72 0.15 200);--chart-2:oklch(0.62 0.12 220);">
        <svg width="720" height="400">
          <defs>
            <linearGradient id="link-gradient-0" x1="0" x2="100" y1="0" y2="0">
              <stop offset="0%" stop-color="var(--chart-1)" />
              <stop offset="100%" stop-color="var(--chart-2)" />
            </linearGradient>
          </defs>
          <path d="M0,50 C120,50 120,150 240,150" fill="none" opacity="0.5" stroke="url(#link-gradient-0)" stroke-dasharray="400 400" stroke-dashoffset="400" stroke-width="24" />
        </svg>
      </div>`
    );

    const root = window.document.getElementById("root") as HTMLElement;
    const svg = buildFrameSvg({ root, width: 720, height: 400 });

    assert.match(svg, SANKEY_GRADIENT_STROKE_RE);
    assert.match(svg, SANKEY_STOP_ONE_RE);
    assert.match(svg, SANKEY_STOP_TWO_RE);
    assert.doesNotMatch(svg, STROKE_DASHOFFSET_RE);
    assert.doesNotMatch(svg, STROKE_DASHARRAY_RE);

    unmountDom();
  });

  it("inlines computed text fills from class-based styles", () => {
    const window = mountDom(
      `<style>.fill-foreground { fill: rgb(240, 240, 240); }</style>
      <div id="root" style="width:400px;height:400px">
        <svg width="400" height="400">
          <text class="fill-foreground" x="20" y="30">Direct</text>
        </svg>
      </div>`
    );

    const root = window.document.getElementById("root") as HTMLElement;
    const svg = buildFrameSvg({ root, width: 400, height: 400 });

    assert.match(svg, SANKEY_TEXT_FILL_RE);
    assert.match(svg, DIRECT_LABEL_RE);

    unmountDom();
  });

  it("embeds frame chart palette vars for self-contained exports", () => {
    const window = mountDom(
      `<div id="root" style="width:720px;height:400px;--chart-1:oklch(0.84 0.18 128);--chart-line-primary:var(--chart-1);">
        <svg width="720" height="400">
          <rect width="100" height="100" fill="var(--chart-1)" />
        </svg>
      </div>`
    );

    const root = window.document.getElementById("root") as HTMLElement;
    const svg = buildFrameSvg({ root, width: 720, height: 400 });

    assert.match(svg, EXPORTED_CHART_THEME_VARS_RE);
    assert.match(svg, EXPORTED_CHART_FILL_RE);

    unmountDom();
  });

  it("inlines area gradient stop colors from inline styles", () => {
    const window = mountDom(
      `<div id="root" style="width:720px;height:400px;--chart-line-primary:oklch(0.65 0.15 200);">
        <svg width="720" height="400">
          <defs>
            <linearGradient id="area-gradient-desktop-abc" x1="0%" x2="0%" y1="0%" y2="100%">
              <stop offset="0%" style="stop-color: var(--chart-line-primary); stop-opacity: 0.4" />
              <stop offset="100%" style="stop-color: var(--chart-line-primary); stop-opacity: 0" />
            </linearGradient>
          </defs>
          <path d="M0,100 L200,50 L400,80 L400,400 L0,400 Z" fill="url(#area-gradient-desktop-abc)" />
        </svg>
      </div>`
    );

    const root = window.document.getElementById("root") as HTMLElement;
    const svg = buildFrameSvg({ root, width: 720, height: 400 });

    assert.match(svg, AREA_GRADIENT_STOP_COLOR_RE);
    assert.match(svg, AREA_GRADIENT_STOP_OPACITY_RE);
    assert.doesNotMatch(svg, AREA_GRADIENT_INLINE_STYLE_RE);

    unmountDom();
  });

  it("preserves radar label fills and transforms from the live DOM", () => {
    const window = mountDom(
      `<div id="root" style="width:400px;height:400px">
        <svg width="400" height="400">
          <g style="transform: translate(120px, 40px)">
            <text style="fill: var(--chart-label, oklch(0.65 0.01 260))" x="0" y="0">Speed</text>
          </g>
        </svg>
      </div>`
    );

    const root = window.document.getElementById("root") as HTMLElement;
    const svg = buildFrameSvg({ root, width: 400, height: 400 });

    assert.match(svg, RADAR_SPEED_LABEL_RE);
    assert.match(svg, RADAR_LABEL_FILL_RE);
    assert.match(svg, RADAR_LABEL_TRANSFORM_RE);

    unmountDom();
  });
});
