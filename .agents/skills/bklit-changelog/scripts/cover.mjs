#!/usr/bin/env node
/**
 * Changelog cover art generator — abstract, single-colour geometric SVGs on a
 * 1600×900 canvas. The site renders covers as a CSS mask over the foreground
 * colour (and recolours them light for dark Open Graph cards), so everything
 * is drawn in black and depth comes from opacity only.
 *
 *   node .agents/skills/bklit-changelog/scripts/cover.mjs <motif> <out.svg> [seed]
 *   node .agents/skills/bklit-changelog/scripts/cover.mjs --list
 *
 * Deterministic: the same motif + seed always produces the same file.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const W = 1600;
const H = 900;
const M = 160; // safe margin

const r = (n) => Math.round(n * 10) / 10;

function rng(seed) {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s * 1_664_525 + 1_013_904_223) >>> 0;
    return s / 2 ** 32;
  };
}

const line = (x1, y1, x2, y2, o = 1, w = 2, extra = "") =>
  `<line x1="${r(x1)}" y1="${r(y1)}" x2="${r(x2)}" y2="${r(y2)}" stroke-opacity="${r(o)}" stroke-width="${w}"${extra}/>`;
const circle = (cx, cy, rad, attrs = "") =>
  `<circle cx="${r(cx)}" cy="${r(cy)}" r="${r(rad)}"${attrs}/>`;
const dashed = ' stroke-dasharray="6 10"';

const motifs = {
  /** Rising bars whose tops trace a curve, with ghost outlines — bar charts. */
  "bar-steps": (rand) => {
    const out = [];
    const n = 18;
    const gap = (W - 2 * M) / n;
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1);
      const h = 120 + 420 * (0.5 - 0.5 * Math.cos(t * Math.PI)) + rand() * 40;
      const x = M + i * gap + gap * 0.2;
      const w = gap * 0.6;
      out.push(
        `<rect x="${r(x)}" y="${r(H - M - h)}" width="${r(w)}" height="${r(h)}" fill-opacity="${r(0.12 + 0.5 * t)}" stroke="none"/>`,
        `<rect x="${r(x)}" y="${r(M)}" width="${r(w)}" height="${r(H - 2 * M - h - 16)}" stroke-opacity="0.18" stroke-width="2" fill="none"${dashed}/>`
      );
    }
    return out;
  },

  /** Strip plot: dots jittered around a few columns — scatter charts. */
  "scatter-jitter": (rand) => {
    const out = [];
    const cols = 7;
    for (let c = 0; c < cols; c++) {
      const cx = M + 80 + (c * (W - 2 * M - 160)) / (cols - 1);
      out.push(line(cx, M, cx, H - M, 0.12, 2));
      const center = 300 + rand() * 300;
      for (let k = 0; k < 26; k++) {
        const y = center + (rand() + rand() + rand() - 1.5) * 220;
        const x = cx + (rand() - 0.5) * 90;
        out.push(
          circle(
            x,
            y,
            7,
            ` fill-opacity="${r(0.25 + rand() * 0.65)}" stroke="none"`
          )
        );
      }
    }
    return out;
  },

  /** Two wavy edges with hatching between — Band, ranges, intervals. */
  band: (rand) => {
    const out = [];
    const phase = rand() * Math.PI;
    const mid = (x) =>
      H / 2 + Math.sin(x / 210 + phase) * 110 + Math.sin(x / 90) * 20;
    const width = (x) => 70 + 50 * Math.sin(x / 330 + phase * 2);
    const upper = [];
    const lower = [];
    for (let x = M; x <= W - M; x += 8) {
      upper.push(`${r(x)},${r(mid(x) - width(x))}`);
      lower.push(`${r(x)},${r(mid(x) + width(x))}`);
      if ((x - M) % 24 === 0) {
        out.push(line(x, mid(x) - width(x), x, mid(x) + width(x), 0.22, 2));
      }
    }
    out.push(
      `<polyline points="${upper.join(" ")}" fill="none" stroke-width="3"/>`,
      `<polyline points="${lower.join(" ")}" fill="none" stroke-width="3" stroke-opacity="0.6"/>`
    );
    return out;
  },

  /** Notched arc filling up — gauges, progress, loading. */
  gauge: (rand) => {
    const out = [];
    const cx = W / 2;
    const cy = H - M - 20;
    const fill = 0.55 + rand() * 0.25;
    const n = 48;
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1);
      const a = Math.PI + t * Math.PI;
      const c = Math.cos(a);
      const s = Math.sin(a);
      const on = t <= fill;
      out.push(
        line(
          cx + c * 360,
          cy + s * 360,
          cx + c * 520,
          cy + s * 520,
          on ? 0.9 : 0.18,
          on ? 6 : 4
        )
      );
    }
    return out;
  },

  /** Grid of squares whose density fades — heatmaps, contribution grids. */
  "dot-grid": (rand) => {
    const out = [];
    const cols = 26;
    const rows = 11;
    const size = (W - 2 * M) / cols;
    for (let c = 0; c < cols; c++) {
      for (let row = 0; row < rows; row++) {
        const t = c / (cols - 1);
        if (rand() > 1 - t * 0.85) {
          continue;
        }
        out.push(
          `<rect x="${r(M + c * size + 3)}" y="${r(M + 60 + row * size + 3)}" width="${r(size - 6)}" height="${r(size - 6)}" rx="3" fill-opacity="${r(0.2 + (1 - t) * 0.7)}" stroke="none"/>`
        );
      }
    }
    return out;
  },

  /** Concentric arcs of different sweeps from 12 o'clock — benchmarks, scores. */
  "radial-bars": (rand) => {
    const out = [];
    const cx = W / 2;
    const cy = H / 2;
    for (let i = 0; i < 7; i++) {
      const radius = 110 + i * 42;
      const sweep = 0.25 + rand() * 0.7;
      const end = -Math.PI / 2 + sweep * Math.PI * 2;
      const large = sweep > 0.5 ? 1 : 0;
      const x = cx + Math.cos(end) * radius;
      const y = cy + Math.sin(end) * radius;
      out.push(
        circle(
          cx,
          cy,
          radius,
          ` fill="none" stroke-opacity="0.12" stroke-width="2"${dashed}`
        ),
        `<path d="M ${cx} ${r(cy - radius)} A ${radius} ${radius} 0 ${large} 1 ${r(x)} ${r(y)}" fill="none" stroke-width="${i === 0 ? 6 : 4}" stroke-opacity="${r(0.95 - i * 0.1)}"/>`,
        circle(x, y, 6, ' stroke="none"')
      );
    }
    return out;
  },

  /** Overlapping discs whose overlaps deepen — palettes, colour mixing. */
  "hue-discs": (rand) => {
    const out = [];
    const count = 5;
    const step = 150;
    const x0 = W / 2 - ((count - 1) * step) / 2;
    for (let i = 0; i < count; i++) {
      const y = H / 2 + Math.sin(i * 1.3 + rand()) * 60;
      out.push(
        circle(
          x0 + i * step,
          y,
          190,
          ` fill-opacity="0.13" stroke-opacity="${r(0.35 + i * 0.12)}" stroke-width="2"`
        )
      );
    }
    return out;
  },

  /** A noisy staircase with a straight fit running through it — trend lines. */
  "step-trend": (rand) => {
    const out = [];
    const n = 16;
    const step = (W - 2 * M) / n;
    let d = `M ${M} ${H - M - 80}`;
    for (let i = 0; i < n; i++) {
      const base = H - M - 80 - (i / (n - 1)) * 420;
      const y = base + (rand() - 0.5) * 150;
      const x = M + i * step;
      d += ` L ${r(x)} ${r(y)} L ${r(x + step)} ${r(y)}`;
      out.push(
        circle(x + step / 2, y, 5, ' stroke="none" fill-opacity="0.55"')
      );
    }
    out.push(
      `<path d="${d}" fill="none" stroke-width="2" stroke-opacity="0.4" stroke-linejoin="round"/>`,
      line(M - 20, H - M - 50, W - M + 20, M + 60, 1, 4)
    );
    return out;
  },

  /** Page rails with square rivets where dividers meet them — site design. */
  rails: (rand) => {
    const out = [];
    const left = M + 120;
    const right = W - M - 120;
    const rows = [200, 330, 560, 700];
    out.push(
      line(left, 60, left, H - 60, 0.5, 2),
      line(right, 60, right, H - 60, 0.5, 2)
    );
    for (const y of rows) {
      out.push(line(60, y, W - 60, y, 0.22, 2));
      for (const x of [left, right]) {
        out.push(
          `<rect x="${x - 9}" y="${y - 9}" width="18" height="18" rx="4" fill="none" stroke-width="2.5"/>`
        );
      }
    }
    const panels = 3;
    const gap = 28;
    const pw = (right - left - 80 - gap * (panels - 1)) / panels;
    for (let i = 0; i < panels; i++) {
      const x = left + 40 + i * (pw + gap);
      const h = 150 + rand() * 50;
      out.push(
        `<rect x="${r(x)}" y="${r(560 - 30 - h)}" width="${r(pw)}" height="${r(h)}" rx="20" fill="none" stroke-width="2" stroke-opacity="${r(0.35 + i * 0.25)}"/>`
      );
    }
    return out;
  },

  /** Loose circles flowing into an ordered grid — migration, agents, tooling. */
  migrate: (rand) => {
    const out = [];
    const sources = [];
    for (let i = 0; i < 14; i++) {
      const p = [M + 40 + rand() * 360, M + 60 + rand() * (H - 2 * M - 120)];
      sources.push(p);
      out.push(
        circle(
          p[0],
          p[1],
          10 + rand() * 18,
          ` fill="none" stroke-width="2" stroke-opacity="${r(0.3 + rand() * 0.5)}"`
        )
      );
    }
    const cell = 64;
    const gx = W - M - 5 * cell;
    const gy = H / 2 - 2 * cell;
    for (let c = 0; c < 5; c++) {
      for (let row = 0; row < 4; row++) {
        out.push(
          `<rect x="${gx + c * cell + 8}" y="${gy + row * cell + 8}" width="${cell - 16}" height="${cell - 16}" rx="10" fill-opacity="${r(0.15 + ((c + row) % 3) * 0.25)}" stroke="none"/>`
        );
      }
    }
    for (let i = 0; i < 5; i++) {
      const [sx, sy] = sources[i * 2];
      const tx = gx + 8;
      const ty = gy + ((i % 4) + 0.5) * cell;
      out.push(
        `<path d="M ${r(sx)} ${r(sy)} C ${r(sx + 300)} ${r(sy)}, ${r(tx - 300)} ${r(ty)}, ${r(tx)} ${r(ty)}" fill="none" stroke-width="2" stroke-opacity="0.35"${dashed}/>`
      );
    }
    return out;
  },

  /** A curve, a haloed hover dot and a floating panel — tooltips, hover. */
  halo: (rand) => {
    const out = [];
    const phase = rand() * 2;
    const yAt = (x) =>
      H / 2 + 60 + Math.sin(x / 190 + phase) * 120 - (x - M) * 0.12;
    const pts = [];
    for (let x = M; x <= W - M; x += 10) {
      pts.push(`${x},${r(yAt(x))}`);
    }
    out.push(
      `<polyline points="${pts.join(" ")}" fill="none" stroke-width="3"/>`
    );
    const hx = M + (W - 2 * M) * 0.58;
    const hy = yAt(hx);
    out.push(
      line(hx, M - 20, hx, H - M + 20, 0.25, 2, dashed),
      circle(hx, hy, 70, ' fill-opacity="0.08" stroke="none"'),
      circle(hx, hy, 40, ' fill-opacity="0.18" stroke="none"'),
      circle(hx, hy, 12, ' stroke="none"')
    );
    const px = hx + 70;
    const py = Math.max(M, hy - 230);
    out.push(
      `<rect x="${r(px)}" y="${r(py)}" width="300" height="170" rx="22" fill="none" stroke-width="2.5"/>`,
      line(px, py + 56, px + 300, py + 56, 0.3, 2),
      line(px + 28, py + 30, px + 150, py + 30, 0.8, 6),
      line(px + 28, py + 92, px + 220, py + 92, 0.45, 6),
      line(px + 28, py + 128, px + 180, py + 128, 0.45, 6)
    );
    return out;
  },

  /** Tiles filled with different textures — styles, recipes, patterns. */
  swatches: () => {
    const out = [];
    const defs = [];
    const n = 5;
    const size = 200;
    const gap = 40;
    const x0 = (W - (n * size + (n - 1) * gap)) / 2;
    const y = (H - size) / 2;
    for (let i = 0; i < n; i++) {
      const x = x0 + i * (size + gap);
      defs.push(
        `<clipPath id="t${i}"><rect x="${r(x)}" y="${y}" width="${size}" height="${size}" rx="28"/></clipPath>`
      );
      const fills = [];
      if (i === 0) {
        for (let k = -size; k < size; k += 22) {
          fills.push(line(x + k, y + size, x + k + size, y, 0.7, 3));
        }
      } else if (i === 1) {
        for (let a = 0; a < size; a += 26) {
          for (let b = 0; b < size; b += 26) {
            fills.push(circle(x + a + 13, y + b + 13, 4, ' stroke="none"'));
          }
        }
      } else if (i === 2) {
        for (let k = 16; k < size; k += 20) {
          fills.push(line(x, y + k, x + size, y + k, 0.6, 3));
        }
      } else if (i === 3) {
        for (let k = 25; k < size; k += 50) {
          fills.push(
            line(x + k, y, x + k, y + size, 0.5, 2),
            line(x, y + k, x + size, y + k, 0.5, 2)
          );
        }
      } else {
        fills.push(
          `<rect x="${r(x)}" y="${y}" width="${size}" height="${size}" fill-opacity="0.55" stroke="none"/>`
        );
      }
      out.push(
        `<g clip-path="url(#t${i})">${fills.join("")}</g>`,
        `<rect x="${r(x)}" y="${y}" width="${size}" height="${size}" rx="28" fill="none" stroke-width="2.5"/>`
      );
    }
    return [`<defs>${defs.join("")}</defs>`, ...out];
  },

  /** Stacked waves going from jagged to smooth — fixes, polish. */
  waves: (rand) => {
    const out = [];
    const rows = 9;
    for (let i = 0; i < rows; i++) {
      const t = i / (rows - 1);
      const y0 = M + 20 + i * ((H - 2 * M - 40) / (rows - 1));
      const noise = (1 - t) * 34;
      const pts = [];
      for (let x = M; x <= W - M; x += 12) {
        const y =
          y0 + Math.sin(x / 140 + i * 0.6) * 22 + (rand() - 0.5) * noise;
        pts.push(`${x},${r(y)}`);
      }
      out.push(
        `<polyline points="${pts.join(" ")}" fill="none" stroke-width="2.5" stroke-opacity="${r(0.25 + t * 0.7)}" stroke-linejoin="round"/>`
      );
    }
    return out;
  },
};

const [motif, outPath, seedArg] = process.argv.slice(2);

if (!motif || motif === "--list") {
  console.log(Object.keys(motifs).join("\n"));
  process.exit(motif ? 0 : 1);
}
if (!(motif in motifs && outPath)) {
  console.error(
    `Usage: cover.mjs <motif> <out.svg> [seed]\nMotifs: ${Object.keys(motifs).join(", ")}`
  );
  process.exit(1);
}

const body = motifs[motif](rng(Number(seedArg ?? 1))).join("\n    ");
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" fill="#000" stroke="#000" stroke-linecap="round">
  <g>
    ${body}
  </g>
</svg>
`;

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, svg);
console.log(`wrote ${outPath} (${motif}, seed ${seedArg ?? 1})`);
