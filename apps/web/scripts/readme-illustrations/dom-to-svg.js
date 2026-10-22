/**
 * Browser-side DOM → standalone SVG serializer for the README chart
 * illustrations. Injected into the docs page by
 * `../generate-readme-illustrations.mjs` (see that file for usage).
 *
 * It only supports the small visual vocabulary the illustrations use
 * (apps/web/components/illustrations): boxes with solid / linear-gradient
 * backgrounds, uniform or single-side borders, per-corner border radii,
 * outer box-shadows, overflow clipping, opacity, ::before / ::after boxes and
 * inline <svg> drawings. Everything is resolved to plain SVG elements with
 * sRGB hex colours, so the output renders through GitHub's camo proxy as a
 * normal `<img>` (no scripts, no external resources, no foreignObject).
 *
 * Anything outside that vocabulary is reported in `warnings` so the
 * generator can fail loudly instead of silently drifting from the docs.
 */
// Classic script (injected once per page via addScriptTag), so top-level
// declarations are page globals.
const NUMBER = /-?[\d.]+(?:e-?\d+)?%?/gi;
const COLOR_TOKEN = /^([a-z-]+\([^)]*\)|#[\da-f]+|[a-z]+)\s*(.*)$/i;
const LINEAR_GRADIENT = /^linear-gradient\((.*)\)$/;
const GRADIENT_DIRECTION = /^(to |in |-?[\d.]+deg)/;
const GRADIENT_ANGLE = /(-?[\d.]+)deg/;
const WHITESPACE = /\s+/;
const CSS_URL = /url\("?([^")]+)"?\)/;
const SVG_NS = "http://www.w3.org/2000/svg";

const round = (n) => Math.round(n * 100) / 100;
const px = (value) => Number.parseFloat(value) || 0;
const isPositionedStyle = (cs) =>
  cs.position === "absolute" || cs.position === "fixed";

function srgbGamma(x) {
  const v = x <= 0.003_130_8 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055;
  return Math.min(1, Math.max(0, v));
}

function oklabToRgb(L, a, b) {
  const l = (L + 0.396_337_777_4 * a + 0.215_803_757_3 * b) ** 3;
  const m = (L - 0.105_561_345_8 * a - 0.063_854_172_8 * b) ** 3;
  const s = (L - 0.089_484_177_5 * a - 1.291_485_548 * b) ** 3;
  return [
    srgbGamma(4.076_741_662_1 * l - 3.307_711_591_3 * m + 0.230_969_929_2 * s),
    srgbGamma(-1.268_438_004_6 * l + 2.609_757_401_1 * m - 0.341_319_396_5 * s),
    srgbGamma(-0.004_196_086_3 * l - 0.703_418_614_7 * m + 1.707_614_701 * s),
  ];
}

const LAB_EPSILON = 216 / 24_389;
const LAB_KAPPA = 24_389 / 27;
const D50_WHITE = [0.3457 / 0.3585, 1, (1 - 0.3457 - 0.3585) / 0.3585];
/** Bradford D50 → D65 adaptation, then XYZ (D65) → linear sRGB. */
const D50_TO_LINEAR_SRGB = [
  [3.134_136, -1.617_386, -0.490_662],
  [-0.978_795, 1.916_254, 0.033_443],
  [0.071_955, -0.228_977, 1.405_386],
];

function labToRgb(L, a, b) {
  const fy = (L + 16) / 116;
  const fx = fy + a / 500;
  const fz = fy - b / 200;
  const xyz = [
    fx ** 3 > LAB_EPSILON ? fx ** 3 : (116 * fx - 16) / LAB_KAPPA,
    L > LAB_KAPPA * LAB_EPSILON ? fy ** 3 : L / LAB_KAPPA,
    fz ** 3 > LAB_EPSILON ? fz ** 3 : (116 * fz - 16) / LAB_KAPPA,
  ].map((v, i) => v * D50_WHITE[i]);
  return D50_TO_LINEAR_SRGB.map((row) =>
    srgbGamma(row[0] * xyz[0] + row[1] * xyz[1] + row[2] * xyz[2])
  );
}

