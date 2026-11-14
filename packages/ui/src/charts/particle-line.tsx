"use client";

import { type CurveFactory, curveMonotoneX } from "d3-shape";
import { animate, m, useMotionValue } from "motion/react";
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import {
  selectIsChartHovering,
  useChartHoverSelector,
  useChartPortalContainer,
  useChartStable,
  useYScale,
} from "./chart-context";
import { HighlightSegment } from "./highlight-segment";
import { linePathD } from "./line-path";
import { SeriesHoverDim } from "./series-hover-dim";
import { useHighlightSegment } from "./use-highlight-segment";

/** Molten gold — the classic After Effects logo-reveal look. */
export const PARTICLE_LINE_GOLD = [
  "#c8891a",
  "#ffd45e",
  "#f2a91f",
  "#ffe9a3",
] as const;

/**
 * - `assemble` — a swarm swirls in and condenses onto the line.
 * - `comet` — the head streams a long, slow tail of embers behind it.
 * - `stardust` — the head leaves twinkling dust that drifts upward and lingers.
 */
export type ParticleLineEffect = "assemble" | "comet" | "stardust";

export interface ParticleLineProps {
  /** Key in data to use for y values. */
  dataKey: string;
  /** Y-scale group id. Default: `"left"`. */
  yAxisId?: string | number;
  /** Curve function. Default: curveMonotoneX */
  curve?: CurveFactory;
  /** Series colour for the tooltip / legend. */
  stroke?: string;
  /** Line width in px. Default: 2.5 */
  strokeWidth?: number;
  /** Four hex colours cycled along the line and its particles. Default: gold. */
  colors?: readonly string[];
  /** Reveal style. Default: `"assemble"` */
  effect?: ParticleLineEffect;
  /** Time for the reveal front to cross the line, in ms. Default: the chart's `animationDuration` (1100). */
  duration?: number;
  /** Wait before the reveal starts, in ms. Default: 0 */
  delay?: number;
  /**
   * Cubic-bezier for the reveal front. Default: the chart's enter easing —
   * `cubic-bezier(0.85, 0, 0.15, 1)` unless the chart overrides it.
   */
  easing?: readonly [number, number, number, number];
  /** Particles per px of line length. Default: 7 */
  density?: number;
  /** `assemble`: how far particles start from where they land. Other effects: spark speed multiplier × 150. Default: 150 */
  spread?: number;
  /** Length of the bright freshly-drawn section behind the front, in px. Default: 90 */
  trail?: number;
  /**
   * Hover segment, like `<Line highlight>`: the stretch around the cursor stays
   * full strength with soft ends, the rest dims and the glow fades out.
   * `false` disables it. Default: `{ span: 3, fadeLength: 40, dimOpacity: 0.25 }`
   */
  highlight?: false | ParticleLineHighlight;
}

export interface ParticleLineHighlight {
  /** Data points either side of the hovered point the segment covers. Default: 3 */
  span?: number;
  /** Fade the segment's ends over this % (0–50) of its width per side. Default: 40 */
  fadeLength?: number;
  /** Opacity the rest of the line dims to while hovering. Default: 0.25 */
  dimOpacity?: number;
}

interface EffectPreset {
  /** 0 = converge onto the line, 1 = emit from the head. */
  mode: 0 | 1;
  /** Particle life in s (assemble: linger after landing). */
  life: [number, number];
  /** Emit speed in px/s at `spread = 150`. */
  speed: [number, number];
  /** 0 = sprays in every direction, 1 = streams straight back along the line. */
  backward: number;
  /** px/s², positive falls. */
  gravity: number;
  drag: number;
  size: [number, number];
  twinkle: number;
  /** How fast a particle cools from white-hot (1/s). */
  cooling: number;
  /** Head flare diameter in px; 0 hides it. */
  flare: number;
  /** Brightness of the freshly-drawn trail on the line. */
  heatGain: number;
}

const EFFECTS: Record<ParticleLineEffect, EffectPreset> = {
  assemble: {
    mode: 0,
    life: [0.1, 0.7],
    speed: [0, 0],
    backward: 0,
    gravity: 0,
    drag: 0,
    size: [1.2, 3.6],
    twinkle: 0.45,
    cooling: 0,
    flare: 0,
    heatGain: 1,
  },
  comet: {
    mode: 1,
    life: [0.8, 1.9],
    speed: [50, 190],
    backward: 0.93,
    gravity: -12,
    drag: 0.9,
    size: [1.6, 5.2],
    twinkle: 0.3,
    cooling: 2.4,
    flare: 38,
    heatGain: 2.1,
  },
  stardust: {
    mode: 1,
    life: [1, 2.4],
    speed: [8, 45],
    backward: 0.25,
    gravity: -30,
    drag: 0.9,
    size: [1, 3.4],
    twinkle: 1,
    cooling: 1.3,
    flare: 22,
    heatGain: 1.3,
  },
};

/** Resting glow: a stroke this many times the line width, blurred, at this opacity. */
const GLOW_WIDTH_SCALE = 1.5;
const GLOW_BLUR = 3.5;
const GLOW_OPACITY = 0.6;
/** Ribbon half-width must hold the blurred glow (stroke/2 + ~3σ). */
const RIBBON_PAD = 12;

const MAX_PARTICLES = 14_000;
const MAX_DPR = 2;
/** Bright drawn trail and head flare fade out over this long after the front finishes (s). */
const HEAT_FADE_S = 0.9;
/** Particle buffer layout: target xy, s, tangent xy, rand × 4, when (0–1 of the reveal). */
const PARTICLE_STRIDE = 10;
const RIBBON_STRIDE = 5;

/* -------------------------------------------------------------------------- */
/* Shaders                                                                    */
/* -------------------------------------------------------------------------- */

const PALETTE_GLSL = `
uniform vec3 u_hot;
uniform vec3 u_c0;
uniform vec3 u_c1;
uniform vec3 u_c2;
uniform vec3 u_c3;
vec3 palette(float t) {
  t = clamp(t, 0.0, 1.0) * 3.0;
  vec3 c = mix(u_c0, u_c1, clamp(t, 0.0, 1.0));
  c = mix(c, u_c2, clamp(t - 1.0, 0.0, 1.0));
  return mix(c, u_c3, clamp(t - 2.0, 0.0, 1.0));
}`;

const HOT = "u_hot";
/** White-hot reads on dark surfaces; on light ones it vanishes, so burn deep instead. */
const HOT_ON_DARK: [number, number, number] = [1, 0.97, 0.88];

/** The line itself: a ribbon that is only lit behind the reveal front. */
const RIBBON_VS = `
attribute vec2 a_pos;
attribute float a_s;
attribute float a_side;
attribute float a_cx;
uniform vec2 u_res;
varying float v_s;
varying float v_side;
varying float v_cx;
void main() {
  v_s = a_s;
  v_side = a_side;
  // The fragment's own x — SVG gradients and the hover mask key off pixel x.
  v_cx = a_pos.x;
  vec2 clip = (a_pos / u_res) * 2.0 - 1.0;
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
}`;

