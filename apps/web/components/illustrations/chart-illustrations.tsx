/**
 * Abstract, monochrome illustrations for every bklit chart type.
 * Visual language adapted from coss ui's category thumbnails (MIT) — see
 * ./primitives.tsx for attribution.
 */
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  arcPath,
  Dot,
  FadeGradient,
  polar,
  strokeArc,
  Text,
  ThumbCard,
  ThumbHeader,
  ThumbPanel,
  ThumbSvg,
} from "./primitives";
import { utilityIllustrations } from "./utility-illustrations";

const ACCENT_BG = "bg-linear-to-b from-(--btn-from) to-(--btn-to)";

/** Opacity ramp for sequential fills (heatmap, choropleth). */
const LEVEL_BG = [
  "bg-muted-foreground/8",
  "bg-muted-foreground/16",
  "bg-muted-foreground/28",
  "bg-muted-foreground/44",
  "bg-muted-foreground/64",
] as const;
const LEVEL_OPACITY = [0.08, 0.16, 0.28, 0.44, 0.64] as const;

function level(row: number, col: number) {
  return (row * 7 + col * 13 + ((row * col) % 5)) % 5;
}

// ---------------------------------------------------------------------------
// Cartesian
// ---------------------------------------------------------------------------

const AREA_LINE =
  "M0 40C12 38 20 26 32 27S52 38 64 31S88 12 100 15S114 22 120 18";

function AreaIllustration() {
  return (
    <ThumbCard>
      <ThumbPanel className="flex flex-col gap-4">
        <ThumbHeader />
        <ThumbSvg viewBox="0 0 120 56">
          <defs>
            <FadeGradient id="bk-ill-area-fill" />
          </defs>
          <path d={`${AREA_LINE}L120 56L0 56Z`} fill="url(#bk-ill-area-fill)" />
          <path
            d={AREA_LINE}
            stroke="currentColor"
            strokeLinecap="round"
            strokeOpacity={0.72}
            strokeWidth={1.5}
          />
        </ThumbSvg>
      </ThumbPanel>
    </ThumbCard>
  );
}

const LINE_A = "M0 44C14 40 22 30 34 32S54 22 66 24S92 10 120 8";
const LINE_B = "M0 30C16 34 26 42 40 38S62 30 76 36S102 40 120 32";

function LineIllustration() {
  return (
    <ThumbCard>
      <ThumbPanel className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Dot accent />
          <Text className="w-8" />
          <Dot className="ms-1 bg-muted-foreground/24" />
          <Text className="w-6" variant="secondary" />
        </div>
        <ThumbSvg viewBox="0 0 120 56">
          <line
            stroke="currentColor"
            strokeDasharray="2 2"
            strokeOpacity={0.32}
            x1="66"
            x2="66"
            y1="0"
            y2="56"
          />
          <path
            d={LINE_B}
            stroke="currentColor"
            strokeLinecap="round"
            strokeOpacity={0.28}
            strokeWidth={1.5}
          />
          <path
            className="text-primary"
            d={LINE_A}
            stroke="currentColor"
            strokeLinecap="round"
            strokeOpacity={0.88}
            strokeWidth={1.5}
          />
          <circle
            className="fill-card text-primary"
            cx="66"
            cy="24"
            r="2.5"
            stroke="currentColor"
            strokeWidth={1.5}
          />
          <circle
            className="fill-card"
            cx="66"
            cy="32.6"
            r="2"
            stroke="currentColor"
            strokeOpacity={0.4}
            strokeWidth={1.25}
          />
        </ThumbSvg>
      </ThumbPanel>
    </ThumbCard>
  );
}

const BAR_HEIGHTS = [42, 64, 50, 86, 58, 74, 36] as const;