function parseNumbers(str) {
  return (str.match(NUMBER) ?? []).map((token) =>
    token.endsWith("%")
      ? Number.parseFloat(token) / 100
      : Number.parseFloat(token)
  );
}

/** Colour-function channel parsers → sRGB channels in 0–1. */
const COLOR_FUNCTIONS = {
  rgb: (channels) => parseNumbers(channels).map((n) => n / 255),
  color: (channels) =>
    channels.trim().startsWith("srgb")
      ? parseNumbers(channels.trim().slice(4))
      : null,
  oklab: (channels) => oklabToRgb(...parseNumbers(channels)),
  lab: (channels) => labToRgb(...parseNumbers(channels)),
  oklch: (channels) => {
    const [L, C, H] = parseNumbers(channels);
    const h = (H * Math.PI) / 180;
    return oklabToRgb(L, C * Math.cos(h), C * Math.sin(h));
  },
};

/** Parse a computed CSS colour into `{ hex, alpha }` (sRGB). */
function parseColor(input) {
  const str = String(input).trim();
  if (str === "" || str === "none" || str === "transparent") {
    return { hex: "#000000", alpha: 0 };
  }
  const fn = str.slice(0, str.indexOf("(")).replace("rgba", "rgb");
  // Legacy rgb()/rgba() use commas; normalise to `r g b / a`.
  let body = str.slice(str.indexOf("(") + 1, str.lastIndexOf(")"));
  if (fn === "rgb" && body.includes(",")) {
    const [r, g, b, a] = body.split(",");
    body = a === undefined ? `${r} ${g} ${b}` : `${r} ${g} ${b} / ${a}`;
  }
  const [channels, alphaPart] = body.split("/");
  const rgb = COLOR_FUNCTIONS[fn]?.(channels)?.slice(0, 3);
  if (!rgb) {
    throw new Error(`Unsupported colour: ${str}`);
  }
  const alpha = alphaPart === undefined ? 1 : parseNumbers(alphaPart)[0];
  const hex = `#${rgb
    .map((c) =>
      Math.round(Math.min(1, Math.max(0, c)) * 255)
        .toString(16)
        .padStart(2, "0")
    )
    .join("")}`;
  return { hex, alpha: round(alpha * 1000) / 1000 };
}

/** Split on commas that are not nested inside parentheses. */
function splitTopLevel(str) {
  const parts = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (ch === "(") {
      depth++;
    } else if (ch === ")") {
      depth--;
    } else if (ch === "," && depth === 0) {
      parts.push(str.slice(start, i).trim());
      start = i + 1;
    }
  }
  parts.push(str.slice(start).trim());
  return parts.filter(Boolean);
}

/** Leading colour token (function or keyword) + the remainder. */
function takeColor(str) {
  const match = str.match(COLOR_TOKEN);
  return match ? [match[1], match[2]] : [str, ""];
}

function roundedRectPath(x, y, w, h, radii) {
  if (w <= 0 || h <= 0) {
    return "";
  }
  let [tl, tr, br, bl] = radii.map((r) => Math.max(0, r));
  const scale = Math.min(
    1,
    w / (tl + tr || 1),
    w / (bl + br || 1),
    h / (tl + bl || 1),
    h / (tr + br || 1)
  );
  [tl, tr, br, bl] = [tl, tr, br, bl].map((r) => r * scale);
  const arc = (r, ex, ey) =>
    r > 0 ? `A${round(r)} ${round(r)} 0 0 1 ${round(ex)} ${round(ey)}` : "";
  return [
    `M${round(x + tl)} ${round(y)}`,
    `H${round(x + w - tr)}`,
    arc(tr, x + w, y + tr),
    `V${round(y + h - br)}`,
    arc(br, x + w - br, y + h),
    `H${round(x + bl)}`,
    arc(bl, x, y + h - bl),
    `V${round(y + tl)}`,
    arc(tl, x + tl, y),
    "Z",
  ].join("");
}