/**
 * One stroke pass into an offscreen texture, drawn on a narrow ribbon with
 * MAX blending so overlapping triangles on tight bends can't double-paint.
 * Used twice: the line itself (radius = strokeWidth / 2, with reveal heat)
 * and the glow source (radius = glow width / 2, no heat).
 */
const STROKE_FS = `
precision highp float;
varying float v_s;
varying float v_side;
varying float v_cx;
uniform float u_front;
uniform float u_total;
uniform float u_trail;
uniform float u_heat;
uniform float u_heatMix;
uniform float u_radius;
uniform float u_halfW;
uniform float u_dpr;
uniform float u_xStart;
uniform float u_xSpan;
${PALETTE_GLSL}
void main() {
  // Distance to the drawn centreline segment [0, end] — round caps at both
  // ends and at the moving tip fall out of the same measure.
  float end = min(u_front, u_total);
  float across = abs(v_side) * u_halfW;
  float along = v_s < 0.0 ? -v_s : max(v_s - end, 0.0);
  float dist = length(vec2(along, across));
  // Same coverage ramp as a rasterised SVG stroke: 1 device px wide.
  float cov = clamp((u_radius - dist) * u_dpr + 0.5, 0.0, 1.0);

  // Reveal-only: white-hot trail and metallic sheen, zero once cooled.
  float heat = exp(-max(end - v_s, 0.0) / u_trail) * u_heat * u_heatMix;
  float h = clamp(heat, 0.0, 1.0);
  float sheen = mix(1.0, 0.85 + 0.25 * (-v_side), h);
  float t = clamp((v_cx - u_xStart) / u_xSpan, 0.0, 1.0);
  vec3 col = mix(palette(t), ${HOT}, h * 0.75) * sheen;
  gl_FragColor = vec4(col * cov, cov);
}`;

/** Reveal-only additive bloom around the freshly drawn stretch (wide ribbon). */
const BLOOM_FS = `
precision highp float;
varying float v_s;
varying float v_side;
uniform float u_front;
uniform float u_total;
uniform float u_trail;
uniform float u_heat;
uniform float u_halfW;
${PALETTE_GLSL}
void main() {
  float end = min(u_front, u_total);
  float across = abs(v_side) * u_halfW;
  float along = v_s < 0.0 ? -v_s : max(v_s - end, 0.0);
  float dist = length(vec2(along, across));
  float heat = exp(-max(end - v_s, 0.0) / u_trail) * u_heat;
  float b = exp(-(dist * dist) / (u_halfW * u_halfW * 0.06)) * heat;
  gl_FragColor = vec4(${HOT} * b, b);
}`;

/** Full-canvas quad for the blur and composite passes. */
const QUAD_VS = `
attribute vec2 a_pos;
varying vec2 v_uv;
void main() {
  v_uv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`;

/** One direction of a separable Gaussian — what feGaussianBlur computes. */
const BLUR_FS = `
precision highp float;
varying vec2 v_uv;
uniform sampler2D u_tex;
uniform vec2 u_step;
uniform float u_sigma;
void main() {
  float reach = ceil(u_sigma * 3.0);
  vec4 sum = vec4(0.0);
  float total = 0.0;
  for (int i = -48; i <= 48; i++) {
    float fi = float(i);
    if (abs(fi) > reach) {
      continue;
    }
    float w = exp(-0.5 * fi * fi / (u_sigma * u_sigma));
    sum += texture2D(u_tex, v_uv + u_step * fi) * w;
    total += w;
  }
  gl_FragColor = sum / total;
}`;

/**
 * Stroke over glow, then hover — the same stack the SVG hand-off draws:
 * SeriesHoverDim(opacity) > [glow path, stroke path] + HighlightSegment.
 */
const COMPOSITE_FS = `
precision highp float;
varying vec2 v_uv;
uniform sampler2D u_core;
uniform sampler2D u_glow;
uniform vec2 u_res;
uniform float u_glowOpacity;
uniform float u_hover;
uniform vec2 u_seg;
uniform float u_segFade;
uniform float u_dim;
void main() {
  vec4 core = texture2D(u_core, v_uv);
  vec4 glow = texture2D(u_glow, v_uv) * u_glowOpacity * (1.0 - u_hover);
  vec4 line = core + glow * (1.0 - core.a);
  float x = v_uv.x * u_res.x;
  float inSegment =
    clamp((x - u_seg.x) / u_segFade, 0.0, 1.0) *
    clamp((u_seg.y - x) / u_segFade, 0.0, 1.0);
  gl_FragColor = line * mix(1.0, mix(u_dim, 1.0, inSegment), u_hover);
}`;

/**
 * Stateless particles: each knows its spot on the line (`a_target`) and when
 * the front passes it (`a_s`), so position is a pure function of time.
 * Mode 0 flies in and lands there; mode 1 is born there and flies off.
 */
const PARTICLE_VS = `
attribute vec2 a_target;
attribute float a_s;
attribute vec2 a_tan;
attribute vec4 a_rand;
attribute float a_when;
uniform vec2 u_res;
uniform float u_time;
uniform float u_delay;
uniform float u_duration;
uniform float u_spread;
uniform float u_dpr;
uniform float u_mode;
uniform vec2 u_life;
uniform vec2 u_speed;
uniform vec2 u_size;
uniform float u_backward;
uniform float u_gravity;
uniform float u_drag;
uniform float u_twinkle;
uniform float u_cooling;
varying float v_alpha;
varying float v_heat;
varying float v_s;

vec2 rotate(vec2 v, float a) {
  float c = cos(a);
  float s = sin(a);
  return vec2(c * v.x - s * v.y, s * v.x + c * v.y);
}

void hide() {
  gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
  gl_PointSize = 0.0;
}

void main() {
  float pass = u_delay + a_when * u_duration;
  float t = u_time - pass;
  float life = mix(u_life.x, u_life.y, a_rand.y);
  float twinkle = 1.0 - u_twinkle * (0.5 + 0.5 * sin(u_time * 18.0 + a_rand.w * 60.0));
  vec2 pos;

  if (u_mode < 0.5) {
    // Assemble: fly in from up-right, swirl, land, glow briefly.
    float flight = mix(0.55, 1.5, a_rand.x);
    if (t < -flight || t > life) { hide(); return; }
    float k = clamp((t + flight) / flight, 0.0, 1.0);
    float e = 1.0 - pow(1.0 - k, 3.0);
    vec2 offset = vec2(
      mix(0.15, 1.0, a_rand.z) * u_spread,
      -mix(-0.35, 1.0, a_rand.w) * u_spread * 0.85
    );
    offset = rotate(offset, (1.0 - e) * mix(-2.2, 2.2, a_rand.x));
    pos = a_target + offset * (1.0 - e);
    pos += vec2(
      sin(u_time * 3.1 + a_rand.y * 40.0),
      cos(u_time * 2.6 + a_rand.z * 40.0)
    ) * 7.0 * (1.0 - e);
    float landed = step(0.0, t);
    float afterglow = 1.0 - clamp(t / life, 0.0, 1.0);
    v_alpha = smoothstep(0.0, 0.3, k) * mix(1.0, afterglow, landed) * twinkle;
    v_heat = mix(e * e, afterglow, landed);
  } else {
    // Emit: born at the head, thrown off, cooling as it trails away.
    if (t < 0.0 || t > life) { hide(); return; }
    float angle = a_rand.z * 6.2831853;
    vec2 dir = normalize(mix(vec2(cos(angle), sin(angle)), -a_tan, u_backward) + 1e-4);
    float speed = mix(u_speed.x, u_speed.y, a_rand.x * a_rand.x) * (u_spread / 150.0);
    float travel = u_drag > 0.0 ? (1.0 - exp(-u_drag * t)) / u_drag : t;
    pos = a_target + dir * speed * travel + vec2(0.0, 0.5 * u_gravity * t * t);
    float fade = 1.0 - t / life;
    v_alpha = fade * fade * twinkle;
    v_heat = exp(-t * u_cooling);
  }

  v_s = a_s;
  gl_PointSize = mix(u_size.x, u_size.y, a_rand.w * a_rand.z) * (0.7 + 0.6 * v_heat) * u_dpr;
  vec2 clip = (pos / u_res) * 2.0 - 1.0;
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
}`;