function BarIllustration() {
  return (
    <ThumbCard>
      <ThumbPanel className="flex flex-col gap-4">
        <ThumbHeader />
        <div className="flex h-16 items-end gap-1.5 border-muted-foreground/16 border-b">
          {BAR_HEIGHTS.map((h, i) => (
            <div
              className={cn(
                "flex-1 rounded-t-[3px]",
                i === 3 ? ACCENT_BG : "bg-muted-foreground/24"
              )}
              key={`bar-${h}`}
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </ThumbPanel>
    </ThumbCard>
  );
}

/** [open, close, high, low] in SVG y units (smaller = higher). */
const CANDLES = [
  [42, 34, 30, 48],
  [34, 38, 28, 42],
  [38, 26, 22, 40],
  [26, 30, 20, 34],
  [30, 16, 10, 32],
  [16, 22, 12, 28],
  [22, 10, 4, 24],
  [10, 18, 6, 22],
] as const;

function CandlestickIllustration() {
  return (
    <ThumbCard>
      <ThumbPanel className="flex flex-col gap-4">
        <ThumbHeader />
        <ThumbSvg viewBox="0 0 120 50">
          {CANDLES.map(([open, close, high, low], i) => {
            const x = 8 + i * 14.5;
            const up = close < open;
            const top = Math.min(open, close);
            const height = Math.abs(open - close);
            return (
              <g key={`candle-${x}`}>
                <line
                  stroke="currentColor"
                  strokeOpacity={0.4}
                  x1={x}
                  x2={x}
                  y1={high}
                  y2={low}
                />
                <rect
                  fill="currentColor"
                  fillOpacity={up ? 0.56 : 0.12}
                  height={height}
                  rx="1.5"
                  stroke="currentColor"
                  strokeOpacity={up ? 0 : 0.4}
                  width="8"
                  x={x - 4}
                  y={top}
                />
              </g>
            );
          })}
        </ThumbSvg>
      </ThumbPanel>
    </ThumbCard>
  );
}

const COMPOSED_BARS = [18, 26, 20, 32, 24, 36, 30] as const;
const COMPOSED_LINE = "M8 30C20 26 28 20 40 22S60 14 72 16S96 6 112 8";

function ComposedIllustration() {
  return (
    <ThumbCard>
      <ThumbPanel className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <div className="size-2 rounded-[2px] bg-muted-foreground/24" />
          <Text className="w-7" variant="secondary" />
          <Dot accent className="ms-1" />
          <Text className="w-7" />
        </div>
        <ThumbSvg viewBox="0 0 120 50">
          <defs>
            <FadeGradient from={0.16} id="bk-ill-composed-fill" />
          </defs>
          {COMPOSED_BARS.map((h, i) => (
            <rect
              fill="currentColor"
              fillOpacity={0.22}
              height={h}
              key={`cbar-${h}`}
              rx="2"
              width="10"
              x={3 + i * 17}
              y={50 - h}
            />
          ))}
          <path
            d={`${COMPOSED_LINE}L112 50L8 50Z`}
            fill="url(#bk-ill-composed-fill)"
          />
          <path
            className="text-primary"
            d={COMPOSED_LINE}
            stroke="currentColor"
            strokeLinecap="round"
            strokeOpacity={0.88}
            strokeWidth={1.5}
          />
        </ThumbSvg>
      </ThumbPanel>
    </ThumbCard>
  );
}

const PL_LINE =
  "M0 22C10 14 18 12 28 18S40 38 52 40S66 34 72 26S86 6 98 10S112 24 120 30";

function ProfitLossIllustration() {
  return (
    <ThumbCard>
      <ThumbPanel className="flex flex-col gap-4">
        <ThumbHeader />
        <ThumbSvg viewBox="0 0 120 50">
          <defs>
            <clipPath id="bk-ill-pl-above">
              <rect height="28" width="120" x="0" y="-4" />
            </clipPath>
            <clipPath id="bk-ill-pl-below">
              <rect height="30" width="120" x="0" y="24" />
            </clipPath>
          </defs>
          <line
            stroke="currentColor"
            strokeDasharray="2 2"
            strokeOpacity={0.32}
            x1="0"
            x2="120"
            y1="24"
            y2="24"
          />
          <path
            className="text-primary"
            clipPath="url(#bk-ill-pl-above)"
            d={PL_LINE}
            stroke="currentColor"
            strokeLinecap="round"
            strokeOpacity={0.88}
            strokeWidth={1.75}
          />
          <path
            clipPath="url(#bk-ill-pl-below)"
            d={PL_LINE}
            stroke="currentColor"
            strokeLinecap="round"
            strokeOpacity={0.36}
            strokeWidth={1.75}
          />
        </ThumbSvg>
      </ThumbPanel>
    </ThumbCard>
  );
}

const LIVE_LINE =
  "M0 34C8 30 14 36 22 32S34 22 42 26S54 36 62 30S76 14 84 18S96 22 100 16";

function LiveLineIllustration() {
  return (
    <ThumbCard>
      <ThumbPanel className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-2">
          <Text className="w-[36%]" />
          <div className="flex items-center gap-1 rounded-full bg-muted-foreground/8 px-1.5 py-1">
            <div className="size-1.5 rounded-full bg-primary motion-safe:animate-pulse" />
            <Text className="w-4" variant="secondary" />
          </div>
        </div>
        <ThumbSvg viewBox="0 0 120 50">
          <defs>
            <linearGradient id="bk-ill-live-fade" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0" stopColor="white" stopOpacity={0} />
              <stop offset="0.35" stopColor="white" stopOpacity={1} />
            </linearGradient>
            <mask id="bk-ill-live-mask">
              <rect fill="url(#bk-ill-live-fade)" height="50" width="120" />
            </mask>
          </defs>
          <g mask="url(#bk-ill-live-mask)">
            <path
              className="text-primary"
              d={LIVE_LINE}
              stroke="currentColor"
              strokeLinecap="round"
              strokeOpacity={0.88}
              strokeWidth={1.5}
            />
          </g>
          <line
            stroke="currentColor"
            strokeDasharray="2 2"
            strokeOpacity={0.24}
            x1="0"
            x2="120"
            y1="16"
            y2="16"
          />
          <circle
            className="text-primary"
            cx="100"
            cy="16"
            fill="currentColor"
            fillOpacity={0.16}
            r="6"
          />
          <circle
            className="text-primary"
            cx="100"
            cy="16"
            fill="currentColor"
            r="2.5"
          />
        </ThumbSvg>
      </ThumbPanel>
    </ThumbCard>
  );
}

/** Deterministic scatter: [x, y, r, opacity]. */
const SCATTER = [
  [10, 40, 2.5, 0.3],
  [20, 30, 3.5, 0.44],
  [28, 42, 2, 0.24],
  [36, 24, 3, 0.36],
  [46, 34, 4, 0.28],
  [54, 18, 2.5, 0.44],
  [62, 28, 3, 0.24],
  [74, 14, 3.5, 0.36],
  [84, 26, 2, 0.3],
  [92, 10, 3, 0.44],
  [102, 20, 2.5, 0.28],
  [110, 8, 3.5, 0.36],
] as const;

function ScatterIllustration() {
  return (
    <ThumbCard>
      <ThumbPanel className="flex flex-col gap-4">
        <ThumbHeader />
        <ThumbSvg viewBox="0 0 120 50">
          <path d="M0 0V50H120" stroke="currentColor" strokeOpacity={0.16} />
          {SCATTER.map(([x, y, r, o]) => (
            <circle
              cx={x}
              cy={y}
              fill="currentColor"
              fillOpacity={o}
              key={`dot-${x}`}
              r={r}
            />
          ))}
          <circle
            className="text-primary"
            cx="74"
            cy="14"
            r="7"
            stroke="currentColor"
            strokeOpacity={0.4}
          />
          <circle
            className="text-primary"
            cx="74"
            cy="14"
            fill="currentColor"
            r="3.5"
          />
        </ThumbSvg>
      </ThumbPanel>
    </ThumbCard>
  );
}

// ---------------------------------------------------------------------------
// Radial
// ---------------------------------------------------------------------------

const PIE_SLICES = [
  { start: 0, end: 130, opacity: 0.56 },
  { start: 130, end: 215, opacity: 0.32 },
  { start: 215, end: 290, opacity: 0.2 },
  { start: 290, end: 360, opacity: 0.12 },
] as const;

function PieIllustration() {
  return (
    <ThumbCard>
      <ThumbPanel className="flex items-center gap-3">
        <ThumbSvg className="w-1/2 max-w-20 shrink-0" viewBox="0 0 64 64">
          {PIE_SLICES.map((s) => {
            const mid = (s.start + s.end) / 2;
            const offset = s.start === 0 ? polar(0, 0, 3, mid) : { x: 0, y: 0 };
            return (
              <path
                className={s.start === 0 ? "text-primary" : undefined}
                d={arcPath(32, 32, 28, 0, s.start, s.end)}
                fill="currentColor"
                fillOpacity={s.start === 0 ? 0.88 : s.opacity}
                key={`slice-${s.start}`}
                stroke="var(--card)"
                strokeWidth={1.5}
                transform={`translate(${offset.x} ${offset.y})`}
              />
            );
          })}
        </ThumbSvg>
        <div className="flex min-w-0 flex-1 flex-col gap-2.5">
          {PIE_SLICES.map((s, i) => (
            <div
              className="flex items-center gap-1.5"
              key={`legend-${s.start}`}
            >
              <Dot accent={i === 0} className="size-1.5" />
              <Text
                className="flex-1"
                variant={i === 0 ? "main" : "secondary"}
              />
            </div>
          ))}
        </div>
      </ThumbPanel>
    </ThumbCard>
  );
}

const RING_TRACKS = [
  { r: 26, end: 290 },
  { r: 19, end: 210 },
  { r: 12, end: 140 },
] as const;

function RingIllustration() {
  return (
    <ThumbCard className="max-w-40">
      <ThumbPanel className="flex items-center justify-center">
        <div className="relative w-full max-w-28">
          <ThumbSvg viewBox="0 0 64 64">
            {RING_TRACKS.map((t, i) => (
              <g key={`ring-${t.r}`}>
                <circle
                  cx="32"
                  cy="32"
                  r={t.r}
                  stroke="currentColor"
                  strokeOpacity={0.12}
                  strokeWidth={5}
                />
                <path
                  className={i === 0 ? "text-primary" : undefined}
                  d={strokeArc(32, 32, t.r, 0, t.end)}
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeOpacity={i === 0 ? 0.88 : 0.56 - i * 0.16}
                  strokeWidth={5}
                />
              </g>
            ))}
          </ThumbSvg>
        </div>
      </ThumbPanel>
    </ThumbCard>
  );
}

const GAUGE_NOTCHES = Array.from({ length: 25 }, (_, i) => -135 + i * 11.25);

function GaugeIllustration() {
  return (
    <ThumbCard className="max-w-40">
      <ThumbPanel className="flex flex-col items-center">
        <div className="relative w-full max-w-28">
          <ThumbSvg viewBox="0 0 80 66">
            {GAUGE_NOTCHES.map((deg, i) => {
              const a = polar(40, 40, 26, deg);
              const b = polar(40, 40, 36, deg);
              const active = i < 18;
              return (
                <line
                  className={active ? "text-primary" : undefined}
                  key={`notch-${deg}`}
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeOpacity={active ? 0.32 + (i / 18) * 0.56 : 0.14}
                  strokeWidth={2.5}
                  x1={a.x}
                  x2={b.x}
                  y1={a.y}
                  y2={b.y}
                />
              );
            })}
          </ThumbSvg>
          <div className="absolute inset-x-0 top-[48%] flex flex-col items-center gap-1.5">
            <Text className="h-2.5 w-[34%] bg-muted-foreground/56" />
            <Text className="w-[24%]" variant="secondary" />
          </div>
        </div>
      </ThumbPanel>
    </ThumbCard>
  );
}

const RADAR_AXES = [0, 60, 120, 180, 240, 300] as const;
const RADAR_VALUES = [0.9, 0.72, 0.5, 0.82, 0.58, 0.78] as const;

function radarPolygon(scales: readonly number[]) {
  return RADAR_AXES.map((deg, i) => {
    const p = polar(36, 34, 28 * (scales[i] ?? 1), deg);
    return `${p.x},${p.y}`;
  }).join(" ");
}

const RADAR_SECONDARY = RADAR_VALUES.map((v) => 1.1 - v * 0.6);

function RadarIllustration() {
  return (
    <ThumbCard className="max-w-40">
      <ThumbPanel className="flex items-center justify-center">
        <ThumbSvg className="max-w-28" viewBox="0 0 72 68">
          {[1, 0.66, 0.33].map((s) => (
            <polygon
              key={`grid-${s}`}
              points={radarPolygon(RADAR_AXES.map(() => s))}
              stroke="currentColor"
              strokeOpacity={0.16}
            />
          ))}
          {RADAR_AXES.map((deg) => {
            const p = polar(36, 34, 28, deg);
            return (
              <line
                key={`axis-${deg}`}
                stroke="currentColor"
                strokeOpacity={0.12}
                x1="36"
                x2={p.x}
                y1="34"
                y2={p.y}
              />
            );
          })}
          <polygon
            fill="currentColor"
            fillOpacity={0.12}
            points={radarPolygon(RADAR_SECONDARY)}
            stroke="currentColor"
            strokeOpacity={0.36}
          />
          <polygon
            className="text-primary"
            fill="currentColor"
            fillOpacity={0.2}
            points={radarPolygon(RADAR_VALUES)}
            stroke="currentColor"
            strokeLinejoin="round"
            strokeOpacity={0.88}
            strokeWidth={1.5}
          />
        </ThumbSvg>
      </ThumbPanel>
    </ThumbCard>
  );
}

const SUNBURST_INNER = [
  { start: 0, end: 150, opacity: 0.56 },
  { start: 150, end: 255, opacity: 0.32 },
  { start: 255, end: 360, opacity: 0.2 },
] as const;
const SUNBURST_OUTER = [
  { start: 0, end: 70, opacity: 0.44 },
  { start: 70, end: 115, opacity: 0.36 },
  { start: 115, end: 150, opacity: 0.28 },
  { start: 150, end: 210, opacity: 0.24 },
  { start: 210, end: 255, opacity: 0.18 },
  { start: 255, end: 320, opacity: 0.14 },
  { start: 320, end: 360, opacity: 0.1 },
] as const;

function SunburstIllustration() {
  return (
    <ThumbCard className="max-w-40">
      <ThumbPanel className="flex flex-col items-center gap-3">
        <div className="flex w-full items-center gap-1">
          <Text className="w-6" variant="secondary" />
          <div className="size-1 rounded-full bg-muted-foreground/32" />
          <Text className="w-8" />
        </div>
        <ThumbSvg className="max-w-24" viewBox="0 0 64 64">
          {SUNBURST_INNER.map((s, i) => (
            <path
              className={i === 0 ? "text-primary" : undefined}
              d={arcPath(32, 32, 19, 9, s.start, s.end)}
              fill="currentColor"
              fillOpacity={i === 0 ? 0.88 : s.opacity}
              key={`in-${s.start}`}
              stroke="var(--card)"
              strokeWidth={1.25}
            />
          ))}
          {SUNBURST_OUTER.map((s) => (
            <path
              d={arcPath(32, 32, 30, 20, s.start, s.end)}
              fill="currentColor"
              fillOpacity={s.opacity}
              key={`out-${s.start}`}
              stroke="var(--card)"
              strokeWidth={1.25}
            />
          ))}
        </ThumbSvg>
      </ThumbPanel>
    </ThumbCard>
  );
}

// ---------------------------------------------------------------------------
// Flow / grid / geo
// ---------------------------------------------------------------------------

const FUNNEL_HEIGHTS = [44, 32, 22, 15, 10] as const;

function funnelPath(pad: number) {
  const cy = 26;
  const w = 120 / (FUNNEL_HEIGHTS.length - 1);
  const pts = FUNNEL_HEIGHTS.map((h, i) => ({
    x: i * w,
    top: cy - h / 2 - pad,
    bottom: cy + h / 2 + pad,
  }));
  const top = pts.slice(1).map((p, i) => {
    const prev = pts[i] ?? p;
    const mx = (prev.x + p.x) / 2;
    return `C${mx} ${prev.top} ${mx} ${p.top} ${p.x} ${p.top}`;
  });
  const reversed = [...pts].reverse();
  const bottom = reversed.slice(1).map((p, i) => {
    const prev = reversed[i] ?? p;
    const mx = (prev.x + p.x) / 2;
    return `C${mx} ${prev.bottom} ${mx} ${p.bottom} ${p.x} ${p.bottom}`;
  });
  const first = pts[0];
  const last = reversed[0];
  return `M0 ${first?.top}${top.join("")}L120 ${last?.bottom}${bottom.join("")}Z`;
}

function FunnelIllustration() {
  return (
    <ThumbCard>
      <ThumbPanel className="flex flex-col gap-4">
        <div className="flex justify-between gap-2">
          {["a", "b", "c", "d"].map((k, i) => (
            <div className="flex flex-1 flex-col gap-1" key={k}>
              <Text
                className="w-[70%]"
                variant={i === 0 ? "main" : "secondary"}
              />
            </div>
          ))}
        </div>
        <ThumbSvg viewBox="0 0 120 52">
          <path d={funnelPath(6)} fill="currentColor" fillOpacity={0.05} />
          <path d={funnelPath(3)} fill="currentColor" fillOpacity={0.08} />
          <path d={funnelPath(0)} fill="currentColor" fillOpacity={0.3} />
          {[30, 60, 90].map((x) => (
            <line
              key={`div-${x}`}
              stroke="var(--card)"
              strokeOpacity={0.8}
              x1={x}
              x2={x}
              y1="0"
              y2="52"
            />
          ))}
        </ThumbSvg>
      </ThumbPanel>
    </ThumbCard>
  );
}

/** [y0, y1] of source and target nodes for each link. */
const SANKEY_LINKS = [
  { from: [2, 12], to: [2, 12], opacity: 0.16 },
  { from: [12, 22], to: [22, 32], opacity: 0.88 },
  { from: [26, 34], to: [12, 20], opacity: 0.2 },
  { from: [34, 40], to: [42, 48], opacity: 0.12 },
  { from: [44, 50], to: [32, 38], opacity: 0.14 },
] as const;

const SANKEY_NODES = [
  [0, 2, 20],
  [0, 26, 14],
  [0, 44, 6],
  [116, 2, 18],
  [116, 22, 16],
  [116, 42, 6],
] as const;

function sankeyBand(from: readonly number[], to: readonly number[]) {
  const [a0, a1] = from;
  const [b0, b1] = to;
  return `M4 ${a0}C60 ${a0} 60 ${b0} 116 ${b0}L116 ${b1}C60 ${b1} 60 ${a1} 4 ${a1}Z`;
}

function SankeyIllustration() {
  return (
    <ThumbCard>
      <ThumbPanel className="flex flex-col gap-4">
        <ThumbHeader />
        <ThumbSvg viewBox="0 0 120 52">
          {SANKEY_LINKS.map((l, i) => (
            <path
              className={i === 1 ? "text-primary" : undefined}
              d={sankeyBand(l.from, l.to)}
              fill="currentColor"
              fillOpacity={i === 1 ? 0.28 : l.opacity}
              key={`link-${l.from[0]}`}
            />
          ))}
          {SANKEY_NODES.map(([x, y, h]) => (
            <rect
              fill="currentColor"
              fillOpacity={0.48}
              height={h}
              key={`node-${x}-${y}`}
              rx="1.5"
              width="4"
              x={x}
              y={y}
            />
          ))}
        </ThumbSvg>
      </ThumbPanel>
    </ThumbCard>
  );
}

const HEAT_ROWS = 7;
const HEAT_COLS = 15;

function HeatmapIllustration() {
  return (
    <ThumbCard>
      <ThumbPanel className="flex flex-col gap-3">
        <div className="grid grid-cols-15 gap-0.5">
          {Array.from({ length: HEAT_ROWS * HEAT_COLS }, (_, n) => {
            const row = Math.floor(n / HEAT_COLS);
            const col = n % HEAT_COLS;
            const accent = row === 3 && col === 10;
            return (
              <div
                className={cn(
                  "aspect-square rounded-[2px]",
                  accent ? ACCENT_BG : LEVEL_BG[level(row, col)]
                )}
                key={`cell-${row}-${col}`}
              />
            );
          })}
        </div>
        <div className="flex items-center justify-end gap-0.5">
          <Text className="me-1 w-4" variant="secondary" />
          {LEVEL_BG.map((bg) => (
            <div className={cn("size-1.5 rounded-[1px]", bg)} key={bg} />
          ))}
          <Text className="ms-1 w-4" variant="secondary" />
        </div>
      </ThumbPanel>
    </ThumbCard>
  );
}

/** Tile cartogram — reads as a map without depending on real geometry. */
const MAP_ROWS = [
  "..XXXX....X.",
  ".XXXXXXX.XX.",
  "XXXXXXXXXXX.",
  "XXXXXXXXXXXX",
  ".XXXXXXXXXX.",
  "..XXXXXXXX..",
  "....XX...X..",
] as const;

const MAP_TILES = MAP_ROWS.flatMap((row, r) =>
  [...row].flatMap((cell, c) =>
    cell === "X" ? [{ key: `tile-${r}-${c}`, r, c }] : []
  )
);

function ChoroplethIllustration() {
  return (
    <ThumbCard>
      <ThumbPanel className="flex flex-col gap-3">
        <ThumbSvg viewBox="0 0 120 70">
          {MAP_TILES.map((t) => {
            const accent = t.r === 3 && t.c === 7;
            return (
              <rect
                className={accent ? "text-primary" : undefined}
                fill="currentColor"
                fillOpacity={accent ? 0.88 : LEVEL_OPACITY[level(t.r, t.c)]}
                height="9"
                key={t.key}
                rx="1.5"
                width="9"
                x={t.c * 10}
                y={t.r * 10}
              />
            );
          })}
        </ThumbSvg>
        <div className="flex items-center gap-2">
          <Text className="w-4" variant="secondary" />
          <div className="h-1.5 flex-1 rounded-full bg-linear-to-r from-muted-foreground/8 to-muted-foreground/64" />
          <Text className="w-4" variant="secondary" />
        </div>
      </ThumbPanel>
    </ThumbCard>
  );
}

// ---------------------------------------------------------------------------
// Sparkline
// ---------------------------------------------------------------------------

const SPARK_LINE = "M0 11L6 9L12 10L18 6L24 8L30 4L36 6L42 3L48 2";
const SPARK_AREA = "M0 4L6 6L12 5L18 8L24 7L30 10L36 9L42 11L48 10";
const SPARK_BARS = [6, 9, 5, 11, 8, 12, 7, 10, 13] as const;

function SparklineIllustration() {
  return (
    <ThumbCard>
      <ThumbPanel className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Text className="w-5" />
          <ThumbSvg className="flex-1" viewBox="0 0 48 14">
            <path
              className="text-primary"
              d={SPARK_LINE}
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeOpacity={0.88}
              strokeWidth={1.25}
            />
            <circle
              className="fill-card text-primary"
              cx="48"
              cy="2"
              r="1.75"
              stroke="currentColor"
              strokeWidth={1.25}
            />
          </ThumbSvg>
          <Text className="w-4" variant="secondary" />
        </div>
        <div className="flex items-center gap-2">
          <Text className="w-5" />
          <ThumbSvg className="flex-1" viewBox="0 0 48 14">
            <defs>
              <FadeGradient id="bk-ill-sparkline-fill" />
            </defs>
            <path
              d={`${SPARK_AREA}L48 14L0 14Z`}
              fill="url(#bk-ill-sparkline-fill)"
            />
            <path
              d={SPARK_AREA}
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeOpacity={0.48}
              strokeWidth={1.25}
            />
          </ThumbSvg>
          <Text className="w-4" variant="secondary" />
        </div>
        <div className="flex items-center gap-2">
          <Text className="w-5" />
          <ThumbSvg className="flex-1" viewBox="0 0 48 14">
            {SPARK_BARS.map((h, i) => (
              <rect
                fill="currentColor"
                fillOpacity={0.32}
                height={h}
                key={`spark-bar-${i}-${h}`}
                rx="0.75"
                width="3.5"
                x={i * 5.5 + 0.25}
                y={14 - h}
              />
            ))}
          </ThumbSvg>
          <Text className="w-4" variant="secondary" />
        </div>
      </ThumbPanel>
    </ThumbCard>
  );
}

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

export const chartIllustrations: Record<string, () => ReactNode> = {
  "area-chart": AreaIllustration,
  "bar-chart": BarIllustration,
  "candlestick-chart": CandlestickIllustration,
  "choropleth-chart": ChoroplethIllustration,
  "composed-chart": ComposedIllustration,
  "funnel-chart": FunnelIllustration,
  "gauge-chart": GaugeIllustration,
  "heatmap-chart": HeatmapIllustration,
  "line-chart": LineIllustration,
  "live-line-chart": LiveLineIllustration,
  "pie-chart": PieIllustration,
  "profit-loss-line": ProfitLossIllustration,
  "radar-chart": RadarIllustration,
  "ring-chart": RingIllustration,
  "sankey-chart": SankeyIllustration,
  "scatter-chart": ScatterIllustration,
  sparkline: SparklineIllustration,
  "sunburst-chart": SunburstIllustration,
};

/**
 * Illustration for a chart or utility slug (e.g. `area-chart`, `tooltip`,
 * `x-axis`). Returns `undefined` when none exists.
 */
export function getChartIllustration(slug: string): ReactNode | undefined {
  const Illustration = chartIllustrations[slug] ?? utilityIllustrations[slug];
  return Illustration ? <Illustration /> : undefined;
}
