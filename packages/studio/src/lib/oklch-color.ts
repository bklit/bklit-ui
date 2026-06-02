/**
 * OKLab / OKLCh conversion utilities (Björn Ottosson matrices).
 * Adapted from https://github.com/sen-ltd/color-picker-pro — zero runtime deps.
 */

export interface Oklch {
  l: number;
  c: number;
  h: number;
}

export interface Oklab {
  l: number;
  a: number;
  b: number;
}

export interface SrgbBytes {
  r: number;
  g: number;
  b: number;
}

const LMS_TO_OKLAB = [
  [0.210_454_255_3, 0.793_617_785, -0.004_072_046_8],
  [1.977_998_495_1, -2.428_592_205, 0.450_593_709_9],
  [0.025_904_037_1, 0.782_771_766_2, -0.808_675_766],
] as const;

const OKLAB_TO_LMS_ROOT = [
  [1, 0.396_337_777_4, 0.215_803_757_3],
  [1, -0.105_561_345_8, -0.063_854_172_8],
  [1, -0.089_484_177_5, -1.291_485_548],
] as const;

const LINEAR_RGB_TO_LMS = [
  [0.412_221_470_8, 0.536_332_536_3, 0.051_445_992_9],
  [0.211_903_498_2, 0.680_699_545_1, 0.107_396_956_6],
  [0.088_302_461_9, 0.281_718_837_6, 0.629_978_700_5],
] as const;

const LMS_TO_LINEAR_RGB = [
  [4.076_741_662_1, -3.307_711_591_3, 0.230_969_929_2],
  [-1.268_438_004_6, 2.609_757_401_1, -0.341_319_396_5],
  [-0.004_196_086_3, -0.703_418_614_7, 1.707_614_701],
] as const;

type Mat3 = readonly [
  readonly [number, number, number],
  readonly [number, number, number],
  readonly [number, number, number],
];

function mat3(
  m: Mat3,
  a: number,
  b: number,
  c: number
): [number, number, number] {
  return [
    m[0][0] * a + m[0][1] * b + m[0][2] * c,
    m[1][0] * a + m[1][1] * b + m[1][2] * c,
    m[2][0] * a + m[2][1] * b + m[2][2] * c,
  ];
}

export function srgbChannelToLinear(channel: number): number {
  const normalized = channel / 255;
  return normalized <= 0.040_45
    ? normalized / 12.92
    : ((normalized + 0.055) / 1.055) ** 2.4;
}

export function linearToSrgbChannel(linear: number): number {
  const encoded =
    linear <= 0.003_130_8
      ? 12.92 * linear
      : 1.055 * linear ** (1 / 2.4) - 0.055;
  return Math.round(Math.min(255, Math.max(0, encoded * 255)));
}

export function srgbBytesToOklab(r: number, g: number, b: number): Oklab {
  const red = srgbChannelToLinear(r);
  const green = srgbChannelToLinear(g);
  const blue = srgbChannelToLinear(b);

  const [lmsL, lmsM, lmsS] = mat3(LINEAR_RGB_TO_LMS, red, green, blue);
  const [lRoot, mRoot, sRoot] = [
    Math.cbrt(lmsL),
    Math.cbrt(lmsM),
    Math.cbrt(lmsS),
  ];

  const [l, a, bLab] = mat3(LMS_TO_OKLAB, lRoot, mRoot, sRoot);
  return { l, a, b: bLab };
}

export function oklabToSrgbBytes(l: number, a: number, b: number): SrgbBytes {
  const [lRoot, mRoot, sRoot] = mat3(OKLAB_TO_LMS_ROOT, l, a, b);
  const [rLin, gLin, bLin] = mat3(
    LMS_TO_LINEAR_RGB,
    lRoot ** 3,
    mRoot ** 3,
    sRoot ** 3
  );

  return {
    r: linearToSrgbChannel(rLin),
    g: linearToSrgbChannel(gLin),
    b: linearToSrgbChannel(bLin),
  };
}

export function oklabToOklch(l: number, a: number, b: number): Oklch {
  const c = Math.sqrt(a * a + b * b);
  let h = (Math.atan2(b, a) * 180) / Math.PI;
  if (h < 0) {
    h += 360;
  }
  return { l, c, h };
}

export function oklchToOklab(l: number, c: number, h: number): Oklab {
  const hueRad = (h * Math.PI) / 180;
  return {
    l,
    a: c * Math.cos(hueRad),
    b: c * Math.sin(hueRad),
  };
}

export function srgbBytesToOklch(r: number, g: number, b: number): Oklch {
  const lab = srgbBytesToOklab(r, g, b);
  return oklabToOklch(lab.l, lab.a, lab.b);
}

export function oklchToSrgbBytes(l: number, c: number, h: number): SrgbBytes {
  const lab = oklchToOklab(l, c, h);
  return oklabToSrgbBytes(lab.l, lab.a, lab.b);
}

export function formatOklchComponent(value: number): string {
  return Number(value.toFixed(3)).toString();
}

export function formatOklchBody(oklch: Oklch): string {
  return `${formatOklchComponent(oklch.l)} ${formatOklchComponent(oklch.c)} ${formatOklchComponent(oklch.h)}`;
}

export function srgbBytesToOklchBody(r: number, g: number, b: number): string {
  return formatOklchBody(srgbBytesToOklch(r, g, b));
}

const OKLCH_BODY_RE = /^([\d.]+)\s+([\d.]+)\s+([\d.]+)/;

export function parseOklchBody(body: string): Oklch | null {
  const match = body.trim().match(OKLCH_BODY_RE);
  if (!(match?.[1] && match[2] && match[3])) {
    return null;
  }
  const l = Number.parseFloat(match[1]);
  const c = Number.parseFloat(match[2]);
  const h = Number.parseFloat(match[3]);
  if (![l, c, h].every(Number.isFinite)) {
    return null;
  }
  return { l, c, h: ((h % 360) + 360) % 360 };
}

export function isValidOklchBody(body: string): boolean {
  return parseOklchBody(body) !== null;
}

export function srgbBytesToHex(r: number, g: number, b: number): string {
  return [r, g, b]
    .map((n) =>
      Math.min(255, Math.max(0, Math.round(n)))
        .toString(16)
        .padStart(2, "0")
    )
    .join("")
    .toUpperCase();
}

export function oklchBodyToHex(body: string): string | null {
  const oklch = parseOklchBody(body);
  if (!oklch) {
    return null;
  }
  const rgb = oklchToSrgbBytes(oklch.l, oklch.c, oklch.h);
  return srgbBytesToHex(rgb.r, rgb.g, rgb.b);
}

export function formatStudioOklch(body: string, alpha = 1): string | null {
  if (!isValidOklchBody(body)) {
    return null;
  }
  const trimmed = body.trim();
  return alpha >= 0.999 ? `oklch(${trimmed})` : `oklch(${trimmed} / ${alpha})`;
}