const PARTICLE_FS = `
precision highp float;
varying float v_alpha;
varying float v_heat;
varying float v_s;
${PALETTE_GLSL}
void main() {
  vec2 uv = gl_PointCoord - 0.5;
  float d = length(uv) * 2.0;
  float a = exp(-d * d * 3.5) * v_alpha;
  vec3 col = mix(palette(v_s), ${HOT}, v_heat * 0.6);
  gl_FragColor = vec4(col * a, a);
}`;

/** The wand tip: a hot core, soft halo and a four-point glint. */
const FLARE_VS = `
attribute vec2 a_pos;
uniform vec2 u_res;
uniform float u_size;
uniform float u_dpr;
void main() {
  vec2 clip = (a_pos / u_res) * 2.0 - 1.0;
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
  gl_PointSize = u_size * u_dpr;
}`;

const FLARE_FS = `
precision highp float;
uniform float u_alpha;
uniform float u_time;
uniform float u_tint;
${PALETTE_GLSL}
void main() {
  vec2 uv = (gl_PointCoord - 0.5) * 2.0;
  float d = length(uv);
  float core = exp(-d * d * 40.0);
  float halo = exp(-d * d * 5.0) * 0.55;
  float flicker = 0.85 + 0.15 * sin(u_time * 40.0);
  float rays = (exp(-abs(uv.y) * 28.0) + exp(-abs(uv.x) * 28.0)) * max(0.0, 1.0 - d) * 0.7;
  float a = clamp((core + halo + rays) * u_alpha * flicker, 0.0, 1.0);
  vec3 col = mix(palette(u_tint), ${HOT}, clamp(core * 2.0 + 0.4, 0.0, 1.0));
  gl_FragColor = vec4(col * a, a);
}`;

/* -------------------------------------------------------------------------- */
/* WebGL helpers                                                              */
/* -------------------------------------------------------------------------- */

interface Program {
  program: WebGLProgram;
  uniform: (name: string) => WebGLUniformLocation | null;
  attrib: (name: string) => number;
}

function compile(
  gl: WebGLRenderingContext,
  type: number,
  source: string
): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) {
    return null;
  }
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn("[ParticleLine]", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function link(
  gl: WebGLRenderingContext,
  vsSource: string,
  fsSource: string
): Program | null {
  const vs = compile(gl, gl.VERTEX_SHADER, vsSource);
  const fs = compile(gl, gl.FRAGMENT_SHADER, fsSource);
  const program = gl.createProgram();
  if (!(vs && fs && program)) {
    return null;
  }
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.warn("[ParticleLine]", gl.getProgramInfoLog(program));
    return null;
  }
  const uniforms = new Map<string, WebGLUniformLocation | null>();
  return {
    program,
    uniform: (name) => {
      if (!uniforms.has(name)) {
        uniforms.set(name, gl.getUniformLocation(program, name));
      }
      return uniforms.get(name) ?? null;
    },
    attrib: (name) => gl.getAttribLocation(program, name),
  };
}

/** Bind an interleaved float layout; returns the enabled locations to disable after drawing. */
function bindAttribs(
  gl: WebGLRenderingContext,
  program: Program,
  layout: [name: string, size: number][]
): number[] {
  const stride = layout.reduce((sum, [, size]) => sum + size, 0) * 4;
  const enabled: number[] = [];
  let offset = 0;
  for (const [name, size] of layout) {
    const loc = program.attrib(name);
    if (loc >= 0) {
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, size, gl.FLOAT, false, stride, offset);
      enabled.push(loc);
    }
    offset += size * 4;
  }
  return enabled;
}

function hexToRgb(hex: string): [number, number, number] {
  let h = hex.trim().replace("#", "");
  if (h.length === 3) {
    h = [...h].map((c) => c + c).join("");
  }
  const rgb = [0, 2, 4].map((i) => Number.parseInt(h.slice(i, i + 2), 16));
  if (rgb.some(Number.isNaN)) {
    return [1, 1, 1];
  }
  return [(rgb[0] ?? 255) / 255, (rgb[1] ?? 255) / 255, (rgb[2] ?? 255) / 255];
}

/** Deterministic LCG so the swarm is identical on every replay. */
function seededRandom(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1_664_525 + 1_013_904_223) % 4_294_967_296;
    return state / 4_294_967_296;
  };
}

type Bezier = readonly [number, number, number, number];

const CUBIC_BEZIER_RE = /cubic-bezier\(([^)]+)\)/;

/** The universal chart reveal — `DEFAULT_CHART_ENTER_TRANSITION`. */
const DEFAULT_EASE: Bezier = [0.85, 0, 0.15, 1];

function bezierAxis(p1: number, p2: number, t: number): number {
  const u = 1 - t;
  return 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t;
}

/** Solve `axis(t) = value` by bisection (both axes are monotonic for valid easings). */
function solveBezier(p1: number, p2: number, value: number): number {
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 32; i++) {
    const mid = (lo + hi) / 2;
    if (bezierAxis(p1, p2, mid) < value) {
      lo = mid;
    } else {
      hi = mid;
    }
  }
  return (lo + hi) / 2;
}

/** Eased progress (fraction of line drawn) at a time fraction. */
function easeAt([x1, y1, x2, y2]: Bezier, time: number): number {
  return bezierAxis(y1, y2, solveBezier(x1, x2, time));
}

/** Time fraction at which the eased front reaches `progress`. */
function timeAtProgress([x1, y1, x2, y2]: Bezier, progress: number): number {
  return bezierAxis(x1, x2, solveBezier(y1, y2, progress));
}

function isBezier(value: unknown): value is Bezier {
  return (
    Array.isArray(value) &&
    value.length === 4 &&
    value.every((n) => typeof n === "number")
  );
}