function paintAttr(name, color, extraOpacity = 1) {
  const { hex, alpha } = parseColor(color);
  const opacity = round(alpha * extraOpacity * 1000) / 1000;
  return opacity >= 1
    ? ` ${name}="${hex}"`
    : ` ${name}="${hex}" ${name}-opacity="${opacity}"`;
}

function createSerializer(root, pad) {
  const origin = root.getBoundingClientRect();
  // Exact layout geometry. (Chromium pixel-snaps HTML boxes when painting,
  // so edges may anti-alias ~1 device px differently from the live page.)
  const ox = origin.left - pad;
  const oy = origin.top - pad;
  const boxOf = (rect) => ({
    x: rect.left - ox,
    y: rect.top - oy,
    w: rect.width,
    h: rect.height,
  });
  const defs = [];
  const warnings = [];
  let uid = 0;
  const nextId = (prefix) => `${prefix}${uid++}`;

  function radiiOf(cs) {
    return [
      cs.borderTopLeftRadius,
      cs.borderTopRightRadius,
      cs.borderBottomRightRadius,
      cs.borderBottomLeftRadius,
    ].map(px);
  }

  function bordersOf(cs) {
    return ["Top", "Right", "Bottom", "Left"].map((side) => ({
      color: cs[`border${side}Color`],
      style: cs[`border${side}Style`],
      width:
        cs[`border${side}Style`] === "none" ? 0 : px(cs[`border${side}Width`]),
    }));
  }

  function gradientFill(image, label) {
    const match = image.match(LINEAR_GRADIENT);
    if (!match) {
      warnings.push(`${label}: unsupported background-image ${image}`);
      return null;
    }
    const args = splitTopLevel(match[1]);
    let direction = "to bottom";
    if (GRADIENT_DIRECTION.test(args[0])) {
      direction = args.shift();
    }
    const vectors = {
      "to bottom": [0, 0, 0, 1],
      "to top": [0, 1, 0, 0],
      "to right": [0, 0, 1, 0],
      "to left": [1, 0, 0, 0],
    };
    const key = Object.keys(vectors).find((k) => direction.includes(k));
    const deg = direction.match(GRADIENT_ANGLE);
    let vector = vectors[key ?? "to bottom"];
    if (!key && deg) {
      const rad = (Number.parseFloat(deg[1]) * Math.PI) / 180;
      const dx = Math.sin(rad) / 2;
      const dy = -Math.cos(rad) / 2;
      vector = [0.5 - dx, 0.5 - dy, 0.5 + dx, 0.5 + dy];
    }
    const stops = args.map((arg, i) => {
      const [color, rest] = takeColor(arg);
      const offset = rest.endsWith("%")
        ? Number.parseFloat(rest) / 100
        : i / Math.max(1, args.length - 1);
      const { hex, alpha } = parseColor(color);
      return `<stop offset="${round(offset)}" stop-color="${hex}"${alpha < 1 ? ` stop-opacity="${alpha}"` : ""}/>`;
    });
    const id = nextId("g");
    const [x1, y1, x2, y2] = vector.map(round);
    defs.push(
      `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops.join("")}</linearGradient>`
    );
    return `url(#${id})`;
  }

  function shadowLayer(layer, box, radii, label) {
    const [color, rest] = takeColor(layer);
    const { hex, alpha } = parseColor(color);
    if (alpha === 0) {
      return "";
    }
    if (rest.includes("inset")) {
      warnings.push(`${label}: inset box-shadow is not supported`);
      return "";
    }
    const [dx = 0, dy = 0, blur = 0, spread = 0] = rest
      .split(WHITESPACE)
      .map(px);
    const shape = roundedRectPath(
      box.x + dx - spread,
      box.y + dy - spread,
      box.w + spread * 2,
      box.h + spread * 2,
      radii.map((r) => (r > 0 ? r + spread : r))
    );
    let filter = "";
    if (blur > 0) {
      const id = nextId("f");
      defs.push(
        `<filter id="${id}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${round(blur / 2)}"/></filter>`
      );
      filter = ` filter="url(#${id})"`;
    }
    return `<path d="${shape}" fill="${hex}" fill-opacity="${alpha}"${filter}/>`;
  }

  function shadowMarkup(cs, box, radii, label) {
    if (!cs.boxShadow || cs.boxShadow === "none") {
      return "";
    }
    const out = splitTopLevel(cs.boxShadow)
      .map((layer) => shadowLayer(layer, box, radii, label))
      .filter(Boolean);
    if (out.length === 0) {
      return "";
    }
    // CSS only paints outer shadows outside the border box.
    const maskId = nextId("m");
    defs.push(
      `<mask id="${maskId}" maskUnits="userSpaceOnUse" x="${round(box.x - 64)}" y="${round(box.y - 64)}" width="${round(box.w + 128)}" height="${round(box.h + 128)}"><rect x="${round(box.x - 64)}" y="${round(box.y - 64)}" width="${round(box.w + 128)}" height="${round(box.h + 128)}" fill="#fff"/><path d="${roundedRectPath(box.x, box.y, box.w, box.h, radii)}" fill="#000"/></mask>`
    );
    return `<g mask="url(#${maskId})">${out.join("")}</g>`;
  }

  function borderMarkup(borders, box, radii) {
    const [top, right, bottom, left] = borders;
    const uniform = borders.every(
      (b) => b.width === top.width && b.color === top.color && b.width > 0
    );
    if (uniform && top.style === "solid") {
      const w = top.width;
      const d = roundedRectPath(
        box.x + w / 2,
        box.y + w / 2,
        box.w - w,
        box.h - w,
        radii.map((r) => Math.max(0, r - w / 2))
      );
      return `<path d="${d}"${paintAttr("stroke", top.color)} stroke-width="${w}"/>`;
    }
    const strips = [
      [top, box.x, box.y, box.w, top.width],
      [right, box.x + box.w - right.width, box.y, right.width, box.h],
      [bottom, box.x, box.y + box.h - bottom.width, box.w, bottom.width],
      [left, box.x, box.y, left.width, box.h],
    ];
    return strips
      .filter(([b]) => b.width > 0 && parseColor(b.color).alpha > 0)
      .map(
        ([b, x, y, w, h]) =>
          `<rect x="${round(x)}" y="${round(y)}" width="${round(w)}" height="${round(h)}"${paintAttr("fill", b.color)}/>`
      )
      .join("");
  }

  /** Background, border and shadow for one CSS box (element or pseudo). */
  function boxMarkup(cs, box, label) {
    const radii = radiiOf(cs);
    const borders = bordersOf(cs);
    const parts = [shadowMarkup(cs, box, radii, label)];
    let bgBox = box;
    let bgRadii = radii;
    if (cs.backgroundClip === "padding-box") {
      const [t, r, b, l] = borders.map((x) => x.width);
      bgBox = {
        x: box.x + l,
        y: box.y + t,
        w: box.w - l - r,
        h: box.h - t - b,
      };
      bgRadii = radii.map((rad) => Math.max(0, rad - Math.max(t, r, b, l)));
    }
    const bgPath = roundedRectPath(bgBox.x, bgBox.y, bgBox.w, bgBox.h, bgRadii);
    if (parseColor(cs.backgroundColor).alpha > 0) {
      parts.push(
        `<path d="${bgPath}"${paintAttr("fill", cs.backgroundColor)}/>`
      );
    }
    if (cs.backgroundImage && cs.backgroundImage !== "none") {
      const fill = gradientFill(cs.backgroundImage, label);
      if (fill) {
        parts.push(`<path d="${bgPath}" fill="${fill}"/>`);
      }
    }
    parts.push(borderMarkup(borders, box, radii));
    return parts.join("");
  }

  function checkUnsupported(cs, label) {
    if (cs.transform && cs.transform !== "none") {
      warnings.push(`${label}: transform ${cs.transform}`);
    }
    if (cs.filter && cs.filter !== "none") {
      warnings.push(`${label}: filter ${cs.filter}`);
    }
    if (cs.clipPath && cs.clipPath !== "none") {
      warnings.push(`${label}: clip-path ${cs.clipPath}`);
    }
    if (cs.maskImage && cs.maskImage !== "none") {
      warnings.push(`${label}: mask ${cs.maskImage}`);
    }
  }

  function pseudoMarkup(el, which, rect) {
    const cs = getComputedStyle(el, which);
    if (cs.content === "none" || cs.display === "none") {
      return { markup: "", isPositioned: false };
    }
    const label = `${el.tagName.toLowerCase()}${which}`;
    checkUnsupported(cs, label);
    const parent = getComputedStyle(el);
    const padX = rect.left + px(parent.borderLeftWidth) - ox;
    const padY = rect.top + px(parent.borderTopWidth) - oy;
    const box = {
      x: padX + px(cs.left),
      y: padY + px(cs.top),
      w: px(cs.width),
      h: px(cs.height),
    };
    const isPositioned = isPositionedStyle(cs);
    if (!isPositioned) {
      warnings.push(
        `${label}: in-flow pseudo-element positioned approximately`
      );
    }
    return {
      markup: cs.visibility === "hidden" ? "" : boxMarkup(cs, box, label),
      isPositioned,
    };
  }

  /** Inherited SVG presentation props → initial value (omitted when unchanged). */
  const SVG_INHERITED_PROPS = {
    "stroke-width": "1px",
    "stroke-dasharray": "none",
    "stroke-dashoffset": "0px",
    "stroke-linecap": "butt",
    "stroke-linejoin": "miter",
    "stroke-miterlimit": "4",
    "fill-rule": "nonzero",
    "clip-rule": "nonzero",
  };
  const SVG_STRIP_ATTRS = ["class", "style", "aria-hidden", "focusable"];

  function inlineStop(cs, target) {
    const { hex, alpha } = parseColor(cs.stopColor);
    target.setAttribute("stop-color", hex);
    target.removeAttribute("stop-opacity");
    const opacity = round(alpha * Number(cs.stopOpacity) * 1000) / 1000;
    if (opacity < 1) {
      target.setAttribute("stop-opacity", String(opacity));
    }
  }

  /** `fill` / `stroke` with currentColor and colour alpha resolved. */
  function inlinePaint(cs, target, prop) {
    const value = cs.getPropertyValue(prop);
    const own = Number(cs.getPropertyValue(`${prop}-opacity`));
    target.removeAttribute(`${prop}-opacity`);
    let opacity = own;
    if (value === "none") {
      target.setAttribute(prop, "none");
      return;
    }
    if (value.startsWith("url(")) {
      target.setAttribute(prop, value.replace(CSS_URL, "url($1)"));
    } else {
      const { hex, alpha } = parseColor(value);
      target.setAttribute(prop, hex);
      opacity = round(alpha * own * 1000) / 1000;
    }
    if (opacity < 1) {
      target.setAttribute(`${prop}-opacity`, String(opacity));
    }
  }

  function inlineInherited(cs, target, parentCs) {
    for (const [prop, initial] of Object.entries(SVG_INHERITED_PROPS)) {
      const value = cs.getPropertyValue(prop);
      const inherited = parentCs ? parentCs.getPropertyValue(prop) : initial;
      target.removeAttribute(prop);
      if (value && value !== inherited) {
        target.setAttribute(
          prop,
          value.replaceAll("px", "").replaceAll(",", "")
        );
      }
    }
    target.removeAttribute("opacity");
    if (Number(cs.opacity) < 1) {
      target.setAttribute("opacity", cs.opacity);
    }
  }

  function inlineSvgStyles(source, target, parentCs = null) {
    const cs = getComputedStyle(source);
    for (const attr of SVG_STRIP_ATTRS) {
      target.removeAttribute(attr);
    }
    if (cs.display === "none") {
      target.setAttribute("display", "none");
      return;
    }
    if (source.tagName.toLowerCase() === "stop") {
      inlineStop(cs, target);
    } else if (!(source instanceof SVGGradientElement)) {
      inlinePaint(cs, target, "fill");
      inlinePaint(cs, target, "stroke");
      inlineInherited(cs, target, parentCs);
    }
    const targetChildren = [...target.children];
    [...source.children].forEach((child, i) => {
      inlineSvgStyles(child, targetChildren[i], cs);
    });
  }

  function svgMarkup(svg) {
    const rect = svg.getBoundingClientRect();
    const clone = svg.cloneNode(true);
    inlineSvgStyles(svg, clone);
    clone.removeAttribute("xmlns");
    const box = boxOf(rect);
    clone.setAttribute("x", String(round(box.x)));
    clone.setAttribute("y", String(round(box.y)));
    clone.setAttribute("width", String(round(box.w)));
    clone.setAttribute("height", String(round(box.h)));
    clone.setAttribute(
      "overflow",
      getComputedStyle(svg).overflow === "visible" ? "visible" : "hidden"
    );
    clone.removeAttribute("opacity");
    const opacity = Number(getComputedStyle(svg).opacity);
    const markup = new XMLSerializer()
      .serializeToString(clone)
      .replaceAll(` xmlns="${SVG_NS}"`, "");
    return opacity < 1 ? `<g opacity="${opacity}">${markup}</g>` : markup;
  }

  /** Rough CSS paint order: in-flow pseudo/children, then positioned. */
  function childrenMarkup(el, rect, label) {
    const inFlow = [];
    const positioned = [];
    const add = ({ markup, isPositioned }) =>
      (isPositioned ? positioned : inFlow).push(markup);
    add(pseudoMarkup(el, "::before", rect));
    for (const child of el.children) {
      add({
        markup: elementMarkup(child),
        isPositioned: isPositionedStyle(getComputedStyle(child)),
      });
    }
    add(pseudoMarkup(el, "::after", rect));
    const hasText = [...el.childNodes].some(
      (node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim()
    );
    if (hasText) {
      warnings.push(`${label}: text content is not supported`);
    }
    return [...inFlow, ...positioned].join("");
  }

  /** Wrap children in a padding-box clip when the element clips overflow. */
  function clipChildren(cs, box, inner) {
    const clips = cs.overflowX !== "visible" || cs.overflowY !== "visible";
    if (!(clips && inner)) {
      return inner;
    }
    const [t, r, b, l] = bordersOf(cs).map((x) => x.width);
    const id = nextId("c");
    const d = roundedRectPath(
      box.x + l,
      box.y + t,
      box.w - l - r,
      box.h - t - b,
      radiiOf(cs).map((rad) => Math.max(0, rad - Math.max(t, r, b, l)))
    );
    defs.push(`<clipPath id="${id}"><path d="${d}"/></clipPath>`);
    return `<g clip-path="url(#${id})">${inner}</g>`;
  }

  function elementMarkup(el) {
    if (el instanceof SVGSVGElement) {
      return svgMarkup(el);
    }
    const cs = getComputedStyle(el);
    if (cs.display === "none") {
      return "";
    }
    const label = `${el.tagName.toLowerCase()}.${String(el.className).split(" ").slice(0, 3).join(".")}`;
    checkUnsupported(cs, label);
    const rect = el.getBoundingClientRect();
    const box = boxOf(rect);

    const own = cs.visibility === "hidden" ? "" : boxMarkup(cs, box, label);
    const inner = clipChildren(cs, box, childrenMarkup(el, rect, label));
    const markup = own + inner;
    const opacity = Number(cs.opacity);
    return opacity < 1 && markup
      ? `<g opacity="${opacity}">${markup}</g>`
      : markup;
  }

  return {
    serialize() {
      const body = elementMarkup(root);
      const width = round(origin.width + pad * 2);
      const height = round(origin.height + pad * 2);
      const svg = `<svg xmlns="${SVG_NS}" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none">${defs.length ? `<defs>${defs.join("")}</defs>` : ""}${body}</svg>`;
      return { svg, warnings, width, height };
    },
  };
}

window.__bklitDomToSvg = (root, pad = 0) =>
  createSerializer(root, pad).serialize();