/** Same easing the chart's own clip reveal uses (springs fall back to the default, as there). */
function resolveChartEase(
  enterEase: unknown,
  animationEasing: string | undefined
): Bezier {
  if (isBezier(enterEase)) {
    return enterEase;
  }
  const match = animationEasing?.match(CUBIC_BEZIER_RE);
  const parsed = match?.[1]?.split(",").map(Number);
  if (isBezier(parsed) && parsed.every(Number.isFinite)) {
    return parsed;
  }
  return DEFAULT_EASE;
}

/* -------------------------------------------------------------------------- */
/* Geometry                                                                   */
/* -------------------------------------------------------------------------- */

interface LineSamples {
  /** Interleaved x, y pairs in canvas px (1px steps along the path). */
  points: Float32Array;
  /** Arc length at each sample. */
  lengths: Float32Array;
  total: number;
  /** Plot left / right edges in canvas px — the reveal sweeps between them. */
  xStart: number;
  xEnd: number;
}

function sampleLine(
  path: SVGPathElement,
  offsetX: number,
  offsetY: number,
  plotWidth: number
): LineSamples | null {
  const total = path.getTotalLength();
  if (!(total > 1)) {
    return null;
  }
  const count = Math.ceil(total) + 1;
  const points = new Float32Array(count * 2);
  const lengths = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const at = Math.min(i, total);
    const p = path.getPointAtLength(at);
    points[i * 2] = p.x + offsetX;
    points[i * 2 + 1] = p.y + offsetY;
    lengths[i] = at;
  }
  return {
    points,
    lengths,
    total,
    xStart: offsetX,
    xEnd: offsetX + Math.max(plotWidth, 1),
  };
}

function pointAt(samples: LineSamples, length: number): [number, number] {
  const last = samples.lengths.length - 1;
  const i = Math.min(last, Math.max(0, Math.round(length)));
  return [samples.points[i * 2] ?? 0, samples.points[i * 2 + 1] ?? 0];
}

/** 0–1 position of sample `i` across the plot width. */
function xFraction(samples: LineSamples, i: number): number {
  const x = samples.points[i * 2] ?? samples.xStart;
  const span = samples.xEnd - samples.xStart;
  return Math.min(Math.max((x - samples.xStart) / span, 0), 1);
}

/**
 * Arc length where the line crosses `fraction` of the plot width, so every
 * series reaches each date at the same moment — like the chart's clip reveal.
 */
function lengthAtXFraction(samples: LineSamples, fraction: number): number {
  const target = samples.xStart + fraction * (samples.xEnd - samples.xStart);
  let lo = 0;
  let hi = samples.lengths.length - 1;
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if ((samples.points[mid * 2] ?? 0) < target) {
      lo = mid + 1;
    } else {
      hi = mid;
    }
  }
  return samples.lengths[lo] ?? samples.total;
}

function tangentAt(samples: LineSamples, i: number): [number, number] {
  const n = samples.lengths.length;
  const a = Math.max(0, i - 2);
  const b = Math.min(n - 1, i + 2);
  const dx = (samples.points[b * 2] ?? 0) - (samples.points[a * 2] ?? 0);
  const dy =
    (samples.points[b * 2 + 1] ?? 0) - (samples.points[a * 2 + 1] ?? 0);
  const len = Math.hypot(dx, dy) || 1;
  return [dx / len, dy / len];
}

/**
 * Triangle strip: two vertices per sample — [x, y, s, side, centreline x] — plus one
 * extension at each end (s < 0, s > total) for the fragment shader's round caps.
 */
function buildRibbon(samples: LineSamples, halfWidth: number): Float32Array {
  const n = samples.lengths.length;
  const out = new Float32Array((n + 2) * 2 * RIBBON_STRIDE);
  const write = (
    slot: number,
    x: number,
    y: number,
    [tx, ty]: [number, number],
    s: number
  ) => {
    for (const [j, side] of [
      [0, -1],
      [1, 1],
    ] as const) {
      const o = (slot * 2 + j) * RIBBON_STRIDE;
      out[o] = x - ty * side * halfWidth;
      out[o + 1] = y + tx * side * halfWidth;
      out[o + 2] = s;
      out[o + 3] = side;
      out[o + 4] = x;
    }
  };
  const first = tangentAt(samples, 0);
  const last = tangentAt(samples, n - 1);
  const x0 = samples.points[0] ?? 0;
  const y0 = samples.points[1] ?? 0;
  write(
    0,
    x0 - first[0] * halfWidth,
    y0 - first[1] * halfWidth,
    first,
    -halfWidth
  );
  for (let i = 0; i < n; i++) {
    write(
      i + 1,
      samples.points[i * 2] ?? 0,
      samples.points[i * 2 + 1] ?? 0,
      tangentAt(samples, i),
      samples.lengths[i] ?? 0
    );
  }
  const xn = samples.points[(n - 1) * 2] ?? 0;
  const yn = samples.points[(n - 1) * 2 + 1] ?? 0;
  write(
    n + 1,
    xn + last[0] * halfWidth,
    yn + last[1] * halfWidth,
    last,
    samples.total + halfWidth
  );
  return out;
}

function buildParticles(
  samples: LineSamples,
  density: number,
  strokeWidth: number,
  timeAt: (progress: number) => number
): Float32Array {
  const count = Math.min(
    MAX_PARTICLES,
    Math.max(1, Math.round(samples.total * density))
  );
  const random = seededRandom(73_313);
  const out = new Float32Array(count * PARTICLE_STRIDE);
  const last = samples.lengths.length - 1;
  for (let p = 0; p < count; p++) {
    const s = random();
    const i = Math.min(last, Math.round(s * last));
    const [tx, ty] = tangentAt(samples, i);
    const across = (random() - 0.5) * strokeWidth * 1.6;
    const o = p * PARTICLE_STRIDE;
    out[o] = (samples.points[i * 2] ?? 0) - ty * across;
    out[o + 1] = (samples.points[i * 2 + 1] ?? 0) + tx * across;
    // Colour position — x across the plot, matching the line's gradient.
    out[o + 2] = xFraction(samples, i);
    out[o + 3] = tx;
    out[o + 4] = ty;
    out[o + 5] = random();
    out[o + 6] = random();
    out[o + 7] = random();
    out[o + 8] = random();
    // When the eased front reaches this particle's x, as a fraction of the reveal.
    out[o + 9] = timeAt(xFraction(samples, i));
  }
  return out;
}

/* -------------------------------------------------------------------------- */
/* Renderer                                                                   */
/* -------------------------------------------------------------------------- */

interface RenderSettings {
  delay: number;
  duration: number;
  spread: number;
  trail: number;
  strokeWidth: number;
  halfWidth: number;
  /** Half-width of the narrow stroke / glow-source ribbon. */
  narrowHalfWidth: number;
  effect: EffectPreset;
  ease: Bezier;
}

interface HoverFrame {
  /** 0 = not hovering, 1 = fully hovered (springs in and out). */
  amount: number;
  /** Segment left / right in canvas px. */
  start: number;
  end: number;
  /** Soft-end width in px. */
  fade: number;
  dim: number;
}

interface Frame {
  hover: HoverFrame;
  /** Plot left edge and width in canvas px (gradient + hover space). */
  xStart: number;
  xSpan: number;
  time: number;
  front: number;
  total: number;
  heat: number;
  head: [number, number];
  flareAlpha: number;
}

interface Renderer {
  setSize: (width: number, height: number, dpr: number) => void;
  setGeometry: (
    narrowRibbon: Float32Array,
    wideRibbon: Float32Array,
    particles: Float32Array
  ) => void;
  setColors: (colors: readonly string[], darkSurface: boolean) => void;
  draw: (frame: Frame) => void;
  dispose: () => void;
}

interface Target {
  texture: WebGLTexture;
  framebuffer: WebGLFramebuffer;
}

function createTarget(gl: WebGLRenderingContext): Target | null {
  const texture = gl.createTexture();
  const framebuffer = gl.createFramebuffer();
  if (!(texture && framebuffer)) {
    return null;
  }
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
  gl.framebufferTexture2D(
    gl.FRAMEBUFFER,
    gl.COLOR_ATTACHMENT0,
    gl.TEXTURE_2D,
    texture,
    0
  );
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  return { texture, framebuffer };
}

const RIBBON_LAYOUT: [string, number][] = [
  ["a_pos", 2],
  ["a_s", 1],
  ["a_side", 1],
  ["a_cx", 1],
];

function createRenderer(
  canvas: HTMLCanvasElement,
  settings: { current: RenderSettings }
): Renderer | null {
  const gl = canvas.getContext("webgl", {
    alpha: true,
    antialias: false,
    premultipliedAlpha: true,
  });
  if (!gl) {
    return null;
  }
  // MAX blending makes overlapping ribbon triangles (inside of tight bends)
  // idempotent. Universally supported; fall back to "over" just in case.
  const minmax = gl.getExtension("EXT_blend_minmax");
  const stroke = link(gl, RIBBON_VS, STROKE_FS);
  const bloom = link(gl, RIBBON_VS, BLOOM_FS);
  const blur = link(gl, QUAD_VS, BLUR_FS);
  const composite = link(gl, QUAD_VS, COMPOSITE_FS);
  const particles = link(gl, PARTICLE_VS, PARTICLE_FS);
  const flare = link(gl, FLARE_VS, FLARE_FS);
  const narrowBuffer = gl.createBuffer();
  const wideBuffer = gl.createBuffer();
  const quadBuffer = gl.createBuffer();
  const particleBuffer = gl.createBuffer();
  const flareBuffer = gl.createBuffer();
  const coreTarget = createTarget(gl);
  const glowTarget = createTarget(gl);
  const scratchTarget = createTarget(gl);
  if (
    !(
      stroke &&
      bloom &&
      blur &&
      composite &&
      particles &&
      flare &&
      narrowBuffer &&
      wideBuffer &&
      quadBuffer &&
      particleBuffer &&
      flareBuffer &&
      coreTarget &&
      glowTarget &&
      scratchTarget
    )
  ) {
    return null;
  }
  const targets = [coreTarget, glowTarget, scratchTarget];

  gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
    gl.STATIC_DRAW
  );

  const headData = new Float32Array(2);
  let narrowCount = 0;
  let wideCount = 0;
  let particleCount = 0;
  let cssWidth = 1;
  let cssHeight = 1;
  let dpr = 1;
  let palette: [number, number, number][] = [];
  let hot = HOT_ON_DARK;

  const usePalette = (program: Program) => {
    gl.uniform3f(program.uniform("u_hot"), hot[0], hot[1], hot[2]);
    palette.forEach(([r, g, b], i) => {
      gl.uniform3f(program.uniform(`u_c${i}`), r, g, b);
    });
  };
  const disable = (locations: number[]) => {
    for (const loc of locations) {
      gl.disableVertexAttribArray(loc);
    }
  };
  const bindTarget = (target: Target | null) => {
    gl.bindFramebuffer(gl.FRAMEBUFFER, target?.framebuffer ?? null);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
  };
  const drawQuad = (program: Program) => {
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
    const enabled = bindAttribs(gl, program, [["a_pos", 2]]);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    disable(enabled);
  };
  const bindTexture = (
    program: Program,
    name: string,
    unit: number,
    target: Target
  ) => {
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, target.texture);
    gl.uniform1i(program.uniform(name), unit);
  };

  /** Stroke pass into `target` (MAX blend). */
  const drawStroke = (
    target: Target,
    frame: Frame,
    s: RenderSettings,
    radius: number,
    heatMix: number
  ) => {
    bindTarget(target);
    gl.enable(gl.BLEND);
    if (minmax) {
      gl.blendEquation(minmax.MAX_EXT);
      gl.blendFunc(gl.ONE, gl.ONE);
    } else {
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    }
    gl.useProgram(stroke.program);
    gl.bindBuffer(gl.ARRAY_BUFFER, narrowBuffer);
    const enabled = bindAttribs(gl, stroke, RIBBON_LAYOUT);
    const u = stroke.uniform;
    gl.uniform2f(u("u_res"), cssWidth, cssHeight);
    gl.uniform1f(u("u_front"), frame.front);
    gl.uniform1f(u("u_total"), frame.total);
    gl.uniform1f(u("u_trail"), s.trail);
    gl.uniform1f(u("u_heat"), frame.heat * s.effect.heatGain);
    gl.uniform1f(u("u_heatMix"), heatMix);
    gl.uniform1f(u("u_radius"), radius);
    gl.uniform1f(u("u_halfW"), s.narrowHalfWidth);
    gl.uniform1f(u("u_dpr"), dpr);
    gl.uniform1f(u("u_xStart"), frame.xStart);
    gl.uniform1f(u("u_xSpan"), Math.max(frame.xSpan, 1));
    usePalette(stroke);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, narrowCount);
    disable(enabled);
    gl.blendEquation(gl.FUNC_ADD);
  };

  const drawBlur = (from: Target, to: Target, dx: number, dy: number) => {
    bindTarget(to);
    gl.disable(gl.BLEND);
    gl.useProgram(blur.program);
    bindTexture(blur, "u_tex", 0, from);
    gl.uniform2f(blur.uniform("u_step"), dx / canvas.width, dy / canvas.height);
    gl.uniform1f(blur.uniform("u_sigma"), Math.min(GLOW_BLUR * dpr, 16));
    drawQuad(blur);
  };

  const drawComposite = (frame: Frame) => {
    bindTarget(null);
    gl.disable(gl.BLEND);
    gl.useProgram(composite.program);
    bindTexture(composite, "u_core", 0, coreTarget);
    bindTexture(composite, "u_glow", 1, glowTarget);
    const u = composite.uniform;
    gl.uniform2f(u("u_res"), cssWidth, cssHeight);
    gl.uniform1f(u("u_glowOpacity"), GLOW_OPACITY);
    gl.uniform1f(u("u_hover"), frame.hover.amount);
    gl.uniform2f(u("u_seg"), frame.hover.start, frame.hover.end);
    gl.uniform1f(u("u_segFade"), frame.hover.fade);
    gl.uniform1f(u("u_dim"), frame.hover.dim);
    drawQuad(composite);
  };

  const drawBloom = (frame: Frame, s: RenderSettings) => {
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE);
    gl.useProgram(bloom.program);
    gl.bindBuffer(gl.ARRAY_BUFFER, wideBuffer);
    const enabled = bindAttribs(gl, bloom, RIBBON_LAYOUT);
    const u = bloom.uniform;
    gl.uniform2f(u("u_res"), cssWidth, cssHeight);
    gl.uniform1f(u("u_front"), frame.front);
    gl.uniform1f(u("u_total"), frame.total);
    gl.uniform1f(u("u_trail"), s.trail);
    gl.uniform1f(u("u_heat"), frame.heat * s.effect.heatGain);
    gl.uniform1f(u("u_halfW"), s.halfWidth);
    usePalette(bloom);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, wideCount);
    disable(enabled);
  };

  const drawParticles = (frame: Frame, s: RenderSettings) => {
    const fx = s.effect;
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE);
    gl.useProgram(particles.program);
    gl.bindBuffer(gl.ARRAY_BUFFER, particleBuffer);
    const enabled = bindAttribs(gl, particles, [
      ["a_target", 2],
      ["a_s", 1],
      ["a_tan", 2],
      ["a_rand", 4],
      ["a_when", 1],
    ]);
    const u = particles.uniform;
    gl.uniform2f(u("u_res"), cssWidth, cssHeight);
    gl.uniform1f(u("u_time"), frame.time);
    gl.uniform1f(u("u_delay"), s.delay);
    gl.uniform1f(u("u_duration"), s.duration);
    gl.uniform1f(u("u_spread"), s.spread);
    gl.uniform1f(u("u_dpr"), dpr);
    gl.uniform1f(u("u_mode"), fx.mode);
    gl.uniform2f(u("u_life"), fx.life[0], fx.life[1]);
    gl.uniform2f(u("u_speed"), fx.speed[0], fx.speed[1]);
    gl.uniform2f(u("u_size"), fx.size[0], fx.size[1]);
    gl.uniform1f(u("u_backward"), fx.backward);
    gl.uniform1f(u("u_gravity"), fx.gravity);
    gl.uniform1f(u("u_drag"), fx.drag);
    gl.uniform1f(u("u_twinkle"), fx.twinkle);
    gl.uniform1f(u("u_cooling"), fx.cooling);
    usePalette(particles);
    gl.drawArrays(gl.POINTS, 0, particleCount);
    disable(enabled);
  };

  const drawFlare = (frame: Frame, s: RenderSettings) => {
    headData[0] = frame.head[0];
    headData[1] = frame.head[1];
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE);
    gl.useProgram(flare.program);
    gl.bindBuffer(gl.ARRAY_BUFFER, flareBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, headData, gl.DYNAMIC_DRAW);
    const enabled = bindAttribs(gl, flare, [["a_pos", 2]]);
    gl.uniform2f(flare.uniform("u_res"), cssWidth, cssHeight);
    gl.uniform1f(flare.uniform("u_size"), s.effect.flare);
    gl.uniform1f(flare.uniform("u_dpr"), dpr);
    gl.uniform1f(flare.uniform("u_alpha"), frame.flareAlpha);
    gl.uniform1f(flare.uniform("u_time"), frame.time);
    gl.uniform1f(
      flare.uniform("u_tint"),
      frame.total > 0 ? frame.front / frame.total : 0
    );
    usePalette(flare);
    gl.drawArrays(gl.POINTS, 0, 1);
    disable(enabled);
  };

  return {
    setSize: (width, height, ratio) => {
      cssWidth = width;
      cssHeight = height;
      dpr = ratio;
      canvas.width = Math.max(1, Math.round(width * ratio));
      canvas.height = Math.max(1, Math.round(height * ratio));
      for (const target of targets) {
        gl.bindTexture(gl.TEXTURE_2D, target.texture);
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA,
          canvas.width,
          canvas.height,
          0,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          null
        );
      }
    },
    setGeometry: (narrowData, wideData, particleData) => {
      gl.bindBuffer(gl.ARRAY_BUFFER, narrowBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, narrowData, gl.STATIC_DRAW);
      narrowCount = narrowData.length / RIBBON_STRIDE;
      gl.bindBuffer(gl.ARRAY_BUFFER, wideBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, wideData, gl.STATIC_DRAW);
      wideCount = wideData.length / RIBBON_STRIDE;
      gl.bindBuffer(gl.ARRAY_BUFFER, particleBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, particleData, gl.STATIC_DRAW);
      particleCount = particleData.length / PARTICLE_STRIDE;
    },
    setColors: (colors, darkSurface) => {
      palette = [0, 1, 2, 3].map((i) =>
        hexToRgb(colors[i % Math.max(colors.length, 1)] ?? "#ffffff")
      );
      hot = darkSurface ? HOT_ON_DARK : (palette[0] ?? HOT_ON_DARK);
    },
    draw: (frame) => {
      const s = settings.current;
      // Line: stroke + glow source offscreen, blur the glow, composite.
      drawStroke(coreTarget, frame, s, s.strokeWidth / 2, 1);
      drawStroke(
        glowTarget,
        frame,
        s,
        (s.strokeWidth * GLOW_WIDTH_SCALE) / 2,
        0
      );
      drawBlur(glowTarget, scratchTarget, 1, 0);
      drawBlur(scratchTarget, glowTarget, 0, 1);
      drawComposite(frame);
      // Reveal extras on top, additive.
      if (frame.heat > 0) {
        drawBloom(frame, s);
      }
      if (frame.time < s.delay + s.duration + s.effect.life[1]) {
        drawParticles(frame, s);
      }
      if (s.effect.flare > 0 && frame.flareAlpha > 0) {
        drawFlare(frame, s);
      }
    },
    dispose: () => {
      for (const buffer of [
        narrowBuffer,
        wideBuffer,
        quadBuffer,
        particleBuffer,
        flareBuffer,
      ]) {
        gl.deleteBuffer(buffer);
      }
      for (const target of targets) {
        gl.deleteFramebuffer(target.framebuffer);
        gl.deleteTexture(target.texture);
      }
      for (const program of [
        stroke,
        bloom,
        blur,
        composite,
        particles,
        flare,
      ]) {
        gl.deleteProgram(program.program);
      }
    },
  };
}

/** Light text colour on the chart ⇒ dark theme. */
function isDarkSurface(element: HTMLElement): boolean {
  const match = getComputedStyle(element).color.match(/[\d.]+/g);
  if (!match || match.length < 3) {
    return true;
  }
  const [r = 0, g = 0, b = 0] = match.map(Number);
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 > 0.5;
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true
  );
}

/* -------------------------------------------------------------------------- */
/* SVG hand-off                                                               */
/* -------------------------------------------------------------------------- */

/** Filter region bleed around the plot so the blurred glow is never cropped. */
const GLOW_FILTER_BLEED = 40;

/**
 * Resting glow. Its own hover subscriber so the parent stays on the stable
 * context; fades out while hovering, like the WebGL frame.
 */
function ParticleLineGlow({
  d,
  filter,
  stroke,
  strokeWidth,
}: {
  d: string;
  filter: string;
  stroke: string;
  strokeWidth: number;
}) {
  const hovering = useChartHoverSelector(selectIsChartHovering);
  return (
    <m.path
      animate={{ opacity: hovering ? 0 : 1 }}
      d={d}
      fill="none"
      filter={filter}
      initial={false}
      stroke={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeOpacity={GLOW_OPACITY}
      strokeWidth={strokeWidth}
      transition={{ duration: 0.4, ease: "easeInOut" }}
    />
  );
}

/**
 * Release a canvas's WebGL context once it is really gone. Deferred a tick so
 * Strict Mode's immediate effect re-run on the same canvas can cancel it — a
 * lost context can't compile shaders again.
 */
const pendingContextRelease = new WeakMap<HTMLCanvasElement, number>();

function scheduleContextRelease(canvas: HTMLCanvasElement) {
  const timer = window.setTimeout(() => {
    pendingContextRelease.delete(canvas);
    canvas
      .getContext("webgl")
      ?.getExtension("WEBGL_lose_context")
      ?.loseContext();
  }, 0);
  pendingContextRelease.set(canvas, timer);
}

function cancelContextRelease(canvas: HTMLCanvasElement) {
  const timer = pendingContextRelease.get(canvas);
  if (timer !== undefined) {
    window.clearTimeout(timer);
    pendingContextRelease.delete(canvas);
  }
}

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * A `LineChart` series drawn in WebGL and revealed with particles — either a
 * swarm condensing onto the line (`assemble`) or the line growing from a
 * glowing wand tip that sheds sparks (`comet`, `stardust`).
 * Registers as a normal series, so `ChartTooltip` and the y-domain treat it
 * like a `<Line>`.
 */
export function ParticleLine({
  dataKey,
  yAxisId,
  curve = curveMonotoneX,
  strokeWidth = 2.5,
  colors = PARTICLE_LINE_GOLD,
  effect = "assemble",
  duration: durationProp,
  delay = 0,
  easing,
  density = 7,
  spread = 150,
  trail = 90,
  highlight,
}: ParticleLineProps) {
  const {
    renderData,
    xScale,
    xAccessor,
    width,
    height,
    innerWidth,
    innerHeight,
    lines,
    margin,
    containerRef,
    revealEpoch,
    animationDuration,
    animationEasing,
    enterTransition,
  } = useChartStable();
  const yScale = useYScale(yAxisId);
  const container = useChartPortalContainer(containerRef);
  const pathRef = useRef<SVGPathElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const samplesRef = useRef<LineSamples | null>(null);
  const startRef = useRef<number | null>(null);
  const [canvasReady, setCanvasReady] = useState(false);
  /** WebGL while revealing; a plain SVG line once it has cooled. */
  const [phase, setPhase] = useState<"webgl" | "svg">("webgl");
  const uniqueId = useId().replace(/:/g, "");
  const gradientId = `particle-line-${uniqueId}`;
  const glowFilterId = `${gradientId}-glow`;
  const svgPathRef = useRef<SVGPathElement>(null);

  const preset = EFFECTS[effect];
  const duration = durationProp ?? animationDuration;
  const chartEase = resolveChartEase(enterTransition?.ease, animationEasing);
  const ease = easing ?? chartEase;
  const easeKey = ease.join(",");
  const halfWidth = (strokeWidth * GLOW_WIDTH_SCALE) / 2 + RIBBON_PAD;
  // Just past the glow stroke's edge (+ AA ramp) — narrow enough that tight
  // bends rarely fold it; MAX blending covers the folds that remain.
  const narrowHalfWidth = (strokeWidth * GLOW_WIDTH_SCALE) / 2 + 1.5;
  const settings: RenderSettings = {
    delay: delay / 1000,
    duration: duration / 1000,
    spread,
    trail,
    strokeWidth,
    halfWidth,
    narrowHalfWidth,
    effect: preset,
    ease,
  };
  const settingsRef = useRef(settings);
  settingsRef.current = settings;
  const stopAt =
    settings.delay + settings.duration + preset.life[1] + HEAT_FADE_S;

  const highlightEnabled = highlight !== false;
  const span = (highlight || undefined)?.span ?? 3;
  const fadeLength = Math.min(
    50,
    Math.max(0, (highlight || undefined)?.fadeLength ?? 40)
  );
  const dimOpacity = (highlight || undefined)?.dimOpacity ?? 0.25;
  const {
    xSpring: segmentX,
    widthSpring: segmentWidth,
    isActive: hoverActive,
  } = useHighlightSegment({ enabled: highlightEnabled, span });
  // Same tween as SeriesHoverDim / HighlightSegment, so hover looks identical
  // before and after the SVG hand-off.
  const hoverAmount = useMotionValue(0);
  useEffect(() => {
    const controls = animate(hoverAmount, hoverActive ? 1 : 0, {
      duration: 0.4,
      ease: "easeInOut",
    });
    return () => controls.stop();
  }, [hoverActive, hoverAmount]);
  const hoverRef = useRef({ fadeLength, dimOpacity, marginLeft: margin.left });
  hoverRef.current = { fadeLength, dimOpacity, marginLeft: margin.left };
  const animatingRef = useRef(false);

  const getX = useCallback(
    (d: Record<string, unknown>) => xScale(xAccessor(d)) ?? 0,
    [xAccessor, xScale]
  );
  const getY = useCallback(
    (d: Record<string, unknown>) => yScale(Number(d[dataKey])) ?? 0,
    [dataKey, yScale]
  );
  const defined = useCallback(
    (d: Record<string, unknown>) => typeof d[dataKey] === "number",
    [dataKey]
  );
  const lineD = useMemo(
    () => linePathD(renderData, { curve, defined, x: getX, y: getY }),
    [curve, defined, getX, getY, renderData]
  );

  const readHover = useCallback((): HoverFrame => {
    const {
      fadeLength: fadePct,
      dimOpacity: dim,
      marginLeft,
    } = hoverRef.current;
    const start = segmentX.get() + marginLeft;
    const width = segmentWidth.get();
    return {
      amount: hoverAmount.get(),
      start,
      end: start + width,
      fade: Math.max((width * fadePct) / 100, 0.5),
      dim,
    };
  }, [hoverAmount, segmentWidth, segmentX]);

  /** Draw one frame at `time` seconds since the reveal started. */
  const drawAt = useCallback(
    (time: number) => {
      const renderer = rendererRef.current;
      const samples = samplesRef.current;
      if (!(renderer && samples)) {
        return;
      }
      const s = settingsRef.current;
      const linear = Math.min(Math.max((time - s.delay) / s.duration, 0), 1);
      const progress = easeAt(s.ease, linear);
      const front =
        progress >= 1 ? samples.total : lengthAtXFraction(samples, progress);
      const pastEnd = time - (s.delay + s.duration);
      const cooldown = pastEnd > 0 ? Math.max(0, 1 - pastEnd / HEAT_FADE_S) : 1;
      let flareAlpha = 0;
      if (time >= s.delay) {
        // Ignite quickly, then burn out after the end.
        flareAlpha = Math.min(1, (time - s.delay) / 0.15) * cooldown ** 2;
      }
      renderer.draw({
        time,
        total: samples.total,
        // Nothing (not even the start cap) before the reveal begins.
        front: progress > 0 ? front : -1e4,
        heat: cooldown,
        head: pointAt(samples, front),
        flareAlpha,
        hover: readHover(),
        xStart: samples.xStart,
        xSpan: samples.xEnd - samples.xStart,
      });
    },
    [readHover]
  );

  const currentTime = useCallback(() => {
    // Not started yet: hold the first frame (empty stage), never the end.
    if (startRef.current === null) {
      return 0;
    }
    return (performance.now() - startRef.current) / 1000;
  }, []);

  // GL context lives as long as the canvas.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!(canvas && container)) {
      return;
    }
    cancelContextRelease(canvas);
    const renderer = createRenderer(canvas, settingsRef);
    rendererRef.current = renderer;
    setCanvasReady(renderer !== null);
    return () => {
      renderer?.dispose();
      rendererRef.current = null;
      setCanvasReady(false);
      scheduleContextRelease(canvas);
    };
  }, [container, phase]);

  const colorKey = colors.join(",");

  // Size, colours + geometry: re-sample whenever the line or chart changes.
  useLayoutEffect(() => {
    const renderer = rendererRef.current;
    const path = pathRef.current;
    if (!(canvasReady && renderer && path && lineD)) {
      return;
    }
    renderer.setSize(
      width,
      height,
      Math.min(window.devicePixelRatio || 1, MAX_DPR)
    );
    renderer.setColors(
      colorKey.split(","),
      isDarkSurface(container ?? path.ownerDocument.body)
    );
    const samples = sampleLine(path, margin.left, margin.top, innerWidth);
    samplesRef.current = samples;
    if (!samples) {
      return;
    }
    renderer.setGeometry(
      buildRibbon(samples, narrowHalfWidth),
      buildRibbon(samples, halfWidth),
      buildParticles(samples, density, strokeWidth, (progress) =>
        timeAtProgress(settingsRef.current.ease, progress)
      )
    );
    drawAt(Math.min(currentTime(), stopAt));
  }, [
    canvasReady,
    colorKey,
    container,
    currentTime,
    density,
    easeKey,
    drawAt,
    halfWidth,
    narrowHalfWidth,
    height,
    innerWidth,
    lineD,
    margin.left,
    margin.top,
    stopAt,
    strokeWidth,
    width,
  ]);

  // Play the reveal on mount, on every replay (`revealEpoch`) and when the effect changes.
  useEffect(() => {
    if (!canvasReady) {
      return;
    }
    if (prefersReducedMotion()) {
      startRef.current = Number.NEGATIVE_INFINITY;
      setPhase("svg");
      return;
    }
    startRef.current = performance.now();
    animatingRef.current = true;
    let frame = 0;
    const tick = () => {
      const time = currentTime();
      drawAt(Math.min(time, stopAt));
      if (time < stopAt) {
        frame = requestAnimationFrame(tick);
      } else {
        animatingRef.current = false;
        // Cooled: the last frame is the resting look — swap to SVG and let
        // the canvas (and its WebGL context) go.
        setPhase("svg");
      }
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      animatingRef.current = false;
    };
  }, [canvasReady, currentTime, drawAt, effect, revealEpoch, stopAt]);

  // Replay: bring the canvas back for the reveal.
  const lastEpochRef = useRef(revealEpoch);
  useEffect(() => {
    if (lastEpochRef.current === revealEpoch) {
      return;
    }
    lastEpochRef.current = revealEpoch;
    setPhase("webgl");
  }, [revealEpoch]);

  // Hover redraws: one frame per spring change, batched to the next paint.
  // During the intro the reveal loop already draws every frame.
  useEffect(() => {
    if (!canvasReady) {
      return;
    }
    let frame = 0;
    const request = () => {
      if (animatingRef.current || frame) {
        return;
      }
      frame = requestAnimationFrame(() => {
        frame = 0;
        drawAt(Math.min(currentTime(), stopAt));
      });
    };
    const unsubscribe = [segmentX, segmentWidth, hoverAmount].map((value) =>
      value.on("change", request)
    );
    return () => {
      cancelAnimationFrame(frame);
      for (const off of unsubscribe) {
        off();
      }
    };
  }, [
    canvasReady,
    currentTime,
    drawAt,
    hoverAmount,
    segmentWidth,
    segmentX,
    stopAt,
  ]);

  const palette = [0, 1, 2, 3].map(
    (i) => colors[i % Math.max(colors.length, 1)] ?? "#ffffff"
  );
  const seriesIndex = Math.max(
    0,
    lines.findIndex((line) => line.dataKey === dataKey)
  );
  const glowWidth = strokeWidth * GLOW_WIDTH_SCALE;

  return (
    <>
      {/* Invisible — only used to sample the curve. */}
      <path d={lineD} fill="none" ref={pathRef} stroke="none" />
      {phase === "svg" ? (
        <>
          <defs>
            <linearGradient
              gradientUnits="userSpaceOnUse"
              id={gradientId}
              x1={0}
              x2={Math.max(innerWidth, 1)}
              y1={0}
              y2={0}
            >
              {palette.map((color, i) => (
                <stop key={`${i}-${color}`} offset={i / 3} stopColor={color} />
              ))}
            </linearGradient>
            <filter
              colorInterpolationFilters="sRGB"
              filterUnits="userSpaceOnUse"
              height={innerHeight + GLOW_FILTER_BLEED * 2}
              id={glowFilterId}
              width={innerWidth + GLOW_FILTER_BLEED * 2}
              x={-GLOW_FILTER_BLEED}
              y={-GLOW_FILTER_BLEED}
            >
              <feGaussianBlur stdDeviation={GLOW_BLUR} />
            </filter>
          </defs>
          <SeriesHoverDim
            dimOpacity={dimOpacity}
            enabled={highlightEnabled}
            seriesIndex={seriesIndex}
          >
            <ParticleLineGlow
              d={lineD}
              filter={`url(#${glowFilterId})`}
              stroke={`url(#${gradientId})`}
              strokeWidth={glowWidth}
            />
            <path
              d={lineD}
              fill="none"
              ref={svgPathRef}
              stroke={`url(#${gradientId})`}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={strokeWidth}
            />
          </SeriesHoverDim>
          <HighlightSegment
            fadeLength={fadeLength}
            height={innerHeight}
            pathRef={svgPathRef}
            stroke={`url(#${gradientId})`}
            strokeWidth={strokeWidth}
            visible={highlightEnabled && hoverActive}
            width={segmentWidth}
            x={segmentX}
          />
        </>
      ) : null}
      {container && phase === "webgl"
        ? createPortal(
            <canvas
              aria-hidden
              className="pointer-events-none absolute top-0 left-0"
              ref={canvasRef}
              style={{ width, height }}
            />,
            container
          )
        : null}
    </>
  );
}

ParticleLine.displayName = "ParticleLine";

export default ParticleLine;
